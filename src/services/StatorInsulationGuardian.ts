/**
 * Stator Insulation Guardian
 * - Partial Discharge (PD) severity classification
 * - PD trending (Q_max) over 30-day windows
 * - Remaining Useful Life (RUL) estimate using combined thermal and electrical stress model
 */

import BaseGuardian from './BaseGuardian';

export type PDSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StatorAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'CRITICAL_INSULATION_DEGRADATION'; qMaxIncreasePct: number; reason: string }
    | { action: 'BOROSCOPE_INSPECTION_RECOMMENDED'; severity: PDSeverity; reason: string }
    | { action: 'SCHEDULE_MAINTENANCE'; severity: PDSeverity; reason: string };

export interface PDMeasurement {
    timestamp: string; // ISO
    q_pC: number; // charge magnitude pC (peak or per-pulse magnitude) — use consistent metric
    pps: number; // pulses per second
    voltage_kV: number; // stator line-to-line or phase
    windingTempC: number;
}

export class StatorInsulationGuardian extends BaseGuardian {
    private samples: PDMeasurement[] = [];

    // thresholds
    private qMaxTrendPctThreshold = 20; // 20% increase flagged as critical over 30-day window
    private boroscopeThresholdPct = 10; // 10% increase / medium PD activity

    // RUL base and tuning
    private baseLifeHours = 30 * 365 * 24; // 30 years baseline (hours)
    private thermalAlpha = 0.06; // per °C aging factor (linear approx)
    private electricalBeta = 0.002; // per pC*pps factor

    addMeasurement(m: PDMeasurement): StatorAction {
        this.samples.push(m);
        // keep last 10000 samples cap
        if (this.samples.length > 20000) this.samples.shift();

        // PD severity classification (heuristic)
        const severity = this.classifyPD(m.q_pC, m.pps, m.voltage_kV);

        // Qmax trend analysis over 30-day windows
        const qtrend = this.computeQMaxTrend30d(m.timestamp);
        if (qtrend && qtrend.pctIncrease !== null && qtrend.pctIncrease >= this.qMaxTrendPctThreshold) {
            return { action: 'CRITICAL_INSULATION_DEGRADATION', qMaxIncreasePct: Number(qtrend.pctIncrease.toFixed(2)), reason: `Q_max increased ${qtrend.pctIncrease.toFixed(2)}% over 30-day window.` };
        }

        // If PD activity moderate-high, recommend boroscope inspection
        if (severity === 'HIGH' || severity === 'CRITICAL' || (qtrend && qtrend.pctIncrease !== null && qtrend.pctIncrease >= this.boroscopeThresholdPct)) {
            return { action: 'BOROSCOPE_INSPECTION_RECOMMENDED', severity, reason: `PD activity ${severity}. Consider visual boroscope inspection.` };
        }

        return { action: 'NO_ACTION', reason: `PD severity ${severity}.` };
    }

    classifyPD(q_pC: number, pps: number, voltage_kV: number): PDSeverity {
        // Heuristic mapping:
        // - Surface tracking: many pulses (high PPS) but small q_pC; often at lower voltage
        // - Slot discharge: medium q_pC, moderate PPS
        // - Internal void: high q_pC at moderate PPS and high voltage

        const energyProxy = q_pC * pps; // crude energy proxy (pC * pulses per second)

        // Rough boundaries (adjust per unit)
        if (q_pC >= 500 || (energyProxy >= 50000 && voltage_kV >= 10)) return 'CRITICAL';
        if (q_pC >= 200 || energyProxy >= 15000) return 'HIGH';
        if (q_pC >= 50 || energyProxy >= 2000) return 'MEDIUM';
        return 'LOW';
    }

    computeQMaxTrend30d(refTimestampIso: string): { pctIncrease: number | null; baselineMax?: number; recentMax?: number } | null {
        if (!this.samples || this.samples.length < 10) return null;
        const refTs = Date.parse(refTimestampIso);
        const DAY_MS = 24 * 3600 * 1000;
        const recentStart = refTs - (30 * DAY_MS);
        const prevStart = refTs - (60 * DAY_MS);

        const prevWindow = this.samples.filter(s => {
            const t = Date.parse(s.timestamp);
            return t >= prevStart && t < recentStart;
        });

        const recentWindow = this.samples.filter(s => {
            const t = Date.parse(s.timestamp);
            return t >= recentStart && t <= refTs;
        });

        if (prevWindow.length < 3 || recentWindow.length < 3) return null; // not enough history

        const prevMax = Math.max(...prevWindow.map(s => s.q_pC));
        const recentMax = Math.max(...recentWindow.map(s => s.q_pC));
        if (prevMax <= 0) return null;
        const pctIncrease = ((recentMax - prevMax) / prevMax) * 100;
        return { pctIncrease, baselineMax: prevMax, recentMax };
    }

