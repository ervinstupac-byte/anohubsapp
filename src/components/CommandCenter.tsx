import React, { useMemo, useCallback, useRef, useEffect } from 'react';
const TurbineRunner3D = React.lazy(() => import('./three/TurbineRunner3D').then(module => ({ default: module.TurbineRunner3D })));
import { ErrorBoundary } from './ErrorBoundary';
import { ModuleFallback } from '../shared/components/ui/ModuleFallback';
import { HeatmapLegend } from './ui/HeatmapLegend';
import { NeuralPulse } from './ui/NeuralPulse';
import { TacticalCard } from './ui/TacticalCard';
import { LiveMetricToken } from '../features/telemetry/components/LiveMetricToken';
import { ShaftOrbitPlot } from '../features/telemetry/components/ShaftOrbitPlot';
import { TruthDeltaEngine } from '../utils/TruthDeltaEngine';
import { useContextAwareness } from '../contexts/ContextAwarenessContext';
import { useDigitalLedger } from '../stores/useDigitalLedger';
import { useTheme } from '../stores/useTheme';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { ForensicReportService } from '../services/ForensicReportService';
import { Camera, Moon, Ghost, FileText, ChevronRight, Shield, X, CheckCircle2, Wrench } from 'lucide-react';
import { useToast } from '../stores/useAppStore';
import { useDocumentViewer } from '../contexts/DocumentContext';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../core/TechnicalSchema';
import { StructuralSafetyMonitor } from '../features/telemetry/components/StructuralSafetyMonitor';
import { MaintenanceEngine, SOPMapping } from '../services/MaintenanceEngine';
import { SolutionArchitect } from '../services/SolutionArchitect';
import { dispatch } from '../lib/events';
import { FaultInjectorPanel } from './forensics/FaultInjectorPanel';

