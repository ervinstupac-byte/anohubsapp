/**
 * TRUE WEAR SCHEDULER
 * The Predictive Planner 🗓️🛠️
 * Schedules maintenance based on actual physical degradation.
 */

export interface MaintenancePrediction {
    predictedDate: Date;
    reason: string; // "Sand Erosion critical" or "Cavitation limit"
    wearPercent: number;
}

export class TrueWearScheduler {

    /**
     * PREDICT NEXT OVERHAUL
     * Extrapolates current wear rates to find the "Kill Date".
     */
    predictNextOverhaul(
        currentSandErosionMm: number,
        sandWearRateMmPerDay: number,
        currentCavitationHours: number
    ): MaintenancePrediction {
        // Limits
        const MAX_EROSION_MM = 5.0; // Labyrinth gap limit
        // const MAX_CAVITATION_HRS = 8000; 

        // 1. Calculate days until Erosion Failure
        const remainingMm = MAX_EROSION_MM - currentSandErosionMm;
        let daysToErosion = 9999;
        if (sandWearRateMmPerDay > 0) {
            daysToErosion = remainingMm / sandWearRateMmPerDay;
        }

        // 2. Logic: We schedule for the earliest limiting factor
        const today = new Date();
        const futureDate = new Date(today.getTime() + daysToErosion * 24 * 60 * 60 * 1000);

        return {
            predictedDate: futureDate,
            reason: `Sand Erosion will breach ${MAX_EROSION_MM}mm limit.`,
            wearPercent: (currentSandErosionMm / MAX_EROSION_MM) * 100
        };
    }
}
