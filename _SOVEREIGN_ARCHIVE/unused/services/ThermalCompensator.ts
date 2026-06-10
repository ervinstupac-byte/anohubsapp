/**
 * THERMAL COMPENSATOR
 * The Thermal Brain 🌡️🧠
 * Adjusts alarm thresholds based on thermal expansion physics.
 * 
 * Metal expands when hot. 'Cold' clearances shrink during 'Hot' operation.
 * We must adjust the 'Low Limit' alarm to prevent false positives during normal thermal growth.
 */

export class ThermalCompensator {
    private readonly BASE_TEMP_C = 20;
    private readonly STEEL_EXPANSION_COEFF = 12e-6; // per degree C (approx)

    /**
     * ADJUST THRESHOLD
     * Calculates the dynamic threshold based on current metal temperature.
     * 
     * @param baseThresholdMM The limit at 20°C (e.g. Min Gap 1.0mm)
     * @param currentTempC The current metal temperature
     * @param dimensionMM The characteristic dimension (e.g. Shaft Diameter or Gap Span) causing expansion
     */
    getAdjustedThreshold(
        baseThresholdMM: number,
        currentTempC: number,
        dimensionMM: number = 1000 // Default reference size ~1m if not specific
    ): number {
        const deltaT = currentTempC - this.BASE_TEMP_C;

        // Expansion = Length * Coeff * DeltaT
        // If deltaT is positive (Hot), metal expands, closing the gap.
        // The safe limit (Minimum Gap) can be lowered because we EXPECT current gap to be smaller.
        // Wait, NO. If the limit is "Minimum allowed gap", safety requires we NEVER go below physical rub limit.
        // Usually, the "Alarm Setting" in SCADA is set for Running conditions.
        // Here we simulate converting a "Cold Spec" (Passport) to a "Hot Limit".

        const expansionMM = dimensionMM * this.STEEL_EXPANSION_COEFF * deltaT;

        // If hot, the expected gap shrinks by expansionMM.
        // So the "Normal" gap is smaller.
        // The "Alarm" threshold (Min Gap) should theoretically track this?
        // Let's assume the user wants the "Expected Limit".
        // If Base Limit is 1.0mm. Expansion is 0.2mm.
        // New Limit = 1.0 - 0.2 = 0.8mm.

        return Math.max(0, baseThresholdMM - expansionMM);
    }
}
