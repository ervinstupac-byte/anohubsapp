/**
 * INTELLIGENT LUBRICATION SYSTEM DEMONSTRATION
 * Shows pump handshake, filter sneeze, and cooling checkup
 */

import {
    PumpController,
    FilterMonitor,
    HeatExchangerMonitor,
    ExtendedAuxiliaryTelemetry,
    BIG_THRUST_BEARING_ENHANCED_PASSPORT
} from '../services/IntelligentLubricationController';

console.log('='.repeat(70));
console.log('🤖 INTELLIGENT LUBRICATION SYSTEM - BIG BROTHER');
console.log('='.repeat(70));
console.log();

// ========================================
// ENHANCED BEARING PASSPORT
// ========================================

console.log('📋 STEP 1: ENHANCED BEARING PASSPORT');
console.log('-'.repeat(70));
console.log();
console.log('🚰 THIRST LEVEL (Oil Requirements):');
console.log(`  Minimum Flow:  ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.thirstLevel.minimumFlowRate} L/min 🚨`);
console.log(`  Optimal Flow:  ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.thirstLevel.optimalFlowRate} L/min ✅`);
console.log(`  Maximum Flow:  ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.thirstLevel.maximumFlowRate} L/min ⚠️`);
console.log(`  💡 ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.thirstLevel.description}`);
console.log();
console.log('🌡️  FEVER LIMIT (Temperature Thresholds):');
console.log(`  Normal:   ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.feverLimit.normalOperating}°C ✅`);
console.log(`  Warning:  ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.feverLimit.warningThreshold}°C ⚠️`);
console.log(`  Alarm:    ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.feverLimit.alarmThreshold}°C 🔴`);
console.log(`  TRIP:     ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.feverLimit.tripThreshold}°C 🚨`);
console.log(`  💡 ${BIG_THRUST_BEARING_ENHANCED_PASSPORT.feverLimit.description}`);
console.log();

// ========================================
// SCENARIO 1: THE PUMP HANDSHAKE
// ========================================

console.log('🤝 STEP 2: THE PUMP HANDSHAKE (Auto-Switch)');
console.log('='.repeat(70));
console.log();

const pumpController = new PumpController();

// Normal operation
console.log('📊 SCENARIO A: Normal Operation');
console.log('-'.repeat(70));

const normalTelemetry: ExtendedAuxiliaryTelemetry = {
    oilPressure: 2.5,
    oilTemperature: 48,
    oilFlowRate: 120,
    oilTankLevel: 85,
    coolingWaterFlow: 75,
    coolingWaterInletTemp: 22,
    coolingWaterOutletTemp: 42,
    mainPumpRunning: true,
    standbyPumpRunning: false,
    filterInletPressure: 2.8,
    filterOutletPressure: 2.6,
    oilInletTemp: 65,
    oilOutletTemp: 48
};

let pumpCheck = pumpController.checkAndSwitchPumps(normalTelemetry);
console.log(`Oil Pressure: ${normalTelemetry.oilPressure} bar`);
console.log(`Action: ${pumpCheck.action}`);
console.log(`Message: ${pumpCheck.message}`);
console.log(`Standby Pump: ${pumpCheck.standbyPumpShouldRun ? 'RUNNING ✅' : 'STOPPED'}`);
console.log();

// Main pump starts failing
console.log('📊 SCENARIO B: Main Pump Struggling (Pressure drops to 1.5 bar)');
console.log('-'.repeat(70));

const strugglingTelemetry: ExtendedAuxiliaryTelemetry = {
    ...normalTelemetry,
    oilPressure: 1.5,  // 🚨 Trigger threshold!
    mainPumpRunning: true  // Main still running but weak
};

pumpCheck = pumpController.checkAndSwitchPumps(strugglingTelemetry);
console.log(`Oil Pressure: ${strugglingTelemetry.oilPressure} bar ⚠️`);
console.log(`Action: ${pumpCheck.action} 🤝`);
console.log(`Message: ${pumpCheck.message}`);
console.log();
if (pumpCheck.alerts.length > 0) {
    console.log('ALERTS:');
    pumpCheck.alerts.forEach(alert => console.log(`  ${alert}`));
}
console.log();
console.log(`Standby Pump: ${pumpCheck.standbyPumpShouldRun ? 'RUNNING ✅ (RESCUE MODE!)' : 'STOPPED'}`);
console.log();

// Both pumps working together
console.log('📊 SCENARIO C: Both Pumps Running (Pressure recovered)');
console.log('-'.repeat(70));

const recoveredTelemetry: ExtendedAuxiliaryTelemetry = {
    ...normalTelemetry,
    oilPressure: 2.8,  // ✅ Both pumps working!
    mainPumpRunning: true,
    standbyPumpRunning: true
};

pumpCheck = pumpController.checkAndSwitchPumps(recoveredTelemetry);
console.log(`Oil Pressure: ${recoveredTelemetry.oilPressure} bar ✅✅`);
console.log(`Message: ${pumpCheck.message}`);
console.log(`Both Pumps: RUNNING (System stable)`);
console.log();

// ========================================
// SCENARIO 2: THE FILTER SNEEZE
// ========================================

console.log('💨 STEP 3: THE FILTER SNEEZE (Δp Monitoring)');
console.log('='.repeat(70));
console.log();

const filterMonitor = new FilterMonitor();

