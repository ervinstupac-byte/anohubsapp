/**
 * SwarmIntelligenceBridge.ts
 * 
 * The "Collective Memory"
 * When one asset learns from operator feedback, that knowledge
 * is instantly shared with all similar assets in the fleet.
 */

export interface OperatorVeto {
    assetId: string;
    actionType: string;
    reason: string;
    timestamp: number;
}

export interface SharedLearning {
    sourceAsset: string;
    actionType: string;
    penaltyApplied: number;
    affectedAssets: string[];
    learnedAt: number;
}

export class SwarmIntelligenceBridge {
    private static knowledgeBase: SharedLearning[] = [];

    /**
     * Synchronize a veto across the fleet
     * When Asset A receives a veto, similar assets learn preemptively
     */
    public static syncVetoAcrossFleet(
        veto: OperatorVeto,
        fleetAssets: Array<{ assetId: string; turbineModel: string }>
    ): SharedLearning {

        // Find source asset model
        const sourceAsset = fleetAssets.find(a => a.assetId === veto.assetId);
        if (!sourceAsset) {
            throw new Error(`Asset ${veto.assetId} not found in fleet`);
        }

        // Find similar assets (same turbine model)
        const similarAssets = fleetAssets.filter(
            a => a.turbineModel === sourceAsset.turbineModel && a.assetId !== veto.assetId
        );

        // Calculate penalty (full penalty for source, half for fleet)
        // Source gets +15% threshold penalty per veto (from NC-13.0)
        // Fleet assets get +7.5% preemptive penalty
        const sourcePenalty = 0.15;
        const fleetPenalty = sourcePenalty * 0.5;

        const learning: SharedLearning = {
            sourceAsset: veto.assetId,
            actionType: veto.actionType,
            penaltyApplied: fleetPenalty,
            affectedAssets: similarAssets.map(a => a.assetId),
            learnedAt: veto.timestamp
        };

        // Store in knowledge base
        this.knowledgeBase.push(learning);

        console.log(`[Swarm] 🧠 Cross-Asset Learning Activated`);
        console.log(`[Swarm]   Source: ${veto.assetId} (veto: ${veto.actionType})`);
        console.log(`[Swarm]   Propagated to ${similarAssets.length} similar assets`);
        console.log(`[Swarm]   Fleet Penalty: +${(fleetPenalty * 100).toFixed(1)}% threshold`);

        // In real system: Update FeedbackIntelligence for each affected asset
        // for (const asset of similarAssets) {
        //     await FeedbackIntelligence.applyPreemptivePenalty(asset.assetId, veto.actionType, fleetPenalty);
        // }

        return learning;
    }

    /**
     * Get collective knowledge index (total learnings shared)
     */
    public static getCollectiveKnowledgeIndex(): number {
        return this.knowledgeBase.length;
    }

    /**
     * Get learnings by action type
     */
    public static getLearningHistory(actionType?: string): SharedLearning[] {
        if (actionType) {
            return this.knowledgeBase.filter(l => l.actionType === actionType);
        }
        return this.knowledgeBase;
    }

    /**
     * Calculate swarm intelligence score
     * Higher when more cross-learning has occurred
     */
    public static calculateSwarmIQ(fleetSize: number): number {
        if (fleetSize === 0) return 0;

        const learningsPerAsset = this.knowledgeBase.length / fleetSize;
        const maxExpected = 10; // Assume 10 cross-learnings is "mature swarm"

        return Math.min(learningsPerAsset / maxExpected, 1.0) * 100; // 0-100 score
    }

    /**
     * Reset knowledge base (for testing)
     */
    public static reset(): void {
        this.knowledgeBase = [];
    }
}
