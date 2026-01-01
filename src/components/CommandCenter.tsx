import React, { useMemo, useCallback } from 'react';
import { TurbineRunner3D } from './three/TurbineRunner3D';
import { HeatmapLegend } from './ui/HeatmapLegend';
import { NeuralPulse } from './ui/NeuralPulse';
import { TacticalCard } from './ui/TacticalCard';
import { LiveMetricToken } from './ui/LiveMetricToken';
import { TruthDeltaEngine } from '../utils/TruthDeltaEngine';
import { useContextAwareness } from '../contexts/ContextAwarenessContext';
import { useDigitalLedger } from '../stores/useDigitalLedger';
import { useTheme } from '../stores/useTheme';
import { Camera, Moon, Ghost, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { generateDiagnosticDossier } from '../utils/pdfGenerator';

export const CommandCenter: React.FC = () => {
    const {
        diagnostics,
        activeLogs,
        liveMetrics,
        activeDefinition,
        hasCriticalRisks,
        patternWeights
    } = useContextAwareness();

    const { addSnapshot } = useDigitalLedger();
    const { mode, toggleNightOps } = useTheme();
    const { showToast } = useToast();
    const [ghostMode, setGhostMode] = React.useState(false);

    // Calculate Performance Delta (Baseline vs Actual)
    // Design Baseline: 105.0 MW (Mock Design Spec)
    const baselinePower = 105.0;
    const activePowerMetric = liveMetrics.find(m => m.label.includes('Power') || m.label.includes('Output'));
    const activePowerVal = activePowerMetric ? (typeof activePowerMetric.value === 'number' ? activePowerMetric.value : parseFloat(activePowerMetric.value as string)) : 0;

    // Formula: (Actual - Baseline) / Baseline * 100
    const deltaPerf = activePowerVal > 0 ? ((activePowerVal - baselinePower) / baselinePower) * 100 : 0;

    const handleExportDossier = () => {
        showToast('Compiling Forensic Dossier (Case #9021)...', 'info');

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
            generateDiagnosticDossier(
                'CASE-9021',
                primaryInsight,
                liveMetrics,
                'Senior Engineer', // In real app, get from UserContext
                null // Snapshot placeholder for now
            );
            showToast('Hypothesis_Case_9021.pdf Downloaded successfully.', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to generate Dossier.', 'error');
        }
    };

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

    const healthColor = {
        OPTIMAL: 'text-cyan-400',
        DEGRADED: 'text-amber-400',
        CRITICAL: 'text-red-400'
    }[systemHealth];

    return (
        <div className="min-h-screen bg-transparent pb-16">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-sm border-b border-cyan-500/20">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white font-mono">
                            ANOHUB <span className="text-cyan-400">//</span> NC-4.2
                        </h1>
                        {activeDefinition && (
                            <span className="text-[10px] text-slate-400 font-mono">
                                / {activeDefinition.title}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Night Ops Toggle */}
                        <button
                            onClick={toggleNightOps}
                            className={`px-3 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${mode === 'tactical-red'
                                ? 'bg-red-950/40 border-red-500/30 text-red-400'
                                : 'bg-slate-900/40 border-slate-700/30 text-slate-400 hover:border-cyan-500/30'
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
                                ? 'bg-purple-950/40 border-purple-500/30 text-purple-400'
                                : 'bg-slate-900/40 border-slate-700/30 text-slate-400 hover:border-purple-500/30'
                                }`}
                            title="Toggle Retrofit Comparison (Ghost Mode)"
                        >
                            <Ghost className="w-3 h-3 inline mr-1" />
                            {ghostMode ? 'VALIDATOR ACTIVE' : 'RETROFIT VALIDATOR'}
                        </button>

                        {/* Forensic Dossier */}
                        <button
                            onClick={handleExportDossier}
                            className="px-3 py-1.5 rounded-sm border border-slate-700/30 bg-slate-900/20 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-slate-800 hover:text-white transition-all"
                            title="Export Forensic Hypothesis as PDF"
                        >
                            <FileText className="w-3 h-3 inline mr-1" />
                            DOSSIER
                        </button>

                        {/* Audit Snapshot */}
                        <button
                            onClick={captureSnapshot}
                            className="px-3 py-1.5 rounded-sm border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-cyan-950/40 transition-all"
                            title="Capture Audit Snapshot"
                        >
                            <Camera className="w-3 h-3 inline mr-1" />
                            SNAPSHOT
                        </button>

                        {/* System Health */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${systemHealth === 'OPTIMAL' ? 'bg-cyan-500' :
                                systemHealth === 'DEGRADED' ? 'bg-amber-500' :
                                    'bg-red-500'
                                } animate-pulse`} />
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
                        className={hasCriticalRisks ? 'glow-amber' : ''}
                    >
                        <div className="space-y-2">
                            {diagnostics.slice(0, 5).map((diag, i) => (
                                <div
                                    key={diag.id}
                                    className="p-2 bg-slate-900/40 border border-white/5 rounded-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${diag.type === 'critical' ? 'bg-red-500' :
                                            diag.type === 'warning' ? 'bg-amber-500' :
                                                'bg-cyan-500'
                                            }`} />
                                        <span className="text-[9px] font-mono text-white">
                                            {diag.messageKey}
                                        </span>
                                    </div>
                                    {diag.value && (
                                        <div className="mt-1 text-[8px] font-mono text-slate-400">
                                            {diag.value}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TacticalCard>

                    <TacticalCard title="RECENT HUMAN LOGS" status="nominal">
                        <div className="space-y-2">
                            {activeLogs.slice(0, 3).map((log) => (
                                <div
                                    key={log.id}
                                    className="p-2 bg-slate-900/40 border border-white/5 rounded-sm"
                                >
                                    <div className="text-[8px] font-mono text-cyan-400">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="text-[9px] text-white mt-1">
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
                                <TurbineRunner3D
                                    rpm={300}
                                    deltaMap={deltaMap}
                                    heatmapMode={true}
                                    ghostMode={ghostMode}
                                    baselineDelta={deltaMap} // Using current delta as baseline for demo purpose (simulating deviation)
                                    deltaIndex={deltaPerf}
                                    className="h-full"
                                />
                            </div>
                            {/* Legend docked bottom-right, semi-transparent */}
                            <div className="absolute bottom-0 right-0 opacity-90">
                                <HeatmapLegend deltaMap={deltaMap} />
                            </div>
                        </div>
                    </TacticalCard>
                </div>

                {/* Right Panel: Live Metrics */}
                <div className="col-span-3 space-y-4 overflow-y-auto">
                    <TacticalCard title="LIVE SENSOR DATA" status={hasCriticalRisks ? 'critical' : 'nominal'}>
                        <div className="space-y-3">
                            {liveMetrics.map((metric, i) => (
                                <div key={i}>
                                    <LiveMetricToken sensorId={metric.source?.id || `SENSOR-${i}`} />
                                </div>
                            ))}
                        </div>
                    </TacticalCard>
                </div>
            </div>

            {/* Neural Pulse Bottom Bar */}
            <NeuralPulse />
        </div>
    );
};
