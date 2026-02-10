
/**
 * NC-13000: Economics Core
 * The financial heartbeat of the Sovereign Engine.
 * 
 * Integrates forensic revenue analysis based on efficiency gaps.
 */

// SOVEREIGN BENCHMARKS (Hardcoded from Vault Audit)
export const SOVEREIGN_ECONOMICS = {
    TARGET_EFFICIENCY: 0.92, // 92% Efficiency Benchmark
    MARKET_PRICE_MWH: 65,    // 65 EUR per MWh
    CURRENCY: 'EUR'
};

export interface ForensicLossReport {
    isOptimal: boolean;
    currentEfficiency: number;
    targetEfficiency: number;
    efficiencyGap: number;
    hourlyRevenueLoss: number;
    annualRevenueLoss: number; // Projected over 8000 hours
    message: string;
}

/**
 * Calculates the forensic financial loss due to efficiency degradation.
 * 
 * @param currentEff Current hydraulic efficiency (0.0 - 1.0)
 * @param currentPowerMw Current active power output in MW
 * @returns ForensicLossReport detailing the economic impact
 */
export const calculateForensicLoss = (
    currentEff: number, 
    currentPowerMw: number
): ForensicLossReport => {
    const { TARGET_EFFICIENCY, MARKET_PRICE_MWH } = SOVEREIGN_ECONOMICS;

    // Guard clause for physics violations or shutdown state
    if (currentEff <= 0 || currentPowerMw <= 0) {
        return {
            isOptimal: false,
            currentEfficiency: currentEff,
            targetEfficiency: TARGET_EFFICIENCY,
            efficiencyGap: 0,
            hourlyRevenueLoss: 0,
            annualRevenueLoss: 0,
            message: 'SYSTEM SHUTDOWN OR INVALID TELEMETRY'
        };
    }

    // Calculate the theoretical power if we were running at TARGET_EFFICIENCY
    // Formula: Power_Theoretical = Power_Current * (Target_Eff / Current_Eff)
    // Loss = Power_Theoretical - Power_Current
    
    // HOWEVER, the vault audit used a simplified "lostMW" approach:
    // const effGap = Math.max(0, targetEff - currentEff);
    // const lostMW = (flow * head * 9.81 * effGap) / 1000; 
    // Since we only have MW input here, we infer the potential MW:
    
    let hourlyRevenueLoss = 0;
    let efficiencyGap = 0;
    let isOptimal = true;

    if (currentEff < TARGET_EFFICIENCY) {
        isOptimal = false;
        efficiencyGap = TARGET_EFFICIENCY - currentEff;
        
        // Potential MW if efficiency was 92%
        // P_ideal = P_actual / Eff_actual * Eff_ideal
        const potentialPowerMw = (currentPowerMw / currentEff) * TARGET_EFFICIENCY;
        const lostMw = potentialPowerMw - currentPowerMw;
        
        hourlyRevenueLoss = lostMw * MARKET_PRICE_MWH;
    }

    const annualRevenueLoss = hourlyRevenueLoss * 8000; // Standard operating year

    return {
        isOptimal,
        currentEfficiency: currentEff,
        targetEfficiency: TARGET_EFFICIENCY,
        efficiencyGap,
        hourlyRevenueLoss: Number(hourlyRevenueLoss.toFixed(2)),
        annualRevenueLoss: Number(annualRevenueLoss.toFixed(0)),
        message: isOptimal 
            ? 'ECONOMICALLY OPTIMIZED' 
            : `REVENUE LEAK: €${hourlyRevenueLoss.toFixed(2)}/hr DETECTED`
    };
};
