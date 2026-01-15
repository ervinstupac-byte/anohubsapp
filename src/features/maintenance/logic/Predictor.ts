import { PredictionInput, MaintenancePrediction } from '../types';
import Decimal from 'decimal.js';
import { addHours } from 'date-fns';

const VIBRATION_LIMIT = 2.0; // mm/s
const CAVITATION_THRESHOLD = 0.3;

/**
 * Pure Logic: Calculates component remaining life based on accelerated wear.
 */
export const calculateMaintenancePrediction = (input: PredictionInput): MaintenancePrediction => {
    const { config, telemetry } = input;

    // 1. Calculate Stress/Degradation Factor
    let degradation = new Decimal(1.0);
    let stressor: MaintenancePrediction['primaryStressor'] = 'AGE';
    let maxImpact = 0;

    // A. Vibration Impact (Linear above threshold)
    if (telemetry.currentVibrationMMs > VIBRATION_LIMIT) {
        const vibExcess = new Decimal(telemetry.currentVibrationMMs - VIBRATION_LIMIT);
        const vibImpact = vibExcess.mul(0.5); // 0.5x acceleration per mm/s over limit
        degradation = degradation.plus(vibImpact);

        if (vibImpact.toNumber() > maxImpact) {
            maxImpact = vibImpact.toNumber();
            stressor = 'VIBRATION';
        }
    }

    // B. Cavitation Impact
    if (telemetry.cavitationIndex > CAVITATION_THRESHOLD) {
        const cavExcess = new Decimal(telemetry.cavitationIndex - CAVITATION_THRESHOLD);
        const cavImpact = cavExcess.mul(2.0); // Cavitation is aggressive
        degradation = degradation.plus(cavImpact);

        if (cavImpact.toNumber() > maxImpact) {
            maxImpact = cavImpact.toNumber();
            stressor = 'CAVITATION';
        }
    }

    if (degradation.equals(1.0)) {
        stressor = 'NONE';
    }

    // 2. Project Life
    const designLife = new Decimal(config.designLifeHours);
    const consumedNative = new Decimal(telemetry.accumulatedRunHours);

    // Effective hours consumed "structurally"
    // Note: We don't multiply *past* hours by *current* degradation, strictly speaking, 
    // unless we assume current state is representative of history. 
    // For a Real-time predictor, we project the *remaining* hours using the current rate.
    // Remaining_Native = Design - Consumed
    // Remaining_Actual_Time = Remaining_Native / DegradationRate

    const remainingNative = designLife.minus(consumedNative);
    const remainingAdjusted = remainingNative.div(degradation);

    // 3. Determine Urgency
    const safeRemaining = Math.max(0, remainingAdjusted.toNumber());
    const lifePercent = designLife.gt(0)
        ? remainingNative.div(designLife).mul(100).toNumber()
        : 0;

    // Date Projection (Assuming 24/7 operation for now)
    const failureDate = addHours(new Date(), safeRemaining);

    let urgency: MaintenancePrediction['urgency'] = 'OPTIMAL';
    if (safeRemaining < 24 * 7) urgency = 'CRITICAL'; // < 1 week
    else if (safeRemaining < 24 * 30) urgency = 'PRIORITY'; // < 1 month
    else if (degradation.gt(1.5)) urgency = 'PLANNING'; // High wear rate

    return {
        componentId: config.id,
        predictedFailureDate: failureDate.toISOString(),
        remainingLifeHours: Number(safeRemaining.toFixed(1)),
        remainingLifePercent: Number(lifePercent.toFixed(1)),
        degradationFactor: Number(degradation.toNumber().toFixed(2)),
        urgency,
        primaryStressor: stressor
    };
};
