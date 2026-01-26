/**
 * BootstrapService.ts (NC-76.1)
 * 
 * Tiered Orchestrator for system-wide service initialization.
 * Implements <800ms TTI via: 
 *   - Tier 1 (Critical): Parallel load, blocking
 *   - Tier 2 (Sensors): requestIdleCallback deferred
 *   - Tier 3 (AI/Analytics): On-demand lazy load
 * 
 * IEC 60041 Compliant | ISO 10816-5 Mapped
 */

import { AdditiveManufacturingService } from './AdditiveManufacturingService';
import { HVShield } from './HVShield';
import { KKSAssetTagger } from './KKSAssetTagger';
import { MicroInjectionControl } from './MicroInjectionControl';
import { MultiAgentSwarm } from './MultiAgentSwarm';
import { QuantumResistantSovereignty } from './QuantumResistantSovereignty';
import { ResonanceHarvesterManager } from './ResonanceHarvesterManager';
import { RoboticFleetOrchestrator } from './RoboticFleetOrchestrator';
import { SeismicPulseAnalyser } from './SeismicPulseAnalyser';
import { UpstreamPulseIntegrator } from './UpstreamPulseIntegrator';
import { WarehouseIntegrationService } from './WarehouseIntegrationService';
import { LegacyKnowledgeService } from './LegacyKnowledgeService';
import { FireSuppressionSystem } from './FireSuppressionSystem';
import { DynamicThermalRating } from './DynamicThermalRating';
import { ComputerVisionService } from './ComputerVisionService';
import { CavitationAcousticAnalyser } from './CavitationAcousticAnalyser';
import { BlackoutSentinel } from './BlackoutSentinel';

// ============================================================================
// TYPES
// ============================================================================

export interface BootstrapProgress {
    service: string;
    tier: 1 | 2 | 3;
    status: 'PENDING' | 'INITIALIZING' | 'COMPLETE' | 'FAILED' | 'DEFERRED';
    error?: string;
    deferredUntil?: string;
}

export type BootstrapTier = 'CRITICAL' | 'SENSOR_NETWORK' | 'AI_ANALYTICS';

interface ServiceDefinition {
    name: string;
    tier: 1 | 2 | 3;
    task: () => void | Promise<void>;
}

// ============================================================================
// BOOTSTRAP SERVICE (NC-76.1 - Tiered Loading)
// ============================================================================

export class BootstrapService {
    private static initialized = false;
    private static tier2Initialized = false;
    private static tier3Initialized = false;
    private static progress: Map<string, BootstrapProgress> = new Map();

    // ========================================================================
    // TIER DEFINITIONS
    // ========================================================================

    private static readonly TIER_1_CRITICAL: ServiceDefinition[] = [
        { name: 'KKS Asset Registry', tier: 1, task: () => (KKSAssetTagger as any).initializeRegistry?.() },
        { name: 'Legacy Knowledge Base', tier: 1, task: () => (LegacyKnowledgeService as any).initialize?.() },
        { name: 'Fire Suppression', tier: 1, task: () => (FireSuppressionSystem as any).initializeFireZones?.() },
        { name: 'High Voltage Shield', tier: 1, task: () => (HVShield as any).initializeRelays?.() },
    ];

    private static readonly TIER_2_SENSORS: ServiceDefinition[] = [
        { name: 'Acoustic Analytics', tier: 2, task: () => (CavitationAcousticAnalyser as any).initializeSensors?.() },
        { name: 'Thermal Modelling', tier: 2, task: () => (DynamicThermalRating as any).initializeSensors?.() },
        { name: 'Seismic Pulse Network', tier: 2, task: () => (SeismicPulseAnalyser as any).initialize?.() },
        { name: 'Upstream Sensor Link', tier: 2, task: () => (UpstreamPulseIntegrator as any).initialize?.() },
        { name: 'Inventory Systems', tier: 2, task: () => (WarehouseIntegrationService as any).initializeInventory?.() },
        {
            name: 'Blackout Sentinel', tier: 2, task: () => {
                setInterval(() => (BlackoutSentinel as any).monitorConnectivity?.(), 60000);
                (BlackoutSentinel as any).monitorConnectivity?.();
            }
        },
    ];

    private static readonly TIER_3_AI: ServiceDefinition[] = [
        { name: 'Quantum Sovereignty', tier: 3, task: () => (QuantumResistantSovereignty as any).initialize?.() },
        { name: 'Additive Manufacturing', tier: 3, task: () => (AdditiveManufacturingService as any).initializeLibrary?.() },
        { name: 'Robotic Fleet', tier: 3, task: () => (RoboticFleetOrchestrator as any).initializeFleet?.() },
        { name: 'Nano-Injection Control', tier: 3, task: () => (MicroInjectionControl as any).initialize?.() },
        { name: 'Decision Swarm', tier: 3, task: () => (MultiAgentSwarm as any).initialize?.() },
        { name: 'Resonance Harvesters', tier: 3, task: () => (ResonanceHarvesterManager as any).initialize?.() },
        { name: 'Edge Computer Vision', tier: 3, task: () => (ComputerVisionService as any).initialize?.() },
    ];

    // ========================================================================
    // BOOT SEQUENCE
    // ========================================================================

    /**
     * Start the tiered boot process optimized for <800ms TTI
     * - Tier 1: Critical path services (parallel, blocking)
     * - Tier 2: Sensor network (deferred via requestIdleCallback)
     * - Tier 3: AI/Analytics (lazy, on-demand)
     */
    public static async boot(onUpdate?: (progress: BootstrapProgress[]) => void): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;

        const startTime = performance.now();
        console.log('[Bootstrap NC-76.1] ⚡ Initiating Tiered Neural Core Boot...');

        // Mark all services as pending
        [...this.TIER_1_CRITICAL, ...this.TIER_2_SENSORS, ...this.TIER_3_AI].forEach(s => {
            this.updateProgress(s.name, s.tier, 'PENDING', onUpdate);
        });

        // ====================================================================
        // TIER 1: CRITICAL PATH (Parallel, Blocking)
        // ====================================================================
        console.log('[Bootstrap] ▶ Tier 1: Critical Services...');
        await Promise.all(
            this.TIER_1_CRITICAL.map(async (service) => {
                try {
                    this.updateProgress(service.name, service.tier, 'INITIALIZING', onUpdate);
                    await Promise.resolve(service.task());
                    this.updateProgress(service.name, service.tier, 'COMPLETE', onUpdate);
                    console.log(`[Bootstrap] ✅ T1: ${service.name}`);
                } catch (err) {
                    console.error(`[Bootstrap] ❌ T1: ${service.name}`, err);
                    this.updateProgress(service.name, service.tier, 'FAILED', onUpdate, String(err));
                }
            })
        );

        const tier1Time = performance.now() - startTime;
        console.log(`[Bootstrap] ✓ Tier 1 Complete: ${tier1Time.toFixed(0)}ms`);

        // ====================================================================
        // TIER 2: SENSOR NETWORK (Deferred via requestIdleCallback)
        // ====================================================================
        this.TIER_2_SENSORS.forEach(s => {
            this.progress.set(s.name, {
                service: s.name,
                tier: s.tier,
                status: 'DEFERRED',
                deferredUntil: 'idle'
            });
        });
        onUpdate?.(this.getBootStatus());

        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => this.bootTier2(onUpdate), { timeout: 2000 });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => this.bootTier2(onUpdate), 100);
        }

        // ====================================================================
        // TIER 3: AI/ANALYTICS (On-Demand - Not auto-initialized)
        // ====================================================================
        this.TIER_3_AI.forEach(s => {
            this.progress.set(s.name, {
                service: s.name,
                tier: s.tier,
                status: 'DEFERRED',
                deferredUntil: 'on-demand'
            });
        });
        onUpdate?.(this.getBootStatus());

        console.log(`[Bootstrap NC-76.1] ⚡ TTI Ready: ${tier1Time.toFixed(0)}ms (Tier 2/3 deferred)`);
    }

    /**
     * Initialize Tier 2 sensor services during idle time
     */
    private static async bootTier2(onUpdate?: (progress: BootstrapProgress[]) => void): Promise<void> {
        if (this.tier2Initialized) return;
        this.tier2Initialized = true;

        console.log('[Bootstrap] ▶ Tier 2: Sensor Network (Idle)...');

        for (const service of this.TIER_2_SENSORS) {
            try {
                this.updateProgress(service.name, service.tier, 'INITIALIZING', onUpdate);
                await Promise.resolve(service.task());
                this.updateProgress(service.name, service.tier, 'COMPLETE', onUpdate);
                console.log(`[Bootstrap] ✅ T2: ${service.name}`);

                // Yield to main thread between services
                await new Promise(r => setTimeout(r, 10));
            } catch (err) {
                console.error(`[Bootstrap] ❌ T2: ${service.name}`, err);
                this.updateProgress(service.name, service.tier, 'FAILED', onUpdate, String(err));
            }
        }

        console.log('[Bootstrap] ✓ Tier 2 Complete');
    }

    /**
     * Manually trigger Tier 3 AI services when needed
     * Call this when entering AI-heavy views (e.g., DiagnosticTwin)
     */
    public static async bootTier3(onUpdate?: (progress: BootstrapProgress[]) => void): Promise<void> {
        if (this.tier3Initialized) return;
        this.tier3Initialized = true;

        console.log('[Bootstrap] ▶ Tier 3: AI/Analytics (On-Demand)...');

        await Promise.all(
            this.TIER_3_AI.map(async (service) => {
                try {
                    this.updateProgress(service.name, service.tier, 'INITIALIZING', onUpdate);
                    await Promise.resolve(service.task());
                    this.updateProgress(service.name, service.tier, 'COMPLETE', onUpdate);
                    console.log(`[Bootstrap] ✅ T3: ${service.name}`);
                } catch (err) {
                    console.error(`[Bootstrap] ❌ T3: ${service.name}`, err);
                    this.updateProgress(service.name, service.tier, 'FAILED', onUpdate, String(err));
                }
            })
        );

        console.log('[Bootstrap] ✓ Tier 3 Complete');
    }

    // ========================================================================
    // PROGRESS TRACKING
    // ========================================================================

    private static updateProgress(
        service: string,
        tier: 1 | 2 | 3,
        status: BootstrapProgress['status'],
        callback?: (p: BootstrapProgress[]) => void,
        error?: string
    ): void {
        this.progress.set(service, { service, tier, status, error });
        callback?.(this.getBootStatus());
    }

    public static getBootStatus(): BootstrapProgress[] {
        return Array.from(this.progress.values());
    }

    public static getTierStatus(tier: 1 | 2 | 3): BootstrapProgress[] {
        return this.getBootStatus().filter(p => p.tier === tier);
    }

    public static isTierComplete(tier: 1 | 2 | 3): boolean {
        const tierServices = this.getTierStatus(tier);
        return tierServices.length > 0 && tierServices.every(s => s.status === 'COMPLETE');
    }
}
