export interface RULPrediction {
    daysRemaining: number;
    confidence: number; // 0-100%
    predictedFailureDate: string;
    degradationRate: number; // per day
    status: 'STABLE' | 'DEGRADING' | 'CRITICAL';
}

export class PrognosticsEngine {
    private static readonly CRITICAL_VIBRATION_THRESHOLD = 7.1; // mm/s (ISO 10816-5 Zone C)
    private static readonly BASELINE_DEGRADATION = 0.001; // mm/s per day normal wear

    /**
     * Estimates Remaining Useful Life (RUL) based on current vibration and trend.
     * Formula: T_failure = t + (V_critical - V_current) / (dV/dt)
     * @param currentVibration Current vibration level (mm/s)
     * @param historicalTrend Array of past vibration readings (optional)
     */
    static estimateRUL(currentVibration: number, historicalTrend: number[] = []): RULPrediction {
        // 1. Calculate Degradation Rate (dV/dt)
        // If no history, assume accelerated wear if above baseline, else nominal.
        let degradationRate = this.BASELINE_DEGRADATION;

        if (historicalTrend.length > 1) {
            const first = historicalTrend[0];
            const last = currentVibration;
            const days = historicalTrend.length; // assuming 1 reading per day for simplicity
            degradationRate = Math.max((last - first) / days, this.BASELINE_DEGRADATION);
        } else if (currentVibration > 3.5) {
            // Simulated accelerated wear curve if high vibration but no history
            degradationRate = 0.05 + ((currentVibration - 3.5) * 0.02);
        }

        // 2. Calculate Days Remaining
        // Time to reach Critical Threshold
        const vibrationHeadroom = Math.max(0, this.CRITICAL_VIBRATION_THRESHOLD - currentVibration);
        const daysRemaining = Math.floor(vibrationHeadroom / degradationRate);

        // 3. Determine Status
        let status: 'STABLE' | 'DEGRADING' | 'CRITICAL' = 'STABLE';
        if (daysRemaining < 30) status = 'CRITICAL';
        else if (daysRemaining < 180) status = 'DEGRADING';

        // 4. Calculate Failure Date
        const failureDate = new Date();
        failureDate.setDate(failureDate.getDate() + daysRemaining);

        return {
            daysRemaining,
            confidence: this.calculateConfidence(historicalTrend.length),
            predictedFailureDate: failureDate.toLocaleDateString(),
            degradationRate,
            status
        };
    }

    private static calculateConfidence(dataPoints: number): number {
        // Sigmoid confidence curve based on data points
        if (dataPoints === 0) return 65; // Baseline heuristic confidence
        return Math.min(99, 65 + (dataPoints * 2));
    }
}
