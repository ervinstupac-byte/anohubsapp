/**
 * PHASE 12 DEMO: THE UNSEEN FORCES (Francis Module)
 * 🌊 Water Hammer
 * 👻 Linkage Ghost
 * ⏳ Fatigue Clock
 * 🍯 Sweet Spot
 */

import { WaterHammerMonitor } from '../services/WaterHammerMonitor';
import { LinkageHealthMonitor } from '../services/LinkageHealthMonitor';
import { FatigueTracker } from '../services/FatigueTracker';
import { EfficiencyCurveTracker } from '../services/EfficiencyCurveTracker';

const hammer = new WaterHammerMonitor();
const ghostHunter = new LinkageHealthMonitor();
const clock = new FatigueTracker(5000); // 5000 points already used
const honeyGuide = new EfficiencyCurveTracker();

console.log('🏛️ THE UNSEEN FORCES (Phase 12.0) 🏛️');
console.log('=======================================');

// 1. WATER HAMMER TEST
console.log('\n[1] THE WATER HAMMER EAR 🌊');
const p1 = hammer.checkPressure(10.0, true);
setTimeout(() => {
    // Simulate Instant Closure (Trip) -> Pressure Spike
    const p2 = hammer.checkPressure(14.5, true); // Jumped 4.5 bar in <1s
    console.log(`   Event 1: ${p2.message} (Rise: ${p2.riseRateBarPerSec.toFixed(1)} bar/s)`);

    // Simulate Design Breach
    const p3 = hammer.checkPressure(16.0, true);
    console.log(`   Event 2: ${p3.message}`);
}, 100);

// 2. LINKAGE GHOST TEST
console.log('\n[2] THE LINKAGE GHOST 👻');
// Healthy
console.log(`   Case A: Servo 50% vs Gate 50.1% -> ${ghostHunter.checkLinkage(50, 50.1, 'STABLE').status}`);
// Hysteresis
const ghost = ghostHunter.checkLinkage(50, 54.0, 'CLOSING');
console.log(`   Case B: Servo 50% vs Gate 54.0% -> ${ghost.status}`);
console.log(`   "${ghost.recommendation}"`);

// 3. FATIGUE CLOCK TEST
console.log('\n[3] THE FATIGUE CLOCK ⏳');
// Normal Stop
const stop = clock.addEvent('STOP');
console.log(`   Normal Stop: +${stop.recentPointsAdded} pt. Life: ${stop.remainingLifePercent.toFixed(2)}%`);
// Emergency Trip
const trip = clock.addEvent('TRIP');
console.log(`   💥 EMERGENCY TRIP: +${trip.recentPointsAdded} pts!`);
console.log(`   "${trip.alert}"`);

// 4. SWEET SPOT TRACKER
console.log('\n[4] THE SWEET SPOT 🍯');
// In Zone
const good = honeyGuide.checkSweetSpot(84); // BEP is 85
console.log(`   Gate 84%: ${good.currentEfficiency.toFixed(1)}% Eff - ${good.message}`);
// Out of Zone
const bad = honeyGuide.checkSweetSpot(50);
console.log(`   Gate 50%: ${bad.currentEfficiency.toFixed(1)}% Eff - ${bad.message}`);

console.log('\n✅ UNSEEN FORCES EXPOSED. The Fortress knows its pain.');
