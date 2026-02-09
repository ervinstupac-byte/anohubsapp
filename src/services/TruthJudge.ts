/**
 * TRUTH JUDGE
 * The Sensor Conflict Resolver ⚖️🛑
 * Decides which sensor to trust when they disagree.
 * NOW CALIBRATED FOR PHYSICS LIMITS (Phase 24.0)
 */

export interface Verdict {
    winner: 'SENSOR_A' | 'SENSOR_B' | 'PREDICTION' | 'UNCERTAIN';
    confidence: number;
    reason: string;
    action: 'TRUST_A' | 'TRUST_B' | 'USE_FALLBACK' | 'MANUAL_CHECK';
}

export interface SensorHistory {
    lastValue: number;
    lastTimestamp: number;
    // Additional properties for telemetry store integration
    isReliable?: boolean;
    confidence?: number;
    verdict?: Verdict;
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
        
        if (health === 'GOOD') {
            return {
                winner: 'SENSOR_A',
                confidence: 1.0,
                reason: 'Sensor reading is reliable',
                action: 'TRUST_A'
            };
        } else if (health === 'BAD_SLEW') {
            return {
                winner: 'PREDICTION',
                confidence: 0.3,
                reason: `Slew rate violation detected: ${sensorId}`,
                action: 'USE_FALLBACK'
            };
        } else if (health === 'BAD_FROZEN') {
            return {
                winner: 'PREDICTION',
                confidence: 0.2,
                reason: `Sensor appears frozen: ${sensorId}`,
                action: 'USE_FALLBACK'
            };
        }

        return {
            winner: 'SENSOR_A',
            confidence: 1.0,
            reason: 'Sensor reading is reliable',
            action: 'TRUST_A'
        };
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
}
