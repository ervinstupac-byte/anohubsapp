/**
 * AdaptiveGovernor.ts
 * 
 * IEEE Std 125-2007 Compliant Governor PID
 * Dynamic Gain Scheduling (Kp, Ki, Kd) for different modes.
 * Handles frequency regulation and servo positioning.
 */

export type GovernorMode = 'STARTUP' | 'SYNC_SPEED' | 'ON_GRID' | 'ISLAND' | 'LOAD_REJECTION';

export interface PIDGains {
    Kp: number;
    Ki: number;
    Kd: number;
}

export class AdaptiveGovernor {

    /**
     * GET GAINS FOR MODE
     * Returns scheduled PID gains based on operating context.
     */
    public static getGains(mode: GovernorMode, headPU: number = 1.0): PIDGains {
        let baseGains: PIDGains = { Kp: 3.0, Ki: 0.5, Kd: 0.1 };

        switch (mode) {
            case 'STARTUP':
                // Gentle control, low integral
                baseGains = { Kp: 2.0, Ki: 0.1, Kd: 0.5 };
                break;
            case 'SYNC_SPEED':
                // Precise speed hold
                baseGains = { Kp: 4.0, Ki: 0.8, Kd: 0.2 };
                break;
            case 'ON_GRID':
                // Low droop, follow load setpoint (mostly proportional)
                // Assuming droop implemented via feedback, gains act on error
                baseGains = { Kp: 5.0, Ki: 2.0, Kd: 0.0 };
                break;
            case 'ISLAND':
                // High response for frequency control
                baseGains = { Kp: 6.0, Ki: 3.0, Kd: 1.0 };
                break;
            case 'LOAD_REJECTION':
                // Defense mechanism - not standard PID usually
                // High derivative to catch acceleration?
                baseGains = { Kp: 10.0, Ki: 0.0, Kd: 5.0 };
                break;
        }

        // Adaptive: Scale gains by Head
        // High head = more power per stroke = needs LOWER gains to avoid instability
        // Gains ~ 1/Head
        const adaptiveFactor = 1.0 / Math.max(0.5, headPU);

        return {
            Kp: baseGains.Kp * adaptiveFactor,
            Ki: baseGains.Ki * adaptiveFactor,
            Kd: baseGains.Kd * adaptiveFactor
        };
    }

    /**
     * COMPUTE PID OUTPUT (Simulated)
     */
    public static computeControlSignal(
        error: number,
        gains: PIDGains,
        dt: number
    ): number {
        // Simplified for simulation
        // In real system: maintain state (integral sum, prev error)
        const p = error * gains.Kp;
        const i = (error * dt) * gains.Ki; // Instant accumulation
        const d = (error / dt) * gains.Kd; // Instant slope
        return p + i + d;
    }
}
