export interface WeightMap {
    plantId: string;
    timestamp: number;
    weights: Record<string, number>;
}

export interface HiveConsensus {
    globalWeights: Record<string, number>;
    contributorCount: number;
    lastUpdated: number;
}

// SIMULATED CLOUD DATABASE
let MOCK_GLOBAL_STATE: HiveConsensus = {
    globalWeights: {
        'PAT-001': 1.2, // Pre-learned basic vibration pattern
        'PAT-003': 1.5  // Highly confirmed cavitation pattern
    },
    contributorCount: 12, // 12 Plants in the network
    lastUpdated: Date.now()
};

export const HiveRegistry = {
    /**
     * Submit local weights to the Hive.
     * In a real system, this would be an API call.
     */
    submitLocalWeights: async (map: WeightMap): Promise<boolean> => {
        console.log(`[HiveRegistry] Received update from ${map.plantId}`, map.weights);

        // SIMULATE CONSENSUS ALGORITHM
        // Weighted Average: Global = (Global * 0.95) + (Local * 0.05)
        // This makes the hive slow to change, but responsive to consistent trends.
        Object.entries(map.weights).forEach(([patternId, localWeight]) => {
            const currentGlobal = MOCK_GLOBAL_STATE.globalWeights[patternId] || 1.0;
            const newGlobal = (currentGlobal * 0.95) + (localWeight * 0.05);
            MOCK_GLOBAL_STATE.globalWeights[patternId] = newGlobal;
        });

        MOCK_GLOBAL_STATE.lastUpdated = Date.now();
        MOCK_GLOBAL_STATE.contributorCount++;

        return true;
    },

    /**
     * Get the current global consensus weights.
     */
    getGlobalWeights: async (): Promise<HiveConsensus> => {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));
        return { ...MOCK_GLOBAL_STATE };
    }
};
