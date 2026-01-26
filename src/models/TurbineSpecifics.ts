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

    // Mechanical
    bucketWidthMm: number;
    runnerMaterial: '13Cr4Ni' | 'Cast Steel' | 'Bronze';
    deflectorResponseTimeMs: number; // Critical for pressure rise control

    // Maintenance Limits
    needleErosionLimitMm: number; // User input, e.g., 2.0mm
    bucketRootCrackToleranceMm: number; // usually 0 for critical zones
}

// --- 2. KAPLAN (Axial Flow Reaction) ---
export interface KaplanSpecs {
    // Hydraulic
    runnerBladeCount: 3 | 4 | 5 | 6 | 7;
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
