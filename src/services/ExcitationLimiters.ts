/**
 * ExcitationLimiters.ts
 * 
 * Protective Limiters for Generator Capability
 * - OEL: Over-Excitation Limiter (Rotor heating protection)
 * - UEL: Under-Excitation Limiter (Stator end-core heating / Stability)
 * - V/Hz: Volts-per-Hertz (Flux limiter / Core heating)
 */

export interface LimiterStatus {
    oelActive: boolean;
    uelActive: boolean;
    vHzActive: boolean;
    limitSignal: number; // Modifier to excitation
    alarm: string | null;
}

export class ExcitationLimiters {

    // Thresholds
    private static readonly MAX_FIELD_CURRENT = 1.05; // PU (continuous)
    private static readonly MAX_FIELD_CURRENT_TIME = 120; // Seconds allowed above 1.05
    private static readonly MIN_VAR_IMPORT = -0.4; // PU (leading)
    private static readonly MAX_V_HZ = 1.1; // PU

    /**
     * EVALUATE LIMITERS
     */
    public static checkLimiters(
        fieldCurrentPU: number,
        activePowerPU: number,
        reactivePowerPU: number, // Positive = Lagging (Export), Negative = Leading (Import)
        terminalVoltagePU: number,
        frequencyPU: number
    ): LimiterStatus {
        let limitSignal = 0;
        let alarm: string | null = null;

        // 1. OEL (Over-Excitation)
        // Inverse time characteristic usually, simplified here
        const oelActive = fieldCurrentPU > this.MAX_FIELD_CURRENT;
        if (oelActive) {
            alarm = 'PRE-ALARM: OEL APPROACHING';
            if (fieldCurrentPU > 1.2) {
                limitSignal = -0.1; // Reduce excitation
                alarm = 'LIMIT ACTIVE: OEL REDUCING FIELD';
            }
        }

        // 2. UEL (Under-Excitation)
        // P-Q curve boundary
        // Simple circular limit approximation or straight line for end-iron heating
        // Limit: Q > -0.4 (cannot be more negative than -0.4)
        const uelActive = reactivePowerPU < this.MIN_VAR_IMPORT;
        if (uelActive) {
            limitSignal = 0.1; // Increase excitation (boost voltage)
            alarm = 'LIMIT ACTIVE: UEL BOOSTING FIELD';
        } else if (reactivePowerPU < this.MIN_VAR_IMPORT + 0.05) {
            alarm = 'PRE-ALARM: UEL APPROACHING';
        }

        // 3. V/Hz (Volts per Hertz)
        // Flux protection
        const vHzRatio = terminalVoltagePU / frequencyPU;
        const vHzActive = vHzRatio > this.MAX_V_HZ;
        if (vHzActive) {
            limitSignal = -0.1; // Reduce voltage
            alarm = `LIMIT ACTIVE: V/Hz EXCEEDED (${vHzRatio.toFixed(2)})`;
        }

        return {
            oelActive,
            uelActive,
            vHzActive,
            limitSignal,
            alarm
        };
    }
}
