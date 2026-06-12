/**
 * VIBRATION BASELINE
 * The Signature Learner 📈🔊
 * Learns what "Normal" sounds like for THIS specific machine.
 */

export interface VibrationProfile {
    baselineMeanMmS: number;
    sigmaMmS: number;   // Standard Deviation
    zones: {
        normal: number; // < This
        rough: number;  // < This
        critical: number; // > This
    };
    status: 'LEARNING' | 'ESTABLISHED';
}

export class VibrationBaseline {

    /**
     * LEARN SIGNATURE
     * Simulates a 24-hour learning period.
     */
    learnSignature(): VibrationProfile {
        // Mock Learning Process
        // Simulate collecting 10,000 samples
        // Result: This machine is naturally a bit noisy (Mean 1.8mm/s)
        const mean = 1.8;
        const sigma = 0.2;

        return {
            baselineMeanMmS: mean,
            sigmaMmS: sigma,
            zones: {
                normal: mean + (2 * sigma), // < 2.2
                rough: mean + (4 * sigma),  // < 2.6
                critical: mean + (6 * sigma) // > 3.0
            },
            status: 'ESTABLISHED'
        };
    }

    /**
     * GET SOVEREIGN FINGERPRINT (Golden Point @ 85.35 MW)
     * The Sound of Perfection.
     */
    getSovereignFingerprint() {
        return {
            id: 'SOVEREIGN_FP_85MW',
            loadMw: 85.35,
            harmonics: {
                h1_mag: 0.8, // Rotor Heartbeat
                h2_mag: 0.1, // Alignment
                bpf_mag: 1.2, // Hydraulic Pulse
                rope_mag: 0.05 // Silent Draft Tube
            }
        };
    }

    /**
     * CHECK DEVIATION
     * Compares current vibration levels against baseline values.
     */
    static checkDeviation(
        currentVibration: number,
        bearingTemp: number,
        hoursSinceService: number,
        loadPercent: number
    ) {
        const baselineValue = 1.8 + (loadPercent / 100) * 0.4 + (bearingTemp > 70 ? (bearingTemp - 70) * 0.02 : 0) + (hoursSinceService / 10000) * 0.3;
        const deviationPercent = ((currentVibration - baselineValue) / baselineValue) * 100;
        
        let status: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
        let action = '';

        if (currentVibration > 4.5 || deviationPercent > 50) {
            status = 'CRITICAL';
            action = 'Critical vibration levels detected. Recommended immediate inspection. Check bearing alignment and tightness of coupling bolts. Reduce turbine load immediately.';
        } else if (currentVibration > 3.0 || deviationPercent > 20) {
            status = 'WARNING';
            action = 'Vibration deviation detected. Increase monitoring frequency. Schedule standard bearing lubrication and alignment check.';
        } else {
            status = 'NOMINAL';
            action = 'System is operating within the nominal baseline range. No action required.';
        }

        return {
            status,
            deviationPercent,
            baselineValue,
            action
        };
    }
}
