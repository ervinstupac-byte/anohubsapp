import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';

import { GlassCard } from '../shared/components/ui/GlassCard';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const ComponentLibrary: React.FC = () => {
    const { t } = useTranslation();

    const COMPONENT_IDS = [
        'design', 'miv', 'rotor', 'guide_vanes', 'shaft_sealing',
        'bearings', 'generator', 'control_system', 'hydraulic_system',
        'lubrication_system', 'cooling_system'
    ];

    const [selectedId, setSelectedId] = useState<string>(COMPONENT_IDS[0]);

    // Data fetching via i18n
    const getComponentData = (id: string) => {
        const kpis = t(`componentLibrary.components.${id}.kpis`, { returnObjects: true });
        const risks = t(`componentLibrary.components.${id}.risks`, { returnObjects: true });

        return {
            id,
            title: t(`componentLibrary.components.${id}.title`),
            description: t(`componentLibrary.components.${id}.description`),
            kpis: Array.isArray(kpis) ? kpis as string[] : [],
            risks: Array.isArray(risks) ? risks as { text: string; level: 'High' | 'Medium' | 'Low' }[] : []
        };
    };

    const selectedComponent = getComponentData(selectedId);

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-6 h-[calc(100vh-120px)] flex flex-col">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 pt-4">
                <div className="flex items-center gap-4">
                    <BackButton text={t('actions.back', 'Back to Hub')} />
                    <h2 className="text-3xl font-bold text-white tracking-tight hidden md:block">
                        {t('componentLibrary.title')} <span className="text-cyan-400">{t('componentLibrary.titleHighlight')}</span>
                    </h2>
                </div>
                <div className="px-4 py-1.5 bg-slate-900/50 rounded-full border border-slate-700 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {t('componentLibrary.criticalSystemsIndexed', { count: COMPONENT_IDS.length })}
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                {/* LEFT SIDEBAR (LIST) */}
                <div className="lg:col-span-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 h-full">
                    {COMPONENT_IDS.map((id) => (
                        <button
                            key={id}
                            onClick={() => setSelectedId(id)}
                            className={`
                                text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden
                                ${selectedId === id
                                    ? 'bg-gradient-to-r from-cyan-900/40 to-slate-900 border-cyan-500/50 shadow-lg'
                                    : 'bg-slate-900/40 border-white/5 hover:bg-slate-800 hover:border-white/10'}
                            `}
                        >
                            <div className="flex justify-between items-center relative z-10">
                                <h3 className={`font-bold text-sm transition-colors ${selectedId === id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {t(`componentLibrary.components.${id}.title`)}
                                </h3>
                                {selectedId === id && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></div>}
                            </div>
                            {/* Hover Effect */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 transition-all duration-300 ${selectedId === id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                        </button>
                    ))}
                </div>

                {/* RIGHT CONTENT (DETAILS) */}
                <div className="lg:col-span-8 h-full overflow-y-auto custom-scrollbar">
                    <GlassCard className="h-full flex flex-col border-t-4 border-t-cyan-500">

                        {/* TITLE & DESC */}
                        <div className="mb-8 border-b border-white/10 pb-6">
                            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{selectedComponent.title}</h2>
                            <p className="text-slate-300 text-lg leading-relaxed font-light">
                                {selectedComponent.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* KPIS */}
                            <div className="space-y-4">
                                <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <span className="text-lg">📊</span> {t('componentLibrary.performanceKpis')}
                                </h4>
                                <ul className="space-y-2">
                                    {selectedComponent.kpis.map((kpi, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                                            <span className="text-cyan-500 mt-1 w-1.5 h-1.5 rounded-full bg-cyan-500 block shadow-[0_0_5px_cyan]"></span>
                                            <span className="text-sm text-slate-200 font-medium">{kpi}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* RISKS */}
                            <div className="space-y-4">
                                <h4 className="text-red-400 font-bold uppercase text-xs tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <span className="text-lg">⚠️</span> {t('componentLibrary.riskVectors')}
                                </h4>
                                <ul className="space-y-2">
                                    {selectedComponent.risks.map((risk, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-red-900/10 p-3 rounded-lg border border-red-500/10 hover:border-red-500/30 transition-colors">
                                            <span className={`
                                                mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                                                ${risk.level === 'High' ? 'bg-red-500 shadow-[0_0_8px_red]' :
                                                    risk.level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}
                                            `}></span>
                                            <span className="text-sm text-slate-300 font-medium">{risk.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.
