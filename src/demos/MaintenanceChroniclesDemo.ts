/**
 * MAINTENANCE CHRONICLES DEMONSTRATION
 * Complete examples showing all features working together
 */

import {
    createThrustBearingWithHistory,
    updateComponentPassport,
    addServiceLog,
    AssetNodeWithPassport,
    ServiceActionType,
    ServiceLogEntry,
    LUBRICATION_MODULE,
    OptionalModule
} from '../models/MaintenanceChronicles';
import { AssetNode, AssetNodeType } from '../models/AssetHierarchy';

// ========================================
// SCENARIO 1: The Bearing Swap
// ========================================

/**
 * Demonstration: Mounter replaces a bearing
 * Shows how to update passport without rebuilding fortress
 */
export function demonstrateBearingSwap() {
    console.log('=== SCENARIO 1: BEARING SWAP ===\n');

    // Step 1: Get the existing bearing with its full history
    let thrustBearing = createThrustBearingWithHistory();

    console.log('BEFORE REPLACEMENT:');
    console.log(`Serial Number: ${thrustBearing.passport.identity.serialNumber}`);
    console.log(`Install Date: ${thrustBearing.passport.identity.installDate}`);
    console.log(`Service History: ${thrustBearing.serviceHistory.length} entries`);
    console.log();

    // Step 2: Update the passport with new bearing info
    thrustBearing = updateComponentPassport(thrustBearing, {
        identity: {
            ...thrustBearing.passport.identity,
            serialNumber: 'SKF-TB-2026-00789',  // NEW bearing serial
            installDate: '2026-01-21',
            manufactureDate: '2025-12-15',
            warrantyExpiryDate: '2028-01-21'
        },
        maintenanceSchedule: {
            ...thrustBearing.passport.maintenanceSchedule,
            nextInspectionDate: '2026-07-21',  // Reset schedule
            nextServiceDate: '2027-01-21'
        }
    });

    // Step 3: Log the replacement
    const replacementLog: ServiceLogEntry = {
        id: 'SVC-LOG-2026-042',
        timestamp: '2026-01-21T14:30:00Z',
        componentPath: thrustBearing.path,
        performedBy: {
            name: 'Marko Kovač',
            role: 'MOUNTER',
            company: 'ANDRITZ Service d.o.o.',
            licenseNumber: 'MNT-HR-2024-0458'
        },
        action: ServiceActionType.REPLACEMENT,
        description: 'Replaced thrust bearing due to increased vibration levels. Old bearing showed signs of inner race wear after 12,850 operating hours.',
        workDetails: {
            hoursMeter: 12850,
            measurements: {
                'old_bearing_vibration': 8.5,      // mm/s - too high!
                'new_bearing_clearance_axial': 0.051,
                'new_bearing_clearance_radial': 0.031,
                'bolt_torque_applied': 450,        // Nm
                'post_installation_vibration': 1.8  // mm/s - excellent!
            },
            partsReplaced: ['SKF-TB-2024-00142 (OLD)', 'SKF-TB-2026-00789 (NEW)'],
            consumablesUsed: {
                'grease_LGWA_2': 0.3  // kg
            },
            toolsUsed: [
                'Hydraulic bearing puller 50-ton',
                'Bearing heater 120°C',
                'Torque wrench 50-500 Nm',
                'Dial indicator 0.001mm resolution',
                'Vibration analyzer'
            ]
        },
        verified: {
            verifiedBy: 'Ivan Petrović - Senior Engineer',
            verificationDate: '2026-01-21T16:00:00Z',
            approved: true,
            notes: 'Installation verified. Clearances within spec. Run test completed successfully with vibration levels at 1.8 mm/s (excellent).'
        },
        attachments: {
            photos: [
                '/service-logs/2026/042/old-bearing-wear.jpg',
                '/service-logs/2026/042/new-bearing-installed.jpg',
                '/service-logs/2026/042/clearance-measurement.jpg'
            ],
            reports: ['/service-logs/2026/042/bearing-replacement-report.pdf']
        }
    };

    thrustBearing = addServiceLog(thrustBearing, replacementLog);

    console.log('AFTER REPLACEMENT:');
    console.log(`Serial Number: ${thrustBearing.passport.identity.serialNumber} ✅ UPDATED`);
    console.log(`Install Date: ${thrustBearing.passport.identity.installDate} ✅ UPDATED`);
    console.log(`Service History: ${thrustBearing.serviceHistory.length} entries ✅ NEW LOG ADDED`);
    console.log();

    // Step 4: Show the latest log
    const latestLog = thrustBearing.serviceHistory[thrustBearing.serviceHistory.length - 1];
    console.log('LATEST SERVICE LOG:');
    console.log(`Action: ${latestLog.action}`);
    console.log(`Performed by: ${latestLog.performedBy.name}`);
    console.log(`Vibration before: ${latestLog.workDetails?.measurements?.old_bearing_vibration} mm/s`);
    console.log(`Vibration after: ${latestLog.workDetails?.measurements?.post_installation_vibration} mm/s`);
    console.log(`Verified: ${latestLog.verified?.approved ? '✅ YES' : '❌ NO'}`);
    console.log();

    return thrustBearing;
}

