/**
 * TRUTH JUDGE
 * The Sensor Conflict Resolver ⚖️🛑
 * Decides which sensor to trust when they disagree.
 * NOW CALIBRATED FOR PHYSICS LIMITS (Phase 24.0)
 * NC-1500: Integrated SensorIntegritySentinel for cross-sensor correlation
 */

import SensorIntegritySentinel, { SensorSnapshot, IntegrityResult } from './SensorIntegritySentinel';

export interface Verdict {
    winner: 'SENSOR_A' | 'SENSOR_B' | 'PREDICTION' | 'UNCERTAIN';
    confidence: number;
    reason: string;
    action: 'TRUST_A' | 'TRUST_B' | 'USE_FALLBACK' | 'MANUAL_CHECK';
    sensorDrift?: boolean; // NEW: Flag for Sentinel-detected drift
    sentinelResult?: IntegrityResult; // NEW: Full Sentinel analysis
}

export interface SensorHistory {
    lastValue: number;
    lastTimestamp: number;
    // Additional properties for telemetry store integration
    isReliable?: boolean;
    confidence?: number;
    verdict?: Verdict;
    // Hysteresis / backoff for repeated fallbacks
    lastFallbackTime?: number;
    fallbackCount?: number;
    suppressedCount?: number;
    lastVerdict?: Verdict;
}

export class TruthJudge {
    private history: Map<string, SensorHistory> = new Map();

    /**
     * EVALUATE SIGNAL HEALTH
     * Checks for Physics Violations (Slew Rate) and Frozen Values.
     */
    evaluateSignalHealth(sensorId: string, newValue: number, timestamp: number): 'GOOD' | 'BAD_SLEW' | 'BAD_FROZEN' {
        const lastState = this.history.get(sensorId);

        if (!lastState) {
            this.history.set(sensorId, { lastValue: newValue, lastTimestamp: timestamp });
            return 'GOOD';
        }

        const dt = (timestamp - lastState.lastTimestamp) / 1000; // seconds
        if (dt <= 0) return 'GOOD'; // Same tick

        // 1. Slew Rate Check: Temp shouldn't jump > 2°C/sec
        const dVal = Math.abs(newValue - lastState.lastValue);
        const rate = dVal / dt;
        const MAX_SLEW_RATE = 2.0;

        if (rate > MAX_SLEW_RATE) {
            return 'BAD_SLEW';
        }

        // 2. Frozen Check (Simplified: exact match implies broken ADC or disconnect)
        // In real world, we'd check longer duration.
        if (newValue === lastState.lastValue && dt > 3600) { // Frozen for an hour?
            return 'BAD_FROZEN';
        }

        // Update History
        this.history.set(sensorId, { lastValue: newValue, lastTimestamp: timestamp });
        return 'GOOD';
    }

    /**
     * VALIDATE SENSOR
     * Wrapper for sensor health evaluation
     */
    validateSensor(
        sensorId: string, 
        newValue: number, 
        lastValue: number, 
        lastTimestamp: number
    ): Verdict {
        const health = this.evaluateSignalHealth(sensorId, newValue, lastTimestamp);
        // Read / initialize history entry
        const entry = this.history.get(sensorId) || { lastValue, lastTimestamp } as SensorHistory;

        // Reset fallback counters on healthy reading
        if (health === 'GOOD') {
            entry.fallbackCount = 0;
            entry.suppressedCount = 0;
            entry.lastVerdict = {
                winner: 'SENSOR_A',
                confidence: 1.0,
                reason: 'Sensor reading is reliable',
                action: 'TRUST_A'
            };
            this.history.set(sensorId, { ...entry, lastValue: newValue, lastTimestamp });
            return entry.lastVerdict;
        }

        // For BAD_SLEW / BAD_FROZEN apply hysteresis/backoff so we don't repeatedly flip to fallback
        if (health === 'BAD_SLEW' || health === 'BAD_FROZEN') {
            const now = lastTimestamp;
            const baseCooldownMs = 5000; // 5s base cooldown
            const count = entry.fallbackCount ?? 0;
            const cooldown = baseCooldownMs * Math.min(1024, Math.pow(2, count));

            // If we've recently triggered a fallback, suppress repeated fallbacks within cooldown window
            if (entry.lastFallbackTime && (now - entry.lastFallbackTime) < cooldown) {
                entry.suppressedCount = (entry.suppressedCount ?? 0) + 1;
                const suppressedVerdict: Verdict = {
                    winner: 'SENSOR_A',
                    confidence: 0.6,
                    reason: `Hysteresis: suppressed repeated fallback (${entry.suppressedCount}) for ${sensorId}`,
                    action: 'TRUST_A'
                };
                entry.lastVerdict = suppressedVerdict;
                entry.lastValue = newValue;
                entry.lastTimestamp = lastTimestamp;
                this.history.set(sensorId, entry);
                return suppressedVerdict;
            }

            // Otherwise, record a fallback event and return a USE_FALLBACK verdict
            const fallbackVerdict: Verdict = {
                winner: 'PREDICTION',
                confidence: health === 'BAD_SLEW' ? 0.3 : 0.2,
                reason: health === 'BAD_SLEW' ? `Slew rate violation detected: ${sensorId}` : `Sensor appears frozen: ${sensorId}`,
                action: 'USE_FALLBACK'
            };
            entry.lastFallbackTime = now;
            entry.fallbackCount = (entry.fallbackCount ?? 0) + 1;
            entry.lastVerdict = fallbackVerdict;
            entry.lastValue = newValue;
            entry.lastTimestamp = lastTimestamp;
            this.history.set(sensorId, entry);
            return fallbackVerdict;
        }

        // Default safety return
        const defaultVerdict: Verdict = {
            winner: 'SENSOR_A',
            confidence: 1.0,
            reason: 'Sensor reading is reliable',
            action: 'TRUST_A'
        };
        this.history.set(sensorId, { ...entry, lastValue: newValue, lastTimestamp, lastVerdict: defaultVerdict });
        return defaultVerdict;
    }

