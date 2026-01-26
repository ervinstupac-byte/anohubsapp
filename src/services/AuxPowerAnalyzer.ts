/**
 * AuxPowerAnalyzer.ts
 * 
 * Station Auxiliary Power Monitor (AC/DC)
 * Tracks Battery Autonomy and Essential Bus Health.
 */

export interface AuxPowerStatus {
    acBusVoltage: number;
    dcBusVoltage: number;
    batteryCurrentAmps: number; // Positive = Charging, Negative = Discharging
    batterySoC: number; // %
    autonomyTimeHours: number; // Estimated time remaining on battery
    status: 'HEALTHY' | 'ON_BATTERY' | 'CRITICAL_LOW';
}

export class AuxPowerAnalyzer {
    private static readonly BATTERY_CAPACITY_AH = 500; // 500Ah Bank

    public static analyze(
        acVoltage: number, // 400V system
        dcVoltage: number, // 110V/220V system
        batteryCurrent: number,
        socPct: number
    ): AuxPowerStatus {

        // 1. Status Determination
        let status: AuxPowerStatus['status'] = 'HEALTHY';
        if (acVoltage < 350) {
            // AC Loss - presumably running on battery if DC is ok
            status = 'ON_BATTERY';
        }
        if (dcVoltage < 100) { // Assuming 110V DC nominal
            status = 'CRITICAL_LOW';
        }

        // 2. Autonomy Calculation
        let autonomyHours = 999;
        if (batteryCurrent < -1) { // Discharging (> 1A noise threshold)
            const dischargeAmps = Math.abs(batteryCurrent);
            const remainingAh = (socPct / 100) * this.BATTERY_CAPACITY_AH;

            // Peukert's Law could be applied, but linear approx fine for SCADA overview
            autonomyHours = remainingAh / dischargeAmps;
        }

        return {
            acBusVoltage: acVoltage,
            dcBusVoltage: dcVoltage,
            batteryCurrentAmps: batteryCurrent,
            batterySoC: socPct,
            autonomyTimeHours: autonomyHours,
            status
        };
    }
}
