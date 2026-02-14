/**
 * useHPPDiagnostics Hook
 * Advanced Expert System for HPP Diagnostics
 * Integrates ProjectContext with ExpertDiagnosisEngine and Physics Rules
 */

import { useMemo } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { ExpertDiagnosisEngine } from '../features/physics-core/ExpertDiagnosisEngine';
import { injectExpertInsights } from '../services/KnowledgeInjector';
// import { calculateFinancialRisk } from '../components/dashboard/FinancialRiskTicker'; // Removed in favor of KnowledgeInjector
import { AIFinding } from '../types/aiFinding';
import { HealthScore } from '../types/diagnostics';

// Physics Constants for Cavitation
const GRAVITY = 9.81;
export const THOMA_SIGMA_CRITICAL = 0.12; // Typical for high specific speed Francis

export const useHPPDiagnostics = () => {
    const { identity, site, hydraulic } = useTelemetryStore();

    const diagnostics = useMemo(() => {
        if (!identity) return null;

        const liveFlow = hydraulic.flow ?? 0;
        const liveHead = hydraulic.head ?? 0;

        // 1. Run Base Expert Diagnosis
        const baseDiagnostics = ExpertDiagnosisEngine.runDiagnostics(
            identity,
            site.temperature,
            identity.fluidIntelligence.oilSystem.oilType === 'MINERAL_ISO_VG_46' ? 'OIL' : 'GREASE',
            50, // Rotor weight default
            liveFlow, // Pass Live Flow
            liveHead, // Pass Live Head
            50.0 // Grid Frequency (Default to 50, could be live if available)
        );

        let health = ExpertDiagnosisEngine.calculateHealthScore(baseDiagnostics);
        let likelyCause = "System Optimal";
        let symptoms: string[] = [];

        // 2. INJECT EXPERT INSIGHTS (The Final Layer)
        // Replaces manual logic with Knowledge Base rules
        const insights = injectExpertInsights(
            health,
            liveFlow || identity.machineConfig.ratedFlowM3S,
            liveHead || identity.machineConfig.ratedHeadM,
            identity.specializedAdvanced?.frontRunnerClearanceMM || 0.35
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

        // Calculate Critical Findings from Base Diagnostics
        const criticalCount = [
            baseDiagnostics.thermalRisk,
            baseDiagnostics.gridRisk,
            baseDiagnostics.cavitationRisk,
            baseDiagnostics.jackingRisk
        ].filter(r => r?.severity === 'CRITICAL').length;

        // 3. Financial Risk from Expert Engine
        const riskCalculation = {
            totalRevenueAtRisk: Math.round(insights.financialLossEUR * 24),
            breakdown: {
                downtime: 0,
                efficiency: Math.round(insights.financialLossEUR * 24),
                emergency: 0
            },
            criticalFindings: criticalCount,
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
    }, [identity, site, hydraulic]);

    return diagnostics;
};
