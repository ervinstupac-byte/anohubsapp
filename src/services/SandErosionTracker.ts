/**
 * THE SAND MONSTER
 * Erosion Tracker for Pelton Turbines
 * 
 * Logic:
 * High velocity water + Sand = Sandblasting
 * Wear rate is proportional to: Velocity^3 * Concentration
 */

export interface ErosionStatus {
    timestamp?: number;
    sedimentPPM?: number;
    jetVelocity?: number;
    bucketThinningRate: number; // microns per year
    estimatedBucketLife?: number; // years remaining
    severity?: 'NEGLIGIBLE' | 'MODERATE' | 'HIGH' | 'EXTREME';
    recommendation?: string;
    // Additional tracking for accumulated erosion
    accumulatedThinningMm?: number; // Total material loss in mm
}

export class SandErosionTracker {

    // Constant K depends on sand hardness (Quartz is hard!) and bucket material
    // For 13Cr4Ni steel vs Quartz sand, we use a reference factor.
    private readonly K_FACTOR = 0.05;

    /**
     * Calculate Erosion Rate
     * @param sedimentPPM Parts per Million of sediment in water
     * @param jetVelocity Velocity of jet in m/s
     * @param currentBucketThickness mm
     */
    trackErosion(
        sedimentPPM: number,
        jetVelocity: number,
        currentBucketThickness: number, // mm
        coatingHealthy: boolean = true  // Default: Coating is Intact
    ): ErosionStatus {
        const timestamp = Date.now();

        // 1. Calculate Thinning Rate (Simplified Model)
        // Rate (microns/year) = K * PPM * v^2 (Wait, typically erosion is v^3)
        // Let's use v^3 for "The Sand Monster" - it sounds scarier and is often cited (velocity exponent 3-3.6)

        // Normalizing:
        // Assume baseline: 100 m/s, 100 PPM -> 500 microns/year ??
        // Let's adjust K to get realistic values.
        // If v=80m/s, PPM=50 -> Low wear
        // If v=140m/s, PPM=1000 -> Extreme wear

        const velocityFactor = Math.pow(jetVelocity / 100, 3); // Normalized to 100 m/s
        const ppmFactor = sedimentPPM / 100; // Normalized to 100 PPM

        // Base wear at 100m/s and 100 PPM = 200 microns/year (0.2mm/year)
        const baseWear = 200;

        const bucketThinningRate = baseWear * velocityFactor * ppmFactor; // microns/year

        // 2. Determine Severity
        let severity: ErosionStatus['severity'] = 'NEGLIGIBLE';
        if (bucketThinningRate > 5000) severity = 'EXTREME';      // > 5mm/year!
        else if (bucketThinningRate > 1000) severity = 'HIGH';    // > 1mm/year
        else if (bucketThinningRate > 200) severity = 'MODERATE'; // > 0.2mm/year

        // 3. Estimate Life
        // Allowable wear (say 5mm total before efficiency tanks or structural fail)
        const allowableWearMicrons = 5000;
        // Remaining wear? assume we don't know start, just "How long would a NEW bucket last at this rate?"
        // Or "Years to lose 5mm"
        const estimatedBucketLife = bucketThinningRate > 0
            ? allowableWearMicrons / bucketThinningRate
            : 999;

        // 4. Recommendation
        let recommendation = 'Water is clean. Buckets are happy.';
        if (severity === 'EXTREME') {
            recommendation = '🚨 SAND STORM! Shut down or switch to settling basins! Buckets will vanish in months!';
        } else if (severity === 'HIGH') {
            recommendation = '⚠️ High Wear Rate. Inspect nozzles and buckets monthly. Check splitter Tips.';
        } else if (severity === 'MODERATE') {
            recommendation = 'Monitor sediment levels. Routine inspection yearly.';
        }

        return {
            timestamp,
            sedimentPPM,
            jetVelocity,
            bucketThinningRate,
            estimatedBucketLife,
            severity,
            recommendation
        };
    }
}
