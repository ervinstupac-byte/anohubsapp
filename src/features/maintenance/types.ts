/**
 * STRICT TYPING FOR MAINTENANCE MODULE
 * Defines the inputs (Telemetry + Config) and outputs (Prediction) for the maintenance engine.
 */

export type UrgencyLevel = 'OPTIMAL' | 'PLANNING' | 'PRIORITY' | 'CRITICAL';

export interface ComponentConfig {
    id: string | number;
    name: string;
    designLifeHours: number; // e.g. 50,000
    installationDate: string; // ISO Date
    wearFactorCurve: 'LINEAR' | 'EXPONENTIAL';
}

export interface ComponentTelemetry {
    accumulatedRunHours: number;
    currentVibrationMMs: number; // Vibration affects bearings
    currentEfficiencyPercent: number; // Efficiency drop affects Runner
    startsAndStops: number; // Cyclic fatigue
    cavitationIndex: number; // 0-1
}

export interface PredictionInput {
    config: ComponentConfig;
    telemetry: ComponentTelemetry;
}

export interface MaintenancePrediction {
    componentId: string | number;
    predictedFailureDate: string; // ISO
    remainingLifeHours: number;
    remainingLifePercent: number; // 0-100
    degradationFactor: number; // 1.0 = normal, 2.0 = wearing twice as fast
    urgency: UrgencyLevel;
    primaryStressor: 'VIBRATION' | 'CAVITATION' | 'THERMAL' | 'AGE' | 'NONE';
}
