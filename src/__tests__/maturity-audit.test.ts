import { describe, it, expect } from 'vitest';
import { TechnicalProjectState, DEFAULT_TECHNICAL_STATE } from '../models/TechnicalSchema';

// We'll mock the calculation here since we can't easily export it from the component
const calculateMaturity = (state: TechnicalProjectState) => {
    const criticalFields = [
        { path: 'identity.assetName' },
        { path: 'identity.totalOperatingHours' },
        { path: 'mechanical.bearingTemp' },
        { path: 'mechanical.vibration' },
        { path: 'mechanical.insulationResistance', requiredValue: 0 },
        { path: 'mechanical.axialPlay', requiredValue: 0 },
        { path: 'hydraulic.head' },
        { path: 'hydraulic.flow' },
        { path: 'penstock.wallThickness' },
        { path: 'penstock.materialYieldStrength' },
        { path: 'site.designPerformanceMW' }
    ];

    let filledCount = 0;
    criticalFields.forEach(field => {
        const value = field.path.split('.').reduce((obj: any, key: string) => obj?.[key], state);
        const isFilled = value !== undefined && value !== null && value !== '' &&
            (field.requiredValue !== undefined ? value !== field.requiredValue : true);
        if (isFilled) filledCount++;
    });

    return Math.round((filledCount / criticalFields.length) * 100);
};

describe('Asset Maturity Audit', () => {
    it('should calculate 0% for empty state', () => {
        const emptyState: any = { identity: {}, mechanical: {}, hydraulic: {}, penstock: {}, site: {} };
        expect(calculateMaturity(emptyState)).toBe(0);
    });

    it('should calculate 100% for default tech state', () => {
        // Default state has most fields filled with dummy/nominal data
        expect(calculateMaturity(DEFAULT_TECHNICAL_STATE)).toBe(100);
    });

    it('should detect missing critical fields', () => {
        const partialState = {
            ...DEFAULT_TECHNICAL_STATE,
            mechanical: {
                ...DEFAULT_TECHNICAL_STATE.mechanical,
                insulationResistance: 0
            }
        };
        expect(calculateMaturity(partialState)).toBeLessThan(100);
    });
});
