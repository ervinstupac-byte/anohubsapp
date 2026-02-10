import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { reportGenerator } from '../services/ReportGenerator.ts';
import { AssetPicker } from './AssetPicker.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { useHPPDesign } from '../contexts/HPPDesignContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useInventory } from '../contexts/InventoryContext.tsx';

export const InvestorBriefing: React.FC = () => {
    const { showToast } = useToast();
    const { selectedAsset } = useAssetContext();
    const { t } = useTranslation();
    const { currentDesign } = useHPPDesign();
    const { telemetry, activeIncident } = useTelemetry();
    const { getTotalInventoryValue } = useInventory();

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
        payback: 0,
        powerMW: 0,
        energyGWh: 0
    });

    useEffect(() => {
        const powerMW = selectedAsset?.capacity || currentDesign?.calculations.powerMW || 10;
        let annualGenerationGWh = currentDesign?.calculations.energyGWh || (powerMW * 8760 * 0.5 / 1000);

        if (selectedAsset && !currentDesign) {
            annualGenerationGWh = selectedAsset.capacity * 8760 * 0.5 / 1000;
        }

        const totalRevenue = annualGenerationGWh * 1000 * params.electricityPrice;
        const estimatedCapex = powerMW * 1800000;
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
            powerMW: powerMW,
            energyGWh: annualGenerationGWh
        });

    }, [selectedAsset, params, currentDesign]);

    const handleDownloadReport = () => {
        const assetName = selectedAsset?.name || (currentDesign ? t('investorBriefing.hppConceptDesign', "HPP Concept Design") : t('investorBriefing.genericProject', "Generic Project"));
        const blob = reportGenerator.generateFinancialProspectus({
            assetName,
            kpis,
            assumptions: params
        });
        reportGenerator.downloadReport(blob, `AnoHUB_Financial_Briefing_${assetName}.pdf`);
        showToast(t('investorBriefing.downloaded', 'Financial Briefing Downloaded'), 'success');
    };

    const handleDownloadIncidentReport = () => {
        if (!selectedAsset) return;
        const liveData = telemetry[selectedAsset.id];

        const blob = reportGenerator.generateIncidentReport({
            assetName: selectedAsset.name,
            incidentType: activeIncident?.type || 'Unknown Failure',
            deviation: liveData?.incidentDetails || 'Out of tolerance',
            timestamp: new Date().toISOString(),
            status: 'CRITICAL'
        });
        reportGenerator.downloadReport(blob, `INCIDENT_REPORT_${selectedAsset.name}.pdf`);
        showToast('CRITICAL: Incident Report Exported', 'error');
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                <div className="space-y-6">
                    <GlassCard title={t('investorBriefing.marketAssumptions')} className="bg-slate-900/60" action={<span className="text-xl">🎚️</span>}>
                        <div className="space-y-4">
                            <ModernInput label={t('investorBriefing.electricityPrice')} type="number" value={params.electricityPrice} onChange={(e) => setParams({ ...params, electricityPrice: parseFloat(e.target.value) || 0 })} icon={<span>€</span>} />
                            <ModernInput label={t('investorBriefing.interestRate')} type="number" value={params.interestRate} onChange={(e) => setParams({ ...params, interestRate: parseFloat(e.target.value) || 0 })} icon={<span>%</span>} />
                            <ModernInput label={t('investorBriefing.projectLifespan')} type="number" value={params.lifespan} onChange={(e) => setParams({ ...params, lifespan: parseFloat(e.target.value) || 0 })} icon={<span>📅</span>} />
                        </div>
                        <div className="mt-6 p-4 rounded-xl border flex items-start gap-3 transition-colors bg-slate-900/50 border-slate-700">
                            <div className="text-2xl mt-1">{selectedAsset ? '🏭' : (currentDesign ? '⚡' : '📝')}</div>
                            <div>
                                <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-1">
                                    {selectedAsset ? t('investorBriefing.activeAssetData', 'Active Asset Data') : (currentDesign ? t('investorBriefing.designLink', 'HPP Design Studio Link') : t('investorBriefing.genericModel', 'Generic Model'))}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <Trans i18nKey="investorBriefing.calculatingBasedOn" values={{ power: kpis.powerMW.toFixed(1), energy: kpis.energyGWh.toFixed(1) }}>
                                        Calculating based on <strong className="text-white ml-1">0 MW</strong> capacity and <strong className="text-white">0 GWh/yr</strong> output.
                                    </Trans>
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GlassCard className="bg-gradient-to-br from-purple-900/40 to-slate-900 border-purple-500/30">
                            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">{t('investorBriefing.roi')}</p>
                            <div className="text-5xl font-black text-white tracking-tighter mb-1">{kpis.roi.toFixed(1)}%</div>
                            <p className="text-xs text-slate-400">{t('investorBriefing.annualizedYield')}</p>
                        </GlassCard>
                        <GlassCard>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('investorBriefing.lcoe')}</p>
                            <div className="text-4xl font-black text-white mb-1">€{kpis.lcoe.toFixed(2)}</div>
                            <p className="text-xs text-slate-500">{t('investorBriefing.perMwh')}</p>
                        </GlassCard>
                        <GlassCard>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('investorBriefing.annualRevenue')}</p>
                            <div className="text-3xl font-black text-white mb-1">€{(kpis.revenue / 1000000).toFixed(2)}M</div>
                            <p className="text-xs text-slate-500">{t('investorBriefing.grossIncome')}</p>
                        </GlassCard>
                        <GlassCard>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">{t('investorBriefing.estimatedCapex', 'Estimated CAPEX')}</p>
                            <div className="text-3xl font-black text-white mb-1">€{(kpis.capex / 1000000).toFixed(1)}M</div>
                            <p className="text-xs text-slate-500">{t('investorBriefing.capexBasis', 'Based on €1.8M/MW avg.')}</p>
                        </GlassCard>

                        {/* NEW: Inventory Value Card */}
                        <GlassCard className="border-cyan-500/20 bg-cyan-950/10">
                            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Stored Asset Capital</p>
                            <div className="text-3xl font-black text-white mb-1">€{(getTotalInventoryValue() / 1000).toFixed(1)}k</div>
                            <p className="text-xs text-slate-500">Value locked in Spare Parts Inventory</p>
                        </GlassCard>
                    </div>

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

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <ModernButton onClick={handleDownloadReport} variant="primary" className="min-w-[220px] shadow-purple-500/20" icon={<span>📄</span>} fullWidth>
                                {t('investorBriefing.generateProspectus')}
                            </ModernButton>

                            {activeIncident && activeIncident.assetId === selectedAsset?.id && (
                                <ModernButton onClick={handleDownloadIncidentReport} variant="secondary" className="min-w-[220px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-red-500/20 animate-pulse" icon={<span>🚨</span>} fullWidth>
                                    GENERATE INCIDENT REPORT
                                </ModernButton>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};