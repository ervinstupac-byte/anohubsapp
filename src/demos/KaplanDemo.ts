import { Sovereign_Executive_Engine } from '../services/Sovereign_Executive_Engine';

/**
 * KAPLAN DEMO: THE LOW-HEAD GIANT 🐜🌊
 * Verifies Phase 33.0 functionality.
 * 
 * Scenarios:
 * 1. Nominal Operation (On-Cam).
 * 2. Off-Cam Penalty (Blade mismatch).
 * 3. Environmental Breach (Hub Oil Leak).
 */

const engine = new Sovereign_Executive_Engine();

function runDemo() {
    console.log('--------------------------------------------------');
    console.log('       KAPLAN TURBINE SIMULATION (UNIT 5)     ');
    console.log('--------------------------------------------------');

    // SCENARIO 1: NOMINAL (On-Cam, Good pressure)
    // Gate 80 -> Ideal Blade ~72 (80*0.9 - (20-10)*0.5 + 5) = 72+5-5 = 72?
    // Formula: ideal = gate * 0.9 + 5 - (head - 10) * 0.5
    // Gate 80, Head 20. Ideal = 72 + 5 - 5 = 72.
    console.log('\n[TEST 1] Nominal Operation (Head 20m, Gate 80%, Blade 72%)');
    const res1 = engine.executeCycle({
        vibration: 0.5,
        scadaTimestamp: Date.now(),
        sensors: { a: {}, b: {} },
        market: { price: 50, fcr: 20, carbon: 10 },
        erosion: { bucketThinningRate: 10, accumulatedThinningMm: 0.1 },
        ph: 7.0,
        turbineType: 'KAPLAN',
        bladeAngle: 72,
        hubOilPressure: 3.0, // Water pressure approx 2 bar (20m), Differential +1.0
        tailwaterLevel: 5
    });
    console.log(`> Status: ${res1.operatorMessage}`);
    console.log(`> Protections: ${res1.activeProtections.length > 0 ? res1.activeProtections.join(', ') : 'None'}`);

    // SCENARIO 2: OFF-CAM (Blade Drift)
    // Blade at 50% (Should be 72%)
    console.log('\n[TEST 2] Off-Cam Drift (Blade stuck at 50%)');
    const res2 = engine.executeCycle({
        vibration: 0.8,
        scadaTimestamp: Date.now(),
        sensors: { a: {}, b: {} },
        market: { price: 50, fcr: 20, carbon: 10 },
        erosion: { bucketThinningRate: 10, accumulatedThinningMm: 0.1 },
        ph: 7.0,
        turbineType: 'KAPLAN',
        bladeAngle: 50, // Major deviation
        hubOilPressure: 3.0,
        tailwaterLevel: 5
    });
    console.log(`> Status: ${res2.operatorMessage}`);
    console.log(`> Protections: ${res2.activeProtections.join(', ')}`);

    // SCENARIO 3: HUB SEAL FAILURE (Environmental Risk)
    // Oil Pressure drops to 1.5 Bar. Tailwater+Runner = 15m depth (~1.5 bar).
    // Differential ~0.
    console.log('\n[TEST 3] Hub Seal Failure (Oil Pressure Loss)');
    const res3 = engine.executeCycle({
        vibration: 0.8,
        scadaTimestamp: Date.now(),
        sensors: { a: {}, b: {} },
        market: { price: 50, fcr: 20, carbon: 10 },
        erosion: { bucketThinningRate: 10, accumulatedThinningMm: 0.1 },
        ph: 7.0,
        turbineType: 'KAPLAN',
        bladeAngle: 72,
        hubOilPressure: 0.5, // CATASTROPHIC - Lower than water pressure!
        tailwaterLevel: 10   // High tailwater
    });
    console.log(`> Status: ${res3.operatorMessage}`);
    console.log(`> Protections: ${res3.activeProtections.join(' || ')}`);
    console.log(`> Mode: ${res3.financials.mode}`);

    console.log('--------------------------------------------------');
}

runDemo();
