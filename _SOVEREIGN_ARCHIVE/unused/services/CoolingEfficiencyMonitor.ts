/**
 * CoolingEfficiencyMonitor.ts
 * 
 * Heat Exchanger Efficiency & Fouling Monitor
 * Calculates Heat Transfer Coefficient (U) and tracks Fouling Factor.
 * Triggers maintenance based on thermal performance, not just high temps.
 */

export interface CoolerHealth {
    coolerId: string;
    heatTransferCoeffU: number; // W/m²K
    foulingFactor: number; // m²K/W
    efficiency: number; // % relative to clean
    status: 'OPTIMAL' | 'FOULING' | 'CLEAN_REQUIRED';
}

export class CoolingEfficiencyMonitor {
    // Baseline 'Clean' U values per cooler ID
    private static cleanU: Map<string, number> = new Map([
        ['OIL_COOLER_1', 800], // W/m²K
        ['GEN_AIR_COOLER_1', 45]
    ]);

    public static analyzeCooler(
        coolerId: string,
        hotFluidFlowKgS: number,
        tempHotIn: number,
        tempHotOut: number,
        tempColdIn: number,
        tempColdOut: number,
        areaM2: number,
        specificHeatHot: number // J/kgK
    ): CoolerHealth {
        // 1. Calculate Heat Load (Q)
        // Q = m * Cp * deltaT_hot
        const Q = hotFluidFlowKgS * specificHeatHot * (tempHotIn - tempHotOut);

        // 2. Calculate LMTD (Log Mean Temp Difference)
        const dt1 = tempHotIn - tempColdOut; // Counter-flow assumed
        const dt2 = tempHotOut - tempColdIn;

        let lmtd = 0;
        if (dt1 === dt2) lmtd = dt1;
        else lmtd = (dt1 - dt2) / Math.log(dt1 / dt2);

        // 3. Calculate Actual U
        // Q = U * A * LMTD  => U = Q / (A * LMTD)
        const U_actual = lmtd > 0 ? Q / (areaM2 * lmtd) : 0;

        // 4. Calculate Fouling Factor (Rf)
        // 1/U_dirty = 1/U_clean + Rf  => Rf = 1/U_dirty - 1/U_clean
        const U_clean = this.cleanU.get(coolerId) || 500;
        const Rf = (1 / (U_actual || 1)) - (1 / U_clean);

        // 5. Determine Status
        let efficiency = (U_actual / U_clean) * 100;
        efficiency = Math.max(0, Math.min(150, efficiency)); // Clamp

        let status: CoolerHealth['status'] = 'OPTIMAL';
        if (efficiency < 85) status = 'FOULING';
        if (efficiency < 70) status = 'CLEAN_REQUIRED';

        return {
            coolerId,
            heatTransferCoeffU: U_actual,
            foulingFactor: Math.max(0, Rf),
            efficiency,
            status
        };
    }
}
