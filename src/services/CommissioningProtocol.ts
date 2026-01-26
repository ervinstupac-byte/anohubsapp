/**
 * COMMISSIONING PROTOCOL
 * Guardian's Checklist for post-repair startup
 */

import { ServiceLogEntry, ServiceActionType } from '../models/MaintenanceChronicles';

// ========================================
// COMMISSIONING CHECKLIST
// ========================================

export interface CommissioningCheckItem {
    id: string;
    category: 'MECHANICAL' | 'HYDRAULIC' | 'ELECTRICAL' | 'SAFETY';
    description: string;
    croatianTerm?: string;
    acceptanceCriteria: string;
    measurementRequired: boolean;
    critical: boolean;
}

export const COMMISSIONING_CHECKLIST: CommissioningCheckItem[] = [
    // MECHANICAL CHECKS
    {
        id: 'ALIGNMENT',
        category: 'MECHANICAL',
        description: 'Shaft Alignment Check',
        croatianTerm: 'Centriranost',
        acceptanceCriteria: 'Dial indicator reading < 0.05mm at coupling',
        measurementRequired: true,
        critical: true
    },
    {
        id: 'VIBRATION_FINGERPRINT',
        category: 'MECHANICAL',
        description: 'Post-Repair Vibration Baseline',
        acceptanceCriteria: 'Vibration ≤ pre-repair levels + 0.5 mm/s tolerance',
        measurementRequired: true,
        critical: true
    },
    {
        id: 'RUNNER_BALANCE',
        category: 'MECHANICAL',
        description: 'Runner Dynamic Balance',
        acceptanceCriteria: 'No 1x RPM peak > 2.5 mm/s, phase angle stable',
        measurementRequired: true,
        critical: true
    },
    {
        id: 'BEARING_CLEARANCE',
        category: 'MECHANICAL',
        description: 'Bearing Clearances',
        acceptanceCriteria: 'Radial: 0.025-0.035mm, Axial: 0.045-0.055mm',
        measurementRequired: true,
        critical: true
    },

    // HYDRAULIC CHECKS
    {
        id: 'JET_ALIGNMENT',
        category: 'HYDRAULIC',
        description: 'Jet-to-Splitter Alignment',
        croatianTerm: 'Položaj Mlaza',
        acceptanceCriteria: 'Jet hits precise center of splitter. Deviation < 1mm.',
        measurementRequired: true,
        critical: true
    },
    {
        id: 'SEAL_LEAKAGE',
        category: 'HYDRAULIC',
        description: 'Shaft Seal Leakage Test',
        croatianTerm: 'Curenje zaptivke',
        acceptanceCriteria: 'Zero leakage during 30-minute pressure test',
        measurementRequired: true,
        critical: true
    },
    {
        id: 'AIR_ADMISSION',
        category: 'HYDRAULIC',
        description: '⭐ MARKO\'S SECRET: Air Admission Valve',
        acceptanceCriteria: 'Valve opens freely, no blockage. CRITICAL: Clogged valve = cavitation returns in 1 month!',
        measurementRequired: false,
        critical: true
    },
    {
        id: 'GUIDE_VANE_OPERATION',
        category: 'HYDRAULIC',
        description: 'Guide Vane Movement',
        acceptanceCriteria: 'Smooth travel 0-100%, no binding, equal opening all vanes',
        measurementRequired: true,
        critical: false
    },

    // GOVERNOR/CONTROL
    {
        id: 'GOVERNOR_RESPONSE',
        category: 'ELECTRICAL',
        description: 'Governor Response Test',
        croatianTerm: 'Regulacija',
        acceptanceCriteria: 'Load change 10-90% in <15 seconds, no overshoot >5%',
        measurementRequired: true,
        critical: true
    },
    {
        id: 'OVERSPEED_TEST',
        category: 'SAFETY',
        description: 'Overspeed Protection Test',
        acceptanceCriteria: 'Trip at 110% rated speed (660 RPM)',
        measurementRequired: true,
        critical: true
    }
];

// ========================================
// VIBRATION FINGERPRINT
// ========================================

