import { TelemetrySource } from './TelemetrySource';
import { TelemetryStream } from '../../lib/engines/BaseTurbineEngine';
import { EventEmitter } from 'events';

/**
 * Manual Injection Source
 * Allows the user to manually set telemetry values via the UI.
 * Acts as a bridge between the ManualDataEntry component and the SovereignKernel.
 */
export class ManualInjectionSource implements TelemetrySource {
    private static instance: ManualInjectionSource;
    private dataCallback: ((data: TelemetryStream) => void) | null = null;
    private errorCallback: ((error: Error) => void) | null = null;

    private constructor() {
    }

    public static getInstance(): ManualInjectionSource {
        if (!ManualInjectionSource.instance) {
            ManualInjectionSource.instance = new ManualInjectionSource();
        }
        return ManualInjectionSource.instance;
    }

    async connect(config?: any): Promise<void> {
        console.log('[ManualInjectionSource] Connected and ready for input.');
    }

    async disconnect(): Promise<void> {
        console.log('[ManualInjectionSource] Disconnected.');
    }

    onData(callback: (data: TelemetryStream) => void): void {
        this.dataCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.errorCallback = callback;
    }

    /**
     * Inject a single telemetry packet manually
     */
    public inject(data: TelemetryStream) {
        if (this.dataCallback) {
            this.dataCallback(data);
        } else {
            console.warn('[ManualInjectionSource] No listener registered! Data dropped.');
        }
    }
}
