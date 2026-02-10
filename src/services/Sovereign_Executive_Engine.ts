/**
 * SOVEREIGN EXECUTIVE ENGINE
 * The Unified Master 👑
 * 
 * "One Brain to Rule the Fortress."
 * Integrates Physics, Finance, Safety, Memory, and Supply Chain.
 */

import { MolecularIntegrityMonitor, CrystalHealth } from './MolecularIntegrityMonitor';
import { TruthJudge, Verdict } from './TruthJudge';
import { VibrationBaseline, VibrationProfile } from './VibrationBaseline';
import { EfficiencyCurveHardener, GoldenPoint } from './EfficiencyCurveHardener';
import { Drawing42Link, DocumentLink } from './Drawing42Link';

// PHASE 26-30 INTEGRATIONS
import { SafetyInterlockEngine } from './SafetyInterlockEngine';
import { EnergyMerchant } from './EnergyMerchant';
import { ErosionCorrosionSynergy } from './ErosionCorrosionSynergy';
import { SovereignMemory } from './SovereignMemory';
import { BasinCoordinator, UnitStatus } from './BasinCoordinator';
import { MetalFactoryLink } from './MetalFactoryLink';
import { AncestralOracle } from './AncestralOracle';
import { ErosionStatus } from './SandErosionTracker';
import { FinancialImpactEngine } from './core/FinancialImpactEngine';
import { KaplanPhysicsEngine } from './KaplanPhysicsEngine';
import { KaplanHubMonitor } from './KaplanHubMonitor';
import PeltonPhysicsOptimizer from './PeltonPhysicsOptimizer';
import GovernorHPUGuardian from './GovernorHPUGuardian';
import MarketDrivenStrategy from './MarketDrivenStrategy';
import SafeControlAdapter from './SafeControlAdapter';
import BaseGuardian from './BaseGuardian';
import { TelegramNotificationService } from './TelegramNotificationService';
import { createClient } from '@supabase/supabase-js';

// NC-11600: Sovereign Audit Logging
// Ideally, this should be injected or handled by a dedicated service.
// For now, we instantiate a client if env vars are available (mostly for client-side usage if allowed, or server-side).
// In a strict frontend env, this might fail or expose keys if not careful.
// Assuming this runs in a context where process.env is available (like the ingestion script or Node backend).
// NC-11940: Vite Environment Standardization
// FIXED: Replaced process.env usage with import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export enum PermissionTier {
    READ_ONLY = 'READ_ONLY',     // Observe & Log only. No decisions output.
    ADVISORY = 'ADVISORY',       // Default. Recommendations provided.
    AUTONOMOUS = 'AUTONOMOUS'    // Full authority to execute (SafeControlAdapter active).
}

export interface ExecutiveState {
    targetLoadMw: number;
    masterHealthScore: number; // 0-100
    activeProtections: string[];
    permissionTier: PermissionTier; // NEW: Gating Status
    financials: {
        grossProfitEur: number;
        molecularDebtEur: number;
        netSovereignProfitEur: number;
        mode: string;
    };
    operatorMessage: string;
    fleetAction?: string;
}

export interface ExecutionMetadata {
    isReplay?: boolean;
    simulationTime?: number;
    tier?: PermissionTier; // Defaults to ADVISORY
}

export class Sovereign_Executive_Engine extends BaseGuardian {
    // Sub-Engines
    private molecularMonitor: MolecularIntegrityMonitor;
    private truthJudge: TruthJudge;
    private vibrationBaseline: VibrationBaseline;
    private efficiencyHardener: EfficiencyCurveHardener;
    private drawingLink: Drawing42Link;
    private merchant: EnergyMerchant;
    private memory: SovereignMemory;
    private basin: BasinCoordinator;
    private factory: MetalFactoryLink;
    private oracle: typeof AncestralOracle;
    private kaplanPhysics: KaplanPhysicsEngine;
    private kaplanHub: KaplanHubMonitor;
    private peltonOptimizer: typeof PeltonPhysicsOptimizer;
    private governorHPU: GovernorHPUGuardian;
    private safeControlAdapter: SafeControlAdapter | null = null;

    constructor() {
        super();
        this.molecularMonitor = new MolecularIntegrityMonitor();
        this.truthJudge = new TruthJudge();
        this.vibrationBaseline = new VibrationBaseline();
        this.efficiencyHardener = new EfficiencyCurveHardener();
        this.drawingLink = new Drawing42Link();

        // New Integrations
        this.merchant = new EnergyMerchant();
        this.memory = new SovereignMemory();
        this.basin = new BasinCoordinator();
        this.factory = new MetalFactoryLink();
        this.oracle = AncestralOracle;
        this.kaplanPhysics = new KaplanPhysicsEngine();
        this.kaplanHub = new KaplanHubMonitor();
        this.peltonOptimizer = PeltonPhysicsOptimizer;
        this.governorHPU = new GovernorHPUGuardian();
        this.safeControlAdapter = new SafeControlAdapter(this.governorHPU);
    }

    /**
     * EXECUTE CYCLE
     * The Heartbeat of the Fortress.
     * Flow: PLC -> Truth -> Physics -> Finance -> Decision -> Fleet -> Memory
     */
    executeCycle(
        inputs: {
            vibration: number,
            scadaTimestamp: number,
            sensors: { a: any, b: any },
            market: { price: number, fcr: number, carbon: number },
            erosion: ErosionStatus,
            ph: number,
            // Kaplan Specifics (Optional)
            turbineType?: 'FRANCIS' | 'KAPLAN',
            bladeAngle?: number,
            hubOilPressure?: number,
            tailwaterLevel?: number
            // Pelton specifics may be provided under inputs.pelton
            , pelton?: { jetPressureBar?: number; needlePositionPct?: number; activeNozzles?: number; shellVibrationMm?: number; bucketHours?: number }
        },
        metadata?: ExecutionMetadata
    ): ExecutiveState {
        const tier = metadata?.tier || PermissionTier.ADVISORY;
        const protections: string[] = [];
        let opMsg = 'System Nominal.';

        // 1. DATA PULSE & SAFETY CHECK (Dead Man Switch)
        const heartbeatAge = Date.now() - inputs.scadaTimestamp;
        const deadManStatus = SafetyInterlockEngine.checkDeadManSwitch('GOOD', inputs.scadaTimestamp);
        if (!deadManStatus.safe) {
            if (metadata?.isReplay) {
                console.warn(`🚨 EMERGENCY OVERRIDE by SYSTEM_REFLEX: DEAD MAN SWITCH TRIPPED (${deadManStatus.action}). REPLAY MODE ACTIVE -> TRANSITIONING TO MONITOR_ONLY.`);
                protections.push('LATENCY_GUARD: MONITOR_ONLY (Replay)');
                opMsg = 'REPLAY WARN: Latency Guard bypassed.';
            } else {
                return this.emergencyShutdown(deadManStatus.action || 'SCADA_FAILURE');
            }
        }

        // 2. TRUTH JUDGEMENT (Validation)
        const truth = this.judgeSensors(inputs.sensors.a, inputs.sensors.b, 50);
        if (truth.verdict.winner === 'UNCERTAIN') {
            protections.push('SENSOR_DISCORD: Creating Synthetic Data Model.');
        }

        // 3. MOLECULAR PHYSICS (Erosion-Corrosion Synergy)
        const erosionSynergy = ErosionCorrosionSynergy.calculateSynergy(inputs.erosion, inputs.ph, 0.05);
        if (erosionSynergy.alert) protections.push(`CHEMISTRY ALERT: ${erosionSynergy.alert}`);

        // KAPLAN SPECIFIC LOGIC
        if (inputs.turbineType === 'KAPLAN' && inputs.bladeAngle !== undefined && inputs.hubOilPressure !== undefined) {
            // A. Combinator Check
            // Approximating Gate from Target Load for this cycle (or using prev state, here we'll infer it)
            // Just for checking physics coherence, assume inputs.sensors.a.gate is present or similar.
            // For now, let's use a dummy gate inferred from vibration/load or passed in sensors.
            const estimatedGate = 80; // Placeholder for sensor value
            const combinator = this.kaplanPhysics.calculateEfficiency(estimatedGate, inputs.bladeAngle, 20); // Head=20m

            if (combinator.isOffCam) {
                protections.push(`OFF-CAM: Eff drop ${combinator.efficiency.toFixed(1)}%. Deviation ${combinator.deviation.toFixed(1)}°.`);
                opMsg = 'OPTIMIZING: Blade Angle adjusting to Cam Curve...';
            }

            // B. Hub Health
            const hubHealth = this.kaplanHub.checkHubHealth(inputs.hubOilPressure, inputs.tailwaterLevel || 10, 2); // default Levels
            if (hubHealth.status === 'CRITICAL') {
                // ENVIRONMENTAL BREACH RISK
                return this.emergencyShutdown('ENVIRONMENTAL_RISK_HUB_LEAK');
            } else if (hubHealth.status === 'WARNING') {
                protections.push(hubHealth.message);
            }
        }

        const molecularHealth = this.molecularMonitor.calculateCrystalStress('U1', 10000, inputs.vibration, 24);
        this.factory.checkAndOrder(molecularHealth.integrityScore, 'D42-Rev9');

        // 4. MARKET DECISION
        let wearCost = 50 * erosionSynergy.synergyFactor;

        // Check SovereignMemory for any transformer critical override persisted by MasterIntelligenceEngine
        const overrides = this.memory.getOverrideHistory ? this.memory.getOverrideHistory() : [];
        const transformerCritical = Array.isArray(overrides) && overrides.some((o: any) => o && o.transformerCritical);

        const order = this.merchant.generateOrder({
            priceEurPerMwh: inputs.market.price,
            demandLevel: 'MED',
            fcrPriceEurPerMw: inputs.market.fcr,
            carbonCreditPriceEur: inputs.market.carbon,
            transformerCritical: !!transformerCritical
        }, 100, 100);

        // 5. THE DECISION (Sovereign Logic)
        // Convert Percent to MW (Assuming 100MW Capacity for this demo)
        let targetMw = (order.targetLoadPercent / 100) * 100;
        let mode: string = order.mode;

        // Overlay Physical Limits
        if (inputs.vibration > 2.0 && mode === 'RUN') {
            targetMw = targetMw * 0.8;
            protections.push('VIBRATION_CAP: Throttled to 80%.');
            mode = 'RUN_THROTTLED';
        }

        // 6. FLEET COORDINATION (Basin)
        let fleetMsg = 'Unit Independent.';
        let fleetActionStr = 'None';

        if (molecularHealth.integrityScore < 80) {
            const u1: UnitStatus = { id: 'U1', currentMw: targetMw, condition: 'WARNING', maxCapacityMw: 100 };
            const u2: UnitStatus = { id: 'U2', currentMw: 50, condition: 'OPTIMAL', maxCapacityMw: 100 };
            const fleetRes = this.basin.coordinateFleet(u1, u2, 100);
            fleetMsg = fleetRes.message;
            fleetActionStr = fleetRes.message;

            const u1Action = fleetRes.unitActions.find(a => a.unitId === 'U1');
            if (u1Action) targetMw = u1Action.targetMw;
        }

        // 7. ANCESTRAL MEMORY
        if (mode !== 'RUN') {
            this.oracle.learnFromOverride(`Auto-Decision: ${mode}`, { inputs, reasoning: order.reason });
        }

        // 8. MASTER HEALTH SIGNAL
        const hMaster = (100 * 0.3) + (molecularHealth.integrityScore * 0.4) + (100 * 0.3);

        // NC-11500: Telegram Alert for Low Trust Score
        if (hMaster < 70) {
            TelegramNotificationService.sendAlert(
                'LOW TRUST SCORE',
                hMaster.toFixed(1),
                '%',
                'SENSOR_INTEGRITY_PROTOCOL',
                Date.now()
            );
        }

        const finResult = FinancialImpactEngine.calculateNetProfit(
            order.estimatedRevenueEur, // Energy + Carbon (Assuming order includes carbon bonus if run)
            0, // FCR Revenue (Simulated as 0 if mode is RUN for now, or handled in order)
            0, // Carbon separated? In EnergyMerchant, order.estimatedRevenueEur includes carbon. Let's assume passed as single sum for now or split later.
            wearCost
        );

        // Pelton optimization integration: if pelton inputs present, compute nozzle sequencing and send to Governor HPU
        if (inputs.pelton && typeof inputs.pelton.jetPressureBar === 'number') {
            try {
                const peltonInp = {
                    jetPressureBar: inputs.pelton.jetPressureBar || 0,
                    needlePositionPct: inputs.pelton.needlePositionPct || 100,
                    activeNozzles: inputs.pelton.activeNozzles || 1,
                    shellVibrationMm: inputs.pelton.shellVibrationMm || 0,
                    bucketHours: inputs.pelton.bucketHours || 0
                };
                const seq = this.peltonOptimizer.optimizeNozzles(peltonInp, { maxNozzles: Math.max(8, peltonInp.activeNozzles + 4), minNozzles: 1 });

                // Market-driven decision
                const oracle = { hourlyPricesEurPerMWh: [(inputs.market && inputs.market.price) || 50] };
                const baselineEff = this.peltonOptimizer.optimizeNozzles({ ...peltonInp, activeNozzles: peltonInp.activeNozzles }).expectedEfficiencyPct;
                const decision = MarketDrivenStrategy.decideMode(oracle, peltonInp, baselineEff, 100 /* plant MW */, 200 /* wear cost €/h */);

                protections.push(`PELTON_OPTIMIZER: suggested ${seq.activeNozzles} nozzles (eff ${seq.expectedEfficiencyPct}%). Mode=${decision.mode} netBenefit=${decision.expectedNetBenefitEurPerHour.toFixed(2)}€/h`);
                opMsg = `${opMsg} | Pelton mode: ${decision.mode} (net ${decision.expectedNetBenefitEurPerHour.toFixed(2)}€/h)`;

                // Only apply if MarketDrivenStrategy recommends PERFORMANCE or BALANCE and safe control allows
                if ((decision.mode === 'PERFORMANCE' || decision.mode === 'BALANCE') && this.safeControlAdapter) {
                    if (tier === PermissionTier.AUTONOMOUS) {
                        const controlState = { stableLoad: inputs.vibration <= 1.5, frequencyHz: 50 };
                        const applied = this.safeControlAdapter.applySequenceIfSafe({ activeNozzles: seq.activeNozzles, sequenceOrder: seq.sequenceOrder }, controlState, 'Sovereign_Executive_Engine');
                        protections.push(`PELTON_CONTROL: applySequence result applied=${applied.applied} reason=${(applied as any).reason || 'ok'}`);
                        opMsg = `${opMsg} | Pelton apply:${applied.applied}`;
                    } else {
                        opMsg = `${opMsg} | Pelton apply: BLOCKED (Tier: ${tier})`;
                    }
                }
            } catch (e) {
                console.error('Pelton optimizer integration error:', e);
                protections.push('PELTON_OPTIMIZER_ERROR');
            }
        }

        // AUTHORITY GATING (Final Output Sanitization)
        if (tier === PermissionTier.READ_ONLY) {
            fleetActionStr = 'NONE (Read-Only)';
            opMsg = `[READ-ONLY] ${opMsg}`;
            // We do NOT zero out targetLoadMw here so the UI can still see "What I WOULD do",
            // but we ensure fleetAction is nullified.
        }

        // NC-11600: Sovereign Audit Execution
        // Log every executive decision, especially if protections are active or throttling occurred.
        if (supabase && (protections.length > 0 || mode !== 'RUN')) {
            supabase.from('sovereign_audit_log').insert({
                event_type: 'EXECUTIVE_DECISION',
                reason: protections.join(' | ') || `Mode: ${mode}`,
                metric_value: targetMw.toFixed(2),
                metric_unit: 'MW',
                active_protection: protections[0] || 'NONE',
                details: {
                    mode,
                    masterHealthScore: hMaster,
                    operatorMessage: opMsg,
                    inputs: {
                        vibration: inputs.vibration,
                        market: inputs.market
                    }
                }
            }).then(({ error }) => {
                if (error) console.error('[SovereignAudit] Failed to log decision:', error);
            });
        }

        return {
            targetLoadMw: targetMw,
            masterHealthScore: hMaster,
            activeProtections: protections,
            permissionTier: tier,
            financials: {
                grossProfitEur: finResult.totalRevenue,
                molecularDebtEur: wearCost,
                netSovereignProfitEur: finResult.netProfit,
                mode: mode
            },
            operatorMessage: `${opMsg} | ${fleetMsg}`,
            fleetAction: fleetActionStr
        };
    }

    private emergencyShutdown(reason: string): ExecutiveState {
        console.error(`💀 SOVEREIGN KILL SWITCH: ${reason}`);
        
        // NC-11500: Telegram Alert for Shutdown
        TelegramNotificationService.sendAlert(
            'EMERGENCY SHUTDOWN TRIGGERED',
            0,
            'RPM',
            reason,
            Date.now()
        );

        // NC-11600: Sovereign Audit Execution (Shutdown)
        if (supabase) {
            supabase.from('sovereign_audit_log').insert({
                event_type: 'PROTOCOL_9',
                reason: reason,
                metric_value: '0',
                metric_unit: 'MW',
                active_protection: 'EMERGENCY_SHUTDOWN',
                details: {
                    action: 'KILL_SWITCH',
                    operatorMessage: 'CRITICAL FAILURE. MACHINE STOPPED.'
                }
            }).then(({ error }) => {
                if (error) console.error('[SovereignAudit] Failed to log shutdown:', error);
            });
        }

        return {
            targetLoadMw: 0,
            masterHealthScore: 0,
            activeProtections: ['EMERGENCY_SHUTDOWN', reason],
            permissionTier: PermissionTier.READ_ONLY, // Default to safe state
            financials: { grossProfitEur: 0, molecularDebtEur: 0, netSovereignProfitEur: 0, mode: 'STOP' },
            operatorMessage: 'CRITICAL FAILURE. MACHINE STOPPED.'
        };
    }

    private judgeSensors(a: any, b: any, pred: number): { score: number, verdict: Verdict } {
        const v = this.truthJudge.reconcileTruth(a, b, pred);
        return { score: v.winner === 'UNCERTAIN' ? 0 : 100, verdict: v };
    }

    /**
     * Default confidence score calculation
     */
    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}

// Part of the Sovereign Engineering Corps - Protocol NC-11700.
