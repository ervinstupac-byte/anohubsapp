/**
 * LiveStreamConnector.ts
 * 
 * Production Live Stream Integration
 * Replaces all simulated telemetry with real-time data from SCADA/PLC systems
 */

import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';
import { SovereignKernel } from './SovereignKernel';

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
}

export class LiveStreamConnector {
    private static ws: WebSocket | null = null;
    private static pollingInterval: NodeJS.Timeout | null = null;
    private static status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    private static config: LiveStreamConfig = {
        websocketUrl: import.meta.env.VITE_TELEMETRY_WS_URL,
        pollingUrl: import.meta.env.VITE_TELEMETRY_API_URL,
        pollingInterval: 1000,
        reconnectDelay: 5000
    };

    /**
     * Initialize live stream connection
     */
    public static async connect(config?: Partial<LiveStreamConfig>): Promise<void> {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        // Try WebSocket first (preferred for low latency)
        if (this.config.websocketUrl && this.config.websocketUrl !== 'undefined') {
            await this.connectWebSocket();
        }
        // Fallback to polling
        else if (this.config.pollingUrl && this.config.pollingUrl !== 'undefined') {
            this.startPolling();
        } else {
            console.log('[LiveStream] No telemetry source configured - Simulation Mode Active');
        }
    }

    /**
     * WebSocket connection (real-time, low latency)
     */
    private static async connectWebSocket(): Promise<void> {
        if (!this.config.websocketUrl) return;
        this.status = ConnectionStatus.CONNECTING;

        try {
            this.ws = new WebSocket(this.config.websocketUrl);

            this.ws.onopen = () => {
                this.status = ConnectionStatus.CONNECTED;
                console.log('[LiveStream] ✅ WebSocket connected');
            };

            this.ws.onmessage = async (event) => {
                try {
                    const telemetry: TelemetryStream = JSON.parse(event.data);

                    // Validate telemetry
                    if (this.validateTelemetry(telemetry)) {
                        // Feed directly into SovereignKernel (reactive pipeline)
                        await SovereignKernel.react(telemetry);
                    }
                } catch (err) {
                    console.error('[LiveStream] Telemetry parse error:', err);
                }
            };

            this.ws.onerror = (error) => {
                this.status = ConnectionStatus.ERROR;
                console.error('[LiveStream] WebSocket error:', error);
            };

            this.ws.onclose = () => {
                this.status = ConnectionStatus.DISCONNECTED;
                console.log('[LiveStream] WebSocket disconnected, attempting reconnect...');
                setTimeout(() => this.connectWebSocket(), this.config.reconnectDelay);
            };

        } catch (err) {
            console.error('[LiveStream] WebSocket connection failed:', err);
            // Fallback to polling
            if (this.config.pollingUrl) {
                this.startPolling();
            }
        }
    }

    /**
     * HTTP Polling (fallback for reliability)
     */
    private static startPolling(): void {
        if (!this.config.pollingUrl) return;
        this.status = ConnectionStatus.CONNECTED;
        console.log('[LiveStream] 📡 Polling mode active');

        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(this.config.pollingUrl!);
                
                // Check content type to avoid parsing HTML errors
                const contentType = response.headers.get("content-type");
                if (!response.ok || !contentType || !contentType.includes("application/json")) {
                    // Silent fail for simulation environment
                    return;
                }

                const telemetry: TelemetryStream = await response.json();

                if (this.validateTelemetry(telemetry)) {
                    await SovereignKernel.react(telemetry);
                }
            } catch (err) {
                // Silent catch for polling to avoid console spam in dev
            }
        }, this.config.pollingInterval);
    }

    /**
     * Validate incoming telemetry
     */
    private static validateTelemetry(telemetry: TelemetryStream): boolean {
        if (!telemetry || !telemetry.timestamp) {
            console.warn('[LiveStream] Invalid telemetry: missing timestamp');
            return false;
        }

        // Additional validation
        const age = Date.now() - telemetry.timestamp;
        if (age > 60000) { // Reject data older than 60s
            console.warn('[LiveStream] Stale telemetry rejected');
            return false;
        }

        return true;
    }

    /**
     * Disconnect stream
     */
    public static disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
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
