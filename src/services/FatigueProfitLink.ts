/**
 * FATIGUE PROFIT LINK
 * The Cost of Wear ⏳💰
 * Translates abstract 'Fatigue Points' into concrete Euro values.
 */

export class FatigueProfitLink {
    private readonly COST_PER_POINT_EUR = 50.0; // Cost of 1 Life Point
    private readonly REFURBISHMENT_COST_EUR = 500000.0; // Cost of new runner
    private readonly TOTAL_LIFE_POINTS = 10000;

    /**
     * CALCULATE DAMAGE COST
     * Converts points to euros.
     */
    calculateDamageCost(points: number): number {
        return points * this.COST_PER_POINT_EUR;
    }

    /**
     * GET REMAINING VALUE
     * How much is the machine worth right now?
     */
    getAssetValue(currentTotalPoints: number): number {
        const remainingPoints = Math.max(0, this.TOTAL_LIFE_POINTS - currentTotalPoints);
        const percent = remainingPoints / this.TOTAL_LIFE_POINTS;
        return this.REFURBISHMENT_COST_EUR * percent;
    }
}
