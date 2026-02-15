import { useMemo } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAssetConfig } from '../contexts/AssetConfigContext';
import Decimal from 'decimal.js';

export interface FinancialYieldMetrics {
    currentRevenuePerHour: number;
    potentialRevenuePerHour: number;
    revenueLossPerHour: number;
    efficiencyLossPercent: number;
    isFinancialCritical: boolean;
    currency: string;
    energyPrice: number;
}

/**
 * useFinancialYield
 * 
 * Logic Shield: Translates technical telemetry (MW, Efficiency) into Business Metrics (USD/EUR).
 * Formula: Loss = (Design_MW - Actual_MW) * Energy_Price
 */
export const useFinancialYield = (): FinancialYieldMetrics => {
    const { physics, hydraulic } = useTelemetryStore();
    const { config } = useAssetConfig();

    // 1. Get Market Data (Mocked for POC, normally from MarketStore/API)
    const energyPrice = 85.0; // EUR/MWh
    const currency = '€';

    // 2. Technical Data from Stores
    // Safe fallback to 0 if data missing
    const currentPowerMW = physics.powerMW ||
        (hydraulic.flow * hydraulic.head * 9.81 * 0.9 * (hydraulic.efficiency || 0.9)) / 1000;

    const designPowerMW = config?.site?.designPerformanceMW || 10.0;

    // 3. Calculation Core
    const metrics = useMemo(() => {
        // Prevent negative loss if we are over-performing (unlikely but possible)
        const gapMW = Math.max(0, designPowerMW - currentPowerMW);

        const currentRevenue = currentPowerMW * energyPrice;
        const potentialRevenue = designPowerMW * energyPrice;
        const loss = gapMW * energyPrice;

        // Efficiency Loss % = (Loss / Potential) * 100
        const effLoss = potentialRevenue > 0 ? (loss / potentialRevenue) * 100 : 0;

        return {
            currentRevenuePerHour: Number(currentRevenue.toFixed(2)),
            potentialRevenuePerHour: Number(potentialRevenue.toFixed(2)),
            revenueLossPerHour: Number(loss.toFixed(2)),
            efficiencyLossPercent: Number(effLoss.toFixed(1)),
            // Critical if losing more than €50/hr
            isFinancialCritical: loss > 50,
            currency,
            energyPrice
        };
    }, [currentPowerMW, designPowerMW, energyPrice]);

    return metrics;
};
