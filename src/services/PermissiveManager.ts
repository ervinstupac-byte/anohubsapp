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
    public static checkPermissives(
        // Inputs
        governorOilPressureBar: number,
        lubeOilPressureBar: number,
        brakesReleased: boolean,
        mivBypassBalanced: boolean, // Main Inlet Valve Bypass
        generatorCoolingFlowLps: number,
        manualLockoutActive: boolean
    ): PermissiveState {

        const checks: Record<string, boolean> = {
            'GOV_OIL_PRESSURE_OK': governorOilPressureBar > 40,
            'LUBE_OIL_PRESSURE_OK': lubeOilPressureBar > 1.5,
            'BRAKES_RELEASED': brakesReleased,
            'MIV_BYPASS_BALANCED': mivBypassBalanced,
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
