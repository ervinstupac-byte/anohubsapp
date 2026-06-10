import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';
import Decimal from 'decimal.js';
import { LearningModifiers } from './FeedbackIntelligence';
import { CrossCorrelationService } from './CrossCorrelationService';
import { ForensicDiagnosticService } from './ForensicDiagnosticService';

export interface FinancialContext {
    marketPriceEurPerMWh: number;
    maintenanceHourlyRate: number; // Cost of maintenance crew per hour
    replacementCost: number; // Cost of major component replacement
}

export interface StrategistOutput {
    netProfitRate: number; // EUR/hour
    molecularDebtRate: number; // "Wear" per hour expressed in future EUR
    profitHealthRatio: number; // The Golden Ratio for this machine
    recommendations: PrescriptiveAction[];
}

export interface PrescriptiveAction {
    action: string;
    impact: string;
    expectedSavings: number;
    confidence: number;
}

export class SovereignStrategist {

    /**
     * The Economic-Technical Bridge
     * 
     * Calculates the real-time financial velocity of the machine.
     * NP = (P_gen * M_price) - (W_rate * C_maint) - MolecularDebt
     */
    public static calculateBridge(
        telemetry: TelemetryStream,
        finance: FinancialContext,
        history: { accumulatedFatigue: number, recentVibration?: number[], recentTemperature?: number[] },
        learningModifiers?: LearningModifiers // NEW: NC-13.0
    ): StrategistOutput {

        // 1. Calculate Revenue Generation
        const powerMW = new Decimal(telemetry.hydraulic?.powerKW || 0).div(1000);
        const revenuePerHour = powerMW.mul(finance.marketPriceEurPerMWh);

        // 2. Calculate Molecular Debt (Real-time wear accumulation cost)
        // D_mol = Integral(DeltaV * K_cav * theta)
        // Simplified: Cavitation Intensity * Vibration Penalty * Component Cost Factor

        // Extract inputs
        const cavitation = new Decimal(telemetry.hydraulic?.cavitationThreshold || 0); // Assuming this maps to intensity in current schema usage
        const vibration = new Decimal(telemetry.mechanical?.vibration || 0);

        // K_cav coefficient (Cost multiplier for cavitation)
        const K_cav = new Decimal(50); // EUR per hour of high cavitation
        // Theta (Component criticality / replacement cost factor - scaled down for hourly rate)
        const theta = new Decimal(finance.replacementCost).div(8760 * 20); // Spread over 20 years

        // Molecular Debt Rate (EUR/h lost to life reduction)
        const vibrationPenalty = vibration.gt(2.5) ? vibration.mul(10) : new Decimal(0);
        const cavitationPenalty = cavitation.gt(0.8) ? cavitation.mul(K_cav) : new Decimal(0);

        const molecularDebtRate = vibrationPenalty.plus(cavitationPenalty).plus(theta);

        // 3. Maintenance Cost (Running Opex)
        const maintenanceCost = new Decimal(finance.maintenanceHourlyRate).mul(0.1); // Assumed 10% running allocation

        // 4. Net Profit Rate
        const netProfitRate = revenuePerHour.minus(maintenanceCost).minus(molecularDebtRate);

        // 5. Ratio
        // Ratio = Profit / (Wear + 1) to avoid div by zero
        const profitHealthRatio = netProfitRate.div(molecularDebtRate.plus(1));

        // 6. Cross-Correlation Check (CNS Integration)
        let synergyAlert = false;
        if (history.recentVibration && history.recentTemperature) {
            const synergy = CrossCorrelationService.detectSynergy(history.recentVibration, history.recentTemperature);
            if (synergy.correlated && synergy.r > 0.8) {
                synergyAlert = true;
            }
        }

        return {
            netProfitRate: netProfitRate.toNumber(),
            molecularDebtRate: molecularDebtRate.toNumber(),
            profitHealthRatio: profitHealthRatio.toNumber(),
            recommendations: this.generatePrescriptiveActions(revenuePerHour, molecularDebtRate, profitHealthRatio, learningModifiers, synergyAlert)
        };
    }

    private static generatePrescriptiveActions(
        revenue: Decimal,
        debt: Decimal,
        ratio: Decimal,
        modifiers?: LearningModifiers,
        synergyAlert: boolean = false
    ): PrescriptiveAction[] {
        const actions: PrescriptiveAction[] = [];
        const multiplier = new Decimal(modifiers?.thresholdMultiplier || 1.0);
        const penalty = modifiers?.confidencePenalty || 0;
        const threshold = new Decimal(10).mul(multiplier);

        // NC-14.0: Global Logic Binding (Correlation Veto)
        if (synergyAlert) {
            // NC-15.0: Autonomous RCA
            const diagnosis = ForensicDiagnosticService.diagnose('vibration');

            actions.push({
                action: 'Hold Load (Synergetic Anomaly)',
                impact: `CNS INTERLOCK: ${diagnosis.description}`,
                expectedSavings: 5000,
                confidence: 0.99
            });
        } else if (ratio.gt(threshold) && debt.lt(10)) {
            actions.push({
                action: 'Increase load by 2%',
                impact: 'Capture peak market price (Sovereign Mode)',
                expectedSavings: revenue.mul(0.02).toNumber(),
                confidence: 0.85 - penalty
            });
        }

        // High Wear Scenario
        if (debt.gt(50) && !synergyAlert) {
            actions.push({
                action: 'Reduce load by 5%',
                impact: 'Reduces vibration penalty significantly',
                expectedSavings: 1200,
                confidence: 0.95 - penalty
            });
        }

        return actions;
    }
}
