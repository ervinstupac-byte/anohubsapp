
import { describe, it, expect } from 'vitest';
import { ExpertInference } from '../services/ExpertInference';
import { TechnicalProjectState } from '../models/TechnicalSchema';

describe('ExpertInference Engine', () => {
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
            flow: 5.0,
            efficiency: 0.85,
            baselineOutputMW: 4.5 as any
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
        } as any,
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
                    tan: 0,
                    viscosityIndex: 100
                }
            }
        } as any,
        structural: {
            remainingLife: 50,
            extendedLifeYears: 0,
            estimatedFailureDate: '2035-01-01'
        },
        appliedMitigations: []
    };

    it('should detect ISO 10816-3 Vibration violation', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        const vibAlert = result.alerts.find(a => a.parameter === 'Vibration');
        expect(vibAlert).toBeDefined();
        expect(vibAlert?.severity).toBe('CRITICAL');
        expect(vibAlert?.reasoning).toContain('ISO 10816-3');
    });

    it('should detect critical bearing temperature', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        const tempAlert = result.alerts.find(a => a.parameter === 'Bearing Temp');
        expect(tempAlert).toBeDefined();
        expect(tempAlert?.severity).toBe('CRITICAL');
    });

    it('should calculate Structural Safety Margin (Barlow Link)', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        // MAWP = (2 * 250 * 0.02) / 1.5 = 6.66 MPa = 66.6 Bar
        // Current P = 10 + 12 = 22 Bar
        // Margin = (66.6 - 22) / 66.6 = 0.67 (67%)
        expect(result.metrics.structuralSafetyMargin).toBeCloseTo(67, 0);
    });

    it('should attach recommendedAction to critical alerts', () => {
        const result = ExpertInference.analyze(mockState as TechnicalProjectState);
        const vibAlert = result.alerts.find(a => a.parameter === 'Vibration');
        expect(vibAlert?.recommendedAction).toBeDefined();
        expect(vibAlert?.recommendedAction).toContain('Check Coupling');
    });
});
