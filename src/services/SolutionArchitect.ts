import { InferenceResult } from './ExpertInference';
import { TechnicalProjectState } from '../models/TechnicalSchema';

export interface RecoveryAction {
    id: string;
    title: string;
    description: string;
    mitigationImpact: string;
    requiredTools: string[];
    stressReductionFactor: number; // 0-1 (e.g., 0.2 means 20% reduction)
}

export interface RecoveryPath {
    conclusion: string;
    actions: RecoveryAction[];
    estimatedLifeExtension: number; // Years
}

export class SolutionArchitect {
    private static MITIGATION_LIBRARY: Record<string, RecoveryAction[]> = {
        'VIBRATION_CRITICAL': [
            {
                id: 'VIB_MIT_01',
                title: 'Limit Operation Zone',
                description: 'Restriktivan rad: Zabraniti rad u zoni kavitacije (65-75% opterećenja). Provjeriti vijke spojnice.',
                mitigationImpact: 'Reduces peak vibration by 40%',
                requiredTools: ['AnoHUB Vibration Pen', 'Torque Wrench for M16 bolts', 'Laser Alignment Kit'],
                stressReductionFactor: 0.4
            }
        ],
        'CAVITATION_INFERRED': [
            {
                id: 'CAV_MIT_01',
                title: 'Aeration Valve Optimization',
                description: 'Open Air Admission Valve to 25% + Limit Wicket Gate to 70%.',
                mitigationImpact: 'Collapses vortex rope and reduces cavitation impacts',
                requiredTools: ['Wrench Set', 'Pressure Gauge', 'AnoHUB Acoustic Probe'],
                stressReductionFactor: 0.25
            }
        ],
        'STRUCTURAL_RISK': [
            {
                id: 'STR_MIT_01',
                title: 'Load Shedding',
                description: 'Reduce plant output by 15% to lower internal casing pressure and hoop stress.',
                mitigationImpact: 'Reduces hoop stress by 20%',
                requiredTools: ['Pressure Gauge', 'Ultrasonic Thickness Gauge'],
                stressReductionFactor: 0.2
            }
        ],
        'BEARING_TEMP_CRITICAL': [
            {
                id: 'TEMP_MIT_01',
                title: 'Cooling Flow Increase',
                description: 'Increase cooling water flow by 15% via bypass valve. Check lubrication oil level.',
                mitigationImpact: 'Lowers bearing temperature by 8°C',
                requiredTools: ['Infrared Thermometer', 'Flow Meter', 'Lubrication Oil Quality Kit'],
                stressReductionFactor: 0.1
            }
        ]
    };

    /**
     * Life Extension Formula (The Recovery Law)
     * Lext = Lrem * (sigma_limit / sigma_actual)^3
     */
    static calculateLifeExtension(
        remainingLifeYears: number,
        sigma_limit: number,
        sigma_actual: number,
        reductionFactor: number
    ): number {
        if (remainingLifeYears <= 0) return 0;

        // sigma_reduced = sigma_actual * (1 - reductionFactor)
        const sigma_reduced = sigma_actual * (1 - reductionFactor);

        // Ensure we don't divide by zero
        if (sigma_reduced <= 0) return remainingLifeYears * 2;

        // Lext = Lrem * (sigma_limit / sigma_reduced)^3
        const extensionRatio = Math.pow(sigma_limit / sigma_reduced, 3);
        const newLife = remainingLifeYears * extensionRatio;

        return Math.max(0, newLife - remainingLifeYears);
    }

    static getRecoveryPath(conclusion: string, state: TechnicalProjectState): RecoveryPath {
        const actions = this.MITIGATION_LIBRARY[conclusion] || [];

        // Mock remaining life calculation for now
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
        const Lrem = state.structural.remainingLife / 5;
        const sigma_limit = 235;
        const sigma_actual = state.physics.hoopStressMPa || 150;

        let cumulativeReduction = 0;
        state.appliedMitigations.forEach(sopCode => {
            const actions = this.MITIGATION_LIBRARY[sopCode] || [];
            actions.forEach(a => {
                cumulativeReduction = Math.max(cumulativeReduction, a.stressReductionFactor);
            });
        });

        if (cumulativeReduction === 0) return 0;

        return this.calculateLifeExtension(Lrem, sigma_limit, sigma_actual, cumulativeReduction);
    }
}
