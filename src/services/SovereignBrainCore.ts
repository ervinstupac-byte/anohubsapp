/**
 * SovereignBrainCore.ts
 * 
 * The Central Cortex of the Monolit.
 * Updated to enforce Edge Function Timeouts and Performance Constraints.
 */

import { DeploymentConfig } from '../config/DeploymentConfig';

export interface SystemState {
    marketPriceEur: number;
    machineHealthIndex: number; // 0-100
    hydraulicHeadM: number;
    environmentalCompliant: boolean;
    safetyInterlocksClear: boolean;
    gridStabilityRequest: boolean; // FCAS needed?
}

export type GlobalStrategy = 'MAX_PROFIT' | 'BALANCED' | 'CONSERVE_ASSET' | 'GRID_SUPPORT' | 'SAFETY_SHUTDOWN' | 'ECO_CONSTRAINT';

export interface StrategicDirective {
    strategy: GlobalStrategy;
    targetLoadMW: number;
    rationale: string;
    priorityScore: number;
}

export class SovereignBrainCore {

    /**
     * EVALUATE STRATEGY (Optimization)
     */
    public static determineStrategy(state: SystemState): StrategicDirective {
        const start = performance.now();

        try {
            // 1. SAFETY OVERRIDE (NC-60)
            if (!state.safetyInterlocksClear) {
                return this.wrapResult({
                    strategy: 'SAFETY_SHUTDOWN',
                    targetLoadMW: 0,
                    rationale: 'CRITICAL: Safety Interlock Active. Immediate Shutdown.',
                    priorityScore: 1000
                }, start);
            }

            // 2. GRID STABILITY (NC-62)
            if (state.gridStabilityRequest) {
                return this.wrapResult({
                    strategy: 'GRID_SUPPORT',
                    targetLoadMW: -1,
                    rationale: 'Grid Emergency/FCAS request detected. Supporting frequency.',
                    priorityScore: 900
                }, start);
            }

            // 3. ECO COMPLIANCE (NC-64)
            if (!state.environmentalCompliant) {
                return this.wrapResult({
                    strategy: 'ECO_CONSTRAINT',
                    targetLoadMW: 20,
                    rationale: 'Environmental violation imminent. Restricting ops for compliance.',
                    priorityScore: 800
                }, start);
            }

            // 4. ASSET CONSERVATION (NC-33)
            if (state.machineHealthIndex < 50 && state.marketPriceEur < 100) {
                return this.wrapResult({
                    strategy: 'CONSERVE_ASSET',
                    targetLoadMW: 0,
                    rationale: `Health Low (${state.machineHealthIndex}%) & Price Low (€${state.marketPriceEur}). Preserving RUL.`,
                    priorityScore: 700
                }, start);
            }

            // 5. MARKET OPMITIZATION (NC-50)
            if (state.marketPriceEur > 150) {
                const derate = state.machineHealthIndex < 70 ? 0.8 : 1.0;

                return this.wrapResult({
                    strategy: 'MAX_PROFIT',
                    targetLoadMW: 100 * derate,
                    rationale: `Price Surge (€${state.marketPriceEur}). Maximizing Revenue.`,
                    priorityScore: 500
                }, start);
            }

            // Default
            return this.wrapResult({
                strategy: 'BALANCED',
                targetLoadMW: 80,
                rationale: 'Normal Operation. Running at Best Efficiency Point.',
                priorityScore: 100
            }, start);

        } catch (e) {
            // Fail-safe catch mostly for complex logic if implemented later
            console.error('Core Logic Failed', e);
            return {
                strategy: 'SAFETY_SHUTDOWN',
                targetLoadMW: 0,
                rationale: 'CORE ERROR - FALLBACK TO SAFETY',
                priorityScore: 9999
            };
        }
    }

    private static wrapResult(result: StrategicDirective, startTime: number): StrategicDirective {
        const end = performance.now();
        const duration = end - startTime;

        if (duration > DeploymentConfig.edgeTimeoutMs) {
            console.warn(`[Brain] ⚠️ SLOW THINKING: ${duration.toFixed(2)}ms. Edge Limit: ${DeploymentConfig.edgeTimeoutMs}ms`);
            // In a real scenario, we might simplify logic next tick
        }
        return result;
    }
}
