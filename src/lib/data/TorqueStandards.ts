
/**
 * NC-13000: Torque Specification Registry
 * Centralized database for sovereign mechanical tightening standards.
 * 
 * "The bolt that is not tightened to spec is a bolt that will fail."
 * - Legacy Field Manual
 */

export interface TorqueSpec {
    id: string;
    size: string;
    component: string;
    torqueNm: number;
    tolerancePercent: number;
    lubricated: boolean;
    pattern: 'STAR' | 'CROSS' | 'CIRCULAR';
    grade: string;
}

export const TORQUE_STANDARDS: Record<string, TorqueSpec> = {
    // FOUNDATION ANCHOR BOLTS
    // Source: GeneratorDetailView.tsx (Vault Audit)
    'ANCHOR_M36': {
        id: 'ANCHOR_M36',
        size: 'M36',
        component: 'Foundation Anchor Bolts',
        torqueNm: 1850,
        tolerancePercent: 5,
        lubricated: true,
        pattern: 'STAR',
        grade: '8.8'
    },

    // HEAD COVER BOLTS
    // Source: RunnerDetailView.tsx (Vault Audit)
    'HEAD_COVER_M24': {
        id: 'HEAD_COVER_M24',
        size: 'M24',
        component: 'Front Head Cover',
        torqueNm: 980,
        tolerancePercent: 5,
        lubricated: true,
        pattern: 'STAR',
        grade: '8.8'
    }
};

/**
 * Validates if an applied torque is within the sovereign standard.
 * @param specId The ID of the torque standard (e.g., 'ANCHOR_M36')
 * @param appliedNm The actual torque applied in the field
 * @returns Validation result with deviation
 */
export const validateTorque = (specId: string, appliedNm: number) => {
    const standard = TORQUE_STANDARDS[specId];
    if (!standard) {
        throw new Error(`Unknown Torque Standard: ${specId}`);
    }

    const min = standard.torqueNm * (1 - standard.tolerancePercent / 100);
    const max = standard.torqueNm * (1 + standard.tolerancePercent / 100);
    const isValid = appliedNm >= min && appliedNm <= max;
    const deviation = appliedNm - standard.torqueNm;

    return {
        isValid,
        standard: standard.torqueNm,
        applied: appliedNm,
        deviation,
        deviationPercent: (deviation / standard.torqueNm) * 100,
        message: isValid 
            ? 'TORQUE VERIFIED' 
            : `TORQUE VIOLATION: ${appliedNm}Nm (Target: ${standard.torqueNm}Nm)`
    };
};
