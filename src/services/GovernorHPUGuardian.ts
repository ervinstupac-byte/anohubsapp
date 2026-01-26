/**
 * Governor HPU Guardian
 * - Accumulator health monitoring (pump cycle frequency / nitrogen precharge)
 * - Varnish / Filter DeltaP correlation detection
 * - Emergency shutdown time validation (safety degradation)
 */

import BaseGuardian from './BaseGuardian';

export type GovernorAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'NITROGEN_PRECHARGE_DEPLETION'; trend?: any; reason: string }
    | { action: 'VARNISH_RISK_ALERT'; corr?: number; reason: string }
    | { action: 'SAFETY_SYSTEM_DEGRADED'; baselineSec: number; currentSec: number; reason: string }
    | { action: 'BLOCK_OPENING'; reason: string }
    | { action: 'FAILSAFE_CLOSE'; reason: string };

export interface GovernorMeasurement {
    timestamp: string; // ISO
    mainHeaderPressureBar?: number;
    accumulatorPressureBar?: number;
    pumpRunTimeSec?: number; // seconds pump has been running in this cycle (0 if stopped)
    pumpOn?: boolean; // alternative
    oilTempC?: number;
    filterDeltaPBar?: number; // pressure drop across filter
    emergencyCloseDurationSec?: number; // measured emergency close time (100->0)
}

export class GovernorHPUGuardian extends BaseGuardian {
    private windowSize = 120; // samples ~ recent window
    private samples: GovernorMeasurement[] = [];

    // pump start timestamps
    private pumpStarts: number[] = [];
    private startDetectionPrevRunTime = 0;

    // emergency baseline
    private emergencyBaselineSec: number | null = null;

    // thresholds
    private minMainHeaderPressureBar = 20; // below this, block opening and prepare failsafe
    private prechargeTrendFactor = 0.8; // last interval < factor * avgPrev => depletion
    private varnishCorrThreshold = 0.6;
    private varnishOilTempThresholdC = 60;
    private varnishDeltaPThresholdBar = 0.3;

    addMeasurement(m: GovernorMeasurement): GovernorAction {
        this.samples.push(m);
        if (this.samples.length > this.windowSize) this.samples.shift();

        const now = Date.parse(m.timestamp || new Date().toISOString());

        // detect pump start using pumpRunTimeSec edge or pumpOn
        const runTime = typeof m.pumpRunTimeSec === 'number' ? m.pumpRunTimeSec : (m.pumpOn ? 1 : 0);
        if (runTime > 0 && this.startDetectionPrevRunTime === 0) {
            // start event
            this.pumpStarts.push(now);
            if (this.pumpStarts.length > 20) this.pumpStarts.shift();
        }
        this.startDetectionPrevRunTime = runTime;

        // Accumulator health: analyze pump start intervals
        if (this.pumpStarts.length >= 3) {
            const intervals = [] as number[];
            for (let i = 1; i < this.pumpStarts.length; i++) intervals.push((this.pumpStarts[i] - this.pumpStarts[i - 1]) / 1000); // seconds
            const lastInterval = intervals[intervals.length - 1];
            const prevAvg = intervals.slice(0, -1).reduce((s, v) => s + v, 0) / Math.max(1, intervals.length - 1);

            // require roughly constant load: low variance in mainHeaderPressure
            const pressures = this.samples.map(s => s.mainHeaderPressureBar).filter(v => typeof v === 'number') as number[];
            const pressureStd = this.stdDev(pressures);

            if (prevAvg > 1 && lastInterval < (prevAvg * this.prechargeTrendFactor) && pressureStd < 0.5) {
                return { action: 'NITROGEN_PRECHARGE_DEPLETION', trend: { lastInterval, prevAvg }, reason: `Pump starts interval decreasing (${lastInterval}s < ${ (prevAvg * this.prechargeTrendFactor).toFixed(1)}s) while pressure stable (σ=${pressureStd.toFixed(2)}bar).` };
            }
        }

        // Varnish / Filter detection: correlation between filter DeltaP and oil temp
        const deltas = this.samples.map(s => s.filterDeltaPBar).filter(v => typeof v === 'number') as number[];
        const temps = this.samples.map(s => s.oilTempC).filter(v => typeof v === 'number') as number[];
        if (deltas.length >= 10 && temps.length >= 10) {
            const corr = this.pearsonCorrelation(deltas, temps);
            const avgTemp = temps.reduce((s, v) => s + v, 0) / temps.length;
            const avgDelta = deltas.reduce((s, v) => s + v, 0) / deltas.length;
            if (corr >= this.varnishCorrThreshold && avgTemp >= this.varnishOilTempThresholdC && avgDelta >= this.varnishDeltaPThresholdBar) {
                return { action: 'VARNISH_RISK_ALERT', corr, reason: `High correlation between filter ΔP and oil temp (corr=${corr.toFixed(2)}), avgTemp=${avgTemp.toFixed(1)}°C, ΔP=${avgDelta.toFixed(3)}bar.` };
            }
        }

        // Emergency close validation
        if (typeof m.emergencyCloseDurationSec === 'number') {
            if (this.emergencyBaselineSec === null) this.emergencyBaselineSec = m.emergencyCloseDurationSec;
            else {
                const current = m.emergencyCloseDurationSec;
                if (current > (this.emergencyBaselineSec * 1.2)) {
                    return { action: 'SAFETY_SYSTEM_DEGRADED', baselineSec: this.emergencyBaselineSec, currentSec: current, reason: `Emergency close time increased from ${this.emergencyBaselineSec}s to ${current}s (>20%).` };
                }
            }
        }

        // Low hydraulic pressure immediate blocking
        if (typeof m.mainHeaderPressureBar === 'number' && m.mainHeaderPressureBar < this.minMainHeaderPressureBar) {
            return { action: 'BLOCK_OPENING', reason: `Main header pressure low (${m.mainHeaderPressureBar} bar) — blocking opening and preparing failsafe close.` };
        }

        // WATER HAMMER PROTECTION: restrict gate closing speed based on Penstock Time Constant
        // If emergencyCloseDurationSec provided and is faster than safe threshold derived from penstock time constant, warn/force failsafe
        // Penstock time constant estimated from length/diameter heuristics; we keep it simple here
        if (typeof m.emergencyCloseDurationSec === 'number') {
            const safeTimeSec = this.estimateSafeCloseTime();
            if (m.emergencyCloseDurationSec < safeTimeSec * 0.5) {
                return { action: 'FAILSAFE_CLOSE', reason: `Emergency close too fast (${m.emergencyCloseDurationSec}s) relative to safe penstock time ${safeTimeSec}s — potential water hammer.` };
            }
        }

        return { action: 'NO_ACTION', reason: 'No governor HPU anomaly detected in recent window.' };
    }

