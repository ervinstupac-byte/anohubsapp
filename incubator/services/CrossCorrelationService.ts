/**
 * CrossCorrelationService.ts
 * 
 * The "Synapse" of the CNS.
 * Computes statistical correlation between seemingly unrelated sensor streams
 * to detect systemic anomalies (Synergetic Anomalies).
 */

export class CrossCorrelationService {

    // Pearson Correlation Coefficient (r)
    // r = Σ((x - x̄)(y - ȳ)) / sqrt(Σ(x - x̄)² * Σ(y - ȳ)²)

    /**
     * Calculates correlation between two numeric arrays.
     * Arrays must be of equal length.
     */
    public static calculatePearson(x: number[], y: number[]): number {
        const n = x.length;
        if (y.length !== n || n === 0) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);

        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        const sumY2 = y.reduce((a, b) => a + b * b, 0);

        const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator === 0) return 0;
        return numerator / denominator;
    }

    /**
     * Checks if a "Synergetic Anomaly" exists.
     * e.g. Vibration increasing AND Temperature increasing together (r > 0.8)
     * implies a real mechanical stressor, not just sensor drift.
     */
    public static detectSynergy(
        streamA: number[],
        streamB: number[],
        threshold: number = 0.8
    ): { correlated: boolean, r: number } {
        const r = this.calculatePearson(streamA, streamB);
        return {
            correlated: Math.abs(r) > threshold,
            r: r
        };
    }
}
