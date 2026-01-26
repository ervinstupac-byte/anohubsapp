/**
 * LoadRejectionAnalyser.ts
 * 
 * High-Speed Event Recorder & Analyzer
 * Triggered by Breaker Open events at load.
 * Captures 1ms resolution data buffer to verify transient performance:
 * - Peak Overspeed (% of rated)
 * - Peak Penstock Pressure (Water Hammer)
 * - Settling Time (Return to steady state)
 */

export interface RejectionEvent {
    timestamp: number;
    initialLoadMW: number;
    peakSpeedPct: number;
    peakPressureBar: number;
    settlingTimeSec: number;
    passed: boolean;
    limits: {
        maxSpeed: number;
        maxPressure: number;
        maxSettling: number;
    };
}

export class LoadRejectionAnalyser {
    private static bufferSize = 1000; // 1 second pre-trigger
    private static buffer: { t: number; speed: number; pressure: number }[] = [];
    private static recording = false;
    private static eventData: { t: number; speed: number; pressure: number }[] = [];

    // Limits
    private static readonly MAX_OVERSPEED = 135.0; // %
    private static readonly MAX_PRESSURE = 145.0; // % of rated
    private static readonly MAX_SETTLING_TIME = 40.0; // seconds

    /**
     * PROCESS TICK (1ms - Simulated logic)
     * Keeps a rolling buffer. Triggers recording on trip.
     */
    public static logTick(
        speedPct: number,
        pressureBar: number,
        breakerOpen: boolean,
        loadMW: number
    ): RejectionEvent | null {
        const now = Date.now();

        // Rolling buffer
        this.buffer.push({ t: now, speed: speedPct, pressure: pressureBar });
        if (this.buffer.length > this.bufferSize) this.buffer.shift();

        // Trigger Logic
        if (!this.recording && breakerOpen && loadMW > 5.0) {
            console.log('[LoadRejection] 📸 TRIGGERED: Breaker Opening at Load!');
            this.recording = true;
            this.eventData = [...this.buffer]; // Save pre-trigger
        }

        if (this.recording) {
            this.eventData.push({ t: now, speed: speedPct, pressure: pressureBar });

            // Stop condition: 60 seconds elapsed
            const duration = (now - this.eventData[0].t) / 1000;
            if (duration > 60) {
                this.recording = false;
                return this.analyze();
            }
        }

        return null; // No result yet
    }

    private static analyze(): RejectionEvent {
        console.log('[LoadRejection] Analyzing event data...');

        // Find Peaks
        let maxSpeed = 0;
        let maxPressure = 0;

        for (const pt of this.eventData) {
            if (pt.speed > maxSpeed) maxSpeed = pt.speed;
            if (pt.pressure > maxPressure) maxPressure = pt.pressure;
        }

        // Settling Time: Time to stay within +/- 1% of 100% speed (or whatever steady state)
        // Settling Time: Time from trigger to last point where speed was OUTSIDE band
        let lastOutsideIndex = -1;
        for (let i = this.eventData.length - 1; i >= 0; i--) {
            if (Math.abs(this.eventData[i].speed - 100) > 1.0) {
                lastOutsideIndex = i;
                break;
            }
        }
        const startTime = this.eventData[0].t;
        const settleTime = lastOutsideIndex > 0 ? (this.eventData[lastOutsideIndex].t - startTime) / 1000 : 0;

        const passed = maxSpeed < this.MAX_OVERSPEED &&
            maxPressure < this.MAX_PRESSURE &&
            settleTime < this.MAX_SETTLING_TIME;

        return {
            timestamp: startTime,
            initialLoadMW: 0, // Need to capture this at trigger, simplified here
            peakSpeedPct: maxSpeed,
            peakPressureBar: maxPressure,
            settlingTimeSec: settleTime,
            passed,
            limits: {
                maxSpeed: this.MAX_OVERSPEED,
                maxPressure: this.MAX_PRESSURE,
                maxSettling: this.MAX_SETTLING_TIME
            }
        };
    }
}
