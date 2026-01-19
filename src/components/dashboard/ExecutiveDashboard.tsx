import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Zap, TrendingUp, DollarSign,
    TrendingDown, Hammer, ExternalLink,
    Thermometer, Gauge, Link2, Wrench, FileText, ShieldAlert
} from 'lucide-react';

import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { CrossSectorEngine } from '../../services/EngineeringValidation';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { EngineeringCard } from '../../shared/components/ui/EngineeringCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { HeritagePrecisionBanner } from '../ui/HeritagePrecisionBanner';
import { FieldModeToggle } from '../ui/FieldModeToggle';
import { EngineeringWisdomVault } from './EngineeringWisdomVault';
import { VibrationAnalyzer } from '../../features/telemetry/components/VibrationAnalyzer';
import { SmartManual } from './SmartManual';
import { ROUTES, getFrancisPath } from '../../routes/paths';
import { RevenueImpactCard } from './RevenueImpactCard';
import { MaintenanceTimeline } from '../maintenance/MaintenanceTimeline';
import { SecondaryMetricsGrid } from './SecondaryMetricsGrid';
import { useAssetContext } from '../../contexts/AssetContext';
import { useCrossModuleActions } from '../../hooks/useCrossModuleActions';
import { AIInsightsPanel } from './AIInsightsPanel';
import { TurbineRunner3D } from '../three/TurbineRunner3D';
import { ScenarioController } from './ScenarioController';
import { LiveMetricToken } from '../../features/telemetry/components/LiveMetricToken';
import { ForensicReportService } from '../../services/ForensicReportService';
import { useProtocolHistoryStore, historyToSparklineMarkers } from '../../stores/ProtocolHistoryStore';
import { BootSequence } from '../BootSequence';
import { EngineeringDossierCard } from '../EngineeringDossierCard';

// --- LONGEVITY IMPACT CALCULATOR ---
const calculateLongevityLoss = (alignment: number): { years: number; percentage: number } => {
    const GOLDEN = 0.05; // mm/m
    const DESIGN_LIFE_YEARS = 50;
    if (alignment <= GOLDEN) return { years: 0, percentage: 0 };
    const wearFactor = Math.pow(alignment / GOLDEN, 3);
    const lifetimeFraction = 1 / wearFactor;
    const expectedLife = DESIGN_LIFE_YEARS * lifetimeFraction;
    const yearsLost = DESIGN_LIFE_YEARS - expectedLife;
    const percentageLost = (yearsLost / DESIGN_LIFE_YEARS) * 100;
    return { years: yearsLost, percentage: percentageLost };
};

