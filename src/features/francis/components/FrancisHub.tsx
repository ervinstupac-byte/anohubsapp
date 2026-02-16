import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SurgicalDigitalTwin from './SurgicalDigitalTwin';
import { useAssetContext } from '../../../contexts/AssetContext.tsx';
import { useTelemetryStore } from '../../telemetry/store/useTelemetryStore';
import { Shield, LayoutGrid, FileText, CheckCircle } from 'lucide-react';
import { EVENTS } from '../../../lib/events';

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
    { id: 'legacy-intelligence', label: 'Legacy Intelligence', detail: 'SOP Archive' },
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

        window.addEventListener(EVENTS.TWIN_ASSET_CLICK, handler as EventListener);
        return () => window.removeEventListener(EVENTS.TWIN_ASSET_CLICK, handler as EventListener);
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
        <div className="flex flex-col h-screen w-full bg-scada-bg text-scada-text overflow-hidden transition-colors duration-500">
            {/* Top Header Section */}
            <header className="px-6 py-4 border-b border-scada-border flex items-center justify-between bg-scada-panel z-50">
                <div className="flex items-center gap-6 font-mono tracking-tighter uppercase">
                    <div className="flex flex-col">
                        <span className="text-status-info text-xs font-bold">Project Cerebro</span>
                        <span className="text-scada-text text-lg leading-none">Francis Hub</span>
                    </div>
                    <div className="h-8 w-[1px] bg-scada-border mx-2" />
                    <div className="flex flex-col opacity-60">
                        <span className="text-[10px]">Current Schema</span>
                        <span className="text-sm">{viewMode === 'hall' ? 'Machine Hall NC-4.4' : 'Generator Detail (Surgical)'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-scada-muted">
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
                        className={`px-2 py-1 rounded-sm transition-all ${xrayEnabled ? 'bg-status-info text-scada-bg' : 'bg-scada-bg border border-scada-border text-status-info'}`}
                    >
                        X‑Ray
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-info" />
                        <span>Telemetry Link: Active</span>
                    </div>

                    <div className="opacity-30">|</div>

                    {/* Commander Mode Toggle (NC-8.0) */}
                    <button
                        onClick={toggleCommanderMode}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${isCommanderMode ? 'border-status-warning bg-status-warning/20 text-status-warning' : 'border-scada-border text-scada-muted hover:border-scada-text'}`}
                    >
                        <Shield className={`w-3 h-3 ${isCommanderMode ? 'fill-current' : ''}`} />
                        <span className="font-bold tracking-widest">{isCommanderMode ? 'COMMANDER ACTIVE // NC-9.0' : 'COMMANDER MODE // NC-9.0'}</span>
                    </button>
                    <div className="opacity-30">|</div>

                    <div>{selectedAsset?.name || 'Bihac'} / {selectedAsset?.specs?.power_output || '50.8'} MW</div>
                </div>
            </header>

            {/* Main Container - 25/50/25 Grid (Adjusted for Commander Mode) */}
            <div className={`flex-1 grid ${isCommanderMode ? 'grid-cols-1' : 'grid-cols-[20%_60%_20%]'} overflow-hidden relative transition-all duration-700`}>

                {/* Left Panel: Surgical Index (Hidden in Commander Mode) */}
                {!isCommanderMode && (
                    <aside className="border-r border-scada-border bg-scada-panel flex flex-col overflow-hidden">
                        <div className="p-6 bg-scada-bg border-b border-scada-border">
                            <h2 className="text-status-info font-mono text-xs uppercase tracking-[0.2em] mb-1">Surgical Index</h2>
                            <p className="text-scada-muted text-[9px] font-mono leading-tight">Inspect component metadata via hover selection.</p>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar scroll-p-2">
                            {ASSETS.filter(a => !(a as any).xrayOnly || xrayEnabled).map((asset) => (
                                <button
                                    key={asset.id}
                                    onMouseEnter={() => setActiveAssetId(asset.id)}
                                    onMouseLeave={() => setActiveAssetId(null)}
                                    onClick={() => {
                                        setActiveAssetId(asset.id);
                                        if (asset.id === 'generator') setViewMode('generator');
                                        if (asset.id === 'legacy-intelligence') {
                                            setBigViewAsset('legacy-intelligence');
                                            setBigViewOpen(true);
                                        }
                                    }}
                                    className={`w-full text-left group transition-all duration-300 relative overflow-hidden rounded-sm border
                      ${activeAssetId === asset.id
                                            ? 'bg-status-info/10 border-status-info/50 shadow-scada-card'
                                            : 'bg-transparent border-transparent hover:bg-scada-bg'}`}
                                >
                                    <div className="p-4 relative z-10">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-mono text-xs font-bold uppercase transition-colors
                          ${activeAssetId === asset.id ? 'text-status-info' : 'text-scada-muted group-hover:text-scada-text'}`}>
                                                {asset.label}
                                            </span>
                                            {asset.id === 'generator' && (
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-sm border border-status-info/50 text-status-info font-bold bg-status-info/10">
                                                    SOP PORTAL
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-[10px] font-mono leading-none transition-opacity
                        ${activeAssetId === asset.id ? 'text-status-info/60' : 'text-scada-muted'}`}>
                                            {asset.detail}
                                        </div>
                                    </div>
                                    {/* Visual cursor/marker decoration */}
                                    {activeAssetId === asset.id && (
                                        <motion.div
                                            layoutId="active-marker"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-status-info"
                                        />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </aside>
                )}

                {/* Center Panel: Surgical Digital Twin */}
                <main className="relative flex items-center justify-center h-full bg-scada-bg overflow-hidden group">
                    {/* Visual ambience glow */}
                    <div className="absolute inset-0 bg-scada-bg pointer-events-none" />

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
                            <div className="absolute top-8 right-8 flex flex-col gap-4 items-end">
                                <div className="flex items-center gap-3 px-4 py-2 bg-status-info/10 border border-status-info/30 rounded-sm">
                                    <CheckCircle className="w-4 h-4 text-status-info" />
                                    <span className="text-xs font-black text-scada-text uppercase tracking-widest">50 IEC 60041 Files </span>
                                </div>
                                <button className="flex items-center gap-3 px-6 py-3 bg-status-warning text-scada-bg rounded-sm font-black text-xs uppercase tracking-[0.2em] shadow-scada-card hover:bg-status-warning/90 transition-transform active:scale-95">
                                    <FileText className="w-4 h-4" />
                                    Generate Forensic PDF
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-8 p-4 bg-scada-panel border border-scada-border rounded-sm max-w-xs">
                                <div className="text-[10px] font-mono text-status-warning uppercase mb-2">Predictive Insight</div>
                                <div className="text-[11px] text-scada-muted italic leading-relaxed">
                                    "Linear regression suggests 100% stable structural integrity for the current operational window. No breaches predicted within 72h."
                                </div>
                            </div>
                        </>
                    )}

                    {/* Perspective View Label */}
                    <div className="absolute top-6 left-6 pointer-events-none border border-scada-border px-3 py-1 bg-scada-panel rounded-sm">
                        <span className="text-status-info font-mono text-[10px] uppercase tracking-widest">Orthographic Projection</span>
                    </div>
                </main>

                {/* Right Panel: Data & Telemetry Intelligence (Hidden in Commander Mode) */}
                {!isCommanderMode && (
                    <aside className="border-l border-scada-border bg-scada-panel flex flex-col p-6 overflow-y-auto overflow-x-hidden">
                        {viewMode === 'generator' ? (
                            <div className="space-y-8 h-full animate-in fade-in slide-in-from-right duration-500">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-sm bg-status-info/20 border border-status-info/50">
                                            <span className="text-status-info font-bold">AC</span>
                                        </div>
                                        <h3 className="text-scada-text font-mono text-sm font-bold uppercase">Generator Integrity</h3>
                                    </div>
                                    <button
                                        onClick={() => setViewMode('hall')}
                                        className="w-full py-4 border-2 border-status-info/50 text-status-info hover:bg-status-info hover:text-scada-bg transition-all font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <span>&larr;</span>
                                        <span>Exit Detail View</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 border border-status-info/20 rounded-sm bg-status-info/10 font-mono">
                                        <div className="text-status-info/40 text-[9px] uppercase mb-2">Diagnostic Log</div>
                                        <div className="text-[10px] text-status-info/80 leading-relaxed italic">
                                            "Structural analysis pending for Generator NC-2. Vibration levels nominal. Stator temperature threshold monitored..."
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-16 border border-scada-border rounded-sm bg-scada-bg flex items-center justify-center text-[9px] text-scada-muted font-mono uppercase">
                                                Snsr_{i}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
                                <div className="relative">
                                    <div className="w-16 h-16 border-2 border-status-info/20 rounded-full" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 bg-status-info/20 rounded-full" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-status-info font-mono text-[9px] uppercase font-bold tracking-widest">Ready</p>
                                </div>
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {/* Big View Modal - displays an enlarged twin for selected asset OR Legacy SOP iframe */}
            {bigViewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-scada-bg">
                    <div className="relative w-[95%] h-[90%] bg-scada-bg border border-scada-border rounded-sm shadow-scada-card overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b border-scada-border bg-scada-panel">
                            <div className="text-status-info font-mono text-xs uppercase tracking-[0.2em] font-bold">
                                {bigViewAsset === 'legacy-intelligence' ? 'LEGACY INTELLIGENCE // FRANCIS SOP DATABASE' : 'SURGICAL COMPONENT INSPECTION'}
                            </div>
                            <button
                                onClick={() => { setBigViewOpen(false); setBigViewAsset(null); }}
                                className="text-scada-muted hover:text-scada-text px-3 py-1 rounded-sm bg-scada-bg hover:bg-scada-border"
                                aria-label="Close Big View"
                            >
                                CLOSE
                            </button>
                        </div>

                        <div className="flex-1 w-full h-full relative">
                            {bigViewAsset === 'legacy-intelligence' ? (
                                <iframe
                                    src="/AnoHub_site/Turbine_Friend/Francis_H/index.html"
                                    className="w-full h-full border-none bg-white"
                                    title="Francis Legacy SOPs"
                                />
                            ) : (
                                <SurgicalDigitalTwin
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                    activeAssetId={bigViewAsset}
                                    xrayEnabled={xrayEnabled}
                                    setXrayEnabled={setXrayEnabled}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Logic Integrity Footer */}
            <footer className="px-6 py-2 border-t border-scada-border flex items-center justify-between bg-scada-panel text-[9px] font-mono opacity-50 uppercase tracking-tighter">
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
