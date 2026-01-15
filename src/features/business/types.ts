/**
 * STRICT TYPING FOR FINANCIAL MODULE
 * Defines the contract for inputs and outputs of the revenue calculation engine.
 */

export type CurrencyCode = 'EUR' | 'USD' | 'BAM';

export interface MarketParameters {
    energyPricePerMWh: number; // e.g. 85.0
    currency: CurrencyCode;
}

export interface TechnicalPerformance {
    currentActivePowerMW: number;
    designRatedPowerMW: number;
    currentEfficiencyPercent: number; // 0-100 or 0-1 (we'll standardize on 0-100)
    isTurbineRunning: boolean;
}

export interface FinancialInput {
    market: MarketParameters;
    technical: TechnicalPerformance;
}

export interface FinancialOutput {
    revenueLossPerHour: number;
    currentRevenuePerHour: number;
    potentialRevenuePerHour: number;
    efficiencyLossPercent: number;
    isCritical: boolean; // Loss > Threshold
    calculationTimestamp: string;
}

export const FINANCIAL_THRESHOLDS = {
    CRITICAL_LOSS_EUR_HR: 50.0,
    WARNING_loss_EUR_HR: 20.0
};
