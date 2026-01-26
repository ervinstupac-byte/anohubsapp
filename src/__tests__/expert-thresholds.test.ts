
import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../core/PhysicsEngine';
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../core/TechnicalSchema';

describe('Expert Threshold Logic Verification', () => {
    it('should classify vibration correctly', () => {
        expect(PhysicsEngine.getVibrationVerdict(0.5)).toBe('Good');
        expect(PhysicsEngine.getVibrationVerdict(1.5)).toBe('Satisfactory');
        expect(PhysicsEngine.getVibrationVerdict(3.5)).toBe('Unsatisfactory');
        expect(PhysicsEngine.getVibrationVerdict(5.0)).toBe('Unacceptable');
    });

    it('should classify bearing temperature correctly', () => {
        expect(PhysicsEngine.getBearingTempVerdict(45)).toBe('Normal');
        expect(PhysicsEngine.getBearingTempVerdict(70)).toBe('Warning');
        expect(PhysicsEngine.getBearingTempVerdict(85)).toBe('Critical');
    });

    it('should classify insulation correctly', () => {
        expect(PhysicsEngine.getInsulationVerdict(500, 0.4)).toBe('Healthy');
        expect(PhysicsEngine.getInsulationVerdict(10, 0.4)).toBe('Degraded'); // > 1.4 and <= 100
        expect(PhysicsEngine.getInsulationVerdict(1.2, 0.4)).toBe('Critical'); // < 1.4
    });

    it('should calculate maintenance urgency level correctly', () => {
        const nominalState: TechnicalProjectState = {
            ...DEFAULT_TECHNICAL_STATE,
            mechanical: {
                ...DEFAULT_TECHNICAL_STATE.mechanical,
                vibration: 0.5,
                bearingTemp: 45,
                insulationResistance: 800
            },
            identity: {
                ...DEFAULT_TECHNICAL_STATE.identity,
                hoursSinceLastOverhaul: 1000,
                startStopCount: 50
            }
        };

        expect(PhysicsEngine.calculateMaintenanceUrgency(nominalState)).toBe(1);

        const criticalVibState: TechnicalProjectState = {
            ...nominalState,
            mechanical: {
                ...nominalState.mechanical,
                vibration: 5.0
            }
        };
        expect(PhysicsEngine.calculateMaintenanceUrgency(criticalVibState)).toBe(5);

        const warningTempState: TechnicalProjectState = {
            ...nominalState,
            mechanical: {
                ...nominalState.mechanical,
                bearingTemp: 70
            }
        };
        expect(PhysicsEngine.calculateMaintenanceUrgency(warningTempState)).toBe(3);

        const overhaulDueState: TechnicalProjectState = {
            ...nominalState,
            identity: {
                ...nominalState.identity,
                hoursSinceLastOverhaul: 21000
            }
        };
        expect(PhysicsEngine.calculateMaintenanceUrgency(overhaulDueState)).toBe(4);
    });
});
