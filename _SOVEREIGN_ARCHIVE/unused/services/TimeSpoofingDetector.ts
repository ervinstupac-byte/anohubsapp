/**
 * TimeSpoofingDetector.ts
 * 
 * GNSS Anti-Spoofing & Rubidium Holdover
 * Cross-checks Satellite Time (GPS/Galileo) against Local Atomic Oscillator.
 * Detects "Time Jumps" or "frequency drift" indicative of spoofing.
 */

export interface TimeSourceStatus {
    gnssTime: number;
    localOscillatorTime: number;
    offsetMs: number;
    spoofingDetected: boolean;
    activeSource: 'GNSS' | 'LOCAL_RUBIDIUM_HOLDOVER';
}

export class TimeSpoofingDetector {
    private static readonly MAX_ALLOWED_OFFSET_MS = 0.005; // 5 microseconds (tight check)

    /**
     * VALIDATE TIME
     */
    public static validateCheck(
        gnssTimestamp: number,
        oscillatorTimestamp: number
    ): TimeSourceStatus {

        const offset = Math.abs(gnssTimestamp - oscillatorTimestamp);
        let valid = true;
        let source: TimeSourceStatus['activeSource'] = 'GNSS';

        // 1. Check consistency
        if (offset > this.MAX_ALLOWED_OFFSET_MS) {
            // GNSS deviated from Atomic Clock -> Likely Spoofing!
            // (Asssuming oscillator is stable short-term)
            valid = false;
            source = 'LOCAL_RUBIDIUM_HOLDOVER';
            console.warn(`[TimeSec] 🛰️ GNSS SPOOFING DETECTED! Offset ${offset}ms. Switching to Rubidium Holdover.`);
        }

        return {
            gnssTime: gnssTimestamp,
            localOscillatorTime: oscillatorTimestamp,
            offsetMs: offset,
            spoofingDetected: !valid,
            activeSource: source
        };
    }
}
