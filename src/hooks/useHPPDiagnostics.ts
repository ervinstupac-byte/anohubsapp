/**
 * useHPPDiagnostics Hook
 * Advanced Expert System for HPP Diagnostics
 * Integrates ProjectContext with ExpertDiagnosisEngine and Physics Rules
 */

import { useMemo } from 'react';
import { useProjectEngine } from '../contexts/ProjectContext';
import { ExpertDiagnosisEngine } from '../services/ExpertDiagnosisEngine';
import { injectExpertInsights } from '../services/KnowledgeInjector';
// import { calculateFinancialRisk } from '../components/dashboard/FinancialRiskTicker'; // Removed in favor of KnowledgeInjector
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
            assetIdentity.fluidIntelligence.oilSystem.oilType === 'MINERAL_ISO_VG_46' ? 'OIL' : 'GREASE',
            50, // Rotor weight default
            technicalState.assetIdentity?.operationalMapping?.currentPoint?.flowM3S ?? 0, // Pass Live Flow
            technicalState.assetIdentity?.operationalMapping?.currentPoint?.headM ?? 0, // Pass Live Head
            50.0 // Grid Frequency (Default to 50, could be live if available)
        );

        let health = ExpertDiagnosisEngine.calculateHealthScore(baseDiagnostics);
        let likelyCause = "System Optimal";
        let symptoms: string[] = [];

        // 2. INJECT EXPERT INSIGHTS (The Final Layer)
        // Replaces manual logic with Knowledge Base rules
        const insights = injectExpertInsights(
            health,
            assetIdentity.operationalMapping.currentPoint?.flowM3S || assetIdentity.machineConfig.ratedFlowM3S,
            assetIdentity.operationalMapping.currentPoint?.headM || assetIdentity.machineConfig.ratedHeadM,
            assetIdentity.francisAdvanced?.frontRunnerClearanceMM || 0.35
        );

        // Apply Insights
        if (insights.expertDiagnosis) {
            likelyCause = insights.expertDiagnosis;
            if (insights.expertAction) {
                symptoms.push(insights.expertAction);
            }
        }

        // Use Augmented Health
        health = insights.augmentedHealth;

        // 3. Financial Risk from Expert Engine
        const riskCalculation = {
            totalRevenueAtRisk: Math.round(insights.financialLossEUR * 24),
            breakdown: {
                downtime: 0,
                efficiency: Math.round(insights.financialLossEUR * 24),
                emergency: 0
            },
            criticalFindings: aiDiagnosis.findings.filter(f => f.severity === 'CRITICAL').length,
            daysToAction: 15
        };

        return {
            health,
            riskCalculation,
            likelyCause,
            symptoms,
            isCavitationRisk: likelyCause?.includes('kavitacije') ?? false,
            baseDiagnostics
        };
    }, [technicalState]);

    return diagnostics;
};
