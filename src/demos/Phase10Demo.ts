/**
 * PHASE 10 DEMO: THE MASTER COMMAND BRIDGE
 * The Grand Weave v1.0
 */

import { ThermalCompensator } from '../services/ThermalCompensator';
import { OilHealthMonitor } from '../services/OilHealthMonitor';
import { MasterDashboardService } from '../services/MasterDashboardService';
import { GlobalHealthDashboard } from '../services/GlobalHealthDashboard';
import { MorningReportGenerator } from '../services/MorningReportGenerator';
import { AuxiliaryMonitor } from '../services/AuxiliaryMonitor';
import { createKaplanAssetTree } from '../models/AssetHierarchy';

const thermal = new ThermalCompensator();
const oilChemist = new OilHealthMonitor();
const ghDashboard = new GlobalHealthDashboard();
// We need to mock report generator as it needs history
const auxMonitor = new AuxiliaryMonitor();

console.log('🏛️ THE MASTER COMMAND BRIDGE (Phase 10.0) 🏛️');
console.log('==============================================');

// 1. THERMAL ADAPTATION
console.log('\n[1] THERMAL ADAPTATION (Labyrinth Gap)');
const baseGap = 1.0; // mm at 20C
const temps = [20, 45, 60];
temps.forEach(t => {
    const limit = thermal.getAdjustedThreshold(baseGap, t, 1000); // 1000mm diameter
    console.log(`   Temp ${t}°C -> New Alarm Threshold: ${limit.toFixed(3)} mm (Compensation: ${(baseGap - limit).toFixed(3)} mm)`);
});

// 2. CHEMICAL PASSPORT (Oil Health)
console.log('\n[2] CHEMICAL GUARD (Oil TAN)');
const freshOil = oilChemist.checkOilHealth(0.1, 10, 50);
console.log(`   Fresh Oil: Score ${freshOil.score}/100 - ${freshOil.tanStatus}`);
const acidOil = oilChemist.checkOilHealth(0.6, 20, 100);
console.log(`   Acidic Oil (TAN 0.6): Score ${acidOil.score}/100 - ${acidOil.tanStatus} (${acidOil.degradationReason})`);

// 3. CIVIL GUARDIAN
console.log('\n[3] CIVIL GUARDIAN (Hierarchy Check)');
const tree = createKaplanAssetTree(); // Has the updates
const civil = tree.children.find(c => c.name.includes('Structure'));
console.log(`   Node Found: ${civil?.name}`);
console.log(`   Max Tilt Spec: ${civil?.metadata?.specifications?.maxTiltMMperM} mm/m`);

// 4. MASTER DASHBOARD AGGREGATION
console.log('\n[4] MASTER DASHBOARD DISPLAY (The Grand Weave)');

// Mock Data Injection with Doc Links
const mockSystems = [
    // Librarian Ant Test:
    ghDashboard.createSystemHealth('PELTON', 'Pelton Turbine', 'TURBINE', [{
        issueId: 'SAND_MONSTER', description: 'Sand Erosion (Buckets)', severity: 'ALARM',
        safetyImpact: 2, productionImpact: 8, assetImpact: 9, detectedAt: new Date(), timeSinceDetection: 12
    }], 85),
    ghDashboard.createSystemHealth('OIL_SYS', 'Lube Oil System', 'HYDRAULIC', [{
        issueId: 'ACID_OIL', description: 'Chemical Degradation (TAN 0.6)', severity: 'ALARM',
        safetyImpact: 2, productionImpact: 5, assetImpact: 9, detectedAt: new Date(), timeSinceDetection: 24
    }], 60)
];
const healthMap = ghDashboard.assessStationHealth(mockSystems);

const mockReportGen = new MorningReportGenerator([], ghDashboard, []); // Empty history for mockup
const mockReport = mockReportGen.generateReport();
mockReport.metrics.totalMoneyLeakToday = 200.00; // Base leak (e.g. trash rack)

const auxStatus = {
    hpu: auxMonitor.checkHPUMuscle(45, '16/14/11'),
    cooling: auxMonitor.checkCoolingWater(0.2, true),
    dcFromBridge: auxMonitor.checkStartReadiness(110, 25)
};

const masterService = new MasterDashboardService(ghDashboard, mockReportGen, auxMonitor);
const dashboard = masterService.compileDashboard(healthMap, mockReport, auxStatus);

console.log(`\n-----------------------------------------`);
console.log(` STATUS: [${dashboard.overallStatus}] | HEALTH SCORE: ${dashboard.globalHealthScore.toFixed(0)}%`);
console.log(` TOTAL MONEY LEAK: €${dashboard.totalMoneyLeak.toFixed(2)} / day (Includes Gap Loss 🍭)`);
console.log(`-----------------------------------------`);
console.log(` CRITICAL ALARMS (With Librarian Links 📚):`);
dashboard.criticalAlarms.forEach(a => console.log(`  - ${a}`));
console.log(`-----------------------------------------`);
console.log(` VITAL ORGANS:`);
console.log(`  HPU: ${dashboard.vitalOrgans.hpu.status}`);
console.log(`  DC: ${dashboard.vitalOrgans.dcSystem.message}`);
console.log(`-----------------------------------------`);

console.log('\n✅ The Grand Weave v1.0: Station Fully croched and protected.');
console.log('SYSTEM v1.1 ABSOLUTE: The Fortress is Eternal and the Ant is a Hero!');
