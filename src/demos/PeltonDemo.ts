/**
 * PELTON MODULE DEMO
 * Verifying the Impulse Engine, Sand Monster, and Safety Logic
 */

import { PeltonEngine } from '../lib/engines/PeltonEngine';
import { SandErosionTracker } from '../services/SandErosionTracker';
import { createPeltonAssetTree } from '../models/AssetHierarchy';

const engine = new PeltonEngine();
const sandMonster = new SandErosionTracker();
const peltonTree = createPeltonAssetTree();

console.log('🏔️ PELTON MODULE SIMULATION 🏔️');
console.log('================================');

// 1. JET VELOCITY CALCULATION
console.log('\n💧 WHISPER: JET VELOCITY');
const heads = [100, 300, 500, 1000];
heads.forEach(h => {
    const v = engine.calculateJetVelocity(h);
    console.log(`Head: ${h}m -> Jet Velocity: ${v} m/s`);
});

// 2. DEFLECTOR SAFETY CHECK
console.log('\n🛡️ SAFETY: DEFLECTOR LOGIC');
const safetyScenarios = [
    { trip: false, status: 'PASSIVE', time: 0, desc: 'Normal Op' },
    { trip: true, status: 'PASSIVE', time: 0, desc: 'TRIP! But Deflector did nothing!' },
    { trip: true, status: 'ACTIVE', time: 2.5, desc: 'TRIP! Deflector moved... but too slow!' },
    { trip: true, status: 'ACTIVE', time: 1.2, desc: 'TRIP! Deflector engaged fast.' },
];

safetyScenarios.forEach(scen => {
    // Legacy scenarios assume safe gap (e.g. 50mm)
    const result = engine.checkDeflectorSafety(scen.trip, scen.status as 'ACTIVE' | 'PASSIVE', scen.time, 50);
    console.log(`[${scen.desc}] -> ${result.message}`);
});

// 3. THE SAND MONSTER
console.log('\n🏜️ THE SAND MONSTER (EROSION TRACKER)');
const erosionScenarios = [
    { v: 80, ppm: 50, desc: 'Clean water, Low Head' },
    { v: 140, ppm: 500, desc: 'Glacial Melt (Sandy), High Head' },
    { v: 140, ppm: 2000, desc: 'FLOOD! Muddy water, High Head' }
];

erosionScenarios.forEach(scen => {
    const report = sandMonster.trackErosion(scen.ppm, scen.v, 45); // 45mm thick buckets
    console.log(`\nScenario: ${scen.desc}`);
    console.log(`Jet: ${scen.v} m/s | Sand: ${scen.ppm} PPM`);
    console.log(`Wear Rate: ${report.bucketThinningRate.toFixed(1)} microns/year`);
    console.log(`Severity: ${report.severity} ${report.severity === 'EXTREME' ? '🔥' : ''}`);
    console.log(`Advice: ${report.recommendation}`);
});

// 4. ASSET ANATOMY
console.log('\n🦴 PELTON ANATOMY CHECK');
const nozzle1 = peltonTree.children[0].children[1].children[0]; // Turbine -> Distributor -> Nozzle 1
console.log(`Found Component: ${nozzle1.name}`);
const deflector = nozzle1.children[1];
console.log(`   -> Child: ${deflector.name} (${deflector.metadata?.specifications?.function})`);

const runners = peltonTree.children[0].children[0]; // Turbine -> Runner
const buckets = runners.children[0];
console.log(`Found Component: ${runners.name}`);
console.log(`   -> Child: ${buckets.name}`);
console.log(`      Material: ${buckets?.metadata?.specifications?.materialHardness}`);
console.log(`      Roughness: ${buckets?.metadata?.specifications?.surfaceRoughness}`);
console.log(`      Splitter Rule: ${buckets?.metadata?.specifications?.splitterRadius}`);

// 5. PELTON POLISH FEATURES
console.log('\n✨ PELTON POLISH FEATURES');

// Coating Health & Sand Monster
console.log('-> Testing Tungsten Carbide Coating Impact:');
const cleanRun = sandMonster.trackErosion(500, 140, 45, true); // Coating Intact
const damagedRun = sandMonster.trackErosion(500, 140, 45, false); // Coating Gone

