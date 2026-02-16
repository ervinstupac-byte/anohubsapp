/**
 * HPUManager.ts
 * 
 * Hydraulic Power Unit (HPU) Manager
 * Monitors accumulator energy, nitrogen pre-charge, and pump health.
 * Calculates "Available Maneuver Energy" based on adiabatic expansion.
 */

export interface HPUStatus {
    pressureBar: number;
    mainPumpStatus: 'OFF' | 'RUNNING';
    standbyPumpStatus: 'OFF' | 'RUNNING';
    oilLevelPct: number;
    oilTempC: number;
    nitrogenPreChargeBar: number;
    availableEnergyJoules: number;
    availableFullStrokes: number; // How many full close/open cycles possible?
    pumpDutyCycle: number; // % runtime per hour
}

export class HPUManager {
    // Accumulator Specs (Example)
    private static readonly ACCUMULATOR_VOLUME_L = 1000;
    private static readonly PRE_CHARGE_BAR = 90; // Nitrogen pressure
    private static readonly RATED_PRESSURE_BAR = 160;
    private static readonly SERVO_VOLUME_L = 150; // Liters for one full stroke

    /**
     * MONITOR HPU HEALTH
     */
    public static monitorHPU(
        currentPressureBar: number,
        oilLevelPct: number,
        oilTempC: number,
        pump1Running: boolean,
        pump2Running: boolean
    ): HPUStatus {

        // 1. Calculate Stored Energy (Adiabatic Expansion)
        // E = (P0 * V0) / (gamma - 1) * [1 - (P_pre / P_curr)^((gamma-1)/gamma)] -- complicated
        // Simplified Isothermal for SCADA (P1*V1 = P2*V2):
        // Usable volume = V_tank * (1 - P_pre / P_cur)

        // Let's use a robust approximation:
        // Volume of oil currently stored vs Nitrogen
        // V_gas = V_total * (P_pre / P_curr)  (Boyle's Law P1V1=P2V2)
        // V_oil = V_total - V_gas

        const vGas = this.ACCUMULATOR_VOLUME_L * (this.PRE_CHARGE_BAR / Math.max(this.PRE_CHARGE_BAR, currentPressureBar));
        const vOil = this.ACCUMULATOR_VOLUME_L - vGas;

        // Energy in terms of "Work" = P * dV roughly
        // Better metric: How many strokes?
        // Usable oil volume until pressure drops to P_min_lockout (e.g. 110 bar)
        const pMinLockout = 110;
        const vGasAtLockout = this.ACCUMULATOR_VOLUME_L * (this.PRE_CHARGE_BAR / pMinLockout);
        const vOilAtLockout = this.ACCUMULATOR_VOLUME_L - vGasAtLockout;

        const usableOilL = Math.max(0, vOil - vOilAtLockout);
        const availableFullStrokes = usableOilL / this.SERVO_VOLUME_L;

        // Energy (Joules) roughly 0.5 * V_usable * (P_curr + P_min)
        const avgPressurePa = ((currentPressureBar + pMinLockout) / 2) * 100000;
        const usableVolumeM3 = usableOilL / 1000;
        const availableEnergyJoules = avgPressurePa * usableVolumeM3;

        return {
            pressureBar: currentPressureBar,
            mainPumpStatus: pump1Running ? 'RUNNING' : 'OFF',
            standbyPumpStatus: pump2Running ? 'RUNNING' : 'OFF',
            oilLevelPct,
            oilTempC,
            nitrogenPreChargeBar: this.PRE_CHARGE_BAR, // Assumed constant unless monitored
            availableEnergyJoules,
            availableFullStrokes,
            pumpDutyCycle: 15 // Simulated duty cycle (15%)
        };
    }
}
