/**
 * CASE STUDY: The Mystery of the Noisy Runner
 * Real-world troubleshooting demonstration
 */

import { SpecialistNotebook } from '../services/SpecialistNotebook';
import { InvisibleMonstersDetector } from '../services/InvisibleMonstersDetector';
import { DamageLearningService } from '../services/InvisibleMonstersDetector';
import { FrancisHorizontalEngine } from '../lib/engines/FrancisHorizontalEngine';
import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';
import { ServiceLogEntry, ServiceActionType } from '../models/MaintenanceChronicles';
import Decimal from 'decimal.js';

console.log('='.repeat(60));
console.log('🔍 CASE STUDY: THE MYSTERY OF THE NOISY RUNNER');
console.log('='.repeat(60));
console.log();

// ========================================
// STEP 1: THE SYMPTOMS
// ========================================

console.log('📋 SYMPTOMS REPORTED:');
console.log('  • Crackling sound (like frying bacon) at 90% load');
console.log('  • High vibration');
console.log('  • Clean water (no sand/silt)');
console.log('  • Sound only appears above 85% load');
console.log();

// ========================================
// STEP 2: COLLECT TELEMETRY DATA
// ========================================

const engine = new FrancisHorizontalEngine();
const detector = new InvisibleMonstersDetector(engine);

// At 90% load (where noise appears)
const telemetryAt90Percent: TelemetryStream = {
    timestamp: Date.now(),
    hydraulic: {
        flow: 10.8,              // 90% of 12 m³/s rated flow
        head: 78,                // Slightly below rated 80m
        guideVaneOpening: 88,
        efficiency: 90,
        waterHead: new Decimal(78),
        flowRate: new Decimal(10.8),
        cavitationThreshold: new Decimal(0.5)
    },
    mechanical: {
        rpm: 600,
        vibrationX: 4.2,         // Elevated vibration
        vibrationY: 3.8,
        bearingTemp: 58,
        alignment: 0.05,
        vibration: 5.6, // Combined SQRT(4.2^2 + 3.8^2)
        radialClearance: 0.8,
        boltSpecs: { grade: '8.8', count: 12, torque: 450 }
    }
};

console.log('📊 OPERATING CONDITIONS AT 90% LOAD:');
console.log(`  Flow: ${telemetryAt90Percent.hydraulic.flow} m³/s (90%)`);
console.log(`  Head: ${telemetryAt90Percent.hydraulic.head} m`);
console.log(`  Vibration: ${Math.sqrt(4.2 ** 2 + 3.8 ** 2).toFixed(1)} mm/s`);
console.log();

// ========================================
// STEP 3: THE SIGMA SPY INVESTIGATION
// ========================================

console.log('🔍 SIGMA SPY ANALYSIS:');
console.log('-'.repeat(60));

const cavStatus = detector.monitorCavitation(telemetryAt90Percent);

console.log(`  σ (Sigma): ${cavStatus.sigma.toFixed(3)}`);
console.log(`  NPSH Available: ${cavStatus.npshAvailable.toFixed(2)} m`);
console.log(`  NPSH Required: ${cavStatus.npshRequired.toFixed(2)} m`);
console.log(`  Risk Level: ${cavStatus.riskLevel}`);
console.log();
console.log(`  ⚠️  ${cavStatus.message}`);
console.log();

// ========================================
// STEP 4: DIAGNOSIS
// ========================================

console.log('🩺 SPECIALIST\'S NOTEBOOK DIAGNOSIS:');
console.log('-'.repeat(60));

const diagnosis = SpecialistNotebook.diagnoseDamage(
    'Crackling sound like frying bacon, sponge-like pitting with deep craters on blade surface',
    'Runner blade suction side - outlet region',
    {
        sigma: cavStatus.sigma,
        sedimentPPM: 0,           // Clean water
        flowPercent: 90
    }
);

console.log(`  Damage Type: ${diagnosis.damageType}`);
console.log(`  Confidence: ${diagnosis.confidence}%`);
console.log(`  Severity: ${diagnosis.estimatedSeverity}`);
console.log(`  Urgency: ${diagnosis.urgency}`);
console.log(`  Estimated Cost: ${diagnosis.estimatedCost}`);
console.log();

// ========================================
// STEP 5: SAFE POWER LIMIT CALCULATION
// ========================================

console.log('💰 OPTIMIZATION ADVICE - SAFE POWER LIMIT:');
console.log('-'.repeat(60));