    // RUL modeling using combined thermal and electrical stress approximations
    estimateRULHours(): { rulHours: number; details: string } {
        if (!this.samples || this.samples.length === 0) {
            return { rulHours: this.baseLifeHours, details: 'No samples — using base life.' };
        }

        // use average of recent window (last 7 days or all samples if fewer)
        const now = Date.now();
        const DAY_MS = 24 * 3600 * 1000;
        const recent = this.samples.filter(s => Date.parse(s.timestamp) >= now - (7 * DAY_MS));
        const used = recent.length >= 3 ? recent : this.samples.slice(-200);

        const avgTemp = used.reduce((s, v) => s + (v.windingTempC || 25), 0) / used.length;
        const avgQ = used.reduce((s, v) => s + v.q_pC, 0) / used.length;
        const avgPPS = used.reduce((s, v) => s + (v.pps || 0), 0) / used.length;

        // thermal aging factor (simple linear factor)
        const thermalFactor = 1 + this.thermalAlpha * Math.max(0, avgTemp - 20);

        // electrical aging factor
        const electricalFactor = 1 + this.electricalBeta * (avgQ * avgPPS);

        const agingFactor = thermalFactor * electricalFactor;
        const rulHours = Math.max(0, this.baseLifeHours / agingFactor);

        return { rulHours: Math.round(rulHours), details: `avgTemp=${avgTemp.toFixed(1)}°C avgQ=${avgQ.toFixed(1)}pC avgPPS=${avgPPS.toFixed(1)} agingFactor=${agingFactor.toFixed(3)}` };
    }

    getHealthImpactForAction(a: StatorAction) {
        switch (a.action) {
            case 'CRITICAL_INSULATION_DEGRADATION': return { overallDelta: -70, recommendation: 'Immediate borescope and replace winding sections.' };
            case 'BOROSCOPE_INSPECTION_RECOMMENDED': return { overallDelta: -30, recommendation: 'Schedule boroscope inspection.' };
            case 'SCHEDULE_MAINTENANCE': return { overallDelta: -20, recommendation: 'Schedule maintenance.' };
            default: return { overallDelta: 0, recommendation: 'No action' };
        }
    }

    /**
     * Get confidence score based on sample count, trend analysis capability, and PD correlation
     */
    public getConfidenceScore(samples: PDMeasurement[] = []): number {
        // Use provided samples or fall back to internal samples
        const data = samples.length > 0 ? samples : this.samples;
        
        if (!data || data.length < 4) return 45;
        
        const sampleCount = data.length;
        if (sampleCount < 10) return 30; // Very low confidence - need minimum for trend
        if (sampleCount < 30) return 55; // Low confidence
        if (sampleCount < 100) return 75; // Moderate confidence
        
        // High confidence: combine correlation analysis with trend capability
        const q = data.map(s => s.q_pC || 0);
        const pps = data.map(s => s.pps || 0);
        const corr = this.safeCorrelation(q, pps);
        const correlationScore = this.corrToScore(isNaN(corr) ? 0 : Math.abs(corr));
        
        // Check if we can compute trends
        const now = Date.now();
        const DAY_MS = 24 * 3600 * 1000;
        const recent30d = data.filter(s => Date.parse(s.timestamp) >= now - (30 * DAY_MS));
        const recent60d = data.filter(s => Date.parse(s.timestamp) >= now - (60 * DAY_MS));
        
        // Base confidence from correlation, then boost for trend capability
        let confidence = correlationScore;
        if (recent30d.length >= 10) confidence += 10;
        if (recent60d.length >= 20) confidence += 5;
        
        return Math.min(100, Math.round(confidence));
    }
}

export default StatorInsulationGuardian;
