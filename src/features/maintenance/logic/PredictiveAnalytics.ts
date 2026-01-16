import { Decimal } from 'decimal.js';
import { addHours } from 'date-fns';
import { SYSTEM_CONSTANTS } from '../../../config/SystemConstants';
import { ASSET_THRESHOLDS } from '../../../config/AssetThresholds';
import { PredictionInput, MaintenancePrediction, UrgencyLevel } from '../types';

/**
 * PREDICIVE ANALYTICS ENGINE (PAE)
 * 
 * Standardized aging model based on Arrhenius-like fatigue acceleration.
 * Standards: ISO 10816 (Vibration), IEC 60041 (Hydraulics)
 */
export const calculateMaintenancePrediction = (input: PredictionInput): MaintenancePrediction => {
    const { config, telemetry } = input;

    // 1. THRESHOLD SOURCING
    const vUnsatisfactory = new Decimal(SYSTEM_CONSTANTS.THRESHOLDS.VIBRATION_ISO_10816.UNSATISFACTORY_MAX);
    const vCritical = vUnsatisfactory.mul(1.5);
    const cavThreshold = 0.35; // Standard Francis cavitation index baseline

    // 2. ACCELERATION FACTORS (AF)
    let degradation = new Decimal(1.0);
    let primaryStressor: MaintenancePrediction['primaryStressor'] = 'AGE';
    let maxAF = 1.0;

    // A. Vibration Acceleration (AF_vib)
    if (telemetry.currentVibrationMMs > 1.1) { // 1.1 is "Good" max
        const vib = new Decimal(telemetry.currentVibrationMMs);
        // Normalized vibration stress (0-1 range up to Critical)
        const vStress = vib.div(vCritical);

        // Acceleration = e^(2 * stress) - simple model for fatigue
        const vibAF = Decimal.exp(vStress.mul(0.8)).sub(1);
        degradation = degradation.plus(vibAF);

        if (vibAF.toNumber() > maxAF) {
            maxAF = vibAF.toNumber();
            primaryStressor = 'VIBRATION';
        }
    }

    // B. Cavitation Acceleration (AF_cav)
    if (telemetry.cavitationIndex > cavThreshold) {
        const cav = new Decimal(telemetry.cavitationIndex);
        const cavAF = cav.sub(cavThreshold).mul(3.5); // Very aggressive degradation
        degradation = degradation.plus(cavAF);

        if (cavAF.toNumber() > maxAF) {
            maxAF = cavAF.toNumber();
            primaryStressor = 'CAVITATION';
        }
    }

    // C. Cyclic Fatigue (Starts/Stops)
    if (telemetry.startsAndStops > SYSTEM_CONSTANTS.DURABILITY.LIMITS.START_STOP_HIGH_STRESS) {
        const cyclicAF = new Decimal(0.15); // Constant penalty for high-cycle units
        degradation = degradation.plus(cyclicAF);
    }

    // 3. REMAINING LIFE PROJECTION
    const designLife = new Decimal(config.designLifeHours);
    const consumedNative = new Decimal(telemetry.accumulatedRunHours);
    const remainingNative = Decimal.max(0, designLife.minus(consumedNative));

    // Project remaining time based on current operating stress
    const remainingAdjusted = remainingNative.div(degradation);
    const safeRemaining = remainingAdjusted.toNumber();

    // 4. URGENCY & STATUS
    let urgency: UrgencyLevel = 'OPTIMAL';
    const percentLife = remainingNative.div(designLife).mul(100).toNumber();

    if (safeRemaining < 720) { // < 1 month (720h)
        urgency = 'CRITICAL';
    } else if (safeRemaining < 2160) { // < 3 months
        urgency = 'PRIORITY';
    } else if (degradation.gt(1.8)) {
        urgency = 'PLANNING';
    }

    return {
        componentId: config.id,
        predictedFailureDate: addHours(new Date(), safeRemaining).toISOString(),
        remainingLifeHours: Math.round(safeRemaining),
        remainingLifePercent: Math.round(percentLife),
        degradationFactor: degradation.toDecimalPlaces(2).toNumber(),
        urgency,
        primaryStressor: primaryStressor === 'AGE' && degradation.gt(1.05) ? 'VIBRATION' : primaryStressor
    };
};