    // utility math - now using BaseGuardian methods
    private pearsonCorrelation(a: number[], b: number[]) {
        return this.safeCorrelation(a, b);
    }

    private stdDev(values: number[]) {
        return this.safeStdDev(values);
    }

    // Estimate a safe emergency close time (sec) from penstock heuristics
    private estimateSafeCloseTime() {
        // Heuristic: assume penstock length and diameter influence time constant; without telemetry use default
        const defaultTime = 12; // seconds safe close baseline for moderate penstocks
        // If we had external config, compute from length/diameter; placeholder returns default
        return defaultTime;
    }

    // Public accessor for other guardians/adapters to respect water-hammer limits
    public getSafeCloseTime(): number {
        return this.estimateSafeCloseTime();
    }

    getHealthImpactForAction(a: GovernorAction) {
        switch (a.action) {
            case 'NITROGEN_PRECHARGE_DEPLETION': return { overallDelta: -20, details: a.reason };
            case 'VARNISH_RISK_ALERT': return { overallDelta: -25, details: a.reason };
            case 'SAFETY_SYSTEM_DEGRADED': return { overallDelta: -40, details: a.reason };
            case 'BLOCK_OPENING': return { overallDelta: -30, details: a.reason };
            case 'FAILSAFE_CLOSE': return { overallDelta: -50, details: a.reason };
            default: return { overallDelta: 0, details: a.reason || 'No impact' };
        }
    }

    /**
     * Get confidence score based on sample count, pump start detection quality, and response lag analysis
     */
    public getConfidenceScore(samples: GovernorMeasurement[] = []): number {
        // Use provided samples or fall back to internal samples
        const data = samples.length > 0 ? samples : this.samples;
        
        if (!data || data.length < 5) return 50;
        
        const sampleCount = data.length;
        if (sampleCount < 10) return 25; // Very low confidence
        if (sampleCount < 30) return 50; // Low confidence
        if (sampleCount < 60) return 70; // Moderate confidence
        
        // High confidence: analyze response lag and operational history
        const times = data.map(s => Date.parse(s.timestamp));
        const runTimes = data.map(s => s.pumpRunTimeSec || 0);
        
        // Compute average response lag: detect when pumpRunTime increases after prior zero -> event
        let lags: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const prev = data[i-1];
            const cur = data[i];
            const prevRun = prev.pumpRunTimeSec || 0;
            const curRun = cur.pumpRunTimeSec || 0;
            if (prevRun === 0 && curRun > 0) {
                // Event start at cur.timestamp; search backward for a pressure/command change
                const eventTime = Date.parse(cur.timestamp);
                // Find last pressure drop/change timestamp
                let cmdIdx = i - 1;
                while (cmdIdx >= 0 && Math.abs((Date.parse(data[cmdIdx].timestamp) - eventTime)) < 120000) cmdIdx--;
                const cmdTime = cmdIdx >= 0 ? Date.parse(data[cmdIdx].timestamp) : eventTime - 30000;
                const lag = (eventTime - cmdTime) / 1000;
                lags.push(lag);
            }
        }
        
        let score = 100;
        
        // Penalize for high response lag
        if (lags.length > 0) {
            const avgLag = lags.reduce((s, v) => s + v, 0) / lags.length;
            // Expected avgLag < 5s; penalize if > 8s
            if (avgLag > 8) score -= Math.round((avgLag - 8) * 5 + 30);
            else if (avgLag > 5) score -= 20;
        } else {
            score = 60; // No lag data available
        }
        
        // Also penalize if emergency close times show high variance
        const closeTimes = data.map(s => s.emergencyCloseDurationSec || 0).filter(v => v > 0);
        if (closeTimes.length > 3) {
            const std = this.stdDev(closeTimes);
            if (std > 4) score -= 20;
        }
        
        // Boost for consistent pump start detection and emergency baseline
        const hasPumpStarts = this.pumpStarts.length >= 3;
        const hasEmergencyBaseline = this.emergencyBaselineSec !== null;
        if (hasPumpStarts) score += 10;
        if (hasEmergencyBaseline) score += 10;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Accept nozzle sequencing commands from executive
     */
    applyNozzleSequence(seq: { activeNozzles: number; sequenceOrder?: number[]; requestedBy?: string }) {
        // Validate and accept sequence; in real system this would send to PLC
        const ok = seq.activeNozzles >= 1 && seq.activeNozzles <= 16;
        if (!ok) return { accepted: false, reason: 'activeNozzles out of safe range' };
        // Store last sequence (could be used for audit)
        (this as any)._lastSequence = seq;
        return { accepted: true, applied: seq, message: `Nozzle sequencing applied (${seq.activeNozzles} active)` };
    }
}

export default GovernorHPUGuardian;
