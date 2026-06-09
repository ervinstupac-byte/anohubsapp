import React, { useState } from 'react';
import { PeltonJetVisualizer } from '../components/PeltonJetVisualizer';
import { PeltonInjectorAlignmentLab } from '../components/PeltonInjectorAlignmentLab';
import { PeltonNeedleValveLab } from '../components/PeltonNeedleValveLab';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { Settings, Play, ShieldAlert, Award, FileText } from 'lucide-react';

export const PeltonHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'visualizer' | 'alignment' | 'needle'>('visualizer');

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-5 rounded-2xl border border-white/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                            Agregat: Pelton Multi-Jet
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            RPM: 600 | RATED: 15.0 MW
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                        💧 Pelton Turbine Hub
                    </h1>
                    <p className="text-xs text-slate-400 font-sans">
                        Sinhronizacija mlaznica, proračun aksijalnih i radijalnih sila i akustičko testiranje.
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('visualizer')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                            activeTab === 'visualizer' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        Mlazni balans
                    </button>
                    <button 
                        onClick={() => setActiveTab('alignment')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                            activeTab === 'alignment' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        Poravnanje (Alignment)
                    </button>
                    <button 
                        onClick={() => setActiveTab('needle')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                            activeTab === 'needle' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        Needle Valve Lab
                    </button>
                </div>
            </div>

            {/* Quick Diagnostic Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-4 border-white/5 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 1</div>
                    <div className="text-sm font-bold text-white">75.2% Otvorena</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-white/5 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 2</div>
                    <div className="text-sm font-bold text-white">75.1% Otvorena</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-white/5 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 3 (Erozija)</div>
                    <div className="text-sm font-bold text-amber-400">71.4% Prigušena</div>
                    <div className="text-[10px] text-amber-400 font-mono">ODSTUPANJE 4.8%</div>
                </GlassCard>
                <GlassCard className="p-4 border-white/5 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Mlaznica 4</div>
                    <div className="text-sm font-bold text-white">75.0% Otvorena</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
            </div>

            {/* Main Lab Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* Left Area (Interactive Lab Module) - 2 cols on xl */}
                <div className="xl:col-span-2 space-y-4">
                    {activeTab === 'visualizer' && (
                        <div className="p-1 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <PeltonJetVisualizer 
                                sessionId="pelton-hub-session" 
                                onComplete={() => console.log('Jet Sync test complete')} 
                            />
                        </div>
                    )}

                    {activeTab === 'alignment' && (
                        <div className="p-1 rounded-2xl bg-slate-900/30 border border-white/5">
                            <PeltonInjectorAlignmentLab />
                        </div>
                    )}

                    {activeTab === 'needle' && (
                        <div className="p-1 rounded-2xl bg-slate-900/30 border border-white/5">
                            <PeltonNeedleValveLab />
                        </div>
                    )}
                </div>

                {/* Right Area (SOPs and Technical Details) - 1 col */}
                <div className="space-y-4">
                    {/* SOP Manuals */}
                    <GlassCard className="p-5 border-white/5 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-500" />
                            Relevantni SOP priručnici
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1 hover:border-amber-500/30 transition-all cursor-pointer">
                                <div className="text-xs font-bold text-white">PELTON NOZZLE SEQUENCING SOP</div>
                                <p className="text-[10px] text-slate-400">Pravila sekvencijalnog zatvaranja mlaznica radi smanjenja hidrauličkog udara.</p>
                            </div>
                            <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1 hover:border-amber-500/30 transition-all cursor-pointer">
                                <div className="text-xs font-bold text-white">NEEDLE DEFLECTOR COORDINATION</div>
                                <p className="text-[10px] text-slate-400">Kalibracija deflektora mlaza u prelaznim režimima rasterećenja generatora.</p>
                            </div>
                            <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1 hover:border-amber-500/30 transition-all cursor-pointer">
                                <div className="text-xs font-bold text-white">JET ANGLE LASER AUDIT</div>
                                <p className="text-[10px] text-slate-400">Metodologija preciznog laserskog poravnanja osa mlaznice i lopatica rotora.</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Safety checklist */}
                    <GlassCard className="p-5 border-white/5 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                            Sigurnosne granice
                        </h3>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-1.5">
                                <span className="text-slate-400">Max. debalans sila:</span>
                                <span className="text-red-400 font-bold">15.0%</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1.5">
                                <span className="text-slate-400">Dozvoljena temp. ležaja:</span>
                                <span className="text-white">65.0°C</span>
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
