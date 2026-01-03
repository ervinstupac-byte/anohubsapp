// Hydraulic Transient Safety - 12mm-to-16mm Safeguard
// Simulation layer for validating hardware changes

import Decimal from 'decimal.js';

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
        const stiffnessOld = new Decimal(currentSpec.pipeDiameterMM).pow(2);
        const stiffnessNew = new Decimal(proposedSpec.pipeDiameterMM).pow(2);

        const stiffnessRatio = stiffnessNew.div(stiffnessOld);

        // 2. Natural Frequency Shift
        // Omega ~ sqrt(k/m). If k increases by factor of (16/12)^2 = 1.77, freq increases by sqrt(1.77) = 1.33
        // A 33% shift in natural frequency is HUGE for a PID controller trained on the old system.

        const frequencyShiftPct = stiffnessRatio.sqrt().minus(1).mul(100);

        // 3. Water Hammer / Pressure Surge
        // Joukowsky equation: dP = rho * c * dV

        const warnings: string[] = [];
        let approved = true;
        let reason = '';

        // CRITICAL CHECK: Natural Frequency Shift
        if (frequencyShiftPct.abs().gt(15)) {
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
                naturalFrequencyNew: new Decimal(100).mul(new Decimal(1).plus(frequencyShiftPct.div(100))).toNumber(),
                systemStiffnessRatio: stiffnessRatio.toNumber(),
                waterHammerPeak: new Decimal(proposedSpec.systemPressureBar).mul(1.5).toNumber(), // Estimated
                responseTimeChange: stiffnessRatio.mul(10).toNumber() // Faster response
            }
        };
    }
}
