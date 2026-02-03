/**
 * VIBRATION EXPERT SERVICE
 * The FFT Whisperer 👂🌊
 * Analyzes spectral data to find the root cause of the shake.
 */

export interface FrequencyPeak {
    frequencyHz: number;
    amplitudeMmS: number;
    order?: number;
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
    /**
     * THE FFT WHISPERER
     * Checks if the vibration is coming from the hydraulic heart (BPF).
     * 
     * @param maintenanceFactors - Optional field data (NC-130) to tighten thresholds based on known defects.
     */
    checkFrequencyPeaks(
        peaks: FrequencyPeak[],
        rpm: number,
        numberOfBlades: number,
        maintenanceFactors?: {
            shaftPlumbnessDeviation?: number; // mm/m (Ideal: < 0.02)
            bearingClearanceGap?: number; // mm (Ideal: 0.15)
        }
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
        // NC-130: Dynamic Threshold Adjustment
        let bpfThreshold = 2.0;
        let unbalanceThreshold = 3.0;

        let warningSuffix = "";

        if (maintenanceFactors) {
            // Rule 1: Bad Plumbness = High Misalignment Sensitivity (2x RPM consideration mostly, but lowers Unbalance too)
            if (maintenanceFactors.shaftPlumbnessDeviation && maintenanceFactors.shaftPlumbnessDeviation > 0.05) {
                unbalanceThreshold *= 0.8; // Lower threshold by 20%
                warningSuffix += ` [NOTE: High Shaft Runout (${maintenanceFactors.shaftPlumbnessDeviation}mm) recorded during install]`;
            }
        }

        if (bpfPeak) {
            if (bpfPeak.amplitudeMmS > bpfThreshold) {
                return {
                    danger: true,
                    cause: `High Vibration at BPF (${bpfPeak.frequencyHz.toFixed(1)} Hz)`,
                    recommendation: 'Hydraulic imbalance detected - check guide vane alignment or runner debris! 🍂' + warningSuffix,
                    bpfHz
                };
            }
        }

        // Check for 1xRPM (Unbalance)
        const unbalancePeak = peaks.find(p =>
            p.frequencyHz >= (rotationFreqHz - 0.5) &&
            p.frequencyHz <= (rotationFreqHz + 0.5)
        );

        if (unbalancePeak && unbalancePeak.amplitudeMmS > unbalanceThreshold) {
            return {
                danger: true,
                cause: `High Vibration at 1xRPM (${unbalancePeak.frequencyHz.toFixed(1)} Hz)`,
                recommendation: 'Mechanical Unbalance! Check rotor mass distribution or lost weights. ⚖️' + warningSuffix,
                bpfHz
            };
        }

        // NC-130 Check for 2xRPM (Misalignment) - New Killer
        const misalignmentPeak = peaks.find(p =>
            p.frequencyHz >= ((rotationFreqHz * 2) - 0.5) &&
            p.frequencyHz <= ((rotationFreqHz * 2) + 0.5)
        );

        // Misalignment is VERY sensitive to plumbness
        let misalignmentThreshold = 2.5;
        if (maintenanceFactors?.shaftPlumbnessDeviation && maintenanceFactors.shaftPlumbnessDeviation > 0.05) {
            misalignmentThreshold = 1.8; // Aggressive reduction
        }

        if (misalignmentPeak && misalignmentPeak.amplitudeMmS > misalignmentThreshold) {
            return {
                danger: true,
                cause: `High Vibration at 2xRPM (${misalignmentPeak.frequencyHz.toFixed(1)} Hz) - SHAFT MISALIGNMENT`,
                recommendation: `Check coupling bolts and verify laser alignment. Static deviation: ${maintenanceFactors?.shaftPlumbnessDeviation || 'Unknown'}mm.`,
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
