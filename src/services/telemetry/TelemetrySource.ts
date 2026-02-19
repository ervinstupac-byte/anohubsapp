import { TelemetryStream } from '../../lib/engines/BaseTurbineEngine';

/**
 * Interface for Telemetry Data Sources
 * Allows switching between Simulation, WebSocket, MQTT, or Replay modes.
 */
export interface TelemetrySource {
    /**
     * Connect to the data source
     * @param config Configuration object (url, port, etc.)
     */
    connect(config?: any): Promise<void>;

    /**
     * Disconnect from the data source
     */
    disconnect(): Promise<void>;

    /**
     * Subscribe to data updates
     * @param callback Function to handle incoming telemetry data
     */
    onData(callback: (data: TelemetryStream) => void): void;

    /**
     * Subscribe to connection errors
     * @param callback Function to handle errors
     */
    onError(callback: (error: Error) => void): void;
    
    /**
     * Send a command back to the source (if supported)
     * @param command Command payload
     */
    sendCommand?(command: any): Promise<void>;
}
