/**
 * FishPassageOrchestrator.ts
 * 
 * Fish Ladder & Bypass Management
 * Optimizes flow for migration (attraction flow) vs generation.
 * Adjusts based on seasonal migration data.
 */

export interface FishPassageState {
    season: 'MIGRATION_PEAK' | 'MIGRATION_LOW' | 'OFF_SEASON';
    requiredFlowM3s: number;
    actualFlowM3s: number;
    spilledWaterCostEurHr: number;
    fishCountEstimate: number; // Daily count
    gateOpeningPct: number;
}

export class FishPassageOrchestrator {
    private static readonly ENERGY_PRICE = 85.0; // EUR/MWh
    private static readonly EFFICIENCY_FACTOR = 0.85; // Roughly MW per m3/s depends on head

    /**
     * OPTIMIZE FLOW
     */
    public static optimizeFlow(
        month: number, // 0-11
        headM: number,
        fishCounterDaily: number
    ): FishPassageState {
        // Seasonal Logic
        // migration peak: April-June (3-5) and Sept-Oct (8-9) typically
        const isSpringRun = month >= 3 && month <= 5;
        const isFallRun = month >= 8 && month <= 9;

        let season: FishPassageState['season'] = 'OFF_SEASON';
        let requiredFlow = 0.5; // Maintenance flow (m3/s)

        if (isSpringRun || isFallRun) {
            season = 'MIGRATION_PEAK';
            requiredFlow = 2.0; // Higher attraction flow needed

            // Dynamic adjustment: If high fish activity, boost flow
            if (fishCounterDaily > 100) {
                requiredFlow = 3.0;
            }
        } else if (month === 2 || month === 10) {
            season = 'MIGRATION_LOW';
            requiredFlow = 1.0;
        }

        // Calculate Opportunity Cost
        // Power Lost = Flow * Head * 9.81 * Efficiency (kW)
        const powerMw = (requiredFlow * headM * 9.81 * 0.9) / 1000;
        const costEur = powerMw * this.ENERGY_PRICE;

        // Determine Gate Setting
        // Q = Cd * A * sqrt(2*g*H) ... simplified linear map 0-100% = 0-5 m3/s
        const gateOpening = (requiredFlow / 5.0) * 100;

        return {
            season,
            requiredFlowM3s: requiredFlow,
            actualFlowM3s: requiredFlow, // Assumed controlled perfectly
            spilledWaterCostEurHr: costEur,
            fishCountEstimate: fishCounterDaily,
            gateOpeningPct: Math.min(100, gateOpening)
        };
    }
}
