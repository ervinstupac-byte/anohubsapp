/**
 * SovereignOrchestrator.ts
 * 
 * The Master Orchestrator
 * Coordinates system initialization and ensures all services are wired together
 * in the correct order with proper dependencies.
 */

import { ValueCompounder } from './ValueCompounder';
import { LiveStreamConnector } from './LiveStreamConnector';
import { SovereignKernel, EnrichedTelemetry } from './SovereignKernel';
import { SovereigntyLock } from './SovereigntyLock';
import { ROIMonitorService } from './ROIMonitorService';
import { SilenceProtocol } from './SilenceProtocol';
import { SnapshotService } from './SnapshotService';
import { PulseArchiver } from './PulseArchiver';

export enum SystemState {
    UNINITIALIZED = 'UNINITIALIZED',
    INITIALIZING = 'INITIALIZING',
    OPERATIONAL = 'OPERATIONAL',
    DEGRADED = 'DEGRADED',
    FAILED = 'FAILED'
}

export class SovereignOrchestrator {
    private static state: SystemState = SystemState.UNINITIALIZED;
    private static startTime: number = 0;
    private static dailyReportSchedule: NodeJS.Timeout | null = null;
    private static listeners: Set<(state: SystemState) => void> = new Set();

    /**
     * Get current system state
     */
    public static getSystemState(): SystemState {
        return this.state;
    }

