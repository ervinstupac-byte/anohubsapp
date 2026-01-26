import { SovereignStrategist, FinancialContext } from './SovereignStrategist';
import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';
import Decimal from 'decimal.js';

export interface ShadowLogEntry {
    timestamp: number;
    recommendedAction: string;
    actualState: string;
    shadowNetProfitRate: number;
    actualNetProfitRate: number;
    deltaP: number; // Positive = AI is better
}

export class ShadowCommandService {

    /**
     * Calculate Performance Delta (Delta P)
     * Comparing the AI's hypothetical state vs the machine's actual state.
     */
    public static calculateDelta(
        telemetry: TelemetryStream,
        financialContext: FinancialContext,
        aiRecommendation: { targetLoadMw: number, mode: string }
    ): ShadowLogEntry {

        // 1. Calculate Actual Profit (Reality)
        // We use the telemetry as-is (reflecting current operation)
        const actualResult = SovereignStrategist.calculateBridge(telemetry, financialContext, { accumulatedFatigue: 0 });

        // 2. Calculate Shadow Profit (AI HYPOTHESIS)
        // We must mutate the telemetry mathematically to reflect the AI's desire.
        // e.g., if AI wants 100MW but we are at 80MW, we simulate the physics of 100MW.
        // This is a simplification; a full physics engine run is needed for true accuracy.
        // For NC-12.1, we approximate by scaling power output and estimating vibration penalty.

        const shadowTelemetry = this.simulateTelemetry(telemetry, aiRecommendation.targetLoadMw);
        const shadowResult = SovereignStrategist.calculateBridge(shadowTelemetry, financialContext, { accumulatedFatigue: 0 });

        const deltaP = shadowResult.netProfitRate - actualResult.netProfitRate;

        return {
            timestamp: Date.now(),
            recommendedAction: aiRecommendation.mode,
            actualState: 'RUNNING_ACTUAL', // Placeholder for actual mode detection
            shadowNetProfitRate: shadowResult.netProfitRate,
            actualNetProfitRate: actualResult.netProfitRate,
            deltaP: deltaP
        };
    }

    private static simulateTelemetry(base: TelemetryStream, targetMw: number): TelemetryStream {
        // Clone and modify
        const sim = JSON.parse(JSON.stringify(base)) as TelemetryStream;

        if (!sim.hydraulic) sim.hydraulic = {} as any;

        // 1. Adjust Power
        sim.hydraulic.powerKW = targetMw * 1000;

        // 2. Estimate Vibration penalty (Simplified Physics Model)
        // If pushing beyond rated power (e.g. > 100MW), vibration increases exponentially
        // Assume rated is 100MW for this context or infer from base if available.
        // We'll use a crude model: V_new = V_old * (P_new / P_old)^2 if P_new > P_old
        const currentPowerKW = base.hydraulic?.powerKW || 1;
        const ratio = sim.hydraulic.powerKW / currentPowerKW;

        if (sim.mechanical && sim.mechanical.vibration) {
            if (ratio > 1.05) {
                // Penalize aggressive pushing
                sim.mechanical.vibration = sim.mechanical.vibration * Math.pow(ratio, 1.5);
            } else if (ratio < 0.95) {
                // Reward load shedding (less vibration)
                sim.mechanical.vibration = sim.mechanical.vibration * 0.9;
            }
        }

        return sim;
    }
}
