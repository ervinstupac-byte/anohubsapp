import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import type { AppView } from '../types.ts';

// --- 1. MODERN STAT CARD (Glassmorphism & HUD Style) ---
const StatCard: React.FC<{ label: string; value: string | number; icon: string; trend?: string; color: string }> = ({ label, value, icon, color, trend }) => (
    <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex justify-between items-start relative z-10">
            <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</div>
                <div className="text-3xl font-black text-white tracking-tight font-sans">{value}</div>
            </div>
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 ${color} text-xl backdrop-blur-sm border border-white/5 shadow-inner`}>{icon}</div>
        </div>
        {trend && (
            <div className="mt-3 text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                <span className="text-xs">↗</span> {trend}
            </div>
        )}
    </div>
);

// --- 2. BENTO GRID MODULE CARD (High-End Interaction) ---
const ModuleCard: React.FC<{ 
    module: any; 
    onClick: () => void; 
    t: any 
}> = ({ module, onClick, t }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex flex-col h-full text-left p-6 rounded-3xl border transition-all duration-500 w-full overflow-hidden
                ${module.highlight 
                    ? 'bg-gradient-to-br from-slate-900/90 to-cyan-950/60 border-cyan-500/30 shadow-[0_0_40px_-10px_rgba(8,145,178,0.3)]' 
                    : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'}
                backdrop-blur-md
            `}
        >
            {/* Hover Spotlight Effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/0 via-cyan-400/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
            
            {/* Status Tags */}
            <div className="absolute top-5 right-5 flex gap-2 z-20">
                {module.critical && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/> CRITICAL
                    </span>
                )}
                {module.highlight && (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        NEW
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/0 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/5 shadow-lg ${module.highlight ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {module.icon}
                </div>
                
                <h4 className={`text-xl font-bold mb-2 tracking-tight ${module.highlight ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {module.title}
                </h4>
                
                <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-2 mb-6 group-hover:text-slate-300 transition-colors">
                    {module.desc}
                </p>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">
                    {t('common.launch', 'Launch Interface')} 
                    <svg className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
        </button>
    );
};

export const Hub: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation();
    
    // Stats State
    const [stats, setStats] = useState({
        risks: 0,
        blocks: 0,
        audits: 0,
        designs: 0
    });

    // Fetch live stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            
            // 1. Risk Assessments count
            const { count: riskCount } = await supabase.from('risk_assessments').select('*', { count: 'exact', head: true });
            
            // 2. Designs count
            const { count: designCount } = await supabase.from('turbine_designs').select('*', { count: 'exact', head: true });
            
            setStats({
                risks: riskCount || 0,
                blocks: 142, // Mock data for visual appeal
                audits: 12,  // Mock data for visual appeal
                designs: designCount || 0
            });
        };
        fetchStats();
    }, [user]);

    // --- FULL MODULES LIST (COMPLETE) ---
    const modules = [
        // --- CORE OPERATIONS ---
        { 
            id: 'riskAssessment', 
            title: t('modules.riskAssessment', 'Risk Assessment'), 
            icon: '🛡️', 
            desc: 'Complete diagnostic tool to identify the Execution Gap.', 
            category: t('hub.operationalModules', 'Core Operations'), 
            critical: true 
        },
        { 
            id: 'installationGuarantee', 
            title: t('modules.installationGuarantee', 'Installation Standard'), 
            icon: '🏗️', 
            desc: 'The 0.05 mm/m protocol. Non-negotiable precision.', 
            category: t('hub.operationalModules', 'Core Operations'), 
            critical: true 
        },
        { 
            id: 'hppBuilder', 
            title: t('modules.hppBuilder', 'HPP Design Studio'), 
            icon: '⚡', 
            desc: 'Physics-based turbine selection and calculation.', 
            category: t('hub.operationalModules', 'Core Operations') 
        },
        { 
            id: 'globalMap', 
            title: t('modules.globalMap', 'Global Asset Map'), 
            icon: '🌍', 
            desc: 'Geospatial intelligence and live status monitoring.', 
            category: t('hub.operationalModules', 'Core Operations') 
        },

        // --- STRATEGIC INTELLIGENCE ---
        { 
            id: 'riskReport', 
            title: t('modules.riskReport', 'Master Project Dossier'), 
            icon: '🗂️', 
            desc: 'Consolidated Enterprise Report (Risks + Design + Financials).', 
            category: 'Strategic Intelligence', 
            highlight: true
        },
        { 
            id: 'investorBriefing', 
            title: t('modules.investorBriefing', 'Investor Briefing'), 
            icon: '📊', 
            desc: 'Financial KPIs and Risk Impact Analysis.', 
            category: 'Strategic Intelligence' 
        },
        { 
            id: 'contractManagement', 
            title: t('modules.contractManagement', 'Contract & Legal'), 
            icon: '⚖️', 
            desc: 'Warranty protection via data compliance.', 
            category: 'Strategic Intelligence' 
        },
        { 
            id: 'digitalIntegrity', 
            title: t('modules.digitalIntegrity', 'Digital Integrity'), 
            icon: '🔗', 
            desc: 'Blockchain ledger for immutable data proof.', 
            category: 'Strategic Intelligence', 
            critical: true 
        },
        { 
            id: 'revitalizationStrategy', 
            title: t('modules.revitalizationStrategy', 'Revitalization Strategy'), 
            icon: '♻️', 
            desc: 'Closing the M-E Synergy Gap in legacy assets.', 
            category: 'Strategic Intelligence' 
        },

        // --- KNOWLEDGE & CULTURE ---
        { 
            id: 'library', 
            title: t('modules.library', 'Component Library'), 
            icon: '📚', 
            desc: 'Technical encyclopedia. KPIs and failure modes.', 
            category: 'Knowledge & Culture' 
        },
        { 
            id: 'standardOfExcellence', 
            title: t('modules.standardOfExcellence', 'Standard of Excellence'), 
            icon: '🏅', 
            desc: 'Masterclass modules for eliminating the Execution Gap.', 
            category: 'Knowledge & Culture' 
        },
        { 
            id: 'phaseGuide', 
            title: t('modules.phaseGuide', 'Project Phase Guide'), 
            icon: '📅', 
            desc: 'Step-by-step enforcement of the Three Postulates.', 
            category: 'Knowledge & Culture' 
        },
        { 
            id: 'hppImprovements', 
            title: t('modules.hppImprovements', 'HPP Ino-Hub'), 
            icon: '💡', 
            desc: 'Innovations supporting LCC Optimization.', 
            category: 'Knowledge & Culture' 
        },
        { 
            id: 'riverWildlife', 
            title: t('modules.riverWildlife', 'River & Wildlife'), 
            icon: '🐟', 
            desc: 'Ethical mandate for Ecosystem Protection.', 
            category: 'Knowledge & Culture' 
        },
        { 
            id: 'genderEquity', 
            title: t('modules.genderEquity', 'Gender Equity'), 
            icon: '👥', 
            desc: 'Inclusive strategies for human capital.', 
            category: 'Knowledge & Culture' 
        },
        { 
            id: 'digitalIntroduction', 
            title: t('modules.digitalIntroduction', 'Digital Introduction'), 
            icon: '📱', 
            desc: 'Core principles of the AnoHUB philosophy.', 
            category: 'Knowledge & Culture' 
        },
    ];

    // Grupiranje kategorija
    const categories = [
        t('hub.operationalModules', 'Core Operations'), 
        'Strategic Intelligence', 
        'Knowledge & Culture'
    ];

    return (
        <div className="animate-fade-in pb-20">
            {/* HERO SECTION */}
            <div className="relative py-16 mb-12 text-center overflow-visible">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
                
                <h1 className="relative text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-500 tracking-tighter mb-6 drop-shadow-2xl">
                    AnoHUB
                </h1>
                <p className="relative text-slate-400 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto">
                    {t('hub.subtitle', 'Global Operating System for Hydropower Excellence.')}
                </p>
                
                <div className="relative flex justify-center gap-4 mt-8">
                   <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl shadow-lg shadow-emerald-900/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        {t('hub.systemStatusOperational', 'OPERATIONAL')}
                   </div>
                   <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl">
                        {t('hub.welcome', { name: user?.email?.split('@')[0] || 'Engineer' })}
                   </div>
                </div>
            </div>

            {/* LIVE STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20 px-6">
                <StatCard 
                    label={t('hub.risks', 'Active Risks')} 
                    value={stats.risks} icon="🛡️" color="text-rose-400" 
                    trend="+2.4%" 
                />
                <StatCard 
                    label="Ledger Blocks" 
                    value={stats.blocks} icon="🔗" color="text-indigo-400" 
                />
                <StatCard 
                    label="Install Audits" 
                    value={stats.audits} icon="🏗️" color="text-amber-400" 
                />
                <StatCard 
                    label={t('hub.designs', 'Designs Saved')} 
                    value={stats.designs} icon="📐" color="text-cyan-400" 
                    trend="+12%" 
                />
            </div>

            {/* BENTO GRID MODULES */}
            <div className="max-w-8xl mx-auto space-y-24 px-6">
                {categories.map((cat) => (
                    <div key={cat} className="space-y-8">
                        <div className="flex items-end gap-6 px-2">
                            <h3 className="text-3xl font-bold text-white tracking-tighter">{cat}</h3>
                            <div className="h-px flex-grow bg-gradient-to-r from-slate-800 via-slate-700 to-transparent mb-2"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[1fr]">
                            {modules.filter(m => m.category === cat).map((module) => (
                                <div key={module.id} className={module.highlight ? 'md:col-span-2' : ''}>
                                    <ModuleCard 
                                        module={module} 
                                        onClick={() => navigateTo(module.id as AppView)}
                                        t={t}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="text-center pt-32 pb-12 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    AnoHUB Cloud {t('common.version', 'v2.5.0 (Enterprise)')} • Engineered for Perfection
                </p>
            </div>
        </div>
    );
};