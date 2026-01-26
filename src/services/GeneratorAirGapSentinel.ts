/**
 * Generator Air Gap Sentinel
 * - Minimum Gap Protection, Eccentricity Monitoring
 * - Unbalanced Magnetic Pull (UMP) estimation
 * - Thermal expansion compensation to avoid false alarms during warm-up
 *
 * Assumptions / units:
 * - `airGapSensors` values are provided in millimeters (mm).
 * - Internal calculations convert to meters (m) where needed.
 */

export type AirGapAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'MAGNETIC_INSTABILITY_WARNING'; eccentricityPct: number; umpN: number; reason: string }
    | { action: 'CRITICAL_GAP_REDUCTION'; minGap_m: number; reason: string }
    | { action: 'EXCITATION_TRIP'; reason: string }
    | { action: 'MECHANICAL_TRIP'; reason: string };

export interface AirGapMeasurement {
    timestamp: string; // ISO
    airGapSensorsMm: number[]; // at least 4 quadrant readings, mm
    rotorSpeedRpm: number;
    excitationCurrentA: number;
    statorTempC: number;
}

import BaseGuardian from './BaseGuardian';

export class GeneratorAirGapSentinel extends BaseGuardian {
    // configuration
    private eccentricityWarningPct = 15; // %
    private eccentricityCriticalPct = 25; // %
    private umpWarningN = 1000; // Newtons (heuristic)
    private umpCriticalN = 3000; // Newtons
    private minGapThreshold_m = 0.0005; // 0.5 mm minimum allowed gap (m)

    // thermal compensation
    private refStatorTempC = 25; // reference
    private thermalCoef_m_perC = -5e-6; // gap change per °C (m/°C) — negative = gap reduces with heating

    // startup suppression parameters
    private suppressTempRiseC = 20; // if stator warms > this and rotor slow, suppress
    private rotorSpeedSuppressionRpm = 200; // rpm threshold considered low-speed startup

    constructor(opts?: Partial<Record<string, number>>) {
        super();
        if (opts?.['eccentricityWarningPct']) this.eccentricityWarningPct = opts['eccentricityWarningPct'];
        if (opts?.['eccentricityCriticalPct']) this.eccentricityCriticalPct = opts['eccentricityCriticalPct'];
        if (opts?.['umpWarningN']) this.umpWarningN = opts['umpWarningN'];
        if (opts?.['umpCriticalN']) this.umpCriticalN = opts['umpCriticalN'];
        if (opts?.['minGapThreshold_m']) this.minGapThreshold_m = opts['minGapThreshold_m'];
    }

    addMeasurement(m: AirGapMeasurement): AirGapAction {
        const gapsMm = (m.airGapSensorsMm || []).slice(0, 4);
        if (gapsMm.length < 4) return { action: 'NO_ACTION', reason: 'Insufficient air gap sensors' };

        // thermal compensation: estimate delta gap due to stator temp
        const deltaTemp = m.statorTempC - this.refStatorTempC;
        const thermalReduction_m = this.thermalCoef_m_perC * deltaTemp; // may be negative

        // convert sensors to meters and apply thermal compensation
        const gapsM = gapsMm.map(g => Math.max(0, (g / 1000) + thermalReduction_m));

        const avgGap = gapsM.reduce((s, v) => s + v, 0) / gapsM.length;
        const minGap = Math.min(...gapsM);
        const maxGap = Math.max(...gapsM);

        // eccentricity percentage (asymmetry)
        const eccentricityPct = ((maxGap - minGap) / Math.max(1e-9, avgGap)) * 100;

        // UMP estimation (heuristic): proportional to excitation current and eccentricity and rotor speed
        // UMP_N = k * I_exc * (eccentricityPct/100) * (rotorSpeedRpm / 1000)
        const k = 200; // tuning constant (heuristic)
        const umpN = k * Math.abs(m.excitationCurrentA) * (eccentricityPct / 100) * (m.rotorSpeedRpm / 1000);

        // suppress alarms during thermal startup: if stator warming and rotor slow
        const isThermalStartup = (deltaTemp > this.suppressTempRiseC) && (m.rotorSpeedRpm < this.rotorSpeedSuppressionRpm);
        if (isThermalStartup) {
            return { action: 'NO_ACTION', reason: `Thermal startup suppression active (ΔT=${deltaTemp.toFixed(1)}°C, rpm=${m.rotorSpeedRpm}).` };
        }

        // Minimum gap checks
        if (minGap <= this.minGapThreshold_m) {
            // critical: remove excitation then mechanical trip
            return { action: 'CRITICAL_GAP_REDUCTION', minGap_m: minGap, reason: `Minimum gap ${ (minGap*1000).toFixed(2) } mm below threshold ${ (this.minGapThreshold_m*1000).toFixed(2) } mm.` };
        }

        // Magnetic instability via eccentricity/UMP
        if (eccentricityPct >= this.eccentricityCriticalPct || umpN >= this.umpCriticalN) {
            return { action: 'EXCITATION_TRIP', reason: `Critical magnetic instability detected (ecc=${eccentricityPct.toFixed(1)}%, UMP=${umpN.toFixed(0)}N).` };
        }

        if (eccentricityPct >= this.eccentricityWarningPct || umpN >= this.umpWarningN) {
            return { action: 'MAGNETIC_INSTABILITY_WARNING', eccentricityPct: Number(eccentricityPct.toFixed(2)), umpN: Number(umpN.toFixed(0)), reason: `Magnetic asymmetry detected (ecc=${eccentricityPct.toFixed(1)}%, UMP=${umpN.toFixed(0)}N).` };
        }

        return { action: 'NO_ACTION', reason: `avgGap=${(avgGap*1000).toFixed(2)} mm, ecc=${eccentricityPct.toFixed(2)}%` };
    }

    getHealthImpactForAction(a: AirGapAction) {
        switch (a.action) {
            case 'CRITICAL_GAP_REDUCTION': return { overallDelta: -80, followup: ['EXCITATION_TRIP','MECHANICAL_TRIP'], details: a.reason };
            case 'EXCITATION_TRIP': return { overallDelta: -60, followup: ['EXCITATION_TRIP'], details: a.reason };
            case 'MAGNETIC_INSTABILITY_WARNING': return { overallDelta: -25, followup: [], details: a.reason };
            default: return { overallDelta: 0, followup: [], details: a.reason || 'No impact' };
        }
    }

    // Confidence: correlation between quadrant gap asymmetry and estimated UMP
    public getConfidenceScore(samples: AirGapMeasurement[] = []): number {
        if (!samples || samples.length < 3) return 50;
        const eccs = samples.map(s => {
            const gaps = (s.airGapSensorsMm || []).slice(0,4).map(g => (g/1000));
            if (gaps.length < 4) return 0;
            const avg = gaps.reduce((a,b)=>a+b,0)/gaps.length;
            return ((Math.max(...gaps) - Math.min(...gaps))/Math.max(1e-9, avg))*100;
        });
        const umps = samples.map(s => {
            const gaps = (s.airGapSensorsMm || []).slice(0,4);
            const avg = gaps.reduce((a,b)=>a+b,0)/Math.max(1,gaps.length);
            const ecc = (Math.max(...gaps) - Math.min(...gaps))/Math.max(1e-9, avg);
            return 200 * Math.abs(s.excitationCurrentA || 0) * (ecc/100) * ((s.rotorSpeedRpm||0)/1000);
        });
        const corr = this.safeCorrelation(eccs, umps);
        return this.corrToScore(isNaN(corr) ? 0 : corr);
    }
}

export default GeneratorAirGapSentinel;
