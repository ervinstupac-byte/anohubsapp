import { SolutionArchitect } from '../services/SolutionArchitect';
import { TechnicalProjectState } from '../models/TechnicalSchema';

describe('SolutionArchitect Life Extension Math', () => {
    test('calculateLifeExtension implements cubic formula correctly', () => {
        const Lrem = 10;
        const sigma_limit = 235;
        const sigma_actual = 200;
        const reductionFactor = 0.25; // 25% reduction

        // sigma_reduced = 200 * 0.75 = 150
        // extension = 10 * (235 / 150)^3 - 10
        // (235/150)^3 = (1.566)^3 = 3.84
        // extension = 10 * 3.84 - 10 = 28.4

        const extension = SolutionArchitect.calculateLifeExtension(Lrem, sigma_limit, sigma_actual, reductionFactor);
        expect(extension).toBeGreaterThan(20);
        expect(extension).toBeLessThan(35);
    });

    test('calculateTotalExtendedLife considers all applied mitigations', () => {
        const mockState: Partial<TechnicalProjectState> = {
            structural: { remainingLife: 50 } as any,
            physics: { hoopStressMPa: 180 } as any,
            appliedMitigations: ['STRUCTURAL_RISK', 'VIBRATION_CRITICAL']
        };

        const result = SolutionArchitect.calculateTotalExtendedLife(mockState as TechnicalProjectState);
        expect(result).toBeGreaterThan(0);
    });

    test('getRecoveryPath returns correct tools', () => {
        const mockState: Partial<TechnicalProjectState> = {
            structural: { remainingLife: 50 } as any,
            physics: { hoopStressMPa: 180 } as any,
            appliedMitigations: []
        };

        const path = SolutionArchitect.getRecoveryPath('VIBRATION_CRITICAL', mockState as TechnicalProjectState);
        expect(path.actions[0].requiredTools).toContain('Torque Wrench for M16 bolts');
    });
});
