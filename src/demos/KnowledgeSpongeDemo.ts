/**
 * PHASE 13 DEMO: THE KNOWLEDGE SPONGE 🧽
 * 🕵️‍♂️ Discovery Vault (Stranger Sensors)
 * 🍽️ Pattern Eater (Efficiency Learning)
 * 🏗️ Project Swallower (Auto-Assimilation)
 */

import { DiscoveryVault } from '../services/DiscoveryVault';
import { PatternEater } from '../services/PatternEater';
import { ProjectSwallower } from '../services/ProjectSwallower';

const vault = new DiscoveryVault();
const eater = new PatternEater();
const swallower = new ProjectSwallower();

console.log('🏛️ THE KNOWLEDGE SPONGE (Phase 13.0) 🏛️');
console.log('=========================================');

// 1. DISCOVERY VAULT TEST
console.log('\n[1] DISCOVERY VAULT (Stranger Correlations)');
// Simulate a "Money Leak" KPI (e.g. rising costs)
const moneyLeakKpi = [10, 12, 15, 20, 35, 50, 80, 100];
// Stranger A: Tracks perfectly (e.g. some obscure vibration)
const strangerA = 'Sensor_X_99';
const signalA = [1, 1.2, 1.5, 2.0, 3.5, 5.0, 8.0, 10.0];
// Stranger B: Random noise
const strangerB = 'Sensor_Y_00';
const signalB = [5, 2, 8, 1, 9, 3, 4, 2];

signalA.forEach(v => vault.feedStranger(strangerA, v));
signalB.forEach(v => vault.feedStranger(strangerB, v));

const analysis = vault.analyze(moneyLeakKpi);
analysis.forEach(s => {
    console.log(`   🕵️ ${s.id}: Correlation ${s.correlationScore.toFixed(2)} -> VERDICT: ${s.verdict}`);
});


// 2. PATTERN EATER TEST
console.log('\n[2] PATTERN EATER (Learning New Curves)');
// Feed it data that consistently outperforms the anchor
// Anchor peak is 94% at 85 Gate.
// Real machine: 96% at 85 Gate (It's a "Golden Runner")
for (let i = 0; i < 20; i++) {
    eater.feedObservation(85.0, 96.0); // Teaching it...
    eater.feedObservation(60.0, 85.0); // Normal
}

const patterns = eater.analyzePatterns();
console.log('   Stats for Gate 85% (BEP):');
const bep = patterns.find(p => p.gatePercent === 85);
if (bep) {
    console.log(`   - Anchor (Design): ${bep.anchorEfficiency.toFixed(1)}%`);
    console.log(`   - Observed (Real): ${bep.observedEfficiency.toFixed(1)}%`);
    console.log(`   - Status: ${bep.status} (The Brain has adapted!)`);
}


// 3. PROJECT SWALLOWER TEST
console.log('\n[3] PROJECT SWALLOWER (Auto-Assimilation)');
// Raw data from some external JSON source
const rawData = {
    siteName: 'Mystery Valley HPP',
    units: [
        {
            name: 'Unit Alpha',
            wheel: { name: 'Francis Runner X', diameter: 2000 }, // "wheel" -> TURBINE
            dynamo: { name: 'Generator 50MVA' }, // "dynamo" -> GENERATOR
            flux_capacitor: { name: 'Time Travel Module', power: '1.21GW' } // Unknown!
        }
    ]
};

const station = swallower.swallowProject(rawData);
console.log(`   Site Assimilated: ${station.name}`);
const unit = station.children[0];
console.log(`     Unit: ${unit.name}`);
unit.children.forEach(child => {
    console.log(`       - [${child.type}] ${child.name} ${child.metadata?.notes ? '(' + child.metadata.notes + ')' : ''}`);
});

console.log('\n✅ KNOWLEDGE ABSORBED. The Fortress grows stronger.');
