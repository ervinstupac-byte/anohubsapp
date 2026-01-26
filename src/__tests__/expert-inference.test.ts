
import { describe, it, expect, beforeAll } from 'vitest';
import { ExpertInference } from '../services/ExpertInference';
import { TechnicalProjectState } from '../core/TechnicalSchema';
import i18n from '../i18n';
import en from '../i18n/locales/en.json';

describe('ExpertInference Engine', () => {
    beforeAll(async () => {
        await i18n.init({
            lng: 'en',
            resources: {
                en: {
                    common: en
                }
            },
            defaultNS: 'common'
        });
    });

    const mockState: any = {
        mechanical: {
            vibration: 5.0, // Should trigger ISO 10816-3 Critical
            bearingTemp: 85, // Should trigger Critical Temp
            alignment: 0,
            vibrationX: 2.5,
            vibrationY: 2.5,
            rpm: 500,
            radialClearance: 0.5,
            boltSpecs: {
                grade: '8.8',
                count: 12,
                torque: 450
            }
        },
        hydraulic: {
            head: 100,
            flow: 3.0,
            efficiency: 0.85,
            baselineOutputMW: 4.5
        },
        physics: {
            specificWaterConsumption: 5000, // Very high
            hoopStressMPa: 100,
            staticPressureBar: 10,
            surgePressureBar: 12,
            waterHammerPressureBar: 0,
            eccentricity: 0.5,
            axialThrustKN: 0,
            boltSafetyFactor: 1.5,
            boltLoadKN: 100,
            boltCapacityKN: 200
        },
        site: {
            designPerformanceMW: 5.0,
            designFlow: 3.0
        },
        penstock: {
            diameter: 1.5,
            length: 200,
            material: 'STEEL',
            wallThickness: 0.02,
            materialModulus: 210,
            materialYieldStrength: 250
        },
        identity: {
            turbineType: 'FRANCIS',
            machineConfig: {
                ratedPowerMW: 5.0
            },
            environmentalBaseline: {
                ambientTemperature: 25
            },
            fluidIntelligence: {
                oilSystem: {
                    waterContentPPM: 0,
                    viscosityIndex: 100
                }
            },
            startStopCount: 120
        },
        demoMode: {
            active: false
        },
        structural: {
            remainingLife: 50,
            extendedLifeYears: 0,
            estimatedFailureDate: '2035-01-01'
        },
        appliedMitigations: []
    };

    it('should detect ISO 10816-3 Vibration violation', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        const vibAlert = result.alerts.find(a => a.parameter === i18n.t('validation.fields.vibration'));
        expect(vibAlert).toBeDefined();
        expect(vibAlert?.severity).toBe('CRITICAL');
        expect(vibAlert?.reasoning).toContain('ISO 10816-3');
    });

    it('should detect critical bearing temperature', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        const tempAlert = result.alerts.find(a => a.parameter === i18n.t('validation.fields.bearingTemp'));
        expect(tempAlert).toBeDefined();
        expect(tempAlert?.severity).toBe('CRITICAL');
    });

    it('should calculate Structural Safety Margin (Barlow Link)', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        // MAWP = (2 * 250 * 0.02) / 1.5 = 6.66 MPa = 66.6 Bar
        // Current P = 10 + 12 = 22 Bar
        // Margin = (66.6 - 22) / 66.6 = 0.67 (67.0%)
        expect(result.metrics.structuralSafetyMargin).toBeCloseTo(67, 0);
    });

    it('should attach recommendedAction to critical alerts', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        const vibAlert = result.alerts.find(a => a.parameter === i18n.t('validation.fields.vibration'));
        expect(vibAlert?.recommendedAction).toBeDefined();
        // Since it pulls from MaintenanceSOP.json now
        expect(vibAlert?.recommendedAction).toContain('Check Coupling');
    });
});
