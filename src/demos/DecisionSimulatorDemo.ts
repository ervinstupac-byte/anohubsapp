/**
 * PHASE 17 DEMO: THE DECISION SIMULATOR 🔮
 * 🔮 What-If Analysis (Overload/Sand)
 * ⏳ Fatigue Profit Link (Real Cost of Wear)
 * 🗓️ True Wear Scheduler (Predictive Dates)
 * 📈 Strategic Plan Generator (CEO Report)
 */

import { DecisionSimulator } from '../services/DecisionSimulator';
import { TrueWearScheduler } from '../services/TrueWearScheduler';
import { StrategicPlanGenerator } from '../services/StrategicPlanGenerator';

const simulator = new DecisionSimulator();
const scheduler = new TrueWearScheduler();
const strategist = new StrategicPlanGenerator();

console.log('🏛️ THE DECISION SIMULATOR (Phase 17.0) 🏛️');
console.log('==========================================');

// 1. WHAT-IF ENGINE
console.log('\n[1] WHAT-IF ENGINE 🔮');
// Scenario A: Greedy - 110% Overload for 3 days
const simA = simulator.simulateScenario('OVERLOAD_110', 3);
console.log(`   Simulation A: "Run 110% for 3 days"`);
console.log(`   - Revenue Gain: +€${simA.revenueGain.toLocaleString()}`);
console.log(`   - Fatigue Cost: -€${simA.fatigueCost.toLocaleString()}`);
console.log(`   - Net Profit:   ${simA.netProfit > 0 ? '+' : ''}€${simA.netProfit.toLocaleString()}`);
console.log(`   👉 RECOMENDATION: ${simA.recommendation}`);

// Scenario B: Reckless - Ignore Sand Warning for 2 days
const simB = simulator.simulateScenario('IGNORE_SAND_WARNING', 2);
console.log(`\n   Simulation B: "Ignore Sand Warning for 2 days"`);
console.log(`   - Revenue Gain: +€${simB.revenueGain.toLocaleString()}`);
console.log(`   - Fatigue Cost: -€${simB.fatigueCost.toLocaleString()}`);
console.log(`   - Net Profit:   €${simB.netProfit.toLocaleString()}`);
console.log(`   👉 RECOMENDATION: ${simB.recommendation} 🔥`);

// 2. TRUE WEAR SCHEDULER
console.log('\n[2] TRUE WEAR SCHEDULER 🗓️');
// Reality: High Sand Rate (0.1mm/day)
const prediction = scheduler.predictNextOverhaul(2.5, 0.1, 5000);
console.log(`   Current State: 2.5mm Erosion (50% Worn)`);
console.log(`   Sand Rate: 0.1mm/day (High!)`);
console.log(`   📅 PREDICTED KILL DATE: ${prediction.predictedDate.toDateString()}`);
console.log(`   Reason: ${prediction.reason}`);

// 3. STRATEGIC PLAN
console.log('\n[3] CEO STRATEGIC PLAN 📈');
const plan = strategist.generatePlan(2026);
console.log(plan);

console.log('✅ FUTURE SIMULATED. The Fortress decides with Math, not Hope.');
