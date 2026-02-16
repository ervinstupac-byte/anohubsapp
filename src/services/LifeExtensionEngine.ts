import { TechnicalProjectState } from '../core/TechnicalSchema';
import { RecoveryPath } from '../models/RepairContext';
import { MITIGATION_LIBRARY } from '../data/mitigationLibrary';
import BaseGuardian from './BaseGuardian';

export class LifeExtensionEngine extends BaseGuardian {
    /**
     * Physics-based Life Extension Logic (NC-4.2 Hardened)
     * Factors in Stress-Life (S-N) curves and mitigation impact.
     */
    static calculateLifeExtension(
        remainingLifeYears: number,
        yieldStrengthLimit: number,
        currentStress: number,
        stressReductionFactor: number // 0-1
    ): number {
        if (remainingLifeYears <= 0) return 0;
        if (stressReductionFactor <= 0) return 0;

        // Simplified S-N power law model: Life ~ 1 / (Stress)^k
        // For steel, k typically ranges from 3 to 5. We use k=3 for conservative hydro estimate.
        const k = 3.0;
        const baselineStressRatio = currentStress / yieldStrengthLimit;
        const mitigatedStressRatio = (currentStress * (1 - stressReductionFactor)) / yieldStrengthLimit;

        if (mitigatedStressRatio <= 0) return remainingLifeYears * 2; // Cap at 2x life

        const extensionRatio = Math.pow(baselineStressRatio / mitigatedStressRatio, k);
        const newLife = remainingLifeYears * extensionRatio;

        return Math.max(0, newLife - remainingLifeYears);
    }

    static getRecoveryPath(conclusion: string, state: TechnicalProjectState): RecoveryPath {
        const actions = MITIGATION_LIBRARY[conclusion] || [];

        // Simulated remaining life calculation for now
        const Lrem = state.structural.remainingLife / 5; // 100% = 20 years approx
        const sigma_limit = 235; // MPa for S235
        const sigma_current = state.physics.hoopStressMPa || 150;

        let totalReduction = 0;
        actions.forEach(a => {
            totalReduction = Math.max(totalReduction, a.stressReductionFactor);
        });

        const extension = this.calculateLifeExtension(Lrem, sigma_limit, sigma_current, totalReduction);

        return {
            conclusion,
            actions,
            estimatedLifeExtension: extension
        };
    }

    static calculateTotalExtendedLife(state: TechnicalProjectState): number {
        const Lrem = state.structural.remainingLife / 5; // 100% = 20 years approx
        const sigma_limit = 235; // MPa for S235
        const sigma_actual = state.physics.hoopStressMPa || 150;

        let cumulativeReduction = 0;
        state.appliedMitigations.forEach(sopCode => {
            const actions = MITIGATION_LIBRARY[sopCode] || [];
            actions.forEach(a => {
                cumulativeReduction = Math.max(cumulativeReduction, a.stressReductionFactor || 0);
            });
        });

        if (cumulativeReduction === 0) return 0;

        return this.calculateLifeExtension(Lrem, sigma_limit, sigma_actual, cumulativeReduction);
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
