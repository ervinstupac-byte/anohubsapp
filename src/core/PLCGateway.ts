/**
 * PLC GATEWAY
 * Single Source of Truth for all PLC signals.
 * Implements observer pattern for reactive data propagation.
 * 
 * Architecture:
 *   PLCTagBridge (normalization) → PLCGateway (state + pub/sub) → useTelemetryStore
 */

import {
    PLCSignal,
    PLCSubscriber,
    ConnectionStatus,
    SignalQuality,
    RawPLCData,
    TagConfig
} from '../types/plc';
import { SignalFilterManager, JITTER_FILTERED_SIGNALS, FilteredSignal } from '../utils/SignalFilter';

// ==================== GATEWAY CLASS ====================

export class PLCGateway {
    private static instance: PLCGateway;

    private subscribers: Set<PLCSubscriber> = new Set();
    private signalCache: Map<string, PLCSignal> = new Map();
    private tagMap: Map<string, TagConfig> = new Map();
    private connectionStatus: ConnectionStatus = 'DISCONNECTED';
    private lastHeartbeat: number = 0;
    private heartbeatIntervalMs: number = 5000;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    // NC-300: SMA Filter for jitter reduction
    private filterManager: SignalFilterManager = new SignalFilterManager(5);
    private filteredCache: Map<string, FilteredSignal> = new Map();

    private constructor() {
        this.initializeDefaultTags();
        this.startHeartbeatMonitor();
    }

    /**
     * Singleton accessor
     */
    public static getInstance(): PLCGateway {
        if (!PLCGateway.instance) {
            PLCGateway.instance = new PLCGateway();
        }
        return PLCGateway.instance;
    }

    // ==================== TAG REGISTRATION ====================

    /**
     * Register a tag configuration for scaling
     */
    public registerTag(config: TagConfig): void {
        this.tagMap.set(config.plcAddress, config);
    }

    /**
     * Initialize default hydropower tag mappings
     */
    private initializeDefaultTags(): void {
        const defaultTags: TagConfig[] = [
            {
                plcAddress: 'DB100.DBD20',
                signalId: 'Upper_Guide_Bearing_Temp',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 150,
                unit: 'degC',
                thresholds: { warning: 70, alarm: 80, trip: 90 }
            },
            {
                plcAddress: 'DB100.DBD24',
                signalId: 'Lower_Guide_Bearing_Temp',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 150,
                unit: 'degC',
                thresholds: { warning: 70, alarm: 80, trip: 90 }
            },
            {
                plcAddress: '%IW512',
                signalId: 'Turbine_Vibration_X',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 10,
                unit: 'mm/s',
                thresholds: { warning: 4.5, alarm: 7.1, trip: 11.2 }
            },
            {
                plcAddress: '%IW514',
                signalId: 'Turbine_Vibration_Y',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 10,
                unit: 'mm/s',
                thresholds: { warning: 4.5, alarm: 7.1, trip: 11.2 }
            },
            {
                plcAddress: 'DB100.DBD0',
                signalId: 'Turbine_RPM',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 600,
                unit: 'RPM'
            },
            {
                plcAddress: 'DB200.DBD0',
                signalId: 'Head_Pressure',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 200,
                unit: 'm'
            },
            {
                plcAddress: 'DB200.DBD4',
                signalId: 'Flow_Rate',
                rawMin: 0, rawMax: 27648,
                euMin: 0, euMax: 100,
                unit: 'm3/s'
            }
        ];

        defaultTags.forEach(tag => this.registerTag(tag));
    }

    // ==================== SIGNAL NORMALIZATION ====================

    /**
     * Normalize raw PLC data to engineering units
     */
    public normalize(input: RawPLCData): PLCSignal {
        const config = this.tagMap.get(input.tagAddress);

        if (!config) {
            return {
                signalId: `UNKNOWN_${input.tagAddress}`,
                value: 0,
                unit: '?',
                quality: 'BAD_CONFIG',
                timestamp: input.timestamp
            };
        }

        // Linear Scaling: Y = (X - RawMin) * (EuRange / RawRange) + EuMin
        const rawRange = config.rawMax - config.rawMin;
        const euRange = config.euMax - config.euMin;
        const normalized = ((input.rawValue - config.rawMin) * (euRange / rawRange)) + config.euMin;

        // Determine quality based on thresholds
        let quality: SignalQuality = 'GOOD';
        if (config.thresholds) {
            if (config.thresholds.trip && normalized >= config.thresholds.trip) {
                quality = 'UNCERTAIN'; // Could indicate sensor fault at extreme
            }
        }

        return {
            signalId: config.signalId,
            value: parseFloat(normalized.toFixed(2)),
            unit: config.unit,
            quality,
            timestamp: input.timestamp
        };
    }

