/**
 * WISDOM FILTER
 * The Smart Filter 🧠✨
 * Takes dumb data from Giants and paints it with AnoHUB Wisdom (Fatigue, Stress, etc.).
 */

import { WaterHammerMonitor } from './WaterHammerMonitor';
import { FatigueTracker } from './FatigueTracker';

export interface SmartSignal {
    passportId: string;
    rawValue: number | string;
    wisdom: string[]; // Enriched insights
    wisdomKpi?: number; // e.g. Stress Level or Fatigue Points
}

export class WisdomFilter {
    private hammer: WaterHammerMonitor;
    private fatigue: FatigueTracker;

    constructor() {
        this.hammer = new WaterHammerMonitor();
        this.fatigue = new FatigueTracker();
    }

    /**
     * ENRICH DATA
     * Passes the data through our specialized monitors.
     */
    enrichSignal(passportId: string, value: any): SmartSignal {
        const result: SmartSignal = {
            passportId,
            rawValue: value,
            wisdom: []
        };

        // 1. Water Hammer Check (Pressure)
        if (passportId === 'Spiral_Case_Pressure' && typeof value === 'number') {
            // We assume gate movement is true to be safe, or we'd need that signal too
            const event = this.hammer.checkPressure(value, true);
            if (event.severity !== 'NORMAL') {
                result.wisdom.push(event.message);
                result.wisdomKpi = event.riseRateBarPerSec;
            } else {
                result.wisdom.push('Pressure Stable (No Scream)');
            }
        }

        // 2. Fatigue Check (Breaker Status)
        if (passportId === 'Main_Breaker_Status') {
            if (value === 'TRIPPED') {
                const event = this.fatigue.addEvent('TRIP');
                result.wisdom.push(event.alert || 'Fatigue Points Added');
                result.wisdomKpi = event.recentPointsAdded;
            }
        }

        return result;
    }
}
