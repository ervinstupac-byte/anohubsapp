/**
 * PHASE 26 DEMO: SOVEREIGN INTEGRATION 👑
 * The Final Exam.
 * Scenario:
 * 1. Sensor Failure (TruthJudge) triggers Drawing Auto-Open (Drawing42Link).
 * 2. Vibration Spike triggers Load Throttling (EfficiencyHardener).
 * 3. Financials reflect Molecular Debt.
 */

import { Sovereign_Executive_Engine } from '../services/Sovereign_Executive_Engine';

const sovereign = new Sovereign_Executive_Engine();

console.log('👑 SOVEREIGN INTEGRATION (Phase 26.0) 👑');
console.log('=======================================');

// SCENARIO: A Rough Day at the Office
// Vibration is High (2.8mm/s > 2.2 limit)
// Sensor A is Drifting (Physics Check failure simulated in Engine)
// Profit is good, but Debt is accumulating.

const result = sovereign.executeCycle({
    vibration: 2.8, // Current Vibration (High)
    scadaTimestamp: Date.now(),
    sensors: {
        a: { id: 'SensA', value: 150, timestamp: Date.now() }, // Bad Sensor (Jumped)
        b: { id: 'SensB', value: 50, timestamp: Date.now() }  // Good Sensor
    },
    market: { price: 50, fcr: 10, carbon: 20 },
    erosion: { severity: 'HIGH' as const, bucketThinningRate: 0.1 },
    ph: 7.0
});

// 1. UNIFIED DIAGNOSTIC
console.log('\n[1] UNIFIED DIAGNOSTIC 📊');
console.log(`   Master Health Score: ${result.masterHealthScore}%`);
console.log(`   (Weighted: Quality 30% + Molecular 40% + Efficiency 30%)`);

// 2. PROTECTIVE ACTIONS (The Nervous System)
console.log('\n[2] ACTIVE PROTECTIONS 🛡️');
result.activeProtections.forEach((p: any) => console.log(`   🔸 ${p}`));

// 3. TARGET LOAD (Longevity Logic)
console.log('\n[3] EXECUTIVE DECISION 📉');
console.log(`   Target Load: ${result.targetLoadMw} MW`);
console.log(`   Operator Message: "${result.operatorMessage}"`);

// 4. FINANCIAL REALITY
console.log('\n[4] THE REAL BALANCE SHEET 💶');
console.log(`   Gross Profit:       €${result.financials.grossProfitEur}`);
console.log(`   - Molecular Debt:   €${result.financials.molecularDebtEur.toFixed(0)} (Hidden Cost of Stress)`);
console.log(`   =========================================`);
console.log(`   NET SOVEREIGN WEALTH: €${result.financials.netSovereignProfitEur.toFixed(0)}`);

console.log('\n✅ THE SOVEREIGN ENGINE IS IN CONTROL. 🐜👑');