// Calculate power at different loads
const testLoads = [70, 75, 80, 85, 90, 95];
const safeLimit = {
    maxSafeLoad: 0,
    maxSafePower: 0,
    reason: ''
};

console.log('  Load % | Flow (m³/s) | Sigma | Status');
console.log('  -------|-------------|-------|--------');

for (const loadPercent of testLoads) {
    const testFlow = (loadPercent / 100) * 12; // Rated flow = 12 m³/s
    const testTelemetry: TelemetryStream = {
        timestamp: Date.now(),
        hydraulic: { flow: testFlow, head: 78, guideVaneOpening: 0 } as any,
        mechanical: { rpm: 600, vibrationX: 2, vibrationY: 2, bearingTemp: 55 } as any
    };

    const testCavStatus = detector.monitorCavitation(testTelemetry);
    const power = engine.getPowerOutput(testTelemetry);

    const status = testCavStatus.sigma >= 0.10 ? '✅ SAFE' : '❌ CAVITATION';
    console.log(`  ${loadPercent}%    | ${testFlow.toFixed(1)}      | ${testCavStatus.sigma.toFixed(3)} | ${status}`);

    // Find highest safe load
    if (testCavStatus.sigma >= 0.10 && loadPercent > safeLimit.maxSafeLoad) {
        safeLimit.maxSafeLoad = loadPercent;
        safeLimit.maxSafePower = power;
    }
}

console.log();
console.log(`  💡 RECOMMENDATION:`);
console.log(`     Maximum Safe Load: ${safeLimit.maxSafeLoad}%`);
console.log(`     Maximum Safe Power: ${safeLimit.maxSafePower.toFixed(0)} kW`);
console.log();
console.log(`  💵 MONEY-SAVING TIP:`);
console.log(`     Operating at 90% load causes cavitation damage.`);
console.log(`     Limiting operation to ${safeLimit.maxSafeLoad}% will:`);
console.log(`       • Eliminate cavitation (σ ≥ 0.10)`);
console.log(`       • Prevent $40,000-80,000 runner repair costs`);
console.log(`       • Extend runner life by 5-10 years`);
console.log(`       • Only sacrifice ${((90 - safeLimit.maxSafeLoad) / 90 * 100).toFixed(0)}% of power output`);
console.log();

// ========================================
// STEP 6: DETAILED REPAIR PLAN
// ========================================

console.log('🛠️  STEP-BY-STEP REPAIR CARD:');
console.log('='.repeat(60));
console.log();

