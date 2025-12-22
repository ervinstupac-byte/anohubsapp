/**
 * useHPPDiagnostics Hook
 * Advanced Expert System for HPP Diagnostics
 * Integrates ProjectContext with ExpertDiagnosisEngine and Physics Rules
 */

import { useMemo } from 'react';
import { useProjectEngine } from '../contexts/ProjectContext';
import { ExpertDiagnosisEngine } from '../services/ExpertDiagnosisEngine';
import { calculateFinancialRisk } from '../components/dashboard/FinancialRiskTicker'; // Reusing the logic
import { AIFinding } from '../types/aiFinding';
import { HealthScore } from '../types/diagnostics';

// Physics Constants for Cavitation
const GRAVITY = 9.81;
export const THOMA_SIGMA_CRITICAL = 0.12; // Typical for high specific speed Francis

export const useHPPDiagnostics = () => {
    const { technicalState } = useProjectEngine();
    const { assetIdentity, financials, aiDiagnosis } = technicalState;

    const diagnostics = useMemo(() => {
        if (!assetIdentity) return null;

        // 1. Run Base Expert Diagnosis
        const baseDiagnostics = ExpertDiagnosisEngine.runDiagnostics(
            assetIdentity,
            technicalState.site.temperature,
            assetIdentity.fluidIntelligence.oilSystem.oilType === 'MINERAL_ISO_VG_46' ? 'OIL' : 'GREASE', // Simplified
            50 // Rotor weight default
        );

        let health = ExpertDiagnosisEngine.calculateHealthScore(baseDiagnostics);
        let likelyCause = "System Optimal";
        let symptoms: string[] = [];

        // 2. PRECISE PHYSICS CHECK: Cavitation Risk
        // User Metric: Head_Pres (152m) vs Flow Rate
        const currentHead = assetIdentity.operationalMapping.currentPoint?.headM
            || assetIdentity.machineConfig.ratedHeadM;
        const currentFlow = assetIdentity.operationalMapping.currentPoint?.flowM3S
            || assetIdentity.machineConfig.ratedFlowM3S;

        const ratedHead = assetIdentity.machineConfig.ratedHeadM;

        // Rule: Low Head + High Flow = Cavitation Risk
        // If Head is < 90% of Rated but Flow is > 90% of Rated -> High Velocity, Low Pressure areas
        const isCavitationRisk = (currentHead < ratedHead * 0.9) && (currentFlow > assetIdentity.machineConfig.ratedFlowM3S * 0.9);

        if (isCavitationRisk) {
            health.overall = Math.min(health.overall, 75);
            health.breakdown.hydraulic = Math.min(health.breakdown.hydraulic, 60);
            likelyCause = "Rizik kavitacije na kašikama (Low Head / High Flow)";
            symptoms.push("Moguća kavitaciona erozija");

            // Add as AI Finding if not exists
            // (Note: In a real reducer we would dispatch this, here we likely just derive it for display)
        }

        // 3. MECHANICAL TOLERANCE CHECK: Clearances
        // User Rule: If frontClearance > 0.45mm -> Health < 70%
        if (assetIdentity.francisAdvanced) {
            const frontClearance = assetIdentity.francisAdvanced.frontRunnerClearanceMM;
            const backClearance = assetIdentity.francisAdvanced.backRunnerClearanceMM;

            if (frontClearance > 0.45) {
                // FORCE HEALTH DOWNGRADE
                health.overall = Math.min(health.overall, 68); // Below 70% as requested
                health.breakdown.mechanical = Math.min(health.breakdown.mechanical, 50);
                likelyCause = `Excessive Labyrinth Clearance (${frontClearance.toFixed(2)}mm)`;
                symptoms.push("Efficiency Loss detected", "Hydraulic Instability");
            }
        }

        // 4. Update Financial Risk Calculation
        // Now using actual Rated Power from config
        const riskCalculation = calculateFinancialRisk(
            health.overall,
            aiDiagnosis.findings.filter(f => f.severity === 'CRITICAL').length,
            financials.electricityPriceEURperMWh,
            assetIdentity.machineConfig.ratedPowerMW
        );

        return {
            health,
            riskCalculation,
            likelyCause,
            symptoms,
            isCavitationRisk,
            baseDiagnostics
        };
    }, [technicalState]);

    return diagnostics;
};
