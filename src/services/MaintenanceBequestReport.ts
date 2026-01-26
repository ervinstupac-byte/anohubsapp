import OutageOptimizer, { PfailMap, PricePoint } from './OutageOptimizer';

export type BequestResult = {
    stopNow: {
        scheduledHours: number;
        estimatedCostEUR: number;
    };
    waitForFailure: {
        expectedHoursUntilFail: number | null;
        expectedEmergencyDowntimeHours: number;
        expectedEmergencyCostEUR: number;
    };
    savings: {
        hoursSaved: number;
        eurosSaved: number;
    };
    rationale: string;
};

export default class MaintenanceBequestReport {
    /**
     * Simple economic comparison: stopping now (scheduled outage 48h) vs waiting for failure.
     * Inputs: Pfail map and approximate costs.
     */
    public static generate(pfail: PfailMap, priceForecast: PricePoint[], options?: { scheduledHours?: number; scheduledCostEUR?: number; emergencyCostEUR?: number; emergencyDowntimeHours?: number; now?: number; }) : BequestResult {
        const scheduledHours = options?.scheduledHours ?? 48;
        const scheduledCostEUR = options?.scheduledCostEUR ?? 50_000; // base scheduled outage cost
        const emergencyCostEUR = options?.emergencyCostEUR ?? 250_000; // emergency repair cost
        const emergencyDowntimeHours = options?.emergencyDowntimeHours ?? 120; // 5 days
        const now = options?.now ?? Date.now();

        // Expected time until failure: naive exponential approx using total Pfail
        const totalP = Object.values(pfail).reduce((s, v) => s + (v || 0), 0);
        const hoursInMonth = 24 * 30;

        // If totalP is zero, expected hours until fail is null
        const expectedHoursUntilFail = totalP > 0 ? Math.max(1, Math.round((1 / totalP) * 24)) : null;

        // Compute expected cost if we wait: probability of failure in month * emergencyCost + otherwise 0
        const probFailInMonth = Math.min(1, totalP); // heuristic
        const expectedEmergencyCostEUR = probFailInMonth * emergencyCostEUR;

        // For saved hours: emergency downtime vs scheduled hours
        const expectedEmergencyDowntimeHours = emergencyDowntimeHours;

        const hoursSaved = Math.max(0, expectedEmergencyDowntimeHours - scheduledHours);
        const eurosSaved = Math.max(0, expectedEmergencyCostEUR - scheduledCostEUR);

        const rationale = `Total failure probability (sum of components) = ${totalP.toFixed(3)}. ` +
            `Estimated emergency cost if failure occurs: €${emergencyCostEUR.toLocaleString()}.`;

        return {
            stopNow: {
                scheduledHours,
                estimatedCostEUR: scheduledCostEUR
            },
            waitForFailure: {
                expectedHoursUntilFail,
                expectedEmergencyDowntimeHours: expectedEmergencyDowntimeHours,
                expectedEmergencyCostEUR
            },
            savings: {
                hoursSaved,
                eurosSaved
            },
            rationale
        };
    }
}
