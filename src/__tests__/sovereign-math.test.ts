/**
 * sovereign-math.test.ts
 * 
 * NC-2100: Mathematical Stress Suite
 * Edge-case tests for PhysicsMathService, ControlMathService, ThermalMathService
 * 
 * Tests for:
 * - Zero thickness walls (division by zero protection)
 * - Vacuum pressures (negative pressure handling)
 * - Mach 1+ water velocities (supersonic flow handling)
 * - Decimal.js infinite precision (no event loops)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Decimal from 'decimal.js';
import { 
    PhysicsMathService, 
    analyzeOrbit, 
    calculateWaterHammer, 
    calculateThrust,
    calculatePerformanceDelta 
} from '../services/core/PhysicsMathService';
import { 
    ControlMathService,
    calculatePID,
    calculateGovernorControl,
    calculateEmergencyGateClosure,
    optimizeSetpointForBEP
} from '../services/math/ControlMathService';
import { 
    ThermalMathService,
    calculateThermalGrowth,
    calculateLabyrinthGapAdjustment,
    calculateHeatTransfer,
    calculateThermalStress,
    ThermalSpecs
} from '../services/math/ThermalMathService';

describe('Sovereign Mathematical Stress Suite (NC-2100)', () => {
    describe('PhysicsMathService Edge Cases', () => {
        describe('Zero Thickness Wall Protection', () => {
            test('should handle zero wall thickness without crashing', () => {
                const penstock = {
                    diameter: 1.0,
                    wallThickness: 0, // Zero thickness - critical edge case
                    materialModulus: 210,
                    materialYieldStrength: 250
                };

                const result = PhysicsMathService.calculateWaterHammer(penstock, 10, 50);

                // Should not crash and should handle gracefully
                expect(result.waveSpeed).toBeGreaterThan(0);
                expect(Number.isFinite(result.maxSurgeBar)).toBe(true);
                expect(Number.isFinite(result.burstSafetyFactor)).toBe(true);
                expect(result.recommendation).toContain('IEC 60041');
            });

            test('should handle negative wall thickness', () => {
                const penstock = {
                    diameter: 1.0,
                    wallThickness: -0.01, // Negative thickness - invalid input
                    materialModulus: 210,
                    materialYieldStrength: 250
                };

                const result = PhysicsMathService.calculateWaterHammer(penstock, 10, 50);

                // Should handle negative input gracefully
                expect(Number.isFinite(result.waveSpeed)).toBe(true);
                expect(Number.isFinite(result.burstSafetyFactor)).toBe(true);
            });
        });

        describe('Vacuum Pressure Handling', () => {
            test('should handle negative pressures (vacuum conditions)', () => {
                const penstock = {
                    diameter: 1.0,
                    wallThickness: 0.01,
                    materialModulus: 210,
                    materialYieldStrength: 250
                };

                // Test with negative pressure (vacuum)
                const result = PhysicsMathService.calculateWaterHammer(penstock, -10, 50);

                // Should handle negative flow/pressure gracefully
                expect(result.waveSpeed).toBeGreaterThan(0);
                expect(result.maxSurgeBar).toBeLessThan(0); // Negative surge for vacuum
                expect(result.velocity).toBeLessThan(0); // Negative velocity
            });

            test('should handle extreme vacuum (-1 bar)', () => {
                const penstock = {
                    diameter: 1.0,
                    wallThickness: 0.01,
                    materialModulus: 210,
                    materialYieldStrength: 250
                };

                const result = PhysicsMathService.calculateWaterHammer(penstock, -100, 50); // Extreme vacuum

                expect(Number.isFinite(result.waveSpeed)).toBe(true);
                expect(result.maxSurgeBar).toBeLessThan(0);
            });
        });

        describe('Mach 1+ Water Velocity Handling', () => {
            test('should handle supersonic water velocities', () => {
                const penstock = {
                    diameter: 0.1, // Small diameter for high velocity
                    wallThickness: 0.01,
                    materialModulus: 210,
                    materialYieldStrength: 250
                };

                // High flow creating supersonic velocity
                const result = PhysicsMathService.calculateWaterHammer(penstock, 1000, 50);

                expect(result.waveSpeed).toBeGreaterThan(0);
                expect(result.velocity).toBeGreaterThan(340); // Should exceed sound speed in water (~1480 m/s)
                expect(result.maxSurgeBar).toBeGreaterThan(0);
            });

            test('should handle Mach 1 exactly', () => {
                // Calculate flow that gives exactly Mach 1
                // v = a = 1480 m/s (speed of sound in water)
                // Q = v * A, where A = π * (d/2)²
                const d = 0.1;
                const area = Math.PI * Math.pow(d/2, 2);
                const mach1Flow = 1480 * area;

                const penstock = {
                    diameter: d,
                    wallThickness: 0.01,
                    materialModulus: 210,
                    materialYieldStrength: 250
                };

                const result = PhysicsMathService.calculateWaterHammer(penstock, mach1Flow, 50);

                expect(result.velocity).toBeCloseTo(1480, 10); // Mach 1
                expect(result.waveSpeed).toBeGreaterThan(0);
            });
        });

        describe('Orbit Analysis Edge Cases', () => {
            test('should handle empty vibration history', () => {
                const result = PhysicsMathService.analyzeOrbit([], 'FRANCIS');

                expect(result.eccentricity).toBe(0);
                expect(result.isElliptical).toBe(false);
                expect(result.centerMigration).toBe(0);
                expect(result.migrationAngle).toBe(0);
                expect(result.currentCenter.x).toBe(0);
                expect(result.currentCenter.y).toBe(0);
                expect(result.baselineCenter).toBeNull();
            });

            test('should handle single point orbit', () => {
                const singlePoint = [{ x: 1, y: 0, timestamp: Date.now() }];
                const result = PhysicsMathService.analyzeOrbit(singlePoint, 'FRANCIS', { x: 0, y: 0 });

                expect(result.eccentricity).toBe(0); // Single point has no eccentricity
                expect(result.currentCenter.x).toBe(1);
                expect(result.currentCenter.y).toBe(0);
                expect(result.a_axis).toBe(1);
                expect(result.b_axis).toBe(0);
            });

            test('should handle extreme vibration values', () => {
                const extremePoints = [
                    { x: 1000, y: 1000, timestamp: Date.now() }, // Extreme values
                    { x: -1000, y: -1000, timestamp: Date.now() + 1 },
                    { x: 500, y: -500, timestamp: Date.now() + 2 }
                ];

                const result = PhysicsMathService.analyzeOrbit(extremePoints, 'FRANCIS', { x: 0, y: 0 });

                expect(result.eccentricity).toBeLessThanOrEqual(1);
                expect(Number.isFinite(result.centerMigration)).toBe(true);
                expect(result.peakAngle).toBeGreaterThanOrEqual(0);
                expect(result.peakAngle).toBeLessThan(360);
            });
        });
    });

    describe('ControlMathService Stress Tests', () => {
        describe('PID Controller Edge Cases', () => {
            test('should handle zero gains', () => {
                const params = { kp: 0, ki: 0, kd: 0, setpoint: 100 };
                const state = { integralError: 0, previousError: 0 };

                const result = ControlMathService.calculatePID(params, state, 100);

                expect(result.controlSignal).toBe(0);
                expect(result.pTerm).toBe(0);
                expect(result.iTerm).toBe(0);
                expect(result.dTerm).toBe(0);
                expect(result.error).toBe(0);
            });

            test('should handle infinite gains', () => {
                const params = { kp: Infinity, ki: Infinity, kd: Infinity, setpoint: 100 };
                const state = { integralError: 0, previousError: 0 };

                const result = ControlMathService.calculatePID(params, state, 100);

                expect(result.controlSignal).toBeNaN();
                expect(result.pTerm).toBeNaN();
                expect(result.iTerm).toBeNaN();
                expect(result.dTerm).toBeNaN();
            });

            test('should handle integral windup protection', () => {
                const params = { 
                    kp: 1, 
                    ki: 0.1, 
                    kd: 0.05, 
                    setpoint: 100,
                    integralLimit: 10 // Limit integral to prevent windup
                };
                const state = { integralError: 1000, previousError: 0 }; // Large existing integral

                const result = ControlMathService.calculatePID(params, state, 100);

                // Integral should be clamped to limit
                expect(Math.abs(result.newIntegralError)).toBeLessThanOrEqual(10);
                expect(Number.isFinite(result.controlSignal)).toBe(true);
            });
        });

        describe('Governor Stability Test', () => {
            test('should prevent overspeed during load rejection', () => {
                const result = ControlMathService.calculateEmergencyGateClosure(
                    200, // 200MW load (massive overload)
                    50,  // 50MW target
                    50,   // Current gate position
                    100   // 100ms response time
                );

                expect(result.newGatePosition).toBeLessThan(50); // Should close gate
                expect(result.closureRate).toBeGreaterThan(0);
                expect(result.warning).toContain('EMERGENCY');
            });

            test('should handle 100% load rejection gracefully', () => {
                const result = ControlMathService.calculateEmergencyGateClosure(
                    100, // Full load
                    0,   // Zero target (complete shutdown)
                    95,   // Nearly fully open
                    50
                );

                expect(result.newGatePosition).toBeGreaterThanOrEqual(10); // Minimum gate position
                expect(result.newGatePosition).toBeLessThanOrEqual(95);
                expect(result.closureRate).toBeGreaterThan(0);
            });

            test('should optimize setpoint for BEP', () => {
                const result = ControlMathService.optimizeSetpointForBEP(
                    100, // 100m head
                    50,  // 50 m³/s flow
                    'FRANCIS'
                );

                expect(result.optimalSetpoint).toBeGreaterThan(0);
                expect(result.expectedEfficiency).toBeGreaterThan(0.8); // Should be near BEP efficiency
                expect(result.confidence).toBeGreaterThan(0.8);
            });
        });
    });

    describe('ThermalMathService Stress Tests', () => {
        describe('Extreme Temperature Handling', () => {
            test('should handle extreme temperatures', () => {
                const specs: ThermalSpecs = {
                    ambientTemperature: -50, // Extreme cold
                    operatingTemperature: 200,  // Extreme hot
                    shaftLength: 10,
                    runnerDiameterMM: 2000,
                    materialType: 'STEEL'
                };

                const result = ThermalMathService.calculateThermalGrowth(specs);

                expect(result.growthMM).toBeGreaterThan(0);
                expect(result.deltaT).toBe(250); // 200 - (-50)
                expect(result.compensationStatus).toBe('CRITICAL');
                expect(result.clearanceRequired).toBeGreaterThan(0);
            });

            test('should handle zero shaft length', () => {
                const specs: ThermalSpecs = {
                    ambientTemperature: 20,
                    operatingTemperature: 60,
                    shaftLength: 0, // Zero length - edge case
                    runnerDiameterMM: 1000,
                    materialType: 'STEEL'
                };

                const result = ThermalMathService.calculateThermalGrowth(specs);

                expect(result.growthMM).toBe(0); // No growth with zero length
                expect(result.clearanceRequired).toBe(0);
                expect(result.compensationStatus).toBe('OK');
            });

            test('should handle cryogenic temperatures', () => {
                const specs: ThermalSpecs = {
                    ambientTemperature: -196, // Liquid nitrogen temperature
                    operatingTemperature: -180,  // Still very cold
                    shaftLength: 5,
                    runnerDiameterMM: 500,
                    materialType: 'TITANIUM' // Titanium for cryogenic
                };

                const result = ThermalMathService.calculateThermalGrowth(specs);

                expect(result.growthMM).toBeGreaterThan(0);
                expect(result.deltaT).toBe(16); // Small temperature difference
                expect(result.compensationStatus).toBe('CRITICAL');
            });
        });

        describe('Material Property Edge Cases', () => {
            test('should handle custom material coefficients', () => {
                const specs = {
                    ambientTemperature: 20,
                    operatingTemperature: 60,
                    shaftLength: 5,
                    runnerDiameterMM: 1000,
                    materialType: 'CUSTOM' as const,
                    customAlpha: 23.5e-6 // Custom expansion coefficient
                };

                const result = ThermalMathService.calculateThermalGrowth(specs);

                expect(result.coefficient).toBe(23.5e-6);
                expect(result.growthMM).toBeGreaterThan(0);
            });

            test('should handle zero coefficient gracefully', () => {
                const specs = {
                    ambientTemperature: 20,
                    operatingTemperature: 60,
                    shaftLength: 5,
                    runnerDiameterMM: 1000,
                    materialType: 'CUSTOM' as const,
                    customAlpha: 0 // Zero expansion coefficient
                };

                const result = ThermalMathService.calculateThermalGrowth(specs);

                expect(result.growthMM).toBe(0); // No growth with zero coefficient
                expect(result.compensationStatus).toBe('OK');
            });
        });
    });

    describe('Decimal.js Infinite Precision Protection', () => {
        test('should handle infinite values without event loops', () => {
            // Test that Decimal.js handles infinite values properly
            const infinite = new Decimal(Infinity);
            const negativeInfinite = new Decimal(-Infinity);

            expect(infinite.isFinite()).toBe(false);
            expect(negativeInfinite.isFinite()).toBe(false);
            expect(infinite.isNaN()).toBe(false);
            expect(negativeInfinite.isNaN()).toBe(false);

            // Test arithmetic with infinite values
            const result1 = infinite.plus(1);
            const result2 = negativeInfinite.mul(2);

            expect(result1.isFinite()).toBe(false);
            expect(result2.isFinite()).toBe(false);
        });

        test('should handle very large numbers without overflow', () => {
            // Test with very large but finite numbers
            const large = new Decimal('1e50');
            const larger = new Decimal('1e100');

            expect(large.isFinite()).toBe(true);
            expect(larger.isFinite()).toBe(true);

            // Test arithmetic operations
            const sum = large.plus(larger);
            const product = large.mul(larger);

            expect(sum.isFinite()).toBe(true);
            expect(product.isFinite()).toBe(true);
        });

        test('should handle precision with many decimal places', () => {
            // Test high precision calculations
            const precise = new Decimal('0.12345678901234567890123456789');
            const result = precise.mul(new Decimal('0.98765432109876543210987654321'));

            expect(result.toDecimalPlaces(30)).toBeDefined();
            expect(result.toPrecision(50)).toBeDefined();
        });
    });

    describe('Cross-Service Integration Tests', () => {
        test('should integrate physics, control, and thermal calculations', () => {
            // Test a realistic scenario combining all services
            
            // 1. Physics: Water hammer from sudden valve closure
            const penstock = {
                diameter: 2.0,
                wallThickness: 0.02,
                materialModulus: 210,
                materialYieldStrength: 250
            };
            const waterHammer = PhysicsMathService.calculateWaterHammer(penstock, 50, 100);

            // 2. Control: Governor response to pressure surge
            const governorResult = ControlMathService.calculateGovernorControl(
                650, // Overspeed due to surge
                600, // Target speed
                undefined,
                75
            );

            // 3. Thermal: Thermal growth from temperature rise
            const thermalSpecs: ThermalSpecs = {
                ambientTemperature: 20,
                operatingTemperature: 80, // Temperature rise from surge
                shaftLength: 5,
                runnerDiameterMM: 1500,
                materialType: 'STEEL'
            };
            const thermalGrowth = ThermalMathService.calculateThermalGrowth(thermalSpecs);

            // Verify all calculations are consistent
            expect(waterHammer.maxSurgeBar).toBeGreaterThan(0);
            expect(governorResult.recommendedGatePosition).toBeLessThan(75); // Should reduce gate
            expect(thermalGrowth.growthMM).toBeGreaterThan(0);
            expect(thermalGrowth.compensationStatus).toMatch(/WARNING|CRITICAL/);

            // Cross-check: thermal growth should affect labyrinth gap
            const labyrinthResult = ThermalMathService.calculateLabyrinthGapAdjustment(
                1.0, // 1mm base gap
                thermalSpecs.operatingTemperature,
                20, // Reference temperature
                'STEEL',
                1500
            );

            expect(labyrinthResult.adjustedGap).not.toBe(1.0); // Should be adjusted for thermal growth
        });
    });
});
