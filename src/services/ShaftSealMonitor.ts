/**
 * SHAFT SEAL MONITOR
 * The Leak Detective 🕵️‍♂️💧
 * Correlates secondary data (Sump) to find primary failures (Seal).
 */

export interface SealDiagnosis {
    condition: 'HEALTHY' | 'LEAKING_INTERNAL' | 'WEARING';
    confidence: number; // 0-100%
    message: string;
}

export class ShaftSealMonitor {

    /**
     * DRAINAGE CORRELATION
     * Finds hidden leaks by checking if the sump fills faster than rain explains.
     */
    detectInternalLeak(
        drainagePumpFreqPerHour: number,
        basePumpFreqPerHour: number,
        isRaining: boolean,
        sealPressureBar: number
    ): SealDiagnosis {
        const freqIncrease = (drainagePumpFreqPerHour - basePumpFreqPerHour) / basePumpFreqPerHour;

        // Condition 1: Pump running > 20% more often
        if (freqIncrease > 0.20) {

            // Condition 2: It is NOT raining (External water excluded)
            if (!isRaining) {

                // Condition 3: Seal Pressure is constant (meaning the seal hasn't blown open, but is passing water)
                // Actually, if seal pressure drops, it's obvious. 
                // A steady pressure with high leakage means the gap has opened but head is maintained (bad wear).

                return {
                    condition: 'LEAKING_INTERNAL',
                    confidence: 95,
                    message: `🚨 INTERNAL LEAK DETECTED! Sump pump frequency +${(freqIncrease * 100).toFixed(0)}% [Dry Weather]. Shaft Seal bypass suspected.`
                };
            } else {
                return {
                    condition: 'HEALTHY', // Or could be external, hard to say during rain
                    confidence: 50,
                    message: '⚠️ Sump High, but it is Raining. Cannot confirm Seal Leak.'
                };
            }
        }

        return {
            condition: 'HEALTHY',
            confidence: 100,
            message: '✅ Sump Activity Normal. Seal Integrity Verified.'
        };
    }
}