    // ==================== PUBLISH / SUBSCRIBE ====================

    /**
     * Subscribe to signal updates
     * @returns Unsubscribe function
     */
    public subscribe(subscriber: PLCSubscriber): () => void {
        this.subscribers.add(subscriber);

        // Send current state to new subscriber
        this.signalCache.forEach(signal => {
            subscriber.onSignalUpdate(signal);
        });

        return () => {
            this.subscribers.delete(subscriber);
        };
    }

    /**
     * Publish new signals to all subscribers
     */
    public publish(signals: PLCSignal[]): void {
        const now = Date.now();
        this.lastHeartbeat = now;

        // Update connection status
        if (this.connectionStatus !== 'CONNECTED') {
            this.connectionStatus = 'CONNECTED';
            this.subscribers.forEach(sub => sub.onConnectionRestored?.());
        }

        // Update cache and notify subscribers
        signals.forEach(signal => {
            this.signalCache.set(signal.signalId, signal);

            // NC-300: Apply SMA filter to jitter-prone signals
            if (JITTER_FILTERED_SIGNALS.includes(signal.signalId as any)) {
                const filtered = this.filterManager.filter(signal.signalId, signal.value);
                this.filteredCache.set(signal.signalId, filtered);
            }

            this.subscribers.forEach(subscriber => {
                subscriber.onSignalUpdate(signal);
            });
        });
    }

    /**
     * Publish raw PLC data (will be normalized first)
     */
    public publishRaw(rawData: RawPLCData[]): void {
        const normalizedSignals = rawData.map(raw => this.normalize(raw));
        this.publish(normalizedSignals);
    }

    // ==================== GETTERS ====================

    /**
     * Get current value of a signal
     */
    public getSignal(signalId: string): PLCSignal | undefined {
        return this.signalCache.get(signalId);
    }

    /**
     * Get all current signals
     */
    public getAllSignals(): PLCSignal[] {
        return Array.from(this.signalCache.values());
    }

    /**
     * Get current connection status
     */
    public getConnectionStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    // ==================== FILTERED SIGNAL ACCESS ====================

    /**
     * Get smoothed signal value for UI gauges (SMA filtered)
     * Use this for HMIPanel displays to reduce jitter
     */
    public getSmooth(signalId: string): number {
        const filtered = this.filteredCache.get(signalId);
        if (filtered) {
            return filtered.smooth;
        }
        // Fall back to raw value if not in filtered signals
        return this.signalCache.get(signalId)?.value ?? 0;
    }

    /**
     * Get raw signal value for RCA Engine
     * Use this for diagnostic calculations that need original data
     */
    public getRaw(signalId: string): number {
        return this.signalCache.get(signalId)?.value ?? 0;
    }

    /**
     * Get filtered signal data (both raw and smooth)
     */
    public getFiltered(signalId: string): FilteredSignal | undefined {
        return this.filteredCache.get(signalId);
    }

    // ==================== HEARTBEAT MONITORING ====================

    /**
     * Start heartbeat monitoring for connection status
     */
    private startHeartbeatMonitor(): void {
        this.heartbeatTimer = setInterval(() => {
            const now = Date.now();
            const timeSinceLastHeartbeat = now - this.lastHeartbeat;

            if (this.lastHeartbeat === 0) {
                // Never received data
                if (this.connectionStatus !== 'DISCONNECTED') {
                    this.setConnectionLost();
                }
            } else if (timeSinceLastHeartbeat > this.heartbeatIntervalMs * 2) {
                // Definitely lost
                if (this.connectionStatus !== 'DISCONNECTED') {
                    this.setConnectionLost();
                }
            } else if (timeSinceLastHeartbeat > this.heartbeatIntervalMs) {
                // Degraded
                if (this.connectionStatus === 'CONNECTED') {
                    this.connectionStatus = 'DEGRADED';
                }
            }
        }, 1000);
    }

    /**
     * Handle connection loss
     */
    private setConnectionLost(): void {
        this.connectionStatus = 'DISCONNECTED';

        // Mark all signals as DISCONNECTED quality
        this.signalCache.forEach((signal, key) => {
            this.signalCache.set(key, {
                ...signal,
                quality: 'DISCONNECTED'
            });
        });

        // Notify subscribers
        this.subscribers.forEach(sub => sub.onConnectionLost?.());
    }

    /**
     * Cleanup
     */
    public dispose(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
        this.subscribers.clear();
        this.signalCache.clear();
    }
}

// ==================== SINGLETON EXPORT ====================

export const plcGateway = PLCGateway.getInstance();
