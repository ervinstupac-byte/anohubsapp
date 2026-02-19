/**
 * PermissiveManager.ts
 * 
 * Start permissive Logic
 * Ensures all auxiliary systems are healthy before allowing a unit start sequence.
 * Eliminates "Why won't it start?" ambiguity.
 */

export interface PermissiveState {
    readyToStart: boolean;
    missingConditions: string[];
    permissives: Record<string, boolean>;
}

export class PermissiveManager {

    /**
     * CHECK START PERMISSIVES
     */
    /**
     * CHECK START PERMISSIVES
     */
    public static checkPermissives(
        // Inputs
        hpuStatus: import('./HPUManager').HPUStatus,
        airStatus: import('./PneumaticSystemManager').AirSystemStatus,
        sumpStatus: import('./DewateringSovereign').SumpStatus,
        governorOilPressureBar: number, // Keep legacy or move to HPU if applicable
        generatorCoolingFlowLps: number,
        manualLockoutActive: boolean
    ): PermissiveState {

        const checks: Record<string, boolean> = {
            // HPU Checks
            'GOV_OIL_PRESSURE_OK': hpuStatus.pressureBar > 120, // Rated 160, min start 120
            'HPU_MAIN_PUMP_READY': hpuStatus.mainPumpStatus === 'RUNNING' || hpuStatus.availableEnergyJoules > 500000,
            'HPU_OIL_LEVEL_OK': hpuStatus.oilLevelPct > 40,

            // Pneumatic Checks
            'BRAKES_READY': airStatus.brakeReady,
            'AIR_PRESSURE_OK': airStatus.systemPressureBar > 6.0,

            // Sump/Flood Checks
            'STATION_NOT_FLOODED': sumpStatus.alarmStatus !== 'FLOOD_WARNING',
            'SUMP_LEVEL_OK': sumpStatus.levelPct < 80,

            // General
            'COOLING_FLOW_OK': generatorCoolingFlowLps > 50,
            'NO_LOCKOUT': !manualLockoutActive
        };

        const missing: string[] = [];
        let allOk = true;

        for (const [key, passed] of Object.entries(checks)) {
            if (!passed) {
                allOk = false;
                missing.push(key);
            }
        }

        return {
            readyToStart: allOk,
            missingConditions: missing,
            permissives: checks
        };
    }
}
