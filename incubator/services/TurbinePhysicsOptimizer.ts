/**
 * TurbinePhysicsOptimizer.ts
 * 
 * Specialized Physical Models for Turbine-Specific Optimization
 * Implements conjugate curve logic (Kaplan), vortex suppression (Francis),
 * and high-frequency monitoring (Pelton).
 */

export enum TurbineType {
    KAPLAN = 'KAPLAN',
    FRANCIS = 'FRANCIS',
    PELTON = 'PELTON',
    UNKNOWN = 'UNKNOWN'
}

export interface KaplanState {
    gateOpening: number; // α (alpha) - guide vane opening %
    bladeAngle: number;  // φ (phi) - runner blade angle °
    actualEfficiency: number; // Measured from power/flow
    targetEfficiency: number; // From hill chart
}

export interface FrancisState {
    draftTubePressure: number[]; // Time series for FFT
    rotationalSpeed: number; // RPM
    vortexFrequency: number; // Detected frequency Hz
    vortexAmplitude: number; // Pressure fluctuation amplitude
}

export interface PeltonState {
    nozzlePressure: number[]; // Time series per nozzle
    needlePosition: number[];
    needleVelocity: number[]; // mm/s closing rate
    pressureSurge: number; // Maximum detected surge
}

/**
 * Kaplan Turbine Optimization
 */
export class KaplanOptimizer {

    /**
     * Manufacturer's 3D Hill Chart (simplified model)
     * Real implementation would load actual chart data from database
     */
    private static hillChart: Map<string, number> = new Map([
        // Format: "alpha_phi" -> efficiency
        ["20_5", 0.88],
        ["40_10", 0.92],
        ["60_15", 0.94],
        ["80_20", 0.93],
        ["100_25", 0.90]
    ]);

    /**
     * Calculate efficiency gap from conjugate curve
     * 
     * @param state - Current Kaplan turbine state
     * @param mechanicalOffset - Servo backlash compensation offset in degrees (default: 0)
     *                          Example: For worn servo with 2.1° backlash, set to 2.1
     */
    public static calculateEfficiencyGap(
        state: KaplanState,
        mechanicalOffset: number = 0
    ): {
        efficiencyGap: number;
        optimalBladeAngle: number;
        compensatedSetpoint: number;
        recommendation: string;
    } {
        // Calculate optimal blade angle for current gate opening
        const optimalBladeAngle = this.getOptimalBladeAngle(state.gateOpening);

        // Apply mechanical offset compensation
        // If servo has backlash, command higher angle to achieve target
        const compensatedSetpoint = optimalBladeAngle + mechanicalOffset;

        // Interpolate from hill chart
        const optimalEfficiency = this.getOptimalEfficiency(
            state.gateOpening,
            optimalBladeAngle // Use ideal angle, not actual
        );

        const efficiencyGap = ((optimalEfficiency - state.actualEfficiency) / optimalEfficiency) * 100;

        let recommendation = '';
        if (efficiencyGap > 1.0) {
            const angleDelta = optimalBladeAngle - state.bladeAngle;

            if (mechanicalOffset > 0) {
                recommendation = `HEALING_PROTOCOL_OPTIMIZE_CAM (Backlash Compensated): ` +
                    `Adjust blade angle by ${angleDelta.toFixed(2)}° (from ${state.bladeAngle.toFixed(1)}° to ${optimalBladeAngle.toFixed(1)}°). ` +
                    `Setpoint: ${compensatedSetpoint.toFixed(1)}° (includes +${mechanicalOffset.toFixed(1)}° servo compensation) ` +
                    `to recover ${efficiencyGap.toFixed(2)}% efficiency`;
            } else {
                recommendation = `HEALING_PROTOCOL_OPTIMIZE_CAM: Adjust blade angle by ${angleDelta.toFixed(2)}° ` +
                    `(from ${state.bladeAngle.toFixed(1)}° to ${optimalBladeAngle.toFixed(1)}°) ` +
                    `to recover ${efficiencyGap.toFixed(2)}% efficiency`;
            }
        } else {
            recommendation = mechanicalOffset > 0
                ? `Conjugate curve optimal (servo backlash compensated +${mechanicalOffset.toFixed(1)}°)`
                : 'Conjugate curve optimal';
        }

        return {
            efficiencyGap,
            optimalBladeAngle,
            compensatedSetpoint,
            recommendation
        };
    }

    /**
     * Get optimal efficiency from hill chart
     */
    private static getOptimalEfficiency(gateOpening: number, bladeAngle: number): number {
        // Simplified lookup - in production, interpolate from full 3D chart
        const key = `${Math.round(gateOpening)}_${Math.round(bladeAngle)}`;
        return this.hillChart.get(key) || 0.90; // Default 90% if not in chart
    }

