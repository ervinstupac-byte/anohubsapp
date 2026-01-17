import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SurgicalDigitalTwin from './SurgicalDigitalTwin';
import { useAssetContext } from '../../../contexts/AssetContext.tsx';
import { useTelemetryStore } from '../../telemetry/store/useTelemetryStore';
import { Shield, LayoutGrid, FileText, CheckCircle } from 'lucide-react';

/**
 * Technical Asset Definition for the Surgical Index
 */
const ASSETS = [
    { id: 'electrical-cubicles', label: 'Electrical Cubicles', detail: 'Power Distribution' },
    { id: 'hpu', label: 'HPU System', detail: 'Actuator Control' },
    { id: 'lubrication', label: 'Lubrication', detail: 'Bearing Protection' },
    { id: 'penstock', label: 'Penstock', detail: 'Water Conveyance' },
    { id: 'manhole', label: 'Manhole', detail: 'Service Access Pt.' },
    { id: 'bypass', label: 'Bypass Valve', detail: 'Pressure Equilibrium' },
    { id: 'miv', label: 'Main Inlet Valve', detail: 'Control & Isolation' },
    { id: 'draft-tube', label: 'Draft Tube', detail: 'Discharge Recuperation' },
    { id: 'dft-manhole', label: 'Draft Tube Manhole', detail: 'Access Point' },
    { id: 'seal', label: 'Shaft Seal', detail: 'Hydraulic Containment', xrayOnly: true },
    { id: 'spiral-case', label: 'Spiral Case', detail: 'Vortex Dynamics' },
    { id: 'spiral-manhole', label: 'Spiral Manhole', detail: 'Inspection Hatch' },
    { id: 'relief-pipes', label: 'Relief Pipes', detail: 'Pressure Relief' },
    { id: 'runner', label: 'Francis Runner', detail: 'Core Energy Transfer', xrayOnly: true },
    { id: 'generator', label: 'Generator', detail: 'Primary AC Unit' },
];

/**
 * FrancisHub - Professional Industrial Digital Twin Command Center
 */
