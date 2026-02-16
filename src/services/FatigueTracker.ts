/**
 * FATIGUE TRACKER
 * The Fatigue Clock ⏳
 * Tracks the "Life Cost" of every operation.
 */

export interface FatigueState {
    totalPoints: number;
    remainingLifePercent: number;
    recentPointsAdded: number;
    alert: string | null;
}

export class FatigueTracker {
    private readonly MAX_POINTS = 10000; // Simulated life limit (e.g. 10k cycles)

    // Cost Table
    private readonly COST_NORMAL_START = 1;
    private readonly COST_NORMAL_STOP = 1;
    private readonly COST_FAST_STOP = 5;
    private readonly COST_EMERGENCY_TRIP = 10;

    // State
    private currentPoints: number;

    constructor(initialPoints: number = 0) {
        this.currentPoints = initialPoints;
    }

    /**
     * REGISTER EVENT
     * Adds fatigue points based on event type.
     */
    addEvent(eventType: 'START' | 'STOP' | 'FAST_STOP' | 'TRIP'): FatigueState {
        let addedpoints = 0;

        switch (eventType) {
            case 'START': addedpoints = this.COST_NORMAL_START; break;
            case 'STOP': addedpoints = this.COST_NORMAL_STOP; break;
            case 'FAST_STOP': addedpoints = this.COST_FAST_STOP; break;
            case 'TRIP': addedpoints = this.COST_EMERGENCY_TRIP; break;
        }

        this.currentPoints += addedpoints;
        const percentUsed = (this.currentPoints / this.MAX_POINTS) * 100;
        const percentLeft = 100 - percentUsed;

        let alert = null;
        if (eventType === 'TRIP') {
            alert = `💥 FATIGUE SPIKE: Trip Event (+${addedpoints} pts). Machine aged significantly.`;
        }

        if (percentLeft < 10) {
            alert = `⏳ CRITICAL AGING: Only ${percentLeft.toFixed(1)}% Fatigue Life remaining!`;
        }

        return {
            totalPoints: this.currentPoints,
            remainingLifePercent: percentLeft,
            recentPointsAdded: addedpoints,
            alert
        };
    }
}
