// src/config/IndustrialStandards.ts
export const TURBINE_LIMITS = {
    FRANCIS_5MW: {
        RPM: { nominal: 600, overspeed: 840, trip: 900 }, // 10-pole sync speed
        BEARING_TEMP_C: { normal: 60, alarm: 75, trip: 85 }, // Babbitt metal limits
        VIBRATION_ISO_MMS: { zone_A: 2.5, zone_B: 3.5, zone_C: 7.1, trip: 11.0 }, // ISO 10816-5
        OIL_PRESSURE_BAR: { nominal: 40, low_alarm: 35, low_trip: 28 }, // HPU standards
    },
    GENERATOR_CLASS_F: {
        STATOR_TEMP_C: { normal: 90, alarm: 120, trip: 130 },
        ROTOR_TEMP_C: { normal: 85, alarm: 115, trip: 125 },
        VOLTAGE_KV: { nominal: 6.3, min: 5.7, max: 6.9 }
    },
    HYDRAULICS: {
        PENSTOCK_PRESSURE_BAR: { nominal: 12, max_surge: 16 }, // Water hammer limit
        HEAD_LEVEL_M: { min: 110, max: 130 }
    }
} as const;

export type MachineState = 'STOPPED' | 'STARTING' | 'SYNCING' | 'ONLINE' | 'TRIPPED';
