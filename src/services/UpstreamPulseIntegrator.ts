/**
 * UpstreamPulseIntegrator.ts
 * 
 * Remote Sensor Network Integration
 * Monitors flow pulses 5km+ upstream
 * Calculates time-of-arrival for preemptive turbine adjustments
 */

export interface UpstreamSensor {
    sensorId: string;
    distance: number; // km upstream
    type: 'ACOUSTIC' | 'PRESSURE' | 'FLOW';
    value: number;
    timestamp: number;
}

export interface FlowPulse {
    pulseId: string;
    detectedAt: number; // timestamp
    detectionDistance: number; // km
    magnitude: number; // m³/s change
    estimatedArrival: number; // timestamp at plant
    timeToArrival: number; // seconds
}

export class UpstreamPulseIntegrator {
    private static sensors: Map<string, UpstreamSensor> = new Map();
    private static activePulses: FlowPulse[] = [];
    private static readonly FLOW_VELOCITY = 3; // m/s average

    public static initialize(): void {
        console.log('[Upstream] Initializing remote sensor network...');

        // Sensors at various distances
        const distances = [5, 7.5, 10, 12.5, 15]; // km

        for (const dist of distances) {
            this.sensors.set(`ACOUSTIC-${dist}KM`, {
                sensorId: `ACOUSTIC-${dist}KM`,
                distance: dist,
                type: 'ACOUSTIC',
                value: 0,
                timestamp: Date.now()
            });

            this.sensors.set(`PRESSURE-${dist}KM`, {
                sensorId: `PRESSURE-${dist}KM`,
                distance: dist,
                type: 'PRESSURE',
                value: 0,
                timestamp: Date.now()
            });
        }

        console.log(`[Upstream] ✅ ${this.sensors.size} sensors monitoring`);
    }

    public static detectFlowPulse(
        detectionDistance: number,
        magnitude: number
    ): FlowPulse {
        const travelTime = (detectionDistance * 1000) / this.FLOW_VELOCITY; // seconds
        const estimatedArrival = Date.now() + travelTime * 1000;

        const pulse: FlowPulse = {
            pulseId: `PULSE-${Date.now()}`,
            detectedAt: Date.now(),
            detectionDistance,
            magnitude,
            estimatedArrival,
            timeToArrival: travelTime
        };

        this.activePulses.push(pulse);

        console.log(`[Upstream] Flow pulse detected at ${detectionDistance}km`);
        console.log(`  Magnitude: ${magnitude.toFixed(1)} m³/s`);
        console.log(`  Arrival in: ${(travelTime / 60).toFixed(1)} minutes`);

        // Calculate guide vane adjustment
        this.calculateGuideVaneAdjustment(pulse);

        return pulse;
    }

    private static calculateGuideVaneAdjustment(pulse: FlowPulse): void {
        const currentOpening = 75; // % (simulated)
        const flowChange = pulse.magnitude;

        // Proportional adjustment
        const adjustment = (flowChange / 50) * 10; // ±10% for ±50 m³/s
        const targetOpening = Math.max(0, Math.min(100, currentOpening + adjustment));

        const leadTime = pulse.timeToArrival - 30; // Start adjustment 30s before arrival

        console.log(`[Upstream] Guide vane preemptive adjustment:`);
        console.log(`  Current: ${currentOpening}%`);
        console.log(`  Target: ${targetOpening.toFixed(1)}%`);
        console.log(`  Execute in: ${(leadTime / 60).toFixed(1)} minutes`);

        // Schedule adjustment
        setTimeout(() => {
            this.executeGuideVaneAdjustment(targetOpening);
        }, Math.max(0, leadTime * 1000));
    }

    private static executeGuideVaneAdjustment(targetOpening: number): void {
        console.log(`[Upstream] ✅ Executing guide vane adjustment: ${targetOpening.toFixed(1)}%`);
        // In production: actual servo control
    }

    public static getActivePulses(): FlowPulse[] {
        const now = Date.now();
        // Filter to only pulses that haven't arrived yet
        return this.activePulses.filter(p => p.estimatedArrival > now);
    }
}

// UpstreamPulseIntegrator.initialize(); // DISABLED: Call manually to avoid blocking startup
