/**
 * Protocol NC-24: Neural Anomaly Detection
 * Standard: ISO 13381-1 Predictive Maintenance
 * 
 * Implements real-time anomaly detection by comparing telemetry
 * against Sweet Spot baselines from NC-23.
 */

export interface TelemetrySnapshot {
    timestamp: number;
    efficiency: number;      // η (0-100)
    powerMW: number;         // P
    vibrationMmS: number;    // Vibration
    bearingTempC: number;    // Bearing Temperature
    flowM3S: number;         // Q
    headM: number;           // H
}

export interface DetectedAnomaly {
    id: string;
    type: 'SILENT_LOSS' | 'CAVITATION' | 'THERMAL_RUNAWAY' | 'EFFICIENCY_DRIFT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probabilityScore: number;  // 0-100%
    description: string;
    detectedAt: number;
    telemetryWindowHash: string;  // SHA-256 of triggering window
    evidence: {
        baseline: Partial<TelemetrySnapshot>;
        current: Partial<TelemetrySnapshot>;
        delta: Record<string, number>;
    };
}

// Detection thresholds based on ISO 13381-1 and field experience
const THRESHOLDS = {
    SILENT_LOSS_ETA_DROP: 2.0,       // % drop triggers Silent Loss
    CAVITATION_ETA_DROP: 5.0,        // % drop with vibration increase
    CAVITATION_VIB_INCREASE: 1.5,    // mm/s increase threshold
    THERMAL_RUNAWAY_RATE: 10.0,      // °C/hr
    POWER_STABILITY_MARGIN: 0.5      // MW - "constant" power tolerance
};

/**
 * Generates a SHA-256 hash of a telemetry window for evidence linking.
 */
