import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Layers, Split, Crosshair, HelpCircle, Activity, Settings, ShieldCheck } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const Coupling: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-stone-800 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-slate-800 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <Layers className="text-white w-8 h-8 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-slate-900 text-slate-500 text-[10px] font-black border border-white/5 uppercase tracking-widest">SOP-MECH-002</span>
                                <NeuralPulse color="slate" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.coupling.title')}
                            </h1>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">
                                {t('francis.coupling.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.coupling.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                {/* 1. Structural Integrity Risks */}
                <div className="bg-red-950/20 border-l-[12px] border-red-600 p-10 rounded-none shadow-none backdrop-blur-sm border border-red-900/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex items-start gap-8 relative z-10">
                        <div className="p-6 bg-red-600 rounded-none shadow-none">
                            <AlertTriangle className="text-white w-12 h-12" />
                        </div>
                        <div>
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 italic">
                                {t('francis.coupling.s1Title')}
                            </h2>
                            <p className="text-lg text-slate-200 font-bold italic leading-relaxed max-w-4xl border-l-2 border-red-500/30 pl-6 uppercase tracking-tighter">
                                {t('francis.coupling.s1Desc')}
                            </p>
                            <div className="mt-8 p-6 bg-black/40 rounded-none border border-red-500/30">
                                <p className="text-sm text-red-200 font-black uppercase tracking-tight">
                                    <strong>{t('francis.coupling.s1Warn')}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Alignment Intelligence Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <GlassCard title={t('francis.coupling.s2Title')} icon={<Layers className="text-slate-400" />}>
                        <div className="flex items-center gap-12">
                            <div className="w-32 h-32 rounded-none bg-black border-4 border-slate-800 flex items-center justify-center relative overflow-hidden group/viz">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover/viz:bg-blue-500/10 transition-colors" />
                                <div className="w-16 h-16 border-4 border-blue-500/50 rounded-none flex items-center justify-center">
                                    <div className="w-1 h-8 bg-blue-500 rounded-none animate-pulse" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                                    {t('francis.coupling.s2Desc')}
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-slate-900 rounded-none border border-white/5 text-[10px] font-black text-slate-400">Radial Lim: 0.05mm</div>
                                    <div className="px-4 py-2 bg-slate-900 rounded-none border border-white/5 text-[10px] font-black text-slate-400">Status: Nominal</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard title={t('francis.coupling.s3Title')} icon={<Split className="text-slate-400" />}>
                        <div className="flex items-center gap-12">
                            <div className="w-32 h-32 rounded-none bg-black border-4 border-slate-800 flex items-center justify-center relative overflow-hidden group/viz">
                                <div className="absolute inset-0 bg-amber-500/5 group-hover/viz:bg-amber-500/10 transition-colors" />
                                <div className="w-16 h-16 border-4 border-amber-500/50 rounded-none flex items-center justify-center rotate-12">
                                    <div className="w-8 h-1 bg-amber-500 rounded-none animate-pulse" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                                    {t('francis.coupling.s3Desc')}
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-slate-900 rounded-none border border-white/5 text-[10px] font-black text-slate-400">Angular Lim: 0.1&deg;</div>
                                    <div className="px-4 py-2 bg-slate-900 rounded-none border border-white/5 text-[10px] font-black text-slate-400">Status: Locked</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 3. Rim & Face Procedure */}
                <GlassCard title={t('francis.coupling.s4Title')} icon={<Crosshair className="text-blue-500" />}>
                    <div className="space-y-8 relative">
                        <div className="flex flex-col md:flex-row gap-8">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="p-8 bg-black/40 rounded-none border border-white/5 hover:border-blue-500/30 transition-all flex-1 group/step">
                                    <div className="w-12 h-12 rounded-none bg-blue-600 flex items-center justify-center text-white font-black text-xl mb-6 shadow-none group-hover:scale-110 transition-transform">
                                        0{num}
                                    </div>
                                    <p className="text-xs text-slate-300 font-black uppercase tracking-tight leading-relaxed italic">
                                        {t(`francis.coupling.s4L${num}`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* 4. Bolt Integrity Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="bg-blue-950/10 border-l-[12px] border-blue-600 p-10 rounded-none border border-blue-900/20 relative group overflow-hidden">
                        <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-none bg-blue-600 flex items-center justify-center shadow-none">
                                <Settings className="text-white w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.coupling.s5Title')}</h2>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="p-8 bg-black/60 rounded-none border border-blue-500/20 shadow-none group/loctite">
                                <h4 className="text-blue-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em] italic">{t('francis.coupling.loctite')}</h4>
                                <p className="text-sm text-slate-200 font-black italic">{t('francis.coupling.loctiteDesc')}</p>
                            </div>
                            <div className="p-8 bg-slate-900/40 rounded-none border border-white/5 group/sympt">
                                <h4 className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-[0.2em] italic">{t('francis.coupling.sympt')}</h4>
                                <p className="text-sm text-slate-400 font-bold italic">{t('francis.coupling.symptDesc')}</p>
                            </div>
                        </div>
                    </section>

                    <div className="bg-black/40 p-12 rounded-none border border-white/5 flex flex-col justify-center items-center text-center">
                        <div className="w-24 h-24 rounded-none bg-slate-800 border-4 border-blue-500 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 rounded-none border-2 border-blue-400 animate-ping opacity-20" />
                            <ShieldCheck className="text-blue-500 w-12 h-12" />
                        </div>
                        <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-4">Foundation Lock</h3>
                        <div className="px-8 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-none shadow-none">
                            Structural Permissive: GREEN
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                            <div className="p-6 bg-slate-900 rounded-none border border-white/5">
                                <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Bolt Load</div>
                                <div className="text-lg font-black text-white font-mono">1520 kN</div>
                            </div>
                            <div className="p-6 bg-slate-900 rounded-none border border-white/5">
                                <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Gap Matrix</div>
                                <div className="text-lg font-black text-white font-mono">0.02 mm</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
