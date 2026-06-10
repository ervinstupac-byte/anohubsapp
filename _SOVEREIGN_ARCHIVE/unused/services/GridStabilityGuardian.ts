/**
 * GridStabilityGuardian
 * - V-curve reactive power management (simple proportional map)
 * - Monitor df/dt (rate of change of frequency) and trigger kinetic kick (temporary rotor inertia dispatch)
 */

export type GridState = {
  timestamp: number;
  voltagePct?: number; // per-unit *100
  frequencyHz?: number;
  lastFrequencyHz?: number; // prior sample
};

export type VCurveOutput = {
  excitationPct: number; // 0-100
  reactiveSupportMVar?: number;
  note?: string;
};

export type InertiaAction = {
  triggered: boolean;
  dfdt?: number; // Hz/s
  durationSec?: number;
  note?: string;
};

import BaseGuardian from './BaseGuardian';

export default class GridStabilityGuardian extends BaseGuardian {
  // V-curve shaping params
  private nominalVoltagePct = 100;
  private maxExcitation = 100;

  computeVCurve(voltagePct?: number): VCurveOutput {
    const v = voltagePct ?? this.nominalVoltagePct;
    const deviation = v - this.nominalVoltagePct; // positive -> over-voltage
    // simple parabolic V-curve: more excitation when voltage low, less when high
    const base = 50; // neutral excitation
    const k = 0.8; // sensitivity
    const excitation = Math.max(0, Math.min(this.maxExcitation, base - k * deviation));
    const reactive = ((this.nominalVoltagePct - v) / this.nominalVoltagePct) * 10; // MVar heuristic
    return { excitationPct: Math.round(excitation), reactiveSupportMVar: +reactive.toFixed(2), note: `V-curve applied (v=${v}%)` };
  }

  // Monitor df/dt and trigger inertial kick if necessary
  assessInertia(state: GridState): InertiaAction {
    const fNow = state.frequencyHz ?? 50;
    const fPrev = state.lastFrequencyHz ?? fNow;
    const dt = Math.max(0.001, (state.timestamp ? 1 : 1)); // assume sample interval ~1s if unknown
    const df = fNow - fPrev;
    const dfdt = df / dt; // Hz/s

    // threshold: if frequency is falling faster than -0.2 Hz/s, trigger kinetic kick
    if (dfdt < -0.2) {
      // kinetic kick: allow temporary over-generation using rotor inertia
      return { triggered: true, dfdt, durationSec: 6, note: 'Kinetic Kick engaged: rapid freq drop detected' };
    }

    // Otherwise no action
    return { triggered: false, dfdt, note: 'Stable' };
  }

  // Basic confidence metric: correlation between df/dt series and reactive support demand
  public getConfidenceScore(states: GridState[] = [], reactiveSeries: number[] = []): number {
    if (!states || states.length < 3) return 50;
    const dfdt = [] as number[];
    for (let i = 1; i < states.length; i++) {
      const dt = Math.max(1, (states[i].timestamp - states[i-1].timestamp) / 1000);
      dfdt.push(((states[i].frequencyHz || 50) - (states[i-1].frequencyHz || 50)) / dt);
    }
    const corr = this.safeCorrelation(dfdt, reactiveSeries.slice(-dfdt.length));
    return this.corrToScore(isNaN(corr) ? 0 : corr);
  }
}
