/**
 * LiveStreamConnector.ts
 * 
 * Production Live Stream Integration
 * Replaces all simulated telemetry with real-time data from SCADA/PLC systems
 * Refactored to use Pluggable Telemetry Sources (NC-Upgrade)
 */

import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';
import { SovereignKernel } from './SovereignKernel';
import { TelemetrySource } from './telemetry/TelemetrySource';
import { SimulationSource } from './telemetry/SimulationSource';
import { WebSocketSource } from './telemetry/WebSocketSource';
import { ManualInjectionSource } from './telemetry/ManualInjectionSource';

export enum ConnectionStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR'
}

export interface LiveStreamConfig {
    websocketUrl?: string;
    pollingUrl?: string;
    pollingInterval?: number; // ms
    reconnectDelay?: number; // ms
    forceSimulation?: boolean;
    manualMode?: boolean; // NEW: Forces Manual Injection
}

import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

export class LiveStreamConnector {
    private static source: TelemetrySource | null = null;
    private static status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    private static config: LiveStreamConfig = {
        websocketUrl: import.meta.env.VITE_TELEMETRY_WS_URL,
        pollingUrl: import.meta.env.VITE_TELEMETRY_API_URL,
        pollingInterval: 1000,
        reconnectDelay: 5000,
        forceSimulation: false,
        manualMode: false
    };

    /**
     * Initialize live stream connection
     */
    public static async connect(config?: Partial<LiveStreamConfig>): Promise<void> {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        // Disconnect existing source if any
        if (this.source) {
            await this.source.disconnect();
        }

        this.status = ConnectionStatus.CONNECTING;

        // Select Source Strategy
        if (this.config.manualMode) {
            console.log('[LiveStream] 🛡️ MANUAL INJECTION MODE ACTIVE');
            this.source = ManualInjectionSource.getInstance();
            await this.source.connect();
        } else if (this.config.forceSimulation || (!this.config.websocketUrl && !this.config.pollingUrl)) {
            console.log('[LiveStream] Using Simulation Source');
            this.source = new SimulationSource();
            await this.source.connect({ interval: 100 });
        } else if (this.config.websocketUrl && this.config.websocketUrl !== 'undefined') {
            console.log('[LiveStream] Using WebSocket Source');
            this.source = new WebSocketSource();
            await this.source.connect({ 
                url: this.config.websocketUrl,
                reconnectDelay: this.config.reconnectDelay 
            });
        } else {
            console.log('[LiveStream] No valid real-time source, falling back to Simulation');
            this.source = new SimulationSource();
            await this.source.connect({ interval: 100 });
        }

        // Bind Callbacks
        if (this.source) {
            this.source.onData(async (telemetry) => {
                if (this.validateTelemetry(telemetry)) {
                    this.status = ConnectionStatus.CONNECTED;
                    const enriched = await SovereignKernel.react(telemetry);
                    
                    // Update the store!
                    useTelemetryStore.getState().updateTelemetry({
                        hydraulic: enriched.hydraulic,
                        mechanical: enriched.mechanical,
                        physics: enriched.physics,
                        identity: enriched.identity
                    });
                }
            });

            this.source.onError((err) => {
                console.error('[LiveStream] Source Error:', err);
                this.status = ConnectionStatus.ERROR;
            });
        }
    }

    /**
     * Validate incoming telemetry
     */
    private static validateTelemetry(telemetry: TelemetryStream): boolean {
        if (!telemetry || !telemetry.timestamp) {
            // console.warn('[LiveStream] Invalid telemetry: missing timestamp');
            return false;
        }

        // Additional validation
        const age = Date.now() - telemetry.timestamp;
        if (age > 60000) { // Reject data older than 60s
            // console.warn('[LiveStream] Stale telemetry rejected');
            return false;
        }

        return true;
    }

    /**
     * Disconnect stream
     */
    public static async disconnect(): Promise<void> {
        if (this.source) {
            await this.source.disconnect();
            this.source = null;
        }
        this.status = ConnectionStatus.DISCONNECTED;
        console.log('[LiveStream] Disconnected');
    }

    /**
     * Get connection status
     */
    public static getStatus(): ConnectionStatus {
        return this.status;
    }
}
