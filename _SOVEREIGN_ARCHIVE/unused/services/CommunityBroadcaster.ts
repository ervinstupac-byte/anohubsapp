/**
 * COMMUNITY BROADCASTER
 * The Voice of the Fortress 🌊🏘️
 * Translates technical data into public safety alerts.
 */

export interface PublicAlert {
    level: 'INFO' | 'WATCH' | 'WARNING' | 'EVACUATE';
    channel: 'SMS' | 'SIREN' | 'APP';
    message: string;
    timestamp: Date;
    type?: string; // Alert type/category
}

export class CommunityBroadcaster {

    /**
     * CHECK FLOOD GUARD
     * Monitors river level and issues public alerts.
     */
    checkFloodGuard(riverLevelMeters: number, spillwayActive: boolean): PublicAlert | null {
        // Max Safe Level = 15.0m

        if (riverLevelMeters > 16.0) {
            return {
                level: 'EVACUATE',
                channel: 'SIREN',
                message: `🚨 FLOOD DANGER: River at ${riverLevelMeters}m. Move to high ground immediately. Spillway is OPEN.`,
                timestamp: new Date()
            };
        }

        if (riverLevelMeters > 14.5) {
            return {
                level: 'WARNING',
                channel: 'SMS',
                message: `⚠️ RIVER RISING: Level ${riverLevelMeters}m. Prepare for potential flooding. Standard Spillway Operations active.`,
                timestamp: new Date()
            };
        }

        if (spillwayActive) {
            return {
                level: 'INFO',
                channel: 'APP',
                message: `ℹ️ PREVENTIVE RELEASE: Spillway active. River flow increased. Stay clear of the banks.`,
                timestamp: new Date()
            };
        }

        return null; // All quiet
    }
}
