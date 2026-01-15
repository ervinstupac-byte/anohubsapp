export const SYSTEM_CONSTANTS = {
    PHYSICS: {
        WATER: {
            DENSITY: 1000, // kg/m3
            BULK_MODULUS_PA: 2.15e9
        },
        GRAVITY: 9.81,
        PELTON_VIBRATION_FACTOR: 1.1,
        KAPLAN_VIBRATION_FACTOR: 1.05,
        GRID: {
            FREQUENCY_DELTA_TOLERANCE: 0.1,
            NOMINAL_FREQUENCY: 50.0,
            CRITICAL_MIN: 49.5,
            CRITICAL_MAX: 50.5
        }
    },
    THRESHOLDS: {
        LEAKAGE: {
            CRITICAL_MULTIPLIER: 1.10,
            DEGRADING_MULTIPLIER: 1.03
        },
        AXIAL_THRUST: {
            CRITICAL_KN: 250,
            WARNING_KN: 180
        },
        ECCENTRICITY: {
            CRITICAL: 0.85,
            WARNING: 0.75
        },
        SAFETY_FACTOR: {
            CRITICAL: 1.5,
            WARNING: 2.0
        },
        VIBRATION_ISO_10816: {
            GOOD_MAX: 1.1, // mm/s
            SATISFACTORY_MAX: 2.8,
            UNSATISFACTORY_MAX: 4.5
        },
        BEARING_TEMP: {
            NORMAL_MAX: 65, // C
            WARNING_MAX: 80
        },
        THERMAL_AMBIENT: {
            HIGH: 45,
            MEDIUM: 35
        },
        FLOW: {
            CAVITATION_CRITICAL: 42.5
        }
    },
    DURABILITY: {
        DRF_RULE_PERCENT: 0.48, // 48% Rule
        DESIGN_LIFE_YEARS: 50,
        PENALTIES: {
            WATER_CONTENT_YEARS: 3.5,
            TAN_YEARS: 2.5
        },
        LIMITS: {
            WATER_CONTENT_PPM: 500,
            TAN: 0.5,
            HOURS_OVERDUE_MAJOR: 20000,
            HOURS_OVERDUE_MINOR: 15000,
            START_STOP_HIGH_STRESS: 500
        }
    },
    DEFAULTS: {
        RATED_VOLTAGE_KV: 0.4,
        GRID_STRESS_SCALING_MAX: 0.5
    }
} as const;
