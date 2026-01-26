/**
 * PHASE 16 DEMO: THE DEEP LIBRARY 📚🔦
 * 🔍 Archive Search (Deep Reader)
 * 🖼️ Interactive Drawing (Linker)
 * 🕰️ Historical Wisdom (Precedents)
 * 📄 Public Safety Reporter (Community)
 */

import { ArchiveSearchEngine } from '../services/ArchiveSearchEngine';
import { InteractiveDrawingService } from '../services/InteractiveDrawingService';
import { HistoricalWisdomService } from '../services/HistoricalWisdomService';
import { PublicSafetyReporter } from '../services/PublicSafetyReporter';

const librarian = new ArchiveSearchEngine();
const drawer = new InteractiveDrawingService();
const historian = new HistoricalWisdomService();
const reporter = new PublicSafetyReporter();

console.log('🏛️ THE DEEP LIBRARY (Phase 16.0) 🏛️');
console.log('====================================');

// 1. ARCHIVE SEARCH
console.log('\n[1] DEEP SEARCH 🔍');
const query = 'Cavitation';
console.log(`   Searching for "${query}"...`);
const results = librarian.search(query);

results.forEach(doc => {
    console.log(`   📄 MATCH: [${doc.id}] ${doc.title} (${doc.date})`);
    console.log(`      Snippet: "${doc.snippet}"`);
});

// 2. INTERACTIVE DRAWING
console.log('\n[2] INTERACTIVE DRAWING 🖼️');
const ref = 'Drawing 42';
const path = drawer.openDrawing(ref);
console.log(`   Resolved "${ref}" -> Opening: ${path}`);
if (path.includes('Surge_Tank')) {
    console.log('   ✅ Correct File Found.');
}

// 3. HISTORICAL WISDOM
console.log('\n[3] HISTORICAL WISDOM 🕰️');
// Scenario: A "Thrust Bearing" issue triggers a lookup
const precedent = historian.findPrecedent('temperature sensor failure', 'thrust bearing');
if (precedent) {
    console.log(`   ⚠️ HISTORY FOUND: This happened before!`);
    console.log(`   See Report: [${precedent.id}] ${precedent.title} (${precedent.date})`);
    console.log(`   "${precedent.snippet}"`);
} else {
    console.log('   (No history found)');
}

// 4. PUBLIC SAFETY REPORT
console.log('\n[4] PUBLIC SAFETY REPORT 📄');
const report = reporter.generateMonthlyReport();
console.log(`   Generating Report for: ${report.month}`);
console.log(`   --------------------------------------`);
console.log(`   ✅ Safe River Days: ${report.kpi.safeRiverDays}`);
console.log(`   ⚡ Green Energy: ${report.kpi.greenEnergyMWh.toLocaleString()} MWh`);
console.log(`   🛡️ Incidents Prevented: ${report.kpi.incidentsPrevented}`);
console.log(`   Output: ${report.pdfUrl}`);

console.log('\n✅ LIBRARY OPEN. The Fortress Remembers Everything.');
