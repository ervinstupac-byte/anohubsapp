import Decimal from 'decimal.js';
import { computeRevenueLoss, estimateAnnualDegradationRate } from './AgingEstimator';
import { supabase } from './supabaseClient';

export type CenturyPlanInput = {
    currentEta: number; // fraction, e.g., 0.88
    optimalEta: number; // fraction
    currentPowerKw: number; // kW at operating point
    pricePerKwh: number; // currency per kWh
    annualOpex?: number; // currency per year
    capex?: number; // upfront capital cost
    capacityFactor?: number; // 0-1 fraction (defaults to 0.45)
    degradationRatePerYear?: number; // optional override (fraction per year)
    telemetryWindow?: any[]; // optional samples for estimating degradation
};

export function computeAnnualRevenue(currentPowerKw: number, pricePerKwh: number, capacityFactor = 0.45) {
    const hours = 24 * 365;
    const energyKwh = new Decimal(currentPowerKw).times(hours).times(capacityFactor);
    return energyKwh.times(pricePerKwh);
}

// Project ROI and key metrics over horizons (years array)
export function centuryPlan(input: CenturyPlanInput, horizons = [10,20,50]) {
    const D = Decimal;
    const hoursPerYear = 24 * 365;
    const capacityFactor = input.capacityFactor ?? 0.45;
    const baselineAnnualRevenue = computeAnnualRevenue(input.currentPowerKw, input.pricePerKwh, capacityFactor);
    const annualOpex = new D(input.annualOpex || 0);
    const capex = new D(input.capex || 0);

    // determine degradation rate per year
    let degr = new D(input.degradationRatePerYear ?? 0);
    if (degr.eq(0) && input.telemetryWindow && input.telemetryWindow.length > 1) {
        degr = estimateAnnualDegradationRate(input.telemetryWindow);
    }

    // if degr is returned as small fractional change per year (e.g., -0.01 means decrease), ensure sign convention
    // estimateAnnualDegradationRate returns change in eta per year; if negative, convert to positive degradation
    if (degr.lessThan(0)) degr = degr.neg();

    const results: any = {};

    for (const y of horizons) {
        let cumulativeProfit = new D(0);
        let revenueThisYear = new D(0);
        let etaThis = new D(input.currentEta);
        for (let year = 0; year < y; year++) {
            // project eta at start of year
            if (year > 0) {
                etaThis = etaThis.minus(degr);
                if (etaThis.lessThan(0)) etaThis = new D(0);
            }
            // loss per hour due to inefficiency relative to optimal
            const lossPerHour = computeRevenueLoss(etaThis.toNumber(), input.optimalEta, input.currentPowerKw, input.pricePerKwh);
            const annualLoss = lossPerHour.times(hoursPerYear);
            const annualRevenue = baselineAnnualRevenue.minus(annualLoss);
            revenueThisYear = annualRevenue;
            const profit = annualRevenue.minus(annualOpex);
            cumulativeProfit = cumulativeProfit.plus(profit);
        }
        const roi = capex.eq(0) ? null : cumulativeProfit.minus(capex).dividedBy(capex).toNumber();
        results[y] = {
            horizon: y,
            projectedAnnualRevenue: revenueThisYear.toNumber(),
            cumulativeProfit: cumulativeProfit.toNumber(),
            roi
        };
    }

    return { baselineAnnualRevenue: baselineAnnualRevenue.toNumber(), degradationRatePerYear: degr.toNumber(), projections: results };
}

export async function persistCenturyPlanForAsset(assetId: number, input: CenturyPlanInput, name = 'Auto Century Plan') {
    // run centuryPlan and persist into century_plans
    const result = centuryPlan(input);
    try {
        const { error } = await supabase.from('century_plans').insert([{ asset_id: assetId, name, input_json: input, projections: result, created_at: new Date().toISOString() }]);
        if (error) throw error;
        return result;
    } catch (e) {
        console.error('persistCenturyPlanForAsset error', e);
        throw e;
    }
}
