/**
 * PneumaticSystemManager.ts
 * 
 * Compressed Air Management System
 * Manages compressors, receivers, and braking logic.
 * Integrates with Governor/Braking sequence.
 */

export interface AirSystemStatus {
    systemPressureBar: number;
    compressorStatus: 'OFF' | 'RUNNING' | 'UNLOADED';
    brakeReady: boolean;
    brakeInhibitReason?: string;
}

export class PneumaticSystemManager {
    private static readonly MIN_BRAKE_PRESSURE = 6.0; // bar
    private static readonly START_PRESSURE = 25.0; // bar (for Governor air tank if pneumatic)
    // Assuming low pressure brakes (7 bar system) vs High pressure gov (40 bar) - let's stick to braking/service air

    public static monitorSystem(
        pressureBar: number,
        compressorRunning: boolean
    ): AirSystemStatus {
        return {
            systemPressureBar: pressureBar,
            compressorStatus: compressorRunning ? 'RUNNING' : 'OFF',
            brakeReady: pressureBar >= this.MIN_BRAKE_PRESSURE,
            brakeInhibitReason: pressureBar < this.MIN_BRAKE_PRESSURE
                ? `Low Air Pressure (${pressureBar.toFixed(1)} < ${this.MIN_BRAKE_PRESSURE} bar)`
                : undefined
        };
    }

    /**
     * EVALUATE BRAKE SEQUENCE
     * Called by Governor/Sequencer when stopping unit.
     */
    public static checkBrakePermissive(
        unitSpeedPct: number, // % of rated
        airStatus: AirSystemStatus
    ): { allowed: boolean; message: string } {

        // 1. Check Speed Window (typically < 30% or < 15% depending on pad type)
        const MAX_BRAKE_SPEED = 20; // %
        if (unitSpeedPct > MAX_BRAKE_SPEED) {
            return {
                allowed: false,
                message: `Speed too high for brakes (${unitSpeedPct.toFixed(1)}% > ${MAX_BRAKE_SPEED}%)`
            };
        }

        // 2. Check Air Pressure
        if (!airStatus.brakeReady) {
            return {
                allowed: false,
                message: airStatus.brakeInhibitReason || 'Air Pressure Low'
            };
        }

        return { allowed: true, message: 'Brakes Permitted' };
    }
}
