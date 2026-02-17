import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Activity, AlertTriangle, Waves, Power, Settings, ShieldCheck, Cpu } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const DrainagePumps: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Mapping from CEREBRO
    const waterLevel = 35; // % (Simulateded for current context)
    const isSumpCritical = waterLevel > 90;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-blue-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-blue-600 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 bg-blue-400/20 animate-[pulse_2s_infinite]" style={{ height: `${waterLevel}%` }} />
                            <Waves className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-blue-950 text-blue-500 text-[10px] font-black border border-blue-900/50 uppercase tracking-widest">SOP-SITE-008</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.drainagePumps.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.drainagePumps.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Sump Intelligence Hub */}
                <GlassCard title="Hydraulic Accumulation & Pumping Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-blue-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Droplets className="w-3 h-3 text-blue-400" /> Sump Head
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {waterLevel.toFixed(1)} <span className="text-xs text-slate-500 uppercase ml-2">% Vol</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-blue-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" /> Ingress Rate
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                                4.2 <span className="text-xs text-slate-500 ml-1">L/sec</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-blue-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> OWS Integrity
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase tabular-nums">
                                Nominal
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pump Logic Module */}
                    <GlassCard title={t('francis.drainagePumps.s1Title')} icon={<Activity className="text-blue-400" />}>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((level) => {
                                const isActive = waterLevel > (level === 1 ? 0 : level === 2 ? 40 : level === 3 ? 70 : 90);
                                return (
                                    <div key={level} className={`p-6 rounded-none border flex justify-between items-center transition-all duration-500 group/level ${isActive
                                        ? level === 4 ? 'bg-red-950/20 border-red-500 shadow-none animate-pulse' : 'bg-blue-950/20 border-blue-500/50'
                                        : 'bg-black/40 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10'
                                        }`}>
                                        <div className="font-black text-white text-xs uppercase tracking-tighter group-hover/level:pl-2 transition-all">{t(`francis.drainagePumps.l${level}T`)}</div>
                                        <div className={`font-mono font-black text-sm uppercase ${isActive ? level === 4 ? 'text-red-500' : 'text-blue-400' : 'text-slate-600'}`}>
                                            {t(`francis.drainagePumps.l${level}D`)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 p-6 bg-black/40 rounded-none border border-white/5 flex items-start gap-4">
                            <Settings className="w-6 h-6 text-slate-500 shrink-0 mt-1" />
                            <div>
                                <strong className="block text-white text-[11px] font-black uppercase tracking-widest mb-1">{t('francis.drainagePumps.dutyTitle')}</strong>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">{t('francis.drainagePumps.dutyDesc')}</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Maintenance Pulse */}
                    <div className="space-y-8">
                        <GlassCard title={t('francis.drainagePumps.s2Title')} icon={<ShieldCheck className="text-emerald-400" />}>
                            <div className="space-y-4">
                                {[1, 2, 3].map((m) => (
                                    <div key={m} className="p-6 bg-black/40 rounded-none border border-white/5 hover:border-emerald-500/30 transition-all group/m">
                                        <h4 className="text-emerald-500 font-black text-[10px] uppercase mb-2 tracking-[0.2em] group-hover/m:tracking-[0.3em] transition-all">{t(`francis.drainagePumps.m${m}T`)}</h4>
                                        <p className="text-[11px] text-slate-400/80 font-bold leading-relaxed italic group-hover/m:text-slate-200 transition-colors">{t(`francis.drainagePumps.m${m}D`)}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <section className="bg-amber-950/10 border-l-[12px] border-amber-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-amber-900/20 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle className="w-24 h-24 text-amber-500" />
                            </div>
                            <div className="flex items-center gap-4 mb-4 text-amber-500 relative z-10">
                                <AlertTriangle className="w-8 h-8 flex-shrink-0 animate-pulse" />
                                <h3 className="text-lg font-black uppercase tracking-tighter">{t('francis.drainagePumps.s3Title')}</h3>
                            </div>
                            <p className="text-slate-200 text-xs font-bold leading-relaxed italic border-l-2 border-amber-500/30 pl-4 mb-6 relative z-10">
                                {t('francis.drainagePumps.s3Desc')}
                            </p>
                            <div className="bg-amber-600 text-white px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-widest inline-block shadow-none relative z-10">
                                {t('francis.drainagePumps.owsSt')}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DrainagePumps;
