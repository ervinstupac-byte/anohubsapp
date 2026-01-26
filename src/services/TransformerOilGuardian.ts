export type TransformGasSample = {
  timestamp: string;
  H2?: number;
  CH4?: number;
  C2H2?: number; // acetylene
  C2H4?: number;
  C2H6?: number;
  CO?: number;
  CO2?: number;
};

export type TransformerOilAnalysis = {
  duvalRegion?: string; // e.g., 'D1', 'D2', 'T3', etc.
  reason?: string;
  criticalAudit?: boolean;
  recommendedAction?: string;
};

// Simple Duval Triangle Method 1 classifier.
// Method uses the relative proportions of CH4, C2H4, C2H2.
export function duvalMethod1(sample: TransformGasSample): TransformerOilAnalysis {
  const CH4 = sample.CH4 || 0;
  const C2H4 = sample.C2H4 || 0;
  const C2H2 = sample.C2H2 || 0;

  const sum = CH4 + C2H4 + C2H2;
  if (sum <= 0) return { reason: 'Insufficient hydrocarbon gases', recommendedAction: 'Take full DGA sample' };

  const pCH4 = CH4 / sum;
  const pC2H4 = C2H4 / sum;
  const pC2H2 = C2H2 / sum;

  // Heuristic mapping to Duval triangle zones (simplified)
  // Priority: high acetylene implies high-energy arcing (D1)
  if (pC2H2 > 0.5 || C2H2 >= 10) {
    return {
      duvalRegion: 'D1',
      reason: `High acetylene proportion (${(pC2H2 * 100).toFixed(1)}%) and absolute ${C2H2} ppm`,
      criticalAudit: true,
      recommendedAction: 'Immediate critical audit: inspect for arcing, de-energize if necessary'
    };
  }

  // Thermal faults (T3-like) often show high C2H4
  if (pC2H4 > 0.6 || C2H4 >= 50) {
    return {
      duvalRegion: 'T3',
      reason: `C2H4 dominant (${(pC2H4 * 100).toFixed(1)}%). Indicative of thermal overheating >700°C range.`,
      criticalAudit: true,
      recommendedAction: 'Schedule immediate inspection; consider outage if trending high'
    };
  }

  // Partial discharge / low energy discharge signatures (PD / D2-like)
  if (pCH4 > 0.6 || CH4 >= 50) {
    return {
      duvalRegion: 'PD',
      reason: `Methane dominant (${(pCH4 * 100).toFixed(1)}%)`,
      criticalAudit: false,
      recommendedAction: 'Investigate partial discharge sources; monitor closely'
    };
  }

  // Fallback classification by largest proportion
  const maxP = Math.max(pCH4, pC2H4, pC2H2);
  const region = maxP === pC2H2 ? 'D1' : maxP === pC2H4 ? 'T3' : 'PD';
  return {
    duvalRegion: region,
    reason: `Fallback by highest proportion: CH4 ${pCH4.toFixed(2)}, C2H4 ${pC2H4.toFixed(2)}, C2H2 ${pC2H2.toFixed(2)}`,
    criticalAudit: region === 'D1',
    recommendedAction: region === 'D1' ? 'Critical audit' : 'Monitor and inspect'
  };
}

// Trend detector: acetylene upward trend in recent samples triggers critical flag
export function detectAcetyleneTrend(samples: TransformGasSample[], lookback = 5): { trendingUp: boolean; slope?: number } {
  if (!samples || samples.length < 2) return { trendingUp: false };
  const recent = samples.slice(-lookback).map(s => s.C2H2 || 0);
  // Simple linear slope
  const n = recent.length;
  const xMean = (n - 1) / 2;
  const yMean = recent.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (recent[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }
  const slope = den === 0 ? 0 : num / den;
  const trendingUp = slope > 0.2; // threshold: 0.2 ppm per sample
  return { trendingUp, slope };
}

// Export utilities as named exports; default export is the Guardian class below
/**
 * Transformer Oil Guardian
 * - Duval Triangle (heuristic) classification for thermal vs electrical faults
 * - Immediate critical audit on acetylene detection
 * - Paper aging model based on moisture and thermal history
 */

import BaseGuardian from './BaseGuardian';

export type TransformerAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'CRITICAL_FAULT'; reason: string }
    | { action: 'THERMAL_FAULT'; details: string; reason: string }
    | { action: 'ELECTRICAL_FAULT'; details: string; reason: string }
    | { action: 'RESTRICT_POWER'; limitPct: number; reason: string }
    | { action: 'SCHEDULE_TRANSFORMER_INSPECTION'; reason: string };

