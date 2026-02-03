/**
 * SIGNAL FILTER
 * Simple Moving Average (SMA) filter for PLC signal jitter reduction.
 * Provides "Smooth Mode" for UI and "Raw Mode" for RCA Engine.
 */

export interface FilteredSignal {
    raw: number;      // Original value from PLC
    smooth: number;   // SMA-filtered value for UI gauges
    timestamp: number;
}

/**
 * 5-point Simple Moving Average filter for signal stabilization
 */
export class SMAFilter {
    private window: number[] = [];
    readonly windowSize: number;

    constructor(windowSize: number = 5) {
        this.windowSize = windowSize;
    }

    /**
     * Apply filter to a new value
     * @returns FilteredSignal with both raw and smoothed values
     */
    filter(rawValue: number): FilteredSignal {
        // Add to window
        this.window.push(rawValue);

        // Trim to window size
        if (this.window.length > this.windowSize) {
            this.window.shift();
        }

        // Calculate SMA
        const smooth = this.window.length > 0
            ? this.window.reduce((a, b) => a + b, 0) / this.window.length
            : rawValue;

        return {
            raw: rawValue,
            smooth: parseFloat(smooth.toFixed(3)),
            timestamp: Date.now()
        };
    }

    /**
     * Get current smoothed value without adding new data
     */
    getSmooth(): number {
        if (this.window.length === 0) return 0;
        return this.window.reduce((a, b) => a + b, 0) / this.window.length;
    }

    /**
     * Reset filter state
     */
    reset(): void {
        this.window = [];
    }

    /**
     * Check if filter has enough data for reliable smoothing
     */
    isWarmedUp(): boolean {
        return this.window.length >= this.windowSize;
    }
}

/**
 * Filter type selection for UI toggle
 */
export type FilterType = 'SMA' | 'EMA' | 'NONE';

/**
 * Exponential Moving Average filter for faster response
 * EMA = α * current + (1-α) * previous
 * Lower α = more smoothing, higher α = more responsive
 */
export class EMAFilter {
    private alpha: number;
    private lastSmooth: number | null = null;

    constructor(alpha: number = 0.3) {
        this.alpha = Math.max(0.01, Math.min(1.0, alpha));  // Clamp 0.01-1.0
    }

    /**
     * Apply filter to a new value
     * @returns FilteredSignal with both raw and smoothed values
     */
    filter(rawValue: number): FilteredSignal {
        const smooth = this.lastSmooth === null
            ? rawValue
            : this.alpha * rawValue + (1 - this.alpha) * this.lastSmooth;

        this.lastSmooth = smooth;

        return {
            raw: rawValue,
            smooth: parseFloat(smooth.toFixed(3)),
            timestamp: Date.now()
        };
    }

    /**
     * Get current smoothed value without adding new data
     */
    getSmooth(): number {
        return this.lastSmooth ?? 0;
    }

    /**
     * Reset filter state
     */
    reset(): void {
        this.lastSmooth = null;
    }

    /**
     * Check if filter has been primed with data
     */
    isWarmedUp(): boolean {
        return this.lastSmooth !== null;
    }
}

/**
 * Manages SMA filters for multiple signals
 */
export class SignalFilterManager {
    private filters: Map<string, SMAFilter> = new Map();
    private windowSize: number;

    constructor(windowSize: number = 5) {
        this.windowSize = windowSize;
    }

    /**
     * Filter a signal value
     */
    filter(signalId: string, rawValue: number): FilteredSignal {
        if (!this.filters.has(signalId)) {
            this.filters.set(signalId, new SMAFilter(this.windowSize));
        }
        return this.filters.get(signalId)!.filter(rawValue);
    }

    /**
     * Get smooth value for a signal
     */
    getSmooth(signalId: string): number {
        return this.filters.get(signalId)?.getSmooth() ?? 0;
    }

    /**
     * Reset a specific filter
     */
    reset(signalId: string): void {
        this.filters.get(signalId)?.reset();
    }

    /**
     * Reset all filters
     */
    resetAll(): void {
        this.filters.forEach(f => f.reset());
    }
}

/**
 * Signals that should be filtered for UI display
 */
export const JITTER_FILTERED_SIGNALS = [
    'Turbine_Vibration_X',
    'Turbine_Vibration_Y',
    'Upper_Guide_Bearing_Temp',
    'Lower_Guide_Bearing_Temp',
    'Thrust_Bearing_Temp',
    'Head_Pressure'
] as const;
