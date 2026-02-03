import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Zap, Database } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { RCAResult } from '../../lib/automation/RCAService';
import { FrequencyPeak } from '../../services/VibrationExpert';

// NC-300: RCA is now a singleton in useTelemetryStore - no local instance needed

// NC-200: Public Portal Props
interface DiagnosticRCAProps {
    diagnosis?: RCAResult[] | null;
    specs?: { runnerMaterial: string };
}

export const DiagnosticRCA: React.FC<DiagnosticRCAProps> = ({ diagnosis: externalDiagnosis, specs: externalSpecs }) => {
    const [isThinking, setIsThinking] = useState(false);
    const [expandedCause, setExpandedCause] = useState<string | null>(null);

    // NC-300: Consume RCA results from centralized store
    const storeResults = useTelemetryStore(state => state.rcaResults);
    const selectDiagnostic = useTelemetryStore(state => state.selectDiagnostic);
    // NC-400: DNA baseline for evidence display
    const baselineState = useTelemetryStore(state => state.baselineState);

    // Use external diagnosis (demo mode) or store results
    const results = externalDiagnosis ?? storeResults;

    // 1. Gather Intelligence (Telemetry) - still needed for UI display
    const rpm = useTelemetryStore(state => state.mechanical?.rpm ?? 0);
    const vibration = useTelemetryStore(state => state.mechanical?.vibrationX ?? 0);
    const bearingTemp = useTelemetryStore(state => state.mechanical?.bearingTemp ?? 0);
    const efficiency = useTelemetryStore(state => state.hydraulic?.efficiency ?? 92);

    // Synthetic Spectrum for display purposes
    const f0 = rpm / 60;
    const syntheticPeaks: FrequencyPeak[] = useMemo(() => {
        const peaks: FrequencyPeak[] = [];
        if (vibration > 3.0) peaks.push({ frequencyHz: f0, amplitudeMmS: vibration * 0.8 });
        if (vibration > 1.5) peaks.push({ frequencyHz: f0 * 2, amplitudeMmS: vibration * 0.4 });
        return peaks;
    }, [rpm, vibration, f0]);

    const { logs } = useMaintenance();
    const plumbness = useMemo(() => {
        const log = logs.find(l => l.commentBS.toLowerCase().includes('runout'));
        return log?.measuredValue || 0.02;
    }, [logs]);

    // NC-300: Handle diagnostic selection for context-aware UI
    const handleDiagnosticClick = (cause: string) => {
        setExpandedCause(expandedCause === cause ? null : cause);
        selectDiagnostic(expandedCause === cause ? null : cause);
    };

    if (results.length === 0 && vibration < 1.5) return null; // Hide if healthy

    return (
        <div className="w-full bg-slate-800 rounded-xl border border-slate-600/50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="p-3 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className={`w-4 h-4 ${isThinking ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        {isThinking ? 'Correlating Logic...' : 'NC-140 RCA Engine'}
                    </span>
                </div>
                {results.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                        {results.length} FAULTS DETECTED
                    </span>
                )}
            </div>

            {/* Results List */}
            <div className="p-2 space-y-2">
                <AnimatePresence>
                    {results.map((result, idx) => (
                        <motion.div
                            key={result.cause}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`rounded border p-3 cursor-pointer transition-colors ${result.severity === 'CRITICAL' ? 'bg-red-900/10 border-red-500/40 hover:bg-red-900/20' :
                                result.severity === 'WARNING' ? 'bg-amber-900/10 border-amber-500/40 hover:bg-amber-900/20' :
                                    'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                                }`}
                            onClick={() => setExpandedCause(expandedCause === result.cause ? null : result.cause)}
                        >
                            {/* Title & Confidence */}
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`text-xs font-bold uppercase ${result.severity === 'CRITICAL' ? 'text-red-400' :
                                    result.severity === 'WARNING' ? 'text-amber-400' : 'text-slate-300'
                                    }`}>
                                    {result.cause}
                                </h4>
                                <div className="text-right">
                                    <span className="block text-xs font-mono font-black text-white">
                                        {(result.confidence * 100).toFixed(0)}%
                                    </span>
                                    <span className="text-[9px] text-slate-500 uppercase">Confidence</span>
                                </div>
                            </div>

                            {/* Confidence Bar */}
                            <div className="h-1 w-full bg-slate-700/50 rounded-full mb-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.confidence * 100}%` }}
                                    className={`h-full rounded-full ${result.severity === 'CRITICAL' ? 'bg-red-500' :
                                        result.severity === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500'
                                        }`}
                                />
                            </div>

                            {/* Werkmeister Recommendation (Always visible) */}
                            <div className="flex items-start gap-2 mb-2">
                                <Zap className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-200 italic leading-snug">
                                    "{result.werkmeisterRecommendation}"
                                </p>
                            </div>

                            {/* Evidence Toggle */}
                            <div className="flex items-center justify-center pt-1 border-t border-white/5 group">
                                {expandedCause === result.cause ? (
                                    <ChevronUp className="w-3 h-3 text-slate-500" />
                                ) : (
                                    <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                                )}
                            </div>

                            {/* Expanded Evidence */}
                            {expandedCause === result.cause && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-2 pt-2 border-t border-white/5 space-y-1"
                                >
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Logic Trace:</p>
                                    {result.evidence.map((ev, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                            <div className="w-1 h-1 rounded-full bg-slate-500" />
                                            {ev}
                                        </div>
                                    ))}

                                    {/* NC-400: DNA Baseline Badge */}
                                    {baselineState && (
                                        <div className="mt-3 flex items-center gap-2 bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1.5">
                                            <Database className="w-3 h-3 text-cyan-400" />
                                            <div className="flex-1">
                                                <span className="text-[9px] text-cyan-300 font-bold uppercase">
                                                    Based on Commissioning DNA
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[8px] text-slate-500">
                                                        Baseline: {baselineState.plumbnessDeviation}mm
                                                    </span>
                                                    <span className="text-[8px] text-slate-600">•</span>
                                                    <span className="text-[8px] text-slate-500">
                                                        {new Date(baselineState.commissioningDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="DNA Verified" />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* SNAPSHOT TRIGGER */}
                {results.length > 0 && (
                    <button
                        onClick={() => setExpandedCause('SNAPSHOT_MODE')}
                        className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black border border-slate-700 hover:border-cyan-500 rounded transition-all group"
                    >
                        <Zap className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                        <span className="text-[9px] font-black tracking-widest text-slate-400 group-hover:text-white">CAPTURE FORENSIC SNAPSHOT</span>
                    </button>
                )}
            </div>

            {/* FORENSIC LIGHTBOX (For Screenshotting) */}
            <AnimatePresence>
                {expandedCause === 'SNAPSHOT_MODE' && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8 backdrop-blur-xl"
                        onClick={() => setExpandedCause(null)}
                    >
                        {/* The Capture Card */}
                        <div
                            className="w-[800px] bg-[#0a0a0a] border-2 border-cyan-500/30 p-8 shadow-[0_0_100px_rgba(6,182,212,0.1)] relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Watermarks */}
                            <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-900 tracking-[0.5em] font-black uppercase pointer-events-none select-none">
                                CONFIDENTIAL // DIAGNOSTIC INTERCEPT
                            </div>
                            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-800 tracking-widest font-black uppercase pointer-events-none select-none">
                                SOVEREIGN SYSTEMS // UNIT-01 // {new Date().toLocaleDateString()}
                            </div>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8 border-b border-cyan-500/20 pb-6">
                                <div className="p-3 bg-cyan-950/20 border border-cyan-500/50 rounded">
                                    <Brain className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
                                        Root Cause Analysis
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-red-500 text-black text-xs font-black uppercase">CRITICAL FAULT DETECTED</span>
                                        <span className="text-xs font-mono text-cyan-600">ID: RCA-{Date.now().toString().slice(-6)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* The Verdict */}
                            <div className="grid grid-cols-3 gap-8 mb-8">
                                <div className="col-span-2 space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Primary Diagnosis</label>
                                        <div className="text-4xl font-black text-red-500 uppercase leading-none tracking-tight">
                                            {results[0].cause}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Logic Evidence Trace</label>
                                        <ul className="space-y-2">
                                            {results[0].evidence.map((ev, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-mono text-cyan-300">
                                                    <span className="w-1.5 h-1.5 bg-cyan-500 box-shadow-[0_0_8px_cyan]" />
                                                    {ev}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="col-span-1 bg-slate-900/50 border border-white/5 p-4 flex flex-col items-center justify-center gap-2">
                                    <div className="text-5xl font-black text-white">
                                        {(results[0].confidence * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Confidence
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-cyan-500" style={{ width: `${results[0].confidence * 100}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Werkmeister Recommendation */}
                            <div className="bg-amber-950/20 border border-amber-500/30 p-6 flex gap-4">
                                <Zap className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 block">Werkmeister Field Recommendation</label>
                                    <p className="text-xl font-medium text-amber-100 italic">
                                        "{results[0].werkmeisterRecommendation}"
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                        </div>

                        <p className="fixed bottom-8 text-slate-500 text-xs font-mono uppercase tracking-widest animate-pulse">
                            Press Win+Shift+S to Capture • Click anywhere to Close
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
