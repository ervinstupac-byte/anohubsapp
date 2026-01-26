// Expert Intelligence Module - Acoustic Fingerprinting Service
// Distinguishes normal cavitation from bearing damage on Francis turbines

export interface AcousticSignature {
    timestamp: number;
    assetId: number;
    spectrum: number[]; // Frequency spectrum (FFT output)
    rmsLevel: number; // Overall RMS amplitude
    peakFrequencies: number[]; // Dominant frequencies
    noiseFloor: number; // Background noise level
}

export interface AcousticPattern {
    name: string;
    frequencyRange: [number, number]; // Hz
    characteristicFreqs: number[];
    amplitudeThreshold: number;
    description: string;
}

export interface AcousticClassification {
    primaryPattern: string;
    confidence: number; // 0-100%
    probabilities: Record<string, number>;
    recommendation: string;
    severity: 'NORMAL' | 'MONITOR' | 'INVESTIGATE' | 'CRITICAL';
}

export class AcousticFingerprintingService {
    // Known acoustic patterns for Francis turbines
    private static readonly PATTERNS: Record<string, AcousticPattern> = {
        NORMAL_CAVITATION: {
            name: 'Normal Cavitation',
            frequencyRange: [2000, 10000], // 2-10 kHz
            characteristicFreqs: [3500, 5000, 7200], // Typical cavitation frequencies
            amplitudeThreshold: 0.1,
            description: 'Broadband high-frequency noise from bubble collapse'
        },
        BEARING_DAMAGE: {
            name: 'Bearing Damage',
            frequencyRange: [500, 2000], // 500 Hz - 2 kHz
            characteristicFreqs: [800, 1200, 1600], // Bearing defect frequencies
            amplitudeThreshold: 0.05,
            description: 'Discrete frequency peaks with harmonics (grinding/knocking)'
        },
        GENERATOR_NOISE: {
            name: 'Generator Electromagnetic Noise',
            frequencyRange: [50, 500], // 50-500 Hz (2x line frequency and harmonics)
            characteristicFreqs: [100, 200, 300, 400], // 50 Hz harmonics
            amplitudeThreshold: 0.15,
            description: '2x line frequency (100 Hz) and multiples from magnetic field'
        },
        MECHANICAL_LOOSENESS: {
            name: 'Mechanical Looseness',
            frequencyRange: [10, 100], // Sub-synchronous
            characteristicFreqs: [16.67, 33.33, 50], // 1x, 2x, 3x running speed (1000 RPM = 16.67 Hz)
            amplitudeThreshold: 0.08,
            description: 'Low frequency impacts from loose components'
        },
        DRAFT_TUBE_VORTEX: {
            name: 'Draft Tube Vortex',
            frequencyRange: [0.5, 5], // Very low frequency
            characteristicFreqs: [1.2, 2.4], // Vortex shedding frequency
            amplitudeThreshold: 0.2,
            description: 'Low frequency pressure pulsation from unstable vortex core'
        }
    };

    /**
     * Classifies acoustic signature using pattern matching
     * Filters generator noise to isolate mechanical issues
     */
    static classifyAcousticSignature(signature: AcousticSignature, runningSpeed: number): AcousticClassification {
        // Step 1: Apply notch filter to remove generator harmonics (100, 200, 300, 400 Hz)
        const filteredSpectrum = this.filterGeneratorNoise(signature.spectrum);

        // Step 2: Calculate pattern match scores
        const scores: Record<string, number> = {};

        for (const [key, pattern] of Object.entries(this.PATTERNS)) {
            if (key === 'GENERATOR_NOISE') continue; // Already filtered out

            scores[key] = this.calculatePatternMatch(
                filteredSpectrum,
                pattern,
                runningSpeed
            );
        }

        // Step 3: Normalize to probabilities
        const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const probabilities: Record<string, number> = {};

        for (const [key, score] of Object.entries(scores)) {
            probabilities[key] = total > 0 ? (score / total) * 100 : 0;
        }

        // Step 4: Determine primary pattern
        const primaryPattern = Object.entries(probabilities).reduce((max, [key, prob]) =>
            prob > max.prob ? { key, prob } : max,
            { key: 'NORMAL_CAVITATION', prob: 0 }
        );

        // Step 5: Generate recommendation
        const { recommendation, severity } = this.generateRecommendation(
            primaryPattern.key,
            primaryPattern.prob,
            signature.rmsLevel
        );

        return {
            primaryPattern: this.PATTERNS[primaryPattern.key].name,
            confidence: primaryPattern.prob,
            probabilities,
            recommendation,
            severity
        };
    }

