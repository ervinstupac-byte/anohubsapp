/**
 * HydraulicReflexLogger.ts
 * 
 * Performance Baseline & Reflex Tracker
 * Measures "Time-to-Respond" for actuators.
 * Compares current reflexes against historical baseline.
 */

export interface ReflexEvent {
    component: string;
    timestamp: number;
    commandChange: number; // %
    responseTimeMs: number; // Delay before movement started
    travelTimeMs: number;   // Time to complete move
    baselineResponseMs: number;
    degradationPct: number;
}

export class HydraulicReflexLogger {
    private static baselines: Record<string, number> = {
        'PELTON_DEFLECTOR': 150, // ms typical
        'FRANCIS_WICKET': 500    // ms typical
    };

    /**
     * LOG REFLEX
     * Call this when a movement completes.
     */
    public static logReflex(
        component: string,
        responseTimeMs: number, // Dead time
        travelTimeMs: number    // Slew time
    ): ReflexEvent {
        const baseline = this.baselines[component] || 200;
        const degradation = ((responseTimeMs - baseline) / baseline) * 100;

        const event: ReflexEvent = {
            component,
            timestamp: Date.now(),
            commandChange: 0, // Need deeper integration to capture delta
            responseTimeMs,
            travelTimeMs,
            baselineResponseMs: baseline,
            degradationPct: Math.max(0, degradation)
        };

        if (degradation > 50) {
            console.warn(`[ReflexLogger] ${component} SLUGGISH! Response ${responseTimeMs}ms (Baseline ${baseline}ms). Check servos/accumulators.`);
        }

        return event;
    }
}
