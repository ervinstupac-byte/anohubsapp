/**
 * BankiMichellOptimizer.ts
 * 
 * Specialized Physics Model for Banki-Michell (Crossflow) Turbines
 * Focuses on air regulation, internal ventilation, and unique crossflow dynamics
 */

export interface BankiMichellState {
    flowRate: number; // m³/s
    headPressure: number; // m
    gateOpening: number; // % (0-100)
    airValvePosition: number; // % open (internal ventilation)
    runnerSpeed: number; // RPM
    efficiency: number; // Measured
    internalPressure: number; // bar (runner chamber)
}

export class BankiMichellOptimizer {

    /**
     * Calculate optimal air valve position for crossflow efficiency
     * 
     * Crossflow turbines have TWO stages:
     * 1. Water enters through nozzle, passes through runner (1st stage)
     * 2. Water exits runner, re-enters for 2nd pass (2nd stage)
     * 
     * Air regulation prevents water "short-circuiting" between stages
     */
    public static calculateOptimalAirValve(state: BankiMichellState): {
        optimalPosition: number;
        currentDeviation: number;
        efficiencyImpact: number;
        recommendation: string;
    } {
        // Empirical formula for Banki-Michell air regulation
        // Optimal air valve opening = f(flow_rate, head, gate_opening)

        // At low loads (<40% gate): More air needed to prevent backflow
        // At high loads (>70% gate): Less air to maximize hydraulic efficiency

        let optimalPosition: number;

        if (state.gateOpening < 40) {
            // Low load: Open air valve 60-80%
            optimalPosition = 60 + (40 - state.gateOpening) * 0.5;
        } else if (state.gateOpening > 70) {
            // High load: Close air valve 20-40%
            optimalPosition = 40 - (state.gateOpening - 70) * 0.6;
        } else {
            // Mid load: Linear transition 40-60%
            optimalPosition = 60 - (state.gateOpening - 40) * 0.67;
        }

        const currentDeviation = Math.abs(state.airValvePosition - optimalPosition);

        // Efficiency impact: ~0.5% efficiency per 10% air valve deviation
        const efficiencyImpact = (currentDeviation / 10) * 0.5;

        let recommendation = '';
        if (currentDeviation > 15) {
            const direction = state.airValvePosition < optimalPosition ? 'OPEN' : 'CLOSE';
            recommendation = `HEALING_PROTOCOL_AIR_REGULATION: ${direction} air valve by ${currentDeviation.toFixed(0)}% ` +
                `(from ${state.airValvePosition.toFixed(0)}% to ${optimalPosition.toFixed(0)}%) ` +
                `to recover ${efficiencyImpact.toFixed(1)}% efficiency`;
        } else {
            recommendation = 'Air regulation optimal';
        }

        return {
            optimalPosition,
            currentDeviation,
            efficiencyImpact,
            recommendation
        };
    }

    /**
     * Detect nozzle wear from efficiency curves
     * Crossflow nozzles erode faster than Francis/Kaplan gates
     */
    public static detectNozzleWear(state: BankiMichellState): {
        wearEstimate: number; // 0-100%
        efficiencyLoss: number; // % from baseline
        recommendation: string;
    } {
        // Baseline efficiency for Banki-Michell at optimal point: ~85-88%
        const baselineEfficiency = 0.87;
        const efficiencyLoss = (baselineEfficiency - state.efficiency) * 100;

        // Wear estimate based on efficiency degradation
        // Assume 1% efficiency loss per 10% nozzle wear
        const wearEstimate = Math.min(100, efficiencyLoss * 10);

        let recommendation = '';
        if (wearEstimate > 50) {
            recommendation = `Nozzle wear estimated at ${wearEstimate.toFixed(0)}% - ` +
                `schedule inspection and refurbishment to recover ${efficiencyLoss.toFixed(1)}% efficiency`;
        } else if (wearEstimate > 30) {
            recommendation = `Moderate nozzle wear (${wearEstimate.toFixed(0)}%) - monitor quarterly`;
        } else {
            recommendation = 'Nozzle condition acceptable';
        }

        return {
            wearEstimate,
            efficiencyLoss,
            recommendation
        };
    }

    /**
     * Optimize runner ventilation for two-stage flow
     */
    public static optimizeInternalVentilation(state: BankiMichellState): {
        pressureBalance: 'GOOD' | 'IMBALANCED';
        ventilationAction: string;
    } {
        // Internal runner pressure should be near atmospheric
        // High pressure = trapped air → efficiency loss
        // Low pressure = water cavitation risk

        const targetPressure = 1.0; // bar (atmospheric)
        const pressureDeviation = Math.abs(state.internalPressure - targetPressure);

        let pressureBalance: 'GOOD' | 'IMBALANCED' = 'GOOD';
        let ventilationAction = 'No action needed';

        if (pressureDeviation > 0.2) {
            pressureBalance = 'IMBALANCED';

            if (state.internalPressure > targetPressure) {
                ventilationAction = `Open ventilation ports - internal pressure too high (${state.internalPressure.toFixed(2)} bar)`;
            } else {
                ventilationAction = `Close ventilation ports - risk of cavitation (${state.internalPressure.toFixed(2)} bar)`;
            }
        }

        return {
            pressureBalance,
            ventilationAction
        };
    }

    /**
     * Calculate optimal operating point for crossflow
     */
    public static getOptimalOperatingPoint(
        availableFlow: number,
        availableHead: number
    ): {
        optimalGate: number;
        optimalAirValve: number;
        predictedEfficiency: number;
    } {
        // Crossflow turbines have relatively flat efficiency curve
        // Best efficiency typically at 60-80% gate opening

        // Simplified: optimal gate = 70% of available flow capacity
        const optimalGate = 70;

        // Air valve correlates with gate
        const optimalAirValve = this.calculateOptimalAirValve({
            flowRate: 0,
            headPressure: availableHead,
            gateOpening: optimalGate,
            airValvePosition: 0,
            runnerSpeed: 0,
            efficiency: 0,
            internalPressure: 1.0
        }).optimalPosition;

        // Predicted efficiency from empirical curves
        const predictedEfficiency = 0.87 - Math.abs(optimalGate - 70) * 0.002;

        return {
            optimalGate,
            optimalAirValve,
            predictedEfficiency
        };
    }
}
