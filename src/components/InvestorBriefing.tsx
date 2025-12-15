import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // <--- IMPORT
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { generateFinancialReport } from '../utils/pdfGenerator.ts';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx';
import type { TurbineCategories } from '../types.ts';

interface InvestorBriefingProps {
    turbineCategories: TurbineCategories;
}

export const InvestorBriefing: React.FC<InvestorBriefingProps> = ({ turbineCategories }) => {
    const { navigateTo } = useNavigation();
    const { showToast } = useToast();
    const { selectedAsset } = useAssetContext();
    const { t } = useTranslation(); // <--- HOOK

    // --- STATE ---
    // Default values for financial model
    const [params, setParams] = useState({
        electricityPrice: 80, // EUR/MWh
        interestRate: 5,      // %
        lifespan: 30,         // Years
        opexPercent: 2        // % of CAPEX
    });

    const [kpis, setKpis] = useState({
        capex: 0,
        revenue: 0,
        opex: 0,
        roi: 0,
        lcoe: 0,
        payback: 0
    });

    // --- AUTOMATIC CALCULATION ---
    useEffect(() => {
        if (!selectedAsset) return;

        // 1. Get capacity from selected asset
        const powerMW = selectedAsset.capacity || 0; 
        
        // If no capacity (e.g. new location), use placeholder
        const effectivePower = powerMW > 0 ? powerMW : 10; 

        // 2. Basic engineering calculations (Rule of Thumb)
        const annualGenerationGWh = effectivePower * 8760 * 0.5; // 50% capacity factor
        const totalRevenue = annualGenerationGWh * 1000 * params.electricityPrice; // MWh * Price

        // Estimated CAPEX (e.g. 1.8M EUR per MW)
        const estimatedCapex = effectivePower * 1800000; 
        const annualOpex = estimatedCapex * (params.opexPercent / 100);

        // 3. Financial Indicators
        const cashFlow = totalRevenue - annualOpex;
        const roi = (cashFlow / estimatedCapex) * 100;
        const paybackPeriod = estimatedCapex / cashFlow;

        // LCOE = (Capex + Sum(Opex)) / Sum(Energy) - simplified
        const totalLifetimeCost = estimatedCapex + (annualOpex * params.lifespan);
        const totalLifetimeEnergy = annualGenerationGWh * 1000 * params.lifespan; // MWh
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
            <BackButton text={t('actions.back', 'Back to Hub')} />
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="space-y-4 flex-grow w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {t('investorBriefing.title').split(' ')[0]} <span className="text-purple-400">{t('investorBriefing.title').split(' ')[1]}</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        {t('investorBriefing.subtitle')}
                    </p>
                    
                    {/* ASSET PICKER INTEGRATED */}
                    <div className="max-w-md">
                        <AssetPicker />
                    </div>
                </div>
                
                <button
                    onClick={handleDownloadReport}
                    disabled={!selectedAsset}
                    className={`
                        flex items-center px-6 py-4 rounded-xl font-bold transition-all shadow-lg
                        ${selectedAsset 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white hover:-translate-y-1 shadow-purple-500/30' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                    `}
                >
                    <span className="mr-2 text-xl">📄</span> {t('investorBriefing.generateProspectus')}
                </button>
            </div>

            {!selectedAsset ? (
                <div className="p-12 border-2 border-dashed border-slate-700 rounded-2xl text-center">
                    <div className="text-5xl mb-4 opacity-30">💼</div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('investorBriefing.noAssetTitle')}</h3>
                    <p className="text-slate-400">{t('investorBriefing.noAssetDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: INPUTS */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>🎚️</span> {t('investorBriefing.marketAssumptions')}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('investorBriefing.electricityPrice')}</label>
                                    <input 
                                        type="number" 
                                        value={params.electricityPrice}
                                        onChange={(e) => setParams({...params, electricityPrice: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('investorBriefing.interestRate')}</label>
                                    <input 
                                        type="number" 
                                        value={params.interestRate}
                                        onChange={(e) => setParams({...params, interestRate: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('investorBriefing.projectLifespan')}</label>
                                    <input 
                                        type="number" 
                                        value={params.lifespan}
                                        onChange={(e) => setParams({...params, lifespan: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                            <h4 className="text-blue-300 font-bold text-sm mb-1">{t('investorBriefing.assetContext')}</h4>
                            <p className="text-xs text-slate-400">
                                {t('investorBriefing.calcBasedOn')} <strong className="text-white">{selectedAsset.capacity} MW</strong> {t('investorBriefing.capacity')} 
                                {t('investorBriefing.atLocation')} <strong className="text-white">{selectedAsset.location}</strong>.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: KPI DASHBOARD */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ROI CARD */}
                            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-purple-900/20 border border-purple-500/30">
                                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">{t('investorBriefing.roi')}</p>
                                <div className="text-4xl font-black text-white mb-1">{kpis.roi.toFixed(1)}%</div>
                                <p className="text-xs text-slate-400">{t('investorBriefing.annualizedYield')}</p>
                            </div>

                            {/* LCOE CARD */}
                            <div className="glass-panel p-6 rounded-2xl bg-slate-800 border border-slate-700">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('investorBriefing.lcoe')}</p>
                                <div className="text-4xl font-black text-white mb-1">€{kpis.lcoe.toFixed(2)}</div>
                                <p className="text-xs text-slate-500">{t('investorBriefing.perMwh')}</p>
                            </div>

                            {/* REVENUE CARD */}
                            <div className="glass-panel p-6 rounded-2xl bg-slate-800 border border-slate-700">
                                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">{t('investorBriefing.annualRevenue')}</p>
                                <div className="text-2xl font-bold text-white mb-1">€{(kpis.revenue / 1000000).toFixed(2)}M</div>
                                <p className="text-xs text-slate-500">{t('investorBriefing.grossIncome')}</p>
                            </div>

                            {/* PAYBACK CARD */}
                            <div className="glass-panel p-6 rounded-2xl bg-slate-800 border border-slate-700">
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">{t('investorBriefing.paybackPeriod')}</p>
                                <div className="text-2xl font-bold text-white mb-1">{kpis.payback.toFixed(1)} Yrs</div>
                                <p className="text-xs text-slate-500">{t('investorBriefing.breakEven')}</p>
                            </div>
                        </div>

                        {/* CHART VISUALIZATION (Simple CSS Bar) */}
                        <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                            <h3 className="text-sm font-bold text-white mb-6">{t('investorBriefing.financialStructure')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{t('investorBriefing.revenueInflow')}</span>
                                        <span className="text-green-400 font-mono">€{(kpis.revenue / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{t('investorBriefing.opexOutflow')}</span>
                                        <span className="text-red-400 font-mono">€{(kpis.opex / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(kpis.opex / kpis.revenue) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestorBriefing;