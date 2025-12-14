import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { HUB_TOOLS } from '../constants.ts';
import type { HubTool } from '../types.ts';

export const Hub: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { user } = useAuth();
    
    // --- DASHBOARD STATS STATE ---
    const [stats, setStats] = useState({
        riskCount: 0,
        ledgerBlocks: 0,
        installAudits: 0,
        designs: 0, // NOVO: Brojač dizajna
        systemStatus: 'CONNECTING...'
    });

    // --- FETCH LIVE DATA ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Count Risk Assessments
                const { count: riskCount } = await supabase
                    .from('risk_assessments')
                    .select('*', { count: 'exact', head: true });

                // 2. Count Ledger Blocks
                const { count: ledgerCount } = await supabase
                    .from('digital_integrity_ledger')
                    .select('*', { count: 'exact', head: true });

                // 3. Count Install Audits
                const { count: installCount } = await supabase
                    .from('installation_audits')
                    .select('*', { count: 'exact', head: true });

                // 4. Count Designs (NOVO)
                const { count: designCount } = await supabase
                    .from('turbine_designs')
                    .select('*', { count: 'exact', head: true });

                setStats({
                    riskCount: riskCount || 0,
                    ledgerBlocks: ledgerCount || 0,
                    installAudits: installCount || 0,
                    designs: designCount || 0,
                    systemStatus: 'OPERATIONAL'
                });

            } catch (error) {
                console.error('Dashboard error:', error);
                setStats(prev => ({ ...prev, systemStatus: 'OFFLINE' }));
            }
        };

        fetchStats();
    }, []);

    const { t } = useTranslation();

    // Formatiranje imena iz emaila (npr. ervin.stupac -> Ervin)
    const displayName = user?.email ? user.email.split('@')[0].split('.')[0] : 'Engineer';
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-10">
            
            {/* --- HERO SECTION (Mission Control) --- */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-8 md:p-12">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${stats.systemStatus === 'OPERATIONAL' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-xs font-mono text-cyan-400 tracking-widest">{stats.systemStatus}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                            {t('hub.welcome', { name: formattedName })}
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            {t('hub.subtitle')}
                        </p>
                    </div>
                    
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">AnoHUB Cloud</p>
                        <p className="text-xl font-mono text-white">{t('common.version')}</p>
                    </div>
                </div>

                {/* --- LIVE METRICS GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                    {/* CARD 1: RISK */}
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-2xl p-4 backdrop-blur-sm hover:border-red-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Risks</span>
                            <span className="text-xl">🛡️</span>
                        </div>
                        <div className="text-3xl font-black text-white">{stats.riskCount}</div>
                    </div>

                    {/* CARD 2: BLOCKCHAIN */}
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-2xl p-4 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Blocks</span>
                            <span className="text-xl">🔗</span>
                        </div>
                        <div className="text-3xl font-black text-white">{stats.ledgerBlocks}</div>
                    </div>

                    {/* CARD 3: AUDITS */}
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-2xl p-4 backdrop-blur-sm hover:border-green-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Audits</span>
                            <span className="text-xl">🏗️</span>
                        </div>
                        <div className="text-3xl font-black text-white">{stats.installAudits}</div>
                    </div>

                     {/* CARD 4: DESIGNS (NOVO) */}
                     <div className="bg-slate-800/50 border border-slate-600/50 rounded-2xl p-4 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Designs</span>
                            <span className="text-xl">📐</span>
                        </div>
                        <div className="text-3xl font-black text-white">{stats.designs}</div>
                    </div>
                </div>
            </div>

            {/* --- TOOLS GRID (Original Navigation) --- */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white border-l-4 border-cyan-500 pl-4">{t('hub.operationalModules')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HUB_TOOLS.map((tool: HubTool, index: number) => (
                        <div
                            key={tool.id}
                            onClick={() => navigateTo(tool.view)}
                            className="group relative bg-slate-800/40 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Hover Gradient Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/10 transition-all duration-500"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-600 group-hover:border-cyan-500/50 text-3xl shadow-lg">
                                        {tool.icon}
                                    </div>
                                    {tool.isCritical && (
                                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/30">
                                            Critical
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                                    {tool.title}
                                </h3>
                                
                                <p className="text-sm text-slate-400 leading-relaxed flex-grow group-hover:text-slate-300">
                                    {tool.description}
                                </p>

                                <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center text-xs font-bold text-cyan-600 group-hover:text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    {t('common.launch')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};