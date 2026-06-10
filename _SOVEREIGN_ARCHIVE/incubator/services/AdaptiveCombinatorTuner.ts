/**
 * AdaptiveCombinatorTuner.ts
 * 
 * Self-Learning Kaplan Cam Curve Optimizer
 * Tweaks the Y-Phi relationship based on real-time efficiency feedback.
 * Stores unit-specific cam curves that override manufacturer defaults.
 */

export interface CamPoint {
    head: number;
    guideVaneY: number;
    bladeAnglePhi: number;
    efficiency: number;
    timestamp: number;
}

export interface OptimizationResult {
    originalPhi: number;
    optimizedPhi: number;
    efficiencyGain: number; // %
    confidence: number; // 0-100%
}

export class AdaptiveCombinatorTuner {
    // Storage for unit-specific learned points
    // Key: UnitID -> Head (bucket) -> GuideVane (bucket) -> Best Phi
    private static learnedCams: Map<string, CamPoint[]> = new Map();

    /**
     * GET OPTIMIZED BLADE ANGLE
     * Returns the manufacturer default adjusted by learned history.
     */
    public static getOptimizedPhi(
        unitId: string,
        head: number,
        guideVaneY: number,
        defaultPhi: number
    ): OptimizationResult {
        const history = this.learnedCams.get(unitId) || [];

        // Find relevant historical points (KNN-like search)
        // We look for points with similar Head (+/- 1m) and similar Y (+/- 2%)
        const neighbors = history.filter(p =>
            Math.abs(p.head - head) < 1.0 &&
            Math.abs(p.guideVaneY - guideVaneY) < 2.0
        );

        if (neighbors.length < 5) {
            // Not enough data, stick to default
            return {
                originalPhi: defaultPhi,
                optimizedPhi: defaultPhi,
                efficiencyGain: 0,
                confidence: 0
            };
        }

        // Find bestperforming Phi in neighbors
        // Simple optimizer: Weighted average of top 3 performing points
        neighbors.sort((a, b) => b.efficiency - a.efficiency);
        const top3 = neighbors.slice(0, 3);

        // Weighted avg based on efficiency
        let weightedSum = 0;
        let weightTotal = 0;

        for (const p of top3) {
            weightedSum += p.bladeAnglePhi * p.efficiency;
            weightTotal += p.efficiency;
        }

        const bestPhi = weightedSum / weightTotal;

        // Safety clamp: Don't deviate > 5 degrees from default
        const deviation = bestPhi - defaultPhi;
        const clampedPhi = defaultPhi + Math.max(-5, Math.min(5, deviation));

        // Estimate gain (diff between best neighbor and avg neighbor)
        const avgEff = neighbors.reduce((sum, p) => sum + p.efficiency, 0) / neighbors.length;
        const bestEff = top3[0].efficiency;

        return {
            originalPhi: defaultPhi,
            optimizedPhi: clampedPhi,
            efficiencyGain: Math.max(0, bestEff - avgEff),
            confidence: Math.min(100, neighbors.length * 2)
        };
    }

    /**
     * LEARN FROM OPERATION
     * Feeds real-time data back into the model.
     */
    public static learn(
        unitId: string,
        head: number,
        guideVaneY: number,
        bladeAnglePhi: number,
        efficiency: number
    ): void {
        if (!this.learnedCams.has(unitId)) {
            this.learnedCams.set(unitId, []);
        }

        const unitHistory = this.learnedCams.get(unitId)!;

        // Add new point
        unitHistory.push({
            head,
            guideVaneY,
            bladeAnglePhi,
            efficiency,
            timestamp: Date.now()
        });

        // Prune logic: Keep max 1000 points per unit, prioritize high efficiency & recent
        if (unitHistory.length > 1000) {
            // Sort by age (keep recent) + efficiency (keep good)
            // Simplified: Just remove oldest
            unitHistory.shift();
        }

        console.log(`[Combinator] Learned: Unit ${unitId} @ ${head.toFixed(1)}m/${guideVaneY.toFixed(1)}% -> Eff ${efficiency.toFixed(2)}%`);
    }
}
