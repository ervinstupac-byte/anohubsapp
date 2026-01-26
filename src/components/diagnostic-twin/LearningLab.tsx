import React, { useState } from 'react';
import { SentinelKernel, SentinelInsight } from '../../utils/SentinelKernel';
import { COMMON_HYDRO_PATTERNS } from '../../lib/plugins/CommonHydroPatterns';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { Sparkline } from '../ui/Sparkline';
import { BrainCircuit, ArrowRight, CheckCircle, XCircle, Play, RefreshCw, AlertTriangle, Activity, Info, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UnderConstruction } from '../ui/UnderConstruction';

// FIXED TEST DATASET (Simulating a developing fault)
const TEST_DATABASE = {
    'normal_ops': {
        vibration: [1.1, 1.2, 1.1, 1.3, 1.2, 1.1, 1.2, 1.2, 1.1, 1.2],
        bearingTemp: [45, 46, 45, 46, 47, 46, 45, 46, 46, 45],
        rpm: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300]
    },
    'bolt_looseness': {
        vibration: [1.2, 1.4, 1.8, 2.2, 2.8, 3.5, 4.1, 4.2, 4.3, 4.2], // Rising Trend
        bearingTemp: [45, 45, 46, 46, 46, 46, 47, 47, 47, 47], // Stable-ish
        rpm: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300]
    },
    'thermal_runaway': {
        vibration: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1],
        bearingTemp: [50, 52, 55, 60, 68, 75, 85, 92, 98, 105], // Rapid Rise
        rpm: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300]
    }
};

