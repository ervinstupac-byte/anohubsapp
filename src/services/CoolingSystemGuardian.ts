export type CoolingSample = {
    timestamp: number;
    oilInletC?: number;
    oilOutletC?: number;
    waterInletC?: number;
    waterOutletC?: number;
    waterFlowM3h?: number;
    pumpCurrentA?: number;
    pumpPressureBar?: number;
    pumpVibration?: number; // mm/s or similar
    pumpRunning?: boolean;
    backupPumpStarted?: boolean;
    // optional pre-computed failure probability
    p_fail?: number;
};

export type CoolingAnalysis = {
    U: number | null; // overall heat transfer coefficient (W/m2K)
    LMTD: number | null;
    foulingDetected: boolean;
    foulingDropPct: number | null;
    p_fail: number;
    pumpIssues: { cavitation: boolean; suctionBlock: boolean };
    rotationDue: boolean;
    lastRotation?: number | null;
};

import BaseGuardian from './BaseGuardian';

export default class CoolingSystemGuardian extends BaseGuardian {
    private cleanBaselineU: number;
    private heatExchangerAreaM2: number;
    private lastRotationAt: number | null = null;

    constructor(options?: { cleanBaselineU?: number; areaM2?: number; lastRotationAt?: number | null }) {
        super();
        this.cleanBaselineU = options?.cleanBaselineU ?? 600; // W/m2K default
        this.heatExchangerAreaM2 = options?.areaM2 ?? 40; // placeholder
        this.lastRotationAt = options?.lastRotationAt ?? null;
    }

    // Log Mean Temperature Difference: LMTD = (dT1 - dT2)/ln(dT1/dT2)
    private calculateLMTD(delta1: number, delta2: number): number | null {
        if (delta1 <= 0 || delta2 <= 0) return null;
        if (Math.abs(delta1 - delta2) < 1e-6) return delta1; // approx
        return (delta1 - delta2) / Math.log(delta1 / delta2);
    }

    // Estimate U from Q = U * A * LMTD. Here Q approximated via mass flow * cp * dT (water side used)
    private estimateU(sample: CoolingSample): number | null {
        if (!sample.waterFlowM3h || !sample.waterInletC || !sample.waterOutletC) return null;
        const rhoWater = 1000; // kg/m3
        const cpWater = 4182; // J/kgK
        const flow_m3s = (sample.waterFlowM3h || 0) / 3600.0;
        const mdot = rhoWater * flow_m3s; // kg/s
        const dT = sample.waterOutletC! - sample.waterInletC!; // K
        const Qw = mdot * cpWater * dT; // Watts

        // compute LMTD using oil inlet/outlet and water inlet/outlet if available
        if (!sample.oilInletC || !sample.oilOutletC) return null;
        const delta1 = sample.oilInletC - sample.waterOutletC; // hot side difference
        const delta2 = sample.oilOutletC - sample.waterInletC; // cold side difference
        const LMTD = this.calculateLMTD(delta1, delta2);
        if (!LMTD || LMTD <= 0) return null;

        const U = Qw / (this.heatExchangerAreaM2 * LMTD);
        return U;
    }

    // Analyze a batch of samples (time-ordered). Returns analysis summary.
    public analyze(samples: CoolingSample[], options?: { rotationIntervalHours?: number }): CoolingAnalysis {
        const last = samples && samples.length ? samples[samples.length - 1] : null;

        let U: number | null = null;
        let LMTD: number | null = null;
        if (last) {
            U = this.estimateU(last);
            if (last.oilInletC && last.oilOutletC && last.waterInletC && last.waterOutletC) {
                const delta1 = last.oilInletC - last.waterOutletC;
                const delta2 = last.oilOutletC - last.waterInletC;
                LMTD = this.calculateLMTD(delta1, delta2);
            }
        }

        const foulingDropPct = U && this.cleanBaselineU ? ((this.cleanBaselineU - U) / this.cleanBaselineU) * 100 : null;
        const foulingDetected = foulingDropPct !== null && foulingDropPct >= 20;

        // Pump performance heuristics
        const pumpIssues = { cavitation: false, suctionBlock: false };
        if (last) {
            // Cavitation: high vibration + reduced pressure
            if ((last.pumpVibration || 0) > 8 && (last.pumpPressureBar || 0) < 0.8) {
                pumpIssues.cavitation = true;
            }
            // Suction blockage: high current but low flow/low pressure
            if ((last.pumpCurrentA || 0) > 80 && (last.waterFlowM3h || 0) < 5) {
                pumpIssues.suctionBlock = true;
            }
        }

        // Simple failure probability heuristic: combine fouling and pump issues
        const pfailBase = (foulingDetected ? 0.6 : (foulingDropPct ? Math.min(0.4, (foulingDropPct / 100) * 0.5) : 0.05));
        const pfailPump = (pumpIssues.cavitation || pumpIssues.suctionBlock) ? 0.5 : 0;
        const p_fail = Math.min(1, pfailBase + pfailPump);

        // Rotation schedule
        const rotationIntervalHours = options?.rotationIntervalHours ?? 168; // weekly
        const now = Date.now();
        const rotationDue = this.lastRotationAt ? ((now - this.lastRotationAt) / (1000 * 3600) >= rotationIntervalHours) : true;

        return {
            U,
            LMTD,
            foulingDetected,
            foulingDropPct,
            p_fail,
            pumpIssues,
            rotationDue,
            lastRotation: this.lastRotationAt
        };
    }

    public markRotation(now?: number) {
        this.lastRotationAt = now ?? Date.now();
    }

    // Primary confidence metric: cross-correlation between estimated U (heat transfer) and pump vibration
    public getConfidenceScore(samples: CoolingSample[] = [], vibrationSeries: number[] = []): number {
        // Build U series from samples
        const Useries: number[] = samples.map(s => this.estimateU(s) || 0).filter(v => typeof v === 'number');
        const vib = vibrationSeries && vibrationSeries.length >= Useries.length ? vibrationSeries.slice(-Useries.length) : (samples.map(s => s.pumpVibration || 0));

        const corr = this.safeCorrelation(Useries, vib);
        // If no valid correlation, fall back to p_fail heuristic
        if (isNaN(corr)) {
            const last = samples && samples.length ? samples[samples.length - 1] : null;
            const p_fail = last?.p_fail ?? 0.1;
            return Math.round(Math.max(20, 100 - p_fail * 100));
        }
        // map correlation -1..1 to 0..100
        let score = this.corrToScore(corr);
        // penalize if fouling detected (large drop in U)
        const lastU = Useries.length ? Useries[Useries.length-1] : null;
        if (lastU && this.cleanBaselineU && ((this.cleanBaselineU - lastU)/this.cleanBaselineU) > 0.25) score -= 20;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
