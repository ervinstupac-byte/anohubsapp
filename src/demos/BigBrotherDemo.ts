/**
 * BIG BROTHER DEMONSTRATION
 * Shows large turbine with forced lubrication and safety shield
 */

import { FrancisBigBrotherEngine, ExtendedTelemetryStream } from '../lib/engines/FrancisBigBrotherEngine';
import {
    createForcedLubricationModule,
    createCoolingWaterModule,
    SafetyShield,
    BIG_THRUST_BEARING_PASSPORT
} from '../models/LargeTurbineAuxiliarySystems';

console.log('='.repeat(70));
console.log('🏭 BIG BROTHER: Large Francis Turbine (12 MW)');
console.log('='.repeat(70));
console.log();

// ========================================
// CREATE ASSET HIERARCHY
// ========================================

console.log('📦 STEP 1: LUBRICATION SYSTEM HIERARCHY');
console.log('-'.repeat(70));

const lubSystem = createForcedLubricationModule('Unit_02/Generator');
console.log(`Created: ${lubSystem.name}`);
console.log(`Path: ${lubSystem.path}`);
console.log();
console.log('Components:');
lubSystem.children.forEach(child => {
    console.log(`  • ${child.name} (${child.path})`);
    child.children?.forEach(subchild => {
        console.log(`    - ${subchild.name}`);
    });
});
console.log();

console.log('❄️  STEP 2: COOLING SYSTEM HIERARCHY');
console.log('-'.repeat(70));

const coolingSystem = createCoolingWaterModule('Unit_02/Generator');
console.log(`Created: ${coolingSystem.name}`);
console.log(`Path: ${coolingSystem.path}`);
console.log();
console.log('Components:');
coolingSystem.children.forEach(child => {
    console.log(`  • ${child.name}`);
});
console.log();

// ========================================
// BIG BEARING PASSPORT
// ========================================

console.log('📋 STEP 3: BIG THRUST BEARING PASSPORT');
console.log('-'.repeat(70));
console.log();
console.log(`Manufacturer: ${BIG_THRUST_BEARING_PASSPORT.identity.manufacturer}`);
console.log(`Model: ${BIG_THRUST_BEARING_PASSPORT.identity.model}`);
console.log(`Bore Diameter: ${BIG_THRUST_BEARING_PASSPORT.mechanicalSpecs.dimensions?.diameter} mm`);
console.log(`Weight: ${BIG_THRUST_BEARING_PASSPORT.mechanicalSpecs.weight} kg`);
console.log();
console.log('🛢️  OIL FLOW REQUIREMENTS:');
const oilReq = BIG_THRUST_BEARING_PASSPORT.consumables?.oilFlowRequirements;
if (!oilReq) throw new Error("Oil requirements missing!");
console.log(`  Minimum Flow:    ${oilReq.minimumFlowRate} L/min`);
console.log(`  Optimal Flow:    ${oilReq.optimalFlowRate} L/min`);
console.log(`  Minimum Pressure: ${oilReq.minimumPressure} bar ⚠️ CRITICAL!`);
console.log(`  Optimal Pressure: ${oilReq.optimalPressure} bar`);
console.log();

// ========================================
// NORMAL OPERATION
// ========================================

console.log('✅ SCENARIO 1: NORMAL OPERATION');
console.log('-'.repeat(70));

const engine = new FrancisBigBrotherEngine();
const safetyShield = new SafetyShield();

import Decimal from 'decimal.js';

const normalTelemetry: ExtendedTelemetryStream = {
    timestamp: Date.now(),
    hydraulic: {
        flow: 41.4,           // 92% of rated (near BEP)
        head: 118,
        guideVaneOpening: 90,
        efficiency: 92.5,
        waterHead: new Decimal(118),
        flowRate: new Decimal(41.4),
        cavitationThreshold: new Decimal(0.5)
    },
    mechanical: {
        rpm: 500,
        vibrationX: 2.1,
        vibrationY: 1.8,
        bearingTemp: 58,
        alignment: 0.05,
        vibration: 2.8, // Combined
        radialClearance: 0.8,
        boltSpecs: {
            grade: '8.8',
            count: 12,
            torque: 450
        }
    },
    auxiliary: {
        oilPressure: 2.5,           // ✅ Optimal
        oilTemperature: 48,
        oilFlowRate: 120,
        oilTankLevel: 85,
        coolingWaterFlow: 75,       // ✅ Good
        coolingWaterInletTemp: 22,
        coolingWaterOutletTemp: 42,
        mainPumpRunning: true,
        standbyPumpRunning: false
    }
};

console.log('Telemetry:');
console.log(`  Flow: ${normalTelemetry.hydraulic.flow} m³/s (92% load)`);
console.log(`  Oil Pressure: ${normalTelemetry.auxiliary.oilPressure} bar ✅`);
console.log(`  Cooling Flow: ${normalTelemetry.auxiliary.coolingWaterFlow} L/min ✅`);
console.log();

