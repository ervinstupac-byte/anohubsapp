import { EnergyMerchant, MarketCondition } from '../services/EnergyMerchant';
import { ErosionCorrosionSynergy } from '../services/ErosionCorrosionSynergy';
import { ErosionStatus } from '../services/SandErosionTracker';

/**
 * MARKET FCR DECISION DEMO
 * The Sovereign Economic Logic Simulation 🐜💰
 */

const LOG_SEPARATOR = '--------------------------------------------------------------------------------';

function simulate() {
    console.log('\n🐜 SOVEREIGN HYDRO FORTRESS - ECONOMIC LOGIC DEMO (PHASE 28.1)');
    console.log('Objective: Prove functionality of "Lazy Merchant" logic (FCR vs Run).');
    console.log(LOG_SEPARATOR);

    // 1. SETUP ACTORS
    const merchant = new EnergyMerchant();

    // 2. DEFINE MARKET CONDITIONS (Fixed as per User Request)
    const market: MarketCondition = {
        priceEurPerMwh: 55,         // Moderate Energy Price
        demandLevel: 'MED',
        fcrPriceEurPerMw: 25,       // FCR Standby Price
        carbonCreditPriceEur: 8     // Carbon Offset Value
    };

    console.log('MARKET INPUTS:');
    console.log(`- Energy Price:       €${market.priceEurPerMwh}/MWh`);
    console.log(`- FCR (Standby):      €${market.fcrPriceEurPerMw}/MW/h`);
    console.log(`- Carbon Credit:      €${market.carbonCreditPriceEur}/ton`);
    console.log(LOG_SEPARATOR);

    // 3. DEFINE PHYSICAL SCENARIOS
    // Scenario A: "Spring Water" (Clean, Neutral)
    const scenarioA: { erosion: ErosionStatus, ph: number, desc: string } = {
        desc: 'SCENARIO A: Pristine Mountain Spring (Clean, pH 7.2)',
        ph: 7.2,
        erosion: {
            timestamp: Date.now(),
            sedimentPPM: 50,
            jetVelocity: 100,
            bucketThinningRate: 150, // < 200 = Negligible
            estimatedBucketLife: 50,
            severity: 'NEGLIGIBLE',
            recommendation: 'Clean'
        }
    };

    // Scenario B: "Acid Sand" (High Silica, Acidic)
    const scenarioB: { erosion: ErosionStatus, ph: number, desc: string } = {
        desc: 'SCENARIO B: Acidic Glacial Runoff (Sand + pH 5.2)',
        ph: 5.2,
        erosion: {
            timestamp: Date.now(),
            sedimentPPM: 2500, // High
            jetVelocity: 100,
            bucketThinningRate: 850, // > 500 = Damaged Oxide Layer
            estimatedBucketLife: 5,
            severity: 'HIGH',
            recommendation: 'Erosion Active'
        }
    };

    // 4. RUN SIMULATION LOOP (12 Hours)
    // We will compare the decision for both Scenarios.

    const scenarios = [scenarioA, scenarioB];

    scenarios.forEach(scen => {
        console.log(`\n\n${scen.desc}`);
        console.log(LOG_SEPARATOR);

        // Step 1: Calculate Synergy & Molecular Debt Cost
        // Assume Base Corrosion Rate for 13Cr4Ni = 0.05 mm/year
        const baseCorrosion = 0.05;
        const synergy = ErosionCorrosionSynergy.calculateSynergy(scen.erosion, scen.ph, baseCorrosion);

        console.log(`[PHYSICS] Synergy Factor: ${synergy.synergyFactor.toFixed(1)}x`);
        console.log(`[PHYSICS] Oxide Layer:    ${synergy.oxideLayerState}`);
        if (synergy.alert) console.log(`[ALERT]   ${synergy.alert}`);

        // ESTIMATE WEAR COST (Heuristic for Demo)
        // If Synergy > 5, Cost is massive.
        // Base Operational Cost (Opex) = €50/hour (Oil, wear, tear)
        let wearCostPerHour = 50;
        if (synergy.synergyFactor > 4.0) wearCostPerHour = 2500; // Expensive! destroying buckets
        else if (synergy.synergyFactor > 1.5) wearCostPerHour = 500;

        console.log(`[FINANCE] Est. Wear Cost: €${wearCostPerHour}/hour (Molecular Debt)`);

        // Step 2: Ask the Merchant
        // Note: The Merchant currently uses a simplified heuristic inside 'generateOrder'.
        // For this demo, we will inject the logic here to show the comparison since 'EnergyMerchant'
        // was updated to favor FCR if Revenue > RunRevenue * 0.8.
        // But EnergyMerchant doesn't take "Wear Cost" as input yet (it assumes standard).
        // WE WILL EXTEND THE LOGIC LOCALLY TO DEMONSTRATE THE "TRUE" SOVEREIGN DECISION.

        const availableMW = 100;

        // CALC MODE A: RUN
        const revenueEnergy = (market.priceEurPerMwh * availableMW); // per hour
        const revenueCarbon = (market.carbonCreditPriceEur * availableMW * 0.4); // per hour
        const grossRun = revenueEnergy + revenueCarbon;
        const netRun = grossRun - wearCostPerHour;

        // CALC MODE B: STANDBY (FCR)
        const revenueFCR = (market.fcrPriceEurPerMw * availableMW);
        // Wear in Standby is negligible (turning gear, oil pumps) ~ €10/hr
        const wearStandby = 10;
        const netStandby = revenueFCR - wearStandby;

        console.log(`\n--- DECISION MATRIX (Hourly) ---`);
        console.log(`MODE A (RUN 100MW):`);
        console.log(`  Energy Rev:  +€${revenueEnergy.toFixed(2)}`);
        console.log(`  Carbon Rev:  +€${revenueCarbon.toFixed(2)}`);
        console.log(`  Wear Cost:   -€${wearCostPerHour.toFixed(2)}`);
        console.log(`  NET PROFIT:   €${netRun.toFixed(2)}`);

        console.log(`MODE B (STANDBY FCR):`);
        console.log(`  FCR Rev:     +€${revenueFCR.toFixed(2)}`);
        console.log(`  Wear Cost:   -€${wearStandby.toFixed(2)}`);
        console.log(`  NET PROFIT:   €${netStandby.toFixed(2)}`);

        // THE VERDICT
        let decision = '';
        if (netStandby > netRun) {
            decision = '✅ COMMAND: ENTER FCR STANDBY MODE. (Profitable Laziness)';
        } else {
            decision = '⚡ COMMAND: GENERATE POWER. (Running is worth the pain)';
        }

        console.log(`\n🏆 SOVEREIGN DECISION: ${decision}`);

        // Validate against the EnergyMerchant class we updated (Consistency Check)
        // Note: The class uses a simpler "80%" rule. Let's see what it says.
        const classOrder = merchant.generateOrder(market, (scen.erosion.sedimentPPM || 0) < 100 ? 90 : 50, availableMW);
        console.log(`[EnergyMerchant.ts Output]: ${classOrder.mode} (${classOrder.reason})`);
    });

    console.log('\n\n' + LOG_SEPARATOR);
    console.log('SIMULATION COMPLETE.');
}

simulate();
