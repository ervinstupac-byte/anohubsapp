/**
 * VortexDiagnostic.ts
 * 
 * Physics Hardening: Vortex Rope Detection
 * Analyzes Draft Tube Pressure Pulsations.
 * Looks for specific frequency band: 0.3 Hz to 5.0 Hz (Rheingans freq approx f_n / 3).
 */

export interface VortexState {
    dominantFreqHz: number;
    magnitudePsi: number;
    isRopeActive: boolean;
    ropeType: 'NONE' | 'PARTIAL_LOAD_ROPE' | 'FULL_LOAD_INSTABILITY';
}

export class VortexDiagnostic {

    /**
     * ANALYZE PRESSURE SPECTRUM
     */
    public static analyze(
        pressureWaveform: number[], // Time series
        samplingRateHz: number
    ): VortexState {

        // 1. FFT (Simulated)
        // In real code: Perform FFT to get Spectrum
        // Here we simulated detecting a peak

        // Simulated detection based on waveform variance (amplitude)
        // A real rope creates distinct low-freq high-amp signal

        // Let's assume the 'hardware' passes us the dominant frequency and amp
        const dominantFreqHz = 0.8; // Example: typical PARTIAL LOAD rope freq (< 1 Hz usually)
        const magnitudePsi = 5.0; // Large swing

        // 2. Frequency Window Check (0.3 - 5.0 Hz)
        const inVortexBand = dominantFreqHz >= 0.3 && dominantFreqHz <= 5.0;

        let rope: VortexState['ropeType'] = 'NONE';

        if (inVortexBand && magnitudePsi > 2.0) {
            // Check Load regime correlation?
            // Usually < 0.5 * fn -> Partial Load Rope
            rope = 'PARTIAL_LOAD_ROPE';
        }

        return {
            dominantFreqHz,
            magnitudePsi,
            isRopeActive: rope !== 'NONE',
            ropeType: rope
        };
    }
}
