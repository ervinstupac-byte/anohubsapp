/**
 * SovereignHealerService.ts
 * 
 * The "Autonomous Physician" of the system.
 * Receives forensic diagnoses and prescribes/executes corrective protocols
 * after validating them through simulation.
 */

import { CausalChain } from './ForensicDiagnosticService';

export enum HealingProtocol {
    THERMAL_STABILIZATION = 'THERMAL_STABILIZATION',
    CAVITATION_DAMPING = 'CAVITATION_DAMPING',
    DEBRIS_FLUSH = 'DEBRIS_FLUSH',
    LOAD_REDUCTION = 'LOAD_REDUCTION',
    COOLING_BOOST = 'COOLING_BOOST',
    VIBRATION_DAMPENING = 'VIBRATION_DAMPENING'
}

export interface HealingAction {
    protocol: HealingProtocol;
    targetMetric: string;
    adjustmentValue: number; // e.g., -5 for "reduce by 5%"
    expectedImprovement: number; // Expected metric change
    confidence: number;
}

export interface HealingResult {
    protocol: HealingProtocol;
    mode: 'AUTO' | 'ADVISORY';
    healingEffectiveness: number; // H_eff
    simulatedOutcome: string;
    executed: boolean;
}

export class SystemRecoveryService {

    /**
     * Core method: Diagnose → Match Protocol → Simulate → Execute/Advise
     */
    public static async heal(diagnosis: CausalChain): Promise<HealingResult | null> {
        // Step 1: Match Root Cause to Protocol
        const action = this.matchProtocol(diagnosis);

        if (!action) {
            console.log('[Healer] No protocol matched for this diagnosis.');
            return null;
        }

        // Step 2: Confidence Check
        if (action.confidence < 0.9) {
            console.log('[Healer] Confidence too low. Skipping healing.');
            return {
                protocol: action.protocol,
                mode: 'ADVISORY',
                healingEffectiveness: 0,
                simulatedOutcome: 'Confidence below threshold (90%)',
                executed: false
            };
        }

        // Step 3: Virtual Healing Test (Simulation)
        const simResult = await this.simulateHealing(action);

        // Step 4: Calculate H_eff
        const H_eff = simResult.actualImprovement / action.expectedImprovement;

        // Step 5: Decision Logic
        if (H_eff >= 0.7 && simResult.predictedLoss < 1000) {
            // AUTO mode: Execute healing
            this.executeProtocol(action);
            return {
                protocol: action.protocol,
                mode: 'AUTO',
                healingEffectiveness: H_eff,
                simulatedOutcome: simResult.description,
                executed: true
            };
        } else {
            // ADVISORY mode: Notify operator
            return {
                protocol: action.protocol,
                mode: 'ADVISORY',
                healingEffectiveness: H_eff,
                simulatedOutcome: `Simulation shows risk (H_eff=${H_eff.toFixed(2)}). Operator review required.`,
                executed: false
            };
        }
    }

    /**
     * Match Root Cause → Healing Protocol
     */
    private static matchProtocol(diagnosis: CausalChain): HealingAction | null {
        const rootCause = diagnosis.rootCause.metric;
        const rootValue = diagnosis.rootCause.value;

        // Protocol Library (Rule-based matching)
        if (rootCause === 'temperature' && rootValue > 40) {
            return {
                protocol: HealingProtocol.THERMAL_STABILIZATION,
                targetMetric: 'temperature',
                adjustmentValue: -5, // Reduce load by 5% to lower temp
                expectedImprovement: 3, // Expect 3°C drop
                confidence: 0.95
            };
        }

        if (rootCause === 'cavitation' && rootValue > 0.8) {
            return {
                protocol: HealingProtocol.CAVITATION_DAMPING,
                targetMetric: 'pressure',
                adjustmentValue: 2, // Increase pressure by 2%
                expectedImprovement: 0.2, // Expect cavitation index drop
                confidence: 0.92
            };
        }

        if (rootCause === 'vibration' && rootValue > 2.5) {
            return {
                protocol: HealingProtocol.VIBRATION_DAMPENING,
                targetMetric: 'load',
                adjustmentValue: -3,
                expectedImprovement: 0.5,
                confidence: 0.88
            };
        }

        return null;
    }

    /**
     * Simulate healing action through virtual environment
     */
    private static async simulateHealing(action: HealingAction): Promise<{
        actualImprovement: number;
        predictedLoss: number;
        description: string;
    }> {
        // Simulated simulation (In real system, call SimulationEngine from NC-12)
        // For now, assume simulation predicts 80% of expected improvement
        const actualImprovement = action.expectedImprovement * 0.8;
        const predictedLoss = Math.random() * 500; // Simulated risk assessment

        return {
            actualImprovement,
            predictedLoss,
            description: `Simulated ${action.protocol}: Expected ${action.expectedImprovement.toFixed(1)} improvement, achieved ${actualImprovement.toFixed(1)}`
        };
    }

    /**
     * Execute the healing protocol (send to control system)
     */
    private static executeProtocol(action: HealingAction): void {
        console.log(`[Healer] ✅ EXECUTING: ${action.protocol}`);
        console.log(`[Healer] Adjusting ${action.targetMetric} by ${action.adjustmentValue}%`);
        // In real system: Send command to PLC/SCADA
        // await ControlSystemAdapter.sendCommand(action);
    }
}
