/**
 * PLC Signal Types
 * Strict TypeScript interfaces for all PLC signals.
 * Part of the Unified State Machine refactor.
 */

// ==================== SIGNAL QUALITY ====================

/**
 * Signal quality states per IEC 61131-3
 */
export type SignalQuality = 'GOOD' | 'BAD_CONFIG' | 'UNCERTAIN' | 'DISCONNECTED';

/**
 * Connection status for the PLC gateway
 */
export type ConnectionStatus = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';

// ==================== CORE SIGNAL INTERFACE ====================

/**
 * Normalized PLC signal after bridge translation
 */
export interface PLCSignal {
    readonly signalId: string;       // e.g., "Upper_Guide_Bearing_Temp"
    readonly value: number;          // Engineering units value
    readonly unit: string;           // e.g., "degC", "mm/s"
    readonly quality: SignalQuality;
    readonly timestamp: number;      // Unix timestamp ms
}

/**
 * Raw PLC data before normalization
 */
export interface RawPLCData {
    tagAddress: string;    // e.g., "DB100.DBD20"
    rawValue: number;      // e.g., 27648 (Siemens Analog Int)
    timestamp: number;
}

// ==================== TAG CONFIGURATION ====================

/**
 * Tag configuration for scaling raw values to engineering units
 */
export interface TagConfig {
    plcAddress: string;
    signalId: string;
    rawMin: number;
    rawMax: number;
    euMin: number;
    euMax: number;
    unit: string;
    // Engineering thresholds (ISO 10816-5 / API 610)
    thresholds?: {
        warning?: number;
        alarm?: number;
        trip?: number;
    };
}

// ==================== SUBSCRIBER PATTERN ====================

/**
 * Subscriber interface for reactive signal updates
 */
export interface PLCSubscriber {
    /** Called when any subscribed signal updates */
    onSignalUpdate(signal: PLCSignal): void;

    /** Called when connection to PLC is lost */
    onConnectionLost?(): void;

    /** Called when connection is restored */
    onConnectionRestored?(): void;
}

// ==================== HYDRO-SPECIFIC SIGNALS ====================

/**
 * Standard signal IDs for hydropower turbines
 */
export const HYDRO_SIGNAL_IDS = {
    // Mechanical
    UPPER_GUIDE_BEARING_TEMP: 'Upper_Guide_Bearing_Temp',
    LOWER_GUIDE_BEARING_TEMP: 'Lower_Guide_Bearing_Temp',
    THRUST_BEARING_TEMP: 'Thrust_Bearing_Temp',
    VIBRATION_X: 'Turbine_Vibration_X',
    VIBRATION_Y: 'Turbine_Vibration_Y',
    RPM: 'Turbine_RPM',

    // Hydraulic
    HEAD_PRESSURE: 'Head_Pressure',
    FLOW_RATE: 'Flow_Rate',
    GUIDE_VANE_POSITION: 'Guide_Vane_Position',
    DRAFT_TUBE_PRESSURE: 'Draft_Tube_Pressure',

    // Electrical
    STATOR_TEMP: 'Stator_Temperature',
    EXCITATION_CURRENT: 'Excitation_Current',
    GRID_FREQUENCY: 'Grid_Frequency',
    ACTIVE_POWER: 'Active_Power_MW',
    REACTIVE_POWER: 'Reactive_Power_MVAR',
} as const;

export type HydroSignalId = typeof HYDRO_SIGNAL_IDS[keyof typeof HYDRO_SIGNAL_IDS];

// ==================== ENGINEERING THRESHOLDS ====================

/**
 * Field-proven thresholds based on 15+ years of operational data
 * Reference: ISO 10816-5 (Hydropower), API 610 (Rotating Equipment)
 */
export const ENGINEERING_THRESHOLDS = {
    vibration: {
        /** 2x RPM component thresholds (misalignment indicator) */
        '2x_RPM_WARNING': 1.8,   // mm/s - start monitoring
        '2x_RPM_ALARM': 2.8,     // mm/s - schedule inspection
        '2x_RPM_TRIP': 4.5,      // mm/s - immediate shutdown

        /** Overall vibration velocity */
        OVERALL_WARNING: 4.5,    // mm/s RMS
        OVERALL_ALARM: 7.1,      // mm/s RMS
        OVERALL_TRIP: 11.2,      // mm/s RMS
    },
    bearing: {
        /** Temperature rate of change */
        TEMP_RATE_WATCH: 0.3,    // °C/min - watch
        TEMP_RATE_WARNING: 0.6,  // °C/min - warning
        TEMP_RATE_CRITICAL: 1.2, // °C/min - thermal runaway imminent

        /** Absolute temperature */
        TEMP_WARNING: 70,        // °C
        TEMP_ALARM: 80,          // °C
        TEMP_TRIP: 90,           // °C
    },
    hydraulic: {
        /** Efficiency drop from baseline */
        EFFICIENCY_WATCH: 2.0,   // % below baseline
        EFFICIENCY_WARNING: 5.0, // % below baseline
        EFFICIENCY_ALARM: 8.0,   // % below baseline - cavitation likely
    },
    electrical: {
        /** Grid frequency tolerance (50Hz nominal) */
        FREQUENCY_WARNING: 0.5,  // Hz deviation
        FREQUENCY_ALARM: 1.0,    // Hz deviation
        FREQUENCY_TRIP: 2.0,     // Hz deviation
    }
} as const;

// ==================== VIBRATION SPECTRUM ====================

/**
 * FFT frequency peak for vibration analysis
 */
export interface FrequencyPeak {
    frequencyHz: number;
    amplitudeMmS: number;
    phase?: number;      // degrees
    harmonic?: number;   // 1x, 2x, 3x etc.
}

/**
 * Complete vibration spectrum analysis result
 */
export interface VibrationSpectrum {
    timestamp: number;
    rpm: number;
    f0: number;              // Fundamental frequency (RPM/60)
    peaks: FrequencyPeak[];
    overallRMS: number;      // mm/s
    dominantPeak: FrequencyPeak | null;
}
