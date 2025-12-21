// Hydraulic Transient Safety - 12mm-to-16mm Safeguard
// Simulation layer for validating hardware changes

export interface HydraulicSpec {
    pipeDiameterMM: number;
    pipeLengthM: number;
    oilViscosityCst: number; // Centistokes
    systemPressureBar: number;
    actuatorVolumeL: number;
    accumulators: boolean;
}

export interface SimulationResult {
    approved: boolean;
    reason: string;
    warnings: string[];
    metrics: {
        naturalFrequencyOld: number;
        naturalFrequencyNew: number;
        systemStiffnessRatio: number; // New / Old
        waterHammerPeak: number; // bar
        responseTimeChange: number; // %
    };
}

export class HydraulicTransientSafety {

    /**
     * Simulate impact of hydraulic hardware changes
     * Specifically designed to catch the "12mm to 16mm" mistake
     */
    static simulateHardwareChange(
        currentSpec: HydraulicSpec,
        proposedSpec: HydraulicSpec
    ): SimulationResult {

        // 1. Calculate System Stiffness (Hydraulic Capacitance/Inductance)
        // Simplified physics model for real-time check

        // Stiffness k ~ Area / Length (proportional to D^2)
        const stiffnessOld = Math.pow(currentSpec.pipeDiameterMM, 2);
        const stiffnessNew = Math.pow(proposedSpec.pipeDiameterMM, 2);

        const stiffnessRatio = stiffnessNew / stiffnessOld;

        // 2. Natural Frequency Shift
        // Omega ~ sqrt(k/m). If k increases by factor of (16/12)^2 = 1.77, freq increases by sqrt(1.77) = 1.33
        // A 33% shift in natural frequency is HUGE for a PID controller trained on the old system.

        const frequencyShiftPct = (Math.sqrt(stiffnessRatio) - 1) * 100;

        // 3. Water Hammer / Pressure Surge
        // Joukowsky equation: dP = rho * c * dV
        // Larger pipe = slower velocity for same flow? Or same velocity?
        // If flow is controlled by valve, larger pipe = lower velocity = lower water hammer.
        // BUT, usually people upgrade pipe to allow HIGHER flow.
        // If flow increases proportionally to Area, velocity stays same, but mass flow increases.
        // Hazard: If valve closes at same speed, the mass deceleration is huge.

        // Let's assume the servo valve is NOT changed, so it can close just as fast.

        const warnings: string[] = [];
        let approved = true;
        let reason = '';

        // CRITICAL CHECK: Natural Frequency Shift
        if (Math.abs(frequencyShiftPct) > 15) {
            approved = false;
            reason = `CRITICAL: Natural Frequency shift of ${frequencyShiftPct.toFixed(1)}% detected.`;
            warnings.push('PID Controller will become unstable (oscillations).');
            warnings.push('Resonance risk with structural harmonics.');
        }

        // CRITICAL CHECK: Water Hammer (Simulated)
        // If diameter increases 12->16 (1.78x area), and we assume flow increases to match...
        const waterHammerRisk = proposedSpec.pipeDiameterMM > currentSpec.pipeDiameterMM && !proposedSpec.accumulators;
        if (waterHammerRisk) {
            warnings.push('Water hammer risk increased due to higher flow potential without added accumulation.');
        }

        // The specific "12mm to 16mm" logic from the expert inputs
        if (currentSpec.pipeDiameterMM === 12 && proposedSpec.pipeDiameterMM === 16) {
            warnings.push('KNOWN HAZARD (Lesson Learned #442): 12mm->16mm upgrade often causes servo instability.');
            if (!proposedSpec.accumulators) {
                approved = false;
                reason += ' Start-up forbidden without re-tuning PID or adding accumulators.';
            }
        }

        return {
            approved,
            reason: approved ? 'Simulation Validated structure.' : reason,
            warnings,
            metrics: {
                naturalFrequencyOld: 100, // Normalized baseline
                naturalFrequencyNew: 100 * (1 + frequencyShiftPct / 100),
                systemStiffnessRatio: stiffnessRatio,
                waterHammerPeak: proposedSpec.systemPressureBar * 1.5, // Estimated
                responseTimeChange: stiffnessRatio * 10 // Faster response
            }
        };
    }
}
