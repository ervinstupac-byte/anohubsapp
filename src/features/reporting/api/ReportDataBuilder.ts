import { TechnicalProjectState } from '../../../core/TechnicalSchema';

/**
 * Report Data Builder
 * 
 * Prepares and structures data for PDF reports.
 * Pure data transformation layer - no rendering logic.
 */

export interface ReportData {
    projectID: string;
    generationDate: string;
    assetName: string;
    turbineType: string;
    healthScore: number;
    riskLevel: string;
    financialMetrics: FinancialMetrics;
    technicalMetrics: TechnicalMetrics;
    maintenanceMetrics: MaintenanceMetrics;
}

export interface FinancialMetrics {
    lostRevenueEuro: number;
    maintenanceBufferEuro: number;
    annualRevenueLoss: number;
}

export interface TechnicalMetrics {
    vibration: { value: number; verdict: string };
    bearingTemp: { value: number; verdict: string };
    insulation: { value: number; verdict: string };
    axialPlay: { value: number; verdict: string };
}

export interface MaintenanceMetrics {
    urgencyLevel: number; // 1-5
    urgencyText: string;
    hoursRemaining: number;
    countdownPercent: number;
}

export const ReportDataBuilder = {
    /**
     * Builds comprehensive report data from technical state
     */
    buildReportData: (state: TechnicalProjectState, projectID: string = 'ANOHUB-2025-X'): ReportData => {
        return {
            projectID,
            generationDate: new Date().toLocaleDateString('de-DE'),
            assetName: state.identity?.assetName || 'UNIT_X',
            turbineType: state.identity?.turbineType || 'FRANCIS',
            healthScore: ReportDataBuilder.calculateHealthScore(state),
            riskLevel: state.riskScore > 50 ? 'CRITICAL' : state.riskScore > 25 ? 'WARNING' : 'NOMINAL',
            financialMetrics: ReportDataBuilder.buildFinancialMetrics(state),
            technicalMetrics: ReportDataBuilder.buildTechnicalMetrics(state),
            maintenanceMetrics: ReportDataBuilder.buildMaintenanceMetrics(state)
        };
    },

    /**
     * Calculate asset health score (NC-4.2 weighted average)
     */
    calculateHealthScore: (state: TechnicalProjectState): number => {
        const hydraulicWeight = 0.4;
        const mechanicalWeight = 0.3;
        const efficiencyWeight = 0.3;

        return (
            (state.hydraulic.efficiency * 100 * efficiencyWeight) +
            ((100 - state.riskScore) * mechanicalWeight) +
            (95 * hydraulicWeight) // Nominal hydraulic baseline
        );
    },

    /**
     * Build financial metrics from state
     */
    buildFinancialMetrics: (state: TechnicalProjectState): FinancialMetrics => {
        const annualProductionGWh = 45;
        const pricePerMWh = 85;
        const efficiencyDrop = 1.2;
        const annualRevenueLoss = (annualProductionGWh * 1000) * pricePerMWh * (efficiencyDrop / 100);

        return {
            lostRevenueEuro: state.financials?.lostRevenueEuro || 0,
            maintenanceBufferEuro: state.financials?.maintenanceBufferEuro || 0,
            annualRevenueLoss
        };
    },

    /**
     * Build technical metrics with verdicts
     */
    buildTechnicalMetrics: (state: TechnicalProjectState): TechnicalMetrics => {
        return {
            vibration: {
                value: state.mechanical.vibration,
                verdict: 'Good' // Will be calculated by PhysicsEngine in the renderer
            },
            bearingTemp: {
                value: state.mechanical.bearingTemp,
                verdict: 'Normal'
            },
            insulation: {
                value: state.mechanical.insulationResistance || 500,
                verdict: 'Healthy'
            },
            axialPlay: {
                value: state.mechanical.axialPlay || 0,
                verdict: 'Nominal'
            }
        };
    },

    /**
     * Build maintenance metrics
     */
    buildMaintenanceMetrics: (state: TechnicalProjectState): MaintenanceMetrics => {
        const urgencyLevel: number = 1; // Will be calculated by PhysicsEngine
        const hoursSinceOverhaul = state.identity?.hoursSinceLastOverhaul || 0;
        const serviceThreshold = 8000;
        const hoursRemaining = Math.max(0, serviceThreshold - hoursSinceOverhaul);
        const countdownPercent = Math.min(100, (hoursSinceOverhaul / serviceThreshold) * 100);

        const urgencyText = urgencyLevel === 5 ? 'IMMEDIATE INTERVENTION REQUIRED' :
            urgencyLevel === 4 ? 'SCHEDULE REVISION IMMEDIATELY' :
                urgencyLevel === 3 ? 'MONITOR CLOSELY - DEGRADATION DETECTED' :
                    'System operating within nominal parameters';

        return {
            urgencyLevel,
            urgencyText,
            hoursRemaining,
            countdownPercent
        };
    }
};