export interface TransformerMeasurement {
    timestamp: string; // ISO
    gasesPpm: { H2?: number; CH4?: number; C2H2?: number; C2H4?: number; C2H6?: number; CO?: number; CO2?: number };
    moisturePpm?: number; // ppm
    topOilTempC?: number;
    loadCurrentA?: number;
}

export class TransformerOilGuardian extends BaseGuardian {
    private samples: TransformerMeasurement[] = [];

    // base life: 25 years in hours
    private baseLifeHours = 25 * 365 * 24;

    addMeasurement(m: TransformerMeasurement) : TransformerAction {
        this.samples.push(m);
        if (this.samples.length > 20000) this.samples.shift();

        const gases = m.gasesPpm || {};

        // Immediate acetylene (C2H2) critical
        const c2h2 = (gases.C2H2 || 0);
        if (c2h2 > 0) {
            return { action: 'CRITICAL_FAULT', reason: `Acetylene detected (${c2h2} ppm) — immediate critical transformer fault audit required.` };
        }

        // Duval triangle heuristic: use ratios of C2H2, C2H4, CH4/C2H6 and H2
        const ch4 = gases.CH4 || 0;
        const c2h4 = gases.C2H4 || 0;
        const c2h6 = gases.C2H6 || 0;
        const h2 = gases.H2 || 0;

        const hydroTotal = ch4 + c2h6 + c2h4 + c2h2;
        const pctC2H4 = hydroTotal > 0 ? (c2h4 / hydroTotal) * 100 : 0;
        const pctCH4 = hydroTotal > 0 ? (ch4 / hydroTotal) * 100 : 0;

        // Heuristic classification
        if (pctC2H4 > 50 || (c2h4 > c2h6 && c2h4 > ch4 && (m.topOilTempC || 40) > 90)) {
            return { action: 'THERMAL_FAULT', details: `C2H4 dominant (${c2h4} ppm) suggests thermal fault`, reason: 'Duval-like thermal indicator' };
        }

        if (h2 > 100 && ch4 < 50) {
            return { action: 'ELECTRICAL_FAULT', details: `High H2 (${h2} ppm) suggests partial discharge / electrical stressing`, reason: 'Hydrogen-rich signature' };
        }

        // Gas trend: monitor Qmax (use max hydrocarbon among measurements) over 30 days
        const qTrend = this.computeQMaxTrend30d(m.timestamp);
        if (qTrend && qTrend.pctIncrease !== null && qTrend.pctIncrease >= 20) {
            return { action: 'SCHEDULE_TRANSFORMER_INSPECTION', reason: `Transformer gas maximum increased ${qTrend.pctIncrease.toFixed(1)}% over 30 days.` };
        }

        // Paper aging estimation: if RUL low, recommend restriction
        const { rulHours } = this.estimatePaperRULHours();
        const yearsLeft = rulHours / (24 * 365);
        if (yearsLeft < 2) {
            return { action: 'RESTRICT_POWER', limitPct: 50, reason: `Estimated paper life low: ${yearsLeft.toFixed(2)} years remaining — restrict power to 50% and schedule outage.` };
        }

        return { action: 'NO_ACTION', reason: 'Transformer gases nominal.' };
    }

    computeQMaxTrend30d(refTimestampIso: string) : { pctIncrease: number | null; baselineMax?: number; recentMax?: number } | null {
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
        if (prevWindow.length < 3 || recentWindow.length < 3) return null;

        const prevMax = Math.max(...prevWindow.map(s => this.maxHydrocarbon(s.gasesPpm)));
        const recentMax = Math.max(...recentWindow.map(s => this.maxHydrocarbon(s.gasesPpm)));
        if (prevMax <= 0) return null;
        const pctIncrease = ((recentMax - prevMax) / prevMax) * 100;
        return { pctIncrease, baselineMax: prevMax, recentMax };
    }

    private maxHydrocarbon(gases: any) {
        gases = gases || {};
        return Math.max(gases.CH4 || 0, gases.C2H6 || 0, gases.C2H4 || 0, gases.C2H2 || 0);
    }

