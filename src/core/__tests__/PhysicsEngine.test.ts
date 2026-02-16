import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../PhysicsEngine';

describe('PhysicsEngine Legacy Logic Tests', () => {

    describe('checkGreaseRisk', () => {
        it('should return null for normal operation', () => {
            const result = PhysicsEngine.checkGreaseRisk('RUNNING', 5);
            expect(result).toBeNull();
        });

        it('should return null for standby with low cycles', () => {
            const result = PhysicsEngine.checkGreaseRisk('STBY', 10);
            expect(result).toBeNull();
        });

        it('should flag CRITICAL risk for excessive standby cycles', () => {
            const result = PhysicsEngine.checkGreaseRisk('STBY', 25);
            expect(result).toEqual({
                id: "LEGACY #3",
                risk: "CRITICAL",
                message: "Excessive Grease (25 cycles). Seal blowout risk!",
                preventionValueEur: 45000
            });
        });

        it('should flag CRITICAL risk for excessive stopped cycles', () => {
            const result = PhysicsEngine.checkGreaseRisk('STOPPED', 22);
            expect(result).not.toBeNull();
            expect(result?.risk).toBe("CRITICAL");
        });
    });

    describe('checkThermalInertia', () => {
        it('should return null for insufficient data', () => {
            expect(PhysicsEngine.checkThermalInertia([50], [1000])).toBeNull();
        });

        it('should return null for slow temperature rise', () => {
            const history = [50, 51]; // 1 degree rise
            const timestamps = [1000, 61000]; // 1 minute gap
            expect(PhysicsEngine.checkThermalInertia(history, timestamps)).toBeNull();
        });

        it('should flag EMERGENCY risk for rapid temperature rise', () => {
            const history = [50, 55]; // 5 degree rise
            const timestamps = [1000, 61000]; // 1 minute gap
            // Rate = 5 deg / 1 min = 5.0 > 2.0 limit
            const result = PhysicsEngine.checkThermalInertia(history, timestamps);
            
            expect(result).not.toBeNull();
            expect(result?.risk).toBe("EMERGENCY");
            expect(result?.message).toContain("Rate: 5.0");
        });

        it('should handle millisecond timestamps correctly', () => {
            const history = [60, 63]; // 3 deg rise
            const timestamps = [0, 30000]; // 30 seconds (0.5 min)
            // Rate = 3 / 0.5 = 6.0 > 2.0 limit
            const result = PhysicsEngine.checkThermalInertia(history, timestamps);
            expect(result?.risk).toBe("EMERGENCY");
        });
    });

    describe('calculatePeltonExpansion', () => {
        it('should calculate correct expansion for steel shaft', () => {
            // Shaft 5m, Delta T 25 deg (45 - 20)
            // Expansion = 5000mm * 12e-6 * 25 = 1.5mm
            const result = PhysicsEngine.calculatePeltonExpansion(5.0, 20, 45);
            
            expect(result.deltaT).toBe(25);
            expect(result.expansionMm).toBe(1.5);
            expect(result.requiredColdOffsetMm).toBe(-1.5);
        });

        it('should handle zero temperature delta', () => {
            const result = PhysicsEngine.calculatePeltonExpansion(10.0, 20, 20);
            expect(result.expansionMm).toBe(0);
            expect(result.requiredColdOffsetMm).toBe(-0); // Signed zero is fine
        });
    });

    describe('validateManufacturerBid', () => {
        it('should accept plausible efficiency for Francis', () => {
            const result = PhysicsEngine.validateManufacturerBid(94.5, 'FRANCIS');
            expect(result.verdict).toBe("PLAUSIBLE");
        });

        it('should flag marketing lie for impossible Pelton efficiency', () => {
            const result = PhysicsEngine.validateManufacturerBid(94.0, 'PELTON'); // Limit 92.5
            expect(result.verdict).toBe("MARKETING_LIE");
            expect(result.physicsLimit).toBe(92.5);
        });

        it('should handle complex turbine type strings', () => {
            const result = PhysicsEngine.validateManufacturerBid(99.0, 'KAPLAN_VERTICAL');
            expect(result.verdict).toBe("MARKETING_LIE");
            expect(result.physicsLimit).toBe(95.5);
        });
    });
});