export interface VibrationFingerprint {
    timestamp: string;
    location: string;
    rpm: number;
    measurements: {
        overall: number;        // Overall RMS (mm/s)
        oneX: number;          // 1x RPM component (unbalance)
        twoX: number;          // 2x RPM component (misalignment)
        phaseAngle?: number;   // Phase angle for balancing
    };
}

export class VibrationFingerprintChecker {
    /**
     * Check if post-repair vibration is acceptable
     */
    static checkPostRepairVibration(
        preRepair: VibrationFingerprint,
        postRepair: VibrationFingerprint
    ): {
        passed: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check overall vibration
        const vibrationIncrease = postRepair.measurements.overall - preRepair.measurements.overall;

        if (vibrationIncrease > 0.5) {
            issues.push(`Vibration increased by ${vibrationIncrease.toFixed(2)} mm/s (tolerance: 0.5 mm/s)`);

            // Diagnose the cause
            const oneXIncrease = postRepair.measurements.oneX - preRepair.measurements.oneX;
            const twoXIncrease = postRepair.measurements.twoX - preRepair.measurements.twoX;

            if (oneXIncrease > 1.0) {
                issues.push('1x RPM component high - UNBALANCE from weld mass');
                recommendations.push('🔧 REQUIRED: Remove runner and perform dynamic balancing');
                recommendations.push('Add balancing weights on opposite side of weld repair');
                recommendations.push('Target: <2.5 mm/s at 1x RPM');
            }

            if (twoXIncrease > 0.8) {
                issues.push('2x RPM component high - MISALIGNMENT suspected');
                recommendations.push('🔧 REQUIRED: Check coupling alignment');
                recommendations.push('Verify shaft runout < 0.05mm');
            }
        }

        // Check 1x component (unbalance indicator)
        if (postRepair.measurements.oneX > 2.5) {
            issues.push(`1x RPM vibration ${postRepair.measurements.oneX.toFixed(1)} mm/s exceeds 2.5 mm/s limit`);
            recommendations.push('Dynamic balancing required before full load operation');
        }

        const passed = issues.length === 0;

        return { passed, issues, recommendations };
    }
}

// ========================================
// WARM-UP MONITORING
// ========================================

export interface WarmUpDataPoint {
    timestamp: string;
    elapsedMinutes: number;
    bearingTemp: number;      // °C
    ambientTemp: number;
    load: number;             // %
    vibration: number;
}

export class WarmUpMonitor {
    private dataPoints: WarmUpDataPoint[] = [];
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
    }

    /**
     * Record temperature data point
     */
    recordDataPoint(bearingTemp: number, ambientTemp: number, load: number, vibration: number): void {
        const now = new Date();
        const elapsedMinutes = (now.getTime() - this.startTime.getTime()) / (1000 * 60);

        this.dataPoints.push({
            timestamp: now.toISOString(),
            elapsedMinutes,
            bearingTemp,
            ambientTemp,
            load,
            vibration
        });
    }

    /**
     * Check if warm-up is proceeding safely
     */
    checkWarmUpStatus(): {
        status: 'NORMAL' | 'WARNING' | 'CRITICAL';
        message: string;
        canIncreaseLoad: boolean;
    } {
        if (this.dataPoints.length < 2) {
            return {
                status: 'NORMAL',
                message: 'Warm-up just started - collecting data...',
                canIncreaseLoad: false
            };
        }

        const latest = this.dataPoints[this.dataPoints.length - 1];
        const previous = this.dataPoints[this.dataPoints.length - 2];

        // Check temperature rise rate
        const tempRiseRate = (latest.bearingTemp - previous.bearingTemp) /
            ((latest.elapsedMinutes - previous.elapsedMinutes) / 60); // °C/hour

        // Check absolute temperature
        if (latest.bearingTemp > 75) {
            return {
                status: 'CRITICAL',
                message: `⚠️ Bearing temp ${latest.bearingTemp}°C exceeds 75°C! Stop and investigate.`,
                canIncreaseLoad: false
            };
        }

        if (tempRiseRate > 15) {
            return {
                status: 'WARNING',
                message: `⚠️ Temperature rising too fast: ${tempRiseRate.toFixed(1)}°C/hour. Hold current load.`,
                canIncreaseLoad: false
            };
        }

        // Check if temperature has stabilized
        const tempStabilized = Math.abs(tempRiseRate) < 2; // Less than 2°C/hour change
        const minWarmUpTime = latest.elapsedMinutes >= 120; // At least 2 hours

        if (tempStabilized && minWarmUpTime && latest.bearingTemp < 60) {
            return {
                status: 'NORMAL',
                message: `✅ Temperature stable at ${latest.bearingTemp}°C. OK to increase load.`,
                canIncreaseLoad: true
            };
        }

        return {
            status: 'NORMAL',
            message: `Warming up: ${latest.bearingTemp}°C, rate: ${tempRiseRate.toFixed(1)}°C/hr`,
            canIncreaseLoad: false
        };
    }

    /**
     * Generate warm-up curve data for plotting
     */
    getWarmUpCurve(): WarmUpDataPoint[] {
        return this.dataPoints;
    }

    /**
     * Get expected temperature at given time (for comparison)
     */
    getExpectedTemp(elapsedMinutes: number, load: number): number {
        // Empirical formula: T = T_ambient + (T_steady - T_ambient) * (1 - e^(-t/τ))
        const ambientTemp = 20;
        const steadyStateTemp = 40 + (load / 100) * 20; // 40-60°C depending on load
        const timeConstant = 60; // minutes

        return ambientTemp + (steadyStateTemp - ambientTemp) *
            (1 - Math.exp(-elapsedMinutes / timeConstant));
    }
}