export const FrancisHub: React.FC = () => {
    const [viewMode, setViewMode] = useState<'hall' | 'generator'>('hall');
    const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
    const [bigViewOpen, setBigViewOpen] = useState(false);
    const [bigViewAsset, setBigViewAsset] = useState<string | null>(null);
    const [xrayEnabled, setXrayEnabled] = useState(false);
    const { selectedAsset } = useAssetContext();
    const { isCommanderMode, toggleCommanderMode } = useTelemetryStore();

    // Listen for clicks inside the injected SVG (dispatched by SurgicalDigitalTwin)
    useEffect(() => {
        const handler = (e: Event) => {
            try {
                // @ts-ignore - CustomEvent typing
                const id = (e as CustomEvent).detail as string;
                if (!id) return;
                setActiveAssetId(id);
                // Open the big view when a marker is clicked inside the SVG
                setBigViewAsset(id);
                setBigViewOpen(true);
                if (id === 'generator') setViewMode('generator');
            } catch (err) {
                // ignore
            }
        };

        window.addEventListener('twin:asset-click', handler as EventListener);
        return () => window.removeEventListener('twin:asset-click', handler as EventListener);
    }, []);

    // when X‑Ray is turned off, ensure any xray-only active asset is cleared
    useEffect(() => {
        if (!xrayEnabled && activeAssetId) {
            const asset = ASSETS.find(a => a.id === activeAssetId);
            if (asset && (asset as any).xrayOnly) {
                setActiveAssetId(null);
            }
        }
    }, [xrayEnabled, activeAssetId]);

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
                    <button
                        onClick={() => {
                            setXrayEnabled(prev => {
                                const next = !prev;
                                if (!next && activeAssetId) {
                                    const asset = ASSETS.find(a => a.id === activeAssetId);
                                    if (asset && (asset as any).xrayOnly) setActiveAssetId(null);
                                }
                                return next;
                            });
                        }}
                        className={`px-2 py-1 rounded transition-all ${xrayEnabled ? 'bg-cyan-500 text-black' : 'bg-black/20 text-cyan-300'}`}
                    >
                        X‑Ray
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span>Telemetry Link: Active</span>
                    </div>

                    <div className="opacity-30">|</div>

                    {/* Commander Mode Toggle (NC-8.0) */}
                    <button
                        onClick={toggleCommanderMode}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${isCommanderMode ? 'border-h-gold bg-h-gold/20 text-h-gold shadow-[0_0_15px_rgba(255,184,0,0.2)]' : 'border-white/10 text-slate-500 hover:border-white/20'}`}
                    >
                        <Shield className={`w-3 h-3 ${isCommanderMode ? 'fill-current' : ''}`} />
                        <span className="font-bold tracking-widest">{isCommanderMode ? 'COMMANDER ACTIVE' : 'COMMANDER MODE'}</span>
                    </button>

                    <div className="opacity-30">|</div>

                    <div>{selectedAsset?.name || 'Bihac'} / {selectedAsset?.specs?.power_output || '50.8'} MW</div>
                </div>
            </header>

            {/* Main Container - 25/50/25 Grid (Adjusted for Commander Mode) */}
            <div className={`flex-1 grid ${isCommanderMode ? 'grid-cols-1' : 'grid-cols-[20%_60%_20%]'} overflow-hidden relative transition-all duration-700`}>

                {/* Left Panel: Surgical Index (Hidden in Commander Mode) */}
                {!isCommanderMode && (
                    <aside className="border-r border-cyan-900/20 bg-black/10 flex flex-col overflow-hidden">
                        <div className="p-6 bg-cyan-950/20 border-b border-cyan-900/30">
                            <h2 className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-1">Surgical Index</h2>
                            <p className="text-slate-500 text-[9px] font-mono leading-tight">Inspect component metadata via hover selection.</p>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar scroll-p-2">
                            {ASSETS.filter(a => !(a as any).xrayOnly || xrayEnabled).map((asset) => (
                                <button
                                    key={asset.id}
                                    onMouseEnter={() => setActiveAssetId(asset.id)}
                                    onMouseLeave={() => setActiveAssetId(null)}
                                    onClick={() => { setActiveAssetId(asset.id); if (asset.id === 'generator') setViewMode('generator'); }}
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
                )}

                {/* Center Panel: Surgical Digital Twin */}
                <main className="relative flex items-center justify-center h-full bg-[#05080f] overflow-hidden group">
                    {/* Visual ambience glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />

                    <SurgicalDigitalTwin
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        activeAssetId={activeAssetId}
                        xrayEnabled={xrayEnabled}
                        setXrayEnabled={setXrayEnabled}
                    />

                    {/* Commander Mode Overlay (NC-8.0) */}
                    {isCommanderMode && (
                        <>
                            <div className="absolute top-8 right-8 flex flex-col gap-4 items-end animate-in fade-in slide-in-from-top duration-700">
                                <div className="flex items-center gap-3 px-4 py-2 bg-h-cyan/10 border border-h-cyan/30 rounded-lg backdrop-blur-md">
                                    <CheckCircle className="w-4 h-4 text-h-cyan" />
                                    <span className="text-xs font-black text-white uppercase tracking-widest">854 Files Verified</span>
                                </div>
                                <button className="flex items-center gap-3 px-6 py-3 bg-h-gold text-black rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,184,0,0.3)] hover:scale-105 transition-transform active:scale-95">
                                    <FileText className="w-4 h-4" />
                                    Generate Forensic PDF
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-8 p-4 bg-black/40 border border-white/5 rounded-xl backdrop-blur-md max-w-xs animate-in fade-in slide-in-from-left duration-700">
                                <div className="text-[10px] font-mono text-h-gold uppercase mb-2">Predictive Insight</div>
                                <div className="text-[11px] text-slate-300 italic leading-relaxed">
                                    "Linear regression suggests 100% stable structural integrity for the current operational window. No breaches predicted within 72h."
                                </div>
                            </div>
                        </>
                    )}

                    {/* Perspective View Label */}
                    <div className="absolute top-6 left-6 pointer-events-none border border-cyan-900/40 px-3 py-1 bg-black/40 rounded backdrop-blur-sm">
                        <span className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest">Orthographic Projection</span>
                    </div>
                </main>

                {/* Right Panel: Data & Telemetry Intelligence (Hidden in Commander Mode) */}
                {!isCommanderMode && (
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
                                    <p className="text-cyan-400 font-mono text-[9px] uppercase font-bold tracking-widest">Ready</p>
                                </div>
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {/* Big View Modal - displays an enlarged twin for selected asset */}
            {bigViewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative w-[90%] max-w-[1200px] h-[90%] bg-[#070814] border border-cyan-900/40 rounded-lg p-4 shadow-xl">
                        <button
                            onClick={() => { setBigViewOpen(false); setBigViewAsset(null); }}
                            className="absolute top-3 right-3 text-slate-300 bg-black/40 hover:bg-black/60 p-2 rounded"
                            aria-label="Close Big View"
                        >
                            ×
                        </button>

                        <div className="w-full h-full">
                            <SurgicalDigitalTwin
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                activeAssetId={bigViewAsset}
                                xrayEnabled={xrayEnabled}
                                setXrayEnabled={setXrayEnabled}
                            />
                        </div>
                    </div>
                </div>
            )}

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