const allWhispers = engine.getAllWhispers(normalTelemetry);
console.log('All 7 Whispers:');
console.log('  UNIVERSAL:');
console.log(`    RPM: ${allWhispers.universal.rpm}`);
console.log(`    Power: ${allWhispers.universal.powerKW.toFixed(0)} kW`);
console.log(`    Efficiency: ${allWhispers.universal.efficiency.toFixed(1)}%`);
console.log(`    Vibration: ${allWhispers.universal.vibrationRMS.toFixed(1)} mm/s`);
console.log(`    Temperature: ${allWhispers.universal.temperature}°C`);
console.log('  AUXILIARY:');
console.log(`    Oil Pressure: ${allWhispers.auxiliary.oilPressure} bar ✅`);
console.log(`    Cooling Flow: ${allWhispers.auxiliary.coolingFlow} L/min ✅`);
console.log();

const safetyCheck = safetyShield.checkSafetyConditions(normalTelemetry.auxiliary);
console.log(`Safety Status: ${safetyCheck.tripRequired ? '🔴 TRIP!' : '✅ OK'}`);
console.log();

// ========================================
// RED ALERT SCENARIO
// ========================================

console.log('🚨 SCENARIO 2: OIL PRESSURE FAILURE');
console.log('-'.repeat(70));

const dangerTelemetry: ExtendedTelemetryStream = {
    ...normalTelemetry,
    auxiliary: {
        ...normalTelemetry.auxiliary,
        oilPressure: 0.8,           // 🚨 CRITICAL!
        mainPumpRunning: false,     // Main pump failed!
        standbyPumpRunning: false   // Standby didn't start!
    }
};

console.log('⚠️  SITUATION:');
console.log('  • Main oil pump FAILED');
console.log('  • Standby pump did NOT auto-start');
console.log(`  • Oil pressure dropped to ${dangerTelemetry.auxiliary.oilPressure} bar`);
console.log();

const emergencySafety = safetyShield.checkSafetyConditions(dangerTelemetry.auxiliary);

console.log(`🚨 SAFETY SHIELD STATUS: ${emergencySafety.tripRequired ? 'TRIP REQUIRED!' : 'OK'}`);
console.log();

if (emergencySafety.trips.length > 0) {
    console.log('TRIP CONDITIONS:');
    emergencySafety.trips.forEach(trip => {
        console.log(`  ${trip.description}`);
        console.log(`    Action: ${trip.action}`);
    });
    console.log();

    // Execute emergency shutdown
    safetyShield.executeEmergencyShutdown(emergencySafety.trips[0]);
    console.log();
}

// ========================================
// WARNING SCENARIO
// ========================================

console.log('⚠️  SCENARIO 3: LOW OIL PRESSURE WARNING');
console.log('-'.repeat(70));

const warningTelemetry: ExtendedTelemetryStream = {
    ...normalTelemetry,
    auxiliary: {
        ...normalTelemetry.auxiliary,
        oilPressure: 1.4,           // ⚠️ Below minimum but not critical
        mainPumpRunning: true
    }
};

console.log(`Oil Pressure: ${warningTelemetry.auxiliary.oilPressure} bar`);
console.log(`Threshold: 1.5 bar (minimum)`);
console.log();

const warningSafety = safetyShield.checkSafetyConditions(warningTelemetry.auxiliary);

if (warningSafety.warnings.length > 0) {
    console.log('WARNINGS:');
    warningSafety.warnings.forEach(warning => {
        console.log(`  ${warning.description}`);
        console.log(`    Recommended Action: ${warning.action}`);
    });
}
console.log();

// ========================================
// SUMMARY
// ========================================

console.log('='.repeat(70));
console.log('📊 BIG BROTHER SUMMARY');
console.log('='.repeat(70));
console.log();
console.log('SYSTEM FEATURES:');
console.log('  ✅ Forced Lubrication System (500L capacity)');
console.log('    • Main pump + Standby pump');
console.log('    • Oil tank with level monitoring');
console.log('    • Duplex filter assembly');
console.log();
console.log('  ✅ Cooling Water System');
console.log('    • Plate heat exchanger (45 kW)');
console.log('    • Circulation pump');
console.log('    • Inlet/outlet temperature monitoring');
console.log();
console.log('  ✅ 7 Whispers (5 Universal + 2 Auxiliary)');
console.log('    • Oil Pressure (CRITICAL)');
console.log('    • Cooling Flow');
console.log();
console.log('  ✅ RED ALERT SHIELD - Safety Protection');
console.log('    • Oil pressure < 1.0 bar → EMERGENCY SHUTDOWN');
console.log('    • Oil pressure < 1.5 bar → Start standby pump');
console.log('    • Cooling outlet > 55°C → TRIP');
console.log();
console.log('  ✅ Enhanced Component Passports');
console.log('    • Oil flow requirements (15-30 L/min per bearing)');
console.log('    • Pressure limits (1.5-3.5 bar)');
console.log();
console.log('🏭 Big Brother is ready to protect large turbines! 🛡️');
console.log('='.repeat(70));
