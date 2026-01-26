/**
 * OxygenSaturator.ts
 * 
 * Dissolved Oxygen (DO) Controller
 * Monitors tailrace oxygen levels to ensure environmental compliance.
 * Triggers air injection (aeration) or draft tube admission if DO drops.
 */

export interface WaterQuality {
    timestamp: number;
    doLevelMgL: number; // Dissolved Oxygen (mg/L)
    tempC: number;
    complianceStatus: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
    aerationActive: boolean;
}

export class OxygenSaturator {
    private static readonly DO_LIMIT_LOW = 5.0; // mg/L minimum
    private static readonly DO_WARNING = 5.5;

    /**
     * MONITOR & CONTROL OXYGEN
     */
    public static monitor(
        doSensorValue: number, // mg/L
        waterTempC: number
    ): WaterQuality {
        const now = Date.now();
        let aerationActive = false;

        let complianceStatus: WaterQuality['complianceStatus'] = 'COMPLIANT';

        // Control Logic
        if (doSensorValue < this.DO_LIMIT_LOW) {
            complianceStatus = 'VIOLATION';
            aerationActive = true; // Trigger air injection
            console.warn(`[Eco] 🐟 DO VIOLATION: ${doSensorValue.toFixed(2)} mg/L < 5.0. Injecting Air.`);
        } else if (doSensorValue < this.DO_WARNING) {
            complianceStatus = 'WARNING';
            // Pre-emptive aeration if trending down? Simple threshold for now.
            aerationActive = true;
        }

        // Saturation Calculation (just for reference)
        // saturation ~ 14.6 at 0C, down to ~7 at 35C.
        // % Saturation = Measured / Saturation_Table(Temp)
        // Not strictly needed for compliance check but good context.

        return {
            timestamp: now,
            doLevelMgL: doSensorValue,
            tempC: waterTempC,
            complianceStatus,
            aerationActive
        };
    }
}