// ========================================
// COMMISSIONING CERTIFICATE
// ========================================

export interface CommissioningCertificate {
    certificateId: string;
    assetId: string;
    assetName: string;
    workOrder: string;

    // Commissioning details
    commissioningDate: string;
    commissionedBy: {
        name: string;
        role: string;
        company: string;
        licenseNumber: string;
    };

    // Checklist results
    checklistResults: {
        itemId: string;
        passed: boolean;
        measuredValue?: string;
        notes?: string;
    }[];

    // Critical measurements
    measurements: {
        alignment: number;           // mm
        sealLeakage: number;        // ml/min
        vibrationOverall: number;   // mm/s
        vibration1X: number;        // mm/s
        governorResponseTime: number; // seconds
        overspeedTripRPM: number;
    };

    // Warm-up test results
    warmUpTest: {
        duration: number;           // minutes
        maxBearingTemp: number;     // °C
        finalVibration: number;     // mm/s
        passed: boolean;
    };

    // Final approval
    approved: boolean;
    approvedBy: {
        name: string;
        role: string;
        date: string;
    };

    signature?: string; // Digital signature/hash
}

/**
 * Generate commissioning certificate
 */
export function generateCommissioningCertificate(
    assetId: string,
    checkResults: any,
    warmUpData: WarmUpDataPoint[]
): CommissioningCertificate {
    const allPassed = checkResults.every((r: any) => r.passed);

    return {
        certificateId: `COMM-CERT-${Date.now()}`,
        assetId,
        assetName: 'Francis Horizontal Unit 01',
        workOrder: 'WO-2026-FRANCIS-CAVITATION-001',

        commissioningDate: new Date().toISOString(),
        commissionedBy: {
            name: 'Marko Jurić',
            role: 'Lead Commissioning Engineer',
            company: 'ANDRITZ Service Croatia',
            licenseNumber: 'COMM-EU-2024-1142'
        },

        checklistResults: checkResults,

        measurements: {
            alignment: 0.03,
            sealLeakage: 0,
            vibrationOverall: 2.1,
            vibration1X: 1.8,
            governorResponseTime: 12,
            overspeedTripRPM: 660
        },

        warmUpTest: {
            duration: 240,
            maxBearingTemp: Math.max(...warmUpData.map(d => d.bearingTemp)),
            finalVibration: warmUpData[warmUpData.length - 1].vibration,
            passed: true
        },

        approved: allPassed,
        approvedBy: {
            name: 'Dr. Ivan Petrović',
            role: 'Chief Engineer',
            date: new Date().toISOString()
        }
    };
}
