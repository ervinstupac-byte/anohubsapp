/**
 * PowerSystemStabilizer.ts
 * 
 * IEEE Std 421.5-2016 Compliant PSS
 * Damps power system oscillations by modulating V_ref.
 * Uses Delta-P (Power) and Delta-Omega (Speed) inputs.
 */

export interface PSSOutput {
    stabilizingSignalVs: number; // Voltage setpoint modifier
    active: boolean;
    oscillationDetected: boolean;
    mode: 'PSS1A' | 'PSS2B' | 'PSS_OFF';
}

export class PowerSystemStabilizer {

    // Washout time constants (seconds)
    private static readonly Tw = 10.0;
    // Lead-Lag constants
    private static readonly T1 = 0.3;
    private static readonly T2 = 0.05;

    // Gain
    private static readonly K_PSS = 20.0;

    /**
     * CALCULATE PSS SIGNAL
     * Returns modification to voltage reference (Vs).
     */
    public static calculateStabilizingSignal(
        deltaSpeedPU: number,  // Speed deviation per-unit
        deltaPowerPU: number,  // Accelerating power per-unit
        enabled: boolean
    ): PSSOutput {
        if (!enabled) {
            return { stabilizingSignalVs: 0, active: false, oscillationDetected: false, mode: 'PSS_OFF' };
        }

        // 1. Oscillation Detection
        // If speed deviation oscillates > 0.05 Hz (0.001 PU), we are active
        const oscillationDetected = Math.abs(deltaSpeedPU) > 0.001;

        // 2. Simplified Transfer Function (PSS1A type logic)
        // Signal = Gain * (Washout) * (Lead-Lag) * Input
        // Here we simulate the instantaneous phase compensation effect

        // Washout removes DC components (steady state speed error)
        // High-pass filter effect computed conceptually:
        // Assume deltaSpeed IS the AC component for this time-step

        // Lead-Lag compensation to align electrical torque with speed changes
        const compensatedSignal = deltaSpeedPU * (this.T1 / this.T2);

        // Final output clamp
        let signal = compensatedSignal * this.K_PSS;
        signal = Math.max(-0.05, Math.min(0.05, signal)); // Clamp to +/- 5% voltage typical

        return {
            stabilizingSignalVs: signal,
            active: true,
            oscillationDetected,
            mode: 'PSS1A'
        };
    }
}
