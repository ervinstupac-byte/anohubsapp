/**
 * LINKAGE HEALTH MONITOR
 * The Ghost Hunter 👻🔧
 * Detects hysteresis (slop/play) between Servomotor and Guide Vanes.
 */

export interface LinkageHealth {
    hysteresisPercent: number; // The "Ghost" gap
    status: 'TIGHT' | 'LOOSE' | 'BROKEN_LINK';
    recommendation: string;
}

export class LinkageHealthMonitor {
    // Maximum allowed difference between Opening and Closing curves
    private readonly MAX_HYSTERESIS = 2.0; // %

    /**
     * CHECK LINKAGE
     * Compares the Servo Stroke (Input) vs. actual Vane Opening (Output)
     * effectively checking the mechanical chain.
     */
    checkLinkage(servoStrokePercent: number, vaneOpeningPercent: number, direction: 'OPENING' | 'CLOSING' | 'STABLE'): LinkageHealth {

        // In a perfect machine, Servo 50% = Vane 50% (linearized).
        // Hysteresis appears as a lag when changing direction.

        const deviation = Math.abs(servoStrokePercent - vaneOpeningPercent);

        let status: LinkageHealth['status'] = 'TIGHT';
        let rec = 'Linkage is tight and responsive.';

        if (deviation > 10.0) {
            status = 'BROKEN_LINK';
            rec = '🚨 CRITICAL: Servomotor disconnected from Ring! Immediate inspection required.';
        } else if (deviation > this.MAX_HYSTERESIS) {
            status = 'LOOSE';
            rec = `👻 GHOST DETECTED: ${deviation.toFixed(1)}% Hysteresis. Check bushings and shear pins for wear.`;
        }

        return {
            hysteresisPercent: deviation,
            status,
            recommendation: rec
        };
    }
}
