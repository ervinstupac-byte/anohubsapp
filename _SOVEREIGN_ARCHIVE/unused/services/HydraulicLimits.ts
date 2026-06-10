/**
 * HydraulicLimits.ts
 * 
 * Physics Hardening: Water Hammer Calculation (Joukowski)
 * Updated with Read-Only Defaults for safety.
 */

export interface WaterHammerParams {
    rho: number; // Density (kg/m3) typ 1000
    waveSpeedMps: number; // 'a' - celerity (m/s) typ 1000-1400
    gravity: number; // m/s2
    penstockAreaM2: number;
}

export class HydraulicLimits {

    // SAFEGUARDS: Default Physics Constants (Read-Only)
    public static readonly DEFAULT_PARAMS: Readonly<WaterHammerParams> = {
        rho: 997.0, // Water @ 25C
        waveSpeedMps: 1200.0, // Steel Penstock approximation
        gravity: 9.80665,
        penstockAreaM2: 12.5
    };

    /**
     * CALCULATE SURGE (Joukowski)
     */
    public static calculateSurge(
        deltaFlowM3s: number,
        closingTimeSec: number,
        params: WaterHammerParams = this.DEFAULT_PARAMS // Fallback
    ): { surgeHeadM: number; surgePressureKpa: number; isSafe: boolean } {

        // Sanity Check Inputs
        if (!params || params.waveSpeedMps <= 0) params = this.DEFAULT_PARAMS;
        if (deltaFlowM3s < 0) deltaFlowM3s = Math.abs(deltaFlowM3s); // Magnitude

        // 1. Calculate Velocity Change
        const deltaV = deltaFlowM3s / params.penstockAreaM2;

        // 2. Joukowski Max Surge
        const maxSurgeHead = (params.waveSpeedMps * deltaV) / params.gravity;

        const surgePressureKpa = (maxSurgeHead * params.rho * params.gravity) / 1000;

        return {
            surgeHeadM: maxSurgeHead,
            surgePressureKpa,
            isSafe: maxSurgeHead < 50 // Example limit 50m
        };
    }

    public static estimateWaveSpeed(
        diameterMm: number,
        thicknessMm: number,
        modulusSteelGpa: number = 200,
        bulkModulusWaterGpa: number = 2.2
    ): number {
        // Avoid div by zero
        if (thicknessMm <= 0) return 1200; // Safe default

        const K = bulkModulusWaterGpa * 1e9;
        const E = modulusSteelGpa * 1e9;
        const D = diameterMm / 1000;
        const e = thicknessMm / 1000;

        return 1420 / Math.sqrt(1 + (K / E) * (D / e));
    }
}
