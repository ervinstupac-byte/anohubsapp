/**
 * MicroInjectionControl.ts
 * 
 * Cavitation Protection via Air Micro-Injection
 * Creates protective gaseous boundary layer on runner blades
 * Modulates based on acoustic cavitation detection
 */

import { CavitationAcousticAnalyser } from './CavitationAcousticAnalyser';

export interface InjectionValve {
    valveId: string;
    location: string; // Runner blade position
    flowRate: number; // L/min
    pressure: number; // bar
    status: 'CLOSED' | 'MODULATING' | 'OPEN';
}

export interface BoundaryLayerStatus {
    timestamp: number;
    coverage: number; // % of runner surface
    thickness: number; // μm
    effectiveness: number; // % cavitation reduction
}

export class MicroInjectionControl {
    private static valves: Map<string, InjectionValve> = new Map();
    private static injectionActive: boolean = false;

    public static initialize(): void {
        console.log('[MicroInject] Initializing air micro-injection system...');

        // 12 valves around runner circumference
        for (let i = 1; i <= 12; i++) {
            this.valves.set(`VALVE-${i}`, {
                valveId: `VALVE-${i}`,
                location: `RUNNER_BLADE_${i}`,
                flowRate: 0,
                pressure: 0,
                status: 'CLOSED'
            });
        }

        console.log(`[MicroInject] ✅ ${this.valves.size} injection valves ready`);
    }

    public static modulateInjection(
        cavitationSeverity: 'NONE' | 'INCIPIENT' | 'MODERATE' | 'SEVERE',
        operatingLoad: number // MW
    ): BoundaryLayerStatus {
        let targetFlowRate = 0;
        let targetPressure = 0;

        // Determine injection parameters based on cavitation
        switch (cavitationSeverity) {
            case 'SEVERE':
                targetFlowRate = 50; // L/min per valve
                targetPressure = 8; // bar
                break;
            case 'MODERATE':
                targetFlowRate = 30;
                targetPressure = 6;
                break;
            case 'INCIPIENT':
                targetFlowRate = 15;
                targetPressure = 4;
                break;
            case 'NONE':
                targetFlowRate = 0;
                targetPressure = 0;
                break;
        }

        // Update valves
        if (targetFlowRate > 0 && !this.injectionActive) {
            this.activateInjection();
        } else if (targetFlowRate === 0 && this.injectionActive) {
            this.deactivateInjection();
        }

        for (const valve of this.valves.values()) {
            valve.flowRate = targetFlowRate;
            valve.pressure = targetPressure;
            valve.status = targetFlowRate > 0 ? 'MODULATING' : 'CLOSED';
        }

        // Calculate boundary layer characteristics
        const totalFlow = Array.from(this.valves.values())
            .reduce((sum, v) => sum + v.flowRate, 0);

        const coverage = Math.min(100, (totalFlow / 600) * 100); // 600 L/min = 100% coverage
        const thickness = (targetPressure / 8) * 50; // μm, max 50 at 8 bar
        const effectiveness = Math.min(95, coverage * 0.95); // Max 95% reduction

        return {
            timestamp: Date.now(),
            coverage,
            thickness,
            effectiveness
        };
    }

    private static activateInjection(): void {
        console.log('\n' + '💨'.repeat(40));
        console.log('MICRO-INJECTION SYSTEM ACTIVATED');
        console.log('💨'.repeat(40));
        console.log('Creating gaseous boundary layer on runner blades');
        console.log('Cavitation protection: ACTIVE');
        console.log('💨'.repeat(40) + '\n');

        this.injectionActive = true;
    }

    private static deactivateInjection(): void {
        console.log('[MicroInject] Deactivating air injection');
        this.injectionActive = false;
    }

    public static isActive(): boolean {
        return this.injectionActive;
    }

    public static getValveStatus(): InjectionValve[] {
        return Array.from(this.valves.values());
    }
}

// MicroInjectionControl.initialize(); // DISABLED: Call manually to avoid blocking startup
