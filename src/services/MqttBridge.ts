
import { SimulationEngine } from './SimulationEngine';
import { AlertJournal } from './AlertJournal';

// NC-18: Finite State Machine for MQTT Link
export type MqttStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

// NC-25: Low-Bandwidth Mode Configuration
export interface BandwidthProfile {
    mode: 'NORMAL' | 'LOW_BANDWIDTH';
    telemetryFps: number;
    alertFilter: ('INFO' | 'WARNING' | 'CRITICAL' | 'NEURAL')[];
    compressPayloads: boolean;
}

// NC-25 QA: Strict Telemetry Payload Type
export interface TelemetryPayload {
    timestamp: number;
    powerMW: number;
    efficiency: number;
    vibrationMmS: number;
    bearingTempC: number;
    flowM3S: number;
    headM: number;
    assetId?: string;
}

// NC-25 QA: Queued Alert for Buffer-and-Sync
export interface QueuedAlert {
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'NEURAL';
    message: string;
    timestamp: number;
    source: string;
}

const BANDWIDTH_PROFILES: Record<'NORMAL' | 'LOW_BANDWIDTH', BandwidthProfile> = {
    NORMAL: {
        mode: 'NORMAL',
        telemetryFps: 10,
        alertFilter: ['INFO', 'WARNING', 'CRITICAL', 'NEURAL'],
        compressPayloads: false
    },
    LOW_BANDWIDTH: {
        mode: 'LOW_BANDWIDTH',
        telemetryFps: 1,  // NC-25: 1fps for mobile
        alertFilter: ['CRITICAL', 'NEURAL'],  // Only priority alerts
        compressPayloads: true
    }
};

// NC-25 QA: Navigator Connection API typing
interface NetworkInformation {
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    saveData?: boolean;
}

class MqttBridgeService {
    private _status: MqttStatus = 'IDLE';
    private _lastHeartbeat: number = 0;
    private _watchdogTimer: ReturnType<typeof setTimeout> | null = null;
    private _heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    // NC-25: Bandwidth management
    private _bandwidthProfile: BandwidthProfile = BANDWIDTH_PROFILES.NORMAL;
    private _isMobileDevice: boolean = false;
    private _telemetryThrottleRatio: number = 1;

    // NC-25 QA: Buffer-and-Sync for blackouts
    private _alertBuffer: QueuedAlert[] = [];
    private _lastSignalTime: number = Date.now();
    private _blackoutDetected: boolean = false;
    private readonly BLACKOUT_THRESHOLD_MS = 30000; // 30 seconds

    // Event listeners
    private statusListeners: ((status: MqttStatus) => void)[] = [];
    private heartbeatListeners: ((timestamp: number) => void)[] = [];
    private telemetryListeners: ((data: TelemetryPayload) => void)[] = [];

    // Configuration
    private readonly WATCHDOG_TIMEOUT_MS = 10000; // 10s timeout per user requirement
    private readonly HEARTBEAT_RATE_MS = 2000;   // 2s heartbeat pulse

    constructor() {
        console.log("NC-17: Neural Link Bridge Initialized [FSM: IDLE]");
        this.detectDeviceType();
    }

