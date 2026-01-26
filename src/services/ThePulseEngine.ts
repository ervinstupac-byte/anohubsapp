/**
 * ThePulseEngine.ts
 * 
 * Systemic Health & Correlation Engine
 * Aggregates all telemetry into a single "Sovereign Pulse Index" (0-100%).
 * Detects cross-domain correlations (e.g. Temp rise + Partial Discharge).
 */

export interface SovereignPulse {
    index: number; // 0-100% (The "Life Force" of the plant)
    subIndices: {
        physical: number; // Asset health
        financial: number; // Revenue perf
        environmental: number; // Compliance
        cyber: number; // Security
    };
    systemicRisks: string[]; // Correlation findings
    globalStatus: 'OPTIMAL' | 'STRESSED' | 'CRITICAL' | 'DORMANT';
}

export class ThePulseEngine {

    /**
     * CALCULATE PULSE
     */
    public static calculatePulse(
        assetHealthMix: number[], // Array of unit healths
        revenueRateEurHr: number,
        marketPrice: number,
        activeAlarms: number,
        cyberThreatLevel: number, // 0-100
        ecoViolations: number
    ): SovereignPulse {

        // 1. Sub-Indices
        const physicalScore = assetHealthMix.reduce((a, b) => a + b, 0) / (assetHealthMix.length || 1);

        // Financial: Simple ratio of Revenue vs Potential (Price * Capacity)
        // Assume 100MW capacity
        const potentialRev = marketPrice * 100;
        const financialScore = potentialRev > 0 ? (revenueRateEurHr / potentialRev) * 100 : 0;

        const environmentalScore = Math.max(0, 100 - (ecoViolations * 50));
        const cyberScore = Math.max(0, 100 - cyberThreatLevel);

        // 2. Global Index (Weighted)
        // Physical is foundation (40%), Cyber (20%), Eco (20%), Financial (20%)
        const globalIndex = (physicalScore * 0.4) + (cyberScore * 0.2) + (environmentalScore * 0.2) + (financialScore * 0.2);

        // 3. Systemic Risk Correlation
        const risks: string[] = [];
        if (physicalScore < 60 && revenueRateEurHr > potentialRev * 0.9) {
            risks.push('Asset Strain: High Load on Weak Machine');
        }
        if (cyberThreatLevel > 50 && activeAlarms > 20) {
            risks.push('Cyber-Physical Attack Vector Suspected');
        }

        // 4. Status
        let status: SovereignPulse['globalStatus'] = 'OPTIMAL';
        if (globalIndex < 70) status = 'STRESSED';
        if (globalIndex < 40) status = 'CRITICAL';
        if (revenueRateEurHr < 10 && globalIndex > 80) status = 'DORMANT'; // Healthy but offline

        return {
            index: globalIndex,
            subIndices: {
                physical: physicalScore,
                financial: financialScore,
                environmental: environmentalScore,
                cyber: cyberScore
            },
            systemicRisks: risks,
            globalStatus: status
        };
    }
}
