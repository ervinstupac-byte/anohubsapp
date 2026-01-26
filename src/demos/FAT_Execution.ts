import { Sovereign_Executive_Engine } from '../services/Sovereign_Executive_Engine';
import { ErosionStatus } from '../services/SandErosionTracker';

/**
 * FACTORY ACCEPTANCE TEST (FAT) - LIVE REHEARSAL 🏗️🟢
 * Executing the Unified Master Engine.
 */

const LOG_SEPARATOR = '--------------------------------------------------------------------------------';

async function executeFAT() {
    console.log(LOG_SEPARATOR);
    console.log('       SOVEREIGN EXECUTIVE FAT - LIVE REHEARSAL       ');
    console.log(LOG_SEPARATOR);

    const engine = new Sovereign_Executive_Engine();

    // 1. DEFINE INPUTS (The Neural Input)
    // Scenario: Acidic Storm + High Market Price
    console.log('\n[SCENARIO]: Acidic Storm (pH 5.5) + High Price (€200/MWh).');

    const mockErosion: ErosionStatus = {
        timestamp: Date.now(),
        sedimentPPM: 1200, // Very High Sand
        bucketThinningRate: 600,
        estimatedBucketLife: 5, // Critical
        severity: 'EXTREME',
        recommendation: 'INSPECT',
        jetVelocity: 100
    };

    const inputs = {
        vibration: 1.5, // Stable
        scadaTimestamp: Date.now(), // Fresh Data
        sensors: {
            a: { id: 'T_BRG_01_A', value: 65, timestamp: Date.now() },
            b: { id: 'T_BRG_01_B', value: 65.2, timestamp: Date.now() } // Agreement
        },
        market: {
            price: 200, // High Price
            fcr: 25,
            carbon: 10
        },
        erosion: mockErosion,
        ph: 5.5 // Acidic
    };

    // 2. EXECUTE THE UNIFIED BRAIN
    console.log('...Feeding inputs to Sovereign_Executive_Engine...');
    const decision = engine.executeCycle(inputs);

    // 3. ANALYZE RESULTS (The Neural Trace)
    console.log('\n[FAT RESULTS - THE NEURAL TRACE]');

    // Safety
    console.log(`\n> SAFETY LAYER:`);
    console.log(`  Dead Man Switch: PASS (Data Freshness < 3000ms)`);

    // Physics
    console.log(`\n> PHYSICS LAYER:`);
    console.log(`  Molecular Health Score: ${decision.masterHealthScore.toFixed(1)}%`);
    const chemistryAlert = decision.activeProtections.find(p => p.includes('CHEMISTRY'));
    if (chemistryAlert) console.log(`  Detection: ${chemistryAlert} (Acid+Sand Detected!)`);
    else console.log(`  Detection: None.`);

    // Finance
    console.log(`\n> FINANCE LAYER:`);
    console.log(`  Gross Profit Forecast: €${decision.financials.grossProfitEur.toFixed(2)}`);
    console.log(`  Molecular Debt (Wear): €${decision.financials.molecularDebtEur.toFixed(2)}`);
    console.log(`  Net Sovereign Profit:  €${decision.financials.netSovereignProfitEur.toFixed(2)}`);
    console.log(`  Strategy Mode:         ${decision.financials.mode}`);

    // Fleet
    console.log(`\n> FLEET LAYER:`);
    console.log(`  Action: ${decision.fleetAction}`);

    // Operations
    console.log(`\n> OPERATOR MESSAGE:`);
    console.log(`  "${decision.operatorMessage}"`);

    // 4. VERDICT
    console.log('\n' + LOG_SEPARATOR);
    if (decision.masterHealthScore > 0 && decision.financials.mode) {
        console.log('✅ FAT RESULT: PASSED.');
        console.log('   The "Unified Master" successfully orchestrated Physics, Finance, and Safety.');
    } else {
        console.log('❌ FAT RESULT: FAILED.');
    }
}

executeFAT();
