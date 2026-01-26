/**
 * SCADA NERVOUS SYSTEM DEMONSTRATION
 * 
 * Complete demonstration of:
 * 1. Three Voices Integration (PLC, Protection, Civil)
 * 2. Trash Rack "Money Leak" Calculation
 * 3. Field Resistance "Rotor Cramp" Detection
 * 4. Global Health Dashboard with Tie-Breaker Logic
 */

import { SCADAHeartbeat } from '../services/SCADAHeartbeat';
import { TrashRackMonitor } from '../services/TrashRackMonitor';
import { CubicleInterface } from '../services/CubicleInterface';
import { GlobalHealthDashboard, type SystemHealth, type SystemIssue } from '../services/GlobalHealthDashboard';
import { AssetNodeType, type AssetNode } from '../models/AssetHierarchy';

// ============================================================================
// DEMO 1: THE THREE VOICES
// ============================================================================

export function demonstrateSCADAHeartbeat() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 DEMO 1: THE THREE VOICES OF THE FORTRESS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const scada = new SCADAHeartbeat();

    // Simulate data from all three voices
    const snapshot = scada.collectAllVoices(
        // PLC Voice - Process Data
        {
            turbineRPM: 500,
            turbinePower: 4500, // kW
            guideVaneOpening: 85,
            inletPressure: 15.2,
            outletPressure: 1.5,
            flowRate: 12.5,
            bearingTemps: {
                guideBearing: 48,
                thrustBearing: 52,
                generatorBearing: 55
            },
            oilPressure: 2.1,
            oilTemperature: 42,
            coolingFlowRate: 180,
            coolingInletTemp: 15,
            coolingOutletTemp: 22
        },
        // Protection Voice - Electrical Faults
        {
            generatorFaults: {
                overcurrent_51: false,
                differential_87: false,
                groundFault_64: false,
                reversepower_32: false
            },
            excitationData: {
                fieldCurrent: 145,
                fieldVoltage: 210,
                ratedResistance: 1.5,
                fieldResistance: 1.45,
                resistanceDeviation: 3.3,
                alarm: false,
                alarmMessage: ''
            },
            transformerFaults: {
                overtemperature: false,
                bucholzAlarm: false,
                differentialTrip: false
            }
        },
        // Civil Voice - Infrastructure
        {
            upstreamLevel: 152.5,
            downstreamLevel: 150.0,
            reservoirLevel: 155.0,
            trashRackUpstreamLevel: 152.3,
            trashRackDownstreamLevel: 151.8,
            ambientTemperature: 18,
            waterTemperature: 12,
            sedimentLevel: 25,
            damDeformation: 0.2,
            foundationSettlement: 1.5,
            vibrationLevel: 3.2
        }
    );

    console.log('📊 SCADA SNAPSHOT');
    console.log(`Timestamp: ${snapshot.timestamp.toISOString()}`);
    console.log(`Overall Quality: ${snapshot.overallQuality}\n`);

    console.log('🔧 PLC VOICE (Process Data):');
    console.log(`  Turbine RPM: ${snapshot.plcVoice.turbineRPM} RPM`);
    console.log(`  Power: ${snapshot.plcVoice.turbinePower} kW`);
    console.log(`  Guide Vane: ${snapshot.plcVoice.guideVaneOpening}%`);
    console.log(`  Flow Rate: ${snapshot.plcVoice.flowRate} m³/s`);
    console.log(`  Oil Pressure: ${snapshot.plcVoice.oilPressure} bar ✅\n`);

    console.log('⚡ PROTECTION VOICE (Electrical):');
    console.log(`  Field Current: ${snapshot.protectionVoice.excitationData.fieldCurrent} A`);
    console.log(`  Field Voltage: ${snapshot.protectionVoice.excitationData.fieldVoltage} V`);
    console.log(`  Field Resistance: ${snapshot.protectionVoice.excitationData.fieldResistance.toFixed(3)} Ω`);
    console.log(`  Resistance Deviation: ${snapshot.protectionVoice.excitationData.resistanceDeviation.toFixed(1)}%`);
    if (snapshot.protectionVoice.excitationData.alarm) {
        console.log(`  ⚠️ ALARM: ${snapshot.protectionVoice.excitationData.alarmMessage}\n`);
    } else {
        console.log(`  Status: HEALTHY ✅\n`);
    }

    console.log('🌊 CIVIL VOICE (Infrastructure):');
    console.log(`  Upstream Level: ${snapshot.civilVoice.upstreamLevel} m`);
    console.log(`  Downstream Level: ${snapshot.civilVoice.downstreamLevel} m`);
    console.log(`  Reservoir Level: ${snapshot.civilVoice.reservoirLevel} m`);
    console.log(`  Foundation Settlement: ${snapshot.civilVoice.foundationSettlement} mm`);
    console.log(`  Dam Deformation: ${snapshot.civilVoice.damDeformation} mm ✅\n`);
}