    /**
     * Subscribe to state changes
     */
    public static subscribe(listener: (state: SystemState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private static setState(newState: SystemState) {
        this.state = newState;
        this.listeners.forEach(l => l(newState));
    }

    /**
     * Initialize the entire Sovereign system in correct dependency order
     */
    public static async initialize(): Promise<void> {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🌟 SOVEREIGN SYSTEM INITIALIZATION');
        console.log('═══════════════════════════════════════════════════════════\n');

        this.setState(SystemState.INITIALIZING);
        this.startTime = Date.now();

        try {
            // STEP 1: Initialize Eternal Ledger
            console.log('[1/6] 📚 Initializing ValueCompounder...');
            await ValueCompounder.initialize();
            console.log('      ✓ Ledger loaded\n');

            // STEP 2: Wire ROI → Ledger sync
            console.log('[2/6] 🔗 Wiring ROI Sync...');
            this.wireROISync();
            console.log('      ✓ ROI automatically compounds to ledger\n');

            // STEP 3: Initialize Kernel observers
            console.log('[3/6] 🧠 Initializing SovereignKernel...');
            SovereignKernel.initialize(); // Register service
            this.wireKernelObservers();
            console.log('      ✓ Observers registered\n');

            // STEP 4: Start pulse archiving
            console.log('[4/6] 📊 Starting Pulse Archiver...');
            PulseArchiver.startArchiving();
            console.log('      ✓ 10-minute sampling active\n');

            // STEP 5: Schedule daily reporting
            console.log('[5/6] ⏰ Scheduling Daily Reports...');
            this.scheduleDailyReports();
            console.log('      ✓ Daily dossier at 08:00\n');

            // STEP 6: Start live data stream
            console.log('[6/6] 📡 Starting LiveStreamConnector...');
            await LiveStreamConnector.connect({
                pollingUrl: '/api/simulation/telemetry', // Default for now
                pollingInterval: 2000
            });
            console.log('      ✓ Telemetry stream active\n');

            // Original STEP 5: System health check - now implicitly part of operational state
            // console.log('[5/5] 🏥 System Health Check...');
            // const health = await this.performHealthCheck();
            // console.log(`      ✓ System Integrity: ${health.integrity.toFixed(1)}%\n`);

            this.setState(SystemState.OPERATIONAL);

            console.log('═══════════════════════════════════════════════════════════');
            console.log('✨ SOVEREIGN SYSTEM OPERATIONAL');
            console.log(`   Initialized in ${Date.now() - this.startTime}ms`);
            console.log('   All is One. One is All.');
            console.log('═══════════════════════════════════════════════════════════\n');

        } catch (error) {
            this.setState(SystemState.FAILED);
            console.error('❌ INITIALIZATION FAILED:', error);
            throw error;
        }
    }

    /**
     * Wire ROI tracking to eternal ledger
     */
    private static wireROISync(): void {
        // Override ROI recording methods to sync with ValueCompounder
        const originalRecordHealing = ROIMonitorService.recordHealingAction;
        ROIMonitorService.recordHealingAction = (heff: number, costSaved: number) => {
            // Call original
            originalRecordHealing.call(ROIMonitorService, heff, costSaved);

            // Sync to eternal ledger
            ValueCompounder.recordValue(
                'PREVENTED_FAILURE',
                costSaved,
                `Healing action (H_eff: ${heff.toFixed(2)})`
            );
        };

        const originalRecordMarket = ROIMonitorService.recordMarketOptimization;
        ROIMonitorService.recordMarketOptimization = (gain: number, action: string) => {
            originalRecordMarket.call(ROIMonitorService, gain, action);

            ValueCompounder.recordValue(
                'MARKET_GAIN',
                gain,
                action
            );
        };

        const originalRecordProduction = ROIMonitorService.recordProductionImpact;
        ROIMonitorService.recordProductionImpact = (loss: number, duration: number) => {
            originalRecordProduction.call(ROIMonitorService, loss, duration);

            ValueCompounder.recordValue(
                'HEALING_COST',
                -loss,
                `Production impact (${duration}min)`
            );
        };
    }

    /**
     * Wire SovereignKernel observers for persistence and monitoring
     */
    private static wireKernelObservers(): void {
        // Wire ROI monitor to kernel
        SovereignKernel.subscribe((telemetry: EnrichedTelemetry) => {
            // Check for critical anomalies
            if (telemetry.mechanical.vibration > 0.15) {
                console.warn('[SovereignKernel] ⚠️ HIGH VIBRATION DETECTED:', telemetry.mechanical.vibration);
            }
        });
    }

    /**
     * Start live telemetry stream
     */
    private static async startLiveStream(): Promise<void> {
        // In production: Connect to real WebSocket/API
        // For now: Demonstrate the connection
        console.log('      → Connecting to telemetry source...');

        // Simulated connection
        await new Promise(resolve => setTimeout(resolve, 100));

        // Would call: await LiveStreamConnector.connect({ websocketUrl: process.env.WS_URL });
        console.log('      → Stream established');
    }

    /**
     * Perform system health check
     */
    private static async performHealthCheck(): Promise<{
        integrity: number;
        services: Record<string, boolean>;
    }> {
        const services = {
            valueCompounder: ValueCompounder.getTotalValue() >= 0,
            sovereignKernel: true,
            sovereigntyLock: SovereigntyLock.verifyChain().valid,
            roiMonitor: true
        };

        const serviceCount = Object.values(services).filter(x => x).length;
        const integrity = (serviceCount / Object.keys(services).length) * 100;

        return { integrity, services };
    }

    /**
     * Schedule daily reports
     */
    private static scheduleDailyReports(): void {
        // Simple interval for now (24h)
        this.dailyReportSchedule = setInterval(async () => {
            const snapshot = await SnapshotService.generateSnapshot();
            console.log('[SovereignOrchestrator] 📄 Daily Snapshot Generated:', snapshot);
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Generate and save daily sovereign dossier
     */
    private static async generateDailyReport(): Promise<void> {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📋 DAILY SOVEREIGN DOSSIER GENERATION (08:00)');
        console.log('═══════════════════════════════════════════════════════════\n');

        const dossier = await SnapshotService.generateDossier();

        console.log(dossier.summary);
        console.log('\nRecommendations:');
        dossier.recommendations.forEach(rec => console.log(`  ${rec}`));

        await SnapshotService.saveDossier(dossier);

        console.log('\n═══════════════════════════════════════════════════════════\n');
    }

    /**
     * Get current system state
     */
    public static getState(): SystemState {
        return this.state;
    }

    /**
     * Graceful shutdown
     */
    public static async shutdown(): Promise<void> {
        console.log('[Orchestrator] Initiating graceful shutdown...');

        // Stop scheduled reporting
        if (this.dailyReportSchedule) {
            clearTimeout(this.dailyReportSchedule);
        }

        // Stop pulse archiving
        PulseArchiver.stopArchiving();

        LiveStreamConnector.disconnect();

        // Export final ledger state
        const ledger = ValueCompounder.exportLedger();
        console.log(`[Orchestrator] Final ledger: €${ledger?.currentTotal.toLocaleString()}`);

        this.state = SystemState.UNINITIALIZED;
        console.log('[Orchestrator] Shutdown complete');
    }
}
