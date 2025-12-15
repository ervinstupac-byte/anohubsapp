import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // <--- IMPORT ZA JEZIK
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import type { AppView } from '../types.ts';

// --- STATS COMPONENT ---
const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center hover:border-slate-500 transition-colors shadow-lg">
        <div className={`text-2xl mb-1 ${color}`}>{icon}</div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
);

export const Hub: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation(); // <--- HOOK ZA PRIJEVOD
    
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
                blocks: 0, 
                audits: 0, 
                designs: designCount || 0
            });
        };
        fetchStats();
    }, [user]);

    // Definiramo module unutar komponente kako bi 't' funkcija radila
    const modules = [
        // --- CORE OPERATIONS ---
        { 
            id: 'riskAssessment', 
            // Pokušaj prevesti, ako nema prijevoda koristi engleski (fallback)
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

    // Grupiranje kategorija (koristimo prijevode ako su dostupni u 'category' polju iznad)
    // Moramo paziti da stringovi odgovaraju onima u modules arrayu
    const categories = [
        t('hub.operationalModules', 'Core Operations'), 
        'Strategic Intelligence', 
        'Knowledge & Culture'
    ];

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            
            {/* HERO SECTION */}
            <div className="text-center space-y-4 py-8">
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight">
                    AnoHUB
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                    {t('hub.subtitle', 'Global Operating System for Hydropower Excellence.')}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                   <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 animate-pulse">
                        {t('hub.systemStatusOperational', 'OPERATIONAL')}
                   </span>
                   <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                        {t('hub.welcome', { name: user?.email?.split('@')[0] || 'Engineer' })}
                   </span>
                </div>
            </div>

            {/* LIVE STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <StatCard 
                    label={t('hub.risks', 'Risks Detected')} 
                    value={stats.risks} icon="🛡️" color="text-red-400" 
                />
                <StatCard 
                    label="Ledger Blocks" 
                    value={stats.blocks} icon="🔗" color="text-blue-400" 
                />
                <StatCard 
                    label="Install Audits" 
                    value={stats.audits} icon="🏗️" color="text-yellow-400" 
                />
                <StatCard 
                    label={t('hub.designs', 'Designs Saved')} 
                    value={stats.designs} icon="📐" color="text-cyan-400" 
                />
            </div>

            {/* MODULES GRID */}
            <div className="space-y-12">
                {categories.map((cat) => (
                    <div key={cat} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                            <span className="text-xl">
                                {cat === t('hub.operationalModules', 'Core Operations') ? '⚡' : cat === 'Strategic Intelligence' ? '🧠' : '📚'}
                            </span>
                            <h3 className="text-xl font-bold text-white">{cat}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.filter(m => m.category === cat).map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => navigateTo(module.id as AppView)}
                                    className={`
                                        group relative overflow-hidden rounded-2xl p-6 text-left border transition-all duration-300 hover:-translate-y-1 shadow-lg
                                        ${module.highlight 
                                            ? 'bg-gradient-to-br from-slate-800 to-cyan-900/30 border-cyan-500/50 hover:shadow-cyan-500/20' 
                                            : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'}
                                    `}
                                >
                                    {module.critical && (
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                            Critical
                                        </div>
                                    )}
                                    {module.highlight && (
                                        <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                            NEW
                                        </div>
                                    )}
                                    
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{module.icon}</div>
                                    <h4 className={`text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors ${module.highlight ? 'text-cyan-100' : 'text-slate-200'}`}>
                                        {module.title}
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {module.desc}
                                    </p>
                                    <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-cyan-500 transition-colors">
                                        {t('common.launch', 'Launch Module')} <span className="ml-1 text-lg">→</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-12 pb-6 border-t border-slate-800">
                <p className="text-slate-600 text-xs">{t('hub.subtitle', 'Global Standard of Excellence Enforcement Platform.')}</p>
                <p className="text-slate-700 text-[10px] mt-1">AnoHUB Cloud {t('common.version', 'v2.4.0 (Enterprise)')}</p>
            </div>
        </div>
    );
};