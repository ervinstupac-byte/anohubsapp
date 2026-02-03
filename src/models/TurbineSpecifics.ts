/**
 * TURBINE SPECIFICS SCHEMA
 * 
 * Defines the technical specifications for various turbine types based on IEC standards 
 * and standard mechanical engineering practices.
 */

// --- 1. PELTON (Impulse Turbine) ---
export interface PeltonSpecs {
    // Hydraulic
    nozzleCount: 1 | 2 | 3 | 4 | 5 | 6;
    jetDiameterMm: number;
    headRangeM: { min: number; max: number }; // e.g., 200-1000m
    runnerMaterial: RunnerMaterial; // Added via NC-130

    // Mechanical
    bucketWidthMm: number;
    // runnerMaterial moved to hydraulic/core definition
    deflectorResponseTimeMs: number; // Critical for pressure rise control

    // Maintenance Limits
    needleErosionLimitMm: number; // User input, e.g., 2.0mm
    bucketRootCrackToleranceMm: number; // usually 0 for critical zones
}

// --- 2. KAPLAN (Axial Flow Reaction) ---
export interface KaplanSpecs {
    // Hydraulic
    runnerBladeCount: 3 | 4 | 5 | 6 | 7;
    runnerMaterial: RunnerMaterial;
    cavitationFactorSigma: number; // Plant Sigma

    // Regulation
    bladeAngleRangeDeg: { min: number; max: number }; // e.g., -5 to +30
    wicketGateOpeningMm: number;

    // Oil Head (Runner Hub)
    oilHeadPressureBar: number;
    hubOilVolumeLiters: number;

    // Variant
    isSType: boolean; // Kaplan S-Type (Horizontal) ?
}

// --- 3. BULB (Submersible Axial) ---
export interface BulbSpecs {
    // Structural / Housing
    runnerMaterial: RunnerMaterial;
    bulbHousingPressureBar: number; // Internal pressurization for leak prevention
    watertightnessRating: string; // e.g., IP68 equivalent for sensors

    // Cooling
    coolingAirFlowM3h: number; // Critical for generator in bulb nose
    heatExchangerType: 'Air-Water' | 'Direct Shell';

    // Mechanical
    stepUpGearRatio?: number; // Bulb units often have gears
    accessHatchSealIntegrity: 'Double-Seal' | 'Single-Seal';
}

/**
 * Type Guards
 */
export const isPelton = (specs: any): specs is PeltonSpecs => 'nozzleCount' in specs;
export const isKaplan = (specs: any): specs is KaplanSpecs => 'bladeAngleRangeDeg' in specs;
export const isBulb = (specs: any): specs is BulbSpecs => 'bulbHousingPressureBar' in specs;

// --- 4. MATERIAL DNA & SENSITIVITY ---
export type RunnerMaterial = '13Cr4Ni' | 'Cast Steel' | 'Bronze';

/**
 * EXPERT LOGIC: Material Sensitivity
 * Returns the critical Thoma's Sigma (Cavitation Threshold) based on material resilience.
 * - Bronze: Soft, highly sensitive to pitting.
 * - Cast Steel: Standard, moderate resistance.
 * - 13Cr4Ni: Stainless, high resistance, allows lower sigma.
 */
export const getCavitationThreshold = (material: RunnerMaterial = 'Cast Steel'): number => {
    switch (material) {
        case 'Bronze': return 0.25; // Needs high backpressure (safe)
        case 'Cast Steel': return 0.15;
        case '13Cr4Ni': return 0.08; // Can run aggressively
        default: return 0.15;
    }
};

