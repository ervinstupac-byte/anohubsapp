import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';

// --- 1. MOCK DATA (ESG METRICS) ---
const METRICS = {
    totalWorkforce: 142,
    womenCount: 48,
    leadershipWomen: 35, // %
    payGap: 2.1, // %
    departments: [
        { name: 'Engineering', women: 28, total: 60 },
        { name: 'Site Operations', women: 12, total: 50 },
        { name: 'Corporate & Legal', women: 8, total: 32 },
    ]
};

// --- 2. STRATEGIC CONTENT (Your text) ---
export const GenderEquity: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'strategy'>('dashboard');
    const [openSectionId, setOpenSectionId] = useState<string | null>('imperativ');

    const womenPercentage = Math.round((METRICS.womenCount / METRICS.totalWorkforce) * 100);

    const toggleSection = (id: string) => setOpenSectionId(openSectionId === id ? null : id);

    const STRATEGY_SECTIONS = [
        {
            id: 'imperativ',
            title: t('genderEquity.strategy.impTitle'),
            subtitle: t('genderEquity.strategy.impSub'),
            content: (
                <div className="space-y-6">
                    <p className="leading-relaxed text-slate-300 font-light text-lg">
                        <Trans i18nKey="genderEquity.strategy.impContent" components={{ strong: <strong className="text-white font-bold" /> }} />
                    </p>
                    <div className="p-6 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-xl">
                        <p className="text-sm text-cyan-200 italic font-medium">
                            "{t('genderEquity.strategy.impQuote')}"
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'redefiniranje',
            title: t('genderEquity.strategy.redefTitle'),
            subtitle: t('genderEquity.strategy.redefSub'),
            content: (
                <div className="space-y-4">
                    <div className="grid gap-4">
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">{t('genderEquity.strategy.card1Title')}</strong>
                            <span className="text-slate-300 text-sm leading-relaxed">
                                <Trans i18nKey="genderEquity.strategy.card1Content" components={{ strong: <strong className="text-white" /> }} />
                            </span>
                        </div>
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">{t('genderEquity.strategy.card2Title')}</strong>
                            <span className="text-slate-300 text-sm leading-relaxed">
                                <Trans i18nKey="genderEquity.strategy.card2Content" components={{ strong: <strong className="text-white" /> }} />
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">

            {/* HERO HEADER */}
            <div className="relative text-center space-y-4 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full px-4">
                    <BackButton text={t('actions.back')} />
                </div>

                <div className="pt-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        {t('genderEquity.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t('genderEquity.title').split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">
                        {t('genderEquity.desc')}
                    </p>
                </div>

                {/* TABS SWITCHER */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard'
                            ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                            : 'bg-slate-900/50 text-slate-500 hover:text-white border border-slate-700'
                            }`}
                    >
                        {t('genderEquity.tabDashboard')}
                    </button>
                    <button
                        onClick={() => setActiveTab('strategy')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'strategy'
                            ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]'
                            : 'bg-slate-900/50 text-slate-500 hover:text-white border border-slate-700'
                            }`}
                    >
                        {t('genderEquity.tabStrategy')}
                    </button>
                </div>
            </div>

            {/* VIEW 1: DASHBOARD (Data) */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="text-center py-8 border-t-4 border-t-purple-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('genderEquity.totalRep')}</div>
                            <div className="text-5xl font-black text-white mb-2">{womenPercentage}%</div>
                            <div className="text-sm text-purple-400 font-bold">
                                {METRICS.womenCount} / {METRICS.totalWorkforce} {t('genderEquity.employees')}
                            </div>
                        </GlassCard>
                        <GlassCard className="text-center py-8 border-t-4 border-t-pink-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('genderEquity.leadership')}</div>
                            <div className="text-5xl font-black text-white mb-2">{METRICS.leadershipWomen}%</div>
                            <div className="text-sm text-pink-400 font-bold">{t('genderEquity.leadershipDesc')}</div>
                        </GlassCard>
                        <GlassCard className="text-center py-8 border-t-4 border-t-emerald-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('genderEquity.payGap')}</div>
                            <div className="text-5xl font-black text-white mb-2">{METRICS.payGap}%</div>
                            <div className="text-sm text-emerald-400 font-bold">{t('genderEquity.payGapDesc')}</div>
                        </GlassCard>
                    </div>

                    <GlassCard title={t('genderEquity.deptBreakdown')}>
                        <div className="space-y-6 mt-4">
                            {METRICS.departments.map((dept) => {
                                const pct = Math.round((dept.women / dept.total) * 100);
                                return (
                                    <div key={dept.name}>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="font-bold text-slate-200">{dept.name}</span>
                                            <span className="text-sm font-mono text-purple-300">{dept.women} / {dept.total} ({pct}%)</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full relative"
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* VIEW 2: STRATEGY (Your Text) */}
            {activeTab === 'strategy' && (
                <div className="space-y-4 animate-fade-in-up">
                    {STRATEGY_SECTIONS.map((section) => (
                        <div
                            key={section.id}
                            className={`
                                group rounded-2xl overflow-hidden transition-all duration-500 ease-out border
                                ${openSectionId === section.id
                                    ? 'bg-slate-800/80 border-cyan-500/50 shadow-lg shadow-cyan-900/10'
                                    : 'bg-slate-900/40 border-white/5 hover:border-white/10'}
                            `}
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex justify-between items-center text-left p-6"
                            >
                                <div>
                                    <h3 className={`text-xl font-bold transition-colors ${openSectionId === section.id ? 'text-white' : 'text-slate-300'}`}>
                                        {section.title}
                                    </h3>
                                    <p className="text-sm text-cyan-400 mt-1">{section.subtitle}</p>
                                </div>
                                <span className={`text-2xl transition-transform duration-300 ${openSectionId === section.id ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`}>
                                    ▼
                                </span>
                            </button>

                            {openSectionId === section.id && (
                                <div className="p-6 pt-0 border-t border-white/10 animate-fade-in">
                                    <div className="pt-6">{section.content}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.