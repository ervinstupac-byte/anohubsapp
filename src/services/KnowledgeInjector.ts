/**
 * KnowledgeInjector Service
 * Injects static expert knowledge into dynamic diagnostic context
 */

import expertData from '../data/ExpertKnowledgeBase.json';
import { HealthScore } from '../types/diagnostics';

interface InsightResult {
    augmentedHealth: HealthScore;
    financialLossEUR: number;
    expertDiagnosis: string | null;
    expertAction: string | null;
    pdfSummary: { bs: string; de: string; en: string } | null;
}

export const injectExpertInsights = (
    currentHealth: HealthScore,
    currentFlowM3S: number,
    currentHeadM: number = 152,
    frontClearanceMM: number = 0.35 // Default safe
): InsightResult => {
    // Clone health to avoid mutation
    const health = JSON.parse(JSON.stringify(currentHealth));
    let expertDiagnosis: string | null = null;
    let expertAction: string | null = null;
    let pdfSummary = null;

    // 1. CAVITATION MATRIX CHECK
    const { ratedFlowM3S } = expertData.engineeringParameters;

    // Check Part Load
    if (currentFlowM3S < 0.35 * ratedFlowM3S) {
        // MATCH: Part Load Vortex
        expertDiagnosis = expertData.cavitationMatrix.zones[0].diagnosis;
        expertAction = expertData.cavitationMatrix.zones[0].action;

        // Impact Health
        health.breakdown.hydraulic = Math.min(health.breakdown.hydraulic, 55);
        health.overall = Math.min(health.overall, 65);
    }

    // 2. PRECISION ACTION PLAN (Clearance)
    const rule = expertData.precisionRules.labyrinths;
    if (frontClearanceMM > rule.criticalThresholdMM) {
        expertDiagnosis = rule.diagnosis;
        expertAction = rule.action; // "HITNO: Provjera..."

        // Impact Health
        health.breakdown.mechanical = Math.min(health.breakdown.mechanical, 45);
        health.overall = Math.min(health.overall, 60);

        // Trigger PDF Warning
        pdfSummary = expertData.pdfTemplates.executiveSummary;
    }

    // 3. FINANCIAL LOSS CALCULATOR
    // Logic: If Health < 80%, calculate loss
    // Formula from JSON: ( (100 - score) / 100 ) * 0.05 * Power * Price
    // Note: The formula in JSON implies that 0 health = 5% total power loss? 
    // Let's interpret user request: "Ako HealthScore padne na 80%, izračunaj gubitak na 249MW koristeći cijenu od 150 EUR/MWh."

    let financialLossEUR = 0;
    if (health.overall < 80) {
        const { ratedPowerMW } = expertData.engineeringParameters;
        const price = expertData.financialLogic.baseEnergyPriceEUR; // 150

        // User didn't specify exact physics formula, but in JSON I put a linear approx model.
        // Let's use a simple model: Efficiency loss % = (100 - Health) / 10
        // E.g. 70 health = 3% efficiency loss.
        // Loss = RatedPower * (EffLoss/100) * Price

        const efficiencyLossPercent = (100 - health.overall) / 10; // e.g. 20 / 10 = 2%
        financialLossEUR = ratedPowerMW * (efficiencyLossPercent / 100) * price;
    }

    return {
        augmentedHealth: health,
        financialLossEUR,
        expertDiagnosis,
        expertAction,
        pdfSummary
    };
};