export const CommandCenter: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const {
        diagnostics,
        activeLogs,
        liveMetrics,
        activeDefinition,
        hasCriticalRisks,
        patternWeights,
        structuralSafetyMargin
    } = useContextAwareness();

    const { addSnapshot } = useDigitalLedger();
    const { mode, toggleNightOps } = useTheme();
    const { showToast } = useToast();
    const { viewDocument } = useDocumentViewer();
    const telemetry = useTelemetryStore();
    const [ghostMode, setGhostMode] = React.useState(false);
    const [activeSop, setActiveSop] = React.useState<SOPMapping | null>(null);
    const [selected3DPart, setSelected3DPart] = React.useState<string | null>(null);
    const turbineRef = useRef<HTMLDivElement>(null);

    // Calculate Performance Delta (Baseline vs Actual)
    // Design Baseline: 105.0 MW (Simulated Design Spec)
    const baselinePower = 105.0;
    const activePowerMetric = liveMetrics.find(m => m.label.includes('Power') || m.label.includes('Output'));
    const activePowerVal = activePowerMetric ? (typeof activePowerMetric.value === 'number' ? activePowerMetric.value : parseFloat(activePowerMetric.value as string)) : 0;

    // Formula: (Actual - Baseline) / Baseline * 100
    const deltaPerf = activePowerVal > 0 ? ((activePowerVal - baselinePower) / baselinePower) * 100 : 0;

    const handleExportDossier = useCallback(async () => {
        showToast('Initiating Forensic Capture...', 'info');

        // Capture 3D Canvas
        let snapshotData = null;
        if (turbineRef.current) {
            try {
                // Wait for a frame render to ensure clarity (simple delay)
                await new Promise(r => setTimeout(r, 100));

                // We target the canvas inside the wrapper
                const canvas = turbineRef.current.querySelector('canvas');
                if (canvas) {
                    snapshotData = canvas.toDataURL('image/png');
                } else {
                    // Fallback to html2canvas if direct extraction fails (unlikely with preserveDrawingBuffer: true)
                    const { default: html2canvas } = await import('html2canvas');
                    const canvasResult = await html2canvas(turbineRef.current, { backgroundColor: null });
                    snapshotData = canvasResult.toDataURL('image/png');
                }
            } catch (e) {
                console.error("Snapshot failed:", e);
                showToast("Visual Evidence Capture Failed - Proceeding with Text Only", 'warning');
            }
        }

        // Use the first critical diagnostic or a default context
        const primaryInsight = diagnostics[0] || {
            name: 'Routine Performance Audit',
            severity: 'LOW',
            probability: 1.0,
            physicsNarrative: 'Standard operational capability assessment. No significant anomalies detected.',
            vectors: ['Manual User Request', 'System Nominal']
        };

        // Generate Real PDF
        try {
            const blob = ForensicReportService.generateDiagnosticDossier({
                caseId: 'CASE-' + Math.floor(Math.random() * 10000),
                insight: primaryInsight,
                engineerName: 'Senior Engineer',
                snapshotImage: snapshotData,
                t
            });

            if (blob instanceof Blob) {
                viewDocument(blob, `Dossier: ${primaryInsight.name}`, `Dossier_${primaryInsight.name}.pdf`);
                showToast('Forensic Dossier Ready for Review.', 'success');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to generate Dossier.', 'error');
        }
    }, [diagnostics, liveMetrics, showToast]);

    // Global listener removed - now handled by PrintPreviewModal in App.tsx

    // Calculate truth delta map
    const deltaMap = useMemo(() => {
        return TruthDeltaEngine.calculateDeltaMap(diagnostics, activeLogs);
    }, [diagnostics, activeLogs]);

    // Determine system health
    const systemHealth = hasCriticalRisks ? 'CRITICAL' :
        diagnostics.some(d => d.type === 'warning') ? 'DEGRADED' : 'OPTIMAL';

    // Capture audit snapshot
    const captureSnapshot = useCallback(() => {
        const weights = patternWeights || {};
        const totalWeight = Object.values(weights).reduce((sum: number, w: number) => sum + w, 0);
        const avgWeight = Object.keys(weights).length > 0 ? totalWeight / Object.keys(weights).length : 1.0;
        const progress = Math.min(Math.round((avgWeight - 1.0) * 100), 100);

        addSnapshot({
            type: 'heatmap',
            data: {
                systemHealth,
                diagnostics: diagnostics.slice(0, 10),
                deltaMap,
                neuralPulse: {
                    progress,
                    weights
                }
            },
            metadata: {
                tags: ['command-center', 'truth-heatmap']
            }
        });
    }, [diagnostics, deltaMap, patternWeights, addSnapshot, systemHealth]);

    // NC-9.0 Knowledge Wisdom Export
    useEffect(() => {
        console.group('%c ANOHUB NC-9.0 KNOWLEDGE AUDIT ', 'background: #0f172a; color: #38bdf8; font-weight: bold; padding: 4px;');
        console.log('Maturity Rules:', {
            Mechanical: ['Bearing Temp', 'Vibration', 'Megger', 'Axial Play'],
            Hydraulic: ['Head', 'Flow', 'Efficiency'],
            Structural: ['Barlow Margin', 'Cubic L-ext']
        });
        console.log('Standard Thresholds:', {
            Vibration: 'ISO 10816-3',
            Insulation: 'Megger (kV + 1)',
            Structural: 'Barlow SF 1.5'
        });
        console.groupEnd();
    }, []);

    const healthColor = {
        OPTIMAL: 'text-cyan-400',
        DEGRADED: 'text-amber-400',
        CRITICAL: 'text-red-400'
    }[systemHealth];

    return (
        <div className="min-h-screen bg-transparent pb-16">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-scada-panel border-b border-scada-border">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-scada-text font-mono">
                            ANOHUB <span className="text-status-info">//</span> NC-9.0
                        </h1>
                        <div className="flex flex-col">
                            {activeDefinition && (
                                <span className="text-[10px] text-scada-muted font-mono">
                                    / {activeDefinition.title}
                                </span>
                            )}
                            <span className="text-[8px] text-scada-muted font-mono italic">Pro-Bono Engineering // Fundamental Physics Engine</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Night Ops Toggle */}
                        <button
                            onClick={toggleNightOps}
                            className={`px-3 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${mode === 'tactical-red'
                                ? 'bg-status-error/10 border-status-error text-status-error'
                                : 'bg-scada-bg border-scada-border text-scada-muted hover:border-status-info hover:text-status-info'
                                }`}
                            title="Toggle Night Operations Mode"
                        >
                            <Moon className="w-3 h-3 inline mr-1" />
                            {mode === 'tactical-red' ? 'NIGHT OPS' : 'DAY MODE'}
                        </button>

                        {/* Retrofit Validator (Ghost Mode) */}
                        <button
                            onClick={() => setGhostMode(!ghostMode)}
                            className={`px-3 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${ghostMode
                                ? 'bg-status-warning/10 border-status-warning text-status-warning'
                                : 'bg-scada-bg border-scada-border text-scada-muted hover:border-status-warning hover:text-status-warning'
                                }`}
                            title="Toggle Retrofit Comparison (Ghost Mode)"
                        >
                            <Ghost className="w-3 h-3 inline mr-1" />
                            {ghostMode ? 'VALIDATOR ACTIVE' : 'RETROFIT VALIDATOR'}
                        </button>

                        {/* Forensic Dossier */}
                        <button
                            onClick={() => dispatch.triggerForensicExport()}
                            className="p-2 hover:bg-scada-border rounded-sm text-scada-muted hover:text-scada-text transition-colors"
                            title="Print / Export View"
                        >
                            <FileText className="w-5 h-5" />
                        </button>

                        {/* Audit Snapshot */}
                        <button
                            onClick={captureSnapshot}
                            className="px-3 py-1.5 rounded-sm border border-status-info bg-status-info/10 text-status-info text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-status-info/20 transition-all"
                            title="Capture Audit Snapshot"
                        >
                            <Camera className="w-3 h-3 inline mr-1" />
                            SNAPSHOT
                        </button>

                        {/* System Health */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${systemHealth === 'OPTIMAL' ? 'bg-status-ok' :
                                systemHealth === 'DEGRADED' ? 'bg-status-warning' :
                                    'bg-status-error'
                                }`} />
                            <span className={`text-xs font-mono font-bold ${healthColor}`}>
                                SYSTEM: {systemHealth}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-4 p-6 h-[calc(100vh-8rem)]">
                {/* Left Panel: Neural Tree */}
                <div className="col-span-3 space-y-4 overflow-y-auto">
                    <TacticalCard
                        title="NEURAL FOCUS TREE"
                        status={hasCriticalRisks ? 'critical' : 'nominal'}
                        className=""
                    >
                        <div className="space-y-2">
                            {diagnostics.slice(0, 5).map((diag, i) => (
                                <div
                                    key={diag.id}
                                    className="p-2 bg-scada-bg border border-scada-border rounded-sm cursor-pointer hover:border-status-info transition-colors group"
                                    onClick={() => {
                                        if (diag.sopCode) {
                                            const sop = MaintenanceEngine.getSOP(diag.sopCode);
                                            if (sop) setActiveSop(sop);
                                            else showToast(`SOP steps not yet defined for: ${diag.sopCode}`, 'info');
                                        } else {
                                            showToast("No mapped SOP for this alert level.", 'info');
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-none ${diag.type === 'critical' ? 'bg-status-error' :
                                                diag.type === 'warning' ? 'bg-status-warning' :
                                                    'bg-status-info'
                                                }`} />
                                            <span className="text-[9px] font-mono text-scada-text group-hover:text-white">
                                                {diag.messageKey}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-scada-muted group-hover:text-status-info" />
                                    </div>
                                    {diag.value && (
                                        <div className="mt-1 text-[8px] font-mono text-scada-muted">
                                            {diag.value}
                                        </div>
                                    )}
                                    {diag.reasoning && (
                                        <div className="mt-2 p-1.5 bg-scada-panel rounded-sm italic text-[8px] text-scada-text leading-tight border-l border-status-info/50">
                                            {diag.reasoning}
                                        </div>
                                    )}
                                    {diag.slogan && (
                                        <div className="mt-2 text-[7px] font-black text-status-info uppercase tracking-widest">
                                            {diag.slogan}
                                        </div>
                                    )}
                                    {diag.vectors && diag.vectors.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {diag.vectors.map((v: string, idx: number) => (
                                                <span key={idx} className="px-1 py-0.5 bg-status-info/10 border border-status-info/20 text-[6px] text-status-info rounded-sm">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TacticalCard>

                    {/* SHAFT ORBIT MONITOR */}
                    <TacticalCard title="SHAFT ORBIT (X/Y)" status="nominal">
                        <div className="flex justify-center p-2 bg-scada-bg rounded-sm border border-scada-border">
                            <ShaftOrbitPlot
                                vibrationX={telemetry.mechanical.vibrationX || 2.4}
                                vibrationY={telemetry.mechanical.vibrationY || 2.1}
                                size={140}
                            />
                        </div>
                    </TacticalCard>

                    <TacticalCard title="RECENT HUMAN LOGS" status="nominal">
                        <div className="space-y-2">
                            {activeLogs.slice(0, 3).map((log) => (
                                <div
                                    key={log.id}
                                    className="p-2 bg-scada-bg border border-scada-border rounded-sm"
                                >
                                    <div className="text-[8px] font-mono text-status-info">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="text-[9px] text-scada-text mt-1">
                                        {log.summaryDE || log.commentBS}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TacticalCard>
                </div>

                {/* Center: 3D Heatmap Hero */}
                <div className="col-span-6 relative" style={{ perspective: '1200px' }}>
                    <TacticalCard title="TRUTH HEATMAP (3D VISUALIZATION)" status="nominal" className="h-full">
                        <div className="relative h-full" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="absolute inset-0" style={{ transform: 'rotateY(0deg)' }}>
                                <ErrorBoundary fallback={<ModuleFallback title="3D Turbine Engine" icon="Box" />}>
                                    <React.Suspense fallback={
                                        <div className="flex items-center justify-center h-full">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border-2 border-status-info border-t-transparent animate-spin" />
                                                <span className="text-[10px] text-status-info font-mono animate-pulse">Initializing WebGL Core...</span>
                                            </div>
                                        </div>
                                    }>
                                        <TurbineRunner3D
                                        rpm={300} // Fallback if live physics disabled
                                        useLivePhysics={true} // NC-300: Industrial Grade Physics
                                        deltaMap={deltaMap}
                                        heatmapMode={true}
                                        className="h-full"
                                        showInfoPanel={true}
                                        selectedPart={selected3DPart}
                                        onSelect={setSelected3DPart}
                                        ref={turbineRef}
                                    />
                                    </React.Suspense>
                                </ErrorBoundary>
                            </div>
                            {/* Legend docked bottom-right, semi-transparent */}
                            <div className="absolute bottom-0 right-0 opacity-90">
                                <HeatmapLegend deltaMap={deltaMap} />
                            </div>
                        </div>
                    </TacticalCard>
                </div>

                {/* Right Panel: Live Metrics */}
                <div className="col-span-3 p-6 bg-slate-900 border-l border-slate-700 h-full overflow-y-auto">
                    <TacticalCard title="LIVE SENSOR DATA" status={hasCriticalRisks ? 'critical' : 'nominal'}>
                        <div className="space-y-3">
                            {liveMetrics.map((metric, i) => (
                                <div key={i}>
                                    <LiveMetricToken sensorId={metric.source?.id || `SENSOR-${i}`} />
                                </div>
                            ))}
                        </div>
                    </TacticalCard>


                    <StructuralSafetyMonitor
                        margin={structuralSafetyMargin || 100}
                        hoopStress={telemetry.physics.hoopStressMPa || 0}
                        yieldStrength={telemetry.penstock.materialYieldStrength}
                    />
                </div>
            </div>

            {/* Neural Pulse Bottom Bar */}
            <NeuralPulse />

            {/* SOP Modal */}
            {activeSop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-scada-bg/80 backdrop-blur-sm">
                    <div className="max-w-md w-full bg-scada-panel border border-scada-border shadow-scada-card rounded-sm overflow-hidden animate-in fade-in duration-150">
                        <div className="px-6 py-4 border-b border-scada-border flex items-center justify-between bg-scada-panel">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-status-info" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-scada-text font-header">Maintenance Action Plan</h3>
                            </div>
                            <button onClick={() => setActiveSop(null)} className="text-scada-muted hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="text-[10px] text-scada-muted font-mono uppercase mb-1">Failure Mode</div>
                                <div className="text-sm font-bold text-scada-text">{activeSop.failureMode}</div>
                            </div>
                            <div className="mb-6 p-3 bg-status-error/10 border border-status-error/20 rounded-sm">
                                <div className="text-[10px] text-status-error font-mono uppercase mb-1">Immediate Action</div>
                                <div className="text-xs text-scada-text leading-relaxed">{activeSop.action}</div>
                            </div>
                            <div className="space-y-4">
                                <div className="text-[10px] text-scada-muted font-mono uppercase">Step-by-Step Procedure</div>
                                {activeSop.steps.map((step) => (
                                    <div key={step.step} className="flex gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-none bg-status-info/20 border border-status-info/40 flex items-center justify-center text-[10px] font-bold text-status-info">
                                            {step.step}
                                        </div>
                                        <div className="text-xs text-scada-text leading-tight">
                                            {step.description}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Required Tools (NC-9.0) */}
                            {(() => {
                                const technicalState: TechnicalProjectState = {
                                    ...DEFAULT_TECHNICAL_STATE,
                                    ...telemetry,
                                    diagnosis: telemetry.diagnosis || undefined,
                                    physics: { ...DEFAULT_TECHNICAL_STATE.physics, ...telemetry.physics }
                                };
                                const path = SolutionArchitect.getRecoveryPath(activeSop.failureMode, technicalState);
                                if (path.actions.length === 0) return null;

                                const allTools = Array.from(new Set(path.actions.flatMap(a => a.requiredTools)));
                                if (allTools.length === 0) return null;

                                return (
                                    <div className="mt-6 p-4 bg-scada-bg/50 border border-status-info/20 rounded-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wrench className="w-3 h-3 text-status-info" />
                                            <div className="text-[10px] text-status-info font-mono uppercase font-black uppercase tracking-widest">Required Tooling Checklist</div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {allTools.map(tool => (
                                                <div key={tool} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 border border-status-info/50 rounded-none" />
                                                    <span className="text-[10px] text-scada-text font-mono">{tool}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="px-6 py-4 bg-scada-bg/50 border-t border-scada-border flex items-center justify-between">
                            <span className="text-[9px] font-mono text-scada-muted">Ref: {activeSop.kbRef}</span>
                            <button
                                onClick={() => setActiveSop(null)}
                                className="px-4 py-2 bg-status-info text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                Acknowledge SOP
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fault Injector (Educational Tool) */}
            <FaultInjectorPanel />
        </div>
    );
};
