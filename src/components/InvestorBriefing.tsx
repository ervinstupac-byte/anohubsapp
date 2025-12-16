import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { createFinancialReportBlob, openAndDownloadBlob } from '../utils/pdfGenerator.ts';
// ISPRAVKA IMPORTA: Uvozimo AssetPicker kao komponentu
import { AssetPicker } from './AssetPicker.tsx';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// Ključ koji koristi HPP Builder za spremanje
const LOCAL_STORAGE_KEY_HPP = 'hpp-builder-settings';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const InvestorBriefing: React.FC = () => {
    const { showToast } = useToast();
    const { selectedAsset } = useAssetContext();
    const { t } = useTranslation();

    // --- STATE ---
    const [importedDesign, setImportedDesign] = useState<any>(null);

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
        payback: 0,
        powerMW: 0,
        energyGWh: 0
    });

    // --- 1. IMPORT HPP DESIGN (Auto-Link) ---
    useEffect(() => {
        try {
            const savedHPP = localStorage.getItem(LOCAL_STORAGE_KEY_HPP);
            if (savedHPP) {
                const design = JSON.parse(savedHPP);
                setImportedDesign(design);
                console.log("🔗 Financial Module linked with HPP Design Studio.");
            }
        } catch (e) {
            console.error("Failed to link HPP Design", e);
        }
    }, []);

    // --- 2. TECHNO-ECONOMIC CALCULATION ENGINE ---
    useEffect(() => {
        // Ako imamo odabran asset, koristimo njegov kapacitet.
        // AKO NEMAMO, ali imamo HPP Dizajn, koristimo dizajn! (Smart Fallback)

        let powerMW = selectedAsset?.capacity || 0;
        let annualGenerationGWh = 0;

        // "Neural Link" logika: Preuzmi podatke iz HPP Buildera ako postoje
        if (importedDesign && !selectedAsset) {
            // Ponovni izračun fizike iz HPP parametara
            const { head, flow, efficiency } = importedDesign;
            powerMW = (9.81 * head * flow * (efficiency / 100)) / 1000;
        }

        // Ako i dalje nemamo snagu, koristi default
        const effectivePower = powerMW > 0 ? powerMW : 10;

        // Izračun energije (GWh)
        if (importedDesign && !selectedAsset) {
            // Koristimo logiku iz HPP Buildera za GWh
            const capacityFactor = importedDesign.flowVariation === 'stable' ? 0.85 : 0.6;
            annualGenerationGWh = (effectivePower * 8760 * capacityFactor) / 1000;
        } else {
            // Generička procjena (50% capacity factor)
            annualGenerationGWh = effectivePower * 8760 * 0.5 / 1000;
        }

        // FINANCIJSKA MATEMATIKA
        const totalRevenue = annualGenerationGWh * 1000 * params.electricityPrice;

        // Empirijska formula za CAPEX (1.8M EUR po MW)
        const estimatedCapex = effectivePower * 1800000;
        const annualOpex = estimatedCapex * (params.opexPercent / 100);

        const cashFlow = totalRevenue - annualOpex;
        const roi = estimatedCapex > 0 ? (cashFlow / estimatedCapex) * 100 : 0;
        const paybackPeriod = cashFlow > 0 ? estimatedCapex / cashFlow : 0;

        const totalLifetimeCost = estimatedCapex + (annualOpex * params.lifespan);
        const totalLifetimeEnergy = annualGenerationGWh * 1000 * params.lifespan;
        const lcoe = totalLifetimeEnergy > 0 ? totalLifetimeCost / totalLifetimeEnergy : 0;

        setKpis({
            capex: estimatedCapex,
            revenue: totalRevenue,
            opex: annualOpex,
            roi: roi,
            lcoe: lcoe,
            payback: paybackPeriod,
            powerMW: effectivePower,
            energyGWh: annualGenerationGWh
        });

    }, [selectedAsset, params, importedDesign]);

    // --- PDF GENERATION ---
    const handleDownloadReport = () => {
        const assetName = selectedAsset?.name || (importedDesign ? "HPP Concept Design" : "Generic Project");

        const blob = createFinancialReportBlob(
            assetName,
            {
                lcoe: `€${kpis.lcoe.toFixed(2)} / MWh`,
                roi: `${kpis.roi.toFixed(1)}%`,
                capex: `€${(kpis.capex / 1000000).toFixed(1)}M`
            }
        );
        openAndDownloadBlob(blob, 'financial_briefing.pdf');
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

            {/* MAIN GRID */}
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
                                onChange={(e) => setParams({ ...params, electricityPrice: parseFloat(e.target.value) || 0 })}
                                icon={<span>€</span>}
                            />
                            <ModernInput
                                label={t('investorBriefing.interestRate')}
                                type="number"
                                value={params.interestRate}
                                onChange={(e) => setParams({ ...params, interestRate: parseFloat(e.target.value) || 0 })}
                                icon={<span>%</span>}
                            />
                            <ModernInput
                                label={t('investorBriefing.projectLifespan')}
                                type="number"
                                value={params.lifespan}
                                onChange={(e) => setParams({ ...params, lifespan: parseFloat(e.target.value) || 0 })}
                                icon={<span>📅</span>}
                            />
                        </div>

                        {/* CONTEXT INFO BOX */}
                        <div className="mt-6 p-4 rounded-xl border flex items-start gap-3 transition-colors bg-slate-900/50 border-slate-700">
                            <div className="text-2xl mt-1">
                                {selectedAsset ? '🏭' : (importedDesign ? '⚡' : '📝')}
                            </div>
                            <div>
                                <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-1">
                                    {selectedAsset ? 'Active Asset Data' : (importedDesign ? 'HPP Design Studio Link' : 'Generic Model')}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Calculating based on
                                    <strong className="text-white ml-1">{kpis.powerMW.toFixed(1)} MW</strong> capacity
                                    and <strong className="text-white">{kpis.energyGWh.toFixed(1)} GWh/yr</strong> output.
                                </p>
                                {importedDesign && !selectedAsset && (
                                    <div className="mt-2 text-[9px] text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/20 inline-block animate-pulse">
                                        ● LIVE SYNC WITH HPP BUILDER
                                    </div>
                                )}
                            </div>
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

                        {/* CAPEX ESTIMATE CARD (NEW) */}
                        <GlassCard>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Estimated CAPEX</p>
                            <div className="text-3xl font-black text-white mb-1">€{(kpis.capex / 1000000).toFixed(1)}M</div>
                            <p className="text-xs text-slate-500">Based on €1.8M/MW avg.</p>
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
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((kpis.opex / kpis.revenue) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <ModernButton
                            onClick={handleDownloadReport}
                            variant="primary"
                            className="min-w-[220px] shadow-purple-500/20"
                            icon={<span>📄</span>}
                            fullWidth
                        >
                            {t('investorBriefing.generateProspectus')}
                        </ModernButton>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.