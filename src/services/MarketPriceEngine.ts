import { TechnicalProjectState } from '../models/TechnicalSchema';

/**
 * MarketPriceEngine (CEREBRO Neural Expansion Phase 2)
 * 
 * Handles the economic valuation of power production vs asset wear.
 */
export class MarketPriceEngine {

    // Default Price: 85 EUR/MWh (can be overridden by techState.market.energyPrice)
    private static readonly BASE_PRICE = 85.0;

    /**
     * Calculates the profitability and daily revenue
     */
    static calculateMarketMetrics(state: TechnicalProjectState): { energyPrice: number; revenueToday: number; profitabilityIndex: number } {
        const currentPower = state.specializedState?.sensors?.activePowerMW || state.identity.machineConfig.ratedPowerMW ||
            (parseFloat(state.hydraulic.flowRate.toString()) * parseFloat(state.hydraulic.waterHead.toString()) * state.hydraulic.efficiency * 9.81 / 1000);

        const energyPrice = state.market?.energyPrice || MarketPriceEngine.BASE_PRICE;

        // Instantaneous Revenue Projection (normalized to arbitrary time slice for demo)
        const hourlyRevenue = currentPower * energyPrice;

        // Profitability vs. Wear Index
        // High revenue / Low wear = 1.0
        // Low revenue / High wear = 0.0
        const wearRate = state.structural?.wearIndex || 5;
        const normalizedWear = Math.max(0.1, wearRate / 100);

        // Logic: If operating during high price, we accept higher wear.
        // Index is higher if Price > Wear impact.
        const profitabilityIndex = Math.min(1.0, (hourlyRevenue / (hourlyRevenue + (normalizedWear * 5000))));

        return {
            energyPrice,
            revenueToday: (state.market?.revenueToday || 0) + (hourlyRevenue / 3600), // Incremental
            profitabilityIndex
        };
    }
}
