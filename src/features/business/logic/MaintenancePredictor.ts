/**
 * Maintenance Predictor Logic
 * Calculates Estimated Remaining Life (ERL) independent of simple operational hours.
 * 
 * Formula: ERL = (Allowable Stress Threshold - Current Stress) / Average Wear Rate
 */

interface StressFactors {
    vibration: number; // mm/s
    temperature: number; // Celsius
    cavitation: number; // 0-100% index
    efficiencyDrop: number; // % drop from baseline
}

// Operational Thresholds based on ISO 10816-3 and Francis turbine physics
const THRESHOLDS = {
    VIBRATION_MAX: 7.1, // mm/s (Zone D - Danger)
    TEMP_MAX: 85.0, // Celsius (Babbitt melting risk)
    CAVITATION_LIMIT: 30.0, // Index limit
    EFFICIENCY_FLOOR: 88.0, // %
};

const BASELINE_WEAR_RATE = 0.002; // Arbitrary "wear units" per hour

export class MaintenancePredictor {

    /**
     * Calculates the composite stress index (0-100) where 100 is failure.
     */
    static calculateStressIndex(factors: StressFactors): number {
        const vibStress = (factors.vibration / THRESHOLDS.VIBRATION_MAX) * 100;
        const tempStress = (factors.temperature / THRESHOLDS.TEMP_MAX) * 100;
        const cavStress = factors.cavitation * 1.5; // Multiplier for cavitation aggression

        // Use the highest stressor as the dominant failure mode driver
        return Math.max(vibStress, tempStress, cavStress);
    }

    /**
     * Estimates remaining useful life in hours based on current stress levels.
     * @param stressIndex Current composite stress (0-100)
     * @param designLifeHours standard design life (e.g. 50,000 hours until major overhaul)
     */
    static estimateRemainingLife(stressIndex: number, designLifeHours: number = 50000): { hours: number; days: number; status: string } {
        // Wear Rate Multiplier: High stress accelerates wear exponentially
        // Basic physics model: rate = baseline * e^(k * stress)
        // Tuning k so that at 100% stress, life drops to near zero rapidly

        let wearMultiplier = 1;
        if (stressIndex < 50) {
            wearMultiplier = 0.8; // Gentle definition, extending life
        } else if (stressIndex < 80) {
            wearMultiplier = 1.2 + ((stressIndex - 50) / 30); // Linear increase
        } else {
            wearMultiplier = 2.0 + Math.pow((stressIndex - 80), 2) / 20; // Exponential degradation
        }

        const effectiveUsageRate = 1 * wearMultiplier;

        // This is a simplified "snapshot" prediction. 
        // In a real system, this would integrate over time.
        // Here we project: If system continues running AT THIS STRESS LEVEL...

        const remainingCapacity = Math.max(0, 100 - stressIndex); // Remaining "health %"
        const estimatedRemainingHours = (remainingCapacity / 100) * designLifeHours / effectiveUsageRate;

        let status = 'OPTIMAL';
        if (estimatedRemainingHours < 1000) status = 'CRITICAL';
        else if (estimatedRemainingHours < 5000) status = 'WARNING';

        return {
            hours: Math.round(estimatedRemainingHours),
            days: Math.round(estimatedRemainingHours / 24),
            status
        };
    }
}
