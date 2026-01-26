import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, AlertOctagon, Microscope, Droplet, HandMetal, CheckSquare, Activity, Settings, ShieldCheck } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const Linkage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-blue-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-blue-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <LinkIcon className="text-white w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-500 text-[10px] font-black border border-blue-900/50 uppercase tracking-widest">SOP-MECH-006</span>
                                <NeuralPulse color="blue" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.linkage.title')}
                            </h1>
                            <p className="text-[10px] text-blue-400/70 font-black uppercase tracking-[0.2em] italic">
                                {t('francis.linkage.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.linkage.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                {/* 1. Global Linkage Pulse */}
                <div className="bg-blue-900/10 border-l-[12px] border-blue-600 p-10 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-blue-900/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-48 h-48 text-blue-600" />
                    </div>
                    <div className="flex items-start gap-8 relative z-10">
                        <AlertOctagon className="text-orange-500 w-12 h-12 flex-shrink-0 animate-pulse" />
                        <div>
                            <h2 className="text-orange-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 italic">
                                {t('francis.linkage.introTitle')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 group/ctx">
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest min-w-[80px]">Context:</div>
                                        <p className="text-xs text-slate-300 font-bold">{t('francis.linkage.context').split(':')[1]}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 bg-red-950/20 rounded-2xl border border-red-500/20 group/risk">
                                        <div className="text-[10px] text-red-500 font-black uppercase tracking-widest min-w-[80px]">Risk:</div>
                                        <p className="text-xs text-red-200 font-bold">{t('francis.linkage.risk').split(':')[1]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* SOP 1: Linkage Logic */}
                    <GlassCard title={t('francis.linkage.s1Title')} icon={<Microscope className="text-cyan-400" />}>
                        <div className="space-y-8">
                            <p className="text-sm text-slate-400 font-bold italic border-l-4 border-cyan-500/30 pl-4 py-2 uppercase tracking-tight">
                                {t('francis.linkage.s1Logic')}
                            </p>

                            <div className="space-y-4">
                                {[1, 2].map((step) => (
                                    <div key={step} className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex gap-6 items-center group/step hover:border-cyan-500/30 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border-2 border-cyan-500 flex items-center justify-center text-cyan-500 font-black shadow-lg shadow-cyan-900/20">0{step}</div>
                                        <p className="text-xs text-white font-black uppercase tracking-tight italic">{t(`francis.linkage.s1Step${step}`)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-8">
                                <div className="p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-3xl group/pass overflow-hidden relative">
                                    <div className="absolute inset-0 bg-emerald-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                                    <h4 className="text-emerald-500 text-[10px] font-black uppercase mb-2 tracking-widest flex items-center gap-2 relative z-10">
                                        <CheckSquare className="w-3 h-3" /> Nominal
                                    </h4>
                                    <p className="text-[9px] text-slate-300 font-bold uppercase relative z-10">{t('francis.linkage.s1Pass')}</p>
                                </div>
                                <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-3xl group/fail overflow-hidden relative">
                                    <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                                    <h4 className="text-red-500 text-[10px] font-black uppercase mb-2 tracking-widest flex items-center gap-2 relative z-10">
                                        <AlertOctagon className="w-3 h-3" /> Breach
                                    </h4>
                                    <p className="text-[9px] text-slate-300 font-bold uppercase relative z-10">{t('francis.linkage.s1Fail')}</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="space-y-12">
                        {/* SOP 2: Lubrication Audit */}
                        <GlassCard title={t('francis.linkage.s2Title')} icon={<Droplet className="text-yellow-400" />}>
                            <div className="space-y-6">
                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic mb-6">
                                    {t('francis.linkage.s2Desc')}
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-8 bg-yellow-950/10 border-l-[12px] border-yellow-600 rounded-r-[2.5rem] border border-yellow-900/20 group/audit">
                                        <h4 className="text-yellow-500 text-[10px] font-black uppercase mb-2 tracking-widest italic">Industrial Audit Requirement</h4>
                                        <p className="text-xs text-slate-200 font-bold uppercase tracking-tight">{t('francis.linkage.s2Audit').split(':')[1]}</p>
                                    </div>
                                    <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] group/vis">
                                        <h4 className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                                            <Microscope className="w-3 h-3" /> Visual Verification
                                        </h4>
                                        <p className="text-xs text-slate-300 font-bold uppercase tracking-tight">{t('francis.linkage.s2Vis').split(':')[1]}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Checklist */}
                        <div className="p-10 bg-black/60 rounded-[3rem] border border-white/5 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CheckSquare className="w-32 h-32 text-emerald-500" />
                            </div>
                            <h3 className="text-emerald-500 text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4 italic relative z-10">
                                <CheckSquare className="w-8 h-8" /> {t('francis.linkage.checklistTitle')}
                            </h3>
                            <div className="space-y-4 relative z-10">
                                {[1, 2, 3].map(num => (
                                    <div key={num} className="flex items-center gap-5 p-4 bg-slate-900/40 rounded-2xl border border-white/5 group/item hover:border-emerald-500/30 transition-all">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-black uppercase group-hover:text-white transition-colors">
                                            {t(`francis.linkage.chk${num}`)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SOP 3: Swing Test - Critical Safety */}
                <section className="bg-red-950/10 border-l-[16px] border-red-600 p-12 rounded-r-[4rem] border border-red-900/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <HandMetal className="w-64 h-64 text-red-600" />
                    </div>
                    <div className="flex items-center gap-8 mb-10 relative z-10">
                        <div className="p-6 bg-red-600 rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            <HandMetal className="text-white w-12 h-12 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 italic">{t('francis.linkage.s3Title')}</h2>
                            <div className="px-4 py-1 bg-red-900/30 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-900/50 inline-block">High-Risk Dynamic Test</div>
                        </div>
                    </div>

                    <div className="p-8 bg-black/60 rounded-[3rem] border border-red-500/30 shadow-inner mb-12 relative z-10">
                        <h4 className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-[0.3em] flex items-center gap-2 italic">
                            <ShieldCheck className="w-4 h-4" /> Safety Protocol Breach Warning
                        </h4>
                        <p className="text-sm text-red-200 font-black italic leading-relaxed uppercase tracking-tighter">
                            {t('francis.linkage.s3Safety')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-4">
                            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 opacity-60">Sequence Intelligence</h4>
                            <div className="p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group/proc">
                                <p className="text-xs text-slate-300 font-bold uppercase tracking-tight leading-relaxed">{t('francis.linkage.s3Proc')}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 opacity-60">Validation Matrix</h4>
                            <div className="p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all group/crit">
                                <p className="text-xs text-slate-300 font-bold uppercase tracking-tight leading-relaxed">{t('francis.linkage.s3Crit')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
