import React, { useState, useMemo } from 'react';
import { useDigitalLedger, AuditSnapshot } from '../stores/useDigitalLedger';
import { RootCauseEngine, RootCauseAnalysis } from '../utils/RootCauseEngine';
import { generateForensicDossier } from '../utils/forensicDossier';
import { CausalChain } from './ui/CausalChain';
import { TacticalCard } from './ui/TacticalCard';
import { TurbineRunner3D } from './three/TurbineRunner3D';
import { Clock, FileText, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useContextAwareness } from '../contexts/ContextAwarenessContext';

export const ForensicLab: React.FC = () => {
    const { snapshots } = useDigitalLedger();
    const { setFocus, activeComponentId } = useContextAwareness(); // Bi-Directional Sync
    const [selectedSnapshot, setSelectedSnapshot] = useState<AuditSnapshot | null>(null);
    const [rchAnalysis, setRchAnalysis] = useState<RootCauseAnalysis | null>(null);
    const [ghostMode, setGhostMode] = useState(false);

    // Analyze selected snapshot
    const analyzeSnapshot = (snapshot: AuditSnapshot) => {
        setSelectedSnapshot(snapshot);
        const analysis = RootCauseEngine.analyze(snapshot);
        setRchAnalysis(analysis);
    };

    // Export forensic dossier
    const exportDossier = () => {
        if (selectedSnapshot && rchAnalysis) {
            generateForensicDossier(selectedSnapshot, rchAnalysis);
        }
    };

    // Format timestamp
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-transparent p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-lg font-black uppercase tracking-[0.3em] text-white font-mono mb-2">
                    FORENSIC LAB <span className="text-cyan-400">//</span> DIAGNOSTIC TIME-MACHINE
                </h1>
                <p className="text-[10px] text-slate-400 font-mono">
                    Investigate historical system states and perform root cause analysis
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left: Snapshot Timeline */}
                <div className="col-span-4">
                    <TacticalCard title="AUDIT SNAPSHOTS" status="nominal">
                        {snapshots.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No snapshots captured yet
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {snapshots.map((snapshot) => (
                                    <button
                                        key={snapshot.id}
                                        onClick={() => analyzeSnapshot(snapshot)}
                                        className={`w-full text-left p-3 rounded-sm border transition-all ${selectedSnapshot?.id === snapshot.id
                                            ? 'border-cyan-500/50 bg-cyan-950/20'
                                            : 'border-white/5 bg-slate-900/40 hover:border-cyan-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2 mb-2">
                                            <Clock className="w-3 h-3 text-cyan-400 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-mono text-white truncate">
                                                    {snapshot.id}
                                                </div>
                                                <div className="text-[8px] font-mono text-slate-400">
                                                    {formatTime(snapshot.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[8px] font-mono">
                                            <span className={`px-2 py-0.5 rounded-sm ${snapshot.data.systemHealth === 'CRITICAL'
                                                ? 'bg-red-950/40 text-red-400'
                                                : snapshot.data.systemHealth === 'DEGRADED'
                                                    ? 'bg-amber-950/40 text-amber-400'
                                                    : 'bg-cyan-950/40 text-cyan-400'
                                                }`}>
                                                {snapshot.data.systemHealth}
                                            </span>
                                            <span className="text-slate-500">
                                                {snapshot.data.diagnostics?.length || 0} events
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </TacticalCard>
                </div>

                {/* Right: Analysis */}
                <div className="col-span-8 space-y-6">
                    {selectedSnapshot ? (
                        <>
                            {/* Snapshot Details */}
                            <TacticalCard title="SNAPSHOT DETAILS" status="nominal">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                                            Snapshot ID
                                        </div>
                                        <div className="text-sm font-mono text-white">
                                            {selectedSnapshot.id}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                                            Captured
                                        </div>
                                        <div className="text-sm font-mono text-white">
                                            {formatTime(selectedSnapshot.timestamp)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                                            System Health
                                        </div>
                                        <div className={`text-sm font-mono font-bold ${selectedSnapshot.data.systemHealth === 'CRITICAL' ? 'text-red-400' :
                                            selectedSnapshot.data.systemHealth === 'DEGRADED' ? 'text-amber-400' :
                                                'text-cyan-400'
                                            }`}>
                                            {selectedSnapshot.data.systemHealth}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                                            Neural Pulse
                                        </div>
                                        <div className="text-sm font-mono text-white">
                                            {selectedSnapshot.data.neuralPulse?.progress || 0}%
                                        </div>
                                    </div>
                                </div>
                            </TacticalCard>

                            {/* Root Cause Analysis */}
                            <CausalChain analysis={rchAnalysis} />

                            {/* 3D Visualization with Ghost Mode */}
                            <TacticalCard title="3D TRUTH HEATMAP" status="nominal">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-[9px] text-slate-400 font-mono">
                                        {ghostMode ? 'Ghost Mode: Baseline Overlay Active' : 'Heatmap Mode'}
                                    </span>
                                    <button
                                        onClick={() => setGhostMode(!ghostMode)}
                                        className={`px-3 py-1 rounded-sm border text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${ghostMode
                                            ? 'bg-purple-950/40 border-purple-500/30 text-purple-400'
                                            : 'bg-slate-900/40 border-slate-700/30 text-slate-400 hover:border-purple-500/30'
                                            }`}
                                    >
                                        {ghostMode ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                                        {ghostMode ? 'GHOST ON' : 'GHOST OFF'}
                                    </button>
                                </div>
                                <div className="h-[400px]">
                                    <TurbineRunner3D
                                        rpm={300}
                                        deltaMap={selectedSnapshot.data.deltaMap}
                                        heatmapMode={true}
                                        ghostMode={ghostMode}
                                        baselineDelta={selectedSnapshot.data.deltaMap} // Use same for now
                                        onSelect={(id) => setFocus(id)}
                                        highlightId={activeComponentId}
                                    />
                                </div>
                            </TacticalCard>

                            {/* Export Button */}
                            <button
                                onClick={exportDossier}
                                className="w-full py-3 bg-cyan-950/20 border border-cyan-500/30 rounded-sm text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-cyan-950/40 transition-all flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Export Forensic Dossier (PDF)
                            </button>
                        </>
                    ) : (
                        <TacticalCard title="NO SNAPSHOT SELECTED" status="unknown">
                            <div className="text-center py-12 text-slate-500">
                                <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="text-sm">Select a snapshot from the timeline to begin investigation</p>
                            </div>
                        </TacticalCard>
                    )}
                </div>
            </div>
        </div>
    );
};
