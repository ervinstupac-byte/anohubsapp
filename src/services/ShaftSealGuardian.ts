/**
 * Shaft Seal Guardian
 * - Probabilistic Failure Function with Bayesian update
 * - Leakage Trend Analysis and Predictive Window
 * - Integration action outputs for Sovereign Executive (derate / shutdown)
 */

import BaseGuardian from './BaseGuardian';

export type SealAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'PROBABILISTIC_WARNING'; probability: number; recommendedDerateMw: number; reason: string }
    | { action: 'HARD_TRIP'; probability: number; reason: string };

export interface SealMeasurement {
    timestamp: string; // ISO
    Q_seal: number; // cooling flow (m3/s)
    P_seal: number; // pressure (bar)
    T_seal: number; // temperature (C)
    leakagePitLevel?: number; // mm or similar unit
}

export class ShaftSealGuardian extends BaseGuardian {
    private windowSize = 60; // samples
    private samples: SealMeasurement[] = [];
    private priorPFail = 0.02; // conservative prior

    // configuration knobs
    private tempWeight = 0.6;
    private flowWeight = 0.6;
    private corrWeight = 0.8;

    constructor(opts?: { windowSize?: number; prior?: number }) {
        super();
        if (opts?.windowSize) this.windowSize = opts.windowSize;
        if (opts?.prior) this.priorPFail = opts.prior;
    }

    addMeasurement(m: SealMeasurement): SealAction {
        // insert and keep window
        this.samples.push(m);
        if (this.samples.length > this.windowSize) this.samples.shift();

        const pFail = this.estimateFailureProbability();

        // Leakage trend predictive window (hours remaining) - separate analysis
        const hoursRemaining = this.predictLeakageWindow();

        // Decision rules integrating with Sovereign Executive
        if (pFail >= 0.85) {
            return { action: 'HARD_TRIP', probability: pFail, reason: `Immediate sovereign shutdown (P_fail=${pFail.toFixed(2)}).` };
        }

        if (pFail >= 0.5) {
            // recommend derate proportional to risk and predicted time
            const recommendedDerateMw = Math.min(0.5, pFail) * 100; // example: scaled derate suggestion (MW proxy)
            return {
                action: 'PROBABILISTIC_WARNING',
                probability: pFail,
                recommendedDerateMw: Number(recommendedDerateMw.toFixed(2)),
                reason: `Probabilistic warning (P_fail=${pFail.toFixed(2)}). ETA spent in ${hoursRemaining ?? 'unknown'}h.`
            };
        }

        return { action: 'NO_ACTION', reason: `P_fail=${pFail.toFixed(3)} within acceptable bounds.` };
    }

    private estimateFailureProbability(): number {
        if (this.samples.length < 4) return this.priorPFail;

        // compute recent rates (delta / hour)
        const rates = this.computeRates();

        // normalized score components
        const tempRateScore = this.scoreFromRate(rates.tempPerHour, 0.5); // 0.5C/hr nominal
        const flowRateScore = this.scoreFromRate(rates.flowPerHour, 0.2); // 0.2 m3/s per hour
        const pressureRateScore = this.scoreFromRate(rates.pressurePerHour, 0.5);

        // correlation between temperature and flow (Pearson on window)
        const corr = this.computeCorrelation();
        const corrScore = Math.abs(corr); // stronger absolute correlation increases risk when signs indicate coupling

        // evidence score: weighted sum of signals
        const evidenceScore = (this.tempWeight * tempRateScore) + (this.flowWeight * flowRateScore) + (0.3 * pressureRateScore) + (this.corrWeight * corrScore);

        // convert evidenceScore to likelihood ratio L = exp(k * score)
        const k = 2.5; // sensitivity
        const L = Math.exp(k * evidenceScore);

        // Bayesian update: posterior = L*prior / (L*prior + (1-prior))
        const prior = this.priorPFail;
        const posterior = (L * prior) / (L * prior + (1 - prior));

        // remember posterior as new prior for next iteration (quantum-inspired continuous update)
        this.priorPFail = Math.min(Math.max(posterior, 1e-6), 0.999999);

        return Number(this.priorPFail.toFixed(4));
    }

