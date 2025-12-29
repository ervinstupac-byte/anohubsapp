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
// Mined from Francis_H Reference Docs
export const FRANCIS_CONSTANTS = {
    // Bearings (SOP-ROT-001)
    MAX_BEARING_TEMP: 60, // Celsius (Warning)
    TRIP_BEARING_TEMP: 70, // Celsius (Trip)

    // Braking (SOP-MECH-003)
    BRAKE_AIR_PRESSURE_BAR: 7.0,
    BRAKE_PERMISSIVE_SPEED_PCT: 20, // < 20% to apply

    // Physics & Silt (FR-EP-001)
    MAX_VIBRATION_ISO: 5.0, // mm/s (Francis Horizontal Limit)
    SILT_WARNING_PPM: 3000,
    SILT_CRITICAL_PPM: 5000, // Immediate Shutdown

    // Grid (FR-EP-001)
    MIN_FREQ_HZ: 98.2, // ESD Limit
    MAX_OVERSPEED_PCT: 120 // Evacuate
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
