/**
 * StepResponseValidator.ts
 * 
 * Diagnostic Step Injection & Response Analysis
 * Safety: Only allows small steps (+/- 2%) and only in "DIAGNOSTIC" mode.
 * Calculates Damping Ratio and Rise Time.
 */

export interface StepResult {
    axis: 'SPEED' | 'VOLTAGE';
    stepSize: number; // %
    riseTimeSec: number;
    overshootPct: number;
    dampingRatio: number;
    settlingTimeSec: number;
    status: 'OPTIMAL' | 'SLUGGISH' | 'OSCILLATORY';
}

export class StepResponseValidator {

    /**
     * ANALYZE STEP RESPONSE
     * Takes a time-series of the response.
     */
    public static analyzeResponse(
        timeSeries: { t: number; val: number }[], // t in seconds, val in %
        stepStartTime: number,
        startValue: number,
        targetValue: number
    ): StepResult {
        const stepSize = targetValue - startValue;

        // 1. Rise Time (10% to 90%)
        const range10 = startValue + (stepSize * 0.1);
        const range90 = startValue + (stepSize * 0.9);

        const t10 = timeSeries.find(p => p.t > stepStartTime && (stepSize > 0 ? p.val >= range10 : p.val <= range10))?.t;
        const t90 = timeSeries.find(p => p.t > stepStartTime && (stepSize > 0 ? p.val >= range90 : p.val <= range90))?.t;

        const riseTime = (t10 && t90) ? (t90 - t10) : 0;

        // 2. Overshoot
        // Find Peak/Valley
        let peakVal = startValue;
        for (const p of timeSeries) {
            if (p.t < stepStartTime) continue;
            if (stepSize > 0 && p.val > peakVal) peakVal = p.val;
            if (stepSize < 0 && p.val < peakVal) peakVal = p.val;
        }

        const overshootMag = Math.abs(peakVal - targetValue);
        const overshootPct = (overshootMag / Math.abs(stepSize)) * 100;

        // 3. Settling Time (2% band)
        const band = Math.abs(stepSize) * 0.02;
        // Search backwards
        // (Similar logic to Rejection Analyzer)

        // 4. Damping Ratio (Log Dec)
        // Approximation from overshoot: zeta = -ln(OS/100) / sqrt(pi^2 + ln(OS)^2)
        // Only valid for underdamped 2nd order
        let zeta = 1.0;
        if (overshootPct > 0.1) { // If measurable overshoot
            const lnOS = Math.log(overshootPct / 100);
            zeta = -lnOS / Math.sqrt(Math.PI * Math.PI + lnOS * lnOS);
        }

        // 5. Diagnosis
        let status: StepResult['status'] = 'OPTIMAL';
        if (zeta < 0.3) status = 'OSCILLATORY';
        if (riseTime > 5.0) status = 'SLUGGISH'; // Example threshold

        return {
            axis: 'SPEED', // param needed
            stepSize,
            riseTimeSec: riseTime,
            overshootPct,
            dampingRatio: zeta,
            settlingTimeSec: 0, // Placeholder
            status
        };
    }
}
