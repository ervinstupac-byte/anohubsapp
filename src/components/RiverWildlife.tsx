import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';

// Data moved inside component

// --- TYPES ---
interface SectionItem {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    content: React.ReactNode;
}

// --- COMPONENTS ---

const EcoModule: React.FC<{
    item: SectionItem;
    isOpen: boolean;
    onClick: () => void;
    delay: number;
}> = ({ item, isOpen, onClick, delay }) => (
    <div
        className={`
            group relative overflow-hidden rounded-2xl transition-all duration-500 animate-fade-in-up
            ${isOpen ? 'bg-slate-800/80 ring-1 ring-cyan-500/50 shadow-lg' : 'bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/60'}
            backdrop-blur-md
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 transition-colors relative z-10"
        >
            <div className="flex items-center gap-5">
                <div className={`
                    text-3xl p-3 rounded-xl transition-all duration-300 shadow-inner
                    ${isOpen ? 'bg-cyan-500/20 text-cyan-300 scale-110' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'}
                `}>
                    {item.icon}
                </div>
                <div>
                    <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-medium">{item.subtitle}</p>
                </div>
            </div>

            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border
                ${isOpen ? 'bg-cyan-500 text-slate-900 rotate-180 border-cyan-400' : 'bg-transparent border-slate-700 text-slate-500 group-hover:border-slate-500'}
            `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>

        <div className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 pt-0">
                <div className="pt-6 border-t border-white/10 animate-fade-in">
                    {item.content}
                </div>
            </div>
        </div>
    </div>
);

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const RiverWildlife: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const [openSectionId, setOpenSectionId] = useState<string | null>('fish_passage');

    const handleToggleSection = (sectionId: string) => {
        setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
    };

    // --- DATA STRUCTURE (Moved inside to access 't') ---
    const sectionsData = [
        {
            id: 'fish_passage',
            icon: '🐟',
            title: t('riverWildlife.sections.fish_passage.title'),
            subtitle: t('riverWildlife.sections.fish_passage.subtitle'),
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-light">
                        {t('riverWildlife.sections.fish_passage.intro')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <h4 className="font-bold text-cyan-400 mb-2">{t('riverWildlife.sections.fish_passage.ladders.title')}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{t('riverWildlife.sections.fish_passage.ladders.desc')}</p>
                        </div>
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <h4 className="font-bold text-cyan-400 mb-2">{t('riverWildlife.sections.fish_passage.lifts.title')}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{t('riverWildlife.sections.fish_passage.lifts.desc')}</p>
                        </div>
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <h4 className="font-bold text-cyan-400 mb-2">{t('riverWildlife.sections.fish_passage.bypass.title')}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{t('riverWildlife.sections.fish_passage.bypass.desc')}</p>
                        </div>
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <h4 className="font-bold text-cyan-400 mb-2">{t('riverWildlife.sections.fish_passage.turbines.title')}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{t('riverWildlife.sections.fish_passage.turbines.desc')}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'sediment_management',
            icon: '⛰️',
            title: t('riverWildlife.sections.sediment_management.title'),
            subtitle: t('riverWildlife.sections.sediment_management.subtitle'),
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 font-light">
                        {t('riverWildlife.sections.sediment_management.intro')}
                    </p>

                    {/* Techniques Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5">
                            <h4 className="font-bold text-white text-sm mb-1">{t('riverWildlife.sections.sediment_management.bypass.title')}</h4>
                            <p className="text-[10px] text-slate-400">{t('riverWildlife.sections.sediment_management.bypass.desc')}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5">
                            <h4 className="font-bold text-white text-sm mb-1">{t('riverWildlife.sections.sediment_management.flushing.title')}</h4>
                            <p className="text-[10px] text-slate-400">{t('riverWildlife.sections.sediment_management.flushing.desc')}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5">
                            <h4 className="font-bold text-white text-sm mb-1">{t('riverWildlife.sections.sediment_management.watershed.title')}</h4>
                            <p className="text-[10px] text-slate-400">{t('riverWildlife.sections.sediment_management.watershed.desc')}</p>
                        </div>
                    </div>

                    {/* WARNING BOXES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Visualization */}
                        <div className="p-5 border-l-2 border-amber-500 bg-amber-900/10 rounded-r-xl">
                            <h5 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
                                <span>📊</span> {t('riverWildlife.sections.sediment_management.vis.title')}
                            </h5>
                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-2">
                                <li><strong className="text-amber-100">Batimetrijska Snimanja:</strong> {t('riverWildlife.sections.sediment_management.vis.l1').split(':')[1]}</li>
                                <li><strong className="text-amber-100">3D Wear Scans:</strong> {t('riverWildlife.sections.sediment_management.vis.l2').split(':')[1]}</li>
                            </ul>
                        </div>

                        {/* RCFA Critical */}
                        <div className="p-5 border-l-2 border-red-500 bg-red-900/10 rounded-r-xl">
                            <h5 className="font-bold text-red-400 text-sm mb-3 flex items-center gap-2">
                                <span>⚠️</span> {t('riverWildlife.sections.sediment_management.rcfa.title')}
                            </h5>
                            <div className="space-y-2 text-xs text-slate-300">
                                <p><strong className="text-white">{t('riverWildlife.sections.sediment_management.rcfa.abrasion').split(':')[0]}:</strong> {t('riverWildlife.sections.sediment_management.rcfa.abrasion').split(':')[1]}</p>
                                <p><strong className="text-white">{t('riverWildlife.sections.sediment_management.rcfa.cavitation').split(':')[0]}:</strong> {t('riverWildlife.sections.sediment_management.rcfa.cavitation').split(':')[1]}</p>
                                <p className="italic text-red-300 mt-2 border-t border-red-500/20 pt-2">"{t('riverWildlife.sections.sediment_management.rcfa.quote')}"</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'water_quality',
            icon: '💧',
            title: t('riverWildlife.sections.water_quality.title'),
            subtitle: t('riverWildlife.sections.water_quality.subtitle'),
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 font-light">
                        {t('riverWildlife.sections.water_quality.intro')}
                    </p>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-cyan-900/20 to-transparent p-5 rounded-xl border-l-4 border-cyan-500 relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold text-cyan-300 mb-2">{t('riverWildlife.sections.water_quality.eflow.title')}</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {t('riverWildlife.sections.water_quality.eflow.desc')}
                                    <br /><span className="text-white font-bold block mt-2">{t('riverWildlife.sections.water_quality.eflow.mandate')}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                                <h4 className="font-bold text-white text-sm mb-1">{t('riverWildlife.sections.water_quality.aerating.title')}</h4>
                                <p className="text-xs text-slate-400">{t('riverWildlife.sections.water_quality.aerating.desc')}</p>
                            </div>
                            <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                                <h4 className="font-bold text-white text-sm mb-1">{t('riverWildlife.sections.water_quality.withdrawal.title')}</h4>
                                <p className="text-xs text-slate-400">{t('riverWildlife.sections.water_quality.withdrawal.desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'habitat_restoration',
            icon: '🌿',
            title: t('riverWildlife.sections.habitat_restoration.title'),
            subtitle: t('riverWildlife.sections.habitat_restoration.subtitle'),
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 font-light">
                        {t('riverWildlife.sections.habitat_restoration.intro')}
                    </p>
                    <div className="space-y-3">
                        {[
                            { title: t('riverWildlife.sections.habitat_restoration.gravel.title'), desc: t('riverWildlife.sections.habitat_restoration.gravel.desc') },
                            { title: t('riverWildlife.sections.habitat_restoration.riparian.title'), desc: t('riverWildlife.sections.habitat_restoration.riparian.desc') },
                            { title: t('riverWildlife.sections.habitat_restoration.structures.title'), desc: t('riverWildlife.sections.habitat_restoration.structures.desc') }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-900/20 transition-colors">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <div>
                                    <strong className="text-emerald-300 text-sm block mb-0.5">{item.title}</strong>
                                    <span className="text-slate-400 text-xs">{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-12 max-w-5xl mx-auto">

            {/* HERO HEADER */}
            <div className="relative text-center space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between absolute top-0 w-full px-4">
                    <BackButton text={t('actions.back')} />
                </div>

                <div className="pt-12">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
                        {t('riverWildlife.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">{t('riverWildlife.title').split(' ').slice(1).join(' ')}</span>
                    </h2>

                    {selectedAsset && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t('riverWildlife.context')} <span className="text-white font-bold">{selectedAsset.name}</span>
                        </div>
                    )}

                    <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        {t('riverWildlife.subtitle')}
                    </p>
                </div>
            </div>

            {/* MANDATE BANNER */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 p-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/80 to-slate-900/80 backdrop-blur-md"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center p-6 md:p-8 text-center md:text-left">
                    <div className="w-16 h-16 rounded-full bg-cyan-900/50 flex items-center justify-center text-4xl shadow-lg border border-cyan-500/30">
                        📜
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-lg font-bold text-cyan-300 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                            {t('riverWildlife.mandate')}
                            <span className="h-px w-10 bg-cyan-500/50 hidden md:block"></span>
                        </h4>
                        <p className="text-slate-300 leading-relaxed font-light">
                            <Trans i18nKey="riverWildlife.mandateDesc" components={{ strong: <strong className="text-white font-bold block mt-1" /> }} />
                        </p>
                    </div>
                </div>
            </div>

            {/* MODULES */}
            <div className="space-y-4">
                {sectionsData.map((section, index) => (
                    <EcoModule
                        key={section.id}
                        item={section}
                        isOpen={openSectionId === section.id}
                        onClick={() => handleToggleSection(section.id)}
                        delay={200 + (index * 100)}
                    />
                ))}
            </div>

        </div>
    );
};