export const OptimizationService = {
    calculatePredictedEfficiency: (loadFactor: number, head: number) => {
        // Simple parabolic efficiency curve for demo
        const optimalLoad = 0.9;
        const maxEff = 94.5;
        const diff = Math.abs(loadFactor - optimalLoad);
        return maxEff - (diff * diff * 50);
    },
    suggestOptimalLoad: (totalDemand: number, unitCount: number) => totalDemand / unitCount
};
