/**
 * PHASE 25 DEMO: SITE CALIBRATION 📈🔊
 * 📈 Vibration Baseline (Signature Learning)
 * 💰 Efficiency Curve Hardener (Golden Point)
 * 📝 Drawing 42 Annotation (Field Notes)
 * 🖥️ Operator's Command Center (The Dashboard)
 */

import { VibrationBaseline } from '../services/VibrationBaseline';
import { EfficiencyCurveHardener } from '../services/EfficiencyCurveHardener';
import { Drawing42Link } from '../services/Drawing42Link';
import { OperatorsCommandCenter } from '../services/OperatorsCommandCenter';

const tuner = new VibrationBaseline();
const hardener = new EfficiencyCurveHardener();
const linker = new Drawing42Link(); // This instance won't persist notes from previous run, but ok for demo flow
const ops = new OperatorsCommandCenter();

console.log('📈 SITE-SPECIFIC CALIBRATION (Phase 25.0) 📈');
console.log('==========================================');

// 1. VIBRATION BASELINE
console.log('\n[1] VIBRATION SIGNATURE LEARNING 🔊');
const profile = tuner.learnSignature(24);
console.log(`   Status: ${profile.status}`);
console.log(`   Baseline Mean: ${profile.baselineMeanMmS} mm/s`);
console.log(`   Zones: Normal < ${profile.zones.normal.toFixed(1)}, Critical > ${profile.zones.critical.toFixed(1)}`);
console.log(`   (Customized for THIS machine based on 24h history)`);

// 2. EFFICIENCY HARDENER
console.log('\n[2] GOLDEN POINT DISCOVERY 💰');
const golden = hardener.findGoldenPoint();
console.log(`   Recommendation: ${golden.recommendation}`);
console.log(`   Stats: ${golden.powerMw}MW @ ${golden.efficiencyPercent}% Eff`);
console.log(`   Wear Factor: ${golden.wearFactor} (Low)`);

// 3. DRAWING ANNOTATIONS
console.log('\n[3] FIELD NOTES (Knowledge Lock-in) 📝');
const noteResult = linker.annotateDocument('D42', 'WARNING: Bolt #3 requires custom 12mm wrench (Tool ID: T-800).');
console.log(`   Added Note to D42. Success: ${noteResult.success}`);
const notes = linker.getNotes('D42');
console.log(`   Retrieving Notes for D42:`);
notes.forEach(n => console.log(`      - "${n}"`));

// 4. OPERATOR DASHBOARD
console.log('\n[4] OPERATOR\'S COMMAND CENTER 🖥️');
const view = ops.getDashboard();
console.log(`   STATUS: ${view.shiftStatus}`);
console.log(`   HEALTH: ${view.plantHealth}%`);
console.log(`   PROFIT: €${view.profitPerHour}/hr`);
console.log(`   NEXT: "${view.nextAction}"`);

console.log('\n✅ CALIBRATION COMPLETE. The Instrument is Tuned.');