async function hashTelemetryWindow(snapshots: TelemetrySnapshot[]): Promise<string> {
    const payload = JSON.stringify(snapshots);
    const msgBuffer = new TextEncoder().encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class AnomalyDetector {
    private baselineEta: number = 92;  // Default Sweet Spot baseline
    private baselinePower: number = 10;
    private telemetryHistory: TelemetrySnapshot[] = [];
    private readonly HISTORY_WINDOW = 10;  // Keep last 10 snapshots

    /**
     * Updates the Sweet Spot baseline from NC-23 FleetOptimizer.
     */
    setBaseline(eta: number, powerMW: number): void {
        this.baselineEta = eta;
        this.baselinePower = powerMW;
    }

    /**
     * Ingests a new telemetry snapshot and runs anomaly detection.
     */
    async ingest(snapshot: TelemetrySnapshot): Promise<DetectedAnomaly | null> {
        this.telemetryHistory.push(snapshot);
        if (this.telemetryHistory.length > this.HISTORY_WINDOW) {
            this.telemetryHistory.shift();
        }

        // Run detection suite
        const silentLoss = await this.detectSilentLoss(snapshot);
        if (silentLoss) return silentLoss;

        const cavitation = await this.detectCavitation(snapshot);
        if (cavitation) return cavitation;

        const thermal = await this.detectThermalRunaway();
        if (thermal) return thermal;

        return null;
    }

    /**
     * Silent Loss Anomaly: η drops >2% while P remains constant.
     * Typical cause: Trash rack clogging reducing effective head.
     */
    private async detectSilentLoss(current: TelemetrySnapshot): Promise<DetectedAnomaly | null> {
        const etaDrop = this.baselineEta - current.efficiency;
        const powerDelta = Math.abs(current.powerMW - this.baselinePower);

        if (etaDrop > THRESHOLDS.SILENT_LOSS_ETA_DROP &&
            powerDelta < THRESHOLDS.POWER_STABILITY_MARGIN) {

            const hash = await hashTelemetryWindow(this.telemetryHistory);
            const probability = this.calculateProbability(etaDrop, THRESHOLDS.SILENT_LOSS_ETA_DROP, 10);

            return {
                id: `ANOMALY-${Date.now()}`,
                type: 'SILENT_LOSS',
                severity: probability > 80 ? 'HIGH' : probability > 50 ? 'MEDIUM' : 'LOW',
                probabilityScore: probability,
                description: `Efficiency dropped ${etaDrop.toFixed(1)}% while power remained stable. Possible trash rack obstruction.`,
                detectedAt: Date.now(),
                telemetryWindowHash: hash,
                evidence: {
                    baseline: { efficiency: this.baselineEta, powerMW: this.baselinePower },
                    current: { efficiency: current.efficiency, powerMW: current.powerMW },
                    delta: { efficiency: -etaDrop, powerMW: powerDelta }
                }
            };
        }
        return null;
    }

    /**
     * Cavitation Event: η drops >5% with increased vibration.
     */
    private async detectCavitation(current: TelemetrySnapshot): Promise<DetectedAnomaly | null> {
        if (this.telemetryHistory.length < 2) return null;

        const prev = this.telemetryHistory[this.telemetryHistory.length - 2];
        const etaDrop = prev.efficiency - current.efficiency;
        const vibIncrease = current.vibrationMmS - (prev?.vibrationMmS || 0);

        if (etaDrop > THRESHOLDS.CAVITATION_ETA_DROP &&
            vibIncrease > THRESHOLDS.CAVITATION_VIB_INCREASE) {

            const hash = await hashTelemetryWindow(this.telemetryHistory);
            const probability = this.calculateProbability(etaDrop, THRESHOLDS.CAVITATION_ETA_DROP, 15);

            return {
                id: `ANOMALY-${Date.now()}`,
                type: 'CAVITATION',
                severity: 'CRITICAL',
                probabilityScore: probability,
                description: `Cavitation detected: η↓${etaDrop.toFixed(1)}%, vibration↑${vibIncrease.toFixed(2)} mm/s`,
                detectedAt: Date.now(),
                telemetryWindowHash: hash,
                evidence: {
                    baseline: { efficiency: prev.efficiency, vibrationMmS: prev.vibrationMmS },
                    current: { efficiency: current.efficiency, vibrationMmS: current.vibrationMmS },
                    delta: { efficiency: -etaDrop, vibration: vibIncrease }
                }
            };
        }
        return null;
    }

    /**
     * Thermal Runaway: Bearing temperature rising >10°C/hr.
     */
    private async detectThermalRunaway(): Promise<DetectedAnomaly | null> {
        if (this.telemetryHistory.length < 2) return null;

        const oldest = this.telemetryHistory[0];
        const newest = this.telemetryHistory[this.telemetryHistory.length - 1];

        const timeDeltaHrs = (newest.timestamp - oldest.timestamp) / (1000 * 60 * 60);
        if (timeDeltaHrs < 0.01) return null; // Need meaningful time window

        const tempRise = newest.bearingTempC - oldest.bearingTempC;
        const ratePerHour = tempRise / timeDeltaHrs;

        if (ratePerHour > THRESHOLDS.THERMAL_RUNAWAY_RATE) {
            const hash = await hashTelemetryWindow(this.telemetryHistory);
            const probability = this.calculateProbability(ratePerHour, THRESHOLDS.THERMAL_RUNAWAY_RATE, 30);

            return {
                id: `ANOMALY-${Date.now()}`,
                type: 'THERMAL_RUNAWAY',
                severity: 'CRITICAL',
                probabilityScore: probability,
                description: `Bearing temperature rising at ${ratePerHour.toFixed(1)}°C/hr. Immediate inspection required.`,
                detectedAt: Date.now(),
                telemetryWindowHash: hash,
                evidence: {
                    baseline: { bearingTempC: oldest.bearingTempC },
                    current: { bearingTempC: newest.bearingTempC },
                    delta: { bearingTemp: tempRise, ratePerHour }
                }
            };
        }
        return null;
    }

    /**
     * Calculates probability score based on deviation magnitude.
     * Uses sigmoid-like scaling between threshold and max.
     */
    private calculateProbability(value: number, threshold: number, maxValue: number): number {
        if (value <= threshold) return 0;
        const normalized = (value - threshold) / (maxValue - threshold);
        const clamped = Math.min(Math.max(normalized, 0), 1);
        // Sigmoid-ish curve for smooth probability scaling
        return Math.round(50 + 50 * Math.tanh(clamped * 2));
    }

    /**
     * Returns the current anomaly detection state for UI binding.
     */
    getStatus(): { historyLength: number; baselineEta: number; baselinePower: number } {
        return {
            historyLength: this.telemetryHistory.length,
            baselineEta: this.baselineEta,
            baselinePower: this.baselinePower
        };
    }

    /**
     * Clears history (e.g., after maintenance or calibration).
     */
    reset(): void {
        this.telemetryHistory = [];
    }
}

// Singleton instance for global access
export const anomalyDetector = new AnomalyDetector();
