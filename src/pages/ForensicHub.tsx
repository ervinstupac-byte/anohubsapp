import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Lightbulb, AlertTriangle, ArrowRight, X, FileText, Wrench, Zap, Database, Play, Pause, History, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';
import { ForensicVisualizer } from '../components/dashboard/ForensicVisualizer';
import { HistoricalDataService, WisdomTooltip, HISTORICAL_PATTERNS, ANCESTRAL_PATTERNS } from '../services/HistoricalDataService';
import { KnowledgeBaseService } from '../services/KnowledgeBaseService';
import { SovereignExecutiveService, ExecutiveVerdict } from '../services/SovereignExecutiveService';
import { Sovereign_Executive_Engine, PermissionTier } from '../services/Sovereign_Executive_Engine';
import { EmergencyManualService, EmergencySOP } from '../services/EmergencyManualService';
import { WarehouseIntegrationService, SparePart } from '../services/WarehouseIntegrationService';
import { InstitutionalKnowledgeService, KnowledgeSearchResult } from '../services/InstitutionalKnowledgeService';
import { ROIMonitorService, FinancialEvent } from '../services/ROIMonitorService';
import { AuditTrailService, AuditEntry } from '../services/AuditTrailService';
import { PurchaseOrderService } from '../services/PurchaseOrderService';
import { AuditorExportService, ComplianceReport } from '../services/AuditorExportService';
import { ConsultingEngine } from '../services/ConsultingEngine';
import { EcoGovernanceUnit } from '../services/EcoGovernanceUnit';
import { FishPassageOrchestrator, FishPassageState } from '../services/FishPassageOrchestrator';
import { BasinCoordinator, BasinState, FleetAction } from '../services/BasinCoordinator';
import { H2Synthesizer, ElectrolysisSession } from '../services/H2Synthesizer';
import { BlackStartOrchestrator } from '../services/BlackStartOrchestrator';
import { SmartContractProcurement, ProcurementOrder } from '../services/SmartContractProcurement';
import { CivilSecurityModule, DamStabilityGauge, SeismicData } from '../services/CivilSecurityModule';
import { PredictiveProcurementService, ProcurementRequisition } from '../services/PredictiveProcurementService';
import { LogisticsView } from '../components/dashboard/LogisticsView';
import { AutoReportService } from '../services/AutoReportService';
import { LegacyBridgeService } from '../services/LegacyBridgeService';
import { runForensicPulseCheck, IntegrityReport } from '../services/SystemIntegrityService';
import { SafetyInterlockEngine } from '../services/SafetyInterlockEngine';
import { ProfessionalReportEngine } from '../features/reporting/ProfessionalReportEngine';
import { useTelemetryStore, DiagnosticSnapshot } from '../features/telemetry/store/useTelemetryStore';
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../core/TechnicalSchema';
import { ForensicReportService } from '../services/ForensicReportService';
import { MaintenanceOrchestrator } from '../services/MaintenanceOrchestrator';
import { AlignmentWizard } from '../components/maintenance/AlignmentWizard';
import { KineticPolarView } from '../components/forensics/KineticPolarView';
import { SovereignSoundEngine } from '../components/ui/SovereignSoundEngine';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { useAssetContext } from '../contexts/AssetContext';
import { mapAssetToEnhancedAsset } from '../utils/assetMapper';

import OutageOptimizer from '../services/OutageOptimizer';

// Mapping Visualizer Types to Oracle Patterns for "Contextual Wisdom"
const CONTEXT_MAP: Record<string, keyof typeof ANCESTRAL_PATTERNS> = {
    'ALIGNMENT': 'MISALIGNMENT_2X',
    'GAP': 'CAVITATION_SIGMA',
    'ELECTRICAL': 'SHAFT_CURRENT',
    'TORQUE_M36': 'LOOSENESS_PHASE',
    'TORQUE_M24': 'LOOSENESS_PHASE',
    'CAVITATION': 'CAVITATION_SIGMA'
};

