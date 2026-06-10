import { describe, it, expect } from 'vitest';
import { calculateMaintenancePrediction } from '../Predictor';
import { PredictionInput } from '../../types';

describe('MaintenancePredictor', () => {

    const baseConfig = {
        id: 'bearing-01',
        name: 'Thrust Bearing',
        designLifeHours: 50000,
        installationDate: '2023-01-01',
        wearFactorCurve: 'LINEAR' as const
    };

    // 1. HAPPY PATH
    it('predicts normal life when telemetry is optimal', () => {
        const input: PredictionInput = {
            config: baseConfig,
            telemetry: {
                accumulatedRunHours: 40000,
                currentVibrationMMs: 1.0, // < 2.0 Limit
                currentEfficiencyPercent: 90,
                startsAndStops: 10,
                cavitationIndex: 0.1 // Low
            }
        };

        const result = calculateMaintenancePrediction(input);

        expect(result.degradationFactor).toBe(1.0);
        expect(result.remainingLifeHours).toBe(10000); // 50k - 40k
        expect(result.primaryStressor).toBe('NONE');
        expect(result.urgency).toBe('OPTIMAL');
    });

    // 2. STRESS CASE: HIGH VIBRATION
    it('accelerates wear when vibration exceeds limit', () => {
        const input: PredictionInput = {
            config: baseConfig,
            telemetry: {
                accumulatedRunHours: 40000,
                currentVibrationMMs: 4.0, // Limit 2.0. Excess 2.0. Impact = 2.0 * 0.5 = 1.0. Factor = 2.0.
                currentEfficiencyPercent: 90,
                startsAndStops: 10,
                cavitationIndex: 0.1
            }
        };

        const result = calculateMaintenancePrediction(input);

        expect(result.degradationFactor).toBe(2.0);
        // Native remaining = 10,000. Adjusted = 10,000 / 2.0 = 5,000.
        expect(result.remainingLifeHours).toBe(5000);
        expect(result.primaryStressor).toBe('VIBRATION');
        expect(result.urgency).toBe('PLANNING'); // Factor > 1.5
    });

    // 3. EDGE CASE: EXPIRED COMPONENT
    it('returns 0 remaining life for expired components', () => {
        const input: PredictionInput = {
            config: baseConfig,
            telemetry: {
                accumulatedRunHours: 60000, // > 50k
                currentVibrationMMs: 1.0,
                currentEfficiencyPercent: 90,
                startsAndStops: 10,
                cavitationIndex: 0.1
            }
        };

        const result = calculateMaintenancePrediction(input);

        expect(result.remainingLifeHours).toBe(0);
        expect(result.urgency).toBe('CRITICAL');
    });
});
