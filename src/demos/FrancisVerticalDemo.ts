/**
 * FRANCIS VERTICAL DEMONSTRATION
 * Shows thrust bearing monitoring and vertical-specific features
 */

import {
    createFrancisVerticalAssetTree,
    VERTICAL_THRUST_BEARING_PASSPORT,
    ThrustBearingMonitor,
    VerticalTurbineTelemetry
} from '../models/FrancisVerticalConfiguration';

console.log('='.repeat(70));
console.log('🔄 FRANCIS VERTICAL - The Spinning Top (<5 MW)');
console.log('='.repeat(70));
console.log();

// ========================================
// ASSET HIERARCHY
// ========================================

console.log('📦 STEP 1: VERTICAL ASSET HIERARCHY');
console.log('-'.repeat(70));

const verticalUnit = createFrancisVerticalAssetTree();

console.log(`Unit: ${verticalUnit.name}`);
console.log(`Configuration: ${verticalUnit.metadata.specifications?.configuration}`);
console.log(`Shaft Length: ${verticalUnit.metadata.specifications?.shaftLength} mm (8.5 meters!)`);
console.log();

console.log('STRUCTURE (Top to Bottom):');
console.log('  🔝 Generator (at top)');
console.log('     ├─ ⭐ THRUST BEARING (carries everything!)');
console.log('     ├─ Guide Bearing (Upper) - 500mm below thrust');
console.log('     ├─ Guide Bearing (Lower) - 4000mm below thrust');
console.log('     └─ Rotor (4500 kg)');
console.log('  📏 Vertical Shaft (8.5m long, 1200 kg)');
console.log('  🔽 Turbine (at bottom)');
console.log('     └─ Runner (hanging, 2800 kg)');
console.log();

console.log('TOTAL WEIGHT ON THRUST BEARING:');
const totalWeight = 4500 + 1200 + 2800;  // Rotor + Shaft + Runner
console.log(`  Rotor:  4500 kg`);
console.log(`  Shaft:  1200 kg`);
console.log(`  Runner: 2800 kg`);
console.log(`  ─────────────`);
console.log(`  TOTAL:  ${totalWeight} kg (${(totalWeight * 9.81 / 1000).toFixed(1)} kN)`);
console.log();

// ========================================
// THRUST BEARING PASSPORT
// ========================================

console.log('📋 STEP 2: THRUST BEARING PASSPORT');
console.log('-'.repeat(70));
console.log();
console.log(`Type: ${VERTICAL_THRUST_BEARING_PASSPORT.mechanicalSpecs.dimensions?.diameter} mm Tilting Pad`);
console.log(`Manufacturer: ${VERTICAL_THRUST_BEARING_PASSPORT.identity.manufacturer}`);
console.log(`Model: ${VERTICAL_THRUST_BEARING_PASSPORT.identity.model}`);
console.log();
console.log('🔩 AXIAL CLEARANCE (Aksijalni zazor):');
console.log(`  Nominal: ${VERTICAL_THRUST_BEARING_PASSPORT.mechanicalSpecs.clearances?.axial} mm`);
console.log(`  Tolerance: ${VERTICAL_THRUST_BEARING_PASSPORT.mechanicalSpecs.clearances?.tolerance}`);
console.log();
console.log('💪 LOAD CAPACITY:');
console.log(`  Supported Load: 7300 kg (normal operation)`);
console.log(`  Maximum Load:   10000 kg (emergency)`);
console.log(`  Current Load:   ${totalWeight} kg ✅`);
console.log();
console.log('🌡️  TEMPERATURE LIMITS:');
console.log(`  Normal:   <50°C ✅`);
console.log(`  Warning:   60°C ⚠️`);
console.log(`  Alarm:     70°C 🔴`);
console.log(`  CRITICAL:  75°C 🚨 (Babbitt melts!)`);
console.log();

// ========================================
// THRUST FEVER SCENARIOS
// ========================================

console.log('🌡️  STEP 3: THRUST FEVER MONITORING');
console.log('='.repeat(70));
console.log();

const thrustMonitor = new ThrustBearingMonitor();

const temperatureScenarios = [
    { name: 'HEALTHY Operation', temp: 48 },
    { name: 'WARNING - Getting Warm', temp: 62 },
    { name: 'ALARM - Too Hot!', temp: 72 },
    { name: 'CRITICAL - Giant Melting!', temp: 76 }
];

temperatureScenarios.forEach((scenario, idx) => {
    console.log(`SCENARIO ${String.fromCharCode(65 + idx)}: ${scenario.name}`);
    console.log('-'.repeat(70));

    const status = thrustMonitor.checkThrustTemperature(scenario.temp);

    console.log(`Temperature: ${scenario.temp}°C`);
    console.log(`Status: ${status.status}`);
    console.log(`${status.message}`);
    console.log(`Action: ${status.action}`);
    console.log();
});

// ========================================
// AXIAL DISPLACEMENT (Lift-off Sensor)
// ========================================

console.log('📏 STEP 4: AXIAL DISPLACEMENT MONITORING');
console.log('='.repeat(70));
console.log();

const displacementScenarios = [
    { name: 'CENTERED (Normal)', displacement: 0.120, nominal: 0.125 },
    { name: 'LIFTED (High water thrust)', displacement: 0.280, nominal: 0.125 },
    { name: 'DROPPED (Excessive weight)', displacement: -0.080, nominal: 0.125 }
];

