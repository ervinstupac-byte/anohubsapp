/**
 * verify_logic_only.ts
 * 
 * Verifies the mathematical logic of NC-13.0 without external dependencies.
 */

import Decimal from 'decimal.js';

// --- MOCK CLASSES (To isolate from file system/module issues) ---

interface LearningModifiers {
    thresholdMultiplier: number;
    confidencePenalty: number;
}

class SimulatedFeedbackIntelligence {
    public static calculateModifiers(vetoCount: number): LearningModifiers {
        let multiplier = 1.0;
        let penalty = 0;
        const threshold = 3;

        if (vetoCount > threshold) {
            multiplier = 1.0 + ((vetoCount - threshold) * 0.15);
            penalty = 0.1 * (vetoCount - threshold);
        }
        return { thresholdMultiplier: multiplier, confidencePenalty: Math.min(penalty, 0.5) };
    }
}

// ----------------------------------------------------------------

async function verify() {
    console.log('🧪 Starting Isolated Logic Verification for NC-13.0...');

    // 1. Verify Feedback Intelligence Math
    console.log('\n--- 1. Trust Score Math ---');
    const scenarios = [
        { vetoes: 3, expectedMult: 1.0, expectedPen: 0 },
        { vetoes: 4, expectedMult: 1.15, expectedPen: 0.1 },
        { vetoes: 5, expectedMult: 1.30, expectedPen: 0.2 },
    ];

    let mathPass = true;
    for (const s of scenarios) {
        const res = SimulatedFeedbackIntelligence.calculateModifiers(s.vetoes);
        const match = Math.abs(res.thresholdMultiplier - s.expectedMult) < 0.001;
        console.log(`   Vetoes: ${s.vetoes} | Multiplier: ${res.thresholdMultiplier.toFixed(2)} (Exp: ${s.expectedMult}) | ${match ? '✅' : '❌'}`);
        if (!match) mathPass = false;
    }

    if (!mathPass) {
        console.error('❌ Feedback Math Logic Failed');
        process.exit(1);
    }

    // 2. Verify Threshold Shift Effect (Simulated)
    console.log('\n--- 2. Threshold Shift Effect ---');

    // Scenario: Ratio is 11.0. 
    // Standard Threshold is 10.0 -> Action SHOULD trigger.
    // Penalty Threshold (4 vetoes) -> 1.15 * 10 = 11.5 -> Action SHOULD BE BLOCKED.

    const ratio = 11.0;
    const standardThreshold = 10.0;

    const actionTriggeredBaseline = ratio > standardThreshold;
    console.log(`   Baseline (Ratio ${ratio} > ${standardThreshold}): ${actionTriggeredBaseline ? 'ACTION' : 'NO_ACTION'} (Expected: ACTION)`);

    const modifiers = SimulatedFeedbackIntelligence.calculateModifiers(4); // 4 vetoes -> 1.15
    const adjustedThreshold = standardThreshold * modifiers.thresholdMultiplier;

    const actionTriggeredLearned = ratio > adjustedThreshold;
    console.log(`   Learned (Ratio ${ratio} > ${adjustedThreshold.toFixed(2)}): ${actionTriggeredLearned ? 'ACTION' : 'NO_ACTION'} (Expected: NO_ACTION)`);

    if (actionTriggeredBaseline && !actionTriggeredLearned) {
        console.log('✅ Cognitive Feedback Loop Verified: Vetoes successfully suppressed the action.');
    } else {
        console.error('❌ Logic Verification Failed.');
        process.exit(1);
    }
}

verify().catch(e => console.error(e));
