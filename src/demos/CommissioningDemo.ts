/**
 * COMMISSIONING DEMONSTRATION
 * Shows complete post-repair startup protocol
 */

import {
    COMMISSIONING_CHECKLIST,
    VibrationFingerprintChecker,
    VibrationFingerprint,
    WarmUpMonitor,
    generateCommissioningCertificate
} from '../services/CommissioningProtocol';

console.log('='.repeat(70));
console.log('🛡️ GUARDIAN\'S CHECKLIST - POST-REPAIR COMMISSIONING');
console.log('='.repeat(70));
console.log();

// ========================================
// STEP 1: VIBRATION FINGERPRINT CHECK
// ========================================

console.log('📊 STEP 1: VIBRATION FINGERPRINT ANALYSIS');
console.log('-'.repeat(70));
console.log();

const preRepairVibration: VibrationFingerprint = {
    timestamp: '2026-01-20T10:00:00Z',
    location: 'Guide Bearing - Horizontal',
    rpm: 600,
    measurements: {
        overall: 5.7,      // Before repair (with cavitation damage)
        oneX: 2.2,         // 1x component
        twoX: 1.1,         // 2x component
        phaseAngle: 45
    }
};

const postRepairVibration: VibrationFingerprint = {
    timestamp: '2026-01-24T14:00:00Z',
    location: 'Guide Bearing - Horizontal',
    rpm: 600,
    measurements: {
        overall: 3.5,      // After repair and balancing
        oneX: 2.8,         // HIGHER! Weld added mass
        twoX: 0.9,
        phaseAngle: 120    // Phase changed
    }
};

console.log('PRE-REPAIR (with cavitation damage):');
console.log(`  Overall RMS: ${preRepairVibration.measurements.overall} mm/s`);
console.log(`  1x RPM:      ${preRepairVibration.measurements.oneX} mm/s`);
console.log(`  2x RPM:      ${preRepairVibration.measurements.twoX} mm/s`);
console.log();

console.log('POST-REPAIR (after weld, before balancing):');
console.log(`  Overall RMS: ${postRepairVibration.measurements.overall} mm/s`);
console.log(`  1x RPM:      ${postRepairVibration.measurements.oneX} mm/s ⚠️ INCREASED!`);
console.log(`  2x RPM:      ${postRepairVibration.measurements.twoX} mm/s`);
console.log();

const vibCheck = VibrationFingerprintChecker.checkPostRepairVibration(
    preRepairVibration,
    postRepairVibration
);

if (!vibCheck.passed) {
    console.log('❌ VIBRATION CHECK FAILED');
    console.log();
    console.log('ISSUES DETECTED:');
    vibCheck.issues.forEach(issue => console.log(`  • ${issue}`));
    console.log();
    console.log('RECOMMENDATIONS:');
    vibCheck.recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log();
} else {
    console.log('✅ VIBRATION CHECK PASSED');
    console.log();
}

// ========================================
// STEP 2: WARM-UP MONITORING (4 HOURS)
// ========================================

console.log('🌡️  STEP 2: FIRST 4-HOUR WARM-UP PROTOCOL');
console.log('-'.repeat(70));
console.log();

const warmUpMonitor = new WarmUpMonitor();

console.log('Time  | Load | Bearing | Ambient | Vibration | Status');
console.log('(min) |  (%) | Temp°C  | Temp°C  |  (mm/s)   |');
console.log('------|------|---------|---------|-----------|------------------');

