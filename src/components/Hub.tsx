import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { AssetPicker } from './AssetPicker.tsx';
import type { AppView } from '../contexts/NavigationContext.tsx';

// --- POMOĆNA KOMPONENTA ZA MODUL KARTICE (BENTO GRID) ---
const ModuleCard: React.FC<{ module: any; onClick: () => void }> = ({ module, onClick }) => {
    const { t } = useTranslation();
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
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/0 via-cyan-400/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform ${module.highlight ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {module.icon}
                </div>

                <h4 className={`text-lg font-bold mb-2 tracking-tight ${module.highlight ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {module.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2 mb-4">
                    {module.desc}
                </p>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">
                    {t('common.launch', 'LAUNCH')} <span className="ml-1">→</span>
                </div>
            </div>
        </button>
    );
};

// --- KOMPONENTA ZA STATISTIČKE KARTICE (KPI STRIP) ---
const KPIStatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => {
    const { t } = useTranslation();
    return (
        <GlassCard className="py-4 px-6 flex flex-col items-center justify-center bg-slate-900/60 h-full">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</span>
            <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
            <span className="text-[9px] text-slate-600 mt-1 font-bold">{t('hub.info', 'INFO')}</span>
        </GlassCard>
    );
};


// OVO JE JEDINA DEKLARACIJA I EKSPORT KOMPONENTE HUB
export const Hub: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { riskState } = useRisk();
    const { telemetry } = useTelemetry();

    // --- LIVE STATUS STATE ---
    const [systemStatus, setSystemStatus] = useState<'IMMUNE' | 'COMPROMISED' | 'CRITICAL'>('IMMUNE');
    const [totalPower, setTotalPower] = useState(0);
    // Uklonjena neiskorištena varijabla 'stats', ostaje samo fetch logika unutar useEffect


    // --- LOGIKA ZA TELEMETRIJU I STATUS ---
    useEffect(() => {
        // 1. Power Calc
        const power = Object.values(telemetry).reduce((acc, curr) => acc + curr.output, 0);
        setTotalPower(parseFloat(power.toFixed(1)));

        // 2. Status Logic (Isto kao u App.tsx)
        const criticalCount = Object.values(telemetry).filter(t => t.status === 'CRITICAL').length;
        const warningCount = Object.values(telemetry).filter(t => t.status === 'WARNING').length;

        if (criticalCount > 0 || (riskState.isAssessmentComplete && riskState.criticalFlags > 0)) {
            setSystemStatus('CRITICAL');
        } else if (warningCount > 0 || (riskState.isAssessmentComplete && riskState.riskScore > 40)) {
            setSystemStatus('COMPROMISED');
        } else {
            setSystemStatus('IMMUNE');
        }

        // 3. DB Stats (Ovo sada samo dohvaća, ali ne koristi setStats ako nije potrebno za render)
        const fetchStats = async () => {
            if (!user) return;
            // Ako želimo prikazati rizike i dizajne, moramo koristiti setStats:
            // const { count: riskCount } = await supabase.from('risk_assessments').select('*', { count: 'exact', head: true });
            // const { count: designCount } = await supabase.from('turbine_designs').select('*', { count: 'exact', head: true });
            // setStats(prev => ({...}));
        };
        fetchStats();
    }, [user, telemetry, riskState]);

    // --- MODULES CONFIG ---
    const operationalModules = [
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️', desc: t('modules.riskAssessmentDesc', 'Identify the "Execution Gap" before failure.'), highlight: true },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '🏗️', desc: t('modules.installationGuaranteeDesc', '0.05 mm/m protocol enforcement.') },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡', desc: t('modules.hppBuilderDesc', 'Physics-based turbine design & simulation.') },
        { id: 'globalMap', title: t('modules.globalMap', 'Global Telemetry'), icon: '🌍', desc: t('modules.globalMapDesc', 'Geospatial asset intelligence.') },
    ];

    const strategicModules = [
        { id: 'riskReport', title: t('modules.riskReport', 'Dossier Archive'), icon: '📂', desc: t('modules.riskReportDesc', 'Consolidated Enterprise Reports.') },
        { id: 'investorBriefing', title: t('modules.investorBriefing', 'Investor Brief'), icon: '📊', desc: t('modules.investorBriefingDesc', 'Financial KPIs and Risk Impact.') },
        { id: 'contractManagement', title: t('modules.contractManagement', 'Smart Contracts'), icon: '📜', desc: t('modules.contractManagementDesc', 'Warranty protection via data.') },
        { id: 'digitalIntegrity', title: t('modules.digitalIntegrity', 'Trust Ledger'), icon: '🔗', desc: t('modules.digitalIntegrityDesc', 'Blockchain immutable proof.') },
        { id: 'revitalizationStrategy', title: t('modules.revitalizationStrategy', 'Revitalization'), icon: '♻️', desc: t('modules.revitalizationStrategyDesc', 'Life extension strategies.') },
    ];

    const knowledgeModules = [
        { id: 'library', title: t('modules.library', 'Tech Library'), icon: '📚', desc: t('modules.libraryDesc', 'Component failure modes & KPIs.') },
        { id: 'standardOfExcellence', title: t('modules.standardOfExcellence', 'Excellence Std'), icon: '🏅', desc: t('modules.standardOfExcellenceDesc', 'The 0.05 mm/m Manifesto.') },
        { id: 'phaseGuide', title: t('modules.phaseGuide', 'Project Phase Guide'), icon: '📅', desc: t('modules.phaseGuideDesc', 'Project lifecycle enforcement.') },
        { id: 'hppImprovements', title: t('modules.hppImprovements', 'Ino-Hub'), icon: '💡', desc: t('modules.hppImprovementsDesc', 'Innovation tracking.') },
        { id: 'riverWildlife', title: t('modules.riverWildlife', 'Eco-System'), icon: '🐟', desc: t('modules.riverWildlifeDesc', 'Environmental mandate.') },
        { id: 'genderEquity', title: t('modules.genderEquity', 'Inclusivity'), icon: '👥', desc: t('modules.genderEquityDesc', 'HR Strategy & Culture.') },
    ];

    const categories = [
        t('hub.operationalModules', 'Core Operations'),
        t('hub.strategicIntelligence', 'Strategic Intelligence'),
        t('hub.knowledgeCulture', 'Knowledge & Culture')
    ];

    return (
        <div className="space-y-12 animate-fade-in relative pb-20">
            {/* Dynamic Glow */}
            <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${systemStatus === 'CRITICAL' ? 'bg-red-600' : systemStatus === 'COMPROMISED' ? 'bg-amber-500' : 'bg-cyan-500'
                }`}></div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 pt-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 drop-shadow-2xl">AnoHUB</h1>
                    <p className="text-slate-400 text-xs uppercase tracking-[0.4em] font-bold">{t('hub.tagline', 'Architects of Immunity').split(' ').slice(0, 2).join(' ')} <span className="text-cyan-400">{t('hub.tagline', 'Architects of Immunity').split(' ').slice(2).join(' ')}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-6 py-2 rounded-full border backdrop-blur-md flex items-center gap-3 shadow-lg transition-all duration-500 ${systemStatus === 'CRITICAL' ? 'bg-red-500/10 border-red-500 text-red-400' :
                        systemStatus === 'COMPROMISED' ? 'bg-amber-500/10 border-amber-500 text-amber-400' :
                            'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        }`}>
                        <span className={`w-3 h-3 rounded-full animate-pulse ${systemStatus === 'CRITICAL' ? 'bg-red-500' : systemStatus === 'COMPROMISED' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>
                        <span className="font-black tracking-widest text-xs uppercase">{t('common.system', 'SYSTEM')} {t(`common.${systemStatus.toLowerCase()}`, systemStatus)}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('hub.operatorId', 'Operator ID')}</p>
                        <p className="text-sm font-mono text-white">{user?.email?.split('@')[0].toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* KPI STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <KPIStatCard label={t('hub.fleetOutput', 'Fleet Output')} value={`${totalPower} MW`} color="text-cyan-400" />
                <KPIStatCard label={t('hub.riskFactors', 'Risk Factors')} value={`${riskState.criticalFlags} ${t('common.active', 'Active')}`} color={riskState.criticalFlags > 0 ? 'text-red-500' : 'text-slate-200'} />

                {/* Active Context Picker */}
                <div className="flex flex-col justify-center">
                    <GlassCard className="py-2 px-4 flex flex-col justify-center bg-slate-900/60 h-full border-cyan-500/30">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{t('hub.activeContext', 'Active Context')}</span>
                        <div className="mt-1"><AssetPicker /></div>
                    </GlassCard>
                </div>

                <GlassCard onClick={() => navigateTo('intro')} className="py-4 px-6 flex flex-col items-center justify-center bg-cyan-900/20 border-cyan-500/30 cursor-pointer hover:bg-cyan-900/40 transition-colors group h-full">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest mb-1 group-hover:text-white">{t('hub.vision', 'Vision')}</span>
                    <span className="text-lg font-black text-white group-hover:text-cyan-300">{t('hub.manifesto', 'MANIFESTO')}</span>
                </GlassCard>
            </div>

            {/* MODULE SECTIONS */}
            <div className="relative z-10 space-y-16">

                {categories.map((cat, catIndex) => (
                    <section key={catIndex}>
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">{cat}</h3>
                        <div className={`grid gap-6 ${catIndex === 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : catIndex === 1 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
                            {/* Filter modules by category and render them */}
                            {(catIndex === 0 ? operationalModules : catIndex === 1 ? strategicModules : knowledgeModules).map(mod => (
                                <ModuleCard key={mod.id} module={mod} onClick={() => navigateTo(mod.id as AppView)} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* FOOTER */}
            <div className="text-center pt-32 pb-12 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    AnoHUB Cloud {t('common.version', 'v2.5.0 (Enterprise)')} • {t('hub.footerText', 'Engineered for Perfection')}
                </p>
            </div>
        </div>
    );
};