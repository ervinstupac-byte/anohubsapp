/**
 * WATER HAMMER MONITOR
 * The Ear of the Pipe 🌊👂
 * Detects dangerous pressure transients in the spiral case.
 */

export interface HammerEvent {
    timestamp: Date;
    peakPressureBar: number;
    riseRateBarPerSec: number; // dP/dt
    severity: 'NORMAL' | 'NOTICE' | 'WARNING' | 'CRITICAL';
    message: string;
}

export class WaterHammerMonitor {
    private readonly MAX_DESIGN_PRESSURE = 15.0; // Bar (Static Head + Surge)
    private readonly MAX_RISE_RATE = 2.0; // Bar/sec (Valve closure limit)
    private lastPressure: number = 0;
    private lastTime: number = Date.now();

    /**
     * CHECK FOR TRANSIENTS
     * Called on high-speed Tick (e.g. 100ms)
     */
    checkPressure(currentPressureBar: number, gateMovement: boolean): HammerEvent {
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000; // seconds

        let event: HammerEvent = {
            timestamp: new Date(),
            peakPressureBar: currentPressureBar,
            riseRateBarPerSec: 0,
            severity: 'NORMAL',
            message: 'Pressure stable'
        };

        if (dt > 0) {
            const dP = currentPressureBar - this.lastPressure;
            const rate = Math.abs(dP / dt);
            event.riseRateBarPerSec = rate;

            // 1. Check Rate of Rise (Water Hammer)
            if (rate > this.MAX_RISE_RATE) {
                event.severity = 'CRITICAL';
                event.message = `🌊 WATER HAMMER: Pressure spiked at ${rate.toFixed(1)} bar/s! (Limit: ${this.MAX_RISE_RATE})`;
            }
            else if (rate > this.MAX_RISE_RATE * 0.5) {
                event.severity = 'WARNING';
                event.message = `🌊 SURGE: Rapid pressure rise detected (${rate.toFixed(1)} bar/s).`;
            }

            // 2. Check Absolute Limits
            if (currentPressureBar > this.MAX_DESIGN_PRESSURE) {
                event.severity = 'CRITICAL';
                event.message += ` 💥 OVER-PRESSURE: ${currentPressureBar.toFixed(1)} bar > Design Limit!`;
            }
        }

        this.lastPressure = currentPressureBar;
        this.lastTime = now;
        return event;
    }
}
