/**
 * FLEET COMMAND CENTER
 * The Valley Coordinator 🏘️📢
 * Coordinates emergency responses across multiple sites (e.g. Flood Protocol).
 */

export interface FleetCommand {
    siteId: string;
    action: string; // "OPEN_SPILLWAY" | "HOLD_WATER"
    urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export class FleetCommandCenter {

    /**
     * INITIATE FLOOD PROTOCOL
     * Orchestrates the valley response.
     */
    initiateFloodProtocol(upstreamLevelMm: number): FleetCommand[] {
        const commands: FleetCommand[] = [];

        if (upstreamLevelMm > 15000) { // 15m
            // Critical Flood
            commands.push({
                siteId: 'Site_A (Upstream)',
                action: 'HOLD_WATER (Maximize Storage)',
                urgency: 'CRITICAL'
            });
            commands.push({
                siteId: 'Site_B (Downstream)',
                action: 'PRE-RELEASE (Create Buffer)',
                urgency: 'CRITICAL'
            });
        } else {
            // Standard Balance
            commands.push({
                siteId: 'Site_A (Upstream)',
                action: 'NORMAL_GEN',
                urgency: 'NORMAL'
            });
        }

        return commands;
    }
}