console.log(`   [Coating HEALTHY] Wear: ${cleanRun.bucketThinningRate.toFixed(1)} microns/yr`);
console.log(`   [Coating DAMAGED] Wear: ${damagedRun.bucketThinningRate.toFixed(1)} microns/yr (Should be ~2.5x higher)`);

// Brake Nozzle Logic
console.log('\n-> Testing Brake Nozzle Safety Interlock:');
const brakeScenarios = [
    { needle: 1.0, valve: 'OPEN', pressure: 40, desc: 'Stopping (Needle 1%)' },
    { needle: 10.0, valve: 'OPEN', pressure: 40, desc: 'DANGER! Needle 10% + Brake OPEN' },
    { needle: 50.0, valve: 'CLOSED', pressure: 0, desc: 'Running (Brake Closed)' },
    { needle: 50.0, valve: 'CLOSED', pressure: 5, desc: 'Running but Brake Leaking' }
];

brakeScenarios.forEach(scen => {
    const check = engine.checkBrakeNozzleSafety(scen.needle, scen.valve as 'OPEN' | 'CLOSED', scen.pressure);
    console.log(`   [${scen.desc}]: ${check.message}`);
});

// 6. PELTON MASTER SPECS (The Geometric Weave)
console.log('\n🔬 PELTON MASTER SPECS');

// Jet Precision
console.log('-> Jet Precision Suite:');
console.log(`   [0.5mm Offset]: ${engine.checkJetAlignment(0.5).message}`);
console.log(`   [1.2mm Offset]: ${engine.checkJetAlignment(1.2).message}`);

// 1-Second Guardian
console.log('\n-> 1-Second Guardian (Deflector):');
// Previous passed at 1.2s, now should fail (Limit 1.0s)
console.log(`   [1.2s Valid Request]: ${engine.checkDeflectorSafety(true, 'ACTIVE', 1.2, 50).message}`);
console.log(`   [0.8s Master Spec]: ${engine.checkDeflectorSafety(true, 'ACTIVE', 0.8, 50).message}`);

// Mechanical Pulse
console.log('\n-> The Mechanical Pulse:');
console.log(`   [Healthy]: ${engine.checkMechanicalHealth(0.05, 0.10, false).message}`);
console.log(`   [Bad Run-out]: ${engine.checkMechanicalHealth(0.25, 0.30, false).message}`);
console.log(`   [Shaft Bounce]: ${engine.checkMechanicalHealth(0.10, 0.10, true).message}`);

// Windage
console.log('\n-> Windage Monitor:');
console.log(`   [Normal]: ${engine.checkHousingAeration(0.02).message}`);
console.log(`   [Drowning]: ${engine.checkHousingAeration(1.5).message}`);

// Magnetic Symmetry
console.log('\n-> Magnetic Symmetry:');
console.log(`   [Aligned]: ${engine.checkMagneticCenter(100, 100.5).message}`);
console.log(`   [Floating Wrong]: ${engine.checkMagneticCenter(100, 105).message}`);

console.log(`   [Floating Wrong]: ${engine.checkMagneticCenter(100, 105).message}`);

// 7. LIFT-OFF GUARD (Anti-Levitation)
console.log('\n🚀 LIFT-OFF GUARD (Anti-Levitation)');
const rotorWeight = 7000; // 7000 kg (approx 68 kN gravity force)

// Scenario 1: Normal Operation (Uplift 10kN)
console.log('-> Scenario 1: Normal Op (10kN Uplift)');
console.log(`   ${engine.calculateAxialBalance(rotorWeight, 10000, false).message}`);

// Scenario 2: Housing Pressurized (Uplift 60kN - Danger Zone!)
console.log('-> Scenario 2: High Pressure (60kN Uplift - 88% of limit)');
console.log(`   ${engine.calculateAxialBalance(rotorWeight, 60000, false).message}`);

// Scenario 3: LEVITATION (Uplift 80kN)
console.log('-> Scenario 3: LEVITATION (80kN Uplift)');
console.log(`   ${engine.calculateAxialBalance(rotorWeight, 80000, false).message}`);

// Scenario 4: The Jump (Negative Displacement)
console.log('-> Scenario 4: The Jump Sensor');
console.log(`   [0.0mm]: ${engine.checkAxialJump(0.0).message}`);
console.log(`   [-2.5mm]: ${engine.checkAxialJump(-2.5).message}`);

console.log('\n✨ END SIMULATION ✨');
