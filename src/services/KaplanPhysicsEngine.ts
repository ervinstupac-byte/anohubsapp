/**
 * KAPLAN PHYSICS ENGINE
 * The Double Regulation Logic 📐⚙️
 * 
 * Manages the "Combinator Curve" (Cam) relationship between Wicket Gate
 * and Runner Blade angle to maximize efficiency in low-head environments.
 */

export interface CombinatorStat {
    gateOpening: number; // 0-100%
    bladeAngle: number;  // 0-100%
    head: number;        // Meters
    efficiency: number;  // 0-100%
    deviation: number;   // Difference from Ideal
    isOffCam: boolean;
}

import BaseGuardian from './BaseGuardian';

export class KaplanPhysicsEngine extends BaseGuardian {

    /**
     * CALCULATE COMBINATOR EFFICIENCY
     * Determines how well the machine is adhering to the Cam Curve.
     */
    calculateEfficiency(gate: number, blade: number, head: number): CombinatorStat {
        const idealBlade = this.calculateIdealBladeAngle(gate, head);
        const deviation = Math.abs(blade - idealBlade);

        // Base Efficiency (Theoretical Peak for Kaplan is ~94%)
        // Penalty: Efficiency drops rapidly if Blade and Gate are mismatched.
        const penalty = Math.pow(deviation, 1.5) * 0.5;

        let efficiency = 94.0 - penalty;
        if (efficiency < 0) efficiency = 0;

        // "Off-Cam" definition: Deviation > 3%
        const isOffCam = deviation > 3.0;

        return {
            gateOpening: gate,
            bladeAngle: blade,
            head,
            efficiency,
            deviation,
            isOffCam
        };
    }

    /**
     * IDEAL BLADE ANGLE (The Cam Curve)
     * Simplified linear model for demo purposes.
     * In reality, this is a 3D surface (Head, Gate -> Blade).
     */
    calculateIdealBladeAngle(gate: number, head: number): number {
        // Base relationship: Blade follows Gate
        let ideal = gate * 0.9 + 5;

        // Head Adjustment: Higher head requires slightly flatter blades for same flow
        // (Simplified physics)
        ideal -= (head - 10) * 0.5;

        // Clamp
        return Math.min(100, Math.max(0, ideal));
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
