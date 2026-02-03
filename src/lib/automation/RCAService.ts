import { FrequencyPeak } from '../../services/VibrationExpert';
import { RunnerMaterial } from '../../models/TurbineSpecifics';

// --- TYPES ---

export interface RCAInput {
    rpm: number;
    metrics: {
        vibrationMmS: number;
        efficiencyPercent: number;
        bearingTempC: number;
        bearingTempRateOfChange: number; // degC/min (NC-130)
    };
    peaks: FrequencyPeak[];
    maintenance: {
        shaftPlumbnessDeviation: number; // mm
        // NC-300: Baseline DNA bearing clearances
        bearingClearances?: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
    };
    specifications: {
        runnerMaterial: RunnerMaterial;
    }
}

export interface RCAResult {
    cause: string;
    confidence: number; // 0.0 to 1.0
    severity: 'CRITICAL' | 'WARNING' | 'WATCH';
    evidence: string[]; // List of "Why?"
    werkmeisterRecommendation: string; // The "Old Veteran" advice
}

// --- LOGIC ENGINE ---

export class RCAService {

    /**
     * THE ROOT CAUSE MATRIX
     * Uses heuristic Bayesian probability to rank "Nasty Faults".
     */
    public analyze(input: RCAInput): RCAResult[] {
        const results: RCAResult[] = [];
        const f0 = input.rpm / 60;

        // 1. DYNAMIC MISALIGNMENT
        // Profile: 2x RPM Peak + Thermal Gradient + Bad Initial Plumbness
        let misalignmentScore = 0;
        const evidenceMis: string[] = [];

        // Factor A: 2x RPM Component
        const peak2x = input.peaks.find(p => Math.abs(p.frequencyHz - (f0 * 2)) < 1.0);
        if (peak2x && peak2x.amplitudeMmS > 1.5) {
            misalignmentScore += 0.4; // Base indicator
            evidenceMis.push(`2x RPM Peak detected at ${peak2x.amplitudeMmS.toFixed(1)} mm/s`);
        }

        // Factor B: Thermal Gradient (The "Rub")
        if (input.metrics.bearingTempRateOfChange > 0.5) {
            misalignmentScore += 0.3;
            evidenceMis.push(`Bearing Temp rising fast (+${input.metrics.bearingTempRateOfChange.toFixed(1)}°C/min)`);
        }

        // Factor C: Static History
        if (input.maintenance.shaftPlumbnessDeviation > 0.05) {
            misalignmentScore += 0.25;
            evidenceMis.push(`Static Plumbness Deviation: ${input.maintenance.shaftPlumbnessDeviation}mm`);
        }

        // Factor D: Bearing Clearance Asymmetry (NC-300 DNA Link)
        if (input.maintenance.bearingClearances) {
            const clearances = input.maintenance.bearingClearances;
            const values = [clearances.top, clearances.bottom, clearances.left, clearances.right];
            const maxClearance = Math.max(...values);
            const minClearance = Math.min(...values);
            const asymmetry = maxClearance - minClearance;

            if (asymmetry > 0.05) {
                misalignmentScore += 0.2;
                evidenceMis.push(`Bearing Clearance Asymmetry: ${asymmetry.toFixed(3)}mm (from baseline DNA)`);
            }
        }

        if (misalignmentScore > 0.4) {
            results.push({
                cause: "Dynamic Shaft Misalignment",
                confidence: Math.min(misalignmentScore, 0.99),
                severity: misalignmentScore > 0.7 ? 'CRITICAL' : 'WARNING',
                evidence: evidenceMis,
                werkmeisterRecommendation: "Check coupling bolts and verifying hot alignment immediately. Do not wait for trip."
            });
        }

        // 2. STRUCTURAL LOOSENESS / SOFT FOOT
        // Profile: High 1x RPM + Directional (Simulated here via total vib vs peak)
        let looseScore = 0;
        const evidenceLoose: string[] = [];

        const peak1x = input.peaks.find(p => Math.abs(p.frequencyHz - f0) < 1.0);
        if (peak1x && peak1x.amplitudeMmS > 2.0) {
            looseScore += 0.4;
            evidenceLoose.push(`Strong 1x RPM Fundamental (${peak1x.amplitudeMmS.toFixed(1)} mm/s)`);
        }

        // Heuristic: If 1x peak explains almost ALL vibration, it's Unbalance. 
        // If there's 1x peak BUT lots of "fuzz" (harmonics), it's Looseness.
        const harmonicCount = input.peaks.filter(p => p.amplitudeMmS > 0.5).length;
        if (harmonicCount > 4) {
            looseScore += 0.35;
            evidenceLoose.push('Multiple harmonics present (Comb Spectrum) indicating mechanical looseness');
        }

        if (looseScore > 0.4) {
            results.push({
                cause: "Structural Looseness / Anchor Failure",
                confidence: Math.min(looseScore, 0.95),
                severity: looseScore > 0.6 ? 'WARNING' : 'WATCH',
                evidence: evidenceLoose,
                werkmeisterRecommendation: "Torque check all foundation bolts. Inspect grouting for cracks."
            });
        }

        // 3. HYDRAULIC CAVITATION
        // Profile: Efficiency Drop + High Freq Noise + Material Sensitivity
        let cavScore = 0;
        const evidenceCav: string[] = [];

        // Check for efficiency drift
        if (input.metrics.efficiencyPercent < 88.0 && input.metrics.efficiencyPercent > 0) {
            cavScore += 0.4;
            evidenceCav.push(`Efficiency dropped to ${input.metrics.efficiencyPercent.toFixed(1)}% (Target: >92%)`);
        }

        // Check for broadband noise (High Freq)
        // Material Sensitivity Logic (NC-140 Expert Update)
        const isSoftMaterial = input.specifications.runnerMaterial === 'Bronze' || input.specifications.runnerMaterial === 'Cast Steel';
        const noiseThreshold = isSoftMaterial ? 0.3 : 0.5; // Lower threshold for softer materials

        const highFreqNoise = input.peaks.find(p => p.frequencyHz > 150 && p.amplitudeMmS > noiseThreshold);

        if (highFreqNoise) {
            cavScore += 0.45;
            evidenceCav.push(`High Frequency hydraulic noise detected (> 150Hz, > ${noiseThreshold}mm/s)`);

            if (isSoftMaterial) {
                cavScore += 0.15; // Expert penalty for material
                evidenceCav.push(`Material Risk: ${input.specifications.runnerMaterial} requires stricter cavitation limits.`);
            }
        }

        if (cavScore > 0.4) {
            let recommendation = "Admit air to draft tube immediately. Check tailwater level.";

            // Werkmeister Addendum for Material
            if (isSoftMaterial) {
                recommendation = "Inspect runner blades for pitting immediately. If material is Carbon Steel/Bronze, consider scheduling application of cavitation-resistant ceramic coating during next outage.";
            }

            results.push({
                cause: "Hydraulic Cavitation (Gravel Noise)",
                confidence: Math.min(cavScore, 0.98), // High confidence allowed
                severity: cavScore > 0.7 ? 'WARNING' : 'WATCH',
                evidence: evidenceCav,
                werkmeisterRecommendation: recommendation
            });
        }

        return results.sort((a, b) => b.confidence - a.confidence);
    }
}
