/**
 * HolographicBridge.ts
 * 
 * AR/VR Data Bridge
 * High-speed API endpoint for streaming P&ID, KKS, and sensor data
 * to AR/VR devices with <20ms latency
 */

import { KKSAssetTagger, KKSTag } from './KKSAssetTagger';

export interface ARDataFrame {
    timestamp: number;
    frameId: number;
    sensors: Array<{
        kksCode: string;
        value: number;
        unit: string;
        status: 'NORMAL' | 'WARNING' | 'ALARM';
        position3D?: { x: number; y: number; z: number }; // AR anchor point
    }>;
    pid: {
        flowPaths: Array<{
            id: string;
            flow: number; // m³/s
            pressure: number; // bar
            temperature: number; // °C
        }>;
        valveStates: Array<{
            id: string;
            position: number; // 0-100%
            status: 'OPEN' | 'CLOSED' | 'MOVING';
        }>;
    };
    alarms: Array<{
        id: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        message: string;
        location: string;
    }>;
    latency: number; // ms
}

export class HolographicBridge {
    private static frameCounter = 0;
    private static subscribers: Map<string, WebSocket> = new Map();
    private static updateInterval: NodeJS.Timeout | null = null;
    private static readonly TARGET_LATENCY_MS = 20;
    private static readonly UPDATE_RATE_HZ = 50; // 50 Hz = 20ms between frames

    /**
     * Initialize AR data streaming
     */
    public static initializeStreaming(): void {
        console.log('[HoloBridge] Initializing AR data streaming...');
        console.log(`  Target latency: <${this.TARGET_LATENCY_MS}ms`);
        console.log(`  Update rate: ${this.UPDATE_RATE_HZ} Hz`);

        // Start high-frequency update loop
        this.updateInterval = setInterval(() => {
            this.broadcastFrame();
        }, 1000 / this.UPDATE_RATE_HZ);
    }

    /**
     * Stop streaming
     */
    public static stopStreaming(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('[HoloBridge] Streaming stopped');
    }

    /**
     * Generate AR data frame
     */
    public static generateFrame(assetId: string): ARDataFrame {
        const startTime = performance.now();

        // Get all sensors for asset
        const kksRegistry = KKSAssetTagger.getAssetTags(assetId);

        const sensors = kksRegistry.map(tag => ({
            kksCode: tag.code,
            value: this.getMockSensorValue(tag.code),
            unit: this.getSensorUnit(tag.component),
            status: this.getSensorStatus(tag.code),
            position3D: this.get3DPosition(tag.code) // AR anchor
        }));

        // P&ID flow paths (simplified)
        const flowPaths = [
            { id: 'PENSTOCK', flow: 45.2, pressure: 8.5, temperature: 12.3 },
            { id: 'DRAFT_TUBE', flow: 45.2, pressure: 0.3, temperature: 13.1 }
        ];

        // Valve states
        const valveStates = [
            { id: 'GATE_MAIN', position: 85, status: 'OPEN' as const },
            { id: 'BYPASS', position: 0, status: 'CLOSED' as const }
        ];

        // Active alarms
        const alarms: ARDataFrame['alarms'] = [];

        const endTime = performance.now();
        const latency = endTime - startTime;

        const frame: ARDataFrame = {
            timestamp: Date.now(),
            frameId: this.frameCounter++,
            sensors,
            pid: { flowPaths, valveStates },
            alarms,
            latency
        };

        return frame;
    }

    /**
     * Broadcast frame to all AR subscribers
     */
    private static broadcastFrame(): void {
        if (this.subscribers.size === 0) return;

        // Generate frame for primary asset
        const frame = this.generateFrame('UNIT-1');

        // Check latency
        if (frame.latency > this.TARGET_LATENCY_MS) {
            console.warn(`[HoloBridge] ⚠️ Latency warning: ${frame.latency.toFixed(1)}ms (target: <${this.TARGET_LATENCY_MS}ms)`);
        }

        // Serialize and send to all subscribers
        const payload = JSON.stringify(frame);

        for (const [clientId, ws] of this.subscribers.entries()) {
            try {
                // In production: ws.send(payload);
                // For now: just log
                if (frame.frameId % 100 === 0) { // Log every 100 frames (2 seconds at 50Hz)
                    console.log(`[HoloBridge] Streaming to ${clientId}: Frame ${frame.frameId}, Latency ${frame.latency.toFixed(1)}ms`);
                }
            } catch (error) {
                console.error(`[HoloBridge] Error sending to ${clientId}:`, error);
            }
        }
    }

    /**
     * Register AR client
     */
    public static registerClient(clientId: string, ws: WebSocket): void {
        this.subscribers.set(clientId, ws);
        console.log(`[HoloBridge] AR client registered: ${clientId}`);
        console.log(`  Total clients: ${this.subscribers.size}`);
    }

    /**
     * Unregister AR client
     */
    public static unregisterClient(clientId: string): void {
        this.subscribers.delete(clientId);
        console.log(`[HoloBridge] AR client disconnected: ${clientId}`);
    }

    /**
     * Get mock sensor value
     */
    private static getMockSensorValue(kksCode: string): number {
        // In production: Query actual sensor
        if (kksCode.includes('TVB')) return 1.2 + Math.random() * 0.3; // Vibration
        if (kksCode.includes('TTB')) return 42 + Math.random() * 5; // Temperature
        if (kksCode.includes('TPI')) return 8.2 + Math.random() * 0.5; // Pressure
        if (kksCode.includes('GPA')) return 40 + Math.random() * 5; // Power
        return Math.random() * 100;
    }

    /**
     * Get sensor unit
     */
    private static getSensorUnit(component: string): string {
        const units: Record<string, string> = {
            'Vibration': 'mm/s',
            'Temperature': '°C',
            'Pressure': 'bar',
            'Power': 'MW',
            'Voltage': 'kV',
            'Frequency': 'Hz',
            'Gate': '%',
            'Blade': '°',
            'Needle': 'mm'
        };
        return units[component] || 'unit';
    }

    /**
     * Get sensor status
     */
    private static getSensorStatus(kksCode: string): 'NORMAL' | 'WARNING' | 'ALARM' {
        // In production: Check against thresholds
        return Math.random() > 0.95 ? 'WARNING' : 'NORMAL';
    }

    /**
     * Get 3D position for AR anchoring
     * Coordinates in plant reference frame (meters)
     */
    private static get3DPosition(kksCode: string): { x: number; y: number; z: number } {
        // In production: Load from 3D plant model
        // For now: Mock positions
        const positions: Record<string, { x: number; y: number; z: number }> = {
            '10TVB01': { x: 10.5, y: 2.3, z: 15.2 }, // Upper bearing
            '10TVB02': { x: 10.5, y: -1.5, z: 15.2 }, // Lower bearing
            '10TPI01': { x: 8.0, y: 3.0, z: 15.0 }, // Spiral case
            '10GPA01': { x: 12.0, y: 0.0, z: 17.0 } // Generator
        };

        return positions[kksCode] || { x: 0, y: 0, z: 0 };
    }

    /**
     * Get streaming statistics
     */
    public static getStreamingStats(): {
        activeClients: number;
        framesStreamed: number;
        avgLatency: number;
        updateRate: number;
    } {
        return {
            activeClients: this.subscribers.size,
            framesStreamed: this.frameCounter,
            avgLatency: 5.2, // Mock - would track actual
            updateRate: this.UPDATE_RATE_HZ
        };
    }
}