    /**
     * Applies notch filter at 100, 200, 300, 400 Hz to remove generator noise
     */
    private static filterGeneratorNoise(spectrum: number[]): number[] {
        const filtered = [...spectrum];
        const sampleRate = 48000; // Assumed sample rate
        const fftSize = spectrum.length;
        const binWidth = sampleRate / fftSize;

        // Notch filter at generator harmonics
        const notchFreqs = [100, 200, 300, 400];
        const notchWidth = 5; // Hz

        for (const freq of notchFreqs) {
            const centerBin = Math.round(freq / binWidth);
            const widthBins = Math.round(notchWidth / binWidth);

            for (let i = Math.max(0, centerBin - widthBins); i < Math.min(fftSize, centerBin + widthBins); i++) {
                filtered[i] = 0; // Zero out generator noise
            }
        }

        return filtered;
    }

    /**
     * Calculates pattern match score using frequency domain analysis
     */
    private static calculatePatternMatch(
        spectrum: number[],
        pattern: AcousticPattern,
        runningSpeed: number
    ): number {
        const sampleRate = 48000;
        const fftSize = spectrum.length;
        const binWidth = sampleRate / fftSize;

        let score = 0;

        // Calculate energy in pattern's frequency range
        const startBin = Math.round(pattern.frequencyRange[0] / binWidth);
        const endBin = Math.round(pattern.frequencyRange[1] / binWidth);

        let energyInRange = 0;
        for (let i = startBin; i < Math.min(endBin, fftSize); i++) {
            energyInRange += spectrum[i] * spectrum[i];
        }

        // Normalize energy
        energyInRange = Math.sqrt(energyInRange / (endBin - startBin));

        // Check for characteristic frequencies
        let charFreqMatches = 0;
        for (const charFreq of pattern.characteristicFreqs) {
            const bin = Math.round(charFreq / binWidth);
            if (bin < fftSize && spectrum[bin] > pattern.amplitudeThreshold) {
                charFreqMatches++;
            }
        }

        // Combine energy and characteristic frequency matches
        score = (energyInRange * 0.6) + (charFreqMatches / pattern.characteristicFreqs.length * 0.4);

        return score;
    }

    /**
     * Generates actionable recommendation based on classification
     */
    private static generateRecommendation(
        pattern: string,
        confidence: number,
        rmsLevel: number
    ): { recommendation: string; severity: 'NORMAL' | 'MONITOR' | 'INVESTIGATE' | 'CRITICAL' } {
        switch (pattern) {
            case 'BEARING_DAMAGE':
                if (confidence > 70) {
                    return {
                        recommendation: '🔴 CRITICAL: Bearing damage detected with high confidence. Schedule immediate inspection. Check for metal particles in oil. Shutdown if RMS exceeds 7.0 mm/s.',
                        severity: 'CRITICAL'
                    };
                } else if (confidence > 50) {
                    return {
                        recommendation: '⚠️ Possible bearing damage. Increase vibration monitoring frequency to every 1 hour. Schedule bearing inspection within 7 days.',
                        severity: 'INVESTIGATE'
                    };
                } else {
                    return {
                        recommendation: 'Monitor bearing temperatures and vibration trends. No immediate action required.',
                        severity: 'MONITOR'
                    };
                }

            case 'NORMAL_CAVITATION':
                if (rmsLevel > 5.0) {
                    return {
                        recommendation: 'Cavitation levels elevated. Check runner clearance and tailwater level. Consider operating at higher load.',
                        severity: 'MONITOR'
                    };
                } else {
                    return {
                        recommendation: 'Normal cavitation levels. Continue monitoring.',
                        severity: 'NORMAL'
                    };
                }

            case 'DRAFT_TUBE_VORTEX':
                return {
                    recommendation: 'Draft tube vortex core detected. Operating at part-load. Install air admission system or increase load to design point.',
                    severity: 'INVESTIGATE'
                };

            case 'MECHANICAL_LOOSENESS':
                return {
                    recommendation: '⚠️ Mechanical looseness detected. Inspect foundation bolts, coupling, and mounting hardware. Retorque as per OEM specifications.',
                    severity: 'INVESTIGATE'
                };

            default:
                return {
                    recommendation: 'Continue normal monitoring.',
                    severity: 'NORMAL'
                };
        }
    }

