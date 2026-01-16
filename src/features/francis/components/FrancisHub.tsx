import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SurgicalDigitalTwin from './SurgicalDigitalTwin';

/**
 * Technical Asset Definition for the Surgical Index
 */
const ASSETS = [
    { id: 'generator', label: 'Generator', detail: 'Primary AC Unit' },
    { id: 'miv', label: 'Main Inlet Valve', detail: 'Control & Isolation' },
    { id: 'spiral-case', label: 'Spiral Case', detail: 'Vortex Dynamics' },
    { id: 'runner', label: 'Francis Runner', detail: 'Core Energy Transfer' },
    { id: 'shaft-seal', label: 'Shaft Seal', detail: 'Hydraulic Containment' },
    { id: 'hpu', label: 'HPU System', detail: 'Actuator Control' },
    { id: 'draft-tube', label: 'Draft Tube', detail: 'Discharge Recuperation' },
    { id: 'manhole', label: 'Manhole', detail: 'Service Access Pt.' },
    { id: 'lubrication', label: 'Lubrication', detail: 'Bearing Protection' },
    { id: 'bypass', label: 'Bypass Valve', detail: 'Pressure Equilibrium' },
];

/**
 * FrancisHub - Professional Industrial Digital Twin Command Center
 */
export const FrancisHub: React.FC = () => {
    const [viewMode, setViewMode] = useState<'hall' | 'generator'>('hall');
    const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-screen w-full bg-[#0b1121] text-white overflow-hidden transition-colors duration-500">
            {/* Top Header Section */}
            <header className="px-6 py-4 border-b border-cyan-900/40 flex items-center justify-between bg-black/20 backdrop-blur-md z-50">
                <div className="flex items-center gap-6 font-mono tracking-tighter uppercase">
                    <div className="flex flex-col">
                        <span className="text-cyan-500 text-xs font-bold">Project Cerebro</span>
                        <span className="text-white text-lg leading-none">Francis Hub</span>
                    </div>
                    <div className="h-8 w-[1px] bg-cyan-900/50 mx-2" />
                    <div className="flex flex-col opacity-60">
                        <span className="text-[10px]">Current Schema</span>
                        <span className="text-sm">{viewMode === 'hall' ? 'Machine Hall NC-4.4' : 'Generator Detail (Surgical)'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-cyan-500/60">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span>Telemetry Link: Active</span>
                    </div>
                    <div className="opacity-30">|</div>
                    <div>Bihac / 50.8 MW</div>
                </div>
            </header>

            {/* Main Container - 30/40/30 Grid */}
            <div className="flex-1 grid grid-cols-[30%_40%_30%] overflow-hidden relative">

                {/* Left Panel: Surgical Index */}
                <aside className="border-r border-cyan-900/20 bg-black/10 flex flex-col overflow-hidden">
                    <div className="p-6 bg-cyan-950/20 border-b border-cyan-900/30">
                        <h2 className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-1">Surgical Index</h2>
                        <p className="text-slate-500 text-[9px] font-mono leading-tight">Inspect component metadata via hover selection.</p>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar scroll-p-2">
                        {ASSETS.map((asset) => (
                            <button
                                key={asset.id}
                                onMouseEnter={() => setActiveAssetId(asset.id)}
                                onMouseLeave={() => setActiveAssetId(null)}
                                onClick={() => asset.id === 'generator' && setViewMode('generator')}
                                className={`w-full text-left group transition-all duration-300 relative overflow-hidden rounded-lg border
                  ${activeAssetId === asset.id
                                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                        : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
                            >
                                <div className="p-4 relative z-10">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-mono text-xs font-bold uppercase transition-colors
                      ${activeAssetId === asset.id ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {asset.label}
                                        </span>
                                        {asset.id === 'generator' && (
                                            <span className="text-[8px] px-1.5 py-0.5 rounded border border-cyan-500/50 text-cyan-500 font-bold bg-cyan-950/20 animate-pulse">
                                                SOP PORTAL
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-[10px] font-mono leading-none transition-opacity
                    ${activeAssetId === asset.id ? 'text-cyan-500/60' : 'text-slate-600'}`}>
                                        {asset.detail}
                                    </div>
                                </div>
                                {/* Visual cursor/marker decoration */}
                                {activeAssetId === asset.id && (
                                    <motion.div
                                        layoutId="active-marker"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Center Panel: Surgical Digital Twin */}
                <main className="relative flex items-center justify-center bg-[#05080f] overflow-hidden group">
                    {/* Visual ambience glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />

                    <SurgicalDigitalTwin
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        activeAssetId={activeAssetId}
                    />

                    {/* Perspective View Label */}
                    <div className="absolute top-6 left-6 pointer-events-none border border-cyan-900/40 px-3 py-1 bg-black/40 rounded backdrop-blur-sm">
                        <span className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest">Orthographic Projection</span>
                    </div>
                </main>

                {/* Right Panel: Data & Telemetry Intelligence */}
                <aside className="border-l border-cyan-900/20 bg-black/10 flex flex-col p-6 overflow-y-auto overflow-x-hidden">
                    {viewMode === 'generator' ? (
                        <div className="space-y-8 h-full animate-in fade-in slide-in-from-right duration-500">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-cyan-500/20 border border-cyan-500/50">
                                        <span className="text-cyan-500 font-bold">AC</span>
                                    </div>
                                    <h3 className="text-white font-mono text-sm font-bold uppercase">Generator Integrity</h3>
                                </div>
                                <button
                                    onClick={() => setViewMode('hall')}
                                    className="w-full py-4 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <span>&larr;</span>
                                    <span>Exit Detail View</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border border-cyan-500/20 rounded-xl bg-cyan-950/20 font-mono">
                                    <div className="text-cyan-500/40 text-[9px] uppercase mb-2">Diagnostic Log</div>
                                    <div className="text-[10px] text-cyan-500/80 leading-relaxed italic">
                                        "Structural analysis pending for Generator NC-2. Vibration levels nominal. Stator temperature threshold monitored..."
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-16 border border-slate-800 rounded bg-black/40 animate-pulse flex items-center justify-center text-[9px] text-slate-700 font-mono uppercase">
                                            Snsr_{i}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full animate-[ping_3s_linear_infinite]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full blur-xl" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-cyan-400 font-mono text-[11px] uppercase font-bold tracking-widest">Analytical Ready</p>
                                <p className="text-slate-500 font-mono text-[9px] leading-relaxed max-w-[200px]">
                                    Awaiting component selection for depth-sensing forensic scan.
                                </p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Logic Integrity Footer */}
            <footer className="px-6 py-2 border-t border-cyan-900/30 flex items-center justify-between bg-black/40 text-[9px] font-mono opacity-50 uppercase tracking-tighter">
                <span>Logic Integrity: [OPTIMAL]</span>
                <div className="flex gap-4">
                    <span>Lat: 44.81&deg; N</span>
                    <span>Lng: 15.87&deg; E</span>
                    <span>Alt: 231m MSL</span>
                </div>
            </footer>
        </div>
    );
};

export default FrancisHub;
