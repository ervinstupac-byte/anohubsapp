// Pelton Jet Sync Module
// Analyzes each nozzle individually to detect erosion, sand damage, and force imbalance

export interface JetAnalysis {
    nozzleId: number; // 1-6 for typical multi-jet Pelton
    acousticSignature: {
        spectrum: number[];
        dominantFrequency: number;
        whistleIndex: number; // 0-10, higher = more "hissing"
        impactPattern: 'CLEAN' | 'ERODED' | 'SAND_DAMAGE';
    };
    jetVelocity: number; // m/s
    jetAngle: number; // degrees from ideal
    needlePosition: number; // mm
    erosionLevel: number; // 0-100%
}

export interface RotorForceBalance {
    timestamp: number;
    nozzleForces: number[]; // N (Newton) for each nozzle
    resultantForce: {
        magnitude: number; // N
        angle: number; // degrees
    };
    imbalanceRatio: number; // 0-1, 0 = perfect balance
    bearingLoadIncrease: number; // % increase in bearing load
    predictedBearingWear: number; // hours until failure
}

export class PeltonJetSyncService {
    /**
     * Analyze individual jet acoustic signature
     * Detects erosion, sand damage, blockage
     */
    static analyzeJet(
        nozzleId: number,
        acousticData: number[], // Raw audio from microphone near that nozzle
        pressureData: number,
        needlePosition: number
    ): JetAnalysis {
        // FFT analysis
        const spectrum = this.performFFT(acousticData);

        // Dominant frequency (should be ~500-1500 Hz for clean jet)
        const peaks = this.findPeaks(spectrum);
        const dominantFrequency = peaks[0]?.frequency || 0;

        // Whistle index - high frequency energy indicates erosion or sand
        const whistleIndex = this.calculateWhistleIndex(spectrum);

        // Impact pattern classification
        let impactPattern: JetAnalysis['acousticSignature']['impactPattern'] = 'CLEAN';

        if (whistleIndex > 7) {
            impactPattern = 'SAND_DAMAGE'; // Sharp, high-pitched noise
        } else if (whistleIndex > 4) {
            impactPattern = 'ERODED'; // Broadband noise, less focused
        }

        // Calculate jet velocity from pressure (Bernoulli)
        const jetVelocity = Math.sqrt(2 * pressureData * 100000 / 1000); // Assuming water density 1000 kg/m³

        // Estimate erosion level from whistle index
        const erosionLevel = Math.min(100, whistleIndex * 10);

        return {
            nozzleId,
            acousticSignature: {
                spectrum,
                dominantFrequency,
                whistleIndex,
                impactPattern
            },
            jetVelocity,
            jetAngle: 0, // Would require laser measurement
            needlePosition,
            erosionLevel
        };
    }

    /**
     * Sync multi-nozzle balance
     * Calculates rotor force imbalance and bearing wear
     */
    static syncMultiNozzle(
        nozzleAnalyses: JetAnalysis[],
        runnerRadius: number // meters
    ): RotorForceBalance {
        const nozzleForces: number[] = [];

        // Calculate force from each nozzle
        for (const jet of nozzleAnalyses) {
            // F = ρ × A × v² (impact force)
            // Simplified: F ∝ v² × needle_position
            const force = 1000 * Math.PI * (0.05 ** 2) * (jet.jetVelocity ** 2) * (jet.needlePosition / 100);
            nozzleForces.push(force);
        }

        // Calculate resultant force (vector sum)
        let fx = 0;
        let fy = 0;

        const angleStep = 360 / nozzleAnalyses.length; // Even spacing

        for (let i = 0; i < nozzleAnalyses.length; i++) {
            const angle = (i * angleStep * Math.PI) / 180;
            fx += nozzleForces[i] * Math.cos(angle);
            fy += nozzleForces[i] * Math.sin(angle);
        }

        const resultantMagnitude = Math.sqrt(fx * fx + fy * fy);
        const resultantAngle = (Math.atan2(fy, fx) * 180) / Math.PI;

        // Imbalance ratio (0 = perfect, 1 = one nozzle off)
        const avgForce = nozzleForces.reduce((sum, f) => sum + f, 0) / nozzleForces.length;
        const imbalanceRatio = resultantMagnitude / (avgForce * nozzleAnalyses.length);

        // Bearing load increase (radial force from imbalance)
        const bearingLoadIncrease = imbalanceRatio * 100;

        // Predicted bearing wear (empirical formula)
        // L10 life inversely proportional to (load)³
        const normalLife = 100000; // hours
        const loadFactor = 1 + bearingLoadIncrease / 100;
        const predictedLife = normalLife / (loadFactor ** 3);
        const predictedWear = normalLife - predictedLife;

        return {
            timestamp: Date.now(),
            nozzleForces,
            resultantForce: {
                magnitude: resultantMagnitude,
                angle: resultantAngle
            },
            imbalanceRatio,
            bearingLoadIncrease,
            predictedBearingWear: predictedWear
        };
    }

