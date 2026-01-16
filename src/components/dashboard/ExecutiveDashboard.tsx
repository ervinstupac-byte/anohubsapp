import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { CrossSectorEngine } from '../../services/EngineeringValidation';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { EngineeringCard } from '../../shared/components/ui/EngineeringCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { Sparkline } from '../ui/Sparkline';
import { HeritagePrecisionBanner } from '../ui/HeritagePrecisionBanner';
import { FieldModeToggle } from '../ui/FieldModeToggle';
import { motion } from 'framer-motion';
import {
    Activity, Zap, TrendingUp, ShieldCheck, DollarSign, AlertTriangle,
    TrendingDown, Hammer, BarChart3, ExternalLink, BookOpen, Info,
    Thermometer, Gauge, Clock, Link2
} from 'lucide-react';
import { EngineeringWisdomVault } from './EngineeringWisdomVault';
import { VibrationAnalyzer } from '../../features/telemetry/components/VibrationAnalyzer';
import { SmartManual } from './SmartManual';
import { ROUTES, getFrancisPath } from '../../routes/paths';
import { RevenueImpactCard } from './RevenueImpactCard';
import { MaintenanceTimeline } from '../maintenance/MaintenanceTimeline';
import { SmartActionDeck } from './SmartActionDeck';
import { useAssetContext } from '../../contexts/AssetContext';
import { Wrench } from 'lucide-react';
import { useCrossModuleActions } from '../../hooks/useCrossModuleActions'; // <--- NEW Phase 4
import { useProtocolHistoryStore, historyToSparklineMarkers } from '../../stores/ProtocolHistoryStore'; // NEW: Event markers



// --- LONGEVITY IMPACT CALCULATOR ---
const calculateLongevityLoss = (alignment: number): { years: number; percentage: number } => {
    const GOLDEN = 0.05; // mm/m
    const DESIGN_LIFE_YEARS = 50;

    if (alignment <= GOLDEN) {
        return { years: 0, percentage: 0 };
    }

    // Cubic wear law
    const wearFactor = Math.pow(alignment / GOLDEN, 3);
    const lifetimeFraction = 1 / wearFactor;
    const expectedLife = DESIGN_LIFE_YEARS * lifetimeFraction;
    const yearsLost = DESIGN_LIFE_YEARS - expectedLife;
    const percentageLost = (yearsLost / DESIGN_LIFE_YEARS) * 100;

    return { years: yearsLost, percentage: percentageLost };
};

