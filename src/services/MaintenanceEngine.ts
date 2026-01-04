import MaintenanceSOP from '../knowledge/MaintenanceSOP.json';

export interface ActionStep {
    step: number;
    description: string;
}

export interface SOPMapping {
    failureMode: string;
    action: string;
    steps: ActionStep[];
    kbRef: string;
}

/**
 * PROACTIVE MAINTENANCE ENGINE
 * Maps diagnostic findings to step-by-step SOPs.
 */
export const MaintenanceEngine = {
    /**
     * Returns detailed SOP steps for a given finding code or symptom
     */
    getSOP: (code: string): SOPMapping | null => {
        // In a real app, this would query a larger KB
        // For now, we enhance the basic SOPs with steps
        const sops: Record<string, any> = {
            'VIBRATION_CRITICAL': {
                steps: [
                    { step: 1, description: "Verify sensor mounting and cable integrity." },
                    { step: 2, description: "Check foundation bolts for looseness (torque audit)." },
                    { step: 3, description: "Perform shaft alignment check (laser or dial indicator)." },
                    { step: 4, description: "Inspect runner for cavitation pitting or debris." }
                ]
            },
            'BEARING_TEMP_CRITICAL': {
                steps: [
                    { step: 1, description: "Check oil level and color (foaming/discoloration)." },
                    { step: 2, description: "Verify cooling water flow and delta-T." },
                    { step: 3, description: "Inspect oil filter for metallic particles." },
                    { step: 4, description: "Check bearing clearances vs design spec." }
                ]
            },
            'STRUCTURAL_RISK': {
                steps: [
                    { step: 1, description: "Reduce unit load to 50% immediately." },
                    { step: 2, description: "Perform visual inspection of spiral casing welds." },
                    { step: 3, description: "Execute ultrasonic thickness gauging at high-stress zones." },
                    { step: 4, description: "Verify pressure transducer calibration." }
                ]
            }
        };

        const baseSop = (MaintenanceSOP.sops as any)[code];
        if (!baseSop) return null;

        return {
            failureMode: code,
            action: baseSop.action,
            kbRef: baseSop.kbRef,
            steps: sops[code]?.steps || []
        };
    }
};