// Simulate 4-hour warm-up with 15-minute intervals
const warmUpSchedule = [
    { time: 0, load: 0, bearingTemp: 22, vibration: 0 },
    { time: 15, load: 30, bearingTemp: 28, vibration: 2.1 },
    { time: 30, load: 30, bearingTemp: 35, vibration: 2.0 },
    { time: 45, load: 40, bearingTemp: 41, vibration: 2.1 },
    { time: 60, load: 40, bearingTemp: 45, vibration: 2.0 },
    { time: 75, load: 50, bearingTemp: 48, vibration: 2.1 },
    { time: 90, load: 50, bearingTemp: 51, vibration: 2.0 },
    { time: 105, load: 60, bearingTemp: 53, vibration: 2.1 },
    { time: 120, load: 60, bearingTemp: 55, vibration: 2.0 },  // 2 hours - temp stabilized
    { time: 135, load: 70, bearingTemp: 56, vibration: 2.1 },
    { time: 150, load: 70, bearingTemp: 57, vibration: 2.0 },
    { time: 165, load: 80, bearingTemp: 58, vibration: 2.1 },
    { time: 180, load: 80, bearingTemp: 59, vibration: 2.0 },
    { time: 195, load: 85, bearingTemp: 59, vibration: 2.1 },  // NEW SAFE LIMIT
    { time: 210, load: 85, bearingTemp: 60, vibration: 2.0 },
    { time: 225, load: 85, bearingTemp: 60, vibration: 2.0 },
    { time: 240, load: 85, bearingTemp: 60, vibration: 2.0 }   // 4 hours complete
];

warmUpSchedule.forEach(point => {
    warmUpMonitor.recordDataPoint(
        point.bearingTemp,
        22, // ambient
        point.load,
        point.vibration
    );

    const status = warmUpMonitor.checkWarmUpStatus();
    const statusIcon = status.status === 'NORMAL' ? '✅' :
        status.status === 'WARNING' ? '⚠️' : '🔴';

    console.log(
        `${point.time.toString().padStart(5)} | ` +
        `${point.load.toString().padStart(3)}% | ` +
        `${point.bearingTemp.toString().padStart(6)}  | ` +
        `${22 .toString().padStart(6)}  | ` +
        `${point.vibration.toFixed(1).padStart(8)}  | ` +
        `${status.canIncreaseLoad ? '✅ Can increase load' : '⏸️  Hold current load'}`
    );
});

console.log();
console.log('📈 WARM-UP CURVE ANALYSIS:');
const warmUpCurve = warmUpMonitor.getWarmUpCurve();
const finalPoint = warmUpCurve[warmUpCurve.length - 1];
console.log(`  Duration: ${finalPoint.elapsedMinutes.toFixed(0)} minutes (4 hours)`);
console.log(`  Final bearing temp: ${finalPoint.bearingTemp}°C`);
console.log(`  Final vibration: ${finalPoint.vibration} mm/s`);
console.log(`  Final load: ${finalPoint.load}% (NEW SAFE LIMIT)`);
console.log();

const finalStatus = warmUpMonitor.checkWarmUpStatus();
console.log(`  ${finalStatus.status === 'NORMAL' ? '✅' : '❌'} ${finalStatus.message}`);
console.log();

// ========================================
// STEP 3: COMPLETE COMMISSIONING CHECKLIST  
// ========================================

console.log('📋 STEP 3: COMMISSIONING CHECKLIST');
console.log('-'.repeat(70));
console.log();

const checkResults = COMMISSIONING_CHECKLIST.map(item => {
    // Simulate check results (all passed in this demo)
    const passed = true;
    let measuredValue = '';

    if (item.id === 'ALIGNMENT') measuredValue = '0.03 mm';
    if (item.id === 'VIBRATION_FINGERPRINT') measuredValue = '2.0 mm/s (after balancing)';
    if (item.id === 'SEAL_LEAKAGE') measuredValue = '0 ml/min';
    if (item.id === 'GOVERNOR_RESPONSE') measuredValue = '12 seconds';

    return {
        itemId: item.id,
        passed,
        measuredValue,
        notes: item.id === 'AIR_ADMISSION' ? 'Valve cleaned and tested - opens freely!' : undefined
    };
});

COMMISSIONING_CHECKLIST.forEach((item, idx) => {
    const result = checkResults[idx];
    const icon = result.passed ? '✅' : '❌';
    const critical = item.critical ? '⚠️ CRITICAL' : '';

    console.log(`${icon} ${item.description} ${critical}`);
    if (item.croatianTerm) {
        console.log(`   (${item.croatianTerm})`);
    }
    console.log(`   Criteria: ${item.acceptanceCriteria}`);
    if (result.measuredValue) {
        console.log(`   Measured: ${result.measuredValue}`);
    }
    if (result.notes) {
        console.log(`   📝 ${result.notes}`);
    }
    console.log();
});

