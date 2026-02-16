/**
 * verify_simulation.ts
 * 
 * Verifies:
 * 1. SimulationEngine can run What-If scenarios.
 * 2. Sovereign_Executive_Engine respects PermissionTiers.
 */

import { SimulationEngine, SimulationInput } from '../src/services/SimulationEngine';
import { Sovereign_Executive_Engine, PermissionTier } from '../src/services/Sovereign_Executive_Engine';
import { TelemetryStream } from '../src/lib/engines/BaseTurbineEngine';

async function verify() {
    console.log('🧪 Starting NC-12.0 Validation...');

    // 1. Verify Simulation Engine
    console.log('\n--- 1. SimulationEngine (What-If) ---');
    const simulatedHistory: TelemetryStream[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: Date.now() - (24 - i) * 3600000,
        hydraulic: { powerKW: 10000, flowCMS: 50, efficiency: 0.9 },
        mechanical: { vibration: 0.05 + (Math.random() * 0.02) }, // Healthy
        electrical: {},
        sensorHealth: {}
    }));

    const result = SimulationEngine.runWhatIfAnalysis({
        history: simulatedHistory,
        baselineContext: {
            marketPriceEurPerMWh: 50,
            maintenanceHourlyRate: 200, // Standard
            replacementCost: 50000
        }
    });

    result.forEach(r => {
        console.log(`   Scenario: ${r.scenarioId} | Profit: ${r.totalProfit.toFixed(2)}€ | Wear: ${r.totalWearCost.toFixed(2)}€ | ${r.winning ? '🏆 WINNER' : ''}`);
        if (r.description) console.log(`     "${r.description}"`);
    });

    if (result.some(r => r.winning)) {
        console.log('✅ SimulationEngine successfully identified an optimal path.');
    } else {
        console.error('❌ SimulationEngine failed to pick a winner.');
        process.exit(1);
    }

    // 2. Verify Authority Gating (Permission Checks)
    console.log('\n--- 2. Authority Gating (PermissionTiers) ---');

    // We need to bypass the abstract class limitation by mocking or using a concrete instance if possible
    // Sovereign_Executive_Engine is a concrete class in our codebase (it extends BaseGuardian)
    const sovereign = new Sovereign_Executive_Engine();

    const inputs = {
        vibration: 0.05,
        scadaTimestamp: Date.now(),
        sensors: { a: {}, b: {} },
        market: { price: 50, fcr: 10, carbon: 5 },
        erosion: { sandConcentrationPPM: 10, erosionRateMmYr: 0.1, estimatedLifeYears: 20 },
        ph: 7.0,
        pelton: { // Pelton inputs to trigger advanced logic
            jetPressureBar: 20,
            needlePositionPct: 80,
            activeNozzles: 2,
            shellVibrationMm: 0.5,
            bucketHours: 1000
        }
    };

    // Case A: Read-Only
    const readOnlyDecision = sovereign.executeCycle(inputs, { tier: PermissionTier.READ_ONLY });
    console.log(`\n[READ_ONLY] Fleet Action: "${readOnlyDecision.fleetAction}"`);
    if (readOnlyDecision.fleetAction === 'NONE (Read-Only)') {
        console.log('✅ READ_ONLY Mode confirmed (Action Blocked).');
    } else {
        console.error(`❌ READ_ONLY Failed: Got "${readOnlyDecision.fleetAction}"`);
    }

    // Case B: Autonomous
    // Note: It might not output "Pelton apply: true" if safeControlAdapter logic isn't fully simulated or fails checks,
    // but we check if the LOGIC path was attempted vs Blocked.
    // If blocked by tier, opMsg contains "BLOCKED".
    // If blocked by safety, it contains something else.
    // Ideally we want to see it NOT say "BLOCKED (Tier: ...)"
    const autonomousDecision = sovereign.executeCycle(inputs, { tier: PermissionTier.AUTONOMOUS });
    console.log(`\n[AUTONOMOUS] Message: "${autonomousDecision.operatorMessage}"`);

    if (!autonomousDecision.operatorMessage.includes('BLOCKED (Tier:')) {
        console.log('✅ AUTONOMOUS Mode confirmed (Not Blocked by Tier).');
    } else {
        console.error('❌ AUTONOMOUS Failed: Logic was blocked by tier check.');
    }

    console.log('\n✨ NC-12.0 Validation Complete.');
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});