    /**
     * RECONCILE TRUTH
     * Compares two sensors against a "Predicted Truth" (e.g. from PatternEater).
     */
    reconcileTruth(
        sensorA: { id: string; value: number; timestamp: number },
        sensorB: { id: string; value: number; timestamp: number },
        predictedValue: number
    ): Verdict {
        // Pre-Qualification: Check Physics
        const healthA = this.evaluateSignalHealth(sensorA.id, sensorA.value, sensorA.timestamp);
        const healthB = this.evaluateSignalHealth(sensorB.id, sensorB.value, sensorB.timestamp);

        // Fallback Logic
        if (healthA !== 'GOOD' && healthB !== 'GOOD') {
            return {
                winner: 'PREDICTION',
                confidence: 0.5,
                reason: `Both Sensors Failed QC (A: ${healthA}, B: ${healthB}). Falling back to Model Prediction.`,
                action: 'USE_FALLBACK'
            };
        }

        if (healthA !== 'GOOD') {
            return {
                winner: 'SENSOR_B',
                confidence: 0.8,
                reason: `Sensor A Failed QC (${healthA}). Trusting B.`,
                action: 'TRUST_B'
            };
        }

        if (healthB !== 'GOOD') {
            return {
                winner: 'SENSOR_A',
                confidence: 0.8,
                reason: `Sensor B Failed QC (${healthB}). Trusting A.`,
                action: 'TRUST_A'
            };
        }

        // Standard Comparison Logic (if both are physically healthy)
        const diffA = Math.abs(sensorA.value - predictedValue);
        const diffB = Math.abs(sensorB.value - predictedValue);
        const TOLERANCE = 5.0;

        // 0. DO THEY AGREE?
        if (Math.abs(sensorA.value - sensorB.value) < TOLERANCE) {
            return {
                winner: 'SENSOR_A', // Default to A
                confidence: 1.0,
                reason: 'Sensors Agree',
                action: 'TRUST_A'
            };
        }

        if (diffA > TOLERANCE && diffB > TOLERANCE) {
            return {
                winner: 'UNCERTAIN',
                confidence: 0.1,
                reason: 'Both sensors deviate significantly from Prediction.',
                action: 'MANUAL_CHECK'
            };
        }

        if (diffA < diffB / 2) {
            return {
                winner: 'SENSOR_A',
                confidence: 0.9,
                reason: `Sensor A matches Prediction (${predictedValue.toFixed(1)}). Sensor B is an outlier.`,
                action: 'TRUST_A'
            };
        }

        if (diffB < diffA / 2) {
            return {
                winner: 'SENSOR_B',
                confidence: 0.9,
                reason: `Sensor B matches Prediction (${predictedValue.toFixed(1)}). Sensor A is an outlier.`,
                action: 'TRUST_B'
            };
        }

        return {
            winner: 'UNCERTAIN',
            confidence: 0.5,
            reason: 'Sensors disagree, but neither is clearly the "Liar" based on prediction.',
            action: 'MANUAL_CHECK'
        };
    }

    /**
     * NC-1500: Cross-validate with SensorIntegritySentinel
     * Uses cross-sensor correlation to detect physical inconsistencies
     */
    validateWithSentinel(
        sensorId: string,
        snapshot: SensorSnapshot,
        recentHistory: SensorSnapshot[] = []
    ): Verdict {
        // Run Sentinel correlation check
        const sentinelResult = SensorIntegritySentinel.correlate(snapshot, recentHistory);

        // If Sentinel detects anomaly, mark as sensor drift
        if (sentinelResult.sensorAnomaly) {
            return {
                winner: 'UNCERTAIN',
                confidence: sentinelResult.confidence || 0.5,
                reason: `Sensor drift detected by Sentinel: ${sentinelResult.note} (Field: ${sentinelResult.anomalousField})`,
                action: 'MANUAL_CHECK',
                sensorDrift: true,
                sentinelResult
            };
        }

        // Otherwise return normal verdict
        return {
            winner: 'SENSOR_A',
            confidence: sentinelResult.confidence || 0.95,
            reason: sentinelResult.note || 'Cross-sensor correlation OK',
            action: 'TRUST_A',
            sensorDrift: false,
            sentinelResult
        };
    }
}
