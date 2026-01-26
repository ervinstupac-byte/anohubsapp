/**
 * ASSET THRESHOLDS CONFIGURATION
 * 
 * Centralized configuration for all diagnostic thresholds and limits.
 * This file can be loaded from an external API or JSON in the future
 * without modifying core physics logic.
 * 
 * Standards Referenced:
 * - ISO 10816-3 (Vibration Severity)
 * - Megger Standard (Insulation Resistance)
 * - IEC 60041 (Hydraulic Performance)
 */

export interface AssetThresholds {
    vibration: {
        iso10816: {
            good_max: number;          // mm/s
            satisfactory_max: number;  // mm/s
            unsatisfactory_max: number; // mm/s
            // Above unsatisfactory_max is "Unacceptable"
        };
    };

    bearing: {
        temperature: {
            normal_max: number;   // °C
            warning_max: number;  // °C
            // Above warning_max is "Critical"
        };
    };

    insulation: {
        megger: {
            golden_standard_min: number; // MΩ (from golden standards)
            // minAcceptable calculated as: ratedVoltageKV + 1
        };
    };

    axial: {
        play: {
            nominal_max_factor: number;  // Multiplier of golden standard
            warning_max_factor: number;  // Multiplier for warning threshold
            // Above warning is "Critical"
        };
    };

    structural: {
        fatigue: {
            water_hammer_cycle_increment: number;
            water_hammer_wear_multiplier: number;
            grid_loss_cycle_increment: number;
            grid_loss_wear_multiplier: number;
        };
        life: {
            yearly_wear_baseline_percent: number; // 100 / designLifeYears
            max_wear_multiplier: number; // Up to 5x faster wear at worst DRF
            design_life_years: number;
        };
    };

    maintenance: {
        urgency: {
            // Vibration scoring
            vibration_unacceptable_score: number;  // Level 5
            vibration_unsatisfactory_score: number; // Level 4
            vibration_satisfactory_score: number;   // Level 2

            // Temperature scoring
            temperature_critical_score: number;     // Level 5
            temperature_warning_score: number;      // Level 3

            // Insulation scoring
            insulation_critical_score: number;      // Level 5
            insulation_degraded_score: number;      // Level 3

            // Operational hours scoring
            hours_major_overdue_score: number;      // Level 4
            hours_minor_overdue_score: number;      // Level 3

            // Start/stop cycling scoring
            start_stop_high_stress_score: number;   // Level 3
        };
    };

    diagnostics: {
        thermal: {
            ambient_high: number;    // °C
            ambient_medium: number;  // °C
        };
    };
}

/**
 * DEFAULT ASSET THRESHOLDS
 * Based on international standards and engineering best practices
 * for Francis turbines < 5MW (can be extended to other types)
 */
export const DEFAULT_ASSET_THRESHOLDS: AssetThresholds = {
    vibration: {
        iso10816: {
            good_max: 1.1,
            satisfactory_max: 2.8,
            unsatisfactory_max: 4.5
        }
    },

    bearing: {
        temperature: {
            normal_max: 65,
            warning_max: 80
        }
    },

    insulation: {
        megger: {
            golden_standard_min: 100  // MΩ (from MasterKnowledgeMap)
        }
    },

    axial: {
        play: {
            nominal_max_factor: 1.0,  // At golden standard
            warning_max_factor: 2.0    // 2x golden standard
        }
    },

    structural: {
        fatigue: {
            water_hammer_cycle_increment: 25,
            water_hammer_wear_multiplier: 0.05,
            grid_loss_cycle_increment: 10,
            grid_loss_wear_multiplier: 0.02
        },
        life: {
            yearly_wear_baseline_percent: 2.0, // 100 / 50 years
            max_wear_multiplier: 5.0,
            design_life_years: 50
        }
    },

    maintenance: {
        urgency: {
            vibration_unacceptable_score: 5,
            vibration_unsatisfactory_score: 4,
            vibration_satisfactory_score: 2,

            temperature_critical_score: 5,
            temperature_warning_score: 3,

            insulation_critical_score: 5,
            insulation_degraded_score: 3,

            hours_major_overdue_score: 4,
            hours_minor_overdue_score: 3,

            start_stop_high_stress_score: 3
        }
    },

    diagnostics: {
        thermal: {
            ambient_high: 45,
            ambient_medium: 35
        }
    }
};

/**
 * Load thresholds from external source (API, JSON file, etc.)
 * Falls back to defaults if loading fails
 */
export const loadAssetThresholds = async (): Promise<AssetThresholds> => {
    // Future implementation: fetch from API or load from JSON
    // try {
    //     const response = await fetch('/api/asset-thresholds');
    //     return await response.json();
    // } catch (error) {
    //     console.warn('Failed to load asset thresholds, using defaults');
    //     return DEFAULT_ASSET_THRESHOLDS;
    // }

    return DEFAULT_ASSET_THRESHOLDS;
};

/**
 * Current active thresholds (can be swapped at runtime)
 */
export let ASSET_THRESHOLDS: AssetThresholds = DEFAULT_ASSET_THRESHOLDS;

/**
 * Override thresholds (for testing or custom configurations)
 */
export const setAssetThresholds = (thresholds: Partial<AssetThresholds>): void => {
    ASSET_THRESHOLDS = {
        ...DEFAULT_ASSET_THRESHOLDS,
        ...thresholds
    };
};