const filterScenarios = [
    {
        name: 'CLEAN Filter (New)',
        inlet: 2.8,
        outlet: 2.7
    },
    {
        name: 'DIRTY Filter (Needs Cleaning)',
        inlet: 2.8,
        outlet: 1.9
    },
    {
        name: 'CLOGGED Filter (Clean NOW!)',
        inlet: 2.8,
        outlet: 1.2
    },
    {
        name: 'CRITICAL Filter (Emergency!)',
        inlet: 2.8,
        outlet: 0.7
    }
];

filterScenarios.forEach((scenario, idx) => {
    console.log(`SCENARIO ${String.fromCharCode(65 + idx)}: ${scenario.name}`);
    console.log('-'.repeat(70));

    const filterTelemetry: ExtendedAuxiliaryTelemetry = {
        ...normalTelemetry,
        filterInletPressure: scenario.inlet,
        filterOutletPressure: scenario.outlet
    };

    const filterCheck = filterMonitor.checkFilterCondition(filterTelemetry);

    console.log(`Inlet Pressure:  ${scenario.inlet} bar`);
    console.log(`Outlet Pressure: ${scenario.outlet} bar`);
    console.log(`Δp (Delta P):    ${filterCheck.deltaP.toFixed(2)} bar`);
    console.log();
    console.log(`Status: ${filterCheck.status}`);
    console.log(`${filterCheck.message}`);
    console.log(`${filterCheck.recommendation}`);
    if (filterCheck.daysUntilCritical !== undefined) {
        console.log(`⏰ Days until critical: ${filterCheck.daysUntilCritical}`);
    }
    console.log();
});

// ========================================
// SCENARIO 3: THE COOLING CHECKUP
// ========================================

console.log('❄️  STEP 4: THE COOLING CHECKUP (Heat Exchanger)');
console.log('='.repeat(70));
console.log();

const heatExchangerMonitor = new HeatExchangerMonitor();

const coolingScenarios = [
    {
        name: 'EXCELLENT Cooling (Clean heat exchanger)',
        oilIn: 65,
        oilOut: 48,  // 17°C drop - excellent!
        waterIn: 22,
        waterOut: 38
    },
    {
        name: 'GOOD Cooling (Slight fouling)',
        oilIn: 65,
        oilOut: 53,  // 12°C drop - acceptable
        waterIn: 22,
        waterOut: 35
    },
    {
        name: 'POOR Cooling (Partial blockage)',
        oilIn: 65,
        oilOut: 58,  // 7°C drop - poor!
        waterIn: 22,
        waterOut: 28
    },
    {
        name: 'FAILED Cooling (Fish clogged the pipes! 🐟)',
        oilIn: 65,
        oilOut: 63,  // 2°C drop - barely working!
        waterIn: 22,
        waterOut: 24
    }
];

coolingScenarios.forEach((scenario, idx) => {
    console.log(`SCENARIO ${String.fromCharCode(65 + idx)}: ${scenario.name}`);
    console.log('-'.repeat(70));

    const coolingTelemetry: ExtendedAuxiliaryTelemetry = {
        ...normalTelemetry,
        oilInletTemp: scenario.oilIn,
        oilOutletTemp: scenario.oilOut,
        coolingWaterInletTemp: scenario.waterIn,
        coolingWaterOutletTemp: scenario.waterOut
    };

    const coolingCheck = heatExchangerMonitor.checkCoolingEffectiveness(coolingTelemetry);

    console.log(`Oil IN:  ${scenario.oilIn}°C → OUT: ${scenario.oilOut}°C (Δ${coolingCheck.oilTempDrop.toFixed(1)}°C)`);
    console.log(`Water IN: ${scenario.waterIn}°C → OUT: ${scenario.waterOut}°C`);
    console.log();
    console.log(`Effectiveness: ${coolingCheck.effectiveness.toFixed(1)}% (${coolingCheck.status})`);
    console.log(`${coolingCheck.message}`);

    if (coolingCheck.possibleCauses && coolingCheck.possibleCauses.length > 0) {
        console.log();
        console.log('POSSIBLE CAUSES:');
        coolingCheck.possibleCauses.forEach(cause => console.log(`  ${cause}`));
    }
    console.log();
});

// ========================================
// SUMMARY
// ========================================

console.log('='.repeat(70));
console.log('🎉 INTELLIGENT SYSTEM READY!');
console.log('='.repeat(70));
console.log();
console.log('CAPABILITIES:');
console.log();
console.log('🤝 THE PUMP HANDSHAKE:');
console.log('  • Monitors oil pressure continuously');
console.log('  • Auto-starts standby pump at 1.5 bar');
console.log('  • Prevents bearing damage before emergency');
console.log('  • 5-minute cooldown prevents rapid cycling');
console.log();
console.log('💨 THE FILTER SNEEZE:');
console.log('  • Tracks Δp across filters');
console.log('  • Clean: <0.2 bar ✅');
console.log('  • Dirty: 0.8 bar ⚠️ Schedule cleaning');
console.log('  • Clogged: 1.5 bar 🔴 Clean NOW!');
console.log('  • Critical: 2.0 bar 🚨 Switch to bypass!');
console.log();
console.log('❄️  THE COOLING CHECKUP:');
console.log('  • Monitors oil temperature drop');
console.log('  • Expected: 15°C drop across heat exchanger');
console.log('  • Detects: Fish 🐟, leaves 🍃, algae 🦠');
console.log('  • Alerts when effectiveness <60%');
console.log();
console.log('📋 ENHANCED PASSPORT:');
console.log('  • Thirst Level: 15-30 L/min oil flow');
console.log('  • Fever Limit: TRIP at 85°C');
console.log();
console.log('🏭 Big Brother can now heal himself! 🤖✨');
console.log('='.repeat(70));
