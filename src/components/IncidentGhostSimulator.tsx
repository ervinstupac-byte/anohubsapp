import React from 'react';
import { useAIPrediction } from '../contexts/AIPredictionContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';

export const IncidentGhostSimulator: React.FC = () => {
    const { incidentPatterns } = useAIPrediction();

    if (incidentPatterns.length === 0) {
        return (
            <GlassCard className="bg-slate-900/40 border-l-4 border-l-emerald-500">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">
                    👻 Incident Ghost Simulator
                </h3>
                <p className="text-[10px] text-slate-500 mb-3">
                    Pattern matching sa historijskim incidentima
                </p>
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-center">
                    <p className="text-xs text-emerald-400 font-bold">✅ No Historical Pattern Matches Detected</p>
                    <p className="text-[9px] text-slate-500 mt-1">Current operation parameters are unique</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="bg-red-950/10 border-l-4 border-l-red-500">
            <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="animate-pulse">👻</span> Incident Ghost Simulator
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
                Pattern matching sa historijskim incidentima - UPOZORENJE DETEKTOVANO
            </p>

            <div className="space-y-4">
                {incidentPatterns.map((pattern, index) => (
                    <div
                        key={index}
                        className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">⚠️</span>
                                    <h4 className="text-sm font-black text-red-300 uppercase tracking-tight">
                                        PATTERN MATCH DETECTED
                                    </h4>
                                </div>
                                <div className="space-y-1 text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Incident ID:</span>
                                        <span className="font-mono text-red-400 font-bold">{pattern.matchedIncidentId}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Pattern Type:</span>
                                        <span className="font-bold text-amber-400">{pattern.pattern.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Similarity:</span>
                                        <span className="font-mono font-black text-red-300">{pattern.similarity.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 relative">
                                    <svg viewBox="0 0 36 36" className="transform -rotate-90">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#1e293b"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#ef4444"
                                            strokeWidth="2"
                                            strokeDasharray={`${pattern.similarity}, 100`}
                                            className="animate-pulse"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-black text-red-400">{pattern.similarity.toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning message */}
                        <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                                <span className="text-xl mt-0.5">🔊</span>
                                <div className="flex-1">
                                    <pre className="text-[10px] text-red-200 font-bold whitespace-pre-wrap leading-relaxed">
                                        {pattern.warningMessage}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Historical data preview */}
                        {pattern.historicalData && (
                            <details className="mt-3">
                                <summary className="text-[9px] text-slate-500 uppercase font-bold cursor-pointer hover:text-slate-400 transition-colors">
                                    Historical Incident Details ▼
                                </summary>
                                <div className="mt-2 p-2 bg-slate-950/50 rounded border border-white/5">
                                    <p className="text-[9px] text-slate-400 mb-2">{pattern.historicalData.description}</p>
                                    {pattern.historicalData.pressureSignature && (
                                        <div className="text-[8px] text-slate-500 font-mono">
                                            Pressure Signature: [{pattern.historicalData.pressureSignature.join(', ')}]
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Action buttons */}
                        <div className="mt-3 flex gap-2">
                            <button className="flex-1 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded text-[9px] font-black text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">
                                📋 Review Incident Report
                            </button>
                            <button className="flex-1 px-3 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded text-[9px] font-black text-amber-400 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest">
                                🚨 Escalate to Engineering
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};
