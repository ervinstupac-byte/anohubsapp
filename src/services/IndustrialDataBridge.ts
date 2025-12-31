/**
 * INDUSTRIAL DATA BRIDGE
 * "The Reality Pipeline"
 * 
 * Responsible for ingesting raw sensor logs, validating signal integrity,
 * and streaming real-world data into the Sentinel Core.
 */

export interface TimeStampedMetric {
    timestamp: number; // Unix Epoch
    values: Record<string, number>; // { vibration: 2.1, temp: 55.4 }
}

export type SignalHealth = 'GOOD' | 'NOISY' | 'FROZEN' | 'GAP_DETECTED';

export class IndustrialDataBridge {

    /**
     * Parses a raw CSV log file into structured TimeStampedMetrics.
     * Assumes format: Timestamp,SensorID,Value OR Timestamp,Vibration,Temp,Pressure...
     */
    static async parseCSV(file: File): Promise<TimeStampedMetric[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                if (!text) return resolve([]);

                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const data: TimeStampedMetric[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    if (cols.length < 2) continue;

                    const values: Record<string, number> = {};
                    let timestamp = Date.now(); // Default if missing

                    headers.forEach((h, index) => {
                        if (h.toLowerCase().includes('time')) {
                            // Try parse time
                            const t = Date.parse(cols[index]);
                            if (!isNaN(t)) timestamp = t;
                        } else {
                            const val = parseFloat(cols[index]);
                            if (!isNaN(val)) values[h] = val;
                        }
                    });

                    data.push({ timestamp, values });
                }
                resolve(data.sort((a, b) => a.timestamp - b.timestamp));
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Evaluates the health of a sensor signal.
     */
    static evaluateSignalHealth(history: number[]): SignalHealth {
        if (!history || history.length < 5) return 'GOOD';

        // Check for Frozen Signal (Repeating values)
        const lastVal = history[history.length - 1];
        const isFrozen = history.slice(-5).every(v => Math.abs(v - lastVal) < 0.0001);
        if (isFrozen) return 'FROZEN';

        // Check for Noise (Extreme variance - simplified)
        // In reality, we'd use FFT SNR, but here we check for instant spikes
        // ...

        return 'GOOD';
    }

    /**
     * Creates a playback stream from historical data.
     * Returns a cleanup function (stop stream).
     */
    static streamData(
        data: TimeStampedMetric[],
        speedMultiplier: number = 1.0,
        onTick: (point: TimeStampedMetric) => void
    ): () => void {
        let currentIndex = 0;
        let isRunning = true;

        const nextTick = () => {
            if (!isRunning || currentIndex >= data.length) return;

            const point = data[currentIndex];
            onTick(point);

            if (currentIndex < data.length - 1) {
                const currentT = point.timestamp;
                const nextT = data[currentIndex + 1].timestamp;
                const delay = (nextT - currentT) / speedMultiplier;

                // Cap delay to avoid waiting hours for gaps in logs during demo
                const effectiveDelay = Math.min(delay, 2000);

                setTimeout(nextTick, Math.max(10, effectiveDelay)); // Min 10ms
            }
            currentIndex++;
        };

        nextTick(); // Start

        return () => { isRunning = false; };
    }
}
