/**
 * SeismicResponseMonitor.ts
 * 
 * Vibration & Seismic Health Monitor
 * Tracks Peak Ground Acceleration (PGA) and Natural Frequency.
 * Detects structural stiffness loss (Frequency Shift).
 */

export interface SeismicHealth {
    pgaG: number; // Peak Ground Acceleration (g)
    dominantFrequencyHz: number;
    baselineFrequencyHz: number;
    stiffnessChangePct: number;
    status: 'HEALTHY' | 'DAMAGE_SUSPECTED';
}

export class SeismicResponseMonitor {
    private static readonly BASELINE_FREQ_HZ = 4.5; // Natural frequency of the dam

    /**
     * ANALYZE ACCELEROMETER DATA
     * Performs simplified frequency domain check.
     */
    public static analyze(
        pgaReading: number, // g
        currentPeakFreqHz: number
    ): SeismicHealth {

        // Stiffness is proportional to Frequency^2
        // K ~ f^2
        // Change in K = (f_curr^2 - f_base^2) / f_base^2

        const kRatio = (currentPeakFreqHz * currentPeakFreqHz) / (this.BASELINE_FREQ_HZ * this.BASELINE_FREQ_HZ);
        const stiffnessChange = (kRatio - 1.0) * 100; // %

        let status: SeismicHealth['status'] = 'HEALTHY';

        // If stiffness drops significantly (>5%)
        if (stiffnessChange < -5.0) {
            status = 'DAMAGE_SUSPECTED';
            console.warn(`[Civil] 📉 NATURAL FREQUENCY DROP: ${this.BASELINE_FREQ_HZ} -> ${currentPeakFreqHz}Hz. Est Stiffness Loss: ${stiffnessChange.toFixed(1)}%`);
        }

        return {
            pgaG: pgaReading,
            dominantFrequencyHz: currentPeakFreqHz,
            baselineFrequencyHz: this.BASELINE_FREQ_HZ,
            stiffnessChangePct: stiffnessChange,
            status
        };
    }
}
