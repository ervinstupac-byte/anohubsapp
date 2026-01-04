import { TechnicalProjectState } from '../models/TechnicalSchema';
import masterKnowledge from '../knowledge/MasterKnowledgeMap.json';
import maintenanceSop from '../knowledge/MaintenanceSOP.json';
import { StructuralIntegrityService } from './StructuralIntegrityService';
import { SolutionArchitect, RecoveryPath } from './SolutionArchitect';

export interface InferenceResult {
    conclusions: {
        id: string;
        symptom: string;
        probableCauses: string[];
        remedies: string[];
        reasoning: string;
        kbReference: string;
        recommendedAction?: string; // Actionable Intelligence
        sopCode?: string;
    }[];
    alerts: {
        standard: string;
        parameter: string;
        severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
        reasoning: string;
        recommendedAction?: string; // Actionable Intelligence
        sopCode?: string;
    }[];
    metrics: {
        structuralSafetyMargin: number; // Barlow's Margin (%)
        extendedLifeYears?: number;
    };
    recoveryPaths: RecoveryPath[]; // NEW: NC-4.2
}

export const ExpertInference = {
    /**
     * Cross-references the TechnicalState with the Master Knowledge Map.
     */
    analyze: (state: TechnicalProjectState): InferenceResult => {
        const result: InferenceResult = {
            conclusions: [],
            alerts: [],
            metrics: {
                structuralSafetyMargin: 0
            },
            recoveryPaths: []
        };

        // 1. Live Structural Integrity Check (Barlow's Link)
        const structuralAudit = StructuralIntegrityService.audit(state);
        result.metrics.structuralSafetyMargin = structuralAudit.margin;

        if (structuralAudit.status !== 'NORMAL') {
            result.alerts.push({
                standard: 'NC-4.2 Structural',
                parameter: 'Spiral Casing Stress',
                severity: structuralAudit.status,
                reasoning: `STRUCTURAL RISK: Safety margin is ${structuralAudit.margin.toFixed(1)}%. Hoop stress (${structuralAudit.currentPressure.toFixed(1)} Bar) vs Limit (${structuralAudit.mawp.toFixed(1)} Bar).`,
                recommendedAction: (maintenanceSop.sops as any).STRUCTURAL_RISK.action,
                sopCode: 'STRUCTURAL_RISK'
            });
        }

        // 2. Standards Evaluation (ISO, Megger, Barlow)
        const standards = masterKnowledge.standardThresholds;

        // Vibration (ISO 10816-3)
        const vib = state.mechanical.vibration;
        if (vib > standards.vibration.unsatisfactory) {
            result.alerts.push({
                standard: standards.vibration.standard,
                parameter: 'Vibration',
                severity: 'CRITICAL',
                reasoning: `Measured vibration of ${vib} mm/s exceeds the ${standards.vibration.standard} critical limit of ${standards.vibration.unsatisfactory} mm/s for large machines.`,
                recommendedAction: maintenanceSop.sops.VIBRATION_CRITICAL.action,
                sopCode: 'VIBRATION_CRITICAL'
            });
        }

        // Bearing Temperature & Relative Overheating
        const bTemp = state.mechanical.bearingTemp;
        const ambient = state.identity.environmentalBaseline?.ambientTemperature || 25;
        const relativeRise = bTemp - ambient;

        if (bTemp > standards.bearingTemperature.critical) {
            result.alerts.push({
                standard: 'Industrial Standard',
                parameter: 'Bearing Temp',
                severity: 'CRITICAL',
                reasoning: `Bearing temperature reached ${bTemp}°C, exceeding the safe critical shutdown threshold of ${standards.bearingTemperature.critical}°C. Relative rise above ambient is ${relativeRise.toFixed(1)}°C.`,
                recommendedAction: maintenanceSop.sops.BEARING_TEMP_CRITICAL.action,
                sopCode: 'BEARING_TEMP_CRITICAL'
            });
        } else if (relativeRise > 40) {
            result.alerts.push({
                standard: 'Relative Delta Standard',
                parameter: 'Bearing Rise',
                severity: 'WARNING',
                reasoning: `Abnormal thermal rise detected. Bearing is ${relativeRise.toFixed(1)}°C above ambient (${ambient}°C). Even if below absolute limits, this indicates a lubrication or friction issue.`
            });
        }

        // 3. Failure Mode Detection (Cavitation, Aeration, PID)
        const failureModes = (masterKnowledge as any).failureModes;

        // Cavitation Check
        const designPower = state.site.designPerformanceMW || 5.0;
        const designFlow = state.site.designFlow || 3.0;
        const designSWC = (designFlow * 3600) / (designPower * 1000);
        const actualSWC = state.physics.specificWaterConsumption || 0;

        if (actualSWC > designSWC * 1.1) {
            result.conclusions.push({
                id: 'CAV-001',
                symptom: failureModes.CAVITATION.symptom,
                probableCauses: failureModes.CAVITATION.probableCauses || ["Runner wear", "Low head"],
                remedies: ["Adjust setpoint", "Check draft tube"],
                reasoning: `DIAGNOSIS: Potential Cavitation. REASONING: Specific Water Consumption (${actualSWC.toFixed(2)}) is > 10% above design baseline.`,
                kbReference: failureModes.CAVITATION.kbRef,
                recommendedAction: maintenanceSop.sops.CAVITATION_INFERRED.action,
                sopCode: 'CAVITATION_INFERRED'
            });
        }

        // 4. Recovery Architect (NC-4.2)
        const activeSops = [...result.alerts, ...result.conclusions]
            .map(item => item.sopCode)
            .filter(Boolean) as string[];

        result.recoveryPaths = activeSops.map(sopCode =>
            SolutionArchitect.getRecoveryPath(sopCode, state)
        ).filter(path => path.actions.length > 0);

        // 5. Total Extended Life (NC-4.2 Persistent)
        const totalExtendedLife = SolutionArchitect.calculateTotalExtendedLife(state);
        (result.metrics as any).extendedLifeYears = totalExtendedLife;

        return result;
    }
};

/**
 * Utility to extract parameter value from nested TechnicalProjectState
 */
function getParamValue(state: any, path: string): number | undefined {
    if (path === 'vibration') return state.mechanical.vibration;
    if (path === 'efficiency') return state.hydraulic.efficiency * 100;
    if (path === 'bearingTemp') return state.mechanical.bearingTemp;
    // ... expansion for other params
    return undefined;
}
