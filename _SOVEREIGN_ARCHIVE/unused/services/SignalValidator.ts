/**
 * SignalValidator.ts
 * 
 * Sensor Plausibility & Signal Integrity
 * Implements "Rate of Change" (RoC) checks to detect physical impossibilities.
 * Flags sensors as "SUSPECT" if they jump faster than physics allows.
 */

export type SignalQuality = 'GOOD' | 'SUSPECT' | 'BAD';

// Physical limits for rate of change (Units per second)
const ROC_LIMITS: Record<string, number> = {
    'TEMPERATURE_WATER': 2.0, // Water massive thermal inertia, can't jump > 2C/s
    'TEMPERATURE_OIL': 3.0,
    'TEMPERATURE_METAL': 5.0, // Bearing pads can heat fast, but not instantly 100C
    'PRESSURE_HYDRAULIC': 50.0, // High spikes possible
    'PRESSURE_WATER': 20.0,
    'LEVEL_TANK': 1.0, // % per second
    'VIBRATION': 100.0 // Can jump instantly
};

export interface ValidatedSignal {
    value: number;
    quality: SignalQuality;
    lastValue: number;
    lastTime: number;
    roc: number; // Rate of change (units/sec)
}

export class SignalValidator {

    /**
     * VALIDATE SIGNAL ANALOG
     */
    public static validate(
        sensorId: string,
        newValue: number,
        mediumType: string, // e.g. 'TEMPERATURE_WATER'
        history: ValidatedSignal | null
    ): ValidatedSignal {
        const now = Date.now();

        if (!history) {
            return {
                value: newValue,
                quality: 'GOOD',
                lastValue: newValue,
                lastTime: now,
                roc: 0
            };
        }

        const dt = (now - history.lastTime) / 1000;
        if (dt < 0.001) return history; // Ignore fast duplicate reads

        const delta = Math.abs(newValue - history.lastValue);
        const roc = delta / dt;

        const limit = ROC_LIMITS[mediumType] || 10.0; // Default fallback

        // Quality check
        let quality: SignalQuality = 'GOOD';

        // 1. RoC Check
        if (roc > limit) {
            console.warn(`[SignalValidator] ${sensorId} RoC Exceeded: ${roc.toFixed(1)} > ${limit}/s. Value: ${newValue}`);
            quality = 'SUSPECT';
        }

        // 2. Physical Range Check (Basic sanity - usually configured per tag)
        // Here we assume simple range for demonstration
        if (newValue < -50 || newValue > 9999) {
            quality = 'BAD';
        }

        return {
            value: newValue,
            quality,
            lastValue: newValue,
            lastTime: now,
            roc
        };
    }
}
