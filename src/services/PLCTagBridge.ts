/**
 * PLC TAG BRIDGE
 * The Translation Layer 🔌
 * Maps raw PLC addresses to normalized engineering units.
 */

export interface RawPLCData {
    tagAddress: string; // e.g., "DB100.DBD20"
    rawValue: number;   // e.g., 27648 (Siemens Analog Int)
    timestamp: number;
}

export interface UnifiedSignal {
    signalId: string;   // e.g., "Upper_Guide_Bearing_Temp"
    value: number;      // e.g., 45.2
    unit: string;       // e.g., "degC"
    quality: 'GOOD' | 'BAD_CONFIG' | 'UNCERTAIN';
}

export interface TagConfig {
    plcAddress: string;
    signalId: string;
    rawMin: number;
    rawMax: number;
    euMin: number;
    euMax: number;
    unit: string;
}

export class PLCTagBridge {
    private tagMap: Map<string, TagConfig> = new Map();

    constructor() {
        // Initialize with sample mapping
        this.registerTag({
            plcAddress: 'DB100.DBD20',
            signalId: 'Upper_Guide_Bearing_Temp',
            rawMin: 0, rawMax: 27648,
            euMin: 0, euMax: 150,
            unit: 'degC'
        });
        this.registerTag({
            plcAddress: '%IW512',
            signalId: 'Turbine_Vibration_X',
            rawMin: 0, rawMax: 27648,
            euMin: 0, euMax: 10, // mm/s
            unit: 'mm/s'
        });
    }

    registerTag(config: TagConfig) {
        this.tagMap.set(config.plcAddress, config);
    }

    /**
     * NORMALIZE SIGNAL
     * Converts raw integer counts to engineering float.
     */
    normalize(input: RawPLCData): UnifiedSignal {
        const config = this.tagMap.get(input.tagAddress);

        if (!config) {
            return {
                signalId: `UNKNOWN_${input.tagAddress}`,
                value: 0,
                unit: '?',
                quality: 'BAD_CONFIG'
            };
        }

        // Linear Scaling Equation: Y = (X - RawMin) * (EuRange / RawRange) + EuMin
        const rawRange = config.rawMax - config.rawMin;
        const euRange = config.euMax - config.euMin;

        let normalized = ((input.rawValue - config.rawMin) * (euRange / rawRange)) + config.euMin;

        // Clamp logic can be added here, for now raw math
        return {
            signalId: config.signalId,
            value: parseFloat(normalized.toFixed(2)),
            unit: config.unit,
            quality: 'GOOD'
        };
    }
}