    estimatePaperRULHours(): { rulHours: number; details: string } {
        if (!this.samples || this.samples.length === 0) {
            return { rulHours: this.baseLifeHours, details: 'No samples — base life' };
        }

        const now = Date.now();
        const DAY_MS = 24 * 3600 * 1000;
        const recent = this.samples.filter(s => Date.parse(s.timestamp) >= now - (30 * DAY_MS));
        const used = recent.length >= 3 ? recent : this.samples.slice(-200);

        const avgTemp = used.reduce((s,v) => s + (v.topOilTempC || 40), 0) / used.length;
        const avgMoist = used.reduce((s,v) => s + (v.moisturePpm || 50), 0) / used.length;

        // Thermal acceleration: Q10 model approximate (every 10°C doubles aging)
        const tempFactor = Math.pow(2, (avgTemp - 110)/10);
        const moistureFactor = 1 + (avgMoist / 1000); // linear penalty

        const agingFactor = tempFactor * moistureFactor;
        const rulHours = Math.max(0, Math.round(this.baseLifeHours / agingFactor));
        return { rulHours, details: `avgTemp=${avgTemp.toFixed(1)}C avgMoist=${avgMoist.toFixed(1)}ppm agingFactor=${agingFactor.toFixed(2)}` };
    }

    getHealthImpactForAction(a: TransformerAction) {
        switch (a.action) {
            case 'CRITICAL_FAULT': return { overallDelta: -100, recommendation: 'Immediate transformer isolation and detailed gas analysis.' };
            case 'THERMAL_FAULT': return { overallDelta: -40, recommendation: 'Investigate cooling, oil, and load profile.' };
            case 'ELECTRICAL_FAULT': return { overallDelta: -50, recommendation: 'Investigate winding integrity and partial discharge sources.' };
            case 'RESTRICT_POWER': return { overallDelta: -60, recommendation: 'Restrict plant output to preserve transformer.' };
            case 'SCHEDULE_TRANSFORMER_INSPECTION': return { overallDelta: -30, recommendation: 'Schedule inspection and detailed oil sampling.' };
            default: return { overallDelta: 0, recommendation: 'No impact' };
        }
    }

    /**
     * Get confidence score based on sample count and gas analysis data quality
     * Combines sample count analysis with acetylene noise detection
     */
    public getConfidenceScore(samples: TransformerMeasurement[] = []): number {
        // Use provided samples or fall back to internal samples
        const data = samples.length > 0 ? samples : this.samples;
        
        if (!data || data.length < 3) return 45; // Low confidence with little data
        
        const sampleCount = data.length;
        if (sampleCount < 5) return 25; // Very low confidence
        if (sampleCount < 15) return 50; // Low confidence
        if (sampleCount < 30) return 70; // Moderate confidence
        
        // High confidence: analyze acetylene noise and data completeness
        const recent = data.slice(-10);
        const acet = recent.map(s => (s.gasesPpm && typeof s.gasesPpm.C2H2 === 'number') ? s.gasesPpm.C2H2 : 0);
        const mean = acet.reduce((s, v) => s + v, 0) / acet.length;
        const std = this.safeStdDev(acet);
        
        // Check for complete gas data
        const hasCompleteGasData = recent.some(s => {
            const gases = s.gasesPpm || {};
            return (gases.H2 !== undefined || gases.CH4 !== undefined || gases.C2H4 !== undefined);
        });
        
        // Check if we can compute trends
        const now = Date.now();
        const DAY_MS = 24 * 3600 * 1000;
        const recent30d = data.filter(s => Date.parse(s.timestamp) >= now - (30 * DAY_MS));
        
        let score = 80;
        
        // Penalize for noisy acetylene readings
        if (mean === 0 && std === 0) {
            score = 80; // Quiet system is good
        } else {
            const noiseRatio = mean > 0 ? std / Math.max(1e-6, mean) : std / 10;
            if (noiseRatio > 0.8) score -= 60;
            else if (noiseRatio > 0.4) score -= 30;
            
            // Penalize for erratic slope (alternate sign changes)
            let signChanges = 0;
            for (let i = 1; i < acet.length; i++) {
                if ((acet[i] - acet[i-1]) * (acet[i-1] - (acet[i-2] || 0)) < 0) signChanges++;
            }
            if (signChanges >= 2) score -= 20;
        }
        
        // Bonus for complete data and trend capability
        if (hasCompleteGasData) score += 10;
        if (recent30d.length >= 5) score += 10;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}

export default TransformerOilGuardian;
