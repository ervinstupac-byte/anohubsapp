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
        // Simulated mapping for demo - in production this comes from the 3D scene event
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
        <div className="w-full bg-scada-bg p-6 text-scada-text border-2 border-scada-border rounded-none relative overflow-hidden">
            {/* NC-85.2: PHYSICS REMEDIATION OVERLAY WITH SMART TOOLTIP */}
            {activeDossier && (
                <div className="absolute top-16 right-6 z-50 w-80 bg-scada-panel border border-scada-border rounded-none p-4 shadow-none">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-bold text-status-info uppercase tracking-wider font-header">
                            Physics Remediation
                        </h4>
                        <button onClick={() => setActiveDossier(null)} className="text-scada-muted hover:text-scada-text transition-colors">×</button>
                    </div>

                    <div className="space-y-3">
                        {/* NC-85.2: 1-Minute Trend Sparkline */}
                        <div className="p-2 bg-scada-bg rounded-none border border-scada-border">
                            <div className="text-[9px] text-scada-muted uppercase tracking-widest mb-1 font-mono">1-MIN TREND</div>
                            <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
                                <path
                                    d="M0,20 L10,18 L20,15 L30,17 L40,12 L50,14 L60,10 L70,8 L80,11 L90,7 L100,9"
                                    fill="none"
                                    stroke="none"
                                />
                                <polyline
                                    points="0,20 10,18 20,15 30,17 40,12 50,14 60,10 70,8 80,11 90,7 100,9"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-status-info"
                                />
                            </svg>
                        </div>

                        <div>
                            <div className="text-xs text-scada-muted font-mono">DIAGNOSIS</div>
                            <div className="text-sm font-medium text-scada-text font-mono">{activeDossier.Diagnosis}</div>
                        </div>

                        <div>
                            <div className="text-xs text-scada-muted font-mono">PHYSICS MODEL</div>
                            <div className="text-xs font-mono text-status-ok">
                                {activeDossier.PhysicsModel.primary} ({activeDossier.PhysicsModel.iecCompliance})
                            </div>
                        </div>

                        <div className={`p-3 rounded-none border ${activeDossier.Remediation.priority === 'CRITICAL' ? 'bg-status-error/10 border-status-error' : 'bg-scada-bg border-scada-border'}`}>
                            <div className="text-xs font-bold mb-1 flex items-center justify-between font-mono">
                                <span className="text-scada-text">ACTION REQUIRED</span>
                                <span className="text-[10px] bg-status-error text-scada-bg px-1 rounded-none">{activeDossier.Remediation.priority}</span>
                            </div>
                            <div className="text-sm text-scada-text font-mono">
                                {activeDossier.Remediation.action}
                            </div>
                        </div>

                        {/* NC-85.2: Dossier Action Link */}
                        <button
                            className="w-full text-left text-xs text-status-info hover:text-status-info/80 transition-colors p-2 rounded-none bg-status-info/10 border border-status-info/20 hover:border-status-info/40 flex items-center gap-2 font-mono"
                            onClick={() => {
                                console.log(`[NC-85.2] Navigate to dossier: ${activeDossier.DossierID}`);
                                // In production: navigate to Learning Lab or Dossier Viewer
                            }}
                        >
                            <span className="text-status-info">→</span>
                            <span className="font-mono">{activeDossier.DossierID}:</span>
                            <span className="truncate">{activeDossier.Remediation.action.slice(0, 30)}...</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ... rest of existing render ... */}

            {/* (Temporary Demo Trigger for QA) */}
            <div className="absolute bottom-4 right-4 z-50 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => handleHotspotClick('RUNNER')} className="text-[10px] bg-indigo-900 px-2 py-1 rounded-none border border-indigo-500">Test: Runner Physics</button>
                <button onClick={() => handleHotspotClick('BEARING')} className="text-[10px] bg-indigo-900 px-2 py-1 rounded-none border border-indigo-500">Test: Bearing Oil Whip</button>
            </div>

            {/* Offline Banner */}
            {isOffline && (
                <div className="absolute top-0 left-0 w-full bg-status-warning text-scada-bg text-center text-xs font-bold py-1 z-50 font-mono uppercase tracking-widest">
                    <WifiOff className="inline w-3 h-3 mr-1" /> OFFLINE MODE - CONNECTIVITY LOST
                </div>
            )}

            {/* ... rest of existing code ... */}

            <div className="flex items-center justify-between mb-8 relative z-10 pt-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-scada-panel rounded-none border border-scada-border shadow-none">
                        <Brain className="w-8 h-8 text-status-info" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-scada-text font-header">Sovereign<span className="text-status-info">Core</span></h1>
                        <p className="text-sm text-scada-muted font-mono">NC-73.0 • UNIFIED CONSCIOUSNESS</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-scada-muted uppercase tracking-widest mb-1 font-mono">System Pulse</div>
                    <div className={`text-4xl font-black font-mono tabular-nums ${data.pulse.index > 80 ? 'text-status-ok' : data.pulse.index > 50 ? 'text-status-warning' : 'text-status-error'}`}>
                        {data.pulse.index.toFixed(0)}%
                    </div>
                    <div className="text-xs font-bold text-status-info font-mono">{data.pulse.status}</div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 relative z-10">

                {/* 1. STRATEGIC CORTEX */}
                <div className="col-span-8 bg-scada-panel border border-scada-border rounded-none p-6 flex flex-col justify-between min-h-[250px] shadow-none">
                    <div>
                        <h3 className="text-sm font-bold text-scada-muted uppercase mb-4 flex items-center gap-2 font-header">
                            <Activity className="w-4 h-4" />
                            Current Strategic Directive
                        </h3>
                        <div className="text-4xl font-black text-scada-text mb-4 font-mono uppercase">
                            {data.strategy.mode.replace('_', ' ')}
                        </div>
                        <p className="text-lg text-scada-text font-light border-l-4 border-status-info pl-4 py-2 font-mono">
                            "{data.strategy.rationale}"
                        </p>
                    </div>

                    <div className="mt-6 flex justify-between items-end">
                        <div className="flex gap-4">
                            <div className="px-3 py-1 bg-scada-bg rounded-none border border-scada-border text-xs text-scada-muted flex items-center gap-2 font-mono">
                                <Menu className="w-3 h-3" />
                                Dominant Module: <span className="text-scada-text font-bold">{data.hierarchy.winner}</span>
                            </div>
                            {data.hierarchy.overrides > 0 && (
                                <div className="px-3 py-1 bg-scada-bg rounded-none border border-scada-border text-xs text-scada-muted font-mono">
                                    Overrides Active: <span className="text-status-warning font-bold">{data.hierarchy.overrides}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setManualOverride(!manualOverride)}
                            className={`px-4 py-2 rounded-none text-xs font-bold border flex items-center gap-2 font-mono uppercase tracking-wider transition-colors ${manualOverride ? 'bg-status-warning text-scada-bg border-status-warning' : 'bg-scada-bg border-scada-border hover:bg-scada-border text-scada-muted hover:text-scada-text'}`}
                        >
                            <Settings className="w-3 h-3" />
                            {manualOverride ? 'MANUAL OVERRIDE ACTIVE' : 'ENABLE OVERRIDE'}
                        </button>
                    </div>

                    {/* MANUAL OVERRIDE PANEL (Physics Guardrails) */}
                    {manualOverride && (
                        <div className="mt-4 p-4 bg-scada-bg rounded-none border border-status-warning/30 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-scada-muted block mb-1 font-mono uppercase">Target Load (MW)</label>
                                <input
                                    type="number"
                                    value={targetLoad}
                                    onChange={handleLoadChange}
                                    min={LIMITS.targetLoad.min}
                                    max={LIMITS.targetLoad.max}
                                    className="w-full bg-scada-panel border border-scada-border rounded-none px-2 py-1 text-scada-text font-mono focus:border-status-info focus:outline-none"
                                />
                                <div className="text-[10px] text-scada-muted mt-1 font-mono">Limit: {LIMITS.targetLoad.min}-{LIMITS.targetLoad.max} MW</div>
                            </div>
                            <div>
                                <label className="text-xs text-scada-muted block mb-1 font-mono uppercase">Blade Angle (°)</label>
                                <input
                                    type="number"
                                    value={bladeAngle}
                                    onChange={(e) => setBladeAngle(Math.min(32, Math.max(0, parseFloat(e.target.value))))}
                                    min={LIMITS.bladeAngle.min}
                                    max={LIMITS.bladeAngle.max}
                                    className="w-full bg-scada-panel border border-scada-border rounded-none px-2 py-1 text-scada-text font-mono focus:border-status-info focus:outline-none"
                                />
                                <div className="text-[10px] text-scada-muted mt-1 font-mono">Limit: {LIMITS.bladeAngle.min}-{LIMITS.bladeAngle.max}°</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. SUB-INDICES */}
                <div className="col-span-4 grid grid-cols-2 gap-4">
                    <div className="bg-scada-panel border border-scada-border rounded-none p-4 flex flex-col items-center justify-center shadow-none">
                        <Heart className="w-5 h-5 text-status-ok mb-2" />
                        <div className="text-2xl font-bold font-mono text-scada-text">{data.indices.phy.toFixed(0)}</div>
                        <div className="text-[10px] text-scada-muted uppercase font-mono tracking-wider">Physical</div>
                    </div>
                    <div className="bg-scada-panel border border-scada-border rounded-none p-4 flex flex-col items-center justify-center shadow-none">
                        <TrendingUp className="w-5 h-5 text-status-warning mb-2" />
                        <div className="text-2xl font-bold font-mono text-scada-text">{data.indices.fin.toFixed(0)}</div>
                        <div className="text-[10px] text-scada-muted uppercase font-mono tracking-wider">Financial</div>
                    </div>
                    <div className="bg-scada-panel border border-scada-border rounded-none p-4 flex flex-col items-center justify-center shadow-none">
                        <Brain className="w-5 h-5 text-status-info mb-2" />
                        <div className="text-2xl font-bold font-mono text-scada-text">{data.indices.eco.toFixed(0)}</div>
                        <div className="text-[10px] text-scada-muted uppercase font-mono tracking-wider">Eco</div>
                    </div>
                    <div className="bg-scada-panel border border-scada-border rounded-none p-4 flex flex-col items-center justify-center shadow-none">
                        <Shield className="w-5 h-5 text-status-info mb-2" />
                        <div className="text-2xl font-bold font-mono text-scada-text">{data.indices.cyb.toFixed(0)}</div>
                        <div className="text-[10px] text-scada-muted uppercase font-mono tracking-wider">Cyber</div>
                    </div>
                </div>

                {/* 3. SYSTEMIC RISKS */}
                {data.pulse.risks.length > 0 && (
                    <div className="col-span-12 bg-status-error/10 border border-status-error/30 rounded-none p-4 flex items-start gap-4">
                        <div className="p-2 bg-status-error/20 rounded-none">
                            <Activity className="w-5 h-5 text-status-error" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-status-error uppercase mb-1 font-mono tracking-wider">Systemic Correlation Detected</h4>
                            <div className="text-sm text-scada-text font-mono">
                                {data.pulse.risks.join(' • ')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