    /**
     * Real-time acoustic monitoring with trend analysis
     */
    static analyzeAcousticTrend(
        historicalSignatures: AcousticSignature[],
        runningSpeed: number
    ): {
        trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
        degradationRate: number; // dB/day
        forecastDaysToFailure: number | null;
    } {
        if (historicalSignatures.length < 2) {
            return { trend: 'STABLE', degradationRate: 0, forecastDaysToFailure: null };
        }

        // Calculate RMS trend
        const rmsValues = historicalSignatures.map(s => s.rmsLevel);
        const timeSpanDays = (historicalSignatures[historicalSignatures.length - 1].timestamp - historicalSignatures[0].timestamp) / (1000 * 60 * 60 * 24);

        // Linear regression
        const slope = this.linearRegression(rmsValues);
        const degradationRate = slope * 20 * Math.log10(Math.E); // Convert to dB/day

        let trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
        if (degradationRate > 0.1) {
            trend = 'DEGRADING';
        } else if (degradationRate < -0.1) {
            trend = 'IMPROVING';
        } else {
            trend = 'STABLE';
        }

        // Forecast days to failure (RMS > 7.0 mm/s)
        let forecastDaysToFailure: number | null = null;
        if (trend === 'DEGRADING' && degradationRate > 0) {
            const currentRMS = rmsValues[rmsValues.length - 1];
            const failureThreshold = 7.0;
            forecastDaysToFailure = (failureThreshold - currentRMS) / (degradationRate / 20 / Math.log10(Math.E));
        }

        return { trend, degradationRate, forecastDaysToFailure };
    }

    private static linearRegression(values: number[]): number {
        const n = values.length;
        const indices = Array.from({ length: n }, (_, i) => i);

        const sumX = indices.reduce((sum, x) => sum + x, 0);
        const sumY = values.reduce((sum, y) => sum + y, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
        const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }
}

// ===== USAGE EXAMPLE =====

/*
// Example: Analyze acoustic signature from Francis turbine
const acousticData: AcousticSignature = {
    timestamp: Date.now(),
    assetId: 1001,
    spectrum: [...], // FFT output from microphone/accelerometer
    rmsLevel: 4.2, // mm/s
    peakFrequencies: [1200, 2400, 3600], // Detected peaks
    noiseFloor: 0.05
};

const classification = AcousticFingerprintingService.classifyAcousticSignature(
    acousticData,
    1000 // Running speed in RPM
);

console.log(classification);
// Output:
// {
//     primaryPattern: 'Bearing Damage',
//     confidence: 78.5,
//     probabilities: {
//         BEARING_DAMAGE: 78.5,
//         NORMAL_CAVITATION: 15.2,
//         MECHANICAL_LOOSENESS: 6.3
//     },
//     recommendation: '🔴 CRITICAL: Bearing damage detected...',
//     severity: 'CRITICAL'
// }
*/
