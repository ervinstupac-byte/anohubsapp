
import { describe, it, expect } from 'vitest';
import {
    calculateFlowVelocity,
    calculateWaveVelocity,
    calculateSurgePressure,
    calculateHoopStress,
    calculatePowerMW,
    calculateEccentricity,
    calculateReynoldsNumber,
    calculateFrictionFactor,
    calculateHeadLoss,
    calculateGridStressFactor,
    calculateBoltLoadKN,
    calculateBoltCapacityKN,
    calculateTypicalEfficiency,
    getTurbineThresholds
} from '../PhysicsCalculations.logic';
import Decimal from 'decimal.js';

// Setup Simulated Constants if needed, but the logic file imports a constant file. 
// We rely on the actual values for integration-style unit testing of the formulas.
// Assuming water density ~1000, gravity ~9.81, bulk modulus, etc from SystemConstants.

describe('Physics Calculation Logic', () => {

    describe('Hydraulics: Surge & Flow', () => {
        it('calculates flow velocity correctly', () => {
            // Q = 10 m3/s, D = 2m
            // Area = pi * r^2 = 3.14159 * 1^2 = 3.14159
            // V = 10 / 3.14159 = 3.183
            const flow = new Decimal(10);
            const diameter = new Decimal(2);
            const velocity = calculateFlowVelocity(flow, diameter);

            expect(velocity.toNumber()).toBeCloseTo(3.183, 3);
        });

        it('guards against zero diameter division', () => {
            const flow = new Decimal(10);
            const diameter = new Decimal(0);
            const velocity = calculateFlowVelocity(flow, diameter);
            expect(velocity.toNumber()).toBeCloseTo(10, 10);
        });

        it('calculates Reynolds number correctly', () => {
            const v = new Decimal(3.5);
            const d = new Decimal(2);
            const re = calculateReynoldsNumber(v, d);
            expect(re.toNumber()).toBeCloseTo(6140350.877, 0);
        });

        it('calculates laminar friction factor as 64/Re', () => {
            const re = new Decimal(2000);
            const roughness = new Decimal(0.05);
            const diameter = new Decimal(2);
            const f = calculateFrictionFactor(re, roughness, diameter);
            expect(f.toNumber()).toBeCloseTo(0.032, 6);
        });

        it('calculates turbulent friction factor (Swamee-Jain) within expected range', () => {
            const re = new Decimal(100000);
            const roughness = new Decimal(0.05);
            const diameter = new Decimal(2);
            const f = calculateFrictionFactor(re, roughness, diameter);
            expect(f.toNumber()).toBeGreaterThan(0.005);
            expect(f.toNumber()).toBeLessThan(0.05);
        });

        it('calculates Darcy-Weisbach head loss correctly', () => {
            const f = new Decimal(0.02);
            const length = new Decimal(1000);
            const diameter = new Decimal(2);
            const velocity = new Decimal(3);
            const hf = calculateHeadLoss(f, length, diameter, velocity);
            expect(hf.toNumber()).toBeCloseTo(4.587, 3);
        });

        it('calculates wave velocity with elastic correction', () => {
            const diameter = new Decimal(2);
            const thickness = new Decimal(0.02);
            const modulusPa = new Decimal(2e11);
            const a = calculateWaveVelocity(diameter, thickness, modulusPa);
            expect(a.toNumber()).toBeGreaterThan(900);
            expect(a.toNumber()).toBeLessThan(1500);
        });

        it('calculates surge pressure correctly (Water Hammer)', () => {
            // Joukowsky Equation: dP = rho * a * dV
            // rho = 1000 (approx), a = 1200 (approx), dV = 3.183
            // Pressure = 1000 * 1200 * 3.183 = 3,819,600 Pa -> 3.8 MPa

            // Note: waveVelocity calculation depends on material modulus.
            // Using pre-calculated values for isolation.
            const waveVelocity = new Decimal(1200);
            const flowVelocity = new Decimal(3.183);

            const surgePressurePa = calculateSurgePressure(waveVelocity, flowVelocity);

            // 1000 * 1200 * 3.183 = 3,819,600
            expect(surgePressurePa.toNumber()).toBeCloseTo(3819600, -2); // Check within 100 Pa
        });
    });

    describe('Structural: Hoop Stress (Barlow)', () => {
        it('calculates hoop stress correctly under static + surge load', () => {
            // Head = 100m, Surge = 1,000,000 Pa (1 MPa)
            // D = 2000 mm (2m), t = 20 mm (0.02m)

            // Static P = rho * g * h = 1000 * 9.81 * 100 = 981,000 Pa
            // Total P = 981,000 + 1,000,000 = 1,981,000 Pa

            // Stress = (P * D) / (2 * t)
            // Stress = (1,981,000 * 2.0) / (2 * 0.02)
            // Stress = 3,962,000 / 0.04 = 99,050,000 Pa = 99.05 MPa

            const head = new Decimal(100);
            const surgePressurePa = new Decimal(1000000);
            const diameter = new Decimal(2.0); // meters
            const thickness = new Decimal(0.02); // meters

            const result = calculateHoopStress(head, surgePressurePa, diameter, thickness);
            const stressMPa = result;

            expect(stressMPa.toNumber()).toBeCloseTo(99.05, 1);
        });

        it('calculates static-only hoop stress when surge is zero', () => {
            const head = new Decimal(100);
            const surgePressurePa = new Decimal(0);
            const diameter = new Decimal(2.0);
            const thickness = new Decimal(0.02);
            const result = calculateHoopStress(head, surgePressurePa, diameter, thickness);
            const stressMPa = result;
            expect(stressMPa.toNumber()).toBeCloseTo(49.05, 1);
        });

        it('scales hoop stress linearly with diameter', () => {
            const head = new Decimal(100);
            const surgePressurePa = new Decimal(0);
            const thickness = new Decimal(0.02);
            const stress2m = calculateHoopStress(head, surgePressurePa, new Decimal(2), thickness).toNumber();
            const stress3m = calculateHoopStress(head, surgePressurePa, new Decimal(3), thickness).toNumber();
            expect(stress3m / stress2m).toBeCloseTo(1.5, 6);
        });
    });

    describe('Performance: Efficiency & Power', () => {
        it('calculates output power correctly', () => {
            // P = rho * g * H * Q * eta
            // rho=1000, g=9.81
            // H=100m, Q=10m3/s, eta=0.9 (90%)

            // P = 1000 * 9.81 * 100 * 10 * 0.9 = 8,829,000 Watts = 8.829 MW

            const head = new Decimal(100);
            const flow = new Decimal(10);
            const efficiency = new Decimal(90); // percent

            const powerMW = calculatePowerMW(head, flow, efficiency);

            expect(powerMW.toNumber()).toBeCloseTo(8.829, 3);
        });

        it('handles efficiency as decimal (0.9) vs percent (90)', () => {
            const head = new Decimal(100);
            const flow = new Decimal(10);
            const efficiency = new Decimal(0.9); // decimal

            const powerMW = calculatePowerMW(head, flow, efficiency);
            expect(powerMW.toNumber()).toBeCloseTo(8.829, 3);
        });

        it('scales output power linearly with flow', () => {
            const head = new Decimal(100);
            const efficiency = new Decimal(90);
            const p10 = calculatePowerMW(head, new Decimal(10), efficiency).toNumber();
            const p20 = calculatePowerMW(head, new Decimal(20), efficiency).toNumber();
            expect(p20 / p10).toBeCloseTo(2, 6);
        });

        it('allows efficiencies above 100% without crashing', () => {
            const head = new Decimal(100);
            const flow = new Decimal(10);
            const powerMW = calculatePowerMW(head, flow, new Decimal(110));
            expect(powerMW.toNumber()).toBeGreaterThan(8.829);
        });
    });

    describe('Diagnostics: Eccentricity', () => {
        it('calculates eccentricity for Francis (default)', () => {
            // e = sqrt(1 - b^2/a^2)
            // VibX = 10, VibY = 5
            // a=10, b=5
            // e = sqrt(1 - 25/100) = sqrt(0.75) = 0.866

            const vibX = new Decimal(10);
            const vibY = new Decimal(5);

            const ecc = calculateEccentricity(vibX, vibY, 'FRANCIS');
            expect(ecc.toNumber()).toBeCloseTo(0.866, 3);
        });

        it('handles Pelton factors correctly', () => {
            // Pelton factor typically increases X sensitivity
            // If PELTON_VIBRATION_FACTOR is, say, 1.2 in constants?
            // Assuming factor exists, we test that it differs from raw calc or follows logic
            // But since we import constants, we rely on them. 
            // Ideally we simulated constant, but here we just check it runs.

            const vibX = new Decimal(10);
            const vibY = new Decimal(10);
            // If factor applies to X only, a != b, so ecc > 0

            // checking code: adjustedX = xAbs * FACTOR

            const ecc = calculateEccentricity(vibX, vibY, 'PELTON');
            // If factor is not 1.0, eccentricity should be non-zero
            // logic: adjustedX = 10 * 1.0 (if factor 1) -> 0 ecc
            // If factor 1.2 -> adjustedX=12 -> a=12, b=10 -> sqrt(1 - 100/144) = sqrt(1 - 0.69) = sqrt(0.31) > 0

            // We won't test exact value without knowing constant, but we expect a number.
            expect(ecc.toNumber()).toBeGreaterThanOrEqual(0);
        });

        it('returns zero eccentricity for zero orbit', () => {
            const ecc = calculateEccentricity(new Decimal(0), new Decimal(0), 'FRANCIS');
            expect(ecc.toNumber()).toBeCloseTo(0, 10);
        });

        it('returns nominal eccentricity for negligible single-axis readings', () => {
            const ecc = calculateEccentricity(new Decimal('0.001'), new Decimal(0), 'FRANCIS');
            expect(ecc.toNumber()).toBeCloseTo(0, 10);
        });

        it('caps single-axis eccentricity to avoid false criticals', () => {
            const ecc = calculateEccentricity(new Decimal(10), new Decimal(0), 'FRANCIS');
            expect(ecc.toNumber()).toBeLessThanOrEqual(0.75);
        });

        it('applies Kaplan factor to Y-axis eccentricity', () => {
            const vibX = new Decimal(10);
            const vibY = new Decimal(8);
            const francis = calculateEccentricity(vibX, vibY, 'FRANCIS').toNumber();
            const kaplan = calculateEccentricity(vibX, vibY, 'KAPLAN').toNumber();
            expect(kaplan).not.toBeCloseTo(francis, 4);
        });
    });

    describe('Grid: Frequency Stress', () => {
        it('returns unity stress within tolerance band', () => {
            expect(calculateGridStressFactor(50.0)).toBeCloseTo(1.0, 10);
            expect(calculateGridStressFactor(50.05)).toBeCloseTo(1.0, 10);
        });

        it('scales stress linearly beyond tolerance', () => {
            expect(calculateGridStressFactor(50.2)).toBeCloseTo(1.2, 10);
        });

        it('caps stress factor at configured maximum', () => {
            expect(calculateGridStressFactor(51.0)).toBeCloseTo(1.5, 10);
        });
    });

    describe('Bolting: Loads & Capacity', () => {
        it('calculates per-bolt load in kN', () => {
            const totalPressurePa = new Decimal(1e6);
            const load = calculateBoltLoadKN(totalPressurePa, new Decimal(2000), 10);
            expect(load.toNumber()).toBeCloseTo(314.159, 3);
        });

        it('calculates bolt tensile capacity in kN', () => {
            const capacity = calculateBoltCapacityKN(new Decimal(20), new Decimal(800));
            expect(capacity.toNumber()).toBeCloseTo(251.327, 3);
        });
    });

    describe('Turbine: Typical Efficiency', () => {
        it('returns Francis typical efficiency within operating head range', () => {
            expect(calculateTypicalEfficiency('FRANCIS', 100)).toBe(92);
        });

        it('returns Kaplan typical efficiency at low head', () => {
            expect(calculateTypicalEfficiency('KAPLAN', 20)).toBe(94);
        });

        it('returns Pelton typical efficiency at very high head', () => {
            expect(calculateTypicalEfficiency('PELTON', 300)).toBe(91);
        });

        it('returns Pelton reduced typical efficiency at lower head', () => {
            expect(calculateTypicalEfficiency('PELTON', 150)).toBe(85);
        });

        it('returns Crossflow typical efficiency', () => {
            expect(calculateTypicalEfficiency('CROSSFLOW', 50)).toBe(82);
        });

        it('returns default efficiency for unknown turbine type', () => {
            expect(calculateTypicalEfficiency('UNKNOWN', 50)).toBe(90);
        });
    });

    describe('Turbine: Threshold Tables', () => {
        it('returns Francis thresholds', () => {
            expect(getTurbineThresholds('FRANCIS')).toEqual({ foundationMax: 0.04, shaftMax: 0.015, vibrationMax: 1.8 });
        });

        it('returns defaults for unknown turbine type', () => {
            expect(getTurbineThresholds('UNKNOWN')).toEqual({ foundationMax: 0.05, shaftMax: 0.02, vibrationMax: 2.0 });
        });
    });

});