    /**
     * Generate recommendations for jet balance
     */
    static generateRecommendations(
        jetAnalyses: JetAnalysis[],
        forceBalance: RotorForceBalance
    ): string[] {
        const recommendations: string[] = [];

        // Check individual jets
        for (const jet of jetAnalyses) {
            if (jet.acousticSignature.impactPattern === 'SAND_DAMAGE') {
                recommendations.push(
                    `🔴 Nozzle ${jet.nozzleId}: SAND DAMAGE detected (whistle index ${jet.acousticSignature.whistleIndex.toFixed(1)}). Replace needle immediately. Install sand filter upstream.`
                );
            } else if (jet.acousticSignature.impactPattern === 'ERODED') {
                recommendations.push(
                    `🟡 Nozzle ${jet.nozzleId}: Needle erosion at ${jet.erosionLevel.toFixed(0)}%. Plan replacement within 1000 operating hours.`
                );
            }

            // Check velocity mismatch
            const avgVelocity = jetAnalyses.reduce((sum, j) => sum + j.jetVelocity, 0) / jetAnalyses.length;
            const velocityDiff = Math.abs(jet.jetVelocity - avgVelocity);

            if (velocityDiff > avgVelocity * 0.1) {
                recommendations.push(
                    `⚠️ Nozzle ${jet.nozzleId}: Velocity mismatch ${velocityDiff.toFixed(1)} m/s from average. Check for partial blockage or needle calibration.`
                );
            }
        }

        // Check overall balance
        if (forceBalance.imbalanceRatio > 0.15) {
            recommendations.push(
                `🔴 CRITICAL: Rotor force imbalance ${(forceBalance.imbalanceRatio * 100).toFixed(1)}%. Bearing load increased by ${forceBalance.bearingLoadIncrease.toFixed(0)}%. Accelerated bearing wear predicted: ${forceBalance.predictedBearingWear.toFixed(0)} hours reduction in life.`
            );
            recommendations.push(
                `ACTION REQUIRED: Balance all nozzles to within 5% of each other. Inspect bearings for premature wear.`
            );
        } else if (forceBalance.imbalanceRatio > 0.08) {
            recommendations.push(
                `🟡 Moderate imbalance detected (${(forceBalance.imbalanceRatio * 100).toFixed(1)}%). Schedule nozzle calibration during next maintenance window.`
            );
        } else {
            recommendations.push(
                `✅ Jet balance within acceptable range (${(forceBalance.imbalanceRatio * 100).toFixed(1)}%). Continue monitoring.`
            );
        }

        return recommendations;
    }

    // ===== HELPER METHODS =====

    private static performFFT(audioData: number[]): number[] {
        // Simplified FFT - in production use proper FFT library
        const spectrum: number[] = [];
        const N = audioData.length;

        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;

            for (let n = 0; n < N; n++) {
                const angle = (2 * Math.PI * k * n) / N;
                real += audioData[n] * Math.cos(angle);
                imag -= audioData[n] * Math.sin(angle);
            }

            const magnitude = Math.sqrt(real * real + imag * imag);
            spectrum.push(magnitude);
        }

        return spectrum;
    }

    private static findPeaks(spectrum: number[]): Array<{ frequency: number; amplitude: number }> {
        const peaks: Array<{ frequency: number; amplitude: number }> = [];

        for (let i = 1; i < spectrum.length - 1; i++) {
            if (spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1]) {
                peaks.push({
                    frequency: i * 10, // Assuming 10 Hz bins
                    amplitude: spectrum[i]
                });
            }
        }

        return peaks.sort((a, b) => b.amplitude - a.amplitude);
    }

    private static calculateWhistleIndex(spectrum: number[]): number {
        // High-frequency energy ratio (> 2 kHz)
        const highFreqStart = Math.floor(spectrum.length * 0.4); // > 2 kHz assuming 10 Hz bins
        const highFreqEnergy = spectrum.slice(highFreqStart).reduce((sum, val) => sum + val, 0);
        const totalEnergy = spectrum.reduce((sum, val) => sum + val, 0);

        const ratio = highFreqEnergy / totalEnergy;

        // Scale to 0-10
        return Math.min(10, ratio * 20);
    }
}

// ===== USAGE EXAMPLE =====

/*
// Analyze each of 6 nozzles on a Pelton turbine
const jetAnalyses: JetAnalysis[] = [];

for (let nozzleId = 1; nozzleId <= 6; nozzleId++) {
    const acousticData = captureAudioNearNozzle(nozzleId); // Raw microphone data
    const pressure = 120; // bar
    const needlePosition = 75; // %
    
    const analysis = PeltonJetSyncService.analyzeJet(
        nozzleId,
        acousticData,
        pressure,
        needlePosition
    );
    
    jetAnalyses.push(analysis);
    
    console.log(`Nozzle ${nozzleId}: ${analysis.acousticSignature.impactPattern}, Erosion: ${analysis.erosionLevel}%`);
}

// Calculate rotor force balance
const forceBalance = PeltonJetSyncService.syncMultiNozzle(jetAnalyses, 1.2); // 1.2m runner radius

console.log(`Imbalance ratio: ${(forceBalance.imbalanceRatio * 100).toFixed(1)}%`);
console.log(`Bearing load increase: ${forceBalance.bearingLoadIncrease.toFixed(0)}%`);

// Get recommendations
const recommendations = PeltonJetSyncService.generateRecommendations(jetAnalyses, forceBalance);
recommendations.forEach(rec => console.log(rec));

// Output example:
// Nozzle 1: CLEAN, Erosion: 12%
// Nozzle 2: CLEAN, Erosion: 15%
// Nozzle 3: ERODED, Erosion: 48%  ← PROBLEM!
// Nozzle 4: CLEAN, Erosion: 18%
// Nozzle 5: CLEAN, Erosion: 14%
// Nozzle 6: CLEAN, Erosion: 16%
// Imbalance ratio: 12.3%
// Bearing load increase: 12%
// 🟡 Nozzle 3: Needle erosion at 48%. Plan replacement within 1000 operating hours.
// ⚠️ Nozzle 3: Velocity mismatch 8.2 m/s from average...
*/