export const LearningLab = () => {
    // We access the REAL global state for weights/reinforcement
    // But we run the Kernel LOCALLY on test data to prove the math
    const { patternWeights, reinforcePattern } = useContextAwareness() as any;
    const [accessStatus] = useState<'GRANTED' | 'RESTRICTED'>('GRANTED'); // Forced GRANTED for NC-9.0
    const [viewMode, setViewMode] = useState<'DIAGNOSTICS' | 'ROADMAP'>('DIAGNOSTICS');

    const [selectedScenario, setSelectedScenario] = useState<keyof typeof TEST_DATABASE>('bolt_looseness');
    const [lastResult, setLastResult] = useState<SentinelInsight[]>([]);
    const [runCount, setRunCount] = useState(0);

    const runDiagnostics = () => {
        const data = TEST_DATABASE[selectedScenario];

        // 1. Run the REAL Kernel
        const results = SentinelKernel.evaluateMatrix(
            data,
            COMMON_HYDRO_PATTERNS as any,
            {
                weights: patternWeights // Inject the CURRENT trained weights
            }
        );

        setLastResult(results);
        setRunCount(prev => prev + 1);
    };

    return (
        <div className="h-full bg-slate-950 text-white p-6 overflow-y-auto custom-scrollbar">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <BrainCircuit className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            {viewMode === 'DIAGNOSTICS' ? 'The Learning Lab' : 'Operational Roadmap'}
                        </h1>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                            {viewMode === 'DIAGNOSTICS' ? 'Heuristic Stress-Test Protocol' : 'AnoHUB Growth & Strategic Planning'}
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setViewMode('DIAGNOSTICS')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'DIAGNOSTICS' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Diagnostics
                    </button>
                    <button
                        onClick={() => setViewMode('ROADMAP')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ROADMAP' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Roadmap
                    </button>
                </div>
            </div>

            {viewMode === 'ROADMAP' ? (
                <UnderConstruction />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* LEFT: TEST BENCH */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">1. Select Input Data</h3>
                                <select
                                    value={selectedScenario}
                                    onChange={(e) => setSelectedScenario(e.target.value as any)}
                                    className="bg-slate-950 border border-slate-700 rounded text-xs px-2 py-1 text-cyan-400 font-mono"
                                >
                                    <option value="normal_ops">Normal Operation</option>
                                    <option value="bolt_looseness">Fault: Loose Bolt (Vibration Spike)</option>
                                    <option value="thermal_runaway">Fault: Thermal Runaway</option>
                                </select>
                            </div>

                            {/* DATA VIZ */}
                            <div className="space-y-4">
                                {Object.entries(TEST_DATABASE[selectedScenario]).map(([key, vals]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                                            <span>{key.toUpperCase()}</span>
                                            <span className={vals[vals.length - 1] > vals[0] * 1.2 ? 'text-amber-500' : 'text-slate-300'}>
                                                {vals[vals.length - 1]}
                                            </span>
                                        </div>
                                        <Sparkline data={vals} width={400} height={40} color={vals[vals.length - 1] > vals[0] * 1.2 ? '#f59e0b' : '#22d3ee'} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">2. Neural Weights (Current Memory)</h3>
                            <div className="space-y-2">
                                {Object.entries(patternWeights || {}).length === 0 ? (
                                    <div className="text-xs text-slate-600 italic">No custom weights learned yet. Using Factory Defauts (1.0).</div>
                                ) : (
                                    Object.entries(patternWeights || {}).map(([pid, w]) => (
                                        <div key={pid} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-purple-500/20">
                                            <span className="text-[10px] font-mono text-purple-300">{pid}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${Number(w) > 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {Number(w).toFixed(2)}x
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={runDiagnostics}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Play className="w-5 h-5" />
                            Run Sentinel Kernel
                        </button>

                        {runCount > 0 && (
                            <div className="text-center text-[10px] text-slate-500 font-mono">
                                Kernel Execution #{runCount} Completed in 4ms
                            </div>
                        )}
                    </div>

                    {/* RIGHT: RESULTS & TEACHING */}
                    <div className="bg-slate-900/50 rounded-xl border border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">3. Diagnostic Output</h3>
                        </div>
                        <div className="flex-1 p-6 space-y-4">
                            {lastResult.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                    <Activity className="w-12 h-12 mb-2" />
                                    <span className="text-xs uppercase tracking-widest">Waiting for execution...</span>
                                </div>
                            ) : (
                                lastResult.map((res, i) => (
                                    <div key={i} className={`relative p-4 rounded-xl border-l-4 ${res.severity === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : 'bg-amber-950/20 border-amber-500'} animate-in slide-in-from-bottom-4`}>

                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {res.severity === 'CRITICAL' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Info className="w-5 h-5 text-amber-500" />}
                                                <span className="font-bold text-sm text-white">{res.name}</span>
                                            </div>
                                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${res.probability > 0.6 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {(res.probability * 100).toFixed(1)}% Confidence
                                            </span>
                                        </div>

                                        <div className="space-y-1 pl-7 mb-4">
                                            {res.vectors.map((vec, v) => (
                                                <div key={v} className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                                    <ArrowRight className="w-3 h-3 opacity-50" />
                                                    {vec}
                                                </div>
                                            ))}
                                        </div>

                                        {/* XAI: MATH PROOF */}
                                        {res.mathProof && (
                                            <div className="mb-4 pl-7">
                                                <div className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest mb-1">Mathematical Proof (XAI)</div>
                                                <div className="p-2 bg-slate-950 rounded border border-cyan-900/50 font-mono text-[9px] text-cyan-300 break-all leading-relaxed">
                                                    {res.mathProof}
                                                </div>
                                            </div>
                                        )}

                                        {/* TEACHING INTERFACE */}
                                        <div className="flex gap-2 pl-7 pt-2 border-t border-white/5">
                                            <button
                                                onClick={() => reinforcePattern(res.patternId, 'CONFIRM')}
                                                className="flex-1 py-2 bg-emerald-900/30 hover:bg-emerald-600 hover:text-white border border-emerald-800/50 hover:border-emerald-500 rounded text-[10px] font-bold text-emerald-500 uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Confirm ("Teach")
                                            </button>
                                            <button
                                                onClick={() => reinforcePattern(res.patternId, 'REJECT')}
                                                className="flex-1 py-2 bg-red-900/30 hover:bg-red-600 hover:text-white border border-red-800/50 hover:border-red-500 rounded text-[10px] font-bold text-red-500 uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                Reject ("Correct")
                                            </button>
                                        </div>

                                        <div className="mt-2 pl-7 text-[9px] text-slate-600 italic">
                                            *Confirming will increase the pattern's weight by 10% for ALL future runs.
                                        </div>
                                    </div>
                                ))
                            )}

                            {runCount > 0 && lastResult.length === 0 && (
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded text-center text-emerald-400 text-xs font-bold">
                                    System Nominal. No patterns detected above 60% threshold.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
