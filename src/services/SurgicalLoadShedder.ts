/**
 * SurgicalLoadShedder.ts
 * 
 * High-Granularity Demand Response
 * Smart meter integration for essential/non-essential classification
 * Automated load shedding based on grid inertia requirements
 */

export interface SmartMeter {
    meterId: string;
    loadKW: number;
    classification: 'ESSENTIAL' | 'NON_ESSENTIAL';
    priority: number; // 1-10 (10 = highest priority)
    sheddable: boolean;
}

export class SurgicalLoadShedder {
    private static meters: Map<string, SmartMeter> = new Map();

    public static registerMeter(meter: SmartMeter): void {
        this.meters.set(meter.meterId, meter);
    }

    public static performSurgicalShed(targetReductionMW: number): {
        totalShed: number;
        metersAffected: number;
    } {
        console.log(`\n[LoadShed] Surgical shedding required: ${targetReductionMW.toFixed(1)} MW`);

        let shedTotal = 0;
        let affected = 0;

        // Sort by priority (lowest first) and classification
        const sheddable = Array.from(this.meters.values())
            .filter(m => m.sheddable && m.classification === 'NON_ESSENTIAL')
            .sort((a, b) => a.priority - b.priority);

        for (const meter of sheddable) {
            if (shedTotal >= targetReductionMW * 1000) break;

            shedTotal += meter.loadKW;
            affected++;
            console.log(`  Shedding ${meter.meterId}: ${meter.loadKW} kW`);
        }

        console.log(`[LoadShed] ✅ Total shed: ${(shedTotal / 1000).toFixed(2)} MW (${affected} meters)`);

        return { totalShed: shedTotal / 1000, metersAffected: affected };
    }
}
