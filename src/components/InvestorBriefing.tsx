import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
// import { useNavigation } UKLONJENO JER SE NE KORISTI
import { useToast } from '../contexts/ToastContext.tsx';
import { generateFinancialReport } from '../utils/pdfGenerator.ts';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx';
import { GlassCard } from './ui/GlassCard.tsx'; 
import { ModernInput } from './ui/ModernInput.tsx'; 
import { ModernButton } from './ui/ModernButton.tsx'; 

// Props interface prazan jer smo maknuli turbineCategories
interface InvestorBriefingProps {}

export const InvestorBriefing: React.FC<InvestorBriefingProps> = () => {
    // const { navigateTo } UKLONJENO
    const { showToast } = useToast();
    const { selectedAsset } = useAssetContext();
    const { t } = useTranslation();

    // --- STATE ---
    const [params, setParams] = useState({
        electricityPrice: 80, 
        interestRate: 5,      
        lifespan: 30,         
        opexPercent: 2        
    });

    const [kpis, setKpis] = useState({
        capex: 0,
        revenue: 0,
        opex: 0,
        roi: 0,
        lcoe: 0,
        payback: 0
    });

    // --- CALCULATION ---
    useEffect(() => {
        if (!selectedAsset) return;

        const powerMW = selectedAsset.capacity || 0; 
        const effectivePower = powerMW > 0 ? powerMW : 10; 

        const annualGenerationGWh = effectivePower * 8760 * 0.5; 
        const totalRevenue = annualGenerationGWh * 1000 * params.electricityPrice; 

        const estimatedCapex = effectivePower * 1800000; 
        const annualOpex = estimatedCapex * (params.opexPercent / 100);

        const cashFlow = totalRevenue - annualOpex;
        const roi = (cashFlow / estimatedCapex) * 100;
        const paybackPeriod = estimatedCapex / cashFlow;

        const totalLifetimeCost = estimatedCapex + (annualOpex * params.lifespan);
        const totalLifetimeEnergy = annualGenerationGWh * 1000 * params.lifespan; 
        const lcoe = totalLifetimeCost / totalLifetimeEnergy;

        setKpis({
            capex: estimatedCapex,
            revenue: totalRevenue,
            opex: annualOpex,
            roi: roi,
            lcoe: lcoe,
            payback: paybackPeriod
        });

    }, [selectedAsset, params]);

    // --- PDF GENERATION ---
    const handleDownloadReport = () => {
        if (!selectedAsset) {
            showToast('Please select an asset first.', 'warning');
            return;
        }

        generateFinancialReport(
            selectedAsset.name,
            {
                lcoe: `€${kpis.lcoe.toFixed(2)} / MWh`,
                roi: `${kpis.roi.toFixed(1)}%`,
                capex: `€${(kpis.capex / 1000000).toFixed(1)}M`
            }
        );
        showToast(t('investorBriefing.downloaded', 'Financial Briefing Downloaded'), 'success');
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
            
            {/* HERO HEADER */}
            <div className="text-center space-y-6 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full max-w-7xl px-4">
                    <BackButton text={t('actions.back', 'Back to Hub')} />
                </div>
                
                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {t('investorBriefing.title', 'Investor Briefing').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t('investorBriefing.title', 'Investor Briefing').split(' ')[1]}</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                        {t('investorBriefing.subtitle', 'Financial KPIs and Risk Impact Analysis.')}
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <AssetPicker />
                </div>
            </div>

            {!selectedAsset ? (
                <GlassCard className="text-center py-20 border-dashed border-slate-700">
                    <div className="text-6xl mb-6 opacity-20 grayscale">💼</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('investorBriefing.noAssetTitle')}</h3>
                    <p className="text-slate-400">{t('investorBriefing.noAssetDesc')}</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    
                    {/* LEFT COLUMN: ASSUMPTIONS */}
                    <div className="space-y-6">
                        <GlassCard 
                            title={t('investorBriefing.marketAssumptions')} 
                            className="bg-slate-900/60"
                            action={<span className="text-xl">🎚️</span>}
                        >
                            <div className="space-y-4">
                                <ModernInput 
                                    label={t('investorBriefing.electricityPrice')}
                                    type="number"
                                    value={params.electricityPrice}
                                    onChange={(e) => setParams({...params, electricityPrice: parseFloat(e.target.value) || 0})}
                                    icon={<span>€</span>}
                                />
                                <ModernInput 
                                    label={t('investorBriefing.interestRate')}
                                    type="number"
                                    value={params.interestRate}
                                    onChange={(e) => setParams({...params, interestRate: parseFloat(e.target.value) || 0})}
                                    icon={<span>%</span>}
                                />
                                <ModernInput 
                                    label={t('investorBriefing.projectLifespan')}
                                    type="number"
                                    value={params.lifespan}
                                    onChange={(e) => setParams({...params, lifespan: parseFloat(e.target.value) || 0})}
                                    icon={<span>📅</span>}
                                />
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <h4 className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">{t('investorBriefing.assetContext')}</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {t('investorBriefing.calcBasedOn')} <strong className="text-white">{selectedAsset.capacity} MW</strong> {t('investorBriefing.capacity')} 
                                    <br/>{t('investorBriefing.atLocation')} <strong className="text-white">{selectedAsset.location}</strong>.
                                </p>
                            </div>
                        </GlassCard>
                    </div>

                    {/* RIGHT COLUMN: KPI DASHBOARD */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* ROI CARD (Premium) */}
                            <GlassCard className="bg-gradient-to-br from-purple-900/40 to-slate-900 border-purple-500/30">
                                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">{t('investorBriefing.roi')}</p>
                                <div className="text-5xl font-black text-white tracking-tighter mb-1">{kpis.roi.toFixed(1)}%</div>
                                <p className="text-xs text-slate-400">{t('investorBriefing.annualizedYield')}</p>
                            </GlassCard>

                            {/* LCOE CARD */}
                            <GlassCard>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('investorBriefing.lcoe')}</p>
                                <div className="text-4xl font-black text-white mb-1">€{kpis.lcoe.toFixed(2)}</div>
                                <p className="text-xs text-slate-500">{t('investorBriefing.perMwh')}</p>
                            </GlassCard>

                            {/* REVENUE CARD */}
                            <GlassCard>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('investorBriefing.annualRevenue')}</p>
                                <div className="text-3xl font-black text-white mb-1">€{(kpis.revenue / 1000000).toFixed(2)}M</div>
                                <p className="text-xs text-slate-500">{t('investorBriefing.grossIncome')}</p>
                            </GlassCard>

                            {/* PAYBACK CARD */}
                            <GlassCard>
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">{t('investorBriefing.paybackPeriod')}</p>
                                <div className="text-3xl font-black text-white mb-1">{kpis.payback.toFixed(1)} Yrs</div>
                                <p className="text-xs text-slate-500">{t('investorBriefing.breakEven')}</p>
                            </GlassCard>
                        </div>

                        {/* FINANCIAL STRUCTURE & DOWNLOAD */}
                        <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="w-full space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wider">
                                        <span className="text-slate-400">{t('investorBriefing.revenueInflow')}</span>
                                        <span className="text-emerald-400">€{(kpis.revenue / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wider">
                                        <span className="text-slate-400">{t('investorBriefing.opexOutflow')}</span>
                                        <span className="text-red-400">€{(kpis.opex / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(kpis.opex / kpis.revenue) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <ModernButton 
                                onClick={handleDownloadReport}
                                variant="primary"
                                className="min-w-[220px] shadow-purple-500/20"
                                icon={<span>📄</span>}
                            >
                                {t('investorBriefing.generateProspectus')}
                            </ModernButton>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};