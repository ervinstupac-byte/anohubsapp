/**
 * PHASE 19 DEMO: GLOBAL INTELLIGENCE 🌍🌩️
 * 🌩️ Climate Oracle (Weather Strategy)
 * 💰 Energy Merchant (Market Strategy)
 * 🔬 Scientific Ingestor (Research)
 * 🏛️ Government Dashboard (National Status)
 */

import { ClimateOracle } from '../services/ClimateOracle';
import { EnergyMerchant } from '../services/EnergyMerchant';
import { ScientificIngestor } from '../services/ScientificIngestor';
import { GovernmentDashboard } from '../services/GovernmentDashboard';

const oracle = new ClimateOracle();
const merchant = new EnergyMerchant();
const scientist = new ScientificIngestor();
const gov = new GovernmentDashboard();

console.log('🏛️ GLOBAL INTELLIGENCE (Phase 19.0) 🏛️');
console.log('=======================================');

// 1. CLIMATE ORACLE
console.log('\n[1] THE CLIMATE ORACLE 🌩️');
// Scenario: 100-year storm detected
const weather = {
    region: 'Valley Alpha',
    rainMmNext24h: 10,
    rainMmNext48h: 40,
    rainMmNext72h: 120, // Huge!
    stormProbability: 95
};
const strategy = oracle.analyzeForecast(weather);
console.log(`   Forecast: 120mm rain in 72h.`);
console.log(`   🔮 STRATEGY: ${strategy.action}`);
console.log(`   Reason: "${strategy.reason}"`);

// 2. ENERGY MERCHANT
console.log('\n[2] THE ENERGY MERCHANT 💰');
// Scenario A: High Price + Clean Water
const orderA = merchant.generateOrder({ priceEurPerMwh: 200, demandLevel: 'HIGH', fcrPriceEurPerMw: 10, carbonCreditPriceEur: 50 }, 95);
console.log(`   Scenario A (Price €200, Clean): Order -> ${orderA.targetLoadPercent}% Load.`);
console.log(`   Reason: ${orderA.reason}`);

// Scenario B: High Price + Dirty Water
const orderB = merchant.generateOrder({ priceEurPerMwh: 200, demandLevel: 'HIGH', fcrPriceEurPerMw: 10, carbonCreditPriceEur: 50 }, 50); // 50% Clarity (Mud)
console.log(`   Scenario B (Price €200, Dirty): Order -> ${orderB.targetLoadPercent}% Load.`);
console.log(`   Reason: ${orderB.reason}`);

// 3. SCIENTIFIC INGESTOR
console.log('\n[3] THE SCIENTIFIC INGESTOR 🔬');
const papers = scientist.scanGlobalResearch(['erosion', 'francis']);
if (papers.length > 0) {
    console.log(`   Found ${papers.length} new breakthrough(s):`);
    papers.forEach(p => {
        console.log(`   📄 "${p.title}" (${p.source})`);
        console.log(`      Summary: ${p.summary}`);
    });
}

// 4. GOVERNMENT DASHBOARD
console.log('\n[4] THE PEOPLE\'S HERO 🏛️');
console.log(gov.generateNationalReport());

console.log('✅ THE WORLD IS CONNECTED. The Fortress is Global.');
