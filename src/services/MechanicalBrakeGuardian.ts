/**
 * MechanicalBrakeGuardian
 * Implements a Safe Stop Curve to protect thrust bearing film when stopping.
 */

export type BrakeStep = { targetRpmPct: number; brakeTorquePct: number; durationSec: number };

import GovernorHPUGuardian from './GovernorHPUGuardian';
import BaseGuardian from './BaseGuardian';

export default class MechanicalBrakeGuardian extends BaseGuardian {
    private safeThresholdPct = 15; // between 15% and 0% RPM we apply special curve

    /**
     * Generate a safe-stop brake sequence from current RPM% to target (usually 0).
     * The curve ensures gradual braking below safeThresholdPct to protect thrust bearing film.
     */
    generateSafeStopSequence(currentRpmPct: number, targetRpmPct: number = 0): BrakeStep[] {
        const seq: BrakeStep[] = [];
        const start = Math.max(0, Math.min(100, currentRpmPct));
        const end = Math.max(0, Math.min(100, targetRpmPct));

        // Fast deceleration down to safe threshold using larger steps
        if (start > this.safeThresholdPct) {
            const fastSteps = Math.ceil((start - this.safeThresholdPct) / 10);
            for (let i = 0; i < fastSteps; i++) {
                const stepUpper = start - i * 10;
                const stepLower = Math.max(this.safeThresholdPct, start - (i + 1) * 10);
                seq.push({ targetRpmPct: stepLower, brakeTorquePct: Math.min(60, 20 + i * 10), durationSec: 6 });
            }
        }

        // Gentle controlled braking through the 15% -> 0% band
        const gentleBandStart = Math.min(start, this.safeThresholdPct);
        const gentleSteps = 5;
        for (let i = 0; i < gentleSteps; i++) {
            const t = gentleBandStart * (1 - (i + 1) / gentleSteps);
            const torque = Math.min(90, 30 + (i * 12));
            seq.push({ targetRpmPct: Math.max(0, Number(t.toFixed(2))), brakeTorquePct: torque, durationSec: 8 });
        }

        // final hold at 0
        seq.push({ targetRpmPct: end, brakeTorquePct: 100, durationSec: 5 });

        // Enforce water-hammer hard limit from GovernorHPUGuardian
        try {
            const gov = new GovernorHPUGuardian();
            const safeClose = gov.getSafeCloseTime();
            const totalDuration = seq.reduce((s, v) => s + (v.durationSec || 0), 0);
            // If the planned braking sequence would close significantly faster than safe, stretch durations
            if (totalDuration < safeClose * 0.5) {
                const scale = (safeClose * 0.5) / Math.max(0.1, totalDuration);
                seq.forEach(step => { step.durationSec = Math.ceil((step.durationSec || 1) * scale); });
            }
        } catch (e) {
            // if governor not available, keep original seq
        }

        return seq;
    }

    evaluateReadiness(padWearPct: number, hydraulicPressureBar: number): { ready: boolean; notes?: string } {
        // Basic readiness: pad wear under 70% and hydraulic pressure sufficient (> 50% nominal)
        const ready = (padWearPct || 0) < 70 && (hydraulicPressureBar || 0) > 30;
        return { ready, notes: `padWear=${padWearPct}%, pressure=${hydraulicPressureBar}bar` };
    }

    // Simple confidence estimator: combines pad wear and pressure heuristics
    public getConfidenceScore(padWearPct?: number, hydraulicPressureBar?: number): number {
        const wear = typeof padWearPct === 'number' ? padWearPct : 50;
        const press = typeof hydraulicPressureBar === 'number' ? hydraulicPressureBar : 40;
        let score = 100;
        if (wear > 70) score -= 40;
        else if (wear > 50) score -= 20;
        if (press < 30) score -= 30;
        else if (press < 45) score -= 10;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
