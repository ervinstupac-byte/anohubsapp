/**
 * ZERO WASTE AUDIT DEMO
 * Phase 9.0: Precision & Geometry
 */

import { RunoutMonitor } from '../services/RunoutMonitor';
import { ShaftSealMonitor } from '../services/ShaftSealMonitor';
import { AuxiliaryMonitor } from '../services/AuxiliaryMonitor';
import { createKaplanAssetTree } from '../models/AssetHierarchy';

const runout = new RunoutMonitor();
const sealSpy = new ShaftSealMonitor();
const aux = new AuxiliaryMonitor();
const tree = createKaplanAssetTree();

console.log('📐 ZERO-WASTE AUDIT DEMO 📐');
console.log('============================');

// 1. ASSET AUDIT
console.log('\n[1] ASSET HIERARCHY CHECK');
const dc = tree.children.find(c => c.name.includes('Battery'));
const air = tree.children.find(c => c.name.includes('Air'));
console.log(`   -> New Node: ${dc?.name} (${dc?.metadata?.specifications?.voltageNominal}V)`);
console.log(`   -> New Node: ${air?.name}`);

// 2. GEOMETRIC FINGERPRINT (RUN-OUT)
console.log('\n[2] RUN-OUT MONITOR (The Geometry Check)');

// Scenario A: Good Shaft
const goodZ = [0.01, 0.02, 0.01, 0.00, 0.01]; // Flat wobble
const checkA = runout.checkRunout([0.05], [0.05], goodZ);
console.log(`   -> A (Flat): ${checkA.message}`);

// Scenario B: Bad Wobble
const badZ = [0.00, 0.05, 0.10, 0.18, 0.05]; // > 0.15 delta
const checkB = runout.checkRunout([0.05], [0.05], badZ);
console.log(`   -> B (Wobble): ${checkB.message}`);

// 3. SHAFT SEAL LEAK DETECTIVE
console.log('\n[3] SHAFT SEAL LEAK DETECTIVE');
// Base pump runs 2 times/hour. New freq 3 times/hour (+50%). No Rain.
const leakCheck = sealSpy.detectInternalLeak(3, 2, false, 5.0);
console.log(`   -> Dry Day, High Pumping: ${leakCheck.message}`);

const rainCheck = sealSpy.detectInternalLeak(3, 2, true, 5.0);
console.log(`   -> Rainy Day, High Pumping: ${rainCheck.message}`);

// 4. AUXILIARY PULSE
console.log('\n[4] START READINESS CHECK');
const startA = aux.checkStartReadiness(110, 25);
console.log(`   -> 110V, 25bar: ${startA.message}`);
const startB = aux.checkStartReadiness(100, 25);
console.log(`   -> 100V, 25bar: ${startB.message}`);

console.log('\n✨ AUDIT COMPLETE ✨');
