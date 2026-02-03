/**
 * CIRCULAR BUFFER
 * Fixed-size buffer for historical signal data.
 * Used for sparklines, trends, and 24h historical views.
 */

export interface BufferedDataPoint<T> {
    value: T;
    timestamp: number;
}

export class CircularBuffer<T> {
    private buffer: BufferedDataPoint<T>[];
    private pointer: number = 0;
    private count: number = 0;
    readonly capacity: number;

    constructor(capacity: number = 50) {
        this.capacity = capacity;
        this.buffer = new Array(capacity);
    }

    /**
     * Add a new data point to the buffer
     */
    push(value: T): void {
        this.buffer[this.pointer] = {
            value,
            timestamp: Date.now()
        };
        this.pointer = (this.pointer + 1) % this.capacity;
        if (this.count < this.capacity) {
            this.count++;
        }
    }

    /**
     * Get all buffered data points in chronological order
     */
    getAll(): BufferedDataPoint<T>[] {
        if (this.count === 0) return [];

        const result: BufferedDataPoint<T>[] = [];
        const start = this.count < this.capacity ? 0 : this.pointer;

        for (let i = 0; i < this.count; i++) {
            const index = (start + i) % this.capacity;
            result.push(this.buffer[index]);
        }

        return result;
    }

    /**
     * Get just the values in chronological order
     */
    getValues(): T[] {
        return this.getAll().map(dp => dp.value);
    }

    /**
     * Get the most recent N data points
     */
    getLast(n: number): BufferedDataPoint<T>[] {
        const all = this.getAll();
        return all.slice(-n);
    }

    /**
     * Get the most recent value
     */
    getLatest(): BufferedDataPoint<T> | undefined {
        if (this.count === 0) return undefined;
        const lastIndex = (this.pointer - 1 + this.capacity) % this.capacity;
        return this.buffer[lastIndex];
    }

    /**
     * Get min/max/avg for numeric buffers
     */
    getStats(): { min: number; max: number; avg: number } | null {
        const values = this.getValues() as unknown as number[];
        if (values.length === 0 || typeof values[0] !== 'number') return null;

        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        return { min, max, avg };
    }

    /**
     * Serialize buffer for persistence
     */
    toJSON(): BufferedDataPoint<T>[] {
        return this.getAll();
    }

    /**
     * Restore buffer from serialized data
     */
    static fromJSON<T>(data: BufferedDataPoint<T>[], capacity: number = 50): CircularBuffer<T> {
        const buffer = new CircularBuffer<T>(capacity);
        // Only restore up to capacity
        const toRestore = data.slice(-capacity);
        toRestore.forEach(dp => {
            buffer.buffer[buffer.pointer] = dp;
            buffer.pointer = (buffer.pointer + 1) % buffer.capacity;
            if (buffer.count < buffer.capacity) {
                buffer.count++;
            }
        });
        return buffer;
    }

    /**
     * Current number of items in buffer
     */
    get size(): number {
        return this.count;
    }

    /**
     * Clear all data
     */
    clear(): void {
        this.buffer = new Array(this.capacity);
        this.pointer = 0;
        this.count = 0;
    }
}

// ==================== SIGNAL BUFFER MANAGER ====================

/**
 * Manages multiple circular buffers for different signals
 */
export class SignalBufferManager {
    private buffers: Map<string, CircularBuffer<number>> = new Map();
    private defaultCapacity: number;

    constructor(capacity: number = 50) {
        this.defaultCapacity = capacity;
    }

    /**
     * Record a signal value
     */
    record(signalId: string, value: number): void {
        if (!this.buffers.has(signalId)) {
            this.buffers.set(signalId, new CircularBuffer<number>(this.defaultCapacity));
        }
        this.buffers.get(signalId)!.push(value);
    }

    /**
     * Get buffer for a specific signal
     */
    getBuffer(signalId: string): CircularBuffer<number> | undefined {
        return this.buffers.get(signalId);
    }

    /**
     * Get sparkline data for a signal (just values)
     */
    getSparklineData(signalId: string): number[] {
        return this.buffers.get(signalId)?.getValues() ?? [];
    }

    /**
     * Serialize all buffers
     */
    toJSON(): Record<string, BufferedDataPoint<number>[]> {
        const result: Record<string, BufferedDataPoint<number>[]> = {};
        this.buffers.forEach((buffer, key) => {
            result[key] = buffer.toJSON();
        });
        return result;
    }

    /**
     * Restore from serialized data
     */
    static fromJSON(data: Record<string, BufferedDataPoint<number>[]>, capacity: number = 50): SignalBufferManager {
        const manager = new SignalBufferManager(capacity);
        Object.entries(data).forEach(([key, bufferData]) => {
            manager.buffers.set(key, CircularBuffer.fromJSON(bufferData, capacity));
        });
        return manager;
    }
}
