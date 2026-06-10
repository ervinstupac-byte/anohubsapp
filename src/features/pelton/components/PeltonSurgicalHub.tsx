import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PeltonSurgicalTwin from './PeltonSurgicalTwin';
import { useAssetContext } from '../../../contexts/AssetContext.tsx';
import { useTelemetryStore } from '../../telemetry/store/useTelemetryStore';
import { Shield, LayoutGrid, FileText, CheckCircle, ChevronRight, Settings, Activity } from 'lucide-react';
import { TRIGGER_FORENSIC_EXPORT } from '../../../components/diagnostics/Sidebar.tsx';
import { useNavigate } from 'react-router-dom';

const VERTICAL_ASSETS = [
    { id: 'injector-1', label: 'Injector 1', detail: 'Primary Jet Control' },
    { id: 'injector-2', label: 'Injector 2', detail: 'Secondary Jet Control' },
    { id: 'generator', label: 'Generator', detail: 'Main AC Generator', image: '/assets/pic.s_Background/peltonVertikal_GeneratorsaRotorom.png' },
    { id: 'housing', label: 'Housing', detail: 'Deflector Casing' },
];

const HORIZONTAL_ASSETS = [
    { id: 'injector-main', label: 'Main Injector', detail: 'Jet Control' },
    { id: 'runner', label: 'Runner Assembly', detail: 'Pelton Wheel' },
    { id: 'generator', label: 'Generator', detail: 'Main AC Generator', image: '/assets/pic.s_Background/peltonHorizontal_generatorside.png' },
];

