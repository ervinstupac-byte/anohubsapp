import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PeltonJetVisualizer } from '../components/PeltonJetVisualizer';
import { PeltonInjectorAlignmentLab } from '../components/PeltonInjectorAlignmentLab';
import { PeltonNeedleValveLab } from '../components/PeltonNeedleValveLab';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { Settings, Play, ShieldAlert, Award, FileText, ChevronRight } from 'lucide-react';

export const PeltonHub: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'visualizer' | 'alignment' | 'needle'>('visualizer');

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-5 rounded border border-slate-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                            Agregat: Pelton Multi-Jet
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            RPM: 600 | RATED: 15.0 MW
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">
                        Pelton Turbine Hub
                    </h1>
                    <p className="text-xs text-slate-400 font-sans">
                        Sinhronizacija mlaznica, proračun aksijalnih i radijalnih sila i akustičko testiranje.
                    </p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                    <button 
                        onClick={() => navigate('/pelton/vertical')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded text-xs font-bold uppercase tracking-widest font-mono transition-all flex items-center gap-2"
                    >
                        Pelton Vertical <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => navigate('/pelton/horizontal')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded text-xs font-bold uppercase tracking-widest font-mono transition-all flex items-center gap-2"
                    >
                        Pelton Horizontal <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('visualizer')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
                            activeTab === 'visualizer' ? 'bg-slate-700 text-slate-50 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-50 hover:border-slate-600'
                        }`}
                    >
                        Mlazni balans
                    </button>
                    <button 
                        onClick={() => setActiveTab('alignment')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
                            activeTab === 'alignment' ? 'bg-slate-700 text-slate-50 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-50 hover:border-slate-600'
                        }`}
                    >
                        Poravnanje (Alignment)
                    </button>
                    <button 
                        onClick={() => setActiveTab('needle')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
                            activeTab === 'needle' ? 'bg-slate-700 text-slate-50 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-50 hover:border-slate-600'
                        }`}
                    >
                        Needle Valve Lab
                    </button>
                </div>
            </div>

            {/* Quick Diagnostic Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 1</div>
                    <div className="text-sm font-semibold text-slate-100">75.2% Otvorena</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 2</div>
                    <div className="text-sm font-semibold text-slate-100">75.1% Otvorena</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 3 (Erozija)</div>
                    <div className="text-sm font-semibold text-amber-400">71.4% Prigušena</div>
                    <div className="text-[10px] text-amber-400 font-mono">ODSTUPANJE 4.8%</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 4</div>
                    <div className="text-sm font-semibold text-slate-100">75.0% Otvorena</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
            </div>

            {/* Main Lab Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* Left Area (Interactive Lab Module) - 2 cols on xl */}
                <div className="xl:col-span-2 space-y-4">
                    {activeTab === 'visualizer' && (
                        <div className="p-1 rounded bg-slate-900/30 border border-slate-700">
                            <PeltonJetVisualizer 
                                sessionId="pelton-hub-session" 
                                onComplete={() => console.log('Jet Sync test complete')} 
                            />
                        </div>
                    )}

                    {activeTab === 'alignment' && (
                        <div className="p-1 rounded bg-slate-900/30 border border-slate-700">
                            <PeltonInjectorAlignmentLab />
                        </div>
                    )}

                    {activeTab === 'needle' && (
                        <div className="p-1 rounded bg-slate-900/30 border border-slate-700">
                            <PeltonNeedleValveLab />
                        </div>
                    )}
                </div>

                {/* Right Area (SOPs and Technical Details) - 1 col */}
                <div className="space-y-4">
                    {/* SOP Manuals */}
                    <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Relevantni SOP priručnici
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="text-xs font-semibold text-slate-100">PELTON NOZZLE SEQUENCING SOP</div>
                                <p className="text-[10px] text-slate-400">Pravila sekvencijalnog zatvaranja mlaznica radi smanjenja hidrauličkog udara.</p>
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="text-xs font-semibold text-slate-100">NEEDLE DEFLECTOR COORDINATION</div>
                                <p className="text-[10px] text-slate-400">Kalibracija deflektora mlaza u prelaznim režimima rasterećenja generatora.</p>
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="text-xs font-semibold text-slate-100">JET ANGLE LASER AUDIT</div>
                                <p className="text-[10px] text-slate-400">Metodologija preciznog laserskog poravnanja osa mlaznice i lopatica rotora.</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Safety checklist */}
                    <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            Sigurnosne granice
                        </h3>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between border-b border-slate-700 pb-1.5">
                                <span className="text-slate-400">Max. debalans sila:</span>
                                <span className="text-red-400 font-bold">15.0%</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-1.5">
                                <span className="text-slate-400">Dozvoljena temp. ležaja:</span>
                                <span className="text-slate-100">65.0°C</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Aksijalni pomak limit:</span>
                                <span className="text-amber-400">0.05 mm</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
