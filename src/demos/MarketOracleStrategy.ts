import { EnergyMerchant, MarketCondition } from '../services/EnergyMerchant';

/**
 * MARKET ORACLE STRATEGY 🔮💶
 * The 24-Hour Profit Forecaster.
 * 
 * Objectives:
 * 1. Simulate 24h Market Cycle (Spot Price vs FCR Price).
 * 2. Identify "Sovereign Hours" (Run Hard) vs "FCR Hours" (Stand Still).
 * 3. Calculate Total Carbon Alpha.
 * 4. Project Net Profit.
 */

const LOG_SEPARATOR = '--------------------------------------------------------------------------------';

interface HourlyForecast {
    hour: number;
    spotPrice: number;
    fcrPrice: number;
    carbonPrice: number;
    decision: 'RUN' | 'STANDBY_FCR' | 'STOP';
    loadMw: number;
    revenueEnergy: number;
    revenueFcr: number;
    revenueCarbon: number;
    molecularDebt: number; // Wear Cost
    netProfit: number;
}

function runMarketStrategy() {
    console.log(LOG_SEPARATOR);
    console.log('       MARKET ORACLE STRATEGY - 24H FORECAST       ');
    console.log(LOG_SEPARATOR);

    const merchant = new EnergyMerchant();
    const goldenPointMw = 85.35; // Our new efficiency standard
    const maxCapacityMw = 100;

    // Carbon Credit Price 2026 (Assumed)
    const carbonPrice = 85.0; // €/ton

    const forecast: HourlyForecast[] = [];
    let totalNetProfit = 0;
    let totalCarbonOffsetTons = 0;

    console.log(`[STRATEGY PARAMS] Golden Point: ${goldenPointMw}MW | Carbon: €${carbonPrice}/ton`);

    // SIMULATE 24 HOURS
    for (let h = 0; h < 24; h++) {
        // Market Dynamics Simulation
        // Morning Peak (7-9), Evening Peak (17-20) -> High Spot Price
        // Night (0-5) -> Low Spot, High FCR (Grid needs stability)

        let spot = 40;
        let fcr = 15;

        // Morning Peak
        if (h >= 7 && h <= 9) { spot = 180; fcr = 20; }
        // Evening Peak
        else if (h >= 17 && h <= 20) { spot = 220; fcr = 25; }
        // Night / Solar Dip
        else if (h >= 0 && h <= 5) { spot = 10; fcr = 45; } // Negative pricing or low demand, FCR valuable
        else { spot = 60; fcr = 30; } // Mid-day

        const market: MarketCondition = {
            priceEurPerMwh: spot,
            fcrPriceEurPerMw: fcr,
            demandLevel: spot > 100 ? 'HIGH' : 'LOW',
            carbonCreditPriceEur: carbonPrice
        };

        // Get Merchant Decision
        // We assume clean water (100% clarity) for this forecast
        const order = merchant.generateOrder(market, 100, maxCapacityMw);

        // CALCULATE FINANCIALS
        let load = 0;
        let revEnergy = 0;
        let revFcr = 0;
        let revCarbon = 0;
        let wear = 0;

        if (order.mode === 'RUN') {
            load = goldenPointMw; // Use Golden Point if Running Standard
            if (order.targetLoadPercent > 100) load = 100; // Cap at max for calculation simplicity or Overload

            revEnergy = load * spot;

            // Carbon: 0.4 tons/MWh displaced
            const tonsOffset = load * 0.4;
            revCarbon = tonsOffset * carbonPrice;
            totalCarbonOffsetTons += tonsOffset;

            // Wear: Cost of running (Molecular Debt)
            // Approx €150/hr at full load? Let's use a model.
            wear = 120;
        } else if (order.mode === 'STANDBY_FCR') {
            load = 0;
            revFcr = maxCapacityMw * fcr; // Paid for capacity availability
            wear = 5; // Minimal aux wear
        }

        const net = (revEnergy + revFcr + revCarbon) - wear;
        totalNetProfit += net;

        forecast.push({
            hour: h,
            spotPrice: spot,
            fcrPrice: fcr,
            carbonPrice: carbonPrice,
            decision: order.mode,
            loadMw: load,
            revenueEnergy: revEnergy,
            revenueFcr: revFcr,
            revenueCarbon: revCarbon,
            molecularDebt: wear,
            netProfit: net
        });
    }

    // OUTPUT RESULTS
    console.log('\n[24H OPERATIONAL PLAN]');
    console.log('Hour\tSpot\tFCR\tMode\t\tMW\tNet Profit');
    forecast.forEach(f => {
        const modeIcon = f.decision === 'RUN' ? '⚡' : f.decision === 'STANDBY_FCR' ? '🛡️' : '🛑';
        console.log(`${f.hour.toString().padStart(2, '0')}:00\t€${f.spotPrice}\t€${f.fcrPrice}\t${f.decision} ${modeIcon}\t${f.loadMw.toFixed(1)}\t€${f.netProfit.toFixed(0)}`);
    });

    console.log('\n[FINANCIAL SUMMARY]');
    const fcrHours = forecast.filter(f => f.decision === 'STANDBY_FCR').length;
    const runHours = forecast.filter(f => f.decision === 'RUN').length;

    console.log(`⏱️ SOVEREIGN HOURS (RUN):  ${runHours} hrs`);
    console.log(`🛡️ FCR HOURS (STANDBY):    ${fcrHours} hrs`);
    console.log(`🌍 TOTAL CO2 OFFSET:       ${totalCarbonOffsetTons.toFixed(1)} tons`);
    console.log(`💰 EST. NET PROFIT (24h):  €${totalNetProfit.toFixed(0)}`);

    console.log(LOG_SEPARATOR);
}

runMarketStrategy();
