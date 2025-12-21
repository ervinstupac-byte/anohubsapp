// Universal Morphing Dashboard
// The main "Face" of AnoHUB that adapts to machine type

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Gauge, Activity, Radio, Droplet } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { TurbineFactory, TurbineType, KaplanTurbine, FrancisTurbine, PeltonTurbine, TurbineFamily } from '../models/turbine/TurbineFactory';
import { DecisionEngine } from '../services/DecisionEngine';
import { SafetyInterlockEngine } from '../services/SafetyInterlockEngine';

// Placeholder universal widgets
const VibrationMonitor = () => <div className="p-4 rounded bg-black/20 text-center"><Activity className="mx-auto mb-2" />Vibration: 2.4 mm/s</div>;
const TemperatureChart = () => <div className="p-4 rounded bg-black/20 text-center"><Gauge className="mx-auto mb-2" />Bearing Temp: 65°C</div>;
const AcousticMonitor = () => <div className="p-4 rounded bg-black/20 text-center"><Radio className="mx-auto mb-2" />Cavitation: 2/10</div>;

export const UniversalTurbineDashboard: React.FC = () => {
    // State
    const [turbineType, setTurbineType] = useState<TurbineType>('kaplan');
    const [assetId, setAssetId] = useState('KAPLAN-UNIT-01');
    const [model, setModel] = useState<TurbineFamily>(new KaplanTurbine());
    const [interlockStatus, setInterlockStatus] = useState(SafetyInterlockEngine.getStatus());

    // Switch turbine type handler (Simulating navigating to different asset)
    const handleSwitchType = (type: TurbineType) => {
        setTurbineType(type);
        setAssetId(`${type.toUpperCase()}-UNIT-01`);
        setModel(TurbineFactory.create(type));
    };

    // Dynamic Styles based on turbine
    const colors = model.getColorScheme();

    return (
        <div className={`min-h-screen p-6 transition-colors duration-1000 bg-gradient-to-br ${colors.background}`}>

            {/* TOP BAR */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                        AnoHUB <span style={{ color: colors.primary }}>OS</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-xs">{assetId}</span>
                        <span className="text-xs uppercase font-bold">• {turbineType} CONFIGURATION</span>
                    </div>
                </div>

                {/* Interlock Status */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 ${interlockStatus.status === 'LOCKED' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' :
                        interlockStatus.status === 'UNLOCKED' ? 'border-amber-500 bg-amber-950/40 text-amber-400' :
                            'border-red-500 bg-red-950/40 text-red-100 animate-pulse'
                    }`}>
                    <Shield className="w-5 h-5" />
                    <span className="font-black text-sm uppercase">SCADA {interlockStatus.status}</span>
                </div>

                {/* Turbine Switcher (Dev Mode) */}
                <div className="flex bg-black/40 rounded-lg p-1">
                    {(['kaplan', 'francis', 'pelton'] as TurbineType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => handleSwitchType(type)}
                            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${turbineType === type
                                    ? `bg-[${colors.primary}] text-white shadow-lg`
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            style={{
                                backgroundColor: turbineType === type ? colors.primary : 'transparent'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </header>

            {/* MAIN DASHBOARD GRID */}
            <div className="grid grid-cols-12 gap-6">

                {/* LEFT: Universal Metrics (Always present) */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <GlassCard className="p-4 border-l-4" style={{ borderColor: colors.primary }}>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Universal Vitals</h3>
                        <div className="space-y-4">
                            <VibrationMonitor />
                            <TemperatureChart />
                            <AcousticMonitor />
                        </div>
                    </GlassCard>
                </div>

                {/* CENTER: Morphing Area (Turbine Specific) */}
                <div className="col-span-12 lg:col-span-6">
                    <motion.div
                        key={turbineType} // Triggers animation on switch
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-full"
                    >
                        <GlassCard className="h-full p-6 relative overflow-hidden">
                            {/* Background Watermark */}
                            <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                                {/* Ideally an SVG of the turbine type */}
                                <h1 className="text-9xl font-black">{turbineType[0].toUpperCase()}</h1>
                            </div>

                            <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-3">
                                <span style={{ color: colors.primary }}>///</span> {turbineType} Specific Diagnostics
                            </h2>

                            {/* KAPLAN SPECIFIC UI */}
                            {turbineType === 'kaplan' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
                                        <h3 className="text-cyan-400 font-bold mb-2">Blade-Gate Correlation</h3>
                                        <div className="h-32 flex items-center justify-center border-t border-r border-cyan-500/20">
                                            {/* Simulated Curve */}
                                            <svg width="100%" height="100%" viewBox="0 0 100 100">
                                                <path d="M 10,90 Q 50,50 90,10" fill="none" stroke={colors.primary} strokeWidth="2" />
                                                <circle cx="60" cy="40" r="3" fill="white" /> {/* Operating point */}
                                            </svg>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">Deviation: <span className="text-white">0.2°</span> (Optimal)</p>
                                    </div>
                                    <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
                                        <h3 className="text-cyan-400 font-bold mb-2">Draft Tube Vortex</h3>
                                        <div className="text-center py-4">
                                            <span className="text-3xl font-black text-white">0.05</span>
                                            <span className="text-xs block text-slate-500">Pressure Pulsation (bar)</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-emerald-500 w-[20%]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PELTON SPECIFIC UI */}
                            {turbineType === 'pelton' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-lg">
                                        <h3 className="text-fuchsia-400 font-bold mb-4">Multi-Nozzle Force Balance</h3>
                                        <div className="flex justify-between items-end h-32 px-4 pb-2">
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <div key={n} className="flex flex-col items-center gap-1 group">
                                                    <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{90 + Math.random() * 10}%</div>
                                                    <div
                                                        className="w-8 bg-fuchsia-500 rounded-t-sm"
                                                        style={{ height: `${80 + Math.random() * 20}%`, opacity: n === 3 ? 0.6 : 1 }}
                                                    ></div>
                                                    <span className="text-xs font-bold text-slate-300">N{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Anomaly Highlight */}
                                        <p className="text-xs text-amber-400 mt-2 font-bold text-center">⚠️ Nozzle 3: Possible Tip Erosion detected</p>
                                    </div>
                                </div>
                            )}

                            {/* FRANCIS SPECIFIC UI */}
                            {turbineType === 'francis' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                                        <h3 className="text-emerald-400 font-bold mb-2">Labyrinth Seal Leakage</h3>
                                        <div className="text-center py-2">
                                            <span className="text-2xl font-black text-white">12.4</span>
                                            <span className="text-xs block text-slate-500">L/min</span>
                                        </div>
                                        <p className="text-xs text-emerald-300 text-center mt-1">✓ Within limits</p>
                                    </div>
                                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                                        <h3 className="text-emerald-400 font-bold mb-2">Vortex Rope Monitor</h3>
                                        <div className="flex items-center justify-center h-20">
                                            <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin"></div>
                                        </div>
                                        <p className="text-center text-xs text-slate-400">Stable Core</p>
                                    </div>
                                </div>
                            )}

                        </GlassCard>
                    </motion.div>
                </div>

                {/* RIGHT: Decision Engine & Safety */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    {/* AI BRAIN */}
                    <GlassCard className="p-4 bg-purple-950/20 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                            <h3 className="text-sm font-bold text-purple-300 uppercase">Decision Engine</h3>
                        </div>
                        <p className="text-sm text-white font-medium mb-2">
                            "System optimal. No anomalous patterns detected in last 24h."
                        </p>
                        <div className="text-xs text-slate-400 mt-3 p-2 bg-black/30 rounded">
                            Last Logic Check: {new Date().toLocaleTimeString()}
                        </div>
                    </GlassCard>

                    {/* SAFETY GUARD */}
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-300 uppercase">Hardware Verify</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                            12mm-to-16mm Safety Guard Active. Simulation required for any hydraulic changes.
                        </p>
                        <button className="w-full py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded hover:bg-slate-700 transition">
                            SIMULATE CHANGE
                        </button>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