// ========================================
// SCENARIO 2: The Quick-Card Display
// ========================================

/**
 * What the mounter sees when clicking on thrust bearing
 */
export function demonstrateMounterQuickCard() {
    console.log('=== SCENARIO 2: MOUNTER QUICK-CARD ===\n');

    const bearing = createThrustBearingWithHistory();

    console.log('🔧 QUICK-CARD DISPLAY FOR:');
    console.log(`Component: ${bearing.name}`);
    console.log(`Path: ${bearing.path}`);
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  CLEARANCES (Zazori)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Radial Zazor:     ${bearing.passport.mechanicalSpecs.clearances?.radial} mm`);
    console.log(`   Axial Zazor:      ${bearing.passport.mechanicalSpecs.clearances?.axial} mm`);
    console.log(`   Bearing Internal: ${bearing.passport.mechanicalSpecs.clearances?.bearing} mm`);
    console.log(`   ISO Tolerance:    ${bearing.passport.mechanicalSpecs.clearances?.tolerance}`);
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  BOLT TORQUES (Moment pritezanja)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Mounting Bolts:   ${bearing.passport.mechanicalSpecs.boltTorques?.mountingBolts} Nm`);
    console.log(`   Cover Bolts:      ${bearing.passport.mechanicalSpecs.boltTorques?.coverBolts} Nm`);
    console.log(`   Housing Bolts:    ${bearing.passport.mechanicalSpecs.boltTorques?.housingBolts} Nm`);
    console.log(`   Sequence:         ${bearing.passport.mechanicalSpecs.boltTorques?.torqueSequence}`);
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  NEXT SERVICE DATE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Next Inspection:  ${bearing.passport.maintenanceSchedule.nextInspectionDate}`);
    console.log(`   Next Service:     ${bearing.passport.maintenanceSchedule.nextServiceDate}`);

    const daysUntil = Math.ceil(
        (new Date(bearing.passport.maintenanceSchedule.nextServiceDate).getTime() - new Date().getTime())
        / (1000 * 60 * 60 * 24)
    );
    console.log(`   Days Until:       ${daysUntil} days ${daysUntil < 30 ? '⚠️ DUE SOON!' : '✅'}`);
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 SERVICE HISTORY (Latest 2)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    bearing.serviceHistory
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 2)
        .forEach((log, i) => {
            console.log(`\n[${i + 1}] ${new Date(log.timestamp).toLocaleDateString()}`);
            console.log(`    Action: ${log.action}`);
            console.log(`    By: ${log.performedBy.name} (${log.performedBy.role})`);
            console.log(`    ${log.description.substring(0, 80)}...`);
            if (log.verified) {
                console.log(`    ✅ Verified by ${log.verified.verifiedBy}`);
            }
        });
    console.log();
}

// ========================================
// SCENARIO 3: Optional Modules (Power-Ups)
// ========================================

/**
 * Demonstrate how modules snap on based on machine size
 */
export function demonstrateOptionalModules() {
    console.log('=== SCENARIO 3: OPTIONAL MODULES (Power-Ups) ===\n');

    // Small machine (4.5 MW) - NO lubrication module
    const smallUnit: AssetNode = {
        id: 'UNIT_01',
        path: 'Unit_01',
        name: 'Francis Horizontal 4.5 MW',
        type: AssetNodeType.UNIT,
        telemetryEnabled: true,
        metadata: {
            specifications: { ratedPowerMW: 4.5 }
        },
        children: []
    };

    // Large machine (12 MW) - GETS lubrication module
    const largeUnit: AssetNode = {
        id: 'UNIT_02',
        path: 'Unit_02',
        name: 'Francis Vertical 12 MW',
        type: AssetNodeType.UNIT,
        telemetryEnabled: true,
        metadata: {
            specifications: { ratedPowerMW: 12 }
        },
        children: []
    };

    console.log('CHECKING MODULE APPLICABILITY:\n');

    console.log(`${smallUnit.name}:`);
    console.log(`  Power: ${smallUnit.metadata.specifications?.ratedPowerMW} MW`);
    console.log(`  Lubrication Module: ${LUBRICATION_MODULE.applicableWhen(smallUnit) ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`  Reason: ${smallUnit.metadata.specifications?.ratedPowerMW! <= 5 ? 'Too small, uses splash lubrication' : ''}`);
    console.log();

    console.log(`${largeUnit.name}:`);
    console.log(`  Power: ${largeUnit.metadata.specifications?.ratedPowerMW} MW`);
    console.log(`  Lubrication Module: ${LUBRICATION_MODULE.applicableWhen(largeUnit) ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`  Reason: ${largeUnit.metadata.specifications?.ratedPowerMW! > 5 ? 'Large machine needs forced lubrication' : ''}`);

    if (LUBRICATION_MODULE.applicableWhen(largeUnit)) {
        console.log('\n  📦 MODULES ADDED:');
        LUBRICATION_MODULE.components?.forEach(comp => {
            console.log(`     - ${comp.name} (${comp.path})`);
        });
    }
    console.log();
}

// ========================================
// SCENARIO 4: The Service Journal Story
// ========================================

/**
 * Complete story: Seal change from start to finish
 */
export function demonstrateCompleteServiceStory() {
    console.log('=== SCENARIO 4: COMPLETE SERVICE STORY ===\n');
    console.log('📖 THE STORY OF A SHAFT SEAL REPLACEMENT\n');

    console.log('Chapter 1: THE PROBLEM (Jan 15, 2026)');
    console.log('─────────────────────────────────────────');
    console.log('Operator notices water droplets near shaft seal during morning inspection.');
    console.log('Reports: "Small water seepage, approximately 2-3 drops per minute"\n');

    console.log('Chapter 2: INITIAL INSPECTION (Jan 16, 2026)');
    console.log('─────────────────────────────────────────');
    const inspectionLog: ServiceLogEntry = {
        id: 'SVC-LOG-2026-008',
        timestamp: '2026-01-16T09:00:00Z',
        componentPath: 'Unit_01/Turbine/Shaft/ShaftSeal',
        performedBy: {
            name: 'Ana Horvat',
            role: 'INSPECTOR',
            company: 'PowerPlant Maintenance'
        },
        action: ServiceActionType.INSPECTION,
        description: 'Visual inspection of shaft seal. Minor water seepage confirmed. Seal face appears worn.',
        workDetails: {
            hoursMeter: 8450,
            measurements: {
                'leakage_rate_ml_per_min': 2.5,
                'seal_temperature': 42,
                'seal_face_wear_estimate_percent': 35
            }
        }
    };
    console.log(`Inspector: ${inspectionLog.performedBy.name}`);
    console.log(`Finding: Seal face wear at ${inspectionLog.workDetails?.measurements?.seal_face_wear_estimate_percent}%`);
    console.log(`Recommendation: Schedule replacement within 30 days\n`);

    console.log('Chapter 3: PLANNING & PARTS ORDER (Jan 17, 2026)');
    console.log('─────────────────────────────────────────');
    console.log('Parts ordered: EagleBurgmann MG12-4580 Seal Kit');
    console.log('Estimated delivery: Jan 20, 2026');
    console.log('Planned work date: Jan 21, 2026 (Unit shutdown window)\n');

    console.log('Chapter 4: THE REPLACEMENT (Jan 21, 2026)');
    console.log('─────────────────────────────────────────');
    const replacementLog: ServiceLogEntry = {
        id: 'SVC-LOG-2026-012',
        timestamp: '2026-01-21T14:00:00Z',
        componentPath: 'Unit_01/Turbine/Shaft/ShaftSeal',
        performedBy: {
            name: 'Marko Kovač',
            role: 'MOUNTER',
            company: 'ANDRITZ Service',
            licenseNumber: 'MNT-HR-2024-0458'
        },
        action: ServiceActionType.REPLACEMENT,
        description: 'Complete shaft seal replacement. Old seal removed, shaft surface inspected and polished, new seal installed with proper alignment and torque specifications.',
        workDetails: {
            hoursMeter: 8455,
            measurements: {
                'shaft_runout_microns': 8,              // Within spec (<15)
                'seal_concentricity_mm': 0.02,          // Excellent
                'bolt_torque_M16_Nm': 120,              // Per spec
                'post_install_leakage': 0               // Perfect seal!
            },
            partsReplaced: [
                'SS-MG12-4580 (OLD - worn)',
                'SS-MG12-5123 (NEW)'
            ],
            consumablesUsed: {
                'sealant_rtv_blue': 0.1,  // kg
                'cleaning_fluid': 2        // liters
            },
            toolsUsed: [
                'Torque wrench 20-200 Nm',
                'Dial indicator 0.001mm',
                'Shaft polishing kit',
                'Seal installation tool'
            ]
        },
        verified: {
            verifiedBy: 'Ivan Petrović - Senior Engineer',
            verificationDate: '2026-01-21T16:30:00Z',
            approved: true,
            notes: 'Installation perfect. Zero leakage during 2-hour run test. All measurements within specification.'
        },
        attachments: {
            photos: [
                '/logs/2026/012/old-seal-wear.jpg',
                '/logs/2026/012/shaft-surface.jpg',
                '/logs/2026/012/new-seal-installed.jpg',
                '/logs/2026/012/leak-test-passed.jpg'
            ],
            reports: ['/logs/2026/012/seal-replacement-report.pdf'],
            certificates: ['/logs/2026/012/torque-calibration-cert.pdf']
        }
    };
    console.log(`Mounter: ${replacementLog.performedBy.name}`);
    console.log(`Work Duration: 2.5 hours`);
    console.log(`Measurements:`);
    console.log(`  - Shaft runout: ${replacementLog.workDetails?.measurements?.shaft_runout_microns} μm ✅`);
    console.log(`  - Concentricity: ${replacementLog.workDetails?.measurements?.seal_concentricity_mm} mm ✅`);
    console.log(`  - Torque applied: ${replacementLog.workDetails?.measurements?.bolt_torque_M16_Nm} Nm ✅`);
    console.log(`  - Post-install leakage: ${replacementLog.workDetails?.measurements?.post_install_leakage} ml/min ✅ PERFECT!\n`);

    console.log('Chapter 5: VERIFICATION (Jan 21, 2026 - 16:30)');
    console.log('─────────────────────────────────────────');
    console.log(`Verified by: ${replacementLog.verified?.verifiedBy}`);
    console.log(`Status: ${replacementLog.verified?.approved ? '✅ APPROVED' : '❌ REJECTED'}`);
    console.log(`Notes: ${replacementLog.verified?.notes}\n`);

    console.log('Chapter 6: BACK IN SERVICE (Jan 21, 2026 - 18:00)');
    console.log('─────────────────────────────────────────');
    console.log('Unit returned to operation');
    console.log('Next seal inspection scheduled: July 21, 2026 (6 months)');
    console.log('\n📚 END OF STORY - All data saved in Service Journal! ✨\n');
}

// ========================================
// RUN ALL DEMONSTRATIONS
// ========================================

export function runAllDemonstrations() {
    demonstrateBearingSwap();
    console.log('\n' + '='.repeat(60) + '\n');

    demonstrateMounterQuickCard();
    console.log('\n' + '='.repeat(60) + '\n');

    demonstrateOptionalModules();
    console.log('\n' + '='.repeat(60) + '\n');

    demonstrateCompleteServiceStory();
}

// Auto-run if executed directly
if (require.main === module) {
    runAllDemonstrations();
}
