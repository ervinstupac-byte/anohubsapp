/**
 * SafetyInterlockEngine.ts
 * 
 * HARDWIRED PROTECTION LOGIC
 * Critical overrides that supersede ALL automation and operator commands.
 * - Overspeed (>115%)
 * - Reverse Power (Motoring)
 * - Emergency Stop (E-Stop)
 * - Dead Man Switch (System heartbeat)
 */

export interface InterlockStatus {
    tripActive: boolean;
    tripReason: string | null;
    actionRequired: 'NONE' | 'TRIP' | 'BLOCK_START';
}

export interface DeadManStatus {
    safe: boolean;
    action?: string;
    latency?: number;
}

export class SafetyInterlockEngine {

    // Hard limits
    private static readonly OVERSPEED_TRIP_PCT = 115.0;
    private static readonly REVERSE_POWER_TRIP_MW = -2.0; // Motoring limit
    private static readonly MAX_LATENCY_MS = 2000; // 2 seconds heartbeat limit

    /**
     * EVALUATE INTERLOCKS
     * Returns immediate safety action if boundaries are crossed.
     */
    public static checkProtections(
        speedPct: number,
        activePowerMW: number,
        eStopPressed: boolean,
        vibrationTotal: number // mm/s
    ): InterlockStatus {

        // 1. E-STOP (Highest Priority)
        if (eStopPressed) {
            return {
                tripActive: true,
                tripReason: 'E-STOP ACTIVATED',
                actionRequired: 'TRIP'
            };
        }

        // 2. OVERSPEED (Mechanical destruction risk)
        if (speedPct >= this.OVERSPEED_TRIP_PCT) {
            return {
                tripActive: true,
                tripReason: `OVERSPEED DETECTED (${speedPct.toFixed(1)}%)`,
                actionRequired: 'TRIP'
            };
        }

        // 3. REVERSE POWER (Generator motoring, heats up blades/cavitation)
        // Usually allowed for pump-storage, but this is standard generation logic
        if (activePowerMW < this.REVERSE_POWER_TRIP_MW) {
            return {
                tripActive: true,
                tripReason: `REVERSE POWER (${activePowerMW.toFixed(1)} MW)`,
                actionRequired: 'TRIP'
            };
        }

        // 4. HIGH VIBRATION (Bearing seizure risk)
        if (vibrationTotal > 8.0) { // ISO standard trip usually ~7-10 mm/s
            return {
                tripActive: true,
                tripReason: `HIGH VIBRATION TRIP (${vibrationTotal.toFixed(1)} mm/s)`,
                actionRequired: 'TRIP'
            };
        }

        return {
            tripActive: false,
            tripReason: null,
            actionRequired: 'NONE'
        };
    }

    /**
     * CHECK DEAD MAN SWITCH (Watchdog Timer)
     * Ensures SCADA data is fresh. If latency exceeds threshold, assume communication loss.
     */
    public static checkDeadManSwitch(
        commStatus: 'GOOD' | 'BAD' | 'UNKNOWN',
        lastHeartbeat: number
    ): DeadManStatus {
        const now = Date.now();
        const latency = now - lastHeartbeat;

        if (commStatus !== 'GOOD') {
            return {
                safe: false,
                action: 'SCADA_LINK_FAILURE',
                latency
            };
        }

        if (latency > this.MAX_LATENCY_MS) {
            return {
                safe: false,
                action: `HEARTBEAT_TIMEOUT (+${latency}ms)`,
                latency
            };
        }

        return {
            safe: true,
            latency
        };
    }

    /**
     * Get overall safety status
     */
    public static getStatus(): {
        protectionsActive: number;
        lastCheck: number;
        status: 'LOCKED' | 'UNLOCKED' | 'TRIPPED';
    } {
        return {
            protectionsActive: 4, // Number of active protection checks
            lastCheck: Date.now(),
            status: 'LOCKED' // Default safe state
        };
    }
}
