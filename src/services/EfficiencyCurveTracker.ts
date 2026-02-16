/**
 * EFFICIENCY CURVE TRACKER
 * The Sweet Spot Tracker 🍯
 * Guides the operator to the Best Efficiency Point (BEP).
 */

export interface EfficiencyState {
    currentEfficiency: number;
    deviationFromBEP: number;
    zone: 'SWEET_SPOT' | 'ROUGH_ZONE' | 'CAVITATION_RISK';
    message: string;
}

export class EfficiencyCurveTracker {
    // Simulated Hill Chart Data
    // BEP at 85% Gate = 94% Eff
    private readonly BEP_GATE = 85.0;
    private readonly BEP_EFF = 94.0;

    /**
     * CHECK EFFICIENCY
     * Calculates instant efficiency and zone based on Gate opening.
     */
    checkSweetSpot(gatePercent: number): EfficiencyState {
        // Simple parabola model for efficiency curve
        // Eff = Max - k * (Gate - BEP)^2
        const k = 0.02;
        const efficiency = this.BEP_EFF - k * Math.pow(gatePercent - this.BEP_GATE, 2);

        const deviation = Math.abs(gatePercent - this.BEP_GATE);

        let zone: EfficiencyState['zone'] = 'SWEET_SPOT';
        let msg = '🍯 You are in the Sweet Spot. The Runner is happy.';

        if (deviation > 30) {
            zone = 'CAVITATION_RISK';
            msg = '🦈 DANGER: Deep Part Load / Overload! Cavitation Sharks are feeding.';
        } else if (deviation > 10) {
            zone = 'ROUGH_ZONE';
            msg = '⚠️ WARNING: Leaving the Sweet Spot. Sand Monster is getting hungry (Turbulence).';
        }

        return {
            currentEfficiency: Math.max(0, efficiency),
            deviationFromBEP: deviation,
            zone,
            message: msg
        };
    }
}