const ForensicHub: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'GENERATOR' | 'RUNNER' | 'OVERVIEW' | 'KINETIC' | 'LOGISTICS'>('OVERVIEW');
    const [rightPanelTab, setRightPanelTab] = useState<'ORACLE' | 'LEDGER' | 'EXECUTIVE' | 'INVENTORY' | 'KNOWLEDGE' | 'CONSULTING' | 'ECO' | 'SECURITY'>('ORACLE');
    const [selectedContext, setSelectedContext] = useState<{ component: string; value?: string } | null>(null);
    const [wisdomFeed, setWisdomFeed] = useState<WisdomTooltip[]>([]);
    const [showAlignmentWizard, setShowAlignmentWizard] = useState(false);
    
    // NC-Unused-Code Integration: Emergency SOP & Inventory & Knowledge
    const [showSOP, setShowSOP] = useState(false);
    const [sopData, setSopData] = useState<EmergencySOP | null>(null);
    const [inventory, setInventory] = useState<SparePart[]>([]);
    const [knowledgeResults, setKnowledgeResults] = useState<KnowledgeSearchResult[]>([]);
    const [roiEvents, setRoiEvents] = useState<FinancialEvent[]>([]);
    const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
    const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
    const [optimizationReport, setOptimizationReport] = useState<any>(null);
    const [ecoStatus, setEcoStatus] = useState<any>(null);
    const [fishState, setFishState] = useState<FishPassageState | null>(null);
    const [basinAction, setBasinAction] = useState<FleetAction | null>(null);
    const [h2Session, setH2Session] = useState<ElectrolysisSession | null>(null);
    const [blackStartStatus, setBlackStartStatus] = useState<{ active: boolean; step: number } | null>(null);
    const [daoOrders, setDaoOrders] = useState<ProcurementOrder[]>([]);
    const [procurementRequisitions, setProcurementRequisitions] = useState<ProcurementRequisition[]>([]);
    const [outagePlan, setOutagePlan] = useState<any>(null);
    
    // Security Module
    const [damStability, setDamStability] = useState<DamStabilityGauge | null>(null);
    const [seismicHistory, setSeismicHistory] = useState<SeismicData[]>([]);
    const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
    const [safetyStatus, setSafetyStatus] = useState<any>(null);

    const { 
        identity, 
        site, 
        mechanical, 
        hydraulic, 
        physics, 
        penstock, 
        structural,
        financials,
        specializedState,
        appliedMitigations
    } = useTelemetryStore();

    // Reconstruct technicalState for legacy compatibility
    const technicalState = React.useMemo(() => ({
        ...DEFAULT_TECHNICAL_STATE,
        identity,
        site,
        mechanical,
        hydraulic,
        penstock,
        structural,
        financials,
        specializedState,
        appliedMitigations,
        physics: {
            ...DEFAULT_TECHNICAL_STATE.physics,
            ...physics,
            // Ensure Decimal values are handled if needed, or use raw physics if compatible
            // Assuming physics in store is compatible or partial
        }
    }), [identity, site, mechanical, hydraulic, physics, penstock, structural, financials, specializedState, appliedMitigations]);

    // NC-13800: STRESS TEST STATE
    const [simSigma, setSimSigma] = useState<number | null>(null);
    const [simEff, setSimEff] = useState<number | null>(null);
    const [simRpm, setSimRpm] = useState<number | null>(null);
    const [simLooseness, setSimLooseness] = useState(false);
    const [calculatedLoss, setCalculatedLoss] = useState<string | null>(null);

    const { selectedAsset } = useAssetContext();

    // Telemetry & Alarms
    const activeAlarms = useTelemetryStore(state => state.activeAlarms);
    const { snapshots, addSnapshot, playbackSnapshot, setPlaybackSnapshot, setExecutiveResult } = useTelemetryStore(state => ({
        snapshots: state.snapshots,
        addSnapshot: state.addSnapshot,
        playbackSnapshot: state.playbackSnapshot,
        setPlaybackSnapshot: state.setPlaybackSnapshot,
        setExecutiveResult: state.setExecutiveResult
    }));

    // NC-17000: Executive Verdict State
    const [executiveVerdict, setExecutiveVerdict] = useState<ExecutiveVerdict | null>(null);
    const engineRef = useRef(new Sovereign_Executive_Engine());

    // Initialize Unused Services
    useEffect(() => {
        // Warehouse
        WarehouseIntegrationService.initializeInventory();
        const parts = WarehouseIntegrationService.getCriticalStockouts(); // Start with critical ones
        // Also add some random parts for demo
        const allParts = WarehouseIntegrationService.getAssetParts('UNIT-1');
        setInventory([...parts, ...allParts].filter((v, i, a) => a.findIndex(t => t.componentId === v.componentId) === i));

        // Generate initial SOP
        const sop = EmergencyManualService.generateLiveEmergencySOP();
        setSopData(sop);
        
        // Knowledge Base
        const initKnowledge = async () => {
            await InstitutionalKnowledgeService.initializeWithSeedData();
            // Search for some default symptoms or recent alarms
            // For now, search for 'vibration' and 'pressure' as default
            const results = await InstitutionalKnowledgeService.searchBySymptoms(['vibration', 'pressure', 'cavitation']);
            setKnowledgeResults(results);
        };
        initKnowledge();

        // ROI Monitor (Simulated data if empty)
        if (ROIMonitorService.exportEvents().length === 0) {
             ROIMonitorService.recordHealingAction(0.95, 15000);
             ROIMonitorService.recordMarketOptimization(2500, 'Price Arbitrage - Battery Discharge');
             ROIMonitorService.recordEvent({ timestamp: Date.now()-100000, type: 'PREVENTED_FAILURE', amount: 45000, description: 'Early bearing failure detection prevented outage' });
        }
        setRoiEvents(ROIMonitorService.exportEvents());

        // Audit Trail (Simulated data if empty)
        if (AuditTrailService.getAuditTrail('UNIT-1').length === 0) {
            AuditTrailService.logDecision('UNIT-1', {
                timestamp: Date.now(),
                severity: 'WARNING',
                action: 'MONITOR',
                primaryDiagnosis: 'Vibration Trend Increasing',
                reasoning: 'Spectrum analysis shows 2xRPM component rising. Cavitation risk moderate.',
                contributingFactors: ['High Flow', 'Low Tailwater'],
                sourceModules: ['VibrationExpert', 'PhysicsEngine'],
                confidence: 85,
                actionPlan: { step1_immediate: 'Log event', step2_field: 'Inspect draft tube', step3_longterm: 'Check alignment' }
            });
            AuditTrailService.logDecision('UNIT-1', {
                timestamp: Date.now() - 3600000,
                severity: 'NORMAL',
                action: 'NONE',
                primaryDiagnosis: 'System Nominal',
                reasoning: 'All parameters within ISO limits.',
                contributingFactors: [],
                sourceModules: ['SovereignExecutive'],
                confidence: 99,
                actionPlan: { step1_immediate: 'Continue operation', step2_field: 'None', step3_longterm: 'None' }
            });
        }
        setAuditEntries(AuditTrailService.getAuditTrail('UNIT-1'));

        // Compliance Report
        const auditor = new AuditorExportService([], []); // Simulated injection
        const report = auditor.generateComplianceReport(30);
        setComplianceReport(report);

        // Consulting Engine Report
        const optReport = ConsultingEngine.generateOptimizationReport(
            { id: 1, name: 'Unit 1', turbine_family: 'FRANCIS' } as any,
            { getTolerances: () => ({ vibration_limit: { value: 4.5 }, shaft_alignment: { value: 0.05 } }) } as any,
            [
                { type: 'geodetic', timestamp: Date.now(), data: { shaft_deviation: 0.08, foundation_settlement: 1.5 } },
                { type: 'vibration', timestamp: Date.now(), data: { rms_vibration: 5.2, dominant_frequency: 120, running_speed: 428 } }
            ] as any[],
            []
        );
        setOptimizationReport(optReport);

        // Eco Governance
        EcoGovernanceUnit.monitorEnvironmentalFlow(10, 12); // Initial data
        EcoGovernanceUnit.monitorWaterQuality({ dissolvedOxygen: 6.5, temperature: 18, pH: 7.2, turbidity: 5 });
        setEcoStatus(EcoGovernanceUnit.getEnvironmentalStatus());

        // Fish Passage (Simulated)
        const fish = FishPassageOrchestrator.optimizeFlow(new Date().getMonth(), 150, 450);
        setFishState(fish);

        // Basin Coordinator (Simulated)
        const basin = new BasinCoordinator();
        const fleetAction = basin.coordinateFleet(
            { id: 'U1', currentMw: 45, condition: 'OPTIMAL', maxCapacityMw: 100 },
            { id: 'U2', currentMw: 80, condition: 'WARNING', maxCapacityMw: 100 },
            150
        );
        setBasinAction(fleetAction);

        // H2 Synthesizer (Simulated)
        H2Synthesizer.initializeFuelCells();
        const h2Check = H2Synthesizer.checkElectrolysisTrigger({ islandMode: false, marketDemand: 20, excessPower: 5 });
        if (h2Check.shouldRun) {
            // No-op for demo
        }
        // Create a simulated session for display
        setH2Session({
            sessionId: 'H2-AUTO-001',
            startTime: Date.now() - 3600000,
            endTime: null,
            powerInput: 85,
            h2Produced: 12.5,
            efficiency: 68,
            trigger: 'ZERO_DEMAND',
            status: 'RUNNING'
        });

        // Smart Contract Orders (Simulated)
        const simulatedOrder = SmartContractProcurement.createOrder('SEAL-KIT-SKF', 2, 450, 95);
        setDaoOrders([simulatedOrder]);

        // Predictive Procurement (Scan)
        const reqs = PredictiveProcurementService.scanFleet();
        setProcurementRequisitions(reqs);



        // Auditor Export (Compliance) - Already handled above
        // const compReport = AuditorExportService.generateComplianceReport('UNIT-1', { ... });
        // setComplianceReport(compReport);

        // Outage Optimizer (Strategic) - Handled in subsequent effect
        // const plan = OutageOptimizer.findOptimalWindow(48, new Date());
        // setOutagePlan(plan);

        // Civil Security (Simulated)
        CivilSecurityModule.registerPiezometer({ id: 'PZ-01', location: 'Foundation Left', elevation: 85, pressure: 2.1, upliftForce: 0, timestamp: Date.now() });
        CivilSecurityModule.registerPiezometer({ id: 'PZ-02', location: 'Foundation Right', elevation: 85, pressure: 1.8, upliftForce: 0, timestamp: Date.now() });
        CivilSecurityModule.registerSeismicEvent({ stationId: 'SEIS-MAIN', peakGroundAcceleration: 0.01, frequency: 12, magnitude: 1.2, timestamp: Date.now() });
        
        setDamStability(CivilSecurityModule.getStabilityGauge());
        setSeismicHistory(CivilSecurityModule.getSeismicHistory());

        // System Integrity Check (Async)
        runForensicPulseCheck().then(report => {
            console.log('[ForensicHub] System Integrity Report:', report);
            setIntegrityReport(report);
        });

        // Safety Interlocks
        setSafetyStatus(SafetyInterlockEngine.getStatus());

    }, []);
    
    const telemetry = useTelemetryStore(state => ({
        mechanical: state.mechanical,
        hydraulic: state.hydraulic,
        physics: state.physics, // Needed for Surge Pressure
        alignment: state.alignment // NC-15200: Needed for Kinetic Oracle
    }));

    // Effective Values (Live + Sim)
    const rpm = simRpm !== null ? simRpm : (telemetry.mechanical?.rpm || 0);
    const effectiveTelemetry = {
        ...telemetry,
        hydraulic: {
            ...telemetry.hydraulic,
            sigma: simSigma !== null ? simSigma : telemetry.hydraulic?.sigma,
            efficiency: simEff !== null ? simEff : telemetry.hydraulic?.efficiency
        }
    };

    // 1. Reactive Wisdom Feed (Based on Alarms & Telemetry)
    useEffect(() => {
        // Consult Oracle whenever alarms change OR alignment updates
        const alarmCodes = activeAlarms.map(a => a.message.includes('MECHANICAL') ? 'SOVEREIGN_MECHANICAL_ALARM' : a.id);
        const tip = HistoricalDataService.consult(alarmCodes, effectiveTelemetry);

        // NC-17000: Real-time Executive Evaluation
        // Create a transient snapshot for evaluation even if not saving
        const transientSnapshot: DiagnosticSnapshot = {
            id: 'live-eval',
            timestamp: Date.now(),
            triggerType: 'AUTO',
            pathology: tip?.title || 'NOMINAL',
            telemetry: {
                rpm: effectiveTelemetry.mechanical?.rpm || 0,
                vibrationX: effectiveTelemetry.mechanical?.vibrationX || 0,
                vibrationY: effectiveTelemetry.mechanical?.vibrationY || 0,
                bearingTemp: effectiveTelemetry.mechanical?.bearingTemp || 0
            },
            kineticState: {
                eccentricity: effectiveTelemetry.alignment?.eccentricity || 0,
                phase: effectiveTelemetry.alignment?.phase || 0,
                rsquared: effectiveTelemetry.alignment?.rsquared || 0,
                offset: effectiveTelemetry.alignment?.offset || 0
            },
            oracleWisdom: {
                title: tip?.title || 'System Nominal',
                message: tip?.message || '',
                action: tip?.action || ''
            }
        };

        const verdict = SovereignExecutiveService.evaluate(transientSnapshot);
        setExecutiveVerdict(verdict);

        // NC-10051: Full Sovereign Engine Cycle
        const execState = engineRef.current.executeCycle({
            vibration: effectiveTelemetry.mechanical?.vibrationX || 0,
            scadaTimestamp: Date.now(),
            sensors: { a: {}, b: {} }, // Simulated validation inputs
            market: { price: 65, fcr: 0, carbon: 0 },
            erosion: { sedimentPPM: 10, bucketThinningRate: 100, estimatedBucketLife: 20 },
            ph: 7.2,
            physicsAnalysis: {
                cavitation: { risk: 'LOW' },
                zone: { zone: 'OPTIMAL' },
                surgePressureBar: effectiveTelemetry.physics?.surgePressureBar || 0
            }
        }, { tier: PermissionTier.ADVISORY });
        setExecutiveResult(execState);

        if (tip) {
            addWisdom(tip);

            // NC-15300: Auto-Snapshot on High Severity
            if (tip.severity === 'WARNING' || tip.severity === 'CRITICAL') {
                const snapshot = {
                    ...transientSnapshot,
                    id: crypto.randomUUID()
                };

                // Debug Output for Verification
                console.log('CAPTURED SNAPSHOT:', JSON.stringify(snapshot, null, 2));

                addSnapshot(snapshot);
            }
        }

        // NC-OutageOptimizer: Run calculation if Executive Tab is active (or just once)
        if (!outagePlan) {
            // Simulated Risk Map
            const pfail = {
                'Main Bearing': 0.15 + (effectiveTelemetry.mechanical?.vibrationX || 0),
                'Generator Stator': 0.05,
                'Wicket Gates': 0.02
            };
            // Simulated Price Forecast (Sine wave)
            const prices = [];
            const now = Date.now();
            for (let i = 0; i < 720; i++) {
                prices.push({
                    timestamp: now + i * 3600000,
                    priceEURperMWh: 50 + 30 * Math.sin(i / 24) + Math.random() * 10
                });
            }
            const plan = OutageOptimizer.findOptimalOutageWindow(pfail, prices, now);
            setOutagePlan(plan);
        }
    }, [activeAlarms, effectiveTelemetry, simSigma, telemetry.alignment, simLooseness]); // Depend on alignment updates explicitly

    // NC-NEW: Filter snapshots to only show manual ones in Ledger
    const manualSnapshots = snapshots.filter(s => s.triggerType === 'MANUAL');

    const addWisdom = (tip: WisdomTooltip) => {
        setWisdomFeed(prev => {
            // Avoid duplicates
            if (prev.some(t => t.id === tip.id)) return prev;
            return [tip, ...prev].slice(0, 5); // Keep last 5
        });
    };

    const handleHotspotSelect = (id: string, context: any) => {
        // 0. Check for Drill-Down Action
        if (context.drillDown) {
            setActiveTab(context.drillDown);
            return;
        }

        // 1. Update Knowledge Panel Context
        setSelectedContext({
            component: context.label,
            value: context.value
        });

        // 2. Trigger Oracle Fly-In (Drill-Down Logic)
        const label = context.label.toUpperCase();
        let oracleKey: keyof typeof ANCESTRAL_PATTERNS | undefined;

        if (label.includes('ALIGNMENT') || label.includes('BEARING')) oracleKey = 'MISALIGNMENT_2X';
        else if (label.includes('GAP') || label.includes('CAVITATION')) oracleKey = 'CAVITATION_SIGMA';
        else if (label.includes('TORQUE') || label.includes('ANCHOR') || label.includes('COVER')) oracleKey = 'LOOSENESS_PHASE';
        else if (label.includes('GROUND') || label.includes('ELECTRICAL')) oracleKey = 'SHAFT_CURRENT';

        if (oracleKey) {
            const wisdom = HistoricalDataService.getWisdom(oracleKey);
            addWisdom({
                ...wisdom,
                id: `${wisdom.id}-${Date.now()}` // Unique ID for animation
            });
        }
    };

    const removeWisdom = (id: string) => {
        setWisdomFeed(prev => prev.filter(t => t.id !== id));
    };

    const handleGenerateReport = async () => {
        const currentEff = effectiveTelemetry.hydraulic?.efficiency || 0.94;
        const targetEff = 0.92;

        // NC-13800: Financial Loss Logic
        if (currentEff < targetEff) {
            const powerMW = 5.2;
            const priceEur = 65;
            const lossMWh = (targetEff - currentEff) * powerMW;
            const lossEur = lossMWh * priceEur;
            setCalculatedLoss(`EFFICIENCY ALERT: ${currentEff.toFixed(2)} < ${targetEff}. HOURLY LOSS: €${lossEur.toFixed(2)}`);
        } else {
            setCalculatedLoss(null);
        }

        try {
            // Use ProfessionalReportEngine for a full Technical Audit
            // Fix: physics properties must be numbers, not Decimals
            // Ensure technicalState matches TechnicalProjectState structure exactly if passed to engine
            const compliantState: TechnicalProjectState = technicalState;

            await ProfessionalReportEngine.generateTechnicalAudit(compliantState, 'FORENSIC-HUB-AUDIT');
        } catch (err) {
            console.error('Failed to generate professional report:', err);
            // Fallback to legacy
            const reportData = {
                assetName: "Unit 1 - Francis (Forensic Audit)",
                kpis: {
                    capex: 12000000,
                    revenue: 2500000,
                    opex: 150000,
                    roi: 18.5,
                    lcoe: 45.2,
                    payback: 4.8,
                    powerMW: 5.2,
                    energyGWh: 38.5
                },
                assumptions: {
                    electricityPrice: 0.065,
                    interestRate: 4.5,
                    lifespan: 40,
                    opexPercent: 1.5
                }
            };
    
            const service = new ForensicReportService();
            const blob = service.generateFinancialProspectus({
                ...reportData,
                t: t as any // Type assertion for i18n
            });
    
            // Trigger download
            ForensicReportService.openAndDownloadBlob(blob, `Forensic_Report_${Date.now()}.pdf`, true);
        }
    };

    const handleGenerateServiceReport = async () => {
        const autoReport = new AutoReportService();
        const simulatedMeasurements = [
            { parameter: 'Vibration (ISO)', asFound: 4.5, asLeft: 1.2, unit: 'mm/s', standard: 2.5, improvement: 73 },
            { parameter: 'Cavitation (Sigma)', asFound: 0.8, asLeft: 1.1, unit: 'σ', standard: 1.0, improvement: -37 }, // Negative improvement handled by logic
            { parameter: 'Shaft Alignment', asFound: 0.15, asLeft: 0.03, unit: 'mm/m', standard: 0.05, improvement: 80 },
            { parameter: 'Efficiency', asFound: 88.5, asLeft: 92.1, unit: '%', standard: 93.0, improvement: 4.1 }
        ];
        
        // Simulated generation logic (since we can't really generate PDF in this env easily without proper setup)
        // In a real scenario, we'd call autoReport.generateReport(...)
        // Here we'll simulate the AI insights generation which is the core logic
        
        console.log('[AutoReport] Generating AI Service Report...');
        alert('Service Report Generation Started. AI Insights:\n\n' + 
              '- Vibration reduced by 73% (Life Extension: +14 months)\n' + 
              '- Efficiency gained +4.1% (~€45k/year)\n' + 
              '- Alignment restored to ISO Class A');
    };

    const handleDownloadSnapshot = (snap: DiagnosticSnapshot) => {
        const service = new ForensicReportService();
        const blob = service.generateForensicSnapshotReport(snap);
        ForensicReportService.openAndDownloadBlob(blob, `Forensic_Snapshot_${snap.id.substring(0, 8)}.pdf`, true);
    };

    return (
        <div className="w-full h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            {/* HEADER */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                        <Activity className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter">Forensic Hub</h1>
                        <p className="text-xs text-slate-400 font-mono">NC-13200 Command Center</p>
                    </div>
                </div>

                {/* NC-13800: STRESS TEST CONTROLS */}
                <div className="flex items-center gap-2 px-4 py-1 bg-black/40 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Stress Test:</span>
                    <button
                        onClick={() => setSimSigma(prev => prev === 1.1 ? null : 1.1)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simSigma === 1.1 ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        SIGMA 1.1
                    </button>
                    <button
                        onClick={() => setSimEff(prev => prev === 0.88 ? null : 0.88)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simEff === 0.88 ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        EFF 0.88
                    </button>
                    <button
                        onClick={() => setSimRpm(prev => prev === 120 ? null : 120)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simRpm === 120 ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        RPM 120
                    </button>
                    <button
                        onClick={() => setSimLooseness(prev => !prev)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simLooseness ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        LOOSENESS
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* ALIGNMENT WIZARD TRIGGER */}
                    <button
                        onClick={() => rpm <= 5 && setShowAlignmentWizard(true)}
                        disabled={rpm > 5}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${rpm > 5
                            ? 'bg-red-950/20 border-red-500/50 cursor-not-allowed opacity-80 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                            }`}
                    >
                        <Wrench className={`w-4 h-4 ${rpm > 5 ? 'text-red-500' : 'text-purple-400'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${rpm > 5 ? 'text-red-400' : 'text-white'}`}>
                            {rpm > 5 ? 'LOCKOUT ACTIVE' : 'Alignment Wizard'}
                        </span>
                        {rpm > 5 ? (
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" title="Unsafe: Rotating" />
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Safe: Stopped" />
                        )}
                    </button>

                    {/* REPORT GENERATION */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Prospectus</span>
                        </button>
                        <button
                            onClick={handleGenerateServiceReport}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-all active:scale-95"
                        >
                            <Wrench className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Service Rpt</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowSOP(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-95 animate-pulse"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Emergency SOP</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: VISUALIZER (HOTSPOTS) OR KINETIC VIEW */}
                <div className="flex-1 relative bg-grid-pattern">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 pointer-events-none" />

                    {activeTab === 'KINETIC' ? (
                        <div className="w-full h-full p-8">
                            <GlassCard className="w-full h-full relative overflow-hidden">
                                <KineticPolarView />
                            </GlassCard>
                        </div>
                    ) : activeTab === 'LOGISTICS' ? (
                        <div className="w-full h-full p-8 overflow-y-auto">
                            <GlassCard className="w-full min-h-full relative overflow-hidden">
                                <LogisticsView requisitions={procurementRequisitions} inventory={inventory} />
                            </GlassCard>
                        </div>
                    ) : (
                        <ForensicVisualizer
                            viewMode={activeTab as any}
                            onHotspotSelect={handleHotspotSelect}
                        />
                    )}

                    {/* View Controls */}
                    <div className="absolute bottom-8 left-8 flex gap-2 z-20">
                        {['OVERVIEW', 'GENERATOR', 'RUNNER', 'KINETIC', 'LOGISTICS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md border transition-all ${activeTab === tab
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                    : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {tab === 'KINETIC' ? 'Model' : tab === 'LOGISTICS' ? 'Supply' : tab}
                            </button>
                        ))}
                    </div>

                    {/* FINANCIAL LOSS OVERLAY */}
                    <AnimatePresence>
                        {calculatedLoss && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="absolute bottom-24 right-8 bg-red-950/80 border border-red-500 backdrop-blur-xl p-4 rounded-xl shadow-2xl max-w-sm"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <h3 className="text-sm font-black text-white uppercase">Revenue Hemorrhage</h3>
                                </div>
                                <div className="text-xs font-mono text-red-200">
                                    {calculatedLoss}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: INTELLIGENCE FEED (ANCESTRAL ORACLE) */}
                <div className="w-96 border-l border-slate-800 bg-slate-900/30 backdrop-blur-sm flex flex-col">
                    {/* Right Panel Tabs */}
                    <div className="flex border-b border-slate-800">
                        <button
                            onClick={() => setRightPanelTab('ORACLE')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'ORACLE'
                                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            Oracle
                        </button>
                        <button
                            onClick={() => setRightPanelTab('LEDGER')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'LEDGER'
                                ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <Database className="w-4 h-4" />
                            Ledger
                        </button>
                        <button
                            onClick={() => setRightPanelTab('EXECUTIVE')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'EXECUTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Exec
                        </button>
                        <button
                            onClick={() => setRightPanelTab('INVENTORY')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'INVENTORY'
                                ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <Wrench className="w-4 h-4" />
                            Spares
                        </button>
                        <button
                            onClick={() => setRightPanelTab('KNOWLEDGE')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'KNOWLEDGE'
                                ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            KB
                        </button>
                        <button
                            onClick={() => setRightPanelTab('CONSULTING')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'CONSULTING'
                                ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            ROI
                        </button>
                        <button
                            onClick={() => setRightPanelTab('ECO')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'ECO'
                                ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <Activity className="w-4 h-4" />
                            Eco
                        </button>
                        <button
                            onClick={() => setRightPanelTab('SECURITY')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'SECURITY'
                                ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Security
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        {rightPanelTab === 'ORACLE' ? (
                            <>
                                {/* Context Panel */}
                                <div className="h-32">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Active Context</h3>
                                    <AnimatePresence mode="wait">
                                        {selectedContext ? (
                                            <motion.div
                                                key="context"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700"
                                            >
                                                <div className="text-cyan-400 font-bold text-lg mb-1">{selectedContext.component}</div>
                                                <div className="text-slate-400 text-sm font-mono">{selectedContext.value || 'Monitoring...'}</div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl"
                                            >
                                                <span className="text-slate-600 text-xs uppercase font-bold">Select a component</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Wisdom Stream */}
                                <div className="flex-1">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                        <span>Ancestral Wisdom</span>
                                        <span className="px-2 py-0.5 bg-cyan-900/30 text-cyan-400 rounded text-[10px]">LIVE</span>
                                    </h3>

                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {wisdomFeed.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`relative p-4 rounded-xl border backdrop-blur-md ${item.severity === 'CRITICAL'
                                                        ? 'bg-red-950/40 border-red-500/50'
                                                        : item.severity === 'WARNING'
                                                            ? 'bg-amber-950/40 border-amber-500/50'
                                                            : 'bg-slate-800/40 border-slate-700'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => removeWisdom(item.id)}
                                                        className="absolute top-2 right-2 text-slate-500 hover:text-white"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>

                                                    <div className="flex items-start gap-3 mb-2">
                                                        {item.severity === 'CRITICAL' ? (
                                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                                        ) : (
                                                            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                                                        )}
                                                        <div>
                                                            <h4 className={`text-sm font-bold ${item.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                                                                }`}>
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                                {item.message}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className={`mt-3 pt-3 border-t flex items-center gap-2 ${item.severity === 'CRITICAL' ? 'border-red-500/20' : 'border-slate-700'
                                                        }`}>
                                                        <Wrench className="w-3 h-3 text-slate-500" />
                                                        <span className="text-xs font-mono text-slate-300">{item.action}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {wisdomFeed.length === 0 && (
                                            <div className="text-center py-10 opacity-30">
                                                <Zap className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-xs uppercase font-bold">System Nominal</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : rightPanelTab === 'LEDGER' ? (
                            /* LEDGER TAB CONTENT */
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span>Forensic Ledger</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                const causeNode = {
                                                    metric: playbackSnapshot ? 'snapshot_replay' : 'manual_trigger',
                                                    value: playbackSnapshot ? (playbackSnapshot.telemetry.vibrationX || 0) : 4.5,
                                                    contribution: 1.0,
                                                    timestamp: playbackSnapshot ? playbackSnapshot.timestamp : Date.now()
                                                };

                                                const chain = {
                                                    rootCause: causeNode,
                                                    path: [causeNode],
                                                    finalSymptom: causeNode,
                                                    description: playbackSnapshot ? `Replay of ${playbackSnapshot.id}` : 'Manual Trigger via Forensic Hub'
                                                };

                                                const dossier = await MaintenanceOrchestrator.generateDossier(chain);
                                                
                                                if (dossier.dossierPath && dossier.dossierPath.startsWith('blob:')) {
                                                    window.open(dossier.dossierPath, '_blank');
                                                } else {
                                                    alert(`Maintenance Orchestrator\n\nDossier Generated: ${dossier.incidentId}\nSeverity: ${dossier.severity}\nPath: ${dossier.dossierPath}`);
                                                }
                                            }}
                                            className="px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded text-[10px] flex items-center gap-1 hover:bg-blue-900/50"
                                        >
                                            <FileText className="w-3 h-3" />
                                            NEW DOSSIER
                                        </button>
                                        {playbackSnapshot && (
                                            <button
                                                onClick={() => setPlaybackSnapshot(null)}
                                                className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] flex items-center gap-1 hover:bg-red-500/30"
                                            >
                                                <Activity className="w-3 h-3" />
                                                EXIT REPLAY
                                            </button>
                                        )}
                                    </div>
                                </h3>

                                <div className="space-y-3 overflow-y-auto max-h-[400px]">
                                    {/* Audit Trail Section */}
                                    {auditEntries.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Recent Decisions</h4>
                                            <div className="space-y-2">
                                                {auditEntries.map(entry => (
                                                    <div key={entry.id} className="p-2 rounded bg-slate-900/40 border border-slate-700 text-[10px]">
                                                        <div className="flex justify-between text-slate-400 mb-1">
                                                            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                                            <span className={entry.severity === 'CRITICAL' ? 'text-red-400' : 'text-cyan-400'}>{entry.action}</span>
                                                        </div>
                                                        <div className="text-white font-bold truncate">{entry.diagnosis}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Snapshots</h4>
                                    {manualSnapshots.length === 0 ? (
                                        <div className="text-center py-10 opacity-30">
                                            <History className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-xs uppercase font-bold">No Manual Snapshots Archived</p>
                                        </div>
                                    ) : (
                                        manualSnapshots.map((snap) => (
                                            <div
                                                key={snap.id}
                                                className={`p-3 rounded-lg border transition-all ${playbackSnapshot?.id === snap.id
                                                    ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        {new Date(snap.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${snap.triggerType === 'AUTO'
                                                        ? 'bg-red-900/30 text-red-400'
                                                        : 'bg-cyan-900/30 text-cyan-400'
                                                        }`}>
                                                        {snap.triggerType}
                                                    </span>
                                                </div>

                                                <div className="text-xs font-bold text-white mb-1">{snap.pathology}</div>

                                                {snap.signature && (
                                                    <div className="mb-2 flex items-center gap-1 text-[9px] text-emerald-500 font-mono bg-emerald-950/30 px-1 py-0.5 rounded border border-emerald-500/20">
                                                        <ShieldAlert className="w-3 h-3" />
                                                        VERIFIED: {snap.signature.substring(0, 8)}...
                                                    </div>
                                                )}

                                                {snap.physicsAnalysis && (
                                                    <div className="mb-2 p-2 bg-slate-900/50 rounded border border-slate-700">
                                                        <div className={`text-[9px] font-mono font-bold uppercase ${
                                                            snap.physicsAnalysis.zone.zone === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'
                                                        }`}>
                                                            {snap.physicsAnalysis.zone.zone}
                                                        </div>
                                                        <div className={`text-[9px] ${
                                                            snap.physicsAnalysis.cavitation.risk === 'LOW' ? 'text-slate-400' : 'text-red-400'
                                                        }`}>
                                                            {snap.physicsAnalysis.cavitation.details}
                                                        </div>

                                                        {snap.physicsAnalysis.vibration && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                <div className={`text-[9px] font-bold ${
                                                                    snap.physicsAnalysis.vibration.severity === 'NOMINAL' ? 'text-indigo-400' : 'text-red-400'
                                                                }`}>
                                                                    {snap.physicsAnalysis.vibration.pattern}
                                                                </div>
                                                                {snap.physicsAnalysis.vibration.recommendations.length > 0 && (
                                                                     <div className="text-[8px] text-slate-500 mt-0.5">
                                                                        {snap.physicsAnalysis.vibration.recommendations[0]}
                                                                     </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {snap.rootCauseAnalysis && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                <div className="text-[9px] font-bold text-orange-400 flex items-center gap-1">
                                                                    <Lightbulb className="w-3 h-3" />
                                                                    ROOT CAUSE DETECTED
                                                                </div>
                                                                <div className="text-[8px] text-slate-400 mt-0.5">
                                                                    {snap.rootCauseAnalysis.description}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {snap.oilAnalysis && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                <div className={`text-[9px] font-bold uppercase flex items-center gap-1 ${
                                                                    snap.oilAnalysis.overallHealth === 'EXCELLENT' || snap.oilAnalysis.overallHealth === 'GOOD'
                                                                        ? 'text-emerald-400'
                                                                        : 'text-orange-400'
                                                                }`}>
                                                                    <Database className="w-3 h-3" />
                                                                    OIL: {snap.oilAnalysis.overallHealth}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {snap.aiPrediction?.synergeticRisk.detected && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                <div className="text-[9px] font-bold text-purple-400 flex items-center gap-1">
                                                                    <Activity className="w-3 h-3" />
                                                                    AI RISK PREDICTION
                                                                </div>
                                                                <div className="text-[8px] text-slate-400 mt-0.5">
                                                                    {snap.aiPrediction.synergeticRisk.message}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Energy & Life Ext */}
                                                        {(snap.energyHarvest || snap.lifeExtension) && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2">
                                                                {snap.energyHarvest && (
                                                                    <div>
                                                                        <div className="text-[8px] font-bold text-cyan-400 flex items-center gap-1">
                                                                            <Zap className="w-2 h-2" /> HARVEST
                                                                        </div>
                                                                        <div className="text-[8px] text-slate-400">
                                                                            {snap.energyHarvest.powerW.toFixed(0)}W / €{snap.energyHarvest.annualEur.toFixed(0)}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {snap.lifeExtension && (
                                                                    <div>
                                                                        <div className="text-[8px] font-bold text-emerald-400 flex items-center gap-1">
                                                                            <TrendingUp className="w-2 h-2" /> LIFE+
                                                                        </div>
                                                                        <div className="text-[8px] text-slate-400">
                                                                            +{snap.lifeExtension.yearsAdded.toFixed(1)} Yrs
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Structural & Safety Audit */}
                                                        {(snap.structuralIntegrity || snap.hydraulicSafety) && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                {snap.structuralIntegrity && (
                                                                    <div className="flex justify-between items-center text-[9px] mb-1">
                                                                        <span className="text-slate-400">STRUCTURAL MARGIN</span>
                                                                        <span className={`font-bold ${snap.structuralIntegrity.status === 'NORMAL' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                            {snap.structuralIntegrity.marginPct.toFixed(1)}% ({snap.structuralIntegrity.status})
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {snap.hydraulicSafety && !snap.hydraulicSafety.approved && (
                                                                    <div className="p-1 bg-red-950/30 border border-red-500/30 rounded text-[8px] text-red-300 mt-1">
                                                                        ⚠️ HYDRAULIC MOD REJECTED: {snap.hydraulicSafety.reason}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Phase 3: Acoustic, Synergy, Galvanic */}
                                                        {(snap.acousticFingerprint || snap.crossCorrelation || snap.galvanicCorrosion) && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                {snap.acousticFingerprint && (
                                                                    <div className={`text-[9px] font-bold uppercase flex items-center gap-1 mb-1 ${
                                                                        snap.acousticFingerprint.severity === 'NORMAL' ? 'text-purple-300' : 'text-purple-400 animate-pulse'
                                                                    }`}>
                                                                        <Activity className="w-2 h-2" />
                                                                        ACOUSTIC: {snap.acousticFingerprint.primaryPattern} ({(snap.acousticFingerprint.confidence).toFixed(0)}%)
                                                                    </div>
                                                                )}
                                                                {snap.crossCorrelation?.correlated && (
                                                                    <div className="text-[9px] font-bold text-indigo-400 flex items-center gap-1 mb-1">
                                                                        <TrendingUp className="w-2 h-2" />
                                                                        SYNERGY: {snap.crossCorrelation.pair} (r={snap.crossCorrelation.r.toFixed(2)})
                                                                    </div>
                                                                )}
                                                                {snap.galvanicCorrosion && (
                                                                    <div className={`text-[9px] font-bold flex items-center gap-1 ${
                                                                        snap.galvanicCorrosion.protectionLevel === 'RISK' ? 'text-red-400' : 'text-orange-300'
                                                                    }`}>
                                                                        <Zap className="w-2 h-2" />
                                                                        CATHODIC: {snap.galvanicCorrosion.avgVoltage.toFixed(0)} mV
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Phase 4: Electro-Mechanical Forensics */}
                                                        {(snap.thermalAnalysis || snap.wicketGateAnalysis || snap.generatorAirGap) && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                {snap.thermalAnalysis && (
                                                                     <div className="text-[9px] font-bold text-blue-300 flex items-center gap-1 mb-1">
                                                                         <TrendingUp className="w-2 h-2" />
                                                                         THERMAL: {snap.thermalAnalysis.viscosity} cP ({snap.thermalAnalysis.action})
                                                                     </div>
                                                                 )}
                                                                {snap.wicketGateAnalysis && (
                                                                    <div className="text-[9px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                                                                        <Wrench className="w-2 h-2" />
                                                                        WICKET: {snap.wicketGateAnalysis.action}
                                                                    </div>
                                                                )}
                                                                {snap.generatorAirGap && (
                                                                     <div className={`text-[9px] font-bold flex items-center gap-1 ${
                                                                         snap.generatorAirGap.action !== 'NO_ACTION' ? 'text-red-400' : 'text-emerald-300'
                                                                     }`}>
                                                                         <Zap className="w-2 h-2" />
                                                                         AIR GAP: {snap.generatorAirGap.eccentricityPct.toFixed(1)}% Ecc
                                                                     </div>
                                                                 )}
                                                             </div>
                                                         )}

                                                        {/* Phase 5: Electrical & Auxiliary Forensics */}
                                                        {(snap.transformerAnalysis || snap.statorAnalysis || snap.shaftSealAnalysis || snap.governorAnalysis) && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                                {snap.transformerAnalysis && (
                                                                    <div className={`text-[9px] font-bold flex items-center gap-1 mb-1 ${
                                                                        snap.transformerAnalysis.faultType !== 'NORMAL' ? 'text-red-400' : 'text-emerald-300'
                                                                    }`}>
                                                                        <Zap className="w-2 h-2" />
                                                                        TRANSFORMER: {snap.transformerAnalysis.faultType}
                                                                    </div>
                                                                )}
                                                                {snap.statorAnalysis && (
                                                                    <div className={`text-[9px] font-bold flex items-center gap-1 mb-1 ${
                                                                        snap.statorAnalysis.severity !== 'LOW' ? 'text-orange-400' : 'text-emerald-300'
                                                                    }`}>
                                                                        <Activity className="w-2 h-2" />
                                                                        STATOR: {snap.statorAnalysis.severity}
                                                                    </div>
                                                                )}
                                                                {snap.shaftSealAnalysis && (
                                                                    <div className={`text-[9px] font-bold flex items-center gap-1 mb-1 ${
                                                                        snap.shaftSealAnalysis.action !== 'NO_ACTION' ? 'text-purple-400' : 'text-slate-300'
                                                                    }`}>
                                                                        <TrendingUp className="w-2 h-2" />
                                                                        SEAL: {(snap.shaftSealAnalysis.probability * 100).toFixed(0)}% Risk
                                                                    </div>
                                                                )}
                                                                {snap.governorAnalysis && (
                                                                    <div className={`text-[9px] font-bold flex items-center gap-1 mb-1 ${
                                                                        snap.governorAnalysis.action !== 'NO_ACTION' ? 'text-amber-400' : 'text-slate-300'
                                                                    }`}>
                                                                        <Wrench className="w-2 h-2" />
                                                                        GOVERNOR: {snap.governorAnalysis.action}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-3 font-mono">
                                                    <div>E: {snap.kineticState.eccentricity.toFixed(2)}mm</div>
                                                    <div>R²: {snap.kineticState.rsquared.toFixed(2)}</div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setPlaybackSnapshot(snap)}
                                                        disabled={playbackSnapshot?.id === snap.id}
                                                        className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${playbackSnapshot?.id === snap.id
                                                            ? 'bg-purple-500 text-white cursor-default'
                                                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                                            }`}
                                                    >
                                                        {playbackSnapshot?.id === snap.id ? (
                                                            <><Pause className="w-3 h-3" /> Replaying</>
                                                        ) : (
                                                            <><Play className="w-3 h-3" /> Replay</>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDownloadSnapshot(snap)}
                                                        className="px-3 py-1.5 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 rounded text-[10px] font-bold border border-cyan-500/30 transition-colors"
                                                        title="Export Forensic Report"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : rightPanelTab === 'INVENTORY' ? (
                            /* INVENTORY TAB CONTENT */
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span>Warehouse Inventory</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">{inventory.length} Items</span>
                                </h3>
                                
                                <div className="space-y-3 overflow-y-auto">
                                    {inventory.map((part) => (
                                        <div 
                                            key={part.componentId}
                                            className={`p-3 rounded-lg border transition-all ${
                                                part.stockQuantity === 0 
                                                    ? 'bg-red-950/20 border-red-500/50 hover:bg-red-900/30' 
                                                    : part.stockQuantity <= part.reorderPoint
                                                        ? 'bg-amber-950/20 border-amber-500/50 hover:bg-amber-900/30'
                                                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-slate-300">{part.partNumber}</span>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                                    part.stockQuantity === 0 ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                                                }`}>
                                                    QTY: {part.stockQuantity}
                                                </span>
                                            </div>
                                            <div className="text-xs font-bold text-white mb-2">{part.description}</div>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 font-mono">
                                                <div>LEAD: {part.leadTimeDays} days</div>
                                                <div>COST: €{part.unitCost}</div>
                                            </div>

                                            {part.stockQuantity === 0 && (
                                                <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-red-400">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    CRITICAL STOCKOUT
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 border-t border-slate-700 pt-4">
                                    <button
                                        onClick={() => {
                                            const critical = inventory.find(p => p.stockQuantity === 0);
                                            if (critical) {
                                                PurchaseOrderService.generatePurchaseOrder({
                                                    requisitionId: `REQ-${Date.now()}`,
                                                    componentId: critical.componentId,
                                                    part: critical,
                                                    requestedQuantity: critical.reorderPoint + 2,
                                                    urgency: 'CRITICAL',
                                                    reason: 'Manual Auto-Order for Critical Stockout',
                                                    rulDays: 0,
                                                    logisticsGapDays: 0,
                                                    estimatedFailureDate: Date.now(),
                                                    estimatedCost: (critical.reorderPoint + 2) * critical.unitCost,
                                                    createdAt: Date.now()
                                                });
                                                alert(`PO generated for ${critical.partNumber}. Check console.`);
                                            }
                                        }}
                                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded uppercase tracking-wider text-xs border border-slate-600"
                                    >
                                        Auto-Order Critical Spares
                                    </button>
                                </div>

                                {/* DAO Orders */}
                                {daoOrders.length > 0 && (
                                    <div className="mt-4 border-t border-slate-700 pt-4">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Smart Contract Orders (DAO)</h4>
                                        {daoOrders.map(order => (
                                            <div key={order.orderId} className="p-2 bg-slate-900/50 rounded border border-slate-700 mb-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-white font-bold">{order.partId}</span>
                                                    <span className="text-[9px] text-cyan-400 bg-cyan-950/30 px-1 rounded">{order.status}</span>
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-mono">
                                                    €{order.totalCost} • Qty: {order.quantity}
                                                </div>
                                                {order.txHash && (
                                                    <div className="text-[8px] text-slate-500 mt-1 truncate">
                                                        Tx: {order.txHash}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : rightPanelTab === 'KNOWLEDGE' ? (
                            /* KNOWLEDGE TAB CONTENT */
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span>Institutional Memory</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">{knowledgeResults.length} Matches</span>
                                </h3>
                                
                                <div className="space-y-4 overflow-y-auto pr-2">
                                    {knowledgeResults.length === 0 ? (
                                        <div className="text-center py-10 opacity-30">
                                            <FileText className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-xs uppercase font-bold">No Relevant Records</p>
                                        </div>
                                    ) : (
                                        knowledgeResults.map((result) => (
                                            <div 
                                                key={result.entry.id}
                                                className="p-4 rounded-xl border bg-slate-800/40 border-slate-700 hover:bg-slate-800 transition-colors group"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="text-xs font-bold text-white leading-tight mb-1 group-hover:text-cyan-400 transition-colors">
                                                            {result.entry.incidentPattern}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                            <span className="uppercase">{result.entry.turbineFamily}</span>
                                                            <span>•</span>
                                                            <span className="text-emerald-400">{(result.entry.confidenceScore * 100).toFixed(0)}% Confidence</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                                                        {(result.relevanceScore * 100).toFixed(0)}% MATCH
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-slate-300 bg-slate-950/50 p-2 rounded mb-2 border border-slate-800">
                                                    <span className="text-slate-500 font-bold block mb-0.5">ROOT CAUSE:</span>
                                                    {result.entry.rootCause}
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {result.entry.tags.map(tag => (
                                                        <span key={tag} className="px-1.5 py-0.5 bg-blue-900/20 text-blue-300 rounded text-[9px] border border-blue-500/20">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-4 border-t border-slate-700 pt-4">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Legacy Archives</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['IMMORTAL_LEGACY', 'GOVERNMENT_NATIONAL', 'PEACE_DIVIDEND', 'ETERNAL_2050'] as const).map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => {
                                                    const result = LegacyBridgeService.getInstance().generateLegacyReport(type);
                                                    if (result) {
                                                        const blob = new Blob([result.content], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = result.filename;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    } else {
                                                        alert('Failed to generate legacy report.');
                                                    }
                                                }}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-300 border border-slate-600 transition-colors uppercase"
                                            >
                                                {type.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : rightPanelTab === 'CONSULTING' ? (
                            /* CONSULTING TAB CONTENT */
                            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span>Optimization Report</span>
                                    <span className="px-2 py-0.5 bg-teal-900/30 text-teal-400 rounded text-[10px]">ROI FOCUSED</span>
                                </h3>
                                {optimizationReport ? (
                                    <div className="space-y-4">
                                        {optimizationReport.recommendations.map((rec: any, i: number) => (
                                            <div key={i} className="p-3 rounded-lg border bg-slate-800/40 border-slate-700 hover:bg-slate-800 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-xs font-bold text-white">{rec.title}</div>
                                                    <div className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                        rec.priority === 1 ? 'bg-red-500 text-white' : 
                                                        rec.priority === 2 ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'
                                                    }`}>
                                                        P{rec.priority}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mb-2">{rec.action}</p>
                                                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                                                    <div className="text-teal-400">Benefit: €{rec.expectedBenefit}</div>
                                                    <div className="text-red-400">Cost: €{rec.estimatedCost}</div>
                                                </div>
                                                <div className="mt-2 text-[9px] text-slate-500 text-right border-t border-slate-700/50 pt-1">
                                                    Payback: {rec.paybackPeriod.toFixed(1)} months
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-30">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-xs uppercase font-bold">No Optimization Data</p>
                                    </div>
                                )}
                            </div>
                        ) : rightPanelTab === 'ECO' ? (
                            /* ECO TAB CONTENT */
                            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span>Environmental Governance</span>
                                    <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-[10px]">LIVE</span>
                                </h3>
                                
                                {ecoStatus ? (
                                    <div className="space-y-4">
                                        {/* Flow Compliance */}
                                        <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Activity className="w-4 h-4 text-blue-400" />
                                                <h4 className="text-xs font-bold text-blue-400 uppercase">Flow Compliance</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[9px] text-slate-500 block">CURRENT FLOW</span>
                                                    <span className="text-lg font-mono text-white">{ecoStatus.currentFlow?.toFixed(1) || '10.0'} m³/s</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-500 block">MIN REQUIRED</span>
                                                    <span className="text-lg font-mono text-red-400">{ecoStatus.minFlow?.toFixed(1) || '12.0'} m³/s</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-[10px] bg-red-950/30 text-red-300 p-2 rounded border border-red-500/20">
                                                VIOLATION: Flow below ecological minimum. Fines accruing.
                                            </div>
                                        </div>

                                        {/* Water Quality */}
                                        <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Activity className="w-4 h-4 text-green-400" />
                                                <h4 className="text-xs font-bold text-green-400 uppercase">Water Quality</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-400">Dissolved O2</span>
                                                    <span className="text-white font-mono">6.5 mg/L</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-[65%]"></div>
                                                </div>
                                                
                                                <div className="flex justify-between text-[10px] mt-2">
                                                    <span className="text-slate-400">Turbidity</span>
                                                    <span className="text-white font-mono">5.0 NTU</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-[20%]"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fish Passage */}
                                        {fishState && (
                                            <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Activity className="w-4 h-4 text-cyan-400" />
                                                    <h4 className="text-xs font-bold text-cyan-400 uppercase">Fish Passage Control</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[9px] text-slate-500 block">SEASON</span>
                                                        <span className="text-sm font-bold text-white">{fishState.season}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] text-slate-500 block">GATE OPENING</span>
                                                        <span className="text-sm font-bold text-white">{fishState.gateOpeningPct.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                                                    Est. Fish Count: {fishState.fishCountEstimate} / day
                                                </div>
                                            </div>
                                        )}

                                        {/* Basin Coordinator */}
                                        {basinAction && (
                                            <div className="p-4 rounded-xl border bg-purple-950/20 border-purple-500/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Zap className="w-4 h-4 text-purple-400" />
                                                    <h4 className="text-xs font-bold text-purple-400 uppercase">Basin Coordinator</h4>
                                                </div>
                                                <div className="text-xs text-slate-300 mb-2">{basinAction.message}</div>
                                                <div className="space-y-1">
                                                    {basinAction.unitActions.map((ua, i) => (
                                                        <div key={i} className="text-[10px] flex justify-between bg-slate-900/50 p-1.5 rounded">
                                                            <span className="text-white font-bold">{ua.unitId}</span>
                                                            <span className="text-purple-300">{ua.targetMw} MW</span>
                                                            <span className="text-slate-500 italic">{ua.reason}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* H2 Synthesizer */}
                                        {h2Session && (
                                            <div className="p-4 rounded-xl border bg-blue-950/20 border-blue-500/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Activity className="w-4 h-4 text-blue-400" />
                                                    <h4 className="text-xs font-bold text-blue-400 uppercase">Green H2 Synthesis</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[9px] text-slate-500 block">STATUS</span>
                                                        <span className="text-sm font-bold text-white animate-pulse">{h2Session.status}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] text-slate-500 block">H2 PRODUCED</span>
                                                        <span className="text-sm font-bold text-white">{h2Session.h2Produced.toFixed(1)} Nm³</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                                                    Efficiency: {h2Session.efficiency}% (PEM Electrolysis)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-30">
                                        <Activity className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-xs uppercase font-bold">No Eco Data</p>
                                    </div>
                                )}
                            </div>
                        ) : rightPanelTab === 'SECURITY' ? (
                            /* SECURITY TAB CONTENT */
                            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span>Civil Security</span>
                                    <span className="px-2 py-0.5 bg-red-900/30 text-red-400 rounded text-[10px]">LIVE</span>
                                </h3>

                                {/* Dam Stability Gauge */}
                                {damStability && (
                                    <div className={`p-4 rounded-xl border ${
                                        damStability.status === 'SAFE' ? 'bg-emerald-950/20 border-emerald-500/30' :
                                        damStability.status === 'WARNING' ? 'bg-amber-950/20 border-amber-500/30' :
                                        'bg-red-950/20 border-red-500/30'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Activity className={`w-4 h-4 ${
                                                damStability.status === 'SAFE' ? 'text-emerald-400' :
                                                damStability.status === 'WARNING' ? 'text-amber-400' : 'text-red-400'
                                            }`} />
                                            <h4 className={`text-xs font-bold uppercase ${
                                                damStability.status === 'SAFE' ? 'text-emerald-400' :
                                                damStability.status === 'WARNING' ? 'text-amber-400' : 'text-red-400'
                                            }`}>Dam Stability Index</h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[9px] text-slate-500 block">SAFETY FACTOR</span>
                                                <span className="text-lg font-mono text-white">{damStability.safetyFactor.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-slate-500 block">UPLIFT PRESS.</span>
                                                <span className="text-lg font-mono text-white">{damStability.upliftPressure.toFixed(2)} bar</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2 text-[10px] text-slate-400 font-mono">
                                            Seismic Activity: {damStability.seismicActivity}
                                        </div>
                                    </div>
                                )}

                                {/* Seismic History */}
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase">Recent Seismic Events</h4>
                                    {seismicHistory.length === 0 ? (
                                        <div className="text-xs text-slate-500 italic">No recent events recorded.</div>
                                    ) : (
                                        seismicHistory.map((event, i) => (
                                            <div key={i} className="p-2 bg-slate-900/50 rounded border border-slate-700">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-white font-bold">{event.stationId}</span>
                                                    <span className={`text-[9px] px-1 rounded ${
                                                        event.peakGroundAcceleration > 0.05 ? 'bg-red-950/30 text-red-400' : 'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {event.peakGroundAcceleration.toFixed(3)}g
                                                    </span>
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-mono">
                                                    {new Date(event.timestamp).toLocaleString()} • {event.frequency}Hz
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* System Integrity Pulse */}
                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Activity className="w-3 h-3" />
                                        System Pulse Check
                                    </h4>
                                    
                                    {integrityReport ? (
                                        <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-slate-400">Database Tables</span>
                                                <span className={`text-[10px] font-bold ${Object.values(integrityReport.tableStatuses).every(s => s.exists) ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {Object.values(integrityReport.tableStatuses).filter(s => s.exists).length} / {Object.keys(integrityReport.tableStatuses).length}
                                                </span>
                                            </div>
                                            
                                            {integrityReport.physicsCheck && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] text-slate-400">Physics Engine</span>
                                                    <span className={`text-[10px] font-bold ${integrityReport.physicsCheck.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {integrityReport.physicsCheck.ok ? 'CALIBRATED' : 'DRIFT'}
                                                    </span>
                                                </div>
                                            )}

                                            {integrityReport.financialCheck && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-slate-400">Revenue Logic</span>
                                                    <span className={`text-[10px] font-bold ${integrityReport.financialCheck.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {integrityReport.financialCheck.ok ? 'SECURE' : 'COMPROMISED'}
                                                    </span>
                                                </div>
                                            )}

                                            {integrityReport.errors.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-slate-800">
                                                    <div className="text-[9px] text-red-400 font-mono">
                                                        {integrityReport.errors[0]}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic animate-pulse">Running diagnostics...</div>
                                    )}
                                </div>

                                {/* Safety Interlocks */}
                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <ShieldAlert className="w-3 h-3" />
                                        Operational Safety
                                    </h4>
                                    
                                    {safetyStatus ? (
                                        <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-slate-400">Status</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    safetyStatus.status === 'LOCKED' ? 'bg-emerald-900/30 text-emerald-400' : 
                                                    safetyStatus.status === 'TRIPPED' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'
                                                }`}>
                                                    {safetyStatus.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-slate-400">Active Protections</span>
                                                <span className="text-[10px] font-mono text-white">
                                                    {safetyStatus.protectionsActive}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono text-right">
                                                Last Check: {new Date(safetyStatus.lastCheck).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic animate-pulse">Scanning interlocks...</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* EXECUTIVE TAB CONTENT */
                            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                                {/* ROI METRICS CARD */}
                                <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        <h4 className="text-sm font-bold text-emerald-400">Autonomous ROI</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div className="bg-slate-900/50 p-2 rounded">
                                            <span className="block text-slate-500 text-[10px]">TOTAL SAVED</span>
                                            <span className="text-emerald-400 font-black text-lg">
                                                €{roiEvents.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded">
                                            <span className="block text-slate-500 text-[10px]">EVENTS</span>
                                            <span className="text-white font-black text-lg">{roiEvents.length}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {roiEvents.slice(0, 3).map((e, i) => (
                                            <div key={i} className="text-[10px] flex justify-between items-center border-b border-slate-800 pb-1 last:border-0">
                                                <span className="text-slate-400 truncate max-w-[120px]">{e.description}</span>
                                                <span className="text-emerald-400 font-bold">+€{e.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Compliance Badge */}
                                {complianceReport && (
                                    <div className="p-4 rounded-xl border bg-blue-950/20 border-blue-500/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-5 h-5 text-blue-400" />
                                            <h4 className="text-sm font-bold text-blue-400">Regulatory Audit</h4>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Ecological Status</span>
                                            <span className={`font-black ${complianceReport.ecologistProof.status === 'COMPLIANT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {complianceReport.ecologistProof.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs mt-1">
                                            <span className="text-slate-400">Safety Trips (30d)</span>
                                            <span className="text-white font-mono">{complianceReport.safetyAudit.totalTripEvents}</span>
                                        </div>
                                    </div>
                                )}

                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Strategic Planner</h3>
                                
                                {outagePlan?.optimalWindow ? (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap className="w-5 h-5 text-emerald-400" />
                                                <h4 className="text-sm font-bold text-emerald-400">Optimal Outage Window</h4>
                                            </div>
                                            <div className="text-xs text-slate-400 mb-3">
                                                Best 48h window minimizing revenue loss based on price forecast.
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                <div className="bg-slate-900/50 p-2 rounded">
                                                    <span className="block text-slate-500">START</span>
                                                    <span className="text-white font-bold">{new Date(outagePlan.optimalWindow.start).toLocaleDateString()}</span>
                                                    <span className="block text-slate-400">{new Date(outagePlan.optimalWindow.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <div className="bg-slate-900/50 p-2 rounded">
                                                    <span className="block text-slate-500">AVG PRICE</span>
                                                    <span className="text-emerald-400 font-bold">€{outagePlan.optimalWindow.avgPrice.toFixed(2)}</span>
                                                    <span className="block text-slate-400">per MWh</span>
                                                </div>
                                            </div>
                                        </div>

                                        {outagePlan.bundles.length > 0 && (
                                            <div className="p-4 rounded-xl border bg-amber-950/20 border-amber-500/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Wrench className="w-5 h-5 text-amber-400" />
                                                    <h4 className="text-sm font-bold text-amber-400">Bundled Maintenance</h4>
                                                </div>
                                                <ul className="space-y-2">
                                                    {outagePlan.bundles.map((b: any, i: number) => (
                                                        <li key={i} className="text-xs">
                                                            <div className="font-bold text-amber-200 mb-1">{b.reason}</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {b.components.map((c: string) => (
                                                                    <span key={c} className="px-1.5 py-0.5 bg-amber-900/40 text-amber-300 rounded text-[10px] border border-amber-700/50">
                                                                        {c}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-30">
                                        <Activity className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-xs uppercase font-bold">Calculating Strategy...</p>
                                    </div>
                                )}

                                {/* Black Start Protocol */}
                                <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700 mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <h4 className="text-sm font-bold text-yellow-400">Black Start Protocol</h4>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-3">
                                        Autonomous recovery from total grid blackout using H2 fuel cells and DC battery bank.
                                    </div>
                                    <button
                                        onClick={() => {
                                            setBlackStartStatus({ active: true, step: 1 });
                                            BlackStartOrchestrator.initiateBlackStart().then(() => {
                                                setBlackStartStatus({ active: false, step: 8 });
                                                alert('Black Start Complete');
                                            });
                                        }}
                                        disabled={blackStartStatus?.active}
                                        className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                                            blackStartStatus?.active
                                                ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/50 animate-pulse'
                                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                                        }`}
                                    >
                                        {blackStartStatus?.active ? `Recovering... Step ${blackStartStatus.step}/8` : 'Test Black Start'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EMERGENCY SOP MODAL */}
            <AnimatePresence>
                {showSOP && sopData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-5xl h-[80vh] flex flex-col bg-slate-900 border border-red-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                        >
                            <div className="p-6 border-b border-red-500/30 flex items-center justify-between bg-red-950/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-600 rounded-lg">
                                        <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Emergency SOP Generator</h2>
                                        <div className="text-xs text-red-400 font-mono">LIVE GENERATED • {new Date(sopData.generatedAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSOP(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-8">
                                {/* LEFT: ACTIVE COMPENSATIONS & SETPOINTS */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Active Compensations
                                        </h3>
                                        <ul className="space-y-3">
                                            {sopData.activeCompensations.map((comp, i) => (
                                                <li key={i} className="text-xs text-slate-300 bg-amber-950/20 p-3 rounded border border-amber-500/20">
                                                    {comp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Wrench className="w-4 h-4" /> Manual Interventions
                                        </h3>
                                        <ul className="space-y-3">
                                            {sopData.manualInterventions.map((action, i) => (
                                                <li key={i} className="text-xs text-slate-300 bg-cyan-950/20 p-3 rounded border border-cyan-500/20">
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* RIGHT: EMERGENCY PROCEDURES */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-red-950/10 rounded-xl border border-red-500/30">
                                        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Critical Procedures
                                        </h3>
                                        <div className="space-y-2">
                                            {sopData.emergencyProcedures.map((proc, i) => (
                                                <div key={i} className={`text-xs p-2 rounded ${proc.startsWith('===') ? 'font-black text-red-400 mt-4 bg-red-950/30' : 'text-slate-300 pl-4 border-l-2 border-slate-700'}`}>
                                                    {proc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
                                <div className="text-xs text-slate-500 font-mono">
                                    FLEET STATUS: <span className={sopData.fleetStatus === 'NORMAL' ? 'text-emerald-500' : 'text-red-500 font-bold'}>{sopData.fleetStatus}</span>
                                </div>
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded hover:bg-slate-200 transition-colors"
                                >
                                    Print SOP
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ALIGNMENT WIZARD MODAL */}
            <AnimatePresence>
                {showAlignmentWizard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="relative">
                                <button
                                    onClick={() => setShowAlignmentWizard(false)}
                                    className="absolute -top-4 -right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10 border border-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <AlignmentWizard
                                    sessionId={`SESSION-${Date.now()}`}
                                    asset={selectedAsset ? mapAssetToEnhancedAsset(selectedAsset) : undefined as any}
                                    onComplete={() => {
                                        setShowAlignmentWizard(false);
                                        addWisdom({
                                            id: `ALIGN-COMPLETE-${Date.now()}`,
                                            title: 'Maintenance Complete',
                                            message: 'Shaft alignment protocol successfully recorded.',
                                            action: 'Archive Report',
                                            severity: 'INFO'
                                        });
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* NC-15200: Sovereign Sound Engine */}
            <SovereignSoundEngine />
        </div>
    );
};

export default ForensicHub;
