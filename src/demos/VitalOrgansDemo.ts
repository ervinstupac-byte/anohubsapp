/**
 * VITAL ORGANS DEMO
 * Verifying FFT Whisperer, HPU Guard, and Cooling Shield
 */

import { VibrationExpert } from '../services/VibrationExpert';
import { AuxiliaryMonitor } from '../services/AuxiliaryMonitor';
import { createKaplanAssetTree } from '../models/AssetHierarchy';

const vibes = new VibrationExpert();
const aux = new AuxiliaryMonitor();
const tree = createKaplanAssetTree();

console.log('🫀 VITAL ORGANS DIAGNOSTICS 🫀');
console.log('=================================');

// 1. ASSET HIERARCHY CHECK
console.log('\n🏗️ AUXILIARY ASSET CHECK');
// We added Trafo, HPU, Cooling to the Unit Root
const trafo = tree.children.find(c => c.name.includes('Transformer'));
const hpu = tree.children.find(c => c.name.includes('Hydraulic'));
const cooling = tree.children.find(c => c.name.includes('Cooling'));

console.log(`Found: ${trafo?.name} (${trafo?.metadata?.specifications?.ratingMVA} MVA)`);
console.log(`Found: ${hpu?.name} (Status: ${hpu?.metadata?.criticality})`);
console.log(`Found: ${cooling?.name} (Status: ${cooling?.metadata?.criticality})`);

// 2. THE FFT WHISPERER (BPF Detection)
console.log('\n👂 THE FFT WHISPERER (Vibration Analysis)');
const rpm = 125;
const blades = 5;
// BPF = 125/60 * 5 = 2.083 * 5 = 10.41 Hz

console.log(`Machine Specs: RPM=${rpm}, Blades=${blades}`);
const vibrationScenarios = [
    {
        peaks: [{ frequencyHz: 10.4, amplitudeMmS: 0.5 }],
        desc: 'Normal Operation (Tiny BPF peak)'
    },
    {
        peaks: [{ frequencyHz: 10.4, amplitudeMmS: 3.5 }],
        desc: 'HYDRAULIC ROUGHNESS (High BPF peak)'
    },
    {
        peaks: [{ frequencyHz: 2.1, amplitudeMmS: 4.0 }],
        desc: 'MECHANICAL UNBALANCE (1xRPM high)'
    }
];

vibrationScenarios.forEach(scen => {
    const diag = vibes.checkFrequencyPeaks(scen.peaks, rpm, blades);
    console.log(`[${scen.desc}]`);
    console.log(`   -> BPF Calculated: ${diag.bpfHz.toFixed(2)} Hz`);
    console.log(`   -> ${diag.danger ? '🚨 DANGER' : '✅ OK'}: ${diag.cause}`);
    if (diag.danger) console.log(`   -> Advice: ${diag.recommendation}`);
});

// 3. AUXILIARY MONITOR (Cooling, HPU, Trafo)
console.log('\n🛡️ AUXILIARY SYSTEMS GUARD');

// Cooling
console.log('-> Cooling Water Shield:');
console.log(`   Filter dP 0.2 bar: ${aux.checkCoolingWater(0.2, true).message}`);
console.log(`   Filter dP 0.8 bar (Auto): ${aux.checkCoolingWater(0.8, true).message}`);
console.log(`   Filter dP 0.8 bar (Manual): ${aux.checkCoolingWater(0.8, false).message}`); // URGENT

// HPU
console.log('\n-> HPU Muscle Guard:');
console.log(`   Oil 40C, ISO 16/14/11: ${aux.checkHPUMuscle(40, '16/14/11').message}`);
console.log(`   Oil 50C, ISO 20/18/15: ${aux.checkHPUMuscle(50, '20/18/15').message}`); // Dirty
console.log(`   Oil 75C, ISO 16/14/11: ${aux.checkHPUMuscle(75, '16/14/11').message}`); // Hot

// Transformer
console.log('\n-> Transformer Last Stand:');
console.log(`   Buchholz Normal: ${aux.checkTransformer(false, 60).message}`);
console.log(`   Buchholz TRIP: ${aux.checkTransformer(true, 60).message}`);

console.log('\n✨ END SIMULATION ✨');
