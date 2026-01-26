import { ErosionCorrosionSynergy } from '../services/ErosionCorrosionSynergy';
import { SovereignMemory } from '../services/SovereignMemory';
import { FinancialImpactEngine } from '../services/FinancialImpactEngine';

/**
 * MOLECULAR ACCOUNTANT CLOSEOUT ⚖️📜
 * The Final Ledger of the Learning Window.
 * 
 * Objectives:
 * 1. Calibrate Synergy Weights (River History).
 * 2. Log High-Stress Events.
 * 3. Generate the Bequest Ledger (Profit vs Life Traded).
 */

const LOG_SEPARATOR = '--------------------------------------------------------------------------------';

function runCloseout() {
    console.log(LOG_SEPARATOR);
    console.log('       MOLECULAR ACCOUNTANT - 24H CLOSEOUT       ');
    console.log(LOG_SEPARATOR);

    const memory = new SovereignMemory();

    // 1. SYNERGY CALIBRATION
    // Simulate data from the last 24h (River Sensors)
    const riverHistory = [
        { ph: 6.5, ppm: 180 }, { ph: 6.2, ppm: 200 }, { ph: 5.8, ppm: 250 }, // Acid spike
        { ph: 5.9, ppm: 220 }, { ph: 6.1, ppm: 190 }, { ph: 6.8, ppm: 150 }
    ];

    console.log('[CALIBRATIONS] Analyzing River Chemistry...');
    const calibration = ErosionCorrosionSynergy.calibrateWeights(riverHistory);
    console.log(`> Result: ${calibration.message}`);
    console.log(`> Adjustment: +${calibration.factorAdjustment} to Synergy Factor.`);

    // 2. HIGH STRESS LOGGING
    // Simulate an event where Synergy Factor > 3.0
    const highStressEvent = {
        timestamp: new Date().toISOString(),
        synergyFactor: 4.5,
        reason: 'Acid Flush + Sandstorm Duration (15 mins)'
    };

    console.log('\n[MEMORY] Logging High-Stress Event...');
    memory.saveHighStressEvent(highStressEvent);

    // Verify Log
    const log = memory.getDailyStressLog();
    console.log(`> Log Verified. Total Events Today: ${log.length}`);
    console.log(`> Latest: ${log[log.length - 1].reason} (Factor ${log[log.length - 1].synergyFactor})`);

    // 3. THE BEQUEST LEDGER
    // Calculate the Final Balance Sheet
    const energyRev = 4800; // € (Simulated)
    const fcrRev = 1500;    // €
    const carbonRev = 850;  // €
    const molecDebt = 350;  // € (Wear Cost)

    const ledger = FinancialImpactEngine.calculateNetProfit(energyRev, fcrRev, carbonRev, molecDebt);

    console.log('\n[THE BEQUEST LEDGER 📜]');
    console.log(`REVENUE STREAMS:`);
    console.log(`  ⚡ Energy Sales:      €${energyRev.toFixed(2)}`);
    console.log(`  🛡️ FCR Standby:       €${fcrRev.toFixed(2)}`);
    console.log(`  🌍 Carbon Alpha:      €${carbonRev.toFixed(2)}`);
    console.log(`COSTS:`);
    console.log(`  💸 Molecular Debt:   -€${molecDebt.toFixed(2)} (Life Traded)`);
    console.log(LOG_SEPARATOR);
    console.log(`NET SOVEREIGN PROFIT:   €${ledger.netProfit.toFixed(2)}`);
    console.log(`RETURN ON WEAR (ROI):   ${ledger.roi.toFixed(1)}%`);

    console.log('\nVERDICT: The Fortress traded €350 of Metal for €7150 of Revenue.');
    console.log('         An acceptable sacrifice for the Kingdom.');
    console.log(LOG_SEPARATOR);
}

runCloseout();
