/**
 * Wicket Gate Kinematics
 * - Hysteresis Tracker (backlash / dead-band)
 * - Shear Pin Detection (discontinuity in force/position ratio)
 * - Friction Trend Analysis with baseline and warnings
 */

export type WicketAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'SHEAR_PIN_BROKEN'; reason: string }
    | { action: 'BACKLASH_WARNING'; backlashPct: number; reason: string }
    | { action: 'BACKLASH_CRITICAL'; backlashPct: number; reason: string }
    | { action: 'LUBRICATION_DEFICIENCY'; increasePct: number; reason: string }
    | { action: 'LIMIT_GATE_OPENING'; maxOpenPct: number; reason: string };

export interface WicketMeasurement {
    timestamp: string;
    servoCommandPct: number; // 0-100
    gateActualPct?: number; // if per-gate feedback available, single aggregated value or average
    regulatingRingForceN?: number; // N
    dP_servoBar?: number; // pressure differential
}

export class WicketGateKinematics {
    private lastCommand: number | null = null;
    private lastActual: number | null = null;
    private lastForcePerDeg: number | null = null;
    private backlashSamples: number[] = [];

    // friction baseline per 10% bin
    private baselineBins: Map<number, { sum: number; count: number }> = new Map();
    private baselineSamplesRequired = 50; // samples to consider baseline established

    // thresholds
    private backlashWarningPct = 2.0; // percent of stroke
    private backlashCriticalPct = 5.0; // percent of stroke
    private shearPinFactorThreshold = 4.0; // sudden factor change in force/deg
    private frictionIncreaseThresholdPct = 15.0; // percent

    addMeasurement(m: WicketMeasurement): WicketAction {
        const cmd = this.clampPct(m.servoCommandPct);
        const actual = typeof m.gateActualPct === 'number' ? this.clampPct(m.gateActualPct) : null;

        // compute instantaneous backlash if actual exists
        if (actual !== null) {
            const backlash = Math.abs(cmd - actual); // percent of stroke
            this.backlashSamples.push(backlash);
            if (this.backlashSamples.length > 200) this.backlashSamples.shift();
        }

        // update friction baseline if force available
        if (typeof m.regulatingRingForceN === 'number') {
            const bin = Math.floor(cmd / 10) * 10; // 0-9->0, 10-19->10
            const entry = this.baselineBins.get(bin) || { sum: 0, count: 0 };
            entry.sum += m.regulatingRingForceN;
            entry.count += 1;
            this.baselineBins.set(bin, entry);

            // compute current force per deg if movement measured
            if (this.lastActual !== null && this.lastCommand !== null) {
                const deltaDeg = Math.max(0.01, Math.abs(cmd - this.lastActual));
                const fpd = m.regulatingRingForceN / deltaDeg; // N per percent

                // shear pin detection: large discontinuity in force per deg vs previous
                if (this.lastForcePerDeg !== null) {
                    const factor = Math.abs(fpd / Math.max(1e-6, this.lastForcePerDeg));
                    const invFactor = Math.abs(this.lastForcePerDeg / Math.max(1e-6, fpd));
                    if (factor >= this.shearPinFactorThreshold || invFactor >= this.shearPinFactorThreshold) {
                        this.lastForcePerDeg = fpd;
                        this.lastCommand = cmd;
                        this.lastActual = actual;
                        return { action: 'SHEAR_PIN_BROKEN', reason: `Force/deg changed abruptly by factor ${factor.toFixed(2)} (fpd=${fpd.toFixed(2)}).` };
                    }
                }

                this.lastForcePerDeg = fpd;
            }
        }

        // hysteresis/backlash analysis
        const avgBacklash = this.backlashSamples.length ? (this.backlashSamples.reduce((s, v) => s + v, 0) / this.backlashSamples.length) : 0;
        if (avgBacklash >= this.backlashCriticalPct) {
            this.lastCommand = cmd;
            this.lastActual = actual;
            return { action: 'BACKLASH_CRITICAL', backlashPct: avgBacklash, reason: `Average backlash ${avgBacklash.toFixed(2)}% exceeds critical ${this.backlashCriticalPct}%` };
        }

        if (avgBacklash >= this.backlashWarningPct) {
            this.lastCommand = cmd;
            this.lastActual = actual;
            return { action: 'BACKLASH_WARNING', backlashPct: avgBacklash, reason: `Average backlash ${avgBacklash.toFixed(2)}% exceeds warning ${this.backlashWarningPct}%` };
        }

        // friction trend check: compare current bin average against baseline
        if (typeof m.regulatingRingForceN === 'number') {
            const bin = Math.floor(cmd / 10) * 10;
            const entry = this.baselineBins.get(bin);
            if (entry && entry.count >= this.baselineSamplesRequired) {
                const baselineAvg = entry.sum / entry.count;
                const current = m.regulatingRingForceN;
                const increasePct = ((current - baselineAvg) / Math.max(baselineAvg, 1e-6)) * 100;
                if (increasePct >= this.frictionIncreaseThresholdPct) {
                    this.lastCommand = cmd;
                    this.lastActual = actual;
                    return { action: 'LUBRICATION_DEFICIENCY', increasePct: Number(increasePct.toFixed(2)), reason: `Force increased ${increasePct.toFixed(2)}% over baseline at ${bin}% bin.` };
                }
            }
        }

        // no issues
        this.lastCommand = cmd;
        this.lastActual = actual;
        return { action: 'NO_ACTION', reason: `avgBacklash=${avgBacklash.toFixed(2)}%` };
    }

    // health impact mapping
    getHealthImpactForAction(a: WicketAction) {
        switch (a.action) {
            case 'SHEAR_PIN_BROKEN': return { overallDelta: -40, limitGateOpenPct: 30, details: a.reason };
            case 'BACKLASH_CRITICAL': return { overallDelta: -25, limitGateOpenPct: 50, details: a.reason };
            case 'BACKLASH_WARNING': return { overallDelta: -8, limitGateOpenPct: 80, details: a.reason };
            case 'LUBRICATION_DEFICIENCY': return { overallDelta: -15, limitGateOpenPct: 70, details: a.reason };
            default: return { overallDelta: 0, limitGateOpenPct: 100, details: (a.reason || 'No impact') };
        }
    }

    private clampPct(v: number) {
        if (isNaN(v)) return 0;
        return Math.max(0, Math.min(100, v));
    }

    /**
     * Apply hysteresis/backlash compensation to a commanded target position.
     * Uses recent observed average backlash and movement direction to offset final servo command.
     */
    applyHysteresisCompensation(targetPos: number) {
        const t = this.clampPct(targetPos);
        const avgBacklash = this.backlashSamples.length ? (this.backlashSamples.reduce((s, v) => s + v, 0) / this.backlashSamples.length) : 0;
        // If we don't have a meaningful backlog, return target as-is
        if (avgBacklash <= 0.001) return t;

        // Determine movement direction: if lastCommand null, assume forward
        const last = this.lastCommand !== null ? this.lastCommand : 0;
        const direction = t >= last ? 'OPEN' : 'CLOSE';

        // Compensation: apply a fraction of average backlash ahead of movement to overcome deadband
        const compensationFactor = 0.9; // tuneable (<1 to avoid overshoot)
        const offset = avgBacklash * compensationFactor;

        let compensated = t;
        if (direction === 'OPEN') {
            compensated = t + offset; // push further open to account for backlash
        } else {
            compensated = t - offset; // push more closed
        }

        // Bound and return
        const out = this.clampPct(compensated);
        // update lastCommand as we're about to send this compensated command
        this.lastCommand = out;
        return out;
    }
}

export default WicketGateKinematics;