    /**
     * Get optimal blade angle for given gate opening (conjugate curve)
     */
    private static getOptimalBladeAngle(gateOpening: number): number {
        // Simplified linear relationship - real curve is non-linear
        // Typical: φ_optimal = 0.25 * α (for example, 25° at 100% gate)
        return gateOpening * 0.25;
    }
}

/**
 * Francis Turbine Optimization
 */
export class FrancisOptimizer {

    /**
     * Monitor draft tube vortex and detect Rheingans frequency
     */
    public static detectVortexResonance(state: FrancisState): {
        vortexDetected: boolean;
        resonanceFrequency: number;
        suppressionRequired: boolean;
        recommendation: string;
    } {
        // Calculate Rheingans frequency range
        const rotationalFreq = state.rotationalSpeed / 60; // Convert RPM to Hz
        const rheingansLow = 0.2 * rotationalFreq;
        const rheingansHigh = 0.4 * rotationalFreq;

        // Check if detected vortex frequency is in Rheingans range
        const vortexDetected = state.vortexAmplitude > 0.1; // bar
        const inResonanceRange =
            state.vortexFrequency >= rheingansLow &&
            state.vortexFrequency <= rheingansHigh;

        const suppressionRequired = vortexDetected && inResonanceRange && state.vortexAmplitude > 0.3;

        let recommendation = '';
        if (suppressionRequired) {
            recommendation = `HEALING_PROTOCOL_VORTEX_SUPPRESSION: ` +
                `Detected draft tube vortex at ${state.vortexFrequency.toFixed(2)} Hz ` +
                `(Rheingans range: ${rheingansLow.toFixed(2)}-${rheingansHigh.toFixed(2)} Hz). ` +
                `Amplitude: ${state.vortexAmplitude.toFixed(2)} bar. ` +
                `ACTION: (1) Activate air injection to 200 m³/h, OR (2) Shift load by ±5% to exit resonance zone.`;
        } else if (vortexDetected) {
            recommendation = `Minor vortex detected (${state.vortexAmplitude.toFixed(2)} bar) - monitoring`;
        } else {
            recommendation = 'No vortex resonance detected';
        }

        return {
            vortexDetected,
            resonanceFrequency: state.vortexFrequency,
            suppressionRequired,
            recommendation
        };
    }

    /**
     * Calculate required air injection rate for vortex suppression
     */
    public static calculateAirInjectionRate(vortexAmplitude: number): number {
        // Empirical formula: Q_air (m³/h) ≈ 500 * (amplitude / 0.5)
        return Math.min(500, 500 * (vortexAmplitude / 0.5));
    }
}

/**
 * Pelton Turbine Optimization
 */
export class PeltonOptimizer {

    /**
     * Detect water hammer from rapid needle closing
     */
    public static detectWaterHammer(state: PeltonState): {
        waterHammerDetected: boolean;
        maxSurge: number;
        criticalNozzle: number;
        recommendation: string;
    } {
        // Analyze pressure surge in each nozzle
        let maxSurge = 0;
        let criticalNozzle = -1;

        for (let i = 0; i < state.nozzlePressure.length; i++) {
            const surge = Math.max(...state.nozzlePressure) - Math.min(...state.nozzlePressure);
            if (surge > maxSurge) {
                maxSurge = surge;
                criticalNozzle = i;
            }
        }

        const waterHammerDetected = maxSurge > 20; // bar threshold

        let recommendation = '';
        if (waterHammerDetected) {
            const criticalVelocity = state.needleVelocity[criticalNozzle];
            recommendation = `HEALING_PROTOCOL_REDUCE_NEEDLE_SPEED: ` +
                `Water hammer detected on Nozzle ${criticalNozzle + 1} ` +
                `(Surge: ${maxSurge.toFixed(1)} bar, Needle speed: ${criticalVelocity.toFixed(1)} mm/s). ` +
                `ACTION: Reduce needle closing rate to < 5 mm/s and activate deflector during transients.`;
        } else {
            recommendation = `Normal operation - max surge ${maxSurge.toFixed(1)} bar`;
        }

        return {
            waterHammerDetected,
            maxSurge,
            criticalNozzle,
            recommendation
        };
    }

    /**
     * Optimize needle closing profile to minimize water hammer
     */
    public static getOptimalNeedleProfile(currentPosition: number, targetPosition: number): {
        maxClosingRate: number; // mm/s
        estimatedDuration: number; // seconds
        profile: 'LINEAR' | 'S_CURVE';
    } {
        const stroke = Math.abs(targetPosition - currentPosition);

        // Use S-curve profile for large strokes to minimize surge
        if (stroke > 50) {
            return {
                maxClosingRate: 5, // mm/s safe rate
                estimatedDuration: stroke / 3.5, // S-curve average
                profile: 'S_CURVE'
            };
        } else {
            return {
                maxClosingRate: 8,
                estimatedDuration: stroke / 8,
                profile: 'LINEAR'
            };
        }
    }
}
