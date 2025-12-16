import React from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from './ui/GlassCard.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const ProjectPhaseGuide: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="animate-fade-in pb-12 max-w-5xl mx-auto space-y-12">

            {/* HERO HEADER */}
            <div className="relative text-center space-y-6 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full px-4">
                    <BackButton text={t('actions.back')} />
                </div>

                <div className="pt-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
                        {t('projectPhase.title').split(' ')[0]} {t('projectPhase.title').split(' ')[1]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('projectPhase.title').split(' ')[2]}</span>
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
                        {t('projectPhase.subtitle')}
                    </p>
                </div>
            </div>

            {/* TIMELINE CONTAINER */}
            <div className="relative space-y-24 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">

                {/* PHASE 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    {/* ICON MARKER */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#020617] bg-cyan-900 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-2xl">
                        📝
                    </div>

                    {/* CARD */}
                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-1">
                        <GlassCard className="border-t-4 border-t-cyan-500 relative overflow-hidden group-hover:border-cyan-400/50 transition-colors">
                            <div className="absolute top-4 right-4 text-6xl font-black text-white/5 pointer-events-none select-none">01</div>

                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">{t('projectPhase.phase1.tag')}</span>
                                <h3 className="text-2xl font-bold text-white mt-2">{t('projectPhase.phase1.title')}</h3>
                            </div>

                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                {t('projectPhase.phase1.desc')}
                            </p>

                            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t('projectPhase.phase1.mandatesTitle')}</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-cyan-500 mr-2">✓</span>
                                        {t('projectPhase.phase1.m1')}
                                    </li>
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-cyan-500 mr-2">✓</span>
                                        {t('projectPhase.phase1.m2')}
                                    </li>
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-cyan-500 mr-2">✓</span>
                                        {t('projectPhase.phase1.m3')}
                                    </li>
                                </ul>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* PHASE 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#020617] bg-amber-900 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-2xl">
                        🏗️
                    </div>

                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-1">
                        <GlassCard className="border-t-4 border-t-amber-500 relative overflow-hidden group-hover:border-amber-400/50 transition-colors">
                            <div className="absolute top-4 right-4 text-6xl font-black text-white/5 pointer-events-none select-none">02</div>

                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20">{t('projectPhase.phase2.tag')}</span>
                                <h3 className="text-2xl font-bold text-white mt-2">{t('projectPhase.phase2.title')}</h3>
                            </div>

                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                {t('projectPhase.phase2.desc')}
                            </p>

                            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t('projectPhase.phase2.mandatesTitle')}</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-amber-500 mr-2">✓</span>
                                        {t('projectPhase.phase2.m1')}
                                    </li>
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-amber-500 mr-2">✓</span>
                                        {t('projectPhase.phase2.m2')}
                                    </li>
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-amber-500 mr-2">✓</span>
                                        {t('projectPhase.phase2.m3')}
                                    </li>
                                </ul>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* PHASE 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#020617] bg-emerald-900 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-2xl">
                        ⚙️
                    </div>

                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-1">
                        <GlassCard className="border-t-4 border-t-emerald-500 relative overflow-hidden group-hover:border-emerald-400/50 transition-colors">
                            <div className="absolute top-4 right-4 text-6xl font-black text-white/5 pointer-events-none select-none">03</div>

                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">{t('projectPhase.phase3.tag')}</span>
                                <h3 className="text-2xl font-bold text-white mt-2">{t('projectPhase.phase3.title')}</h3>
                            </div>

                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                {t('projectPhase.phase3.desc')}
                            </p>

                            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t('projectPhase.phase3.mandatesTitle')}</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-emerald-500 mr-2">✓</span>
                                        {t('projectPhase.phase3.m1')}
                                    </li>
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-emerald-500 mr-2">✓</span>
                                        {t('projectPhase.phase3.m2')}
                                    </li>
                                    <li className="flex items-start text-xs text-slate-300">
                                        <span className="text-emerald-500 mr-2">✓</span>
                                        {t('projectPhase.phase3.m3')}
                                    </li>
                                </ul>
                            </div>
                        </GlassCard>
                    </div>
                </div>

            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.