/**
 * LoopPerformanceMonitor.ts
 * 
 * Control Loop Performance (Governor / AVR)
 * Detects "Hunting" (Limit Cycles) and Performance degradation.
 * Metrics: IAE (Integral Absolute Error), Oscillation Period.
 */

export interface LoopHealth {
    loopName: string;
    iae: number; // Integral Absolute Error
    oscillationDetected: boolean;
    oscillationAmplitude: number;
    healthScore: number; // 0-100
}

export class LoopPerformanceMonitor {
    private static errorSum = 0;
    private static sampleCount = 0;
    private static lastError = 0;
    private static zeroCrossings = 0;

    /**
     * MONITOR LOOP
     * Call periodically (e.g. 1 sec interval)
     */
    public static monitor(
        loopName: string,
        setpoint: number,
        processValue: number
    ): LoopHealth {
        const error = setpoint - processValue;

        // 1. Calculate IAE (Rolling accumulation)
        // Reset periodically or use leaky bucket
        this.errorSum = (this.errorSum * 0.95) + Math.abs(error); // Leaky integrator

        // 2. Detect Hunting (Zero Crossings)
        if ((this.lastError > 0 && error < 0) || (this.lastError < 0 && error > 0)) {
            this.zeroCrossings++;
        }

        // Decay zero crossings (forget old ones)
        // Simple logic: if > 3 crossings in short time -> Hunting
        // We'll reset count every N calls in a real impl, here we assume it's checking rate

        const isHunting = this.zeroCrossings > 5; // Placeholder threshold
        if (Math.random() < 0.1) this.zeroCrossings = 0; // Random decay for mock

        this.lastError = error;

        // 3. Health Score
        // Good loop has low error and low oscillation
        let score = 100;
        if (this.errorSum > 10) score -= 20;
        if (isHunting) score -= 30;

        return {
            loopName,
            iae: this.errorSum,
            oscillationDetected: isHunting,
            oscillationAmplitude: Math.abs(error), // Instant amp
            healthScore: Math.max(0, score)
        };
    }
}
