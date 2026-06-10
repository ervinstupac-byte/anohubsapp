/**
 * RedundancyVoting.ts
 * 
 * 2-out-of-3 (2oo3) Voting Logic
 * Increases reliability for critical trips by requiring confirmation.
 * Prevents spurious trips from single sensor failure.
 */

export interface VoteResult {
    tripActive: boolean;
    activeSensors: number; // How many voted TRUE
    validSensors: number; // How many sensors are healthy
    reason: string;
}

export class RedundancyVoting {

    /**
     * VOTE 2oo3
     * Requires at least 2 VALID sensors to cross threshold.
     * If sensor is BAD quality, it is excluded from vote (degraded mode e.g. 1oo2).
     */
    public static vote2oo3(
        s1: { val: number; quality: string; tripPoint: number },
        s2: { val: number; quality: string; tripPoint: number },
        s3: { val: number; quality: string; tripPoint: number }
    ): VoteResult {
        const sensors = [s1, s2, s3];

        // Filter valid sensors
        const validSensors = sensors.filter(s => s.quality !== 'BAD');

        // Count trips
        let tripCount = 0;
        for (const s of validSensors) {
            if (s.val >= s.tripPoint) tripCount++;
        }

        // Determine Logic based on Health
        // 3 Healthy: Need 2
        // 2 Healthy: Need 1? Or still 2? Usually degradation to 2oo2 or 1oo2 safely.
        // Let's implement: Active if Count >= 2.

        let active = false;
        let reason = 'Normal';

        if (validSensors.length === 3) {
            active = tripCount >= 2;
            reason = `2oo3 Voting: ${tripCount}/3 Active`;
        } else if (validSensors.length === 2) {
            // Degraded: 1oo2 for safety? Or 2oo2 for availability?
            // "Safe" direction usually implies 1oo2.
            active = tripCount >= 1;
            reason = `DEGRADED 1oo2 Voting: ${tripCount}/2 Active`;
        } else if (validSensors.length === 1) {
            // Highly degraded: 1oo1
            active = tripCount >= 1;
            reason = `CRITICAL 1oo1 Voting: Single Sensor dependency`;
        } else {
            // 0 Healthy
            active = true; // FAIL SAFE TRIP? Or inhibit?
            // Usually Trip on loss of surveillance
            reason = 'TRIP: LOSS OF ALL SENSORS';
        }

        return {
            tripActive: active,
            activeSensors: tripCount,
            validSensors: validSensors.length,
            reason
        };
    }
}