// ============================================================================
// DEMO 2: THE MONEY LEAK (Trash Rack Clogging)
// ============================================================================

export function demonstrateMoneyLeak() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('💰 DEMO 2: THE MONEY LEAK - Trash Rack Clogging');
    console.log('═══════════════════════════════════════════════════════════\n');

    const monitor = new TrashRackMonitor(0.08); // €0.08 per kWh

    // Scenario 1: Clean racks
    console.log('📍 SCENARIO 1: Clean Trash Racks');
    const clean = monitor.monitorTrashRack(
        152.1, // upstream level
        152.0, // downstream level
        12.5,  // flow rate (m³/s)
        150.0  // design head
    );

    console.log(`  Head Loss: ${clean.headLoss.toFixed(2)}m`);
    console.log(`  Severity: ${clean.severity}`);
    console.log(`  Power Loss: ${clean.powerLoss.toFixed(0)}kW`);
    console.log(`  ${clean.recommendation}\n`);

    // Scenario 2: Moderate clogging (leaves starting to accumulate)
    console.log('📍 SCENARIO 2: Moderate Clogging (Leaves)');
    const moderate = monitor.monitorTrashRack(
        152.3, // upstream level
        152.0, // downstream level
        12.5,  // flow rate
        150.0  // design head
    );

    console.log(`  Head Loss: ${moderate.headLoss.toFixed(2)}m`);
    console.log(`  Severity: ${moderate.severity}`);
    console.log(`  Power Loss: ${moderate.powerLoss.toFixed(0)}kW`);
    console.log(`  Daily Cost: €${moderate.dailyCost.toFixed(2)}`);
    console.log(`  ${moderate.recommendation}\n`);

    // Scenario 3: CRITICAL CLOGGING (> 0.5m threshold!)
    console.log('📍 SCENARIO 3: CRITICAL CLOGGING (>0.5m)');
    const critical = monitor.monitorTrashRack(
        152.7, // upstream level
        152.0, // downstream level
        12.5,  // flow rate
        150.0  // design head
    );

    console.log(`  Head Loss: ${critical.headLoss.toFixed(2)}m ⚠️`);
    console.log(`  Severity: ${critical.severity}`);
    console.log(`  Power Loss: ${critical.powerLoss.toFixed(0)}kW`);
    console.log(`  Efficiency Loss: ${critical.efficiencyLoss.toFixed(1)}%`);
    console.log(`  Daily Cost: €${critical.dailyCost.toFixed(2)}`);
    console.log(`  Cleaning Urgency: ${critical.cleaningUrgency}`);
    console.log(`  ${critical.recommendation}\n`);

    // THE MONEY LEAK CALCULATION
    console.log('🧮 THE MAGIC FORMULA: P = ρ · g · Q · ΔH');
    const leak = monitor.calculateMoneyLeak(12.5, 0.7);
    console.log(leak.explanation);
}

// ============================================================================
// DEMO 3: THE ROTOR CRAMP (Field Resistance Alarm)
// ============================================================================

