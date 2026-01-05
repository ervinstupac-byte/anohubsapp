import { describe, it, expect } from 'vitest';
import { HydraulicIntegrity } from '../services/HydraulicIntegrity';
import { SentinelKernel } from '../services/SentinelKernel';

describe('Infrastructure Logic (Infrastructure Genesis)', () => {

    it('should calculate Darcy-Weisbach net head accurately', () => {
        const result = HydraulicIntegrity.calculateNetHead({
            grossHead: 100,
            flow: 5.0,
            pipeLength: 500,
            diameter_mm: 1200,
            roughness_ks: 0.045
        });

        expect(result.netHead).toBeLessThan(100);
        expect(result.netHead).toBeGreaterThan(90);
        expect(result.velocity).toBeCloseTo(4.42, 1);
    });

    it('should detect marketing lies in turbine bids', () => {
        const lie = HydraulicIntegrity.validateBidEfficiency(98.5, 'FRANCIS');
        expect(lie.verdict).toBe('IMPOSSIBLE');

        const plausible = HydraulicIntegrity.validateBidEfficiency(94.0, 'FRANCIS');
        expect(plausible.verdict).toBe('PLAUSIBLE');
    });

    it('should detect thermal inertia in bearings', () => {
        const temps = [55, 56, 58, 62];
        const times = [1000, 2000, 3000, 4000]; // ms, 1s gaps

        // Rate is (62-58) / (1000/60000) = 4 / 0.0166 = 240 deg/min
        const alert = SentinelKernel.checkThermalInertia(temps, times);
        expect(alert.risk).toBe('EMERGENCY');
    });

    it('should calculate magnetic unbalance deltaT', () => {
        const temps = [55, 56, 75, 54, 55, 56]; // Hotspot at 75
        const alert = SentinelKernel.checkMagneticUnbalance(temps, 450);
        expect(alert.risk).toBe('CRITICAL');
        expect(alert.deltaT).toBe(21);
    });
});