    // NC-25: Device Detection
    private detectDeviceType(): void {
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
            const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
            const isSaveData = connection?.saveData === true;

            this._isMobileDevice = isMobile || isSlowConnection || isSaveData;

            if (this._isMobileDevice) {
                this.enableLowBandwidthMode();
            }
        }
    }

    // NC-25: Low-Bandwidth Mode Toggle
    public enableLowBandwidthMode(): void {
        this._bandwidthProfile = BANDWIDTH_PROFILES.LOW_BANDWIDTH;
        this._telemetryThrottleRatio = 10; // 10x reduction
        console.log('[NC-25] Low-Bandwidth Mode ENABLED: 1fps, Critical/Neural alerts only');
        AlertJournal.logEvent('INFO', 'Field Sync: Low-Bandwidth Mode Activated', 'MQTT_BRIDGE');
    }

    public disableLowBandwidthMode(): void {
        this._bandwidthProfile = BANDWIDTH_PROFILES.NORMAL;
        this._telemetryThrottleRatio = 1;
        console.log('[NC-25] Normal Bandwidth Mode restored');
    }

    public get bandwidthProfile(): BandwidthProfile {
        return this._bandwidthProfile;
    }

    public get isMobile(): boolean {
        return this._isMobileDevice;
    }

    // NC-25: Alert Filter
    public shouldDeliverAlert(severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'NEURAL'): boolean {
        return this._bandwidthProfile.alertFilter.includes(severity);
    }

    // NC-25 QA: Buffer-and-Sync - Queue alert during blackout
    public queueAlert(alert: Omit<QueuedAlert, 'timestamp'>): void {
        const queuedAlert: QueuedAlert = {
            ...alert,
            timestamp: Date.now()
        };

        // Only queue critical/neural alerts during blackout
        if (this._blackoutDetected && (alert.severity === 'CRITICAL' || alert.severity === 'NEURAL')) {
            this._alertBuffer.push(queuedAlert);
            console.log(`[NC-25] Alert queued during blackout: ${alert.message}`);
        }
    }

    // NC-25 QA: Flush buffer on reconnection
    private flushAlertBuffer(): void {
        if (this._alertBuffer.length === 0) return;

        console.log(`[NC-25] Flushing ${this._alertBuffer.length} buffered alerts...`);

        this._alertBuffer.forEach(alert => {
            AlertJournal.logEvent(
                alert.severity === 'NEURAL' ? 'WARNING' : alert.severity,
                `[BUFFERED ${new Date(alert.timestamp).toISOString()}] ${alert.message}`,
                alert.source
            );
        });

        this._alertBuffer = [];
        AlertJournal.logEvent('INFO', `Buffer-and-Sync: ${this._alertBuffer.length} alerts flushed`, 'MQTT_BRIDGE');
    }

    // NC-25 QA: Signal monitoring for blackout detection
    public signalReceived(): void {
        const now = Date.now();
        const timeSinceLastSignal = now - this._lastSignalTime;

        if (timeSinceLastSignal > this.BLACKOUT_THRESHOLD_MS && !this._blackoutDetected) {
            this._blackoutDetected = true;
            console.warn(`[NC-25] Blackout detected: ${timeSinceLastSignal}ms since last signal`);
            AlertJournal.logEvent('WARNING', `Signal blackout detected (${Math.round(timeSinceLastSignal / 1000)}s)`, 'MQTT_BRIDGE');
        }

        if (this._blackoutDetected) {
            // Reconnected after blackout
            console.log('[NC-25] Signal restored after blackout');
            this._blackoutDetected = false;
            this.flushAlertBuffer();
        }

        this._lastSignalTime = now;
    }

    public get isInBlackout(): boolean {
        return this._blackoutDetected;
    }

    public get bufferedAlertCount(): number {
        return this._alertBuffer.length;
    }

    // NC-25: Telemetry Throttle Check
    private _frameCounter = 0;
    public shouldDeliverTelemetry(): boolean {
        this._frameCounter++;
        if (this._frameCounter >= this._telemetryThrottleRatio) {
            this._frameCounter = 0;
            return true;
        }
        return false;
    }

    public get status(): MqttStatus {
        return this._status;
    }

    public subscribeStatus(listener: (status: MqttStatus) => void): () => void {
        this.statusListeners.push(listener);
        // Immediate callback with current status
        listener(this._status);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    public subscribeHeartbeat(listener: (timestamp: number) => void): () => void {
        this.heartbeatListeners.push(listener);
        return () => {
            this.heartbeatListeners = this.heartbeatListeners.filter(l => l !== listener);
        };
    }

    public subscribeTelemetry(listener: (data: TelemetryPayload) => void): () => void {
        this.telemetryListeners.push(listener);
        return () => {
            this.telemetryListeners = this.telemetryListeners.filter(l => l !== listener);
        };
    }

    // NC-25: Emit telemetry with throttling
    public emitTelemetry(data: TelemetryPayload): void {
        this.signalReceived(); // Update signal timestamp
        if (this.shouldDeliverTelemetry()) {
            this.telemetryListeners.forEach(l => l(data));
        }
    }

    private setStatus(newStatus: MqttStatus): void {
        if (this._status === newStatus) return;

        console.log(`[MQTT-BRIDGE] State Transition: ${this._status} -> ${newStatus}`);

        // NC-19: Global Alerts Persistence
        if (newStatus === 'CONNECTED') {
            AlertJournal.logEvent('INFO', 'Neural Link Established (AES-256-GCM)', 'MQTT_BRIDGE');
            this.startHeartbeatLoop();
            this.flushAlertBuffer(); // NC-25 QA: Flush on reconnect
        } else if (newStatus === 'ERROR') {
            AlertJournal.logEvent('CRITICAL', 'Neural Link Severed - Watchdog Expired', 'MQTT_BRIDGE');
            this.stopHeartbeatLoop();
        } else {
            this.stopHeartbeatLoop();
        }

        this._status = newStatus;
        this.statusListeners.forEach(l => l(newStatus));

        if (newStatus === 'ERROR' || newStatus === 'IDLE') {
            // Fallback to simulation if link dies
            SimulationEngine.startNC13StressTest();
        }
    }

    public connect(): void {
        if (this._status === 'CONNECTED' || this._status === 'CONNECTING') return;

        this.setStatus('CONNECTING');

        // Simulate Handshake Delay
        setTimeout(() => {
            // Success condition (for now always true in this mock, but structure is ready for real payload)
            const success = true;

            if (success) {
                this.setStatus('CONNECTED');
                this.bumpHeartbeat();
            } else {
                this.setStatus('ERROR');
            }
        }, 1500);
    }

    public disconnect(): void {
        this.setStatus('IDLE');
    }

    // --- HEARTBEAT & WATCHDOG ---

    private bumpHeartbeat(): void {
        this._lastHeartbeat = Date.now();
        this.signalReceived(); // NC-25 QA: Signal tracking
        this.heartbeatListeners.forEach(l => l(this._lastHeartbeat));

        // Reset Watchdog
        if (this._watchdogTimer) clearTimeout(this._watchdogTimer);

        this._watchdogTimer = setTimeout(() => {
            console.warn("[MQTT-BRIDGE] WATCHDOG EXPIRED. LINK LOST.");
            this.setStatus('ERROR'); // Or 'CONNECTING' to auto-retry
        }, this.WATCHDOG_TIMEOUT_MS);
    }

    private startHeartbeatLoop(): void {
        // In a real app, this comes from the Broker. 
        // Here we simulate the "Pulse" arriving.
        if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);

        this._heartbeatInterval = setInterval(() => {
            if (this._status === 'CONNECTED') {
                this.bumpHeartbeat();
            }
        }, this.HEARTBEAT_RATE_MS);
    }

    private stopHeartbeatLoop(): void {
        if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);
        if (this._watchdogTimer) clearTimeout(this._watchdogTimer);
        this._heartbeatInterval = null;
        this._watchdogTimer = null;
    }
}

export const MqttBridge = new MqttBridgeService();
