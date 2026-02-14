import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../stores/useAppStore';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const DigitalIntroduction: React.FC = () => {
    const { t } = useTranslation();
    const { navigateTo } = useNavigation();
    const { showToast } = useToast();
    const [signed, setSigned] = useState(false);

    const handleSign = () => {
        setSigned(true);
        showToast(t('digitalIntro.activation.toastParams', 'Immunity Protocol Activated. Welcome to the Command Center.'), 'success');
        setTimeout(() => {
            navigateTo('hub');
        }, 1500);
    };

    return (
        <div className="animate-fade-in space-y-16 pb-16 max-w-5xl mx-auto font-sans">
            {!signed && <div className="absolute top-6 left-6 z-50"><BackButton text={t('digitalIntro.abort', 'Abort Sequence')} /></div>}

            {/* 1. HERO SECTION: THE VISION */}
            <div className="text-center space-y-8 pt-20 relative">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative inline-block">
                    <span className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase mb-2 block animate-pulse">{t('digitalIntro.visionLog', 'Vision Log v1.0')}</span>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl uppercase leading-[0.9]">
                        {t('digitalIntro.heroTitleTop', 'Architects of')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">{t('digitalIntro.heroTitleHighlight', 'Immunity')}</span>
                    </h1>
                </div>

                <p className="text-slate-300 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-light">
                    {t('digitalIntro.heroText', 'We don\'t just inspect power plants. We solve the fundamental equation of Dynamic Risk versus Operational Certainty.')}
                </p>
            </div>

            {/* 2. THE ORIGIN SIGNAL (Personal Authority) */}
            <div className="max-w-3xl mx-auto">
                <GlassCard className="relative border-l-4 border-l-cyan-500 bg-gradient-to-r from-slate-900 to-slate-900/50 italic">
                    <div className="text-4xl text-cyan-500/20 absolute top-4 left-4">❝</div>
                    <div className="relative z-10 space-y-4 p-4">
                        <p className="text-slate-400 text-lg leading-relaxed">
                            "{t('digitalIntro.quote', 'For years, I watched the industry accept a 48% failure rate as \'unavoidable wear and tear\'. I realized standard maintenance wasn\'t enough. We needed a forensic approach. We needed to treat a hydropower plant not like a static building, but like a living organism with an immune system.')}"
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-cyan-500 border border-cyan-500/30">ES</div>
                            <div>
                                <div className="text-white font-bold text-sm uppercase tracking-wider">Ervin Stupac</div>
                                <div className="text-cyan-500/60 text-[10px] font-mono tracking-widest">LEAD ARCHITECT // ID: ES-001</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* 3. THE TRIAD OF COMPETENCE (Services & Philosophy) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CARD 1: FORENSIC TRUTH */}
                <GlassCard className="group hover:-translate-y-2 transition-transform duration-500 border-t-4 border-t-purple-500">
                    <div className="h-12 w-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        🔍
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{t('digitalIntro.card1.title', 'Forensic Truth')}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        {t('digitalIntro.card1.desc', 'We don\'t guess. We measure. Using sub-surface NDT and 3D metrology, we provide data that holds up in a court of law.')}
                    </p>
                    <div className="text-[10px] font-mono text-purple-400 uppercase">{t('digitalIntro.card1.footer', 'Input: Sub-Surface NDT')}</div>
                </GlassCard>

                {/* CARD 2: DIRTY HANDS, CLEAN DATA */}
                <GlassCard className="group hover:-translate-y-2 transition-transform duration-500 border-t-4 border-t-emerald-500">
                    <div className="h-12 w-12 bg-emerald-900/30 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        🛠️
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{t('digitalIntro.card2.title', 'Dirty Hands. Clean Data.')}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        {t('digitalIntro.card2.desc', 'We don\'t just generate reports. We turn wrenches, machine steel, and weld cavitation. From the banal basics to advanced forensics.')}
                    </p>
                    <div className="text-[10px] font-mono text-emerald-400 uppercase">{t('digitalIntro.card2.footer', 'Scope: End-to-End Execution')}</div>
                </GlassCard>

                {/* CARD 3: THE CULTURAL BETRAYAL */}
                <GlassCard className="group hover:-translate-y-2 transition-transform duration-500 border-t-4 border-t-red-500 bg-red-950/10">
                    <div className="h-12 w-12 bg-red-900/30 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        🛑
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{t('digitalIntro.card3.title', 'The Cultural Betrayal')}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        {t('digitalIntro.card3.desc', 'Why the Low-Bid Policy is an act of corporate violence against assets. We stand for the Zero-Tolerance Protocol.')}
                    </p>
                    <div className="text-[10px] font-mono text-red-400 uppercase">{t('digitalIntro.card3.footer', 'Enemy: The Execution Gap')}</div>
                </GlassCard>

            </div>

            {/* 4. DOMAIN EXPERTISE STRIP */}
            <div className="py-8 border-y border-white/5 bg-black/20 backdrop-blur-sm">
                <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6">{t('digitalIntro.mastery.title', 'Mastery Across Architectures')}</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                    <div className="text-center group cursor-default">
                        <div className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all">🌀</div>
                        <div className="text-sm font-bold text-white">{t('digitalIntro.mastery.francis', 'FRANCIS')}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{t('digitalIntro.mastery.francisDesc', 'The Pressure Beast')}</div>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all">⚙️</div>
                        <div className="text-sm font-bold text-white">{t('digitalIntro.mastery.kaplan', 'KAPLAN')}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{t('digitalIntro.mastery.kaplanDesc', 'The Flow Master')}</div>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all">💧</div>
                        <div className="text-sm font-bold text-white">{t('digitalIntro.mastery.pelton', 'PELTON')}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{t('digitalIntro.mastery.peltonDesc', 'The Kinetic King')}</div>
                    </div>
                </div>
            </div>

            {/* 5. ACTIVATION AREA */}
            <div className="flex flex-col items-center gap-6 pt-8">
                {signed ? (
                    <div className="animate-scale-in text-center p-8 bg-cyan-950/30 border border-cyan-500/50 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <div className="text-6xl mb-4 animate-bounce">🔓</div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t('digitalIntro.activation.unlockedTitle', 'System Unlocked')}</h3>
                        <p className="text-cyan-400 font-mono mt-2 text-sm">{t('digitalIntro.activation.loading', 'Loading Command Center...')}</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <p className="text-slate-400 text-sm font-light">{t('digitalIntro.activation.lockedText1', 'You\'ve Seen The Vision. Now See The Logic.')}</p>
                            <p className="text-xs text-slate-600 font-mono">{t('digitalIntro.activation.lockedText2', 'ACCESS PROTOCOL: ENGINEERING IMMUNITY')}</p>
                        </div>

                        <ModernButton
                            onClick={handleSign}
                            variant="primary"
                            className="px-16 py-6 text-lg font-black tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] border-cyan-400"
                            icon={<span>🚀</span>}
                        >
                            {t('digitalIntro.activation.enterBtn', 'ENTER COMMAND CENTER')}
                        </ModernButton>
                    </>
                )}
            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.