// === MAIN EXECUTIVE DASHBOARD ===
export const ExecutiveDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const threeContainerRef = useRef<HTMLDivElement>(null);

    const {
        financials,
        physics: livePhysics,
        structural,
        mechanical,
        specializedState,
        diagnosis,
        identity,
        unifiedDiagnosis,
        investigatedComponents
    } = useTelemetryStore();

    const { selectedAsset } = useAssetContext();
    const crossActions = useCrossModuleActions(selectedAsset?.id);
    const assetIdentity = selectedAsset?.specs?.machineConfig || identity?.machineConfig || { ratedPowerMW: 4.2 };

    const scadaFlow = specializedState?.sensors?.flowRate || 42.5;
    const scadaHead = (specializedState?.sensors as any)?.net_head || specializedState?.sensors?.draft_tube_pressure || 152.0;
    const scadaFrequency = specializedState?.sensors?.gridFrequency || 50.0;

    const [trendData] = useState(() => ({
        power: Array.from({ length: 24 }, () => 3.8 + Math.random() * 0.8),
        health: Array.from({ length: 24 }, () => 82 + Math.random() * 10),
        head: Array.from({ length: 24 }, () => 148 + Math.random() * 8),
        thrust: Array.from({ length: 24 }, () => 140 + Math.random() * 30)
    }));

    const [isBooting, setIsBooting] = useState(true);
    const { getEntriesForAsset } = useProtocolHistoryStore();

    const eventMarkers = useMemo(() => {
        if (!selectedAsset?.id) return [];
        const entries = getEntriesForAsset(selectedAsset.id, 24);
        return historyToSparklineMarkers(entries, 24);
    }, [selectedAsset?.id, getEntriesForAsset]);

    const scadaDiagnostics = diagnosis ? { healthScore: diagnosis.metrics?.healthScore || 85 } : { healthScore: 85 };
    const currentAlignment = mechanical?.alignment || 0.02;

    const handleGenerateForensicPDF = useCallback(async () => {
        if (!unifiedDiagnosis || !selectedAsset || !livePhysics) return;
        try {
            const blob = await ForensicReportService.generateForensicDossier({
                asset: selectedAsset,
                diagnosis: unifiedDiagnosis,
                projectState: {
                    identity,
                    hydraulic: livePhysics,
                    mechanical,
                    structural,
                    market: financials,
                    investigatedComponents
                } as any,
                threeRef: threeContainerRef.current || undefined,
                t
            });
            ForensicReportService.openAndDownloadBlob(blob, `Forensic_Dossier_${selectedAsset.name}_${Date.now()}.pdf`, true);
        } catch (error) {
            console.error("Forensic PDF Generation failed:", error);
        }
    }, [unifiedDiagnosis, selectedAsset, livePhysics, identity, mechanical, structural, financials, t, investigatedComponents]);

    return (
        <div className="relative min-h-screen bg-hydro-charcoal text-slate-200 overflow-x-hidden">
            <AnimatePresence>
                {isBooting && <BootSequence onComplete={() => setIsBooting(false)} speed={100} />}
            </AnimatePresence>

            <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-10" />

            <main className={`relative transition-all duration-1000 ${isBooting ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
                <div className="relative z-10 p-5 md:p-8 pb-32 space-y-6 max-w-[1700px] mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-h-border pb-5">
                        <div className="flex items-start gap-4">
                            <img src="/assets/images/logo.svg" alt="AnoHUB Logo" className="w-12 h-12 mt-1 object-contain" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-h-cyan rounded-full" />
                                    <span className="text-[9px] text-h-cyan font-mono font-bold uppercase tracking-[0.2em]">{t('dashboard.status_active')}</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase font-mono">{t('dashboard.title')}</h1>
                                <p className="text-[11px] text-slate-500 font-mono mt-1 tracking-wider">{t('dashboard.subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <FieldModeToggle />
                            <ModernButton
                                variant="secondary"
                                onClick={() => navigate('/maintenance/dashboard')}
                                className="text-[10px] py-2 flex items-center gap-2"
                            >
                                <Wrench className="w-3 h-3" />
                                {t('dashboard.performMaintenance', 'Perform Maintenance')}
                            </ModernButton>
                            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-wider">{t('dashboard.neural_link')}</span>
                            </div>
                            <ModernButton
                                variant="primary"
                                onClick={handleGenerateForensicPDF}
                                id="generate-forensic-pdf-exclusive"
                                className="btn-primary flex items-center gap-2 !px-4 !py-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                            >
                                <FileText className="w-3 h-3" />
                                {t('dashboard.export_forensic', 'Generate Forensic PDF')}
                            </ModernButton>
                        </div>
                    </header>

                    <HeritagePrecisionBanner currentAlignment={currentAlignment} onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT))} />

                    {(() => {
                        const crossSectorEffects = CrossSectorEngine.analyzeCrossSectorEffects({
                            alignment: currentAlignment,
                            vibration: mechanical?.vibration,
                            bearingTemp: mechanical?.bearingTemp,
                            gridFrequency: scadaFrequency
                        });
                        if (crossSectorEffects.length === 0) return null;
                        return (
                            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-widest">CROSS-SECTOR DOMINO EFFECT</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {crossSectorEffects.slice(0, 4).map((effect, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-white/5">
                                            <div className="flex-shrink-0 w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                                <Thermometer className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{effect.sourceSector} → {effect.affectedSector}</div>
                                                <p className="text-[11px] text-amber-300 font-mono mt-0.5 leading-relaxed">{effect.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                        <div className="lg:col-span-4">
                            <div className="bg-h-panel border border-h-border rounded-xl overflow-hidden h-full">
                                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">{t('dashboard.topology.title')}</h3>
                                        <span className="text-xs text-h-cyan font-mono">{t('dashboard.topology.digital_twin')}</span>
                                    </div>
                                    <button onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)} className="text-[9px] text-h-cyan/70 hover:text-h-cyan font-mono uppercase flex items-center gap-1">
                                        {t('dashboard.topology.full_view')} <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                                <div ref={threeContainerRef} className="relative w-full h-[320px] md:h-[380px]">
                                    <TurbineRunner3D
                                        rpm={mechanical?.rpm || 500}
                                        diagnosticHighlights={{
                                            oil: unifiedDiagnosis?.expertInsights?.oilHealth,
                                            cavitation: unifiedDiagnosis?.expertInsights?.cavitationSeverity === 'CRITICAL' ? 20 : (unifiedDiagnosis?.expertInsights?.cavitationSeverity === 'WARNING' ? 50 : 100),
                                            structural: unifiedDiagnosis?.expertInsights?.structuralSafetyFactor
                                        }}
                                        investigatedComponents={investigatedComponents}
                                    />
                                </div>
                                <div className="grid grid-cols-2 border-t border-white/5">
                                    <div className="p-4 flex flex-col items-center border-r border-white/5">
                                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.rated_power')}</span>
                                        <span className="text-xl font-mono text-h-cyan font-black">{(assetIdentity?.ratedPowerMW || 4.2).toFixed(1)}<span className="text-[10px] text-slate-500 ml-1">MW</span></span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center">
                                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.grid_freq')}</span>
                                        <span className={`text-xl font-mono font-black ${Math.abs(scadaFrequency - 50) > 0.5 ? 'text-h-yellow' : 'text-h-green'}`}>
                                            {scadaFrequency.toFixed(2)}<span className="text-[10px] text-slate-500 ml-1">Hz</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-5">
                            <AIInsightsPanel />
                            <RevenueImpactCard className="rounded-xl shadow-2xl" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.active_power')}
                                    value={(assetIdentity?.ratedPowerMW || 4.2).toFixed(1)}
                                    unit="MW"
                                    icon={<Zap className="w-4 h-4 text-h-cyan" />}
                                    status="nominal"
                                    trendData={trendData.power}
                                    subtitle={`IEC 60041 • ${t('dashboard.kpi.active_power_sub')}`}
                                    onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                                    actionMenu={crossActions}
                                />
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.system_health')}
                                    value={scadaDiagnostics?.healthScore || 85}
                                    unit="%"
                                    icon={<Activity className={`w-4 h-4 ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'text-h-red' : 'text-h-green'}`} />}
                                    status={(scadaDiagnostics?.healthScore || 85) < 50 ? 'critical' : (scadaDiagnostics?.healthScore || 85) < 80 ? 'warning' : 'nominal'}
                                    trendData={trendData.health}
                                    subtitle="ISO 10816-3"
                                    onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)}
                                    actionMenu={crossActions}
                                    eventMarkers={eventMarkers}
                                />
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.net_head')}
                                    value={scadaHead.toFixed(1)}
                                    unit="m"
                                    icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                                    status="nominal"
                                    trendData={trendData.head}
                                    subtitle={`Q: ${scadaFlow.toFixed(1)} m³/s`}
                                    onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                                    actionMenu={crossActions}
                                />
                            </div>

                            <div className="bg-h-panel border border-h-border rounded-lg p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-1">{t('dashboard.kpi.performance_gap')}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-3xl font-black font-mono ${(livePhysics.performanceGap?.toNumber() || 0) > 98 ? 'text-h-green' : 'text-h-yellow'}`}>{(livePhysics.performanceGap?.toNumber() || 96.5).toFixed(1)}%</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{t('dashboard.kpi.vs_design')}</span>
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <div className="h-3 bg-h-dark rounded overflow-hidden relative">
                                            <motion.div className="h-full bg-gradient-to-r from-h-green to-h-cyan" initial={{ width: 0 }} animate={{ width: `${Math.min(100, livePhysics.performanceGap?.toNumber() || 96.5)}%` }} transition={{ duration: 0.5 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.axial_thrust')}
                                    value={(livePhysics?.axialThrustKN?.toNumber() || 145).toFixed(0)}
                                    unit="kN"
                                    icon={<Gauge className="w-4 h-4 text-h-purple" />}
                                    status={(livePhysics?.axialThrustKN?.toNumber() || 0) > 200 ? 'critical' : (livePhysics?.axialThrustKN?.toNumber() || 0) > 180 ? 'warning' : 'nominal'}
                                    trendData={trendData.thrust}
                                    subtitle={t('dashboard.kpi.axial_thrust_sub')}
                                    onClick={() => window.dispatchEvent(new CustomEvent('openDossier', { detail: { keyword: 'penstock' } }))}
                                />
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.structural_life')}
                                    value={(structural?.remainingLife || 87.5).toFixed(1)}
                                    unit="%"
                                    icon={<Hammer className="w-4 h-4 text-h-gold" />}
                                    status={(structural?.remainingLife || 0) < 50 ? 'critical' : (structural?.remainingLife || 0) < 75 ? 'warning' : 'nominal'}
                                    subtitle={t('dashboard.kpi.structural_life_sub')}
                                    onClick={() => window.dispatchEvent(new CustomEvent('openDossier', { detail: { keyword: 'generator' } }))}
                                />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3 text-h-red" />
                                    Forensic Engineering Metrics
                                </h3>
                                <SecondaryMetricsGrid />
                            </div>
                            <VibrationAnalyzer />
                        </div>

                        <div className="lg:col-span-3 flex flex-col gap-5">
                            <ScenarioController />
                            <div className="bg-h-panel border border-h-border rounded-xl p-5 shadow-inner">
                                <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-h-green" />
                                    {t('dashboard.live_telemetry')}
                                </h3>
                                <div className="space-y-4">
                                    <LiveMetricToken sensorId="PRE-202-B" />
                                    <LiveMetricToken sensorId="PT-101" />
                                    <LiveMetricToken sensorId="TMP-404-X" />
                                </div>
                            </div>
                            <GlassCard title={t('dashboard.finance.title')} icon={<DollarSign className="w-4 h-4 text-h-gold" />} className="border-h-gold/20 bg-h-gold/5">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">{t('dashboard.finance.maint_buffer')}</div>
                                        <div className="text-lg font-mono text-h-gold font-bold">{(financials?.maintenanceBufferEuro || 45000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">{t('dashboard.finance.annual_loss')}</div>
                                        <div className="text-base font-mono text-white font-bold">{(financials?.lostRevenueEuro || 12500).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <div className="pt-3 border-t border-h-gold/20">
                                        <div className="text-[9px] text-h-green uppercase font-mono font-black mb-1 flex items-center justify-between">
                                            {t('dashboard.finance.predictive_savings')}<TrendingDown className="w-3 h-3" />
                                        </div>
                                        <div className="text-lg font-mono text-h-green font-bold">{(financials?.maintenanceSavingsEuro || 28000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                </div>
                            </GlassCard>
                            <MaintenanceTimeline />
                            <EngineeringWisdomVault />
                            <SmartManual />
                        </div>
                    </div>

                    {/* NC-9.0: Trust & Authority Footer */}
                    <div className="pt-10">
                        <EngineeringDossierCard />
                    </div>
                </div>
            </main>
        </div>
    );
};