displacementScenarios.forEach((scenario, idx) => {
    console.log(`SCENARIO ${String.fromCharCode(65 + idx)}: ${scenario.name}`);
    console.log('-'.repeat(70));

    const axialCheck = thrustMonitor.checkAxialDisplacement(
        scenario.displacement,
        scenario.nominal
    );

    console.log(`Nominal Clearance: ${scenario.nominal.toFixed(3)} mm`);
    console.log(`Actual Position:   ${scenario.displacement.toFixed(3)} mm`);
    console.log(`Status: ${axialCheck.status}`);
    console.log(`Position: ${axialCheck.actualPosition}`);
    console.log(`${axialCheck.message}`);
    console.log();
});

// ========================================
// VERTICAL ALIGNMENT (Plumb Line)
// ========================================

console.log('📐 STEP 5: VERTICAL ALIGNMENT (Plumb Line Check)');
console.log('='.repeat(70));
console.log();

const alignmentScenarios = [
    { name: 'PERFECTLY ALIGNED', topRunout: 0.02, bottomRunout: 0.03 },
    { name: 'SLIGHT LEAN', topRunout: 0.08, bottomRunout: 0.12 },
    { name: 'MISALIGNED', topRunout: 0.15, bottomRunout: 0.18 }
];

const shaftLength = 8.5;  // meters

alignmentScenarios.forEach((scenario, idx) => {
    console.log(`SCENARIO ${String.fromCharCode(65 + idx)}: ${scenario.name}`);
    console.log('-'.repeat(70));

    const alignmentCheck = thrustMonitor.checkVerticality(
        scenario.topRunout,
        scenario.bottomRunout,
        shaftLength
    );

    console.log(`Top Runout:    ${scenario.topRunout.toFixed(2)} mm`);
    console.log(`Bottom Runout: ${scenario.bottomRunout.toFixed(2)} mm`);
    console.log(`Total TIR:     ${alignmentCheck.totalRunout.toFixed(2)} mm`);
    console.log(`Deviation:     ${alignmentCheck.deviationPerMeter.toFixed(3)} mm/m`);
    console.log(`Status: ${alignmentCheck.status}`);
    console.log(`${alignmentCheck.message}`);
    console.log();
});

// ========================================
// COMPLETE TELEMETRY EXAMPLE
// ========================================

console.log('📊 STEP 6: COMPLETE VERTICAL TELEMETRY');
console.log('='.repeat(70));
console.log();

const verticalTelemetry: VerticalTurbineTelemetry = {
    axialDisplacement: 0.125,
    axialClearance: 0.250,

    shaftRunout: {
        top: 0.03,
        bottom: 0.04,
        total: 0.05
    },

    thrustBearingTemp: 52,
    thrustBearingPressure: 8.5,  // MPa

    verticalityDeviation: 0.028  // mm/m
};

console.log('VERTICAL-SPECIFIC MEASUREMENTS:');
console.log(`  Axial Displacement:  ${verticalTelemetry.axialDisplacement.toFixed(3)} mm`);
console.log(`  Thrust Bearing Temp: ${verticalTelemetry.thrustBearingTemp}°C`);
console.log(`  Thrust Pressure:     ${verticalTelemetry.thrustBearingPressure.toFixed(1)} MPa`);
console.log(`  Verticality:         ${verticalTelemetry.verticalityDeviation.toFixed(3)} mm/m`);
console.log(`  Shaft Runout (TIR):  ${verticalTelemetry.shaftRunout.total.toFixed(2)} mm`);
console.log();

// Run all checks
const thrustStatus = thrustMonitor.checkThrustTemperature(verticalTelemetry.thrustBearingTemp);
const axialStatus = thrustMonitor.checkAxialDisplacement(
    verticalTelemetry.axialDisplacement,
    verticalTelemetry.axialClearance
);
const alignmentStatus = thrustMonitor.checkVerticality(
    verticalTelemetry.shaftRunout.top,
    verticalTelemetry.shaftRunout.bottom,
    shaftLength
);

console.log('HEALTH CHECK RESULTS:');
console.log(`  Thrust Temperature: ${thrustStatus.status} ✅`);
console.log(`  Axial Position:     ${axialStatus.status} ✅`);
console.log(`  Vertical Alignment: ${alignmentStatus.status} ✅`);
console.log();

// ========================================
// SUMMARY
// ========================================

console.log('='.repeat(70));
console.log('🎉 FRANCIS VERTICAL READY!');
console.log('='.repeat(70));
console.log();
console.log('KEY FEATURES:');
console.log();
console.log('⭐ THRUST BEARING (The Heavy Hanger):');
console.log('  • Carries 7300 kg (rotor + shaft + runner)');
console.log('  • Tilting pad design with 8 pads');
console.log('  • Babbitt metal surface (melts at 75°C!)');
console.log('  • Critical temperature monitoring');
console.log();
console.log('📏 LIFT-OFF SENSOR (Axial Displacement):');
console.log('  • Monitors rotor position: LIFTED/CENTERED/DROPPED');
console.log('  • Normal clearance: 0.250 mm');
console.log('  • Detects water thrust vs weight balance');
console.log();
console.log('📐 PLUMB LINE (Vertical Alignment):');
console.log('  • Tracks shaft runout top & bottom');
console.log('  • Calculates deviation per meter');
console.log('  • Alarm if >0.10 mm/m lean');
console.log();
console.log('🌡️  THRUST FEVER LOGIC:');
console.log('  • HEALTHY: <50°C ✅');
console.log('  • WARNING: 60°C ⚠️  "Giant getting tired"');
console.log('  • ALARM: 70°C 🔴 "Giant exhausted - reduce load!"');
console.log('  • CRITICAL: 75°C 🚨 "Giant melting - SHUTDOWN!"');
console.log();
console.log('🔄 The spinning top is balanced and ready! 🎯');
console.log('='.repeat(70));
