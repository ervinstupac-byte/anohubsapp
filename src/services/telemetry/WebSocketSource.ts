import { TelemetrySource } from './TelemetrySource';
import { TelemetryStream } from '../../lib/engines/BaseTurbineEngine';

export class WebSocketSource implements TelemetrySource {
    private ws: WebSocket | null = null;
    private config: { url: string; reconnectDelay?: number } | null = null;
    private dataCallback: ((data: TelemetryStream) => void) | null = null;
    private errorCallback: ((error: Error) => void) | null = null;
    private isConnected: boolean = false;

    async connect(config: { url: string; reconnectDelay?: number }): Promise<void> {
        this.config = config;
        this.connectWebSocket();
    }

    private connectWebSocket() {
        if (!this.config?.url) return;

        try {
            this.ws = new WebSocket(this.config.url);

            this.ws.onopen = () => {
                this.isConnected = true;
                console.log('[WebSocketSource] Connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data: TelemetryStream = JSON.parse(event.data);
                    if (this.dataCallback) {
                        this.dataCallback(data);
                    }
                } catch (err) {
                    console.error('[WebSocketSource] Parse error:', err);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[WebSocketSource] Error:', error);
                if (this.errorCallback) this.errorCallback(new Error('WebSocket Error'));
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                console.log('[WebSocketSource] Disconnected');
                if (this.config?.reconnectDelay) {
                    setTimeout(() => this.connectWebSocket(), this.config.reconnectDelay);
                }
            };

        } catch (err) {
            console.error('[WebSocketSource] Connection failed:', err);
            if (this.errorCallback) this.errorCallback(err as Error);
        }
    }

    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    onData(callback: (data: TelemetryStream) => void): void {
        this.dataCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.errorCallback = callback;
    }
}
