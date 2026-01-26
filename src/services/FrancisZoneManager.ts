/**
 * FrancisZoneManager.ts
 * 
 * Francis Turbine Rough Zone Manager
 * Maps vibration peaks to load zones (Rheingans / Part-Load Vortex).
 * Implements "Transition Speed Override" to jump through rough zones.
 */

export interface RoughZone {
    startLoadMW: number;
    endLoadMW: number;
    peakVibration: number; // mm/s
    zoneType: 'PART_LOAD' | 'FULL_LOAD' | 'UNKNOWN';
}

export class FrancisZoneManager {
    // Unit-specific zones
    private static unitZones: Map<string, RoughZone[]> = new Map();

    public static initialize(unitId: string): void {
        // Default rough zones for a generic Francis
        // Typically 40-60% is the "Rough Zone" (Vortex Rope)
        this.unitZones.set(unitId, [
            {
                startLoadMW: 20, // 40% of 50MW
                endLoadMW: 30,   // 60% of 50MW
                peakVibration: 4.5,
                zoneType: 'PART_LOAD'
            }
        ]);
        console.log(`[FrancisZone] Initialized zones for ${unitId}`);
    }

    /**
     * CHECK LOAD REQUEST
     * Returns an adjusted load setpoint if the request falls in a rough zone.
     * The strategy is to reject steady-state operation in the zone.
     */
    public static validateLoadRequest(
        unitId: string,
        requestedLoadMW: number,
        currentLoadMW: number
    ): { approvedLoad: number; strategy: string; message: string } {
        const zones = this.unitZones.get(unitId) || [];

        for (const zone of zones) {
            // Is request INSIDE the rough zone?
            if (requestedLoadMW >= zone.startLoadMW && requestedLoadMW <= zone.endLoadMW) {
                // We cannot stay here.
                // Decide whether to push UP or DOWN based on proximity
                const distToStart = Math.abs(requestedLoadMW - zone.startLoadMW);
                const distToEnd = Math.abs(requestedLoadMW - zone.endLoadMW);

                const safeLoad = distToStart < distToEnd ? zone.startLoadMW - 1 : zone.endLoadMW + 1;

                return {
                    approvedLoad: safeLoad,
                    strategy: 'ZONE_AVOIDANCE',
                    message: `⚠️ ROUGH ZONE REJECTION: ${requestedLoadMW} MW is inside ${zone.startLoadMW}-${zone.endLoadMW} MW vortex zone. Redirecting to ${safeLoad} MW.`
                };
            }

            // Are we TRANSITIONING THROUGH the zone?
            // i.e. Current is below, Request is above (or vice versa)
            const crossingUp = currentLoadMW < zone.startLoadMW && requestedLoadMW > zone.endLoadMW;
            const crossingDown = currentLoadMW > zone.endLoadMW && requestedLoadMW < zone.startLoadMW;

            if (crossingUp || crossingDown) {
                return {
                    approvedLoad: requestedLoadMW,
                    strategy: 'FAST_TRANSITION',
                    message: `🚀 TRANSITION OVERRIDE: Crossing rough zone. Max ramp rate activated to minimize vibration exposure.`
                };
            }
        }

        return {
            approvedLoad: requestedLoadMW,
            strategy: 'NORMAL',
            message: '✅ Load request optimal.'
        };
    }

    /**
     * LEARN NEW ZONES
     * If high vibration detected outside known zones, map it.
     */
    public static recordVibration(unitId: string, loadMW: number, vibration: number): void {
        const THRESHOLD = 3.5; // mm/s
        if (vibration > THRESHOLD) {
            // Check if already known
            const zones = this.unitZones.get(unitId) || [];
            const inKnown = zones.some(z => loadMW >= z.startLoadMW && loadMW <= z.endLoadMW);

            if (!inKnown) {
                // Expanding logic would go here (complex clustering)
                console.log(`[FrancisZone] ⚠️ New vibration peak detected at ${loadMW} MW (${vibration.toFixed(1)} mm/s). Potential new rough zone.`);
            }
        }
    }
}
