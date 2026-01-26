/**
 * PHASE 15 DEMO: THE GUARDIAN MENTOR 👨‍🏫🛡️
 * ⚖️ Truth Judge (Conflict Resolution)
 * 🛠️ Expert Guide (Step-by-Step)
 * 🌊 Community Broadcaster (Alerts)
 * 💰 Wisdom Profit (Savings)
 */

import { TruthJudge } from '../services/TruthJudge';
import { ExpertActionGuide } from '../services/ExpertActionGuide';
import { CommunityBroadcaster } from '../services/CommunityBroadcaster';
import { WisdomProfitCalculator } from '../services/WisdomProfitCalculator';

const judge = new TruthJudge();
const guide = new ExpertActionGuide();
const broadcaster = new CommunityBroadcaster();
const banker = new WisdomProfitCalculator();

console.log('🏛️ THE GUARDIAN MENTOR (Phase 15.0) 🏛️');
console.log('=======================================');

// 1. THE TRUTH JUDGE
console.log('\n[1] THE TRUTH JUDGE ⚖️');
// Scenario: Bearing Temp Sensors Conflict
// Sensor A says 90C (Hot!), Sensor B says 62C (Normal). Pattern says 60C.
const verdict = judge.reconcileTruth(
    { id: 'TE_101_A', value: 90.0, timestamp: Date.now() },
    { id: 'TE_101_B', value: 62.0, timestamp: Date.now() },
    60.0 // Pattern Prediction
);

console.log(`   Conflict: A=90C, B=62C, Predicted=60C`);
console.log(`   ⚖️ VERDICT: ${verdict.action} (Confidence: ${verdict.confidence})`);
console.log(`   Reason: "${verdict.reason}"`);

// If we trusted A, we would have tripped. We saved a trip!
if (verdict.action === 'TRUST_B') {
    const saved = banker.registerSave('FALSE_TRIP_PREVENTED', 'Ignored faulty Sensor A');
    console.log(`   💰 SAVINGS: €${saved} (Prevented False Trip)`);
}

// 2. EXPERT ACTION GUIDE
console.log('\n[2] EXPERT ACTION GUIDE 🛠️');
// Scenario: Water Hammer Alarm Logic triggered
const alarm = 'WATER_HAMMER_CRITICAL';
const plan = guide.getGuide(alarm);

if (plan) {
    console.log(`   🚨 ALARM: ${plan.title}`);
    console.log(`   📖 REFERENCE: ${plan.drawingRef}`);
    plan.steps.forEach((step, i) => {
        console.log(`      ${i + 1}. ${step}`);
    });
} else {
    console.log('   (No guide found for this alarm)');
}

// 3. COMMUNITY BROADCASTER
console.log('\n[3] COMMUNITY BROADCASTER 🌊');
// Scenario: River rising fast
const alert = broadcaster.checkFloodGuard(14.8, true); // 14.8m, Spillway Active

if (alert) {
    console.log(`   📢 PUBLIC ALERT [${alert.level || 'WARNING'}]:`);
    console.log(`   "${alert.message}"`);
    console.log(`   (Sent via ${alert.channel})`);
}

// 4. WISDOM PROFIT SUMMARY
console.log('\n[4] THE CANDY MONEY BANK 🍭');
const report = banker.getReport();
console.log(`   Daily Wisdom Profit: €${report.dailySavingsEuro}`);
console.log(`   Projected Yearly: €${report.totalYearlyProjection.toLocaleString()}`);

console.log('\n✅ GUARDIAN MENTOR ACTIVE. The Fortress Teaches and Protects.');
