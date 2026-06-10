/**
 * ENERGY MERCHANT
 * The Profit Maximizer 💰📈
 * Balances Market Price vs. Asset Health.
 */

export interface MarketCondition {
    priceEurPerMwh: number;
    demandLevel: 'LOW' | 'MED' | 'HIGH';
    fcrPriceEurPerMw: number; // Frequency Containment Reserve (Standby Payment)
    carbonCreditPriceEur: number; // Price per ton of CO2 offset
    // Hard interlock flag supplied by TransformerOilGuardian / Master Intelligence
    transformerCritical?: boolean;
}

import GridStabilityGuardian, { GridState } from './GridStabilityGuardian';

export interface OperationalOrder {
    targetLoadPercent: number;
    reason: string;
    estimatedRevenueEur: number;
    mode: 'RUN' | 'STANDBY_FCR' | 'STOP';
}

export class EnergyMerchant {

    /**
     * GENERATE ORDER
     * Decides how hard to run the machines based on Energy vs FCR vs Carbon.
     */
    generateOrder(market: MarketCondition, waterClarityPercent: number, availableCapacityMW: number = 100, gridState?: GridState): OperationalOrder {
        // HARD-LOCK: If transformer guardian flagged critical audit, block high-ramp market bids.
        if (market.transformerCritical) {
            // Prioritize machine safety: prefer standby/stop over high-ramp operations.
            // If FCR pays reasonably, choose standby; otherwise stop.
            if (market.fcrPriceEurPerMw && market.fcrPriceEurPerMw > 5) {
                return {
                    targetLoadPercent: 0,
                    mode: 'STANDBY_FCR',
                    reason: 'HARD-LOCK: Transformer critical audit in progress — blocking market ramp bids.',
                    estimatedRevenueEur: market.fcrPriceEurPerMw * availableCapacityMW * 24
                };
            }
            return {
                targetLoadPercent: 0,
                mode: 'STOP',
                reason: 'HARD-LOCK: Transformer critical audit in progress — all high-ramp bids blocked.',
                estimatedRevenueEur: 0
            };
        }
        // Clarity < 80% means Sand is present
        const isSandy = waterClarityPercent < 80;

        // 1. Calculate Option A: RUN HARD (Energy Market)
        // Revenue = Price * Capacity * 24h
        const energyDailyRevenue = market.priceEurPerMwh * availableCapacityMW * 24;

        // 2. Calculate Option B: STANDBY (FCR Market)
        // Revenue = FCR Price * Capacity * 24h
        // Benefit: ZERO WEAR (Molecular Debt = 0)
        const fcrDailyRevenue = market.fcrPriceEurPerMw * availableCapacityMW * 24;

        // 3. Carbon Bonus (Only applies if running, assuming replacing coal)
        // 0.4 tons CO2 saved per MWh
        const carbonBonus = market.carbonCreditPriceEur * (availableCapacityMW * 24 * 0.4);

        const totalRunRevenue = energyDailyRevenue + carbonBonus;

        // DECISION LOGIC

        // Grid stability integration: if grid requests inertia or reactive support, prioritize ancillary services
        try {
            if (gridState) {
                const g = new GridStabilityGuardian();
                const inertia = g.assessInertia(gridState);
                const vcurve = g.computeVCurve(gridState.voltagePct);

                if (inertia.triggered) {
                    return {
                        targetLoadPercent: 0,
                        mode: 'STANDBY_FCR',
                        reason: `ANCILLARY_PRIORITY: Kinetic Kick requested (df/dt=${inertia.dfdt?.toFixed(3)}Hz/s). Prioritizing ancillary support.`,
                        estimatedRevenueEur: market.fcrPriceEurPerMw * availableCapacityMW * 24
                    };
                }

                if ((vcurve.reactiveSupportMVar || 0) > 1) {
                    return {
                        targetLoadPercent: 0,
                        mode: 'STANDBY_FCR',
                        reason: `ANCILLARY_PRIORITY: Reactive support required (${vcurve.reactiveSupportMVar} MVar). Prioritizing grid support.`,
                        estimatedRevenueEur: market.fcrPriceEurPerMw * availableCapacityMW * 24
                    };
                }
            }
        } catch (e) {
            // non-fatal: fall back to standard logic
        }

        // Scenario 1: FCR implies we get paid to do nothing.
        // If FCR > 80% of Run Revenue, we prefer FCR because it saves the machine.
        if (fcrDailyRevenue > (totalRunRevenue * 0.8)) {
            return {
                targetLoadPercent: 0,
                mode: 'STANDBY_FCR',
                reason: `FCR Market Premium (€${market.fcrPriceEurPerMw}/MW). Paid to wait. Saving machine life.`,
                estimatedRevenueEur: fcrDailyRevenue
            };
        }

        // Scenario 2: High Price, Clean Water -> FULL POWER
        if (market.priceEurPerMwh > 150 && !isSandy) {
            return {
                targetLoadPercent: 110,
                mode: 'RUN',
                reason: `Price Spike (€${market.priceEurPerMwh}) + Clean Water. Overload authorized.`,
                estimatedRevenueEur: totalRunRevenue
            };
        }

        // Scenario 3: High Price, Dirty Water -> CAUTION
        if (market.priceEurPerMwh > 150 && isSandy) {
            return {
                targetLoadPercent: 80,
                mode: 'RUN',
                reason: `Price High, but Sand Detected (${waterClarityPercent}%). Restricted to 80% to save Runner.`,
                estimatedRevenueEur: totalRunRevenue * 0.8
            };
        }

        // Scenario 4: Low Price -> STORE WATER
        if (market.priceEurPerMwh < 20 && market.fcrPriceEurPerMw < 10) {
            return {
                targetLoadPercent: 0,
                mode: 'STOP',
                reason: `Price too low (€${market.priceEurPerMwh}). Stop generation. Store water for peak hours.`,
                estimatedRevenueEur: 0
            };
        }

        return {
            targetLoadPercent: 100,
            mode: 'RUN',
            reason: 'Standard operations.',
            estimatedRevenueEur: totalRunRevenue
        };
    }
}
