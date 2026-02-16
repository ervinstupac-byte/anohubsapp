/**
 * PATTERN EATER
 * The Adaptive Efficiency Brain 🍽️🧠
 * Compares observed efficiency against the 'Anchor' (Design) curve.
 * Learns the 'New Normal'.
 */

export interface EfficiencyMap {
    gatePercent: number;
    anchorEfficiency: number; // Design/Model
    observedEfficiency: number; // Learned
    status: 'MATCHING' | 'DRIFTING' | 'NEW_NORMAL';
}

export class PatternEater {
    private learnedPoints: Map<number, number> = new Map(); // Gate -> Eff

    /**
     * FEED OBSERVATION
     * Intakes real operational data points.
     */
    feedObservation(gate: number, efficiency: number) {
        // Round gate to nearest integer for bucketing
        const roundedGate = Math.round(gate);
        // Simple Exponential Moving Average (EMA) for learning
        const ALPHA = 0.2; // Learning rate
        const existing = this.learnedPoints.get(roundedGate) || efficiency;
        const newLearned = existing * (1 - ALPHA) + efficiency * ALPHA;

        this.learnedPoints.set(roundedGate, newLearned);
    }

    /**
     * GET INTELLIGENCE
     * Compares the learned map vs the anchor.
     */
    analyzePatterns(): EfficiencyMap[] {
        const results: EfficiencyMap[] = [];
        const gates = Array.from(this.learnedPoints.keys()).sort((a, b) => a - b);

        gates.forEach(gate => {
            const learned = this.learnedPoints.get(gate)!;
            const anchor = this.getAnchorEfficiency(gate);
            const diff = Math.abs(learned - anchor);

            let status: EfficiencyMap['status'] = 'MATCHING';
            if (diff > 5.0) status = 'NEW_NORMAL'; // Major meaningful shift
            else if (diff > 1.0) status = 'DRIFTING';

            results.push({
                gatePercent: gate,
                anchorEfficiency: anchor,
                observedEfficiency: learned,
                status
            });
        });

        return results;
    }

    // Simulated "Anchor" Curve (The v1.1 Baseline)
    private getAnchorEfficiency(gate: number): number {
        // Simple parabola around 85%
        const peak = 94.0;
        const k = 0.02;
        return peak - k * Math.pow(gate - 85, 2);
    }
}
