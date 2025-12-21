import React from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { turbineDetailData } from '../data/turbineDetailData.ts';
import type { TurbineDetail as TurbineDetailType, TurbineComponent } from '../data/turbineDetailData.ts';

interface TurbineDetailProps {
    turbineKey: string;
}

// --- MODERN CRITICALITY BADGE (Neon Style) ---
const CriticalityBadge: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const { t } = useTranslation();
    let style = '';
    let icon = '';

    switch (level) {
        case 'High':
            style = 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.25)]';
            icon = `⚠️ ${t('turbineDetail.badges.critical')}`;
            break;
        case 'Medium':
            style = 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]';
            icon = `⚡ ${t('turbineDetail.badges.attention')}`;
            break;
        case 'Low':
            style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.2)]';
            icon = `✓ ${t('turbineDetail.badges.standard')}`;
            break;
    }

    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-md ${style}`}>
            {icon}
        </span>
    );
};

// --- MODERN COMPONENT CARD (Mini Glass Tile) ---
const ComponentCard: React.FC<TurbineComponent> = ({ name, description, criticality }) => (
    <div className={`
        group relative p-5 rounded-2xl border transition-all duration-300
        ${criticality === 'High'
            ? 'bg-gradient-to-br from-slate-900/60 to-red-950/30 border-red-500/20 hover:border-red-500/50'
            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-cyan-500/30'}
        backdrop-blur-sm
    `}>
        {/* Hover Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex justify-between items-start mb-3 relative z-10">
            <h4 className={`text-lg font-bold tracking-tight ${criticality === 'High' ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                {name}
            </h4>
            <CriticalityBadge level={criticality} />
        </div>

        <p className="text-sm text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors relative z-10">
            {description}
        </p>
    </div>
);

// --- MAIN COMPONENT (JEDINA DEKLARACIJA I EKSPORT) ---
export const TurbineDetail: React.FC<TurbineDetailProps> = ({ turbineKey }) => {
    const { t } = useTranslation();
    const data: TurbineDetailType | undefined = turbineDetailData[turbineKey];

    // ERROR STATE (Glass Style)
    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <GlassCard className="text-center p-12 border-red-500/30 max-w-lg">
                    <div className="text-5xl mb-6 opacity-80">🚫</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('turbineDetail.notFoundTitle')}</h3>
                    <p className="text-slate-400 mb-8">
                        {t('turbineDetail.notFoundDesc')} <span className="text-cyan-400 font-mono bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/30">'{turbineKey}'</span>
                    </p>
                    <BackButton text={t('turbineDetail.returnButton')} />
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-12 space-y-8">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <BackButton text={t('actions.back')} />
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
                    {t('turbineDetail.rev')}
                </div>
            </div>

            {/* HERO HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up py-4">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{turbineKey}</span> {t('turbineDetail.specification')}
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
                    {t('turbineDetail.subtitle')}
                </p>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* MECHANICAL COLUMN */}
                <div className="animate-slide-in-left">
                    <GlassCard
                        title={t('turbineDetail.mechanicalSystems')}
                        subtitle={t('turbineDetail.rotatingParts')}
                        className="h-full shadow-cyan-900/10"
                        action={<span className="text-2xl p-2 bg-cyan-500/10 rounded-lg text-cyan-400">⚙️</span>}
                    >
                        <div className="space-y-4 mt-2">
                            {data.mechanical.map((comp) => (
                                <ComponentCard key={comp.name} {...comp} />
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* ELECTRICAL COLUMN */}
                <div className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
                    <GlassCard
                        title={t('turbineDetail.electricalComponents')}
                        subtitle={t('turbineDetail.generatorControl')}
                        className="h-full shadow-purple-900/10"
                        action={<span className="text-2xl p-2 bg-purple-500/10 rounded-lg text-purple-400">⚡</span>}
                    >
                        <div className="space-y-4 mt-2">
                            {data.electrical.map((comp) => (
                                <ComponentCard key={comp.name} {...comp} />
                            ))}
                        </div>
                    </GlassCard>
                </div>

            </div>

            {/* COOLING SYSTEM MONITORING (MASTER LINKAGE) */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <GlassCard
                    title={t('turbineDetail.coolingSystemTitle', 'Cooling System Monitoring')}
                    subtitle={t('turbineDetail.coolingSystemSubtitle', 'Real-time Heat Exchanger Performance')}
                    className="border-l-4 border-l-emerald-500"
                    action={<span className="text-2xl p-2 bg-emerald-500/10 rounded-lg text-emerald-400">💧</span>}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('turbineDetail.coolingPressure', 'Pressure Dynamics')}</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">{t('turbineDetail.inlet', 'Inlet')}</p>
                                    <p className="text-2xl font-black text-white">4.2 <span className="text-xs text-slate-500">bar</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">{t('turbineDetail.outlet', 'Outlet')}</p>
                                    <p className="text-2xl font-black text-white">3.8 <span className="text-xs text-slate-500">bar</span></p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[90%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('turbineDetail.coolingTemp', 'Thermal Gradient')}</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">{t('turbineDetail.inlet', 'Inlet')}</p>
                                    <p className="text-2xl font-black text-white">12.4 <span className="text-xs text-slate-500">°C</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">{t('turbineDetail.outlet', 'Outlet')}</p>
                                    <p className="text-2xl font-black text-white">24.6 <span className="text-xs text-slate-500">°C</span></p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[45%]"></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/60 p-5 rounded-2xl border-2 border-emerald-500/20 flex flex-col justify-center items-center text-center">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('turbineDetail.deltaT', 'SYSTEM DELTA T')}</h4>
                            <div className="text-4xl font-black text-white mb-1">12.2°C</div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">{t('turbineDetail.optimal', 'OPTIMAL')}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-2 font-medium italic">
                                {t('turbineDetail.coolingEfficiencyNote', 'Efficiency within TurbineFactory parameters (+/- 0.5%)')}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* FOOTER NOTE */}
            <div className="text-center pt-8 border-t border-white/5">
                <p className="text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse"></span>
                    {t('turbineDetail.criticalityNote')}
                </p>
            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.