import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, AlertTriangle, Check, Droplet, Layers, ShieldCheck, Activity } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const ThrustBalance: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { thrust } = useEngineeringMath();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-emerald-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-emerald-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <ArrowRightLeft className="text-white w-8 h-8 relative z-10 group-hover:rotate-180 transition-transform duration-1000" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-500 text-[10px] font-black border border-emerald-900/50 uppercase tracking-widest">SOP-MECH-012</span>
                                <NeuralPulse color="emerald" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.thrustBalance.title')}
                            </h1>
                            <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.2em] italic">
                                {t('francis.thrustBalance.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.thrustBalance.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                {/* 1. The Hydraulic Counter-Force Briefing */}
                <div className="bg-red-950/20 border-l-[16px] border-red-600 p-12 rounded-r-[4rem] border border-red-900/20 relative group overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="w-64 h-64 text-red-600" />
                    </div>
                    <div className="flex items-start gap-10 relative z-10">
                        <div className="p-8 bg-red-600 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            <AlertTriangle className="text-white w-16 h-16" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">{t('francis.thrustBalance.s1Title')}</h2>
                            <div className="px-4 py-1 bg-red-900/40 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-900/50 inline-block italic mb-8">Structural Integrity Warning</div>
                            <p className="text-lg text-slate-200 font-bold italic leading-relaxed uppercase tracking-tighter border-l-4 border-red-500/30 pl-8 mb-10">
                                {t('francis.thrustBalance.s1Desc')}
                            </p>

                            {/* Vector Indicator */}
                            <div className="p-10 bg-black/60 rounded-[3rem] border border-white/5 shadow-inner flex items-center justify-between gap-12 group/viz">
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{t('francis.thrustBalance.vectorRunner')}</span>
                                    <div className="w-16 h-24 bg-emerald-600/20 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center group-hover/viz:scale-105 transition-transform">
                                        <Layers className="text-emerald-500 w-8 h-8" />
                                    </div>
                                </div>

                                <div className="flex-1 relative h-3 bg-slate-900 rounded-full border border-white/10 overflow-hidden group/arrow">
                                    <div className="absolute inset-y-0 right-0 w-[220px] bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-1000 group-hover/viz:w-[250px]" />
                                    <div className="absolute right-4 -top-3 text-[14px] font-black text-white italic drop-shadow-lg group-hover/viz:translate-x-2 transition-transform">~{thrust.totalKN.toFixed(0)} kN</div>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{t('francis.thrustBalance.vectorThrust')}</span>
                                    <div className="w-16 h-24 bg-amber-600/20 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center group-hover/viz:scale-105 transition-transform">
                                        <ShieldCheck className="text-amber-500 w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Balance Logic Intelligence */}
                <GlassCard title={t('francis.thrustBalance.s2Title')} icon={<Layers className="text-emerald-500" />}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-10">
                            <div>
                                <h4 className="text-emerald-500 text-[10px] font-black uppercase mb-4 tracking-[0.3em] italic">{t('francis.thrustBalance.designIntent')}</h4>
                                <p className="text-sm text-slate-300 font-black italic uppercase leading-relaxed tracking-tight mb-8">
                                    {t('francis.thrustBalance.intentDesc')}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2].map(n => (
                                    <div key={n} className="p-8 bg-black/40 rounded-[2.5rem] border border-emerald-500/20 flex gap-8 items-center group/intent hover:bg-emerald-950/5 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl group-hover/intent:scale-110 transition-transform">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm text-slate-200 font-extrabold uppercase italic tracking-tight italic" >{t(`francis.thrustBalance.i${n}`)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="p-10 bg-slate-900/60 rounded-[3rem] border border-white/5 shadow-2xl relative group overflow-hidden h-full">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Activity className="w-32 h-32 text-slate-400" />
                                </div>
                                <h4 className="text-white text-base font-black uppercase mb-6 flex items-center gap-3 italic tracking-tighter">
                                    <Layers className="text-emerald-500" /> {t('francis.thrustBalance.siltMgmt')}
                                </h4>
                                <p className="text-xs text-slate-500 font-bold italic mb-10 tracking-widest uppercase leading-relaxed">
                                    {t('francis.thrustBalance.siltDesc')}
                                </p>
                                <div className="p-8 bg-red-950/20 border-2 border-red-500/30 rounded-[2.5rem] flex flex-col justify-center items-center gap-4 text-center animate-[pulse_3s_infinite]">
                                    <span className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] italic">{t('francis.thrustBalance.critLimit')}</span>
                                    <div className="text-3xl font-black text-red-500 font-mono tracking-tighter italic">{t('francis.thrustBalance.critVal')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Footer Permissive */}
                <div className="p-12 bg-black/40 rounded-[4rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-800 border-4 border-emerald-500 flex items-center justify-center relative shadow-2xl">
                            <div className="absolute inset-0 rounded-[1.5rem] border-2 border-emerald-400 animate-ping opacity-20" />
                            <ShieldCheck className="text-emerald-500 w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-white text-2xl font-black uppercase tracking-tighter italic">Mechanical Permissive</h3>
                            <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest italic">Axial Displacement: NOMINAL</div>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 text-center px-10">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1 italic">Thrust Factor</div>
                            <div className="text-xl font-black text-white font-mono italic">{thrust.factor.toFixed(2)} <span className="text-[10px] opacity-40 lowercase tracking-normal font-bold">&kappa;</span></div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