export const PeltonSurgicalHub: React.FC = () => {
    const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
    const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
    const [bigViewOpen, setBigViewOpen] = useState(false);
    const [bigViewAsset, setBigViewAsset] = useState<string | null>(null);
    const [xrayEnabled, setXrayEnabled] = useState(false);
    const { selectedAsset } = useAssetContext();
    const { isCommanderMode } = useTelemetryStore();
    const navigate = useNavigate();

    const currentAssets = viewMode === 'vertical' ? VERTICAL_ASSETS : HORIZONTAL_ASSETS;

    // Listen for marker clicks
    useEffect(() => {
        const handler = (e: Event) => {
            try {
                // @ts-ignore
                const id = (e as CustomEvent).detail as string;
                if (!id) return;
                setActiveAssetId(id);
                setBigViewAsset(id);
                setBigViewOpen(true);
            } catch (err) {
                // ignore
            }
        };

        window.addEventListener('twin:asset-click', handler as EventListener);
        return () => window.removeEventListener('twin:asset-click', handler as EventListener);
    }, []);

    // Deselect if switching view modes
    useEffect(() => {
        setActiveAssetId(null);
        setBigViewOpen(false);
    }, [viewMode]);

    return (
        <div className="flex flex-col h-screen w-full bg-[#0b1121] text-white overflow-hidden transition-colors duration-500">
            {/* Top Header Section */}
            <header className="px-6 py-4 border-b border-cyan-900/40 flex items-center justify-between bg-black/20 backdrop-blur-md z-50">
                <div className="flex items-center gap-6 font-mono tracking-tighter uppercase">
                    <div className="flex flex-col">
                        <span className="text-cyan-500 text-xs font-bold">Project Cerebro</span>
                        <span className="text-white text-lg leading-none">Pelton Hub</span>
                    </div>
                    <div className="h-8 w-[1px] bg-cyan-900/50 mx-2" />
                    <div className="flex flex-col opacity-60">
                        <span className="text-[10px]">Current Schema</span>
                        <span className="text-sm">{viewMode === 'vertical' ? 'Pelton Vertical Configuration' : 'Pelton Horizontal Configuration'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-cyan-500/60">
                    <button
                        onClick={() => setXrayEnabled(!xrayEnabled)}
                        className={`flex items-center gap-2 transition-colors ${xrayEnabled ? 'text-cyan-400' : 'hover:text-cyan-400'}`}
                    >
                        <Shield className={`w-3.5 h-3.5 ${xrayEnabled ? 'fill-current' : ''}`} />
                        <span>X‑Ray Modality</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCommanderMode ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
                        <span>Telemetry Link: Active</span>
                    </div>

                    <div className="opacity-30">|</div>

                    <button
                        className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${isCommanderMode ? 'border-h-gold bg-h-gold/20 text-h-gold shadow-[0_0_15px_rgba(255,184,0,0.2)]' : 'border-white/10 text-slate-500 hover:border-white/20'}`}
                    >
                        <Shield className={`w-3 h-3 ${isCommanderMode ? 'fill-current' : ''}`} />
                        <span className="font-bold tracking-widest">{isCommanderMode ? 'COMMANDER ACTIVE // NC-9.0' : 'COMMANDER MODE // NC-9.0'}</span>
                    </button>

                    <div className="opacity-30">|</div>

                    <button 
                        onClick={() => navigate('/turbines/pelton')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:border-cyan-500/50"
                    >
                        Return to Hub <ChevronRight className="w-3 h-3" />
                    </button>

                </div>
            </header>

            {/* Main Content Body */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Visualizer / Twin Area (Center) */}
                <div className="flex-1 relative bg-black/40">
                    <PeltonSurgicalTwin 
                        viewMode={viewMode}
                        activeAssetId={activeAssetId}
                        xrayEnabled={xrayEnabled}
                        setXrayEnabled={setXrayEnabled}
                    />

                    {/* View Switcher Overlay in the visualizer area */}
                    <div className="absolute top-4 left-4 flex gap-2 z-40 bg-slate-900/50 p-1.5 rounded backdrop-blur border border-white/5 shadow-2xl">
                        <button
                            onClick={() => setViewMode('vertical')}
                            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${viewMode === 'vertical' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
                        >
                            Vertical Twin
                        </button>
                        <button
                            onClick={() => setViewMode('horizontal')}
                            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${viewMode === 'horizontal' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
                        >
                            Horizontal Twin
                        </button>
                    </div>

                    {/* Forensic Actions */}
                    <div className="absolute bottom-6 left-6 flex gap-3 z-40">
                        <button 
                            className="bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-300 hover:text-white rounded backdrop-blur transition-all"
                            onClick={() => window.dispatchEvent(new Event(TRIGGER_FORENSIC_EXPORT))}
                        >
                            <FileText className="w-4 h-4 text-cyan-500" />
                            Forensic Export
                        </button>
                        <button 
                            className="bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-300 hover:text-white rounded backdrop-blur transition-all"
                        >
                            <Settings className="w-4 h-4 text-cyan-500" />
                            Diagnostics
                        </button>
                    </div>
                </div>

                {/* Right Sidebar - Surgical Index */}
                <div className="w-[380px] bg-[#070b15]/95 border-l border-white/5 backdrop-blur-xl flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                    <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center gap-3">
                        <LayoutGrid className="w-5 h-5 text-cyan-500 opacity-80" />
                        <h2 className="font-mono text-sm font-bold tracking-widest uppercase text-slate-200">
                            Surgical Index
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        {currentAssets.map(asset => {
                            const isActive = activeAssetId === asset.id;
                            return (
                                <button
                                    key={asset.id}
                                    onClick={() => setActiveAssetId(asset.id)}
                                    className={`w-full text-left p-3 rounded border transition-all relative overflow-hidden group ${
                                        isActive 
                                            ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                                            : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/20'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div layoutId="activeSurgicalLine" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                                    )}
                                    <div className={`flex items-center justify-between font-mono ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                                        <span className="text-xs font-bold uppercase tracking-wider">{asset.label}</span>
                                        {isActive && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-1 group-hover:text-slate-400 transition-colors">
                                        {asset.detail}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Modal for detailed view */}
            <AnimatePresence>
                {bigViewOpen && bigViewAsset && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
                        onClick={() => setBigViewOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0b1121] border border-cyan-900/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                                <h3 className="font-mono font-bold text-lg text-cyan-400 uppercase tracking-widest">
                                    {currentAssets.find(a => a.id === bigViewAsset)?.label || bigViewAsset}
                                </h3>
                                <button onClick={() => setBigViewOpen(false)} className="text-slate-400 hover:text-white font-mono text-xs uppercase px-3 py-1 border border-white/10 rounded">
                                    Close [ESC]
                                </button>
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-4 bg-slate-900/50 rounded border border-white/5 border-l-4 border-l-cyan-500">
                                            <div className="text-xs font-mono text-slate-500 mb-1 uppercase tracking-widest">Diagnostic Status</div>
                                            <div className="text-emerald-400 font-bold font-mono tracking-widest text-lg">NOMINAL</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Description</div>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                Active diagnostic stream for {bigViewAsset}. All parameters are within the defined operational thresholds. Real-time monitoring indicates no anomalous vibration or temperature spikes.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/30 rounded border border-white/5 flex items-center justify-center p-4">
                                        {(currentAssets.find(a => a.id === bigViewAsset) as any)?.image ? (
                                            <div className="relative inline-block text-center">
                                                <img 
                                                    src={(currentAssets.find(a => a.id === bigViewAsset) as any).image} 
                                                    alt={bigViewAsset} 
                                                    className="max-w-full max-h-[60vh] object-contain rounded drop-shadow-2xl mx-auto"
                                                />
                                                {bigViewAsset === 'generator' && (
                                                    <>
                                                        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400 backdrop-blur-md pointer-events-none whitespace-nowrap">
                                                            Generator
                                                        </div>
                                                        <div className={`absolute ${viewMode === 'horizontal' ? 'top-[20%] left-[15%]' : 'bottom-[15%] left-1/2 -translate-x-1/2'} bg-slate-800/95 text-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-500 backdrop-blur-md pointer-events-none whitespace-nowrap`}>
                                                            Turbine
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Live telemetry feed pending</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PeltonSurgicalHub;
