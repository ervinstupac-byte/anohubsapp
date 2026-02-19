import { TelemetrySource } from './TelemetrySource';
import { TelemetryStream } from '../../lib/engines/BaseTurbineEngine';
import { PhysicsEngine } from '../../core/PhysicsEngine';
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../../core/TechnicalSchema';
import Decimal from 'decimal.js';

/**
 * Simulation Source
 * Generates synthetic telemetry data using the internal Physics Engine.
 * Used when no real connection is available.
 */
export class SimulationSource implements TelemetrySource {
    private intervalId: NodeJS.Timeout | null = null;
    private dataCallback: ((data: TelemetryStream) => void) | null = null;
    private errorCallback: ((error: Error) => void) | null = null;
    private state: TechnicalProjectState = { ...DEFAULT_TECHNICAL_STATE };
    private lastTick: number = Date.now();

    async connect(config?: any): Promise<void> {
        console.log('[SimulationSource] Starting simulation loop...');
        if (this.intervalId) return;

        // Default tick rate 10Hz
        const intervalMs = config?.interval || 100;
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, intervalMs);
    }

    async disconnect(): Promise<void> {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('[SimulationSource] Stopped.');
    }

    onData(callback: (data: TelemetryStream) => void): void {
        this.dataCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.errorCallback = callback;
    }

    private tick() {
        try {
            const now = Date.now();
            const dt = (now - this.lastTick) / 1000;
            this.lastTick = now;

            // Run Physics Step
            // Note: We use the stateless PhysicsEngine to evolve our local state
            const updates = PhysicsEngine.simulateTimeStep(this.state, dt);
            
            // Merge updates into local state
            this.state = {
                ...this.state,
                ...updates,
                hydraulic: { ...this.state.hydraulic, ...updates.hydraulic },
                mechanical: { ...this.state.mechanical, ...updates.mechanical },
                governor: { ...this.state.governor, ...updates.governor },
                physics: { ...this.state.physics, ...updates.physics }
            };

            // Map to TelemetryStream format
            const stream: TelemetryStream = {
                timestamp: now,
                hydraulic: {
                    ...this.state.hydraulic,
                    flow: this.state.hydraulic.flow,
                    head: this.state.hydraulic.head,
                    powerKW: (this.state.physics.powerMW || 0) * 1000,
                    efficiency: this.state.hydraulic.efficiency,
                    // Ensure Decimal types if required by strict checks, though usually they are optional or handled
                    waterHead: new Decimal(this.state.hydraulic.head),
                    flowRate: new Decimal(this.state.hydraulic.flow),
                    cavitationThreshold: new Decimal(this.state.hydraulic.cavitationThreshold || 0.1)
                },
                mechanical: {
                    ...this.state.mechanical,
                    vibration: this.state.mechanical.vibration,
                    bearingTemp: this.state.mechanical.bearingTemp,
                    rpm: this.state.mechanical.rpm
                },
                // Electrical is not part of TelemetryStream in BaseTurbineEngine but might be in a broader type?
                // Checking BaseTurbineEngine.ts, TelemetryStream only has hydraulic and mechanical.
                // But LiveStreamConnector might expect more? 
                // Let's stick to the interface.
            };

            if (this.dataCallback) {
                this.dataCallback(stream);
            }
        } catch (err) {
            if (this.errorCallback) {
                this.errorCallback(err as Error);
            }
        }
    }
}
