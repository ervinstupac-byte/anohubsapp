import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const RevitalizationStrategy: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();

    // Smart mailto link
    const assetSubject = selectedAsset ? ` for ${selectedAsset.name}` : '';
    const mailtoLink = `mailto:ino@anohubs.com?subject=Inquiry: Obsolescence Audit${assetSubject}`;

    const handleContactClick = () => {
        window.location.href = mailtoLink;
    };

    return (
        <div className="space-y-8 pb-12 max-w-6xl mx-auto">

            {/* HERO HEADER */}
            <div className="text-center space-y-6 animate-fade-in-up pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full max-w-6xl">
                    <BackButton text={t('actions.back')} />
                </div>

                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {t('revitalization.title').split(' ')[0]} {t('revitalization.title').split(' ')[1]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('revitalization.title').split(' ').slice(2).join(' ')}</span>
                    </h2>

                    {selectedAsset && (
                        <div className="inline-block px-4 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-4">
                            {t('revitalization.context')} <span className="text-white font-bold">{selectedAsset.name}</span>
                        </div>
                    )}

                    <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed font-light">
                        {t('revitalization.desc')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: ANALYSIS & DECISION */}
                <div className="space-y-8 animate-slide-in-left">
                    <GlassCard
                        title={t('revitalization.lea.title')}
                        subtitle={t('revitalization.lea.subtitle')}
                        action={<span className="text-2xl">📊</span>}
                    >
                        <p className="text-slate-300 mb-8 leading-relaxed font-light">
                            <Trans i18nKey="revitalization.lea.content" components={{ strong: <strong className="text-white font-bold" /> }} />
                        </p>

                        <div className="bg-slate-900/60 p-6 rounded-xl border border-white/5 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>{t('revitalization.lea.matrix')}</span>
                                <span className="text-cyan-400">{t('revitalization.lea.lcc')}</span>
                            </div>

                            <div className="flex items-stretch gap-1 h-12">
                                <div className="flex-1 bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 text-emerald-400 flex items-center justify-center rounded-l-lg border border-emerald-500/30 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:flex-[1.2] transition-all cursor-default">
                                    {t('revitalization.lea.refurbish')}
                                </div>
                                <div className="w-8 bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono border-y border-slate-700">
                                    VS
                                </div>
                                <div className="flex-1 bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 text-cyan-400 flex items-center justify-center rounded-r-lg border border-cyan-500/30 text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:flex-[1.2] transition-all cursor-default">
                                    {t('revitalization.lea.replace')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-cyan-500/5 border-l-2 border-cyan-500 text-sm text-cyan-100 italic rounded-r-lg">
                            "{t('revitalization.lea.quote')}"
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-slate-800/40">
                        <div className="flex items-start space-x-5">
                            <div className="text-4xl p-3 bg-white/5 rounded-2xl">🧬</div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">{t('revitalization.twin.title')}</h4>
                                <p className="text-slate-300 text-sm leading-relaxed mb-3 font-light">
                                    <Trans i18nKey="revitalization.twin.desc" components={{ strong: <strong className="text-white" /> }} />
                                </p>
                                <p className="text-slate-400 text-xs uppercase tracking-wide font-bold">
                                    {t('revitalization.twin.tag')}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT COLUMN: RISKS & OBSOLESCENCE */}
                <div className="space-y-8 animate-slide-in-right" style={{ animationDelay: '100ms' }}>
                    <GlassCard
                        title={t('revitalization.risk.title')}
                        subtitle={t('revitalization.risk.subtitle')}
                        className="h-full"
                        action={<span className="text-2xl">⚠️</span>}
                    >
                        <p className="text-slate-300 mb-6 leading-relaxed font-light">
                            {t('revitalization.risk.content')}
                        </p>

                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl relative overflow-hidden group hover:bg-red-500/10 transition-colors mb-6">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <h4 className="font-bold text-red-400 flex items-center mb-2 uppercase tracking-wider text-sm">
                                {t('revitalization.risk.alertTitle')}
                            </h4>
                            <p className="text-slate-300 text-sm relative z-10 font-light">
                                <Trans i18nKey="revitalization.risk.alertContent" components={{ strong: <strong className="text-white font-bold" /> }} />
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center p-3 rounded-lg bg-amber-900/10 border border-amber-500/10">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-sm text-slate-300">{t('revitalization.risk.control')}</span>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-cyan-900/10 border border-cyan-500/10">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                <span className="text-sm text-slate-300">{t('revitalization.risk.mech')}</span>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-purple-900/10 border border-purple-500/10">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                                <span className="text-sm text-slate-300 font-bold">{t('revitalization.risk.gap')}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 overflow-hidden">
                    <div className="bg-slate-900/90 rounded-[15px] p-10 text-center backdrop-blur-xl relative">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{t('revitalization.cta.title')}</h3>
                            <p className="text-slate-400 mb-8 text-lg font-light">{t('revitalization.cta.desc')}</p>

                            <div className="flex justify-center">
                                <ModernButton
                                    onClick={handleContactClick}
                                    variant="primary"
                                    className="px-8 py-4 text-lg shadow-cyan-500/20"
                                    icon={<span>📅</span>}
                                >
                                    {t('revitalization.cta.btn')}
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.