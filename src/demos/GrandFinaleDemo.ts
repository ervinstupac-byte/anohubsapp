/**
 * THE GRAND FINALE v1.0
 * The Ultimate Stress Test: Triple Crisis
 * 
 * Scenario:
 * 1. CIVIL CRISIS: The Sand Monster is eating the Pelton (High PPM).
 * 2. MECHANICAL CRISIS: A branch is stuck in the Kaplan (BPF Vibration).
 * 3. AUXILIARY CRISIS: The Cooling water is starving (High DeltaP).
 * 
 * Goal: Verify the Global Health Dashboard correctly prioritizes these threats.
 */

import { GlobalHealthDashboard, SystemHealth } from '../services/GlobalHealthDashboard';
import { SandErosionTracker } from '../services/SandErosionTracker';
import { VibrationExpert } from '../services/VibrationExpert';
import { AuxiliaryMonitor } from '../services/AuxiliaryMonitor';
import { KaplanEngine } from '../lib/engines/KaplanEngine';
import { MorningReportGenerator } from '../services/MorningReportGenerator';
import { SCADASnapshot } from '../services/SCADAHeartbeat';

// Instantiate the Experts
const dashboard = new GlobalHealthDashboard();
const sandMonster = new SandErosionTracker();
const vibrationExpert = new VibrationExpert();
const auxMonitor = new AuxiliaryMonitor();
const kaplanEngine = new KaplanEngine();

console.log('🌪️ THE GRAND FINALE: TRIPLE CRISIS SIMULATION 🌪️');
console.log('===================================================');

// ============================================================================
// 1. INJECT CRISIS: CIVIL (Sand Monster)
// ============================================================================
console.log('\n[1] CIVIL CRISIS: RIVER TURBIDITY');
const sandReport = sandMonster.trackErosion(3000, 140, 45); // 3000 PPM!
console.log(`   -> Sand: ${sandReport.severity} (Wear: ${sandReport.bucketThinningRate.toFixed(1)} microns/yr)`);
console.log(`   -> Advice: ${sandReport.recommendation}`);

const peltonSystem = dashboard.createSystemHealth(
    'PELTON_UNIT_01', 'Pelton High Head', 'TURBINE',
    [{
        issueId: 'SAND_EROSION',
        description: `High Sand Erosion (${sandReport.bucketThinningRate.toFixed(0)} µm/yr)`,
        severity: 'ALARM',
        safetyImpact: 2,
        productionImpact: 8, // Efficiency drops over time
        assetImpact: 9, // Buckets destroyed
        detectedAt: new Date(),
        timeSinceDetection: 12
    }],
    60
);

// ============================================================================
// 2. INJECT CRISIS: MECHANICAL (Kaplan Branch)
// ============================================================================
console.log('\n[2] MECHANICAL CRISIS: KAPLAN VIBRATION');
// BPF for 5 blades @ 125 RPM = 10.41 Hz. We inject a 3.5 mm/s peak there.
const vibrationDiag = vibrationExpert.checkFrequencyPeaks(
    [{ frequencyHz: 10.4, amplitudeMmS: 3.5 }],
    125, 5
);
console.log(`   -> Vibration: ${vibrationDiag.cause}`);
console.log(`   -> Advice: ${vibrationDiag.recommendation}`);

const kaplanSystem = dashboard.createSystemHealth(
    'KAPLAN_UNIT_01', 'Kaplan Low Head', 'TURBINE',
    [{
        issueId: 'HYDRAULIC_IMBALANCE',
        description: vibrationDiag.cause,
        severity: 'ALARM',
        safetyImpact: 4,
        productionImpact: 6,
        assetImpact: 7, // Bearings wear out
        detectedAt: new Date(),
        timeSinceDetection: 2
    }],
    75
);

// ============================================================================
// 3. INJECT CRISIS: AUXILIARY (Cooling Starvation)
// ============================================================================
console.log('\n[3] AUXILIARY CRISIS: COOLING STARVATION');
const coolingCheck = auxMonitor.checkCoolingWater(0.8, false); // Manual backwash needed
console.log(`   -> Cooling Status: ${coolingCheck.status}`);
console.log(`   -> Message: ${coolingCheck.message}`);

const coolingSystem = dashboard.createSystemHealth(
    'COOLING_SYSTEM_01', 'Station Cooling Water', 'HYDRAULIC',
    [{
        issueId: 'COOLING_STARVATION',
        description: coolingCheck.message,
        severity: 'CRITICAL',
        safetyImpact: 9, // Bearings will melt -> Fire risk
        productionImpact: 10, // Trip imminent
        assetImpact: 9, // Bearing damage
        detectedAt: new Date(),
        timeSinceDetection: 0.5
    }],
    20
);

// ============================================================================
// 4. THE INTELLIGENCE TEST (Prioritization)
// ============================================================================
console.log('\n🧠 DASHBOARD ANALYSIS (Prioritizing Threats...)');
const healthMap = dashboard.assessStationHealth([peltonSystem, kaplanSystem, coolingSystem]);

console.log(`\n🏆 LEADERBOARD OF TROUBLE (Top Priority is #${healthMap.mostUrgent.systemName})`);
healthMap.systems.forEach((sys, i) => {
    console.log(`${i + 1}. ${sys.systemName} (Priority: ${sys.priorityScore.toFixed(1)})`);
    console.log(`   - Status: ${sys.healthStatus}`);
    console.log(`   - Action: ${sys.recommendedAction}`);
    // Tie-Breaker logic is hidden inside, but Cooling should win due to Safety (9) + Production (10)
});

// ============================================================================
// 5. THE EXECUTIVE SUMMARY (Morning Report)
// ============================================================================
console.log('\n☕ GENERATING EXECUTIVE REPORT...');

// Mock SCADA History for Report
const mockSnapshot: SCADASnapshot = {
    timestamp: new Date(),
    overallQuality: 'GOOD',
    plcVoice: {
        timestamp: new Date(),
        quality: 'GOOD',
        turbineRPM: 500,
        turbinePower: 12000,
        guideVaneOpening: 80,
        inletPressure: 45,
        outletPressure: 2,
        flowRate: 3.2,
        bearingTemps: { guideBearing: 65, thrustBearing: 72, generatorBearing: 68 },
        oilPressure: 40,
        oilTemperature: 45,
        coolingFlowRate: 100, // Reduced?
        coolingInletTemp: 10,
        coolingOutletTemp: 15
    },
    protectionVoice: {
        timestamp: new Date(),
        quality: 'GOOD',
        generatorFaults: { overcurrent_51: false, differential_87: false, groundFault_64: false, reversepower_32: false },
        excitationData: { fieldCurrent: 100, fieldVoltage: 200, fieldResistance: 2, ratedResistance: 2, resistanceDeviation: 0, alarm: false },
        transformerFaults: { overtemperature: false, bucholzAlarm: false, differentialTrip: false },
        activeTrips: []
    },
    civilVoice: {
        timestamp: new Date(),
        quality: 'GOOD',
        riverLevel: 100,
        trashRackDeltaP: 15,
        ambientTemperature: 20,
        waterTemperature: 12,
        sedimentLevel: 3000, // Matching simulation
        damDeformation: 0,
        foundationSettlement: 0,
        vibrationLevel: 3.5,
        upstreamLevel: 120,
        downstreamLevel: 100,
        reservoirLevel: 120,
        trashRackUpstreamLevel: 0,
        trashRackDownstreamLevel: 0
    }
};

// Create generator
const reportGen = new MorningReportGenerator([mockSnapshot], dashboard, []);

// Generate Mock Report Object but inject our specific priorities for the text
const report = reportGen.generateReport();
// Overwrite the metrics.topPriorities with our calculated map because the generator mocks it internally usually
report.metrics.topPriorities = healthMap.systems; // Inject real data for demo display

const markdown = reportGen.generateMarkdown(report);
console.log('\n' + markdown);

console.log('\n✨ END SIMULATION ✨');
