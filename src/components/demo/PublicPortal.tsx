import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Wind, AlertTriangle, Play, RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { DiagnosticRCA } from '../automation/DiagnosticRCA'; // Reusing the engine
import { RCAService } from '../../lib/automation/RCAService'; // Logic Core

export const PublicPortal: React.FC = () => {
    const [scenario, setScenario] = useState<'NOMINAL' | 'CAVITATION' | 'MISALIGNMENT' | 'LOOSENESS'>('NOMINAL');

    // SimulatedED TELEMETRY GENERATOR
    const getScenarioData = () => {
        const base = { rpm: 428.6, efficiency: 94.5, vibration: 0.8, temp: 65, flow: 120, head: 110 };

        switch (scenario) {
            case 'CAVITATION':
                return { ...base, vibration: 4.2, efficiency: 88.5, flow: 135, head: 105, audio: { hfNoise: -35 } }; // High noise
            case 'MISALIGNMENT':
                return { ...base, vibration: 7.5, temp: 85 }; // High 1X + Temp
            case 'LOOSENESS':
                return { ...base, vibration: 6.8 }; // High Harmonics (managed by logic usually, but here just high vibs to trigger RCA generally)
            default:
                return base;
        }
    };

    const data = getScenarioData();
    const rcaAnalysis = new RCAService();

    // Inject specific fault signatures into the RCA Engine for the demo
    const demoDiagnosis = (() => {
        if (scenario === 'NOMINAL') return null;

        // Simulating the internal RCA logic trigger
        return rcaAnalysis.analyze({
            rpm: data.rpm,
            metrics: {
                vibrationMmS: data.vibration,
                efficiencyPercent: data.efficiency,
                bearingTempC: data.temp,
                bearingTempRateOfChange: 0.2 // Simulated benign unless Misalignment
            },
            peaks: scenario === 'MISALIGNMENT'
                ? [{ frequencyHz: 7.14, amplitudeMmS: 6.0 }]
                : scenario === 'LOOSENESS'
                    ? [
                        { frequencyHz: 7.14, amplitudeMmS: 2.0 },
                        { frequencyHz: 14.28, amplitudeMmS: 2.5 },
                        { frequencyHz: 21.42, amplitudeMmS: 1.5 }
                    ]
                    : scenario === 'CAVITATION'
                        ? [{ frequencyHz: 250, amplitudeMmS: 0.8 }] // 250Hz noise > 0.5 threshold
                        : [],
            maintenance: {
                shaftPlumbnessDeviation: scenario === 'MISALIGNMENT' ? 0.35 : 0.02
            },
            specifications: {
                runnerMaterial: 'Cast Steel'
            }
        });
    })();

    // RCAResult[] -> Confidence of first item (highest)
    const confidence = demoDiagnosis && demoDiagnosis.length > 0 ? demoDiagnosis[0].confidence : 0; // Fix prop access if 'confidence' vs 'confidenceScore' (RCAResult uses 'confidence') -> Checked file: It is 'confidence'.

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">

            {/* SIDEBAR: SCENARIO SIMULATOR */}
            <div className="w-80 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        MONOLIT
                    </h1>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">GUEST ARCHITECT PORTAL</p>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Scenario Simulator
                        </h3>

                        <div className="space-y-3">
                            <button
                                onClick={() => setScenario('NOMINAL')}
                                className={`w-full p-3 text-left rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${scenario === 'NOMINAL' ? 'bg-green-900/40 text-green-400 border border-green-500/50' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                            >
                                <CheckCircleIcon active={scenario === 'NOMINAL'} /> Nominal Operation
                            </button>

                            <div className="h-px bg-slate-700 my-2" />

                            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Inject Silent Killer</p>

                            <button
                                onClick={() => setScenario('CAVITATION')}
                                className={`w-full p-3 text-left rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${scenario === 'CAVITATION' ? 'bg-blue-900/40 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-transparent hover:border-blue-900'}`}
                            >
                                <Wind className="w-4 h-4" /> Hydraulic Cavitation
                            </button>

                            <button
                                onClick={() => setScenario('MISALIGNMENT')}
                                className={`w-full p-3 text-left rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${scenario === 'MISALIGNMENT' ? 'bg-amber-900/40 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-transparent hover:border-amber-900'}`}
                            >
                                <Zap className="w-4 h-4" /> Shaft Misalignment
                            </button>

                            <button
                                onClick={() => setScenario('LOOSENESS')}
                                className={`w-full p-3 text-left rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${scenario === 'LOOSENESS' ? 'bg-red-900/40 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-transparent hover:border-red-900'}`}
                            >
                                <AlertTriangle className="w-4 h-4" /> Structural Looseness
                            </button>
                        </div>
                    </div>

                    <div className="bg-cyan-950/30 border border-cyan-800 p-4 rounded text-xs text-cyan-200/80 italic leading-relaxed">
                        "The Architect sees the invisible. Click a fault to see how the RCA Engine deconstructs the physics of failure."
                    </div>
                </div>

                <div className="text-[10px] text-slate-600 font-mono text-center">
                    DEMO MODE // NC-200
                </div>
            </div>

            {/* MAIN STAGE */}
            <div className="flex-1 overflow-y-auto bg-black relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,30,40,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,30,40,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 p-12 max-w-5xl mx-auto">

                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Live Diagnostic Twin</h2>
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm animate-pulse">
                                    LIVE FEED
                                </span>
                                <span className="text-slate-400 font-mono text-xs">UNIT-01 // FRANCIS ALPHA</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-mono font-bold text-slate-700 opacity-20">
                                {data.rpm.toFixed(1)} <span className="text-lg">RPM</span>
                            </div>
                        </div>
                    </div>

                    {/* DIAGNOSTIC CONTAINER */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={scenario}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {demoDiagnosis ? (
                                <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900/80 backdrop-blur-xl">
                                    {/* Reuse the Engine UI */}
                                    <DiagnosticRCA
                                        diagnosis={demoDiagnosis}
                                        specs={{ runnerMaterial: 'Cast Steel' }}
                                    />

                                    {/* Demo Overlay Explainers can go here if needed */}
                                    <div className="p-4 bg-black/50 border-t border-slate-800 text-center">
                                        <p className="text-slate-400 text-sm font-mono">
                                            ANALYSIS COMPLETE: {confidence}% CONFIDENCE
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-96 flex flex-col items-center justify-center border border-slate-800 rounded-xl bg-slate-900/50 border-dashed">
                                    <ShieldCheck className="w-16 h-16 text-green-500 mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white">System Nominal</h3>
                                    <p className="text-slate-400 mt-2">No active faults detected across 148 sensors.</p>
                                    <p className="text-slate-600 text-sm mt-8 animate-pulse">Waiting for telemetry injection...</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>

        </div>
    );
};

const CheckCircleIcon = ({ active }: { active: boolean }) => (
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-green-400 bg-green-400' : 'border-slate-600'}`}>
        {active && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
    </div>
);
