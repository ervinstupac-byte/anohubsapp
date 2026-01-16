import { DiagnosisReport } from '../models/TechnicalSchema';
import MaintenanceSOP from '../knowledge/MaintenanceSOP.json';

export interface ActionStep {
    step: number;
    description: string;
    critical?: boolean;
}

export interface SOPMapping {
    failureMode: string;
    action: string;
    steps: ActionStep[];
    kbRef: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * EXPERT MAINTENANCE ADVISOR
 * Orchestrates technical recovery procedures based on diagnostic findings.
 */

const DETAILED_KNOWLEDGE_BASE: Record<string, { steps: ActionStep[], priority: 'HIGH' | 'MEDIUM' | 'LOW' }> = {
    'VIBRATION_CRITICAL': {
        priority: 'HIGH',
        steps: [
            { step: 1, description: "EMERGENCY: Assess coupling bolts for shear indicators.", critical: true },
            { step: 2, description: "Check foundation anchor torque (Target: 1200Nm for M36).", critical: true },
            { step: 3, description: "Execute laser alignment audit on shaft coupling." },
            { step: 4, description: "Inspect runner for heavy pitting (Forensic: Check for metallic dust in draft tube)." }
        ]
    },
    'BEARING_TEMP_CRITICAL': {
        priority: 'HIGH',
        steps: [
            { step: 1, description: "Verify oil level and foaming status (Potential water ingress).", critical: true },
            { step: 2, description: "Check cooling water flow and Delta-T correlation.", critical: true },
            { step: 3, description: "Inspect oil filter for babbitt metal flakes (Indicates melting)." },
            { step: 4, description: "Audit bearing clearances using plastigauge if unit is stopped." }
        ]
    },
    'STRUCTURAL_RISK_HIGH': {
        priority: 'HIGH',
        steps: [
            { step: 1, description: "MANDATORY: Reduce load/pressure to 50% immediately.", critical: true },
            { step: 2, description: "Visual inspection of all spiral casing weld seams." },
            { step: 3, description: "Perform NDT (Non-Destructive Testing) at high-stress knuckles." },
            { step: 4, description: "Recalibrate pressure transducers to verify measurements." }
        ]
    },
    'CAVITATION_DANGER': {
        priority: 'MEDIUM',
        steps: [
            { step: 1, description: "Identify Vortex core frequency (use vibration spectrum)." },
            { step: 2, description: "Operate unit outside of critical flow zones (42.5m3/s range).", critical: true },
            { step: 3, description: "Check air admission system (Snifting valve) for blockage." }
        ]
    },
    'INSULATION_CRITICAL': {
        priority: 'HIGH',
        steps: [
            { step: 1, description: "Isolate unit from HV grid immediately.", critical: true },
            { step: 2, description: "Perform Megger test (Min acceptable: RatedKV + 1 MΩ)." },
            { step: 3, description: "Clean stator end-windings with approved solvent." },
            { step: 4, description: "Verify heater operation in pit to reduce moisture." }
        ]
    }
};

export const MaintenanceEngine = {
    /**
     * Maps diagnostic report codes to detailed, prioritized SOPs
     */
    generateActionPlan: (report: DiagnosisReport): SOPMapping[] => {
        const plan: SOPMapping[] = [];

        // Process all codes from the report
        report.messages.forEach(msg => {
            const baseSop = (MaintenanceSOP.sops as any)[msg.code];
            const details = DETAILED_KNOWLEDGE_BASE[msg.code];

            if (baseSop) {
                plan.push({
                    failureMode: msg.code,
                    action: baseSop.action,
                    kbRef: baseSop.kbRef,
                    priority: details?.priority || (report.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM'),
                    steps: details?.steps || []
                });
            }
        });

        // Priority Sorting: Critical first
        return plan.sort((a, b) => {
            const weights = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return weights[b.priority] - weights[a.priority];
        });
    },

    /**
     * Retrieves a single SOP by its code
     */
    getSOP: (code: string): SOPMapping | null => {
        const baseSop = (MaintenanceSOP.sops as any)[code];
        const details = DETAILED_KNOWLEDGE_BASE[code];

        if (baseSop) {
            return {
                failureMode: code,
                action: baseSop.action,
                kbRef: baseSop.kbRef,
                priority: details?.priority || 'MEDIUM',
                steps: details?.steps || []
            };
        }
        return null;
    }
};
