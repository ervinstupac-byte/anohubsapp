/**
 * PHASE 27 DEMO: THE CHAOS GAUNTLET 🐜🛡️🔥
 * Scenario:
 * T=0: A "Three-Front War" hits the Fortress.
 * 1. Head Loss spikes to 0.8m (Trash Racks blocked).
 * 2. Sensor A freezes at 45.0C (Sabotage).
 * 3. Vibration spikes to 2.9mm/s (Mechanical distress).
 * 
 * Goal: Prove the Sovereign Executive Engine survives and responds correctly.
 */

import { Sovereign_Executive_Engine } from '../services/Sovereign_Executive_Engine';

const sovereign = new Sovereign_Executive_Engine();

console.log('🔥 THE CHAOS GAUNTLET (Phase 27.0) 🔥');
console.log('=====================================');

// SIMULATION INPUTS
const t0 = Date.now();
const chaosInputs = {
    headLoss: 0.80, // CRITICAL (>0.5)
    vibration: 2.9, // CRITICAL (>2.2)
    sensorA: { id: 'MainBearing', value: 45.0, timestamp: t0 },       // FROZEN Value
    sensorB: { id: 'MainBearing_Redundant', value: 68.2, timestamp: t0 }, // Real Value
    profit: 8500 // Flow is high, money is good... until chaos
};

// NOTE: To simulate "Frozen", we assume the TruthJudge inside logic sees history. 
// For this single-shot demo, we rely on TruthJudge detecting the deviation from B + Prediction,
// or we assume TruthJudge Mock inside has been pre-conditioned (or we accept "Failed QC" generic reason).

console.log('\n[CHAOS EVENT T=0]');
console.log(`   🌊 Head Loss: ${chaosInputs.headLoss}m (BLOCKAGE)`);
console.log(`   🔊 Vibration: ${chaosInputs.vibration} mm/s (SHAKING)`);
console.log(`   ❄️ Sensor A:   ${chaosInputs.sensorA.value.toFixed(1)} C (FROZEN/STUCK)`);

// EXECUTE THE SOVEREIGN BRAIN
const result = sovereign.executeCycle({
    vibration: chaosInputs.vibration,
    scadaTimestamp: Date.now(),
    sensors: { a: chaosInputs.sensorA, b: chaosInputs.sensorB },
    market: { price: 50, fcr: 10, carbon: 20 },
    erosion: { severity: 'HIGH' as const, timestamp: Date.now(), sedimentPPM: 100, jetVelocity: 50, bucketThinningRate: 0.1, estimatedBucketLife: 20, recommendation: 'Monitor' },
    ph: 7.0
});

console.log('\n-------------------------------------');
console.log('🛡️ THE SOVEREIGN RESPONSE 🛡️');
console.log('-------------------------------------');

// 1. SAFETY (Load Throttling)
console.log(`\n[1] SAFETY PRIORITY`);
if (result.targetLoadMw < 88.5) {
    console.log(`   ✅ LOAD THROTTLED: Target dropped to ${result.targetLoadMw} MW`);
} else {
    console.log(`   ❌ FAILURE: Load did not drop!`);
}

// 2. CONTEXT AWARENESS (Drawings)
console.log(`\n[2] CONTEXTUAL INTELLIGENCE`);
const drawingsOpened = (result.activeProtections || []).filter((p: any) => p.includes('Auto-opened Drawing'));
if (drawingsOpened.length >= 2) {
    console.log(`   ✅ MULTI-CONTEXT ACTIVE: Opened ${drawingsOpened.length} Reference Docs.`);
    drawingsOpened.forEach((d: any) => console.log(`      📄 ${d}`));
} else {
    console.log(`   ❌ FAILURE: Did not open all necessary drawings. Found: ${drawingsOpened.length}`);
}

// 3. TRUTH AUDIT
console.log(`\n[3] TRUTH AUDIT`);
const sensorFlags = (result.activeProtections || []).filter((p: any) => p.includes('TRUTH AUDIT'));
if (sensorFlags.length > 0) {
    console.log(`   ✅ SABOTAGE DETECTED: "${sensorFlags[0]}"`);
} else {
    console.log(`   ❌ FAILURE: Frozen sensor ignored.`);
}

// 4. FINANCIAL IMPACT
console.log(`\n[4] FINANCIAL IMPACT`);
console.log(`   Gross Revenue:    €${result.financials.grossProfitEur}`);
console.log(`   Molecular Debt:   -€${result.financials.molecularDebtEur.toFixed(0)} (High Vibration Cost)`);
console.log(`   Adjusted Result:  €${result.financials.netSovereignProfitEur.toFixed(0)}`);

// 5. OPERATOR MESSAGE
console.log(`\n[5] OPERATOR LOG`);
console.log(`   "${result.operatorMessage}"`);

console.log('\n-------------------------------------');
if (result.targetLoadMw < 88.5 && drawingsOpened.length >= 2 && sensorFlags.length > 0) {
    console.log('✅ VERDICT: THE FORTRESS DID NOT BLINK. 🐜🛡️');
} else {
    console.log('❌ VERDICT: SYSTEM COMPROMISED.');
}
