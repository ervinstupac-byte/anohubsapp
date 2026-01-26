/**
 * VIBRATION EXPERT SERVICE
 * The FFT Whisperer 👂🌊
 * Analyzes spectral data to find the root cause of the shake.
 */

export interface FrequencyPeak {
    frequencyHz: number;
    amplitudeMmS: number;
}

export interface VibrationDiagnosis {
    danger: boolean;
    cause: string;
    recommendation: string;
    bpfHz: number; // Calculated Blade Passing Frequency
}

export class VibrationExpert {

    /**
     * THE FFT WHISPERER
     * Checks if the vibration is coming from the hydraulic heart (BPF).
     */
    checkFrequencyPeaks(
        peaks: FrequencyPeak[],
        rpm: number,
        numberOfBlades: number
    ): VibrationDiagnosis {
        // 1. Calculate Blade Passing Frequency (BPF)
        // BPF = (RPM / 60) * NumberOfBlades
        const rotationFreqHz = rpm / 60;
        const bpfHz = rotationFreqHz * numberOfBlades;

        // Define a tolerance window for the peak detection (+/- 5%)
        const tolerance = bpfHz * 0.05;

        // 2. Scan peaks for BPF match
        const bpfPeak = peaks.find(p =>
            p.frequencyHz >= (bpfHz - tolerance) &&
            p.frequencyHz <= (bpfHz + tolerance)
        );

        // 3. Evaluate Severity
        if (bpfPeak) {
            if (bpfPeak.amplitudeMmS > 2.0) {
                return {
                    danger: true,
                    cause: `High Vibration at BPF (${bpfPeak.frequencyHz.toFixed(1)} Hz)`,
                    recommendation: 'Hydraulic imbalance detected - check guide vane alignment or runner debris! 🍂',
                    bpfHz
                };
            }
        }

        // Check for 1xRPM (Unbalance)
        const unbalancePeak = peaks.find(p =>
            p.frequencyHz >= (rotationFreqHz - 0.5) &&
            p.frequencyHz <= (rotationFreqHz + 0.5)
        );

        if (unbalancePeak && unbalancePeak.amplitudeMmS > 3.0) {
            return {
                danger: true,
                cause: `High Vibration at 1xRPM (${unbalancePeak.frequencyHz.toFixed(1)} Hz)`,
                recommendation: 'Mechanical Unbalance! Check rotor mass distribution or lost weights. ⚖️',
                bpfHz
            };
        }

        return {
            danger: false,
            cause: 'Normal Spectral Signature',
            recommendation: 'Spectrogam looks clean. No specific peaks dominant.',
            bpfHz
        };
    }
}
