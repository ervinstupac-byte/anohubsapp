// Black Box Recorder - Millisecond-Level Transient Capture
// Designed to run as a Web Worker for high-performance non-blocking recording

// Types for communication
export type RecorderCommand =
    | { type: 'START' }
    | { type: 'STOP' }
    | { type: 'FREEZE' }
    | { type: 'EXPORT' }
    | { type: 'DATA_POINT', payload: TelemetrySnapshot };

export interface TelemetrySnapshot {
    timestamp: number;
    vibration: number;
    pressure: number;
    temperature: number;
    bladePosition?: number;
    generatorCurrent: number;
    rpm: number;
}

export interface RecorderState {
    isRecording: boolean;
    bufferSize: number;
    triggerCount: number;
    lastTriggerTimestamp: number | null;
}

// Note: In a real Web Worker file, we wouldn't export a class like this directly,
// but rather set up the onmessage handler. For this TypeScript environment, 
// we'll define the logic class that would be instantiated inside the worker.

export class BlackBoxRecorderLogic {
    private ringBuffer: TelemetrySnapshot[] = [];
    private readonly MAX_BUFFER_SIZE = 10000; // 10 seconds @ 1ms (simulated) or 100s @ 10ms
    private isRecording = false;

    // Trigger thresholds (Auto-Freeze)
    private readonly TRIGGERS = {
        vibrationSpike: 12.0, // mm/s
        pressureDropRate: 10.0, // bar/s
        currentSpike: 1.5, // x nominal
    };

    constructor() {
        console.log('📼 Black Box Recorder Initialized');
    }

    processCommand(command: RecorderCommand): any {
        switch (command.type) {
            case 'START':
                this.isRecording = true;
                return { status: 'STARTED' };

            case 'STOP':
                this.isRecording = false;
                return { status: 'STOPPED' };

            case 'FREEZE':
                this.isRecording = false;
                return { status: 'FROZEN', reason: 'Manual Trigger' };

            case 'EXPORT':
                return this.exportData();

            case 'DATA_POINT':
                if (this.isRecording) {
                    this.recordPoint(command.payload);
                }
                return null;
        }
    }

    private recordPoint(data: TelemetrySnapshot) {
        // Add timestamp if missing (high precision)
        const point = {
            ...data,
            timestamp: data.timestamp || performance.now()
        };

        // Ring buffer logic
        if (this.ringBuffer.length >= this.MAX_BUFFER_SIZE) {
            this.ringBuffer.shift(); // Remove oldest
        }
        this.ringBuffer.push(point);

        // Check triggers
        this.checkTriggers(point);
    }

    private checkTriggers(data: TelemetrySnapshot) {
        // Check previous point for rate calculation
        const prev = this.ringBuffer[this.ringBuffer.length - 2];
        if (!prev) return;

        // 1. Vibration Spike
        if (data.vibration > this.TRIGGERS.vibrationSpike) {
            this.triggerFreeze('CRITICAL_VIBRATION', data.vibration);
        }

        // 2. Pressure Drop Rate
        const dt = (data.timestamp - prev.timestamp) / 1000; // seconds
        if (dt > 0) {
            const dp = Math.abs(data.pressure - prev.pressure);
            const rate = dp / dt;

            if (rate > this.TRIGGERS.pressureDropRate) {
                this.triggerFreeze('RAPID_PRESSURE_DROP', rate);
            }
        }
    }

    private triggerFreeze(reason: string, value: number) {
        // Stop recording but keep the buffer (post-trigger data logic would go here)
        // For simplicity, we freeze immediately to preserve the event context
        this.isRecording = false;

        // Notify main thread (simulated)
        self.postMessage({
            type: 'TRIGGER_ACTIVATED',
            payload: { reason, value, timestamp: Date.now() }
        });
    }

    private exportData() {
        // Generate CSV or JSON
        return {
            type: 'EXPORT_READY',
            payload: this.ringBuffer
        };
    }
}

// Worker Entry Point (mocked for file structure)
/*
const recorder = new BlackBoxRecorderLogic();
self.onmessage = (e) => {
    const result = recorder.processCommand(e.data);
    if (result) self.postMessage(result);
};
*/
