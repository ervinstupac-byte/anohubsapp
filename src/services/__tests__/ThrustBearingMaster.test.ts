import { describe, it, expect } from 'vitest';
import ThrustBearingMaster from '../ThrustBearingMaster';

describe('ThrustBearingMaster', () => {
    it('calculates film thickness and triggers lubrication crisis/trip thresholds', () => {
        const t = new ThrustBearingMaster();
        // High axial load, low viscosity, high rpm -> tiny film
        const m = {
            timestamp: new Date().toISOString(),
            axialLoadN: 5e6, // 5 MN
            oilViscosityPas: 0.001, // thin oil
            shaftSpeedRpm: 3000,
            padTempsC: [60, 61, 59, 60],
            padAreaM2: 0.02,
            radiusM: 0.2
        } as any;

        const action = t.addMeasurement(m);
        // expect either LUBRICATION_CRISIS or SOVEREIGN_TRIP depending on calculation
        expect(['LUBRICATION_CRISIS', 'SOVEREIGN_TRIP']).toContain(action.action);
    });

    it('detects mechanical misalignment via pad temp std dev', () => {
        const t = new ThrustBearingMaster();
        const m = {
            timestamp: new Date().toISOString(),
            axialLoadN: 1e3, // much lower load so film thickness not critical
            oilViscosityPas: 0.01,
            shaftSpeedRpm: 500,
            padTempsC: [40, 70, 39, 41], // high std dev
            padAreaM2: 0.05,
            radiusM: 0.35
        } as any;

        const action = t.addMeasurement(m);
        expect(action.action).toBe('MECHANICAL_MISALIGNMENT');
    });
});
