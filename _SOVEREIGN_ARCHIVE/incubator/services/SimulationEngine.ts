/**
 * SIMULATION ENGINE
 * The Sandbox for the Sovereign 🛡️
 * 
 * Runs "What-If" scenarios on historical telemetry to determine the 
 * optimal path forward.
 */

import { SovereignStrategist, FinancialContext, PrescriptiveAction } from './SovereignStrategist';
import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';
import Decimal from 'decimal.js';

export interface SimulationResult {
    scenarioId: string;
    totalProfit: number;
    totalWearCost: number;
    description: string;
    winning: boolean;
}

export interface SimulationInput {
    history: TelemetryStream[];
    baselineContext: FinancialContext;
}

export class SimulationEngine {

    /**
     * Run comparative analysis: Aggressive vs Conservative
     */
    public static runWhatIfAnalysis(input: SimulationInput): SimulationResult[] {
        const results: SimulationResult[] = [];

        // 1. Scenario: Aggressive (Max Profit, High Wear)
        // Simulate modifying market price or operational parameters
        // For simplicity in this v1, we simulated different 'Maintenance Costs' or 'Thresholds'
        // But SovereignStrategist uses 'FinanceContext'. 
        // Let's vary the 'maintenanceHourlyRate' (simulating deferred maintenance vs active)

        // Scenario A: "Run to Destruction" (Low Maintenance Cost inputs, High Revenue priority)
        const aggressiveResult = this.simulatePath(input.history, {
            ...input.baselineContext,
            // Simulate perception that maintenance is cheap/ignored (dangerous)
            maintenanceHourlyRate: 0
        });

        results.push({
            scenarioId: 'AGGRESSIVE',
            totalProfit: aggressiveResult.profit,
            totalWearCost: aggressiveResult.wear,
            description: 'Maximize Output (Ignore Wear)',
            winning: false
        });

        // Scenario B: "Sovereign Balanced" (Actual params)
        const balancedResult = this.simulatePath(input.history, input.baselineContext);

        results.push({
            scenarioId: 'SOVEREIGN_BALANCED',
            totalProfit: balancedResult.profit,
            totalWearCost: balancedResult.wear,
            description: 'Optimal Profit/Health Ratio',
            winning: false
        });

        // Determine Winner (Highest Net Profit considering REAL costs)
        // We recalculate Aggressive's true cost using the BASELINE context for fairness
        // (Aggressive thought cost was 0, but reality is Baseline)
        const realAggressiveProfit = this.recalculateRealProfit(input.history, aggressiveResult.actions, input.baselineContext);

        const winner = balancedResult.profit > realAggressiveProfit ? 'SOVEREIGN_BALANCED' : 'AGGRESSIVE';

        return results.map(r => ({
            ...r,
            winning: r.scenarioId === winner
        }));
    }

    private static simulatePath(history: TelemetryStream[], context: FinancialContext): { profit: number, wear: number, actions: PrescriptiveAction[][] } {
        let totalProfit = new Decimal(0);
        let totalWear = new Decimal(0);
        const actionLog: PrescriptiveAction[][] = [];

        history.forEach(telemetry => {
            // We assume 'accumulatedFatigue' is 0 for the slice simulation or tracked
            const result = SovereignStrategist.calculateBridge(telemetry, context, { accumulatedFatigue: 0 });

            // Accumulate rates * 1 hour (assuming hourly data for simplicity, or 1 sample = 1 unit)
            // Ideally delta time should be passed. We'll assume these are hourly samples for what-if.
            totalProfit = totalProfit.plus(result.netProfitRate);
            totalWear = totalWear.plus(result.molecularDebtRate);
            actionLog.push(result.recommendations);
        });

        return {
            profit: totalProfit.toNumber(),
            wear: totalWear.toNumber(),
            actions: actionLog
        };
    }

    private static recalculateRealProfit(history: TelemetryStream[], actions: PrescriptiveAction[][], realContext: FinancialContext): number {
        // In a real simulation, actions would feedback into the physics.
        // Here, we just re-run the financial math on the same telemetry but with REAL cost constants.
        // This penalizes the "Aggressive" strategy which ignored costs.
        // (Simplified: Aggressive didn't change physics in this mock, just the financial calc)

        const res = this.simulatePath(history, realContext);
        return res.profit;
    }
}
