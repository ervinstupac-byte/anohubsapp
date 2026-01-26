import { LifeExtensionEngine } from '../services/LifeExtensionEngine';
import { SolutionArchitect } from '../services/SolutionArchitect';
import { TechnicalProjectState } from '../core/TechnicalSchema';

describe('SolutionArchitect & LifeExtensionEngine Math', () => {
    test('calculateLifeExtension implements cubic formula correctly', () => {
        const Lrem = 10;
        const sigma_limit = 235;
        const sigma_actual = 200;
        const reductionFactor = 0.25; // 25% reduction

        // sigma_reduced = 200 * 0.75 = 150
        // extensionRatio = (200 / 150)^3 = (1.333)^3 = 2.37
        // extension = 10 * 2.37 - 10 = 13.7

        const extension = LifeExtensionEngine.calculateLifeExtension(Lrem, sigma_limit, sigma_actual, reductionFactor);
        expect(extension).toBeGreaterThan(10);
        expect(extension).toBeLessThan(20);
    });

    test('calculateTotalExtendedLife considers all applied mitigations', () => {
        const mockState: any = {
            structural: { remainingLife: 50 },
            physics: { hoopStressMPa: 180 },
            appliedMitigations: ['VIBRATION_CRITICAL']
        };

        const result = LifeExtensionEngine.calculateTotalExtendedLife(mockState as TechnicalProjectState);
        expect(result).toBeGreaterThan(0);
    });

    test('getRecoveryPath returns correct tools from mitigation library', () => {
        const mockState: any = {
            structural: { remainingLife: 50 },
            physics: { hoopStressMPa: 180 },
            appliedMitigations: []
        };

        const path = LifeExtensionEngine.getRecoveryPath('VIBRATION_CRITICAL', mockState as TechnicalProjectState);
        expect(path.actions.length).toBeGreaterThan(0);
        expect(path.actions[0].requiredTools).toContain('Torque Wrench for M16 bolts');
    });
});
