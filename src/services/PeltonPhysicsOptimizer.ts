import { calculatePeltonEfficiency } from '../lib/engines/TurbineMath';

export type PeltonInput = {
  jetPressureBar: number;
  needlePositionPct: number; // 0-100
  activeNozzles: number;
  shellVibrationMm?: number;
  bucketHours?: number; // operational hours of buckets
};

export type NozzleSequence = {
  activeNozzles: number;
  sequenceOrder?: number[]; // ordering of nozzle activation
  expectedEfficiencyPct: number;
  notes?: string;
};

// Simple flow model: Q ~ s * sqrt(P) (needle opening * sqrt(pressure))
function estimatedFlow_m3s(pressureBar: number, needlePct: number) {
  const P_pa = pressureBar * 1e5;
  const s = Math.max(0.001, needlePct / 100); // normalized opening
  return s * Math.sqrt(P_pa) * 1e-6; // scaled to m3/s (heuristic)
}

export function detectNeedleErosion(history: PeltonInput[], tolerancePct = 10): { eroded: boolean; trendSlope?: number; note?: string } {
  if (!history || history.length < 3) return { eroded: false };
  // compute Q/s ratios over history
  const ratios = history.map(h => {
    const q = estimatedFlow_m3s(h.jetPressureBar, h.needlePositionPct);
    const s = Math.max(0.001, h.needlePositionPct / 100);
    return q / s;
  });
  // linear regression slope
  const n = ratios.length;
  const xMean = (n - 1) / 2;
  const yMean = ratios.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - xMean) * (ratios[i] - yMean); den += (i - xMean) * (i - xMean); }
  const slope = den === 0 ? 0 : num / den;
  // normalized relative drop per sample
  const relDropPct = (slope / Math.max(1e-9, yMean)) * 100;
  const eroded = relDropPct < -tolerancePct; // more negative than tolerance
  return { eroded, trendSlope: slope, note: `Q/s relative change ${relDropPct.toFixed(2)}% per sample` };
}

export function optimizeNozzles(input: PeltonInput, options?: { maxNozzles?: number, minNozzles?: number }): NozzleSequence {
  const maxN = options?.maxNozzles || Math.max(1, input.activeNozzles + 2);
  const minN = options?.minNozzles || Math.max(1, input.activeNozzles - 2);
  let best: NozzleSequence = { activeNozzles: input.activeNozzles, expectedEfficiencyPct: calculatePeltonEfficiency( (input.bucketHours || 0), input.jetPressureBar, estimatedFlow_m3s(input.jetPressureBar, input.needlePositionPct) ) };

  for (let n = minN; n <= maxN; n++) {
    // per-nozzle flow approx: totalFlow / n
    const totalQ = estimatedFlow_m3s(input.jetPressureBar, input.needlePositionPct) * input.activeNozzles;
    const qPerNozzle = totalQ / n;
    // emulate needle effective opening per nozzle (assume needle split efficiency)
    const eff = calculatePeltonEfficiency((input.bucketHours || 0), input.jetPressureBar, qPerNozzle);
    // model multi-jet synergy: slight penalty for more jets and for shell vibration
    const vibrationPenalty = (input.shellVibrationMm || 0) * 0.2; // 0.2% per mm
    const interferencePenalty = Math.max(0, (n - 1) * 0.5); // 0.5% per extra jet
    const totalEff = Math.max(0, eff - vibrationPenalty - interferencePenalty);
    if (totalEff > best.expectedEfficiencyPct) {
      best = { activeNozzles: n, expectedEfficiencyPct: +totalEff.toFixed(3), notes: `qPerNozzle=${qPerNozzle.toExponential(2)}m3/s vibPenalty=${vibrationPenalty.toFixed(2)}%` };
    }
  }

  // Build a simple activation order (round-robin)
  best.sequenceOrder = Array.from({ length: best.activeNozzles }, (_, i) => i + 1);
  return best;
}

export default { detectNeedleErosion, optimizeNozzles };

export function getConfidenceScore(..._args: any[]): number {
  // Heuristic utilities - neutral confidence
  return 50;
}