export function demonstrateRotorCramp() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔥 DEMO 3: THE ROTOR CRAMP - Field Resistance Alarm');
    console.log('═══════════════════════════════════════════════════════════\n');

    const cubicle = new CubicleInterface();

    // Scenario 1: Healthy excitation
    console.log('📍 SCENARIO 1: Healthy Excitation System');
    const healthy = cubicle.monitorFieldResistance(
        150,  // field current (A)
        225,  // field voltage (V)
        1.5,  // rated resistance (Ω)
        'GEN_01'
    );

    console.log(`  Field Current: ${healthy.fieldCurrent} A`);
    console.log(`  Field Voltage: ${healthy.fieldVoltage} V`);
    console.log(`  Field Resistance: ${healthy.fieldResistance.toFixed(3)} Ω`);
    console.log(`  Resistance Deviation: ${healthy.resistanceDeviation.toFixed(1)}%`);
    console.log(`  Alarms: ${healthy.alarms.length === 0 ? 'None ✅' : healthy.alarms.length}\n`);

    // Scenario 2: ROTOR CRAMP! (Shorted turns - resistance drops 15%)
    console.log('📍 SCENARIO 2: ROTOR CRAMP DETECTED! (Shorted Turns)');
    const cramp = cubicle.monitorFieldResistance(
        180,  // field current increased (short circuit path)
        225,  // field voltage same
        1.5,  // rated resistance
        'GEN_01'
    );

    console.log(`  Field Current: ${cramp.fieldCurrent} A (↑ INCREASED!)`);
    console.log(`  Field Voltage: ${cramp.fieldVoltage} V`);
    console.log(`  Field Resistance: ${cramp.fieldResistance.toFixed(3)} Ω (↓ DROPPED!)`);
    console.log(`  Resistance Deviation: ${cramp.resistanceDeviation.toFixed(1)}% ⚠️`);
    console.log(`  Alarms: ${cramp.alarms.length}\n`);

    if (cramp.alarms.length > 0) {
        cramp.alarms.forEach(alarm => {
            console.log(`  🚨 ${alarm.severity} - ${alarm.parameter}`);
            console.log(`     ${alarm.diagnosis}`);
            console.log(`     ${alarm.recommendation}\n`);
        });
    }

    // SCADA Handshake - Link to asset
    console.log('📡 DATA HANDSHAKE: Excitation Cubicle → Generator Asset');
    const generatorAsset: AssetNode = {
        id: 'GEN_01',
        path: 'Unit_01/Generator',
        name: 'Generator Unit 1',
        type: AssetNodeType.GENERATOR,
        children: [],
        telemetryEnabled: true,
        sensorIds: [],
        metadata: {
            manufacturer: 'MockGen',
            criticality: 'CRITICAL'
        }
    };

    const link = cubicle.linkCubicleToAsset(cramp, generatorAsset);
    console.log(`  Asset: ${link.assetName}`);
    console.log(`  Electrical Health: ${link.electricalHealth}`);
    console.log(`  Mechanical Health: ${link.mechanicalHealth}`);
    console.log(`  Combined Health: ${link.combinedHealth}`);
    console.log(`  Recommendations: ${link.recommendations.length}\n`);
}

// ============================================================================
// DEMO 4: THE LEADERBOARD OF TROUBLE (Global Health Dashboard)
// ============================================================================