// --- TURBINE SILHOUETTE ---
const TurbineSilhouette: React.FC<{
    health: number;
    vibration?: number;
    temp?: number;
}> = ({ health, vibration = 0, temp = 0 }) => {
    const isCritical = health < 50 || temp > 75;
    const statusColor = isCritical ? '#EF4444' : health > 80 ? '#22D3EE' : '#F59E0B';

    return (
        <div className="relative w-full h-[320px] md:h-[380px] flex items-center justify-center">
            <svg viewBox="0 0 180 300" className="h-full max-w-[180px]">
                <defs>
                    <linearGradient id="turbineGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={statusColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={statusColor} stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <rect x="35" y="15" width="110" height="55" rx="3" fill="url(#turbineGrad)" stroke={statusColor} strokeWidth="0.8" strokeOpacity="0.4" />
                <path d="M40 30 L140 30 M40 45 L140 45 M40 60 L140 60" stroke={statusColor} strokeWidth="0.3" strokeOpacity="0.15" />
                <rect x="82" y="70" width="16" height="130" fill={statusColor} fillOpacity="0.5" rx="1" />
                <g>
                    <circle cx="90" cy="90" r="12" fill="rgba(15, 23, 42, 0.95)" stroke={temp > 60 ? '#EF4444' : statusColor} strokeWidth="1.5" />
                    <text x="90" y="94" textAnchor="middle" fontSize="7" fill={temp > 60 ? '#EF4444' : statusColor} fontFamily="ui-monospace, monospace" fontWeight="bold">
                        {temp.toFixed(0)}°
                    </text>
                </g>
                <circle cx="90" cy="180" r="12" fill="rgba(15, 23, 42, 0.95)" stroke={statusColor} strokeWidth="1.5" />
                <path d="M50 210 C 50 210 70 185 90 180 C 110 185 130 210 130 210 L 130 245 C 130 245 110 270 90 265 C 70 270 50 245 50 245 Z" fill="rgba(15, 23, 42, 0.75)" stroke={statusColor} strokeWidth="1.2" />
                <path d="M62 220 L118 220 M58 235 L122 235 M62 250 L118 250" stroke={statusColor} strokeWidth="0.4" strokeOpacity="0.25" />
                <path d="M30 265 Q 90 295 150 265" fill="none" stroke={statusColor} strokeWidth="2.5" strokeDasharray="6,3" strokeOpacity="0.5" />
            </svg>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="px-3 py-1.5 bg-slate-900/90 border border-white/10 rounded font-mono text-[10px]">
                    <span className="text-slate-500">HEALTH </span>
                    <span className={health > 80 ? 'text-cyan-400' : health > 50 ? 'text-amber-400' : 'text-red-400'}>{health}%</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900/90 border border-white/10 rounded font-mono text-[10px]">
                    <span className="text-slate-500">VIB </span>
                    <span className={vibration > 0.05 ? 'text-amber-400' : 'text-cyan-400'}>{vibration.toFixed(3)}</span>
                </div>
            </div>
        </div>
    );
};

// === MAIN EXECUTIVE DASHBOARD ===
export const ExecutiveDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // MIGRATED: useTelemetryStore replaces useProjectEngine
    const {
        financials,
        physics: livePhysics,
        structural,
        mechanical,
        specializedState,
        diagnosis,
        identity
    } = useTelemetryStore();

    // --- GOLDEN THREAD: Use selectedAsset from context ---
    const { selectedAsset } = useAssetContext();
    const crossActions = useCrossModuleActions(selectedAsset?.id); // <--- NEW Phase 4

    // Asset identity from context or fallback
    const assetIdentity = selectedAsset?.specs?.machineConfig || identity?.machineConfig || { ratedPowerMW: 4.2 };

    // SCADA / Sensor Mapping
    // Mapped from FrancisSensorData (types.ts)
    const scadaFlow = specializedState?.sensors?.flowRate || 42.5;
    const scadaHead = (specializedState?.sensors as any)?.net_head || specializedState?.sensors?.draft_tube_pressure || 152.0; // Fallback or key fix
    const scadaFrequency = specializedState?.sensors?.gridFrequency || 50.0;

    // Generate mock trend data for sparklines
    const [trendData] = useState(() => ({
        power: Array.from({ length: 24 }, () => 3.8 + Math.random() * 0.8),
        health: Array.from({ length: 24 }, () => 82 + Math.random() * 10),
        head: Array.from({ length: 24 }, () => 148 + Math.random() * 8),
        thrust: Array.from({ length: 24 }, () => 140 + Math.random() * 30)
    }));

    // --- GOLDEN THREAD: Event Markers (Historical Context) ---
    // Real-time event markers from ProtocolHistoryStore
    const { getEntriesForAsset } = useProtocolHistoryStore();

    const eventMarkers = useMemo(() => {
        if (!selectedAsset?.id) return [];
        const entries = getEntriesForAsset(selectedAsset.id, 24); // Last 24 hours
        return historyToSparklineMarkers(entries, 24);
    }, [selectedAsset?.id, getEntriesForAsset]);

    // Diagnostics from store (Expert Diagnosis Engine runs in store)
    // DiagnosisReport does not have healthScore directly, accessing from metrics or defaulting
    const scadaDiagnostics = diagnosis ? { healthScore: diagnosis.metrics?.healthScore || 85 } : { healthScore: 85 };

    const currentAlignment = mechanical?.alignment || 0.02;
    const longevityImpact = calculateLongevityLoss(currentAlignment);

    return (
        <div className="min-h-full bg-slate-950 relative overflow-y-auto custom-scrollbar">
            <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-[180px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-[180px] pointer-events-none" />

            <div className="relative z-10 p-5 md:p-8 pb-32 space-y-6 max-w-[1700px] mx-auto">
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-cyan-900/30 pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                            <span className="text-[9px] text-cyan-500 font-mono font-bold uppercase tracking-[0.2em]">{t('dashboard.status_active')}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase font-mono">{t('dashboard.title')}</h1>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 tracking-wider">{t('dashboard.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <FieldModeToggle />
                        {/* --- GOLDEN THREAD: Perform Maintenance Button --- */}
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
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">{t('dashboard.neural_link')}</span>
                        </div>
                        <ModernButton variant="primary" onClick={() => window.dispatchEvent(new CustomEvent('ANOHUB_TRIGGER_FORENSIC_EXPORT'))} className="text-[10px] py-2">{t('dashboard.export_brief')}</ModernButton>
                    </div>
                </header>

                <HeritagePrecisionBanner currentAlignment={currentAlignment} onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT))} />

                {/* CROSS-SECTOR DOMINO EFFECT */}
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

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                    {/* LEFT: DIGITAL TWIN (4 Columns) */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden h-full">
                            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">{t('dashboard.topology.title')}</h3>
                                    <span className="text-xs text-cyan-400 font-mono">{t('dashboard.topology.digital_twin')}</span>
                                </div>
                                <button onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)} className="text-[9px] text-cyan-500/70 hover:text-cyan-400 font-mono uppercase flex items-center gap-1">
                                    {t('dashboard.topology.full_view')} <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                            <TurbineSilhouette health={scadaDiagnostics?.healthScore || 85} vibration={mechanical?.vibration || 0.032} temp={mechanical?.bearingTemp || 55} />
                            <div className="grid grid-cols-2 border-t border-white/5">
                                <div className="p-4 flex flex-col items-center border-r border-white/5">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.rated_power')}</span>
                                    <span className="text-xl font-mono text-cyan-400 font-black">{(assetIdentity?.machineConfig.ratedPowerMW || 4.2).toFixed(1)}<span className="text-[10px] text-slate-500 ml-1">MW</span></span>
                                </div>
                                <div className="p-4 flex flex-col items-center">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.grid_freq')}</span>
                                    <span className={`text-xl font-mono font-black ${Math.abs(scadaFrequency - 50) > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {scadaFrequency.toFixed(2)}<span className="text-[10px] text-slate-500 ml-1">Hz</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: KPIs & STRATEGY (5 Columns) */}
                    <div className="lg:col-span-5 flex flex-col gap-5">
                        {/* FEATURE 1: REVENUE IMPACT CARD (PROTOCOL) */}
                        <RevenueImpactCard className="rounded-xl shadow-2xl" />

                        {/* RACK INSTRUMENTS */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <EngineeringCard
                                variant="instrument"
                                title={t('dashboard.kpi.active_power')}
                                value={(assetIdentity?.machineConfig.ratedPowerMW || 4.2).toFixed(1)}
                                unit="MW"
                                icon={<Zap className="w-4 h-4 text-cyan-400" />}
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
                                icon={<Activity className={`w-4 h-4 ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'text-red-400' : 'text-emerald-400'}`} />}
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

                        {/* PERFORMANCE GAP */}
                        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-5">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-1">{t('dashboard.kpi.performance_gap')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-black font-mono ${(livePhysics.performanceGap?.toNumber() || 0) > 98 ? 'text-emerald-400' : 'text-amber-400'}`}>{(livePhysics.performanceGap?.toNumber() || 96.5).toFixed(1)}%</span>
                                        <span className="text-[9px] text-slate-500 font-mono">{t('dashboard.kpi.vs_design')}</span>
                                    </div>
                                </div>
                                <div className="w-1/2">
                                    <div className="h-3 bg-slate-800 rounded overflow-hidden relative">
                                        <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${Math.min(100, livePhysics.performanceGap?.toNumber() || 96.5)}%` }} transition={{ duration: 0.5 }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECONDARY METRICS */}
                        <div className="grid grid-cols-2 gap-4">
                            <EngineeringCard
                                variant="instrument"
                                title={t('dashboard.kpi.axial_thrust')}
                                value={(livePhysics?.axialThrustKN?.toNumber() || 145).toFixed(0)}
                                unit="kN"
                                icon={<Gauge className="w-4 h-4 text-purple-400" />}
                                status={(livePhysics?.axialThrustKN?.toNumber() || 0) > 200 ? 'critical' : (livePhysics?.axialThrustKN?.toNumber() || 0) > 180 ? 'warning' : 'nominal'}
                                trendData={trendData.thrust}
                                subtitle={t('dashboard.kpi.axial_thrust_sub')}
                                onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                            />
                            <EngineeringCard
                                variant="instrument"
                                title={t('dashboard.kpi.structural_life')}
                                value={(structural?.remainingLife || 87.5).toFixed(1)}
                                unit="%"
                                icon={<Hammer className="w-4 h-4 text-amber-400" />}
                                status={(structural?.remainingLife || 0) < 50 ? 'critical' : (structural?.remainingLife || 0) < 75 ? 'warning' : 'nominal'}
                                subtitle={t('dashboard.kpi.structural_life_sub')}
                                onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.FORENSICS))}
                            />
                        </div>

                        {/* FEATURE 3: SMART ACTION DECK */}
                        <div className="space-y-3">
                            <h3 className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-cyan-400" />
                                {t('dashboard.sentinel.title', 'Smart Command Center')}
                            </h3>
                            <SmartActionDeck />
                        </div>

                        <VibrationAnalyzer />
                    </div>

                    {/* RIGHT: FINANCE & WISDOM (3 Columns) */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                        <GlassCard title={t('dashboard.finance.title')} icon={<DollarSign className="w-4 h-4 text-amber-400" />} className="border-amber-500/20 bg-amber-950/5">
                            <div className="space-y-4">
                                <div><div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">{t('dashboard.finance.maint_buffer')}</div><div className="text-lg font-mono text-amber-400 font-bold">{(financials?.maintenanceBufferEuro || 45000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div></div>
                                <div><div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">{t('dashboard.finance.annual_loss')}</div><div className="text-base font-mono text-white font-bold">{(financials?.lostRevenueEuro || 12500).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div></div>
                                <div className="pt-3 border-t border-amber-500/20"><div className="text-[9px] text-emerald-400 uppercase font-mono font-black mb-1 flex items-center justify-between">{t('dashboard.finance.predictive_savings')}<TrendingDown className="w-3 h-3" /></div><div className="text-lg font-mono text-emerald-400 font-bold">{(financials?.maintenanceSavingsEuro || 28000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div></div>
                            </div>
                        </GlassCard>

                        {/* FEATURE 2: MAINTENANCE TIMELINE */}
                        <MaintenanceTimeline />

                        <EngineeringWisdomVault />
                        <SmartManual />
                    </div>
                </div>
            </div>
        </div>
    );
};
