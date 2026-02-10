/**
 * ThePulseEngine.ts
 * 
 * Systemic Health & Correlation Engine
 * Aggregates all telemetry into a single "Sovereign Pulse Index" (0-100%).
 * Detects cross-domain correlations (e.g. Temp rise + Partial Discharge).
 * NC-1500: Integrated GridStabilityGuardian for frequency stability metrics
 */

import GridStabilityGuardian from './GridStabilityGuardian';

export interface SovereignPulse {
    index: number; // 0-100% (The "Life Force" of the plant)
    subIndices: {
        physical: number; // Asset health
        financial: number; // Revenue perf
        environmental: number; // Compliance
        cyber: number; // Security
        gridStability: number; // NEW: Frequency stability & inertia
    };
    systemicRisks: string[]; // Correlation findings
    globalStatus: 'OPTIMAL' | 'STRESSED' | 'CRITICAL' | 'DORMANT';
    gridMetrics?: {
        frequencyHz: number;
        dfdt: number; // Rate of change
        kineticKickActive: boolean;
        vCurveExcitation: number;
    };
}

export class ThePulseEngine {
    private gridGuardian = new GridStabilityGuardian();

    /**
     * AGGREGATE HEALTH
     * Weights different health inputs and calculates sovereign pulse
     */
    public aggregateHealth(inputs: {
        physical: {
            vibration: number;
            temperature: number;
            efficiency: number;
        };
        financial: {
            revenue: number;
            costs: number;
            efficiency: number;
        };
        environmental: {
            waterQuality: string;
            temperature: number;
            flow: number;
        };
        cyber: {
            connectionStatus: string;
            lastUpdate: string;
            alarmsActive: number;
        };
        grid?: {
            frequencyHz: number;
            lastFrequencyHz?: number;
            voltagePct?: number;
            timestamp: number;
        };
    }): SovereignPulse {

        // 1. Physical Health Score (35% weight) - reduced to make room for grid
        // Mechanical Health: Vibration analysis
        const vibrationScore = Math.max(0, 100 - (inputs.physical.vibration * 10)); // Lower vibration = higher score
        const temperatureScore = Math.max(0, 100 - Math.abs(inputs.physical.temperature - 45) * 2); // Optimal temp ~45°C
        const efficiencyScore = inputs.physical.efficiency * 100; // Direct efficiency percentage
        
        const physicalScore = (vibrationScore * 0.4) + (temperatureScore * 0.3) + (efficiencyScore * 0.3);

        // 2. Financial Health Score (20% weight)
        const revenueScore = inputs.financial.revenue > 0 ? Math.min(100, (inputs.financial.revenue / 10000) * 100) : 0;
        const costScore = inputs.financial.costs > 0 ? Math.max(0, 100 - (inputs.financial.costs / 5000) * 100) : 100;
        const financialScore = (revenueScore * 0.6) + (costScore * 0.4);

        // 3. Environmental Health Score (20% weight)
        const waterQualityScore = inputs.environmental.waterQuality === 'Excellent' ? 100 :
                                 inputs.environmental.waterQuality === 'Good' ? 80 :
                                 inputs.environmental.waterQuality === 'Fair' ? 60 :
                                 inputs.environmental.waterQuality === 'Poor' ? 30 : 50;
        
        const temperatureEnvScore = Math.max(0, 100 - Math.abs(inputs.environmental.temperature - 20) * 2);
        const flowScore = inputs.environmental.flow > 0 ? Math.min(100, (inputs.environmental.flow / 50) * 100) : 0;
        
        const environmentalScore = (waterQualityScore * 0.4) + (temperatureEnvScore * 0.3) + (flowScore * 0.3);

        // 4. Cyber Health Score (10% weight) - reduced to make room for grid
        const connectionScore = inputs.cyber.connectionStatus === 'CONNECTED' ? 100 :
                              inputs.cyber.connectionStatus === 'DEGRADED' ? 50 :
                              inputs.cyber.connectionStatus === 'DISCONNECTED' ? 0 : 25;
        
        const lastUpdateScore = inputs.cyber.lastUpdate ? 
            Math.max(0, 100 - (Date.now() - new Date(inputs.cyber.lastUpdate).getTime()) / (1000 * 60 * 5)) : 50;
        
        const alarmScore = Math.max(0, 100 - (inputs.cyber.alarmsActive * 5));
        
        const cyberScore = (connectionScore * 0.4) + (lastUpdateScore * 0.3) + (alarmScore * 0.3);

        // 5. Grid Stability Score (15% weight) - NEW from GridStabilityGuardian
        let gridStabilityScore = 100;
        let gridMetrics = {
            frequencyHz: 50,
            dfdt: 0,
            kineticKickActive: false,
            vCurveExcitation: 50
        };

        if (inputs.grid) {
            // Use GridStabilityGuardian for frequency stability
            const inertiaAction = this.gridGuardian.assessInertia({
                timestamp: inputs.grid.timestamp,
                frequencyHz: inputs.grid.frequencyHz,
                lastFrequencyHz: inputs.grid.lastFrequencyHz,
                voltagePct: inputs.grid.voltagePct
            });

            // Score based on frequency deviation from 50Hz
            const freqDeviation = Math.abs(inputs.grid.frequencyHz - 50);
            const frequencyScore = Math.max(0, 100 - (freqDeviation * 20)); // 1Hz off = 20 points lost

            // Penalty for rapid frequency change
            const dfdtPenalty = Math.abs(inertiaAction.dfdt || 0) * 50; // 0.2 Hz/s = 10 points lost
            
            gridStabilityScore = Math.max(0, frequencyScore - dfdtPenalty);

            // V-curve for voltage support
            const vCurve = this.gridGuardian.computeVCurve(inputs.grid.voltagePct);

            gridMetrics = {
                frequencyHz: inputs.grid.frequencyHz,
                dfdt: inertiaAction.dfdt || 0,
                kineticKickActive: inertiaAction.triggered,
                vCurveExcitation: vCurve.excitationPct
            };
        }

        // 6. Global Index (Weighted: Physical 35%, Financial 20%, Environmental 20%, Cyber 10%, Grid 15%)
        const globalIndex = (physicalScore * 0.35) + (financialScore * 0.2) + 
                            (environmentalScore * 0.2) + (cyberScore * 0.1) + (gridStabilityScore * 0.15);

        // 6. Systemic Risk Detection
        const risks: string[] = [];
        
        if (physicalScore < 50 && inputs.financial.efficiency < 80) {
            risks.push('Mechanical Stress with Low Efficiency - Potential Bearing Damage');
        }
        
        if (inputs.physical.vibration > 5 && inputs.physical.temperature > 70) {
            risks.push('Vortex Detection: High Vibration with Overheating - Cavitation Risk');
        }
        
        if (cyberScore < 60 && inputs.cyber.alarmsActive > 10) {
            risks.push('Cyber-Physical Correlation: Multiple Alarms with Poor Connection');
        }
        
        if (inputs.financial.revenue < 1000 && environmentalScore < 50) {
            risks.push('Eco-Financial Risk: Low Revenue with Environmental Compliance Issues');
        }

        // 7. Global Status
        let status: SovereignPulse['globalStatus'] = 'OPTIMAL';
        if (globalIndex < 70) status = 'STRESSED';
        if (globalIndex < 40) status = 'CRITICAL';
        if (inputs.financial.revenue < 100 && globalIndex > 80) status = 'DORMANT';

        return {
            index: Math.round(globalIndex),
            subIndices: {
                physical: Math.round(physicalScore),
                financial: Math.round(financialScore),
                environmental: Math.round(environmentalScore),
                cyber: Math.round(cyberScore),
                gridStability: Math.round(gridStabilityScore)
            },
            systemicRisks: risks,
            globalStatus: status,
            gridMetrics: inputs.grid ? gridMetrics : undefined
        };
    }

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
                cyber: cyberScore,
                gridStability: 100 // Default for static calculation
            },
            systemicRisks: risks,
            globalStatus: status
        };
    }
}
