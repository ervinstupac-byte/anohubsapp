import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { DrTurbineAI, ActionCard } from '../../services/DrTurbineAI';
import { CrossSectorEngine } from '../../services/EngineeringValidation';
import { GlassCard } from '../ui/GlassCard';
import { ModernButton } from '../ui/ModernButton';
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
import { VibrationAnalyzer } from '../diagnostic-twin/VibrationAnalyzer';
import { SmartManual } from './SmartManual';
import { ROUTES, getFrancisPath } from '../../routes/paths';


// --- RACK-MOUNTED INSTRUMENT CARD ---
interface RackInstrumentProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    status?: 'nominal' | 'warning' | 'critical';
    trendData?: number[];
    isoRef?: string;
    knowledgeLink?: string;
    subtitle?: string;
    className?: string;
    onClick?: () => void;
}

const RackInstrument: React.FC<RackInstrumentProps> = ({
    title,
    value,
    unit,
    icon,
    status = 'nominal',
    trendData,
    isoRef,
    knowledgeLink,
    subtitle,
    className = '',
    onClick
}) => {
    const navigate = useNavigate();

    const statusColors = {
        nominal: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/5', text: 'text-cyan-400', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.1)]' },
        warning: { border: 'border-amber-500/40', bg: 'bg-amber-500/5', text: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.1)]' },
        critical: { border: 'border-red-500/40', bg: 'bg-red-500/5', text: 'text-red-400', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' }
    };

    const colors = statusColors[status];

    return (
        <div
            className={`relative overflow-hidden rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.glow} ${onClick ? 'cursor-pointer hover:border-opacity-80' : ''} transition-all ${className}`}
            onClick={onClick}
        >
            {/* RACK SCREW HOLES (Industrial Look) */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />

            {/* STATUS LED INDICATOR */}
            <div className="absolute top-3 right-8 flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status === 'critical' ? 'bg-red-500 animate-pulse' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                    {status === 'critical' ? 'ALERT' : status === 'warning' ? 'WARN' : 'OK'}
                </span>
            </div>

            <div className="relative z-10 p-5">
                {/* HEADER */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded border ${colors.border} ${colors.bg}`}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest font-mono">
                                {title}
                            </p>
                            {isoRef && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (knowledgeLink) navigate(knowledgeLink);
                                    }}
                                    className="flex items-center gap-1 text-[8px] text-cyan-500/70 hover:text-cyan-400 font-mono uppercase tracking-wider mt-0.5 transition-colors"
                                >
                                    <BookOpen className="w-2.5 h-2.5" />
                                    {isoRef}
                                    <ExternalLink className="w-2 h-2" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* MAIN VALUE DISPLAY (Industrial Meter Style) */}
                <div className="bg-slate-900/80 rounded-lg p-4 border border-white/5 mb-3">
                    <div className="flex items-baseline justify-between">
                        <span className={`text-4xl md:text-5xl font-black font-mono tracking-tight ${colors.text}`}>
                            {value}
                        </span>
                        {unit && (
                            <span className="text-sm text-slate-500 font-mono font-bold uppercase ml-2">
                                {unit}
                            </span>
                        )}
                    </div>
                </div>

                {/* TREND SPARKLINE */}
                {trendData && trendData.length >= 2 && (
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">24H TREND</span>
                        <Sparkline
                            data={trendData}
                            width={80}
                            height={20}
                            color={status === 'critical' ? '#EF4444' : status === 'warning' ? '#F59E0B' : '#22D3EE'}
                        />
                    </div>
                )}

                {/* SUBTITLE / CONTEXT */}
                {subtitle && (
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* BOTTOM RACK MOUNT BAR */}
            <div className="h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

// --- LONGEVITY IMPACT CALCULATOR ---
const calculateLongevityLoss = (alignment: number): { years: number; percentage: number } => {
    const GOLDEN = 0.05; // mm/m
    const DESIGN_LIFE_YEARS = 50;

    if (alignment <= GOLDEN) {
        return { years: 0, percentage: 0 };
    }

    // Cubic wear law: wear rate increases with cube of misalignment
    const wearFactor = Math.pow(alignment / GOLDEN, 3);
    const lifetimeFraction = 1 / wearFactor;
    const expectedLife = DESIGN_LIFE_YEARS * lifetimeFraction;
    const yearsLost = DESIGN_LIFE_YEARS - expectedLife;
    const percentageLost = (yearsLost / DESIGN_LIFE_YEARS) * 100;

    return { years: yearsLost, percentage: percentageLost };
};

// --- TURBINE SILHOUETTE (Minimal, Technical) ---
const TurbineSilhouette: React.FC<{
    health: number;
    vibration?: number;
    temp?: number;
}> = ({ health, vibration = 0, temp = 0 }) => {
    const { t } = useTranslation();
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

                {/* Generator */}
                <rect x="35" y="15" width="110" height="55" rx="3" fill="url(#turbineGrad)" stroke={statusColor} strokeWidth="0.8" strokeOpacity="0.4" />
                <path d="M40 30 L140 30 M40 45 L140 45 M40 60 L140 60" stroke={statusColor} strokeWidth="0.3" strokeOpacity="0.15" />

                {/* Shaft */}
                <rect x="82" y="70" width="16" height="130" fill={statusColor} fillOpacity="0.5" rx="1" />

                {/* Bearings with temp reading */}
                <g>
                    <circle cx="90" cy="90" r="12" fill="rgba(15, 23, 42, 0.95)" stroke={temp > 60 ? '#EF4444' : statusColor} strokeWidth="1.5" />
                    <text x="90" y="94" textAnchor="middle" fontSize="7" fill={temp > 60 ? '#EF4444' : statusColor} fontFamily="ui-monospace, monospace" fontWeight="bold">
                        {temp.toFixed(0)}°
                    </text>
                </g>
                <circle cx="90" cy="180" r="12" fill="rgba(15, 23, 42, 0.95)" stroke={statusColor} strokeWidth="1.5" />

                {/* Francis Runner */}
                <path d="M50 210 C 50 210 70 185 90 180 C 110 185 130 210 130 210 L 130 245 C 130 245 110 270 90 265 C 70 270 50 245 50 245 Z"
                    fill="rgba(15, 23, 42, 0.75)"
                    stroke={statusColor}
                    strokeWidth="1.2"
                />
                <path d="M62 220 L118 220 M58 235 L122 235 M62 250 L118 250" stroke={statusColor} strokeWidth="0.4" strokeOpacity="0.25" />

                {/* Flow */}
                <path d="M30 265 Q 90 295 150 265" fill="none" stroke={statusColor} strokeWidth="2.5" strokeDasharray="6,3" strokeOpacity="0.5" />
            </svg>

            {/* Data Overlays */}
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
    const { technicalState, connectTwinToExpertEngine, getDrTurbineConsultation, createComplexIdentity } = useProjectEngine();

    const assetIdentity = useMemo(() => {
        return createComplexIdentity && createComplexIdentity() ? createComplexIdentity() : null;
    }, [createComplexIdentity, technicalState]);

    const scadaFlow = technicalState.francis?.sensors?.flow_rate || 42.5;
    const scadaHead = technicalState.francis?.sensors?.net_head || 152.0;
    const scadaFrequency = technicalState.francis?.sensors?.grid_frequency || 50.0;

    const [aiCards, setAiCards] = useState<ActionCard[]>([]);

    // Generate mock trend data for sparklines
    const [trendData] = useState(() => ({
        power: Array.from({ length: 24 }, () => 3.8 + Math.random() * 0.8),
        health: Array.from({ length: 24 }, () => 82 + Math.random() * 10),
        head: Array.from({ length: 24 }, () => 148 + Math.random() * 8),
        thrust: Array.from({ length: 24 }, () => 140 + Math.random() * 30)
    }));

    const scadaDiagnostics = useMemo(() => {
        return connectTwinToExpertEngine(scadaFlow, scadaHead, scadaFrequency);
    }, [connectTwinToExpertEngine, scadaFlow, scadaHead, scadaFrequency]);

    useEffect(() => {
        if (assetIdentity) {
            const consultation = getDrTurbineConsultation(scadaFlow, scadaHead, scadaFrequency);
            setAiCards(consultation.cards);
        }
    }, [assetIdentity, getDrTurbineConsultation, scadaFlow, scadaHead, scadaFrequency]);

    const currentAlignment = technicalState.mechanical?.alignment || 0.02;
    const longevityImpact = calculateLongevityLoss(currentAlignment);

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* BLUEPRINT GRID BACKGROUND */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Ambient Glow (CSS-only, no animations) */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-[180px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-[180px] pointer-events-none" />

            <div className="relative z-10 p-5 md:p-8 pb-32 space-y-6 max-w-[1700px] mx-auto">
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-cyan-900/30 pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                            <span className="text-[9px] text-cyan-500 font-mono font-bold uppercase tracking-[0.2em]">
                                {t('dashboard.status_active')}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase font-mono">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 tracking-wider">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <FieldModeToggle />
                        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                                {t('dashboard.neural_link')}
                            </span>
                        </div>
                        <div className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] text-slate-400 font-mono">
                                {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <ModernButton
                            variant="primary"
                            onClick={() => window.dispatchEvent(new CustomEvent('ANOHUB_TRIGGER_FORENSIC_EXPORT'))}
                            className="text-[10px] py-2"
                        >
                            {t('dashboard.export_brief')}
                        </ModernButton>
                    </div>
                </header>

                {/* HERITAGE PRECISION BANNER */}
                <HeritagePrecisionBanner
                    currentAlignment={currentAlignment}
                    onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT))}
                />

                {/* LONGEVITY LEAK ALERT (if applicable) */}
                {longevityImpact.years > 0 && (
                    <div className="flex items-center justify-between p-4 bg-red-950/30 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <div>
                                <span className="text-sm font-bold text-red-300 font-mono uppercase">
                                    {t('dashboard.heritage_banner.deviation', 'LONGEVITY LEAK DETECTED')}
                                </span>
                                <p className="text-xs text-red-400/80 font-mono mt-0.5">
                                    {t('dashboard.heritage_banner.alert_desc', 'Current alignment deviation is accelerating wear beyond design parameters.')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-red-400 font-mono">
                                -{longevityImpact.years.toFixed(1)}
                            </span>
                            <span className="text-xs text-red-400/80 font-mono block">
                                {t('dashboard.heritage_banner.years_lost', 'YEARS EXPECTED LIFE')}
                            </span>
                        </div>
                    </div>
                )}

                {/* CROSS-SECTOR DOMINO EFFECT WARNINGS */}
                {(() => {
                    const crossSectorEffects = CrossSectorEngine.analyzeCrossSectorEffects({
                        alignment: currentAlignment,
                        vibration: technicalState.mechanical?.vibration,
                        bearingTemp: technicalState.mechanical?.bearingTemp,
                        gridFrequency: scadaFrequency
                    });

                    if (crossSectorEffects.length === 0) return null;

                    return (
                        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Link2 className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-widest">
                                    CROSS-SECTOR DOMINO EFFECT
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {crossSectorEffects.slice(0, 4).map((effect, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-white/5"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                            <Thermometer className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                                                {effect.sourceSector} → {effect.affectedSector}
                                            </div>
                                            <p className="text-[11px] text-amber-300 font-mono mt-0.5 leading-relaxed">
                                                {effect.message}
                                            </p>
                                            <div className="mt-1 text-[9px] font-mono text-amber-500/70">
                                                Stress Multiplier: {effect.stressMultiplier.toFixed(2)}x
                                            </div>
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
                                    <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">
                                        {t('dashboard.topology.title')}
                                    </h3>
                                    <span className="text-xs text-cyan-400 font-mono">
                                        {t('dashboard.topology.digital_twin')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)}
                                    className="text-[9px] text-cyan-500/70 hover:text-cyan-400 font-mono uppercase flex items-center gap-1"
                                >
                                    {t('dashboard.topology.full_view')} <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>

                            <TurbineSilhouette
                                health={scadaDiagnostics?.healthScore || 85}
                                vibration={technicalState.mechanical?.vibration || 0.032}
                                temp={technicalState.mechanical?.bearingTemp || 55}
                            />

                            <div className="grid grid-cols-2 border-t border-white/5">
                                <div className="p-4 flex flex-col items-center border-r border-white/5">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">
                                        {t('dashboard.topology.rated_power')}
                                    </span>
                                    <span className="text-xl font-mono text-cyan-400 font-black">
                                        {(assetIdentity?.machineConfig.ratedPowerMW || 4.2).toFixed(1)}
                                        <span className="text-[10px] text-slate-500 ml-1">MW</span>
                                    </span>
                                </div>
                                <div className="p-4 flex flex-col items-center">
                                    <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">
                                        {t('dashboard.topology.grid_freq')}
                                    </span>
                                    <span className={`text-xl font-mono font-black ${Math.abs(scadaFrequency - 50) > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {scadaFrequency.toFixed(2)}
                                        <span className="text-[10px] text-slate-500 ml-1">Hz</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: KPIs & STRATEGY (5 Columns) */}
                    <div className="lg:col-span-5 flex flex-col gap-5">
                        {/* PRIMARY RACK INSTRUMENTS */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <RackInstrument
                                title={t('dashboard.kpi.active_power')}
                                value={(assetIdentity?.machineConfig.ratedPowerMW || 4.2).toFixed(1)}
                                unit="MW"
                                icon={<Zap className="w-4 h-4 text-cyan-400" />}
                                status="nominal"
                                trendData={trendData.power}
                                isoRef="IEC 60041"
                                knowledgeLink={`/${ROUTES.LEARNING_LAB}`}
                                subtitle={t('dashboard.kpi.active_power_sub')}
                                onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                            />
                            <RackInstrument
                                title={t('dashboard.kpi.system_health')}
                                value={scadaDiagnostics?.healthScore || 85}
                                unit="%"
                                icon={<Activity className={`w-4 h-4 ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'text-red-400' : 'text-emerald-400'}`} />}
                                status={(scadaDiagnostics?.healthScore || 85) < 50 ? 'critical' : (scadaDiagnostics?.healthScore || 85) < 80 ? 'warning' : 'nominal'}
                                trendData={trendData.health}
                                isoRef="ISO 10816-3"
                                knowledgeLink={`/${ROUTES.LEARNING_LAB}`}
                                onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)}
                            />
                            <RackInstrument
                                title={t('dashboard.kpi.net_head')}
                                value={scadaHead.toFixed(1)}
                                unit="m"
                                icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                                status="nominal"
                                trendData={trendData.head}
                                subtitle={`Q: ${scadaFlow.toFixed(1)} m³/s`}
                                onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                            />
                        </div>

                        {/* PERFORMANCE GAP BAR */}
                        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-5">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-1">
                                        {t('dashboard.kpi.performance_gap')}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-black font-mono ${(technicalState.physics.performanceGap || 0) > 98 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {(technicalState.physics.performanceGap || 96.5).toFixed(1)}%
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-mono">
                                            {t('dashboard.kpi.vs_design')}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-1/2">
                                    <div className="h-3 bg-slate-800 rounded overflow-hidden relative">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, technicalState.physics.performanceGap || 96.5)}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                        <div className="absolute top-0 h-full w-0.5 bg-red-500" style={{ left: '95%' }} />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-mono text-slate-600 mt-1">
                                        <span>0%</span>
                                        <span className="text-red-500/70">95% LIMIT</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECONDARY METRICS ROW */}
                        <div className="grid grid-cols-2 gap-4">
                            <RackInstrument
                                title={t('dashboard.kpi.axial_thrust')}
                                value={(technicalState.physics?.axialThrustKN || 145).toFixed(0)}
                                unit="kN"
                                icon={<Gauge className="w-4 h-4 text-purple-400" />}
                                status={(technicalState.physics?.axialThrustKN || 0) > 200 ? 'critical' : (technicalState.physics?.axialThrustKN || 0) > 180 ? 'warning' : 'nominal'}
                                trendData={trendData.thrust}
                                isoRef="API 610"
                                subtitle={t('dashboard.kpi.axial_thrust_sub')}
                                onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                            />
                            <RackInstrument
                                title={t('dashboard.kpi.structural_life')}
                                value={(technicalState.structural?.remainingLife || 87.5).toFixed(1)}
                                unit="%"
                                icon={<Hammer className="w-4 h-4 text-amber-400" />}
                                status={(technicalState.structural?.remainingLife || 0) < 50 ? 'critical' : (technicalState.structural?.remainingLife || 0) < 75 ? 'warning' : 'nominal'}
                                isoRef="ASME B31.1"
                                subtitle={t('dashboard.kpi.structural_life_sub')}
                                onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.FORENSICS))}
                            />
                        </div>

                        {/* AI RECOMMENDATIONS */}
                        {aiCards.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest flex items-center gap-2">
                                    <Info className="w-3 h-3" />
                                    {t('dashboard.sentinel.title')}
                                </h3>
                                {aiCards.slice(0, 2).map((card) => (
                                    <div
                                        key={card.id}
                                        className={`p-4 rounded-lg border-l-4 ${card.severity === 'CRITICAL'
                                            ? 'border-l-red-500 bg-red-950/20 border border-red-500/20'
                                            : 'border-l-amber-500 bg-amber-950/20 border border-amber-500/20'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${card.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-bold font-mono uppercase tracking-wide ${card.severity === 'CRITICAL' ? 'text-red-300' : 'text-amber-300'}`}>
                                                    {card.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">{card.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <VibrationAnalyzer />
                    </div>

                    {/* RIGHT: FINANCE & WISDOM (3 Columns) */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                        {/* FINANCIAL SUMMARY */}
                        <GlassCard
                            title={t('dashboard.finance.title')}
                            icon={<DollarSign className="w-4 h-4 text-amber-400" />}
                            className="border-amber-500/20 bg-amber-950/5"
                        >
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">
                                        {t('dashboard.finance.maint_buffer')}
                                    </div>
                                    <div className="text-lg font-mono text-amber-400 font-bold">
                                        {(technicalState.financials?.maintenanceBufferEuro || 45000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">
                                        {t('dashboard.finance.annual_loss')}
                                    </div>
                                    <div className="text-base font-mono text-white font-bold">
                                        {(technicalState.financials?.lostRevenueEuro || 12500).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-amber-500/20">
                                    <div className="text-[9px] text-emerald-400 uppercase font-mono font-black mb-1 flex items-center justify-between">
                                        {t('dashboard.finance.predictive_savings')}
                                        <TrendingDown className="w-3 h-3" />
                                    </div>
                                    <div className="text-lg font-mono text-emerald-400 font-bold">
                                        {(technicalState.financials?.maintenanceSavingsEuro || 28000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* PROFIT INDEX */}
                        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest">
                                    {t('dashboard.finance.profit_index')}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white font-mono">
                                    {(technicalState.market?.profitabilityIndex || 1.24).toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">EUR/kWh</span>
                            </div>
                            <div className="mt-3 text-[9px] text-slate-600 font-mono">
                                {t('dashboard.finance.profit_basis')}
                            </div>
                        </div>

                        <EngineeringWisdomVault />
                        <SmartManual />
                    </div>
                </div>
            </div>
        </div>
    );
};