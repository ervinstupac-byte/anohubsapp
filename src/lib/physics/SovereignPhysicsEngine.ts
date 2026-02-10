
/**
 * NC-13000: Sovereign Physics Engine
 * The central authority for mechanical and physical validation logic.
 * 
 * Enforces the "Sovereign Standards" discovered in the Vault Audit.
 */

export const SOVEREIGN_MECHANICAL_ALARM = 'SOVEREIGN_MECHANICAL_ALARM';

export const MECHANICAL_TOLERANCES = {
    ALIGNMENT_MM_M: 0.05,       // 0.05 mm/m
    WEARING_GAP_MIN_MM: 0.3,    // 0.3 mm
    WEARING_GAP_MAX_MM: 0.5,    // 0.5 mm
    SURFACE_FINISH_RA_UM: 6.3   // Ra < 6.3 μm
};

export interface MechanicalValidationResult {
    isValid: boolean;
    alarms: string[];
    details: string[];
}

/**
 * Validates mechanical telemetry against Sovereign Standards.
 * 
 * @param alignmentMmM Current alignment deviation in mm/m
 * @param wearingGapMm Current wearing ring gap in mm
 * @param surfaceFinishRa Current surface roughness in μm (if available)
 * @returns MechanicalValidationResult
 */
export const validateMechanicalState = (
    alignmentMmM: number,
    wearingGapMm: number,
    surfaceFinishRa?: number
): MechanicalValidationResult => {
    const alarms: string[] = [];
    const details: string[] = [];
    let isValid = true;

    // 1. ALIGNMENT CHECK
    if (Math.abs(alignmentMmM) > MECHANICAL_TOLERANCES.ALIGNMENT_MM_M) {
        isValid = false;
        alarms.push(SOVEREIGN_MECHANICAL_ALARM);
        details.push(`ALIGNMENT CRITICAL: ${alignmentMmM} mm/m exceeds limit (${MECHANICAL_TOLERANCES.ALIGNMENT_MM_M} mm/m)`);
    } else {
        details.push(`Alignment Nominal: ${alignmentMmM} mm/m`);
    }

    // 2. WEARING GAP CHECK
    // Note: Gap too small = rubbing risk; Gap too large = efficiency loss
    if (wearingGapMm < MECHANICAL_TOLERANCES.WEARING_GAP_MIN_MM || 
        wearingGapMm > MECHANICAL_TOLERANCES.WEARING_GAP_MAX_MM) {
        isValid = false;
        alarms.push(SOVEREIGN_MECHANICAL_ALARM);
        details.push(`WEARING GAP DEVIATION: ${wearingGapMm} mm (Target: ${MECHANICAL_TOLERANCES.WEARING_GAP_MIN_MM}-${MECHANICAL_TOLERANCES.WEARING_GAP_MAX_MM} mm)`);
    } else {
        details.push(`Wearing Gap Nominal: ${wearingGapMm} mm`);
    }

    // 3. SURFACE FINISH CHECK (Optional / Forensic)
    if (surfaceFinishRa !== undefined) {
        if (surfaceFinishRa > MECHANICAL_TOLERANCES.SURFACE_FINISH_RA_UM) {
            // Note: Surface finish usually degrades over time, so this might not be an immediate alarm but a warning
            // For now, we strictly follow the user's "trigger alarm" instruction if "exceeds tolerances"
            isValid = false;
            alarms.push(SOVEREIGN_MECHANICAL_ALARM);
            details.push(`SURFACE DEGRADATION: Ra ${surfaceFinishRa} μm > ${MECHANICAL_TOLERANCES.SURFACE_FINISH_RA_UM} μm`);
        } else {
            details.push(`Surface Finish Nominal: Ra ${surfaceFinishRa} μm`);
        }
    }

    return {
        isValid,
        alarms: [...new Set(alarms)], // Unique alarms
        details
    };
};
