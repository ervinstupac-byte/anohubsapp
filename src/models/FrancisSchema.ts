import { Asset } from '../types';

/**
 * FRANCIS HORIZONTAL SPECIFICATION
 * 
 * Specialized data model for Horizontal Shaft Francis Turbines.
 * Critical for medium-head applications where cavitation and bearing load
 * are primary failure modes.
 */
export interface FrancisHorizontalSpecs {
    // Hydraulic Parameters
    spiralCasePressure: number; // bar
    draftTubeVacuum: number;    // bar (negative relative, or absolute?) usually vacuum < 1 bar abs.

    // Mechanical Dimensions
    runnerDiameter: number;     // mm
    guideVaneCount: number;     // integer

    // Tribology
    bearingType: 'Roller' | 'Slide';
    shaftSealType: 'Mechanical' | 'Packing';

    // Operational Limits (Extracted from Legacy Data)
    nominalBearingTemp?: number; // Default 60°C
    vibrationLimit?: number;     // Default 2.5 mm/s
    siltThresholdCritical?: number; // Default 3000 ppm
    alignmentTolerance?: number; // Default 0.05 mm
}

// Default Constants based on "Francis_Horizontal.html"
export const FRANCIS_CONSTANTS = {
    MAX_BEARING_TEMP: 60, // Celsius
    TRIP_BEARING_TEMP: 70, // Celsius
    MAX_VIBRATION_ISO: 2.5, // mm/s
    CRITICAL_SILT_PPM: 3000,
    ALIGNMENT_LIMIT_MM: 0.05
};

/**
 * Type Guard to check if an asset is a Horizontal Francis
 */
export const isFrancisHorizontal = (asset: Asset): boolean => {
    return asset.turbine_type?.toLowerCase() === 'francis' &&
        // We might need a more explicit 'orientation' field, 
        // but for now we infer or check specs existence.
        !!asset.specs && 'spiralCasePressure' in asset.specs;
};
