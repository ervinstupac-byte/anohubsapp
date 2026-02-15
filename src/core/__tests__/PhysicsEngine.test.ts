import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../PhysicsEngine';
import Decimal from 'decimal.js';

describe('PhysicsEngine Legacy Logic Port', () => {
    describe('checkGreaseRisk', () => {
        it('should return null for NOMINAL status', () => {
            const result = PhysicsEngine.checkGreaseRisk('NOMINAL', 100);
            expect(result).toBeNull();
        });

        it('should return risk for STOPPED status with high cycles', () => {
            const result = PhysicsEngine.checkGreaseRisk('STOPPED', 25);
            expect(result).toEqual({
                id: 'LEGACY #3',
                risk: 'CRITICAL',
                message: 'Excessive Grease (25 cycles). Seal blowout risk!',
                preventionValueEur: 45000
            });
        });

        it('should return null for STOPPED status with low cycles', () => {
            const result = PhysicsEngine.checkGreaseRisk('STOPPED', 10);
            expect(result).toBeNull();
        });
    });

    describe('checkThermalInertia', () => {
        it('should detect rapid heating (thermal shock)', () => {
            const history = [40, 42, 45, 50, 60]; // Rapid rise
            // Timestamps in milliseconds
            // 40->42: 1s, 42->45: 1s, 45->50: 1s, 50->60: 1s
            // Last step: 50 -> 60 degC in 1000ms (1s) = 10 deg/sec = 600 deg/min
            const timestamps = [0, 1000, 2000, 3000, 4000];
            const result = PhysicsEngine.checkThermalInertia(history, timestamps);
            
            expect(result).toEqual({
                id: 'LEGACY_THERMAL_INERTIA',
                risk: 'EMERGENCY',
                message: 'Rapid Compounding Heat detected! Rate: 600.0°C/min. SHAFT SEIZURE IMMINENT.',
                action: 'Enable Emergency AC/DC Oil Pump & Cooling Boost'
            });
        });

        it('should return null for stable temperature', () => {
            const history = [40, 40.1, 40.2, 40.1, 40];
            const timestamps = [0, 60000, 120000, 180000, 240000]; // 1 min intervals
            const result = PhysicsEngine.checkThermalInertia(history, timestamps);
            expect(result).toBeNull();
        });
    });

    describe('calculatePeltonExpansion', () => {
        it('should calculate expansion correctly', () => {
            // Shaft length 10m, ambient 20C, operating 60C
            // DeltaT = 40
            // Expansion = 10 * 1000 * 12e-6 * 40 = 4.8 mm
            const result = PhysicsEngine.calculatePeltonExpansion(10, 20, 60);
            expect(result).not.toBeNull();
            expect(result?.expansionMm).toBeCloseTo(4.8, 3);
            expect(result?.requiredColdOffsetMm).toBeCloseTo(-4.8, 3);
        });
    });

    describe('validateManufacturerBid', () => {
        it('should accept plausible bid for Francis turbine', () => {
            const result = PhysicsEngine.validateManufacturerBid(94.5, 'FRANCIS');
            expect(result.verdict).toBe('PLAUSIBLE');
            expect(result.physicsLimit).toBe(96.5);
        });

        it('should reject physically impossible bid', () => {
            const result = PhysicsEngine.validateManufacturerBid(99.9, 'FRANCIS');
            expect(result.verdict).toBe('MARKETING_LIE');
            expect(result.message).toContain('exceeds limit');
        });

        it('should handle different turbine types', () => {
            const result = PhysicsEngine.validateManufacturerBid(96.0, 'PELTON'); // Limit 92.5
            expect(result.verdict).toBe('MARKETING_LIE');
            expect(result.physicsLimit).toBe(92.5);
        });
    });
});
