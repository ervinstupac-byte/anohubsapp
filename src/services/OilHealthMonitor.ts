/**
 * OIL HEALTH MONITOR
 * The Chemical Guard ⚗️🛡️
 * Tracks the life-blood of the bearings: Lubrication Oil.
 */

export interface OilHealthStatus {
    score: number; // 0-100
    degradationReason: string | null;
    tanStatus: 'GOOD' | 'WARNING' | 'CRITICAL';
}

export class OilHealthMonitor {

    /**
     * CHECK OIL HEALTH
     * Integrates TAN (Chemical) and Particles (Physical).
     */
    checkOilHealth(
        tan: number, // Total Acid Number (mg KOH/g)
        oxidationLevel: number, // %
        waterContentPPM: number
    ): OilHealthStatus {
        let score = 100;
        let reasons: string[] = [];
        let tanStatus: OilHealthStatus['tanStatus'] = 'GOOD';

        // 1. TAN Rule (The Acid Test)
        // Limit > 0.5 mg KOH/g is the "Warning" trigger in many turbine oils (or degradation relative to new).
        if (tan > 0.5) {
            score -= 40; // Severe penalty
            tanStatus = 'WARNING';
            reasons.push(`High ACIDITY (TAN ${tan.toFixed(2)} > 0.5). Chemical Degradation active.`);
        }

        // 2. Oxidation Rule
        if (oxidationLevel > 80) {
            score -= 20;
            reasons.push(`Oxidation High (${oxidationLevel}%). Sludge formation risk.`);
        }

        // 3. Water Rule (The Emulsifier)
        if (waterContentPPM > 500) {
            score -= 30;
            reasons.push(`Water Contamination (${waterContentPPM} ppm). Oil film strength compromised.`);
        }

        return {
            score: Math.max(0, score),
            degradationReason: reasons.length > 0 ? reasons.join(' + ') : null,
            tanStatus
        };
    }
}