const repairPlan = {
    workOrder: 'WO-2026-FRANCIS-CAVITATION-001',
    estimatedDuration: '3 days',
    estimatedCost: '$45,000',
    requiredSkills: ['Certified Welder', 'Turbine Mechanic', 'NDT Inspector'],

    steps: [
        {
            step: 1,
            title: 'PREPARATION & SAFETY',
            duration: '4 hours',
            actions: [
                'Close inlet valve and drain spiral casing',
                'Lock out turbine controls (LOTO procedure)',
                'Install ventilation for confined space entry',
                'Prepare welding equipment and PPE'
            ],
            requiredTools: ['LOTO locks', 'Ventilation fan', 'Gas monitor']
        },
        {
            step: 2,
            title: 'RUNNER INSPECTION & DAMAGE MAPPING',
            duration: '6 hours',
            actions: [
                'Remove runner cover and access runner',
                'Clean runner surface with solvent',
                'Map all pitting locations with photos',
                'Measure pit depth with ultrasonic gauge',
                'Mark severely damaged areas with chalk'
            ],
            requiredTools: ['UT gauge', 'Camera', 'Chalk markers', 'Cleaning solvent']
        },
        {
            step: 3,
            title: 'SURFACE PREPARATION',
            duration: '8 hours',
            actions: [
                'Grind out all cavitation pits to clean metal',
                'Taper edges at 30° angle for weld penetration',
                'Remove ALL rust and oxidation',
                'Clean with acetone - surface must be mirror-bright',
                'Preheat base metal to 150°C with torch'
            ],
            requiredTools: ['Angle grinder', 'Flap discs', 'Propane torch', 'Pyrometer'],
            critical: 'Surface prep is 80% of weld quality! No shortcuts!'
        },
        {
            step: 4,
            title: 'FIRST LAYER WELDING - ANTI-RUST FOUNDATION',
            duration: '10 hours',
            actions: [
                '🔥 EXPERT TIP: Use 309L stainless steel electrodes for first layer',
                'Electrode size: 3.2mm (1/8")',
                'Amperage: 90-110A DC',
                'Build up first layer 2-3mm thick',
                'Allow to cool slowly - no water quench!',
                'Reason: 309L prevents future corrosion at weld interface'
            ],
            requiredMaterials: ['309L electrodes (5kg)', 'Backing plates'],
            critical: '309L is MORE corrosion resistant than 308L - critical for long life!'
        },
        {
            step: 5,
            title: 'TOP LAYER WELDING - FINAL PROFILE',
            duration: '8 hours',
            actions: [
                '🔥 EXPERT TIP: Use 308L stainless steel for top layers',
                'Electrode size: 3.2mm',
                'Amperage: 100-120A DC',
                'Build up to 1-2mm above original profile',
                'Use short bead technique - 50mm segments',
                'Allow cooling between passes (interpass temp <150°C)',
                'Reason: 308L is easier to grind to final shape'
            ],
            requiredMaterials: ['308L electrodes (8kg)']
        },
        {
            step: 6,
            title: 'PROFILE GRINDING & FINISHING',
            duration: '12 hours',
            actions: [
                'Grind weld to match original blade profile',
                'Use template from undamaged blade for reference',
                'Final finish with 80-grit flap disc',
                'Polish to smooth surface (Ra < 3.2 µm)',
                'Blend edges - no hard transitions!'
            ],
            requiredTools: ['Profile templates', 'Flap discs', 'Surface roughness tester']
        },
        {
            step: 7,
            title: 'NON-DESTRUCTIVE TESTING (NDT)',
            duration: '4 hours',
            actions: [
                'Magnetic particle inspection (MPI) for cracks',
                'Dye penetrant test on all welds',
                'Ultrasonic testing for internal defects',
                'Visual inspection under 10x magnification'
            ],
            requiredTools: ['MPI equipment', 'Dye penetrant kit', 'UT probe'],
            acceptance: 'Zero cracks, zero porosity, zero inclusions'
        },
        {
            step: 8,
            title: 'REASSEMBLY & TESTING',
            duration: '6 hours',
            actions: [
                'Reinstall runner cover with new gasket',
                'Torque bolts to 450 Nm in cross pattern',
                'Fill spiral casing slowly',
                'Run test at 50% load for 2 hours',
                'Check for vibration and noise',
                'Gradually increase to 85% load (NEW SAFE LIMIT)',
                'Monitor for crackling sounds'
            ],
            acceptance: 'No noise, vibration <3.5 mm/s, no leaks'
        }
    ]
};

// Print repair plan
repairPlan.steps.forEach(step => {
    console.log(`STEP ${step.step}: ${step.title}`);
    console.log(`Duration: ${step.duration}`);
    if (step.critical) {
        console.log(`⚠️  CRITICAL: ${step.critical}`);
    }
    console.log('Actions:');
    step.actions.forEach(action => {
        console.log(`  • ${action}`);
    });
    if (step.requiredTools) {
        console.log(`Tools: ${step.requiredTools.join(', ')}`);
    }
    if (step.requiredMaterials) {
        console.log(`Materials: ${step.requiredMaterials.join(', ')}`);
    }
    console.log();
});

console.log(`📊 TOTAL REPAIR TIME: ${repairPlan.estimatedDuration}`);
console.log(`📊 ESTIMATED COST: ${repairPlan.estimatedCost}`);
console.log();

// ========================================
// STEP 7: SERVICE JOURNAL ENTRY
// ========================================

console.log('📖 SERVICE JOURNAL ENTRY:');
console.log('-'.repeat(60));