// ========================================
// STEP 4: GENERATE COMMISSIONING CERTIFICATE
// ========================================

console.log('📜 STEP 4: COMMISSIONING CERTIFICATE (Puštanje u rad)');
console.log('='.repeat(70));

const certificate = generateCommissioningCertificate(
    'Unit_01',
    checkResults,
    warmUpCurve
);

console.log();
console.log(`Certificate ID: ${certificate.certificateId}`);
console.log(`Asset: ${certificate.assetName}`);
console.log(`Work Order: ${certificate.workOrder}`);
console.log();
console.log('COMMISSIONED BY:');
console.log(`  Name: ${certificate.commissionedBy.name}`);
console.log(`  Role: ${certificate.commissionedBy.role}`);
console.log(`  Company: ${certificate.commissionedBy.company}`);
console.log(`  License: ${certificate.commissionedBy.licenseNumber}`);
console.log();
console.log('CRITICAL MEASUREMENTS:');
console.log(`  Alignment (Centriranost):      ${certificate.measurements.alignment} mm ✅`);
console.log(`  Seal Leakage (Curenje):        ${certificate.measurements.sealLeakage} ml/min ✅`);
console.log(`  Vibration Overall:             ${certificate.measurements.vibrationOverall} mm/s ✅`);
console.log(`  Vibration 1x RPM:              ${certificate.measurements.vibration1X} mm/s ✅`);
console.log(`  Governor Response (Regulacija): ${certificate.measurements.governorResponseTime}s ✅`);
console.log(`  Overspeed Trip Test:           ${certificate.measurements.overspeedTripRPM} RPM ✅`);
console.log();
console.log('WARM-UP TEST RESULTS:');
console.log(`  Duration: ${certificate.warmUpTest.duration} minutes (4 hours)`);
console.log(`  Max Bearing Temp: ${certificate.warmUpTest.maxBearingTemp}°C`);
console.log(`  Final Vibration: ${certificate.warmUpTest.finalVibration} mm/s`);
console.log(`  Status: ${certificate.warmUpTest.passed ? '✅ PASSED' : '❌ FAILED'}`);
console.log();
console.log('APPROVAL:');
console.log(`  Approved by: ${certificate.approvedBy.name} (${certificate.approvedBy.role})`);
console.log(`  Date: ${new Date(certificate.approvedBy.date).toLocaleString()}`);
console.log(`  Status: ${certificate.approved ? '✅ APPROVED FOR OPERATION' : '❌ REJECTED'}`);
console.log();

// ========================================
// MARKO'S SECRET
// ========================================

console.log('⭐ MARKO\'S SECRET - EXPERT TIP');
console.log('='.repeat(70));
console.log();
console.log('🔍 AIR ADMISSION VALVE CHECK:');
console.log('  The air admission valve prevents cavitation by injecting air into');
console.log('  low-pressure zones. If clogged, all your beautiful welding will be');
console.log('  destroyed by cavitation again within 1 month!');
console.log();
console.log('  What to check:');
console.log('    • Valve opens freely (manual test)');
console.log('    • Air passages not blocked by dirt/rust');
console.log('    • Solenoid operates correctly');
console.log('    • Air flow verified during low-load operation');
console.log();
console.log('  ✅ Valve checked and cleaned - opens freely!');
console.log();

// ========================================
// FINAL SUMMARY
// ========================================

console.log('='.repeat(70));
console.log('✅ COMMISSIONING COMPLETE!');
console.log('='.repeat(70));
console.log();
console.log('SUMMARY:');
console.log('  ✅ Vibration fingerprint: PASSED (after balancing)');
console.log('  ✅ 4-hour warm-up: PASSED (temp stable at 60°C)');
console.log('  ✅ All checklist items: PASSED');
console.log('  ✅ Certificate issued');
console.log('  ✅ Marko\'s secret check: PASSED');
console.log();
console.log('UNIT STATUS: ✅ APPROVED FOR OPERATION');
console.log('SAFE OPERATING LIMIT: 85% LOAD (prevents cavitation)');
console.log();
console.log('🎉 The turbine is ready to spin again! 🎉');
console.log('='.repeat(70));
