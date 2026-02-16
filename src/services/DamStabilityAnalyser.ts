/**
 * DamStabilityAnalyser.ts
 * 
 * Civil Structure Stability Monitor
 * Tracks Uplift Pressure (Piezometers) and Seepage rates.
 * Detects hydraulic anomalies in the foundation.
 */

export interface StabilityMetrics {
    slidingSafetyFactor: number; // > 1.5 usually
    overturningSafetyFactor: number;
    seepageLps: number;
    upliftPressureKpa: number;
    anomalyDetected: boolean;
    status: 'STABLE' | 'WARNING' | 'CRITICAL';
}

export class DamStabilityAnalyser {
    // Design constants
    private static readonly DAM_WEIGHT_KN = 5000000; // Simulated weight
    private static readonly FRICTION_COEFF = 0.7;

    // Baseline Seepage Curve (Flow vs Head)
    // Simple linear approximation for demo: Q = k * H
    private static readonly SEEPAGE_FACTOR = 0.5; // L/s per meter of head

    /**
     * ANALYZE STABILITY
     */
    public static analyze(
        reservoirLevelMasl: number,
        tailwaterLevelMasl: number,
        seepageWeirFlowLps: number,
        avgUpliftPressureKpa: number
    ): StabilityMetrics {

        const head = reservoirLevelMasl - tailwaterLevelMasl;

        // 1. Sliding Stability (Simplified)
        // Factor = (VerticalForces * tan(phi) + Cohesion) / HorizontalForces
        // Horizontal Force ~ 0.5 * rho * g * h^2
        const waterDensity = 1000; // kg/m3
        const g = 9.81;
        const horizontalForceKn = (0.5 * waterDensity * g * Math.pow(head, 2)) / 1000;

        // Uplift Force (reduces effective weight)
        // Area assumption: 1000 m2 base
        const upliftForceKn = avgUpliftPressureKpa * 1000;

        const effectiveNormalForce = Math.max(0, this.DAM_WEIGHT_KN - upliftForceKn);
        const resistingForce = effectiveNormalForce * this.FRICTION_COEFF;

        const slidingFactor = horizontalForceKn > 0 ? resistingForce / horizontalForceKn : 999;

        // 2. Seepage Analysis
        // Expected flow
        const expectedSeepage = head * this.SEEPAGE_FACTOR;
        const anomaly = seepageWeirFlowLps > (expectedSeepage * 1.5); // 50% over baseline

        // 3. Status
        let status: StabilityMetrics['status'] = 'STABLE';
        if (slidingFactor < 1.5 || anomaly) status = 'WARNING';
        if (slidingFactor < 1.1) status = 'CRITICAL';

        return {
            slidingSafetyFactor: slidingFactor,
            overturningSafetyFactor: slidingFactor * 1.2, // Rough proxy
            seepageLps: seepageWeirFlowLps,
            upliftPressureKpa: avgUpliftPressureKpa,
            anomalyDetected: anomaly,
            status
        };
    }
}
