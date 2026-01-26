/**
 * PHASE 18 DEMO: FLEET INTELLIGENCE 🏰📡🏰
 * 📊 Fleet Comparator (Benchmarking)
 * 📡 Lesson Transfer (Global Wisdom)
 * 🏷️ Collaborative Library (Verified Docs)
 * 📢 Fleet Command (Emergency Sync)
 */

import { FleetComparator } from '../services/FleetComparator';
import { LessonTransferCortex } from '../services/LessonTransferCortex';
import { CollaborativeLibrary } from '../services/CollaborativeLibrary';
import { FleetCommandCenter } from '../services/FleetCommandCenter';

const comparator = new FleetComparator();
const cortex = new LessonTransferCortex();
const library = new CollaborativeLibrary();
const commander = new FleetCommandCenter();

console.log('🏛️ FLEET INTELLIGENCE (Phase 18.0) 🏛️');
console.log('======================================');

// 1. FLEET COMPARATOR
console.log('\n[1] THE BENCHMARKING SCOUT 📊');
const sites = [
    { id: 'S1', name: 'Mountain Fortress', efficiencyScore: 92, reliabilityScore: 98, profitPerMw: 120 },
    { id: 'S2', name: 'Valley Station', efficiencyScore: 95, reliabilityScore: 90, profitPerMw: 110 },
    { id: 'S3', name: 'River Outpost', efficiencyScore: 88, reliabilityScore: 99, profitPerMw: 105 }
];
const ranking = comparator.compareSites(sites);
console.log(`   👑 Efficiency King: ${ranking.efficiencyKing} (${sites.find(s => s.name === ranking.efficiencyKing)?.efficiencyScore}%)`);
console.log(`   👑 Reliability King: ${ranking.reliabilityKing} (${sites.find(s => s.name === ranking.reliabilityKing)?.reliabilityScore}%)`);
console.log(`   👑 Profit King: ${ranking.profitKing}`);

// 2. LESSON TRANSFER
console.log('\n[2] GLOBAL LESSON TRANSFER 📡');
// Scenario: Mountain Fortress solves "Vibration"
const alerts = cortex.broadcastLesson({
    incidentType: 'High Vibration',
    solution: 'Adjusted Guide Vane Closing Time to 5.2s',
    originSite: 'Mountain Fortress',
    timestamp: new Date()
});
alerts.forEach(a => console.log(`   ${a}`));

// 3. COLLABORATIVE LIBRARY
console.log('\n[3] COLLABORATIVE LIBRARY 🏷️');
// Site A (Mountain) verifies Drawing 42
library.markAsSolution('Drawing 42', 'Mountain Fortress', 'Surge Control');
// Site B (Valley) looks it up
const verification = library.checkVerification('Drawing 42');
console.log(`   Site B Query 'Drawing 42': ${verification}`);

// 4. FLEET COMMAND CENTER
console.log('\n[4] EMERGENCY FLEET COMMAND 📢');
// Flood Scenario: 16m River Level
const commands = commander.initiateFloodProtocol(16000);
console.log(`   🚨 LEVEL 16.0m DETECTED. COORDINATING FLEET:`);
commands.forEach(cmd => {
    console.log(`   -> [${cmd.siteId}]: ${cmd.action} (${cmd.urgency})`);
});

console.log('\n✅ FLEET CONNECTED. The Valley speaks as One.');
