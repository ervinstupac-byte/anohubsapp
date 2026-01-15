
import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../features/physics-core/PhysicsEngine';
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../models/TechnicalSchema';
import Decimal from 'decimal.js';

describe('Physics Engine Precision Verification', () => {
    it('should calculate static pressure and hoop stress correctly', () => {
        const state: TechnicalProjectState = {
            ...DEFAULT_TECHNICAL_STATE,
            hydraulic: {
                ...DEFAULT_TECHNICAL_STATE.hydraulic,
                head: 150,
                flow: 30,
                efficiency: 92,
                waterHead: new Decimal(150),
                flowRate: new Decimal(30)
            },
            penstock: {
                ...DEFAULT_TECHNICAL_STATE.penstock,
                diameter: 1.5,
                wallThickness: 0.02,
                materialModulus: 210,
                materialYieldStrength: 250
            }
        };

        const result = PhysicsEngine.recalculateProjectPhysics(state);

        // Static Pressure: 150 / 10 = 15.00
        expect(result.physics.staticPressureBar).toBe(15.00);

        // Hoop Stress verification (Manual estimation)
        // Area = (1.5/2)^2 * PI = 0.5625 * PI = 1.767
        // Velocity = 30 / 1.767 = 16.97 m/s
        // Wave Vel = cca 1200 m/s
        // Surge Pres = 1000 * 1200 * 16.97 = 20.36 MPa = 203.6 Bar
        // Hoop Stress = (P_total * D) / (2 * t)
        expect(result.physics.hoopStressMPa).toBeGreaterThan(0);
        expect(result.lastRecalculation).toBeDefined();
    });

    it('should handle healthy state with 0 risk', () => {
        const state: TechnicalProjectState = {
            ...DEFAULT_TECHNICAL_STATE,
            penstock: {
                ...DEFAULT_TECHNICAL_STATE.penstock,
                materialYieldStrength: 1000 // Very strong
            }
        };

        const result = PhysicsEngine.recalculateProjectPhysics(state);
        expect(result.riskScore).toBe(0);
    });
});
