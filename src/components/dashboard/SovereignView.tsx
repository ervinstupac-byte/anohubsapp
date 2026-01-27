import React, { useState } from 'react';
import { Brain, Heart, Shield, TrendingUp, Activity, Menu, Settings, WifiOff } from 'lucide-react';
import { ConnectivityManager } from '../../services/ConnectivityManager';

interface SovereignData {
    strategy: { mode: string; rationale: string; };
    pulse: { index: number; status: string; risks: string[]; };
    hierarchy: { winner: string; overrides: number; };
    indices: { phy: number; fin: number; eco: number; cyb: number; };
}

// Validation Limits
const LIMITS = {
    targetLoad: { min: 0, max: 120, unit: 'MW' },
    bladeAngle: { min: 0, max: 32, unit: 'deg' }
};

// ... existing imports
import { dossierRegistry, ExpertDossier } from '../../services/DossierRegistryService';

// ... existing code ...

export const SovereignView: React.FC<{ data: SovereignData }> = ({ data }) => {
    const [manualOverride, setManualOverride] = useState(false);
    const [targetLoad, setTargetLoad] = useState(80);
    const [bladeAngle, setBladeAngle] = useState(15);
    const [isOffline, setIsOffline] = useState(!ConnectivityManager.getStatus());
    const [activeDossier, setActiveDossier] = useState<ExpertDossier | null>(null);

    // Hook for connectivity
    React.useEffect(() => {
        ConnectivityManager.subscribe((online) => setIsOffline(!online));
    }, []);

    // Strict Validation Handler
    const handleLoadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            // Clamp logic provided by min/max in input, but also strictly here
            if (val >= LIMITS.targetLoad.min && val <= LIMITS.targetLoad.max) {
                setTargetLoad(val);
            }
        }
    };

    // Physics Integration: Fetch remediation on hotspot interaction
    const handleHotspotClick = async (subsystem: string) => {
        // Mock mapping for demo - in production this comes from the 3D scene event
        const lookupId = subsystem === 'RUNNER' ? 'DOS-KAP-001' :
            subsystem === 'BEARING' ? 'DOS-BEA-006' :
                'DOS-THE-008'; // Default fallback

        const dossier = await dossierRegistry.getDossier(lookupId);
        if (dossier) {
            setActiveDossier(dossier);
            console.log(`[SovereignView] Loaded Physics Remediation: ${dossier.DossierID}`);
        }
    };

    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl relative overflow-hidden">
            {/* NC-85.2: PHYSICS REMEDIATION OVERLAY WITH SMART TOOLTIP */}
            {activeDossier && (
                <div className="absolute top-16 right-6 z-50 w-80 glass-sovereign rounded-lg p-4 shadow-2xl animate-in slide-in-from-right-10 gpu-accelerated">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                            Physics Remediation
                        </h4>
                        <button onClick={() => setActiveDossier(null)} className="text-slate-500 hover:text-white transition-colors">×</button>
                    </div>

                    <div className="space-y-3">
                        {/* NC-85.2: 1-Minute Trend Sparkline */}
                        <div className="p-2 bg-slate-950/50 rounded border border-slate-700/50">
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">1-MIN TREND</div>
                            <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgb(6,182,212)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,20 L10,18 L20,15 L30,17 L40,12 L50,14 L60,10 L70,8 L80,11 L90,7 L100,9"
                                    fill="url(#sparkline-gradient)"
                                    stroke="none"
                                />
                                <polyline
                                    points="0,20 10,18 20,15 30,17 40,12 50,14 60,10 70,8 80,11 90,7 100,9"
                                    fill="none"
                                    stroke="rgb(6,182,212)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="gpu-accelerated"
                                />
                            </svg>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">DIAGNOSIS</div>
                            <div className="text-sm font-medium text-white">{activeDossier.Diagnosis}</div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">PHYSICS MODEL</div>
                            <div className="text-xs font-mono text-emerald-400">
                                {activeDossier.PhysicsModel.primary} ({activeDossier.PhysicsModel.iecCompliance})
                            </div>
                        </div>

                        <div className={`p-3 rounded border ${activeDossier.Remediation.priority === 'CRITICAL' ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800 border-slate-600'}`}>
                            <div className="text-xs font-bold mb-1 flex items-center justify-between">
                                <span>ACTION REQUIRED</span>
                                <span className="text-[10px] bg-red-500 text-white px-1 rounded">{activeDossier.Remediation.priority}</span>
                            </div>
                            <div className="text-sm text-slate-200">
                                {activeDossier.Remediation.action}
                            </div>
                        </div>

                        {/* NC-85.2: Dossier Action Link */}
                        <button
                            className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/40 flex items-center gap-2"
                            onClick={() => {
                                console.log(`[NC-85.2] Navigate to dossier: ${activeDossier.DossierID}`);
                                // In production: navigate to Learning Lab or Dossier Viewer
                            }}
                        >
                            <span className="text-cyan-500">→</span>
                            <span className="font-mono">{activeDossier.DossierID}:</span>
                            <span className="truncate">{activeDossier.Remediation.action.slice(0, 30)}...</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ... rest of existing render ... */}

            {/* (Temporary Demo Trigger for QA) */}
            <div className="absolute bottom-4 right-4 z-50 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => handleHotspotClick('RUNNER')} className="text-[10px] bg-indigo-900 px-2 py-1 rounded border border-indigo-500">Test: Runner Physics</button>
                <button onClick={() => handleHotspotClick('BEARING')} className="text-[10px] bg-indigo-900 px-2 py-1 rounded border border-indigo-500">Test: Bearing Oil Whip</button>
            </div>

            {/* Offline Banner */}
            {isOffline && (
                <div className="absolute top-0 left-0 w-full bg-amber-500 text-black text-center text-xs font-bold py-1 z-50">
                    <WifiOff className="inline w-3 h-3 mr-1" /> OFFLINE MODE - CONNECTIVITY LOST
                </div>
            )}

            {/* ... rest of existing code ... */}

            {/* Background Pulse Effect */}
            <div className={`absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse`} />

            <div className="flex items-center justify-between mb-8 relative z-10 pt-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-950 rounded-full border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <Brain className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">Sovereign<span className="text-indigo-400">Core</span></h1>
                        <p className="text-sm text-slate-400 font-mono">NC-73.0 • UNIFIED CONSCIOUSNESS</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">System Pulse</div>
                    <div className={`text-4xl font-black ${data.pulse.index > 80 ? 'text-emerald-400' : data.pulse.index > 50 ? 'text-amber-400' : 'text-red-500'}`}>
                        {data.pulse.index.toFixed(0)}%
                    </div>
                    <div className="text-xs font-bold text-indigo-300">{data.pulse.status}</div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 relative z-10">

                {/* 1. STRATEGIC CORTEX */}
                <div className="col-span-8 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl p-6 flex flex-col justify-between min-h-[250px]">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Current Strategic Directive
                        </h3>
                        <div className="text-4xl font-black text-white mb-4">
                            {data.strategy.mode.replace('_', ' ')}
                        </div>
                        <p className="text-lg text-slate-300 font-light border-l-4 border-indigo-500 pl-4 py-2">
                            "{data.strategy.rationale}"
                        </p>
                    </div>

                    <div className="mt-6 flex justify-between items-end">
                        <div className="flex gap-4">
                            <div className="px-3 py-1 bg-slate-800 rounded border border-slate-600 text-xs text-slate-400 flex items-center gap-2">
                                <Menu className="w-3 h-3" />
                                Dominant Module: <span className="text-white font-bold">{data.hierarchy.winner}</span>
                            </div>
                            {data.hierarchy.overrides > 0 && (
                                <div className="px-3 py-1 bg-slate-800 rounded border border-slate-600 text-xs text-slate-400">
                                    Overrides Active: <span className="text-amber-400 font-bold">{data.hierarchy.overrides}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setManualOverride(!manualOverride)}
                            className={`px-4 py-2 rounded text-xs font-bold border flex items-center gap-2 ${manualOverride ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                        >
                            <Settings className="w-3 h-3" />
                            {manualOverride ? 'MANUAL OVERRIDE ACTIVE' : 'ENABLE OVERRIDE'}
                        </button>
                    </div>

                    {/* MANUAL OVERRIDE PANEL (Physics Guardrails) */}
                    {manualOverride && (
                        <div className="mt-4 p-4 bg-slate-950/50 rounded border border-amber-500/30 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Target Load (MW)</label>
                                <input
                                    type="number"
                                    value={targetLoad}
                                    onChange={handleLoadChange}
                                    min={LIMITS.targetLoad.min}
                                    max={LIMITS.targetLoad.max}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white font-mono"
                                />
                                <div className="text-[10px] text-slate-500 mt-1">Limit: {LIMITS.targetLoad.min}-{LIMITS.targetLoad.max} MW</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Blade Angle (°)</label>
                                <input
                                    type="number"
                                    value={bladeAngle}
                                    onChange={(e) => setBladeAngle(Math.min(32, Math.max(0, parseFloat(e.target.value))))}
                                    min={LIMITS.bladeAngle.min}
                                    max={LIMITS.bladeAngle.max}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white font-mono"
                                />
                                <div className="text-[10px] text-slate-500 mt-1">Limit: {LIMITS.bladeAngle.min}-{LIMITS.bladeAngle.max}°</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. SUB-INDICES */}
                <div className="col-span-4 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center">
                        <Heart className="w-5 h-5 text-emerald-400 mb-2" />
                        <div className="text-2xl font-bold">{data.indices.phy.toFixed(0)}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Physical</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber-400 mb-2" />
                        <div className="text-2xl font-bold">{data.indices.fin.toFixed(0)}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Financial</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center">
                        <Brain className="w-5 h-5 text-sky-400 mb-2" />
                        <div className="text-2xl font-bold">{data.indices.eco.toFixed(0)}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Eco</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-400 mb-2" />
                        <div className="text-2xl font-bold">{data.indices.cyb.toFixed(0)}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Cyber</div>
                    </div>
                </div>

                {/* 3. SYSTEMIC RISKS */}
                {data.pulse.risks.length > 0 && (
                    <div className="col-span-12 bg-red-950/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-4 animate-pulse">
                        <div className="p-2 bg-red-900/50 rounded-full">
                            <Activity className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-400 uppercase mb-1">Systemic Correlation Detected</h4>
                            <div className="text-sm text-red-200">
                                {data.pulse.risks.join(' • ')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
