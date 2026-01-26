/**
 * DISCOVERY VAULT
 * The Stranger Sensor Analyzer 🕵️‍♂️📈
 * Intakes unknown signals and finds correlations with Key Performance Indicators (KPIs).
 */

export interface StrangerSignal {
    id: string; // The stranger's name (e.g., "Sensor_X_99")
    values: number[]; // History buffer
    correlationScore: number; // -1 to 1 (Pearson)
    verdict: 'NOISE' | 'INTERESTING' | 'INFLUENCER';
}

export class DiscoveryVault {
    private strangers: Map<string, StrangerSignal> = new Map();
    private readonly HISTORY_SIZE = 50;

    /**
     * INGEST STRANGER
     * Feeds a value from an unknown sensor.
     */
    feedStranger(id: string, value: number) {
        if (!this.strangers.has(id)) {
            this.strangers.set(id, { id, values: [], correlationScore: 0, verdict: 'NOISE' });
        }
        const signal = this.strangers.get(id)!;
        signal.values.push(value);
        if (signal.values.length > this.HISTORY_SIZE) signal.values.shift();
    }

    /**
     * ANALYZE CORRELATIONS
     * Compares a stranger's history against a known KPI (e.g., Money Leak or Temperature).
     */
    analyze(kpiValues: number[]): StrangerSignal[] {
        const results: StrangerSignal[] = [];

        this.strangers.forEach(signal => {
            if (signal.values.length < 10 || kpiValues.length < 10) return;

            // Align lengths
            const len = Math.min(signal.values.length, kpiValues.length);
            const x = signal.values.slice(-len);
            const y = kpiValues.slice(-len);

            // Pearson Correlation Calculation
            const corr = this.calculatePearson(x, y);
            signal.correlationScore = corr;

            // Verdict Logic
            if (Math.abs(corr) > 0.8) {
                signal.verdict = 'INFLUENCER';
            } else if (Math.abs(corr) > 0.5) {
                signal.verdict = 'INTERESTING';
            } else {
                signal.verdict = 'NOISE';
            }
            results.push(signal);
        });

        return results;
    }

    private calculatePearson(x: number[], y: number[]): number {
        const n = x.length;
        if (n === 0) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }
}
