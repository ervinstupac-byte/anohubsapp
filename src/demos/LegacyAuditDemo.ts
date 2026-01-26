/**
 * LEGACY AUDIT DEMO
 * Performing the Deep Systemic Audit & Enrichment (Phase 8.0)
 */

import { DataEnricher } from '../services/DataEnricher';
import { LegacyBridge } from '../services/LegacyBridge';
import { createPeltonAssetTree } from '../models/AssetHierarchy';
import { AssetNode } from '../models/AssetHierarchy';

const enricher = new DataEnricher();
const bridge = new LegacyBridge();
const peltonTree = createPeltonAssetTree();

console.log('🏗️ DEEP SYSTEMIC AUDIT (Legacy -> v1.0) 🏗️');
console.log('============================================');

// ============================================================================
// 1. METADATA UPGRADE
// ============================================================================
console.log('\n[1] METADATA GAP ANALYSIS');
// We purposefully scan the "fresh" Pelton tree which should be mostly compliant, 
// but let's damage it to simulate an "Old Asset"
const oldRunner = peltonTree.children[0].children[0];
// Force delete some metadata to simulate legacy hole
// @ts-ignore
delete oldRunner.metadata.specifications.material;
// Force delete metadata on a subcomponent
const buckets = oldRunner.children[0];
// @ts-ignore
delete buckets.metadata.specifications; // Simulate totally missing specs

const gaps = enricher.auditAssetMetadata(peltonTree);
gaps.forEach((gap, i) => {
    console.log(`${i + 1}. [${gap.criticality}] ${gap.assetPath}`);
    console.log(`   Missing: '${gap.missingField}' -> Action: ${gap.actionRequired}`);
});

// ============================================================================
// 2. HISTORICAL PATTERN MATCH
// ============================================================================
console.log('\n[2] HISTORICAL "GHOST" ANALYSIS (Last 12 Months)');
const legacyLogs = [
    {
        date: '2025-06-15',
        type: 'VIBRATION_EVENT',
        rpm: 500,
        blades: 22,
        // BPF = 500/60 * 22 = 183 Hz. Peak close to it.
        peaks: [{ frequencyHz: 183.5, amplitudeMmS: 2.8 }],
        amplitude: 2.9,
        wasFlaggedAsHydraulic: false // Legacy missed it!
    },
    {
        date: '2025-08-20',
        type: 'HIGH_TURBIDITY',
        ppm: 4500, // Massive sand
        head: 450,
        actionTaken: 'NONE' // Operator ignored it
    }
];

const insights = enricher.analyzeHistory(legacyLogs);
insights.forEach(insight => {
    console.log(`\n📅 ${insight.date}: ${insight.event}`);
    console.log(`   👻 GHOST FOUND: ${insight.v1_0_Diagnosis}`);
});

// ============================================================================
// 3. UNIFIED DATA BRIDGE
// ============================================================================
console.log('\n[3] PLC DATA WEAVE (Tag Soup -> Heartbeat)');
const oldTags = {
    'U1_SPD_001': 500.1,
    'U1_MW_001': 11.5,
    'U1_PEN_PRESS': 44.2,
    'U1_TGB_TEMP': 62.5,
    'U1_CW_FLOW': 95 // L/min
};

const mappedVoice = bridge.bridgeExistingData(oldTags);
console.log('   Bridge Result:');
console.log(`   -> RPM: ${mappedVoice.turbineRPM} (Source: U1_SPD_001)`);
console.log(`   -> Guide Bearing: ${mappedVoice.bearingTemps?.guideBearing}°C (Source: U1_TGB_TEMP)`);
console.log(`   -> Cooling Flow: ${mappedVoice.coolingFlowRate} L/min (Source: U1_CW_FLOW)`);

// ============================================================================
// 4. GAP ANALYSIS REPORT
// ============================================================================
console.log('\n[4] THRESHOLD GAP REPORT');
const legacyLimits = {
    'DEFLECTOR_TIME_TRIP': 2.5, // Way too slow
    'JET_OFFSET_MAX': 2.0,      // Too loose
    'VIBE_TRIP_ISO': 7.0,       // Standard ISO
    'FILTER_DP_HIGH': 1.0       // Late warning
};

const gapReport = bridge.generateGapAnalysis(legacyLimits);
console.log(gapReport);

console.log('\n✨ AUDIT COMPLETE ✨');
