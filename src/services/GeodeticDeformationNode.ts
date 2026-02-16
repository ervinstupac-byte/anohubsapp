/**
 * GeodeticDeformationNode.ts
 * 
 * Structural Displacement Monitor
 * Ingests InSAR (Satellite) and Total Station (Robotic) data.
 * Compares Crest displacement against FEM (Finite Element Model) limits.
 */

export interface DisplacementVector {
    pointId: string;
    dx: number; // mm (streamwise)
    dy: number; // mm (transverse)
    dz: number; // mm (vertical/settlement)
    totalMagnitude: number;
    trendMmYear: number;
    femLimitMm: number;
    alert: boolean;
}

export class GeodeticDeformationNode {

    /**
     * EVALUATE POINT
     */
    public static evaluate(
        pointId: string,
        currentPos: { x: number; y: number; z: number },
        baselinePos: { x: number; y: number; z: number },
        femLimitMm: number
    ): DisplacementVector {

        const dx = (currentPos.x - baselinePos.x) * 1000; // m to mm
        const dy = (currentPos.y - baselinePos.y) * 1000;
        const dz = (currentPos.z - baselinePos.z) * 1000;

        const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Simulated trend (random Drift)
        const trend = mag / 5.0; // mm/year assumed over 5 years

        return {
            pointId,
            dx,
            dy,
            dz,
            totalMagnitude: mag,
            trendMmYear: trend,
            femLimitMm,
            alert: mag > femLimitMm
        };
    }
}
