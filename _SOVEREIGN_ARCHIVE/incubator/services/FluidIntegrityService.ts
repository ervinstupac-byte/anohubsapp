/**
 * FluidIntegrityService.ts
 * 
 * Oil Quality & Hydraulic Health Monitor
 * Monitors Viscosity, Water Content, and Pump Performance.
 * Correlates Viscosity/Temp/Pressure to diagnose pump issues vs fluid issues.
 */

export interface FluidState {
    viscosityCS: number; // Centistokes
    correctedViscosity40C: number; // Normalized
    waterContentPPM: number;
    pumpHealth: 'HEALTHY' | 'CAVITATION' | 'WEAR';
    fluidHealth: 'GOOD' | 'DILUTED' | 'OXIDIZED' | 'WATER_CONTAMINATION';
}

export class FluidIntegrityService {

    /**
     * ANALYZE FLUID HEALTH
     */
    public static analyzeFluid(
        tempC: number,
        viscosityMeasuredCS: number,
        waterPPM: number,
        pressureBar: number,
        ratedPressureBar: number
    ): FluidState {
        // 1. Viscosity Index Correction (Simplified ASTM D341)
        // Assume ISO VG 46 Oil
        // approximate log-log relationship or simple exponential for SCADA
        // V_corr = V_meas * e^( beta * (T_meas - 40) )
        // Using common rule of thumb: Viscosity halves every 10-15C increase typically?
        // Let's us a simple correction factor for status.
        // Assuming viscosity should be ~46 at 40C.

        // This is a rough normalizing estimator
        const tempDiff = tempC - 40;
        // Correct back to 40C 
        // If Temp is 50, measured is lower, we multiply to get back to 40C equiv
        const correctionFactor = Math.pow(1.025, tempDiff);
        const correctedViscosity = viscosityMeasuredCS * correctionFactor; // Very rough

        // 2. Fluid Diagnosis
        let fluidHealth: FluidState['fluidHealth'] = 'GOOD';
        if (waterPPM > 500) fluidHealth = 'WATER_CONTAMINATION';
        else if (correctedViscosity < 35) fluidHealth = 'DILUTED'; // Too thin
        else if (correctedViscosity > 60) fluidHealth = 'OXIDIZED'; // Sludge/Thick

        // 3. Pump Diagnosis
        // If Pressure is LOW:
        // - If Viscosity is LOW (Thin) -> Fluid issue causing leak-by?
        // - If Viscosity is NORMAL -> Pump wear or filter clog?
        let pumpHealth: FluidState['pumpHealth'] = 'HEALTHY';

        if (pressureBar < ratedPressureBar * 0.85) {
            if (fluidHealth === 'DILUTED') {
                // Low pressure likely due to thin oil, pump might be ok
                // But still marked as issue context
                // Let's say pump is suffering from thin oil
            } else {
                // Normal viscosity but low pressure => Mechanical Wear
                pumpHealth = 'WEAR';
            }
        }

        // Cavitation detection (Low pressure + fluctuations - not passed here, assumed simplified)

        return {
            viscosityCS: viscosityMeasuredCS,
            correctedViscosity40C: correctedViscosity,
            waterContentPPM: waterPPM,
            pumpHealth,
            fluidHealth
        };
    }
}