    private computeRates() {
        // use last and first sample in window to compute simple slope per hour
        const first = this.samples[0];
        const last = this.samples[this.samples.length - 1];
        const t0 = Date.parse(first.timestamp);
        const t1 = Date.parse(last.timestamp);
        const dtHours = Math.max((t1 - t0) / (1000 * 3600), 1 / 3600); // at least 1 second

        const flowPerHour = (last.Q_seal - first.Q_seal) / dtHours;
        const tempPerHour = (last.T_seal - first.T_seal) / dtHours;
        const pressurePerHour = (last.P_seal - first.P_seal) / dtHours;

        return { flowPerHour, tempPerHour, pressurePerHour };
    }

    private scoreFromRate(rate: number, nominal: number) {
        // produce a 0..1 score where 0 is safe and 1 is extreme
        const normalized = Math.abs(rate) / (Math.abs(nominal) + 1e-6);
        // soft cap with tanh to keep it bounded
        return Math.tanh(normalized);
    }

    private computeCorrelation(): number {
        const temps = this.samples.map(s => s.T_seal);
        const flows = this.samples.map(s => s.Q_seal);
        return this.safeCorrelation(temps, flows);
    }

    // Leakage predictive window: returns estimated hours until 'spent' if linear trend continues
    predictLeakageWindow(threshold = 100): number | null {
        // threshold: pit level value considered 'spent'
        const levels = this.samples.map(s => s.leakagePitLevel).filter(v => typeof v === 'number') as number[];
        if (levels.length < 2) return null;

        // compute rate per hour using first/last timestamp
        const first = this.samples[0];
        const last = this.samples[this.samples.length - 1];
        if (first.leakagePitLevel == null || last.leakagePitLevel == null) return null;
        const t0 = Date.parse(first.timestamp);
        const t1 = Date.parse(last.timestamp);
        const dtHours = Math.max((t1 - t0) / (1000 * 3600), 1 / 3600);

        const ratePerHour = (last.leakagePitLevel! - first.leakagePitLevel!) / dtHours;
        if (ratePerHour <= 0) return null; // not increasing

        const current = last.leakagePitLevel!;
        const hours = (threshold - current) / ratePerHour;
        return hours <= 0 ? 0 : Number(hours.toFixed(2));
    }

    // Expose a simple health score impact to the Sovereign Executive
    // Returns a delta in healthScore (0-100) that the MasterHealth engine may apply
    getHealthImpact(): { overallDelta: number; details?: string } {
        const pf = this.priorPFail;
        const impact = -Math.min(50, Math.round(pf * 100)); // scale to -0..-50
        const details = `ShaftSeal P_fail=${pf.toFixed(3)} -> health delta ${impact}`;
        return { overallDelta: impact, details };
    }

    /**
     * Get confidence score based on sample count and data quality
     * Higher confidence with more samples and stable measurements
     */
    public getConfidenceScore(samples: SealMeasurement[] = []): number {
        // Use provided samples or fall back to internal samples
        const data = samples.length > 0 ? samples : this.samples;
        if (!data || data.length < 4) return 45;
        
        const temps = data.map(s => s.T_seal || 0);
        const flows = data.map(s => s.Q_seal || 0);
        const corr = this.safeCorrelation(temps, flows);
        let score = this.corrToScore ? this.corrToScore(Math.abs(corr)) : Math.round(((Math.abs(corr) + 1) / 2) * 100);
        // Penalize if rates are very noisy
        const stdTemp = this.safeStdDev(temps);
        if (stdTemp > 5) score -= 15;
        
        return Math.max(0, Math.min(100, score));
    }
}

export default ShaftSealGuardian;
