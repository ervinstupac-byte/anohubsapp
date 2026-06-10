/**
 * RUNOUT MONITOR
 * The Geometric Guardian 📐
 * Monitors the precise rotation of the shaft.
 */

export interface RunoutStatus {
    radialOrbitMM: number; // Max peak-to-peak in X-Y plane
    axialRunoutMM: number; // Max delta Z per revolution
    isAligned: boolean;
    message: string;
}

export class RunoutMonitor {

    /**
     * CHECK RUNOUT
     * Calculates Radial Orbit and Axial Wobble.
     */
    checkRunout(
        probeX_mm: number[], // Array of readings for one rev
        probeY_mm: number[],
        probeZ_mm: number[]
    ): RunoutStatus {
        // 1. Radial Orbit (Simplified: Max - Min on X and Y, take max of that)
        // In reality, we'd do a proper Lissajous fit, but for v1.0, Peak-to-Peak is robust.
        const xMin = Math.min(...probeX_mm);
        const xMax = Math.max(...probeX_mm);
        const yMin = Math.min(...probeY_mm);
        const yMax = Math.max(...probeY_mm);

        const radialOrbitMM = Math.max(xMax - xMin, yMax - yMin);

        // 2. Axial Run-out (Z-Axis Wobble)
        const zMin = Math.min(...probeZ_mm);
        const zMax = Math.max(...probeZ_mm);
        const axialRunoutMM = zMax - zMin;

        // 3. Evaluation
        // Rule: Axial > 0.15mm is CRITICAL
        if (axialRunoutMM > 0.15) {
            return {
                radialOrbitMM,
                axialRunoutMM,
                isAligned: false,
                message: `🚨 COLLAR MISALIGNMENT! Axial Wobble ${axialRunoutMM.toFixed(3)}mm > 0.15mm limit. Thrust collar may be loose!`
            };
        }

        // Rule: Radial > 0.20mm is WARNING
        if (radialOrbitMM > 0.20) {
            return {
                radialOrbitMM,
                axialRunoutMM,
                isAligned: false, // Not critical, but not aligned
                message: `⚠️ HIGH RADIAL ORBIT (${radialOrbitMM.toFixed(3)}mm). Check balancing or guide bearing clearance.`
            };
        }

        return {
            radialOrbitMM,
            axialRunoutMM,
            isAligned: true,
            message: '✅ Shaft Rotating True. Geometric Fingerprint Match.'
        };
    }
}