const serviceEntry: ServiceLogEntry = {
    id: 'SVC-LOG-2026-CAVITATION-001',
    timestamp: '2026-01-21T14:00:00Z',
    componentPath: 'Unit_01/Turbine/Runner',

    performedBy: {
        name: 'Marko Jurić',
        role: 'MOUNTER',
        company: 'ANDRITZ Service Croatia',
        licenseNumber: 'WELD-EU-2024-8745'
    },

    action: ServiceActionType.REPAIR,
    description: 'Cavitation damage repair on runner blade suction side. Used 309L/308L stainless steel weld overlay per expert specification.',

    workDetails: {
        hoursMeter: 8450,
        measurements: {
            'sigma_at_90_percent_load': cavStatus.sigma,
            'max_pit_depth_mm': 4.5,
            'total_affected_area_cm2': 180,
            'post_repair_vibration_mm_s': 2.1,
            'new_safe_load_limit_percent': safeLimit.maxSafeLoad
        },
        partsReplaced: [],
        consumablesUsed: {
            '309L_electrodes_kg': 5,
            '308L_electrodes_kg': 8,
            'grinding_discs': 12
        },
        toolsUsed: [
            'GTAW welding machine',
            'Angle grinder',
            'UT thickness gauge',
            'MPI equipment'
        ]
    },

    verified: {
        verifiedBy: 'Dr. Ivan Petrović - Senior Hydraulic Engineer',
        verificationDate: '2026-01-24T16:00:00Z',
        approved: true,
        notes: 'Weld quality excellent. NDT passed all tests. Runner profile restored. New operating limit of 85% will prevent future cavitation.'
    }
};

console.log(`Work Order: ${serviceEntry.id}`);
console.log(`Performed by: ${serviceEntry.performedBy.name} (${serviceEntry.performedBy.licenseNumber})`);
console.log(`Operating Hours: ${serviceEntry.workDetails?.hoursMeter}`);
console.log();
console.log('KEY MEASUREMENTS RECORDED:');
console.log(`  σ at failure: ${serviceEntry.workDetails?.measurements?.sigma_at_90_percent_load.toFixed(3)}`);
console.log(`  Max pit depth: ${serviceEntry.workDetails?.measurements?.max_pit_depth_mm} mm`);
console.log(`  New safe limit: ${serviceEntry.workDetails?.measurements?.new_safe_load_limit_percent}% load`);
console.log();

// ========================================
// STEP 8: LEARNING & FUTURE PREVENTION
// ========================================

console.log('🧠 CONNECTING THE DOTS - DAMAGE LEARNING:');
console.log('-'.repeat(60));

const learner = new DamageLearningService();

// Record the damage with conditions
learner.recordDamage(
    'CAVITATION',
    'MODERATE',
    'Runner blade suction side',
    telemetryAt90Percent,
    2400,  // Hours running at 90% load before damage appeared
    0      // Clean water
);

console.log('✅ DAMAGE PATTERN RECORDED IN CRYSTAL BALL');
console.log();
console.log('📚 WHAT THE FORTRESS LEARNED:');
console.log(`  • When flow = 10.8 m³/s (90% load)`);
console.log(`  • and head = 78 m`);
console.log(`  • and σ = ${cavStatus.sigma.toFixed(3)} (below 0.10)`);
console.log(`  • after 2400 hours of operation`);
console.log(`  • → CAVITATION damage appears on runner suction side`);
console.log();
console.log('🔮 FUTURE PREDICTION:');
console.log('  Next time σ drops below 0.10, fortress will warn:');
console.log('  "⚠️ PATTERN MATCH: Similar conditions caused CAVITATION');
console.log('   damage after 2400 hours. Current runtime at risk: XXX hours."');
console.log();
console.log('  The warning will appear 2 weeks (336 hours) before damage!');
console.log('  Calculation: 2400 - 336 = 2064 hours of operation');
console.log();

// ========================================
// FINAL SUMMARY
// ========================================

console.log('='.repeat(60));
console.log('📋 CASE CLOSED - SUMMARY');
console.log('='.repeat(60));
console.log();
console.log('🔍 DIAGNOSIS: CAVITATION DAMAGE');
console.log(`   Confidence: ${diagnosis.confidence}%`);
console.log(`   Cause: Operating at 90% load with σ=${cavStatus.sigma.toFixed(3)} < 0.10`);
console.log();
console.log('💰 OPTIMIZATION:');
console.log(`   New Safe Limit: ${safeLimit.maxSafeLoad}% load`);
console.log(`   Cost Savings: $40,000-80,000 (prevented future damage)`);
console.log(`   Lifespan Extension: +5-10 years`);
console.log();
console.log('🛠️  REPAIR COMPLETED:');
console.log('   Method: 309L foundation + 308L top layer weld overlay');
console.log('   Duration: 3 days');
console.log('   Quality: NDT passed - zero defects');
console.log();
console.log('🧠 KNOWLEDGE GAINED:');
console.log('   Pattern recorded for future prediction');
console.log('   Early warning system active');
console.log('   Will alert 2 weeks before damage threshold');
console.log();
console.log('✅ MYSTERY SOLVED! 🎉');
console.log('='.repeat(60));
