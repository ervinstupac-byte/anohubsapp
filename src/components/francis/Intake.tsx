import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Waves, AlertTriangle, Droplets, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const Intake: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    // Mapping from CEREBRO
    const trashBuildUp = 12; // % (Mocked for context)
    const deltaP = 0.45; // meters
    const isAlarm = deltaP > 2.0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-cyan-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-cyan-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <Waves className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-500 text-[10px] font-black border border-cyan-900/50 uppercase tracking-widest">SOP-INT-001</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.intake.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-cyan-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.intake.return') || t('actions.back')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Fluid Intelligence Hub */}
                <GlassCard title="Hydraulic Intake Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-cyan-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Filter className="w-3 h-3 text-cyan-400" /> Trash Clog
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {trashBuildUp}% <span className="text-xs text-slate-500 uppercase ml-2">Surface</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-cyan-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" /> Head Loss (ΔP)
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter ${isAlarm ? 'text-red-500' : 'text-emerald-400'}`}>
                                {deltaP.toFixed(2)} <span className="text-xs text-slate-500 ml-1">m</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-cyan-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Droplets className="w-3 h-3 text-amber-400" /> Sediment PPM
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                1,250 <span className="text-xs text-slate-500 ml-1">PPM</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trash Rack Module */}
                    <GlassCard title={t('francis.intake.rack')} icon={<Filter className="text-cyan-400" />}>
                        <div className="space-y-8">
                            {/* Visualizer (Water Levels) */}
                            <div className="relative h-64 bg-slate-950 rounded-3xl border border-white/5 overflow-hidden flex items-end justify-between px-16 pt-16 group/vis shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-transparent opacity-50" />

                                {/* Upstream */}
                                <div className="w-24 relative z-10 flex flex-col items-center">
                                    <div className="absolute -top-8 text-[10px] font-black text-cyan-500 uppercase tracking-widest">Upstream</div>
                                    <div className="w-full bg-cyan-600/40 border-t-2 border-cyan-400 transition-all duration-700 shadow-[0_-10px_30px_rgba(34,211,238,0.2)] rounded-t-xl" style={{ height: '85%' }}>
                                        <div className="w-full h-full animate-pulse bg-cyan-400/5" />
                                    </div>
                                </div>

                                {/* Rack Grid Visual */}
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-slate-900 border-x border-white/10 z-20 flex flex-col justify-evenly items-center py-4">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`w-full h-1.5 shadow-sm transition-colors duration-500 ${trashBuildUp > i * 8 ? 'bg-amber-600 shadow-[0_0_10px_#d97706]' : 'bg-slate-700/30'}`} />
                                    ))}
                                </div>

                                {/* Downstream */}
                                <div className="w-24 relative z-10 flex flex-col items-center">
                                    <div className="absolute -top-8 text-[10px] font-black text-emerald-500 uppercase tracking-widest">Downstream</div>
                                    <div
                                        className="w-full bg-emerald-600/40 border-t-2 border-emerald-400 transition-all duration-700 shadow-[0_-10px_30px_rgba(16,185,129,0.2)] rounded-t-xl"
                                        style={{ height: `${85 - (deltaP * 10)}%` }}
                                    >
                                        <div className="w-full h-full animate-pulse bg-emerald-400/5" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-black/40 border border-white/5 rounded-3xl flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                                <div>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-1">Clogging Risk</span>
                                    <span className={`text-lg font-black uppercase tracking-tighter ${isAlarm ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {isAlarm ? 'Critical - Clean Now' : 'Nominal Flux'}
                                    </span>
                                </div>
                                <ShieldAlert className={`w-10 h-10 ${isAlarm ? 'text-red-500 animate-pulse' : 'text-emerald-500/20'}`} />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Sediment Monitor */}
                    <GlassCard title="Sediment Erosion Analysis" icon={<Droplets className="text-amber-500" />}>
                        <div className="space-y-6">
                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-amber-500/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                <div className="h-40 bg-slate-950 rounded-2xl relative overflow-hidden border border-white/5 mb-6">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_2s_infinite]" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                                        <Cpu className="w-8 h-8 text-amber-500 opacity-40" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scanning Particle Load</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 font-bold leading-relaxed relative z-10 italic">
                                    High sediment load (1250 PPM) detected. Neural analysis predicts 15% accelerated erosion on runner leading edges if load persists {'>'} 48h.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Abrasive Index</span>
                                    <span className="text-xl font-black text-amber-400 font-mono tracking-tighter">7.2 <span className="text-[10px] opacity-40">Mohs</span></span>
                                </div>
                                <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Erosion Rate</span>
                                    <span className="text-xl font-black text-white font-mono tracking-tighter">0.12 <span className="text-[10px] opacity-40">mm/yr</span></span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};

export default Intake;