export function demonstrateGlobalHealthDashboard() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏆 DEMO 4: THE LEADERBOARD OF TROUBLE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const dashboard = new GlobalHealthDashboard();

    // Create example systems with issues
    const now = new Date();

    // System 1: Turbine with vibration
    const turbineIssues: SystemIssue[] = [{
        issueId: 'VIB_001',
        description: 'High vibration (8.2 mm/s)',
        severity: 'ALARM',
        safetyImpact: 8,
        productionImpact: 5,
        assetImpact: 7,
        measurementValue: 8.2,
        measurementUnit: 'mm/s',
        threshold: 7.1,
        detectedAt: now,
        timeSinceDetection: 2
    }];

    const turbine = dashboard.createSystemHealth(
        'TURB_01',
        'Turbine Unit 1',
        'TURBINE',
        turbineIssues,
        75
    );

    // System 2: Transformer with high temperature
    const transformerIssues: SystemIssue[] = [{
        issueId: 'TEMP_001',
        description: 'High winding temperature (85°C)',
        severity: 'WARNING',
        safetyImpact: 6,
        productionImpact: 4,
        assetImpact: 5,
        measurementValue: 85,
        measurementUnit: '°C',
        threshold: 80,
        detectedAt: now,
        timeSinceDetection: 4
    }];

    const transformer = dashboard.createSystemHealth(
        'XFMR_01',
        'Main Transformer',
        'TRANSFORMER',
        transformerIssues,
        82
    );

    // System 3: Civil structure with settlement
    const civilIssues: SystemIssue[] = [{
        issueId: 'SETTLE_001',
        description: 'Foundation settlement (5mm)',
        severity: 'WARNING',
        safetyImpact: 2,
        productionImpact: 1,
        assetImpact: 3,
        measurementValue: 5,
        measurementUnit: 'mm',
        threshold: 3,
        detectedAt: now,
        timeSinceDetection: 24
    }];

    const civil = dashboard.createSystemHealth(
        'CIVIL_01',
        'Foundation Powerhouse A',
        'CIVIL',
        civilIssues,
        88
    );

    // Assess station health
    const healthMap = dashboard.assessStationHealth([turbine, transformer, civil]);

    console.log('📊 STATION HEALTH SUMMARY');
    console.log(`Overall Status: ${healthMap.overallHealth}`);
    console.log(`Total Systems: ${healthMap.totalSystems}`);
    console.log(`Healthy: ${healthMap.healthySystems} | Degraded: ${healthMap.degradedSystems} | Critical: ${healthMap.criticalSystems}`);
    console.log(`Total Issues: ${healthMap.totalIssues} (${healthMap.criticalIssues} critical)\n`);

    console.log('🏆 PRIORITY LEADERBOARD (with Tie-Breaker Logic):\n');
    healthMap.systems.forEach((system, index) => {
        console.log(`${index + 1}. ${system.systemName.toUpperCase()}`);
        console.log(`   Priority Score: ${system.priorityScore.toFixed(1)} / 100`);
        console.log(`   ├─ Safety Risk: ${system.priorityBreakdown.safetyRisk.toFixed(1)} / 50`);
        console.log(`   ├─ Production Impact: ${system.priorityBreakdown.productionImpact.toFixed(1)} / 30`);
        console.log(`   └─ Asset Health: ${system.priorityBreakdown.assetHealth.toFixed(1)} / 20`);
        console.log(`   Status: ${system.healthStatus} | Urgency: ${system.urgency}`);
        console.log(`   Action: ${system.recommendedAction}\n`);
    });

    console.log(`🎯 MOST URGENT: ${healthMap.mostUrgent.systemName}`);
    console.log(`   This system needs attention FIRST!\n`);

    console.log('📋 RECOMMENDATIONS:');
    healthMap.recommendations.forEach(rec => console.log(`   ${rec}`));

    // Demonstrate tie-breaker logic
    console.log('\n\n🤼 TIE-BREAKER DEMONSTRATION\n');
    console.log('What if Transformer and Turbine have equal priority scores?');
    console.log('Let\'s force a tie and see who wins...\n');

    // Modify scores to create a tie
    const turbineEqual = { ...turbine, priorityScore: 65 };
    const transformerEqual = { ...transformer, priorityScore: 65 };

    const tieBreaker = dashboard['applyTieBreaker'](transformerEqual, turbineEqual);
    console.log(`⚖️ TIE-BREAKER RESULT:`);
    console.log(`   Winner: ${tieBreaker.winner.systemName}`);
    console.log(`   Loser: ${tieBreaker.loser.systemName}`);
    console.log(`   Rule Applied: ${tieBreaker.rule}`);
    console.log(`   Explanation: ${tieBreaker.explanation}\n`);
}

// ============================================================================
// RUN ALL DEMOS
// ============================================================================

export function runAllSCADADemos() {
    demonstrateSCADAHeartbeat();
    demonstrateMoneyLeak();
    demonstrateRotorCramp();
    demonstrateGlobalHealthDashboard();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ ALL SCADA DEMOS COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\nThe fortress now has a complete nervous system:');
    console.log('  🔧 PLC Voice - Process control');
    console.log('  ⚡ Protection Voice - Electrical safety');
    console.log('  🌊 Civil Voice - Infrastructure monitoring');
    console.log('  💰 Money Leak Calculator - Trash rack economics');
    console.log('  🔥 Rotor Cramp Detector - Field resistance diagnostics');
    console.log('  🏆 Global Health Dashboard - Priority ranking with tie-breaker\n');
}

// Auto-run if executed directly
if (require.main === module) {
    runAllSCADADemos();
}
