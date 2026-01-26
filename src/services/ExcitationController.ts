/**
 * ExcitationController.ts
 * 
 * Automatic Voltage Regulator (AVR) & Thyristor Bridge Controller
 * Manages generator terminal voltage and reactive power flow.
 * Controls the field current (If) via thyristor firing angles.
 */

export interface ExcitationState {
    mode: 'AUTO_VOLTAGE' | 'MANUAL_FIELD' | 'VAR_CONTROL' | 'PF_CONTROL';
    terminalVoltageKV: number;
    fieldCurrentAmps: number;
    fieldVoltageVolts: number;
    setpointKV: number;
    thyristorFiringAngle: number; // Degrees (alpha)
    bridgeStatus: 'HEALTHY' | 'PULSE_MISSING' | 'OVERTEMP';
}

export class ExcitationController {

    /**
     * CALCULATE THYRISTOR FIRING ANGLE
     * Determines alpha based on required Field Voltage.
     * V_field = 1.35 * V_source * cos(alpha)
     */
    public static calculateFiringAngle(
        targetFieldVoltage: number,
        sourceVoltageRMS: number
    ): number {
        // Vdc = (3 * sqrt(2) / pi) * Vrms * cos(alpha) ≈ 1.35 * Vrms * cos(alpha)
        const maxVdc = 1.35 * sourceVoltageRMS;

        // Clamp target
        const safeTarget = Math.max(0, Math.min(maxVdc, targetFieldVoltage));

        // alpha = acos(V_target / V_max)
        const cosAlpha = safeTarget / maxVdc;
        const alphaRad = Math.acos(cosAlpha);

        return (alphaRad * 180) / Math.PI; // Degrees
    }

    /**
     * AVR MAIN LOOP
     * Calculates required Field Voltage to maintain Terminal Voltage Setpoint.
     * Uses a PI controller simulation.
     */
    public static runAVR(
        measuredVoltageKV: number,
        setpointKV: number,
        currentFieldVolts: number
    ): { nextFieldVolts: number; error: number } {
        const error = setpointKV - measuredVoltageKV;

        // Simplified PI Gains
        const Kp = 500; // High gain for voltage
        const Ki = 10;

        // Proportional term
        const pTerm = error * Kp;

        // Integral term would need state retention, assumed integrated externally or simple bias
        // For static calculation:
        const nextFieldVolts = currentFieldVolts + pTerm;

        // Clamp to physical limits (e.g. 0-400V)
        return {
            nextFieldVolts: Math.max(0, Math.min(400, nextFieldVolts)),
            error
        };
    }

    /**
     * CHECK THYRISTOR BRIDGE HEALTH
     * Monitors ripple to detect missed pulses.
     */
    public static checkBridgeHealth(
        rippleFreqHz: number,
        gridFreqHz: number,
        bridgeTempC: number
    ): ExcitationState['bridgeStatus'] {
        // 6-pulse bridge should have ripple at 6 * gridFreq (e.g., 300Hz for 50Hz grid)
        const expectedRipple = gridFreqHz * 6;

        if (Math.abs(rippleFreqHz - expectedRipple) > 20) {
            // If ripple drops to grid freq or other harmonic -> missed pulse
            return 'PULSE_MISSING';
        }

        if (bridgeTempC > 85) {
            return 'OVERTEMP';
        }

        return 'HEALTHY';
    }
}
