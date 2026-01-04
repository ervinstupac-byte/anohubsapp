import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { ExpertDiagnosisEngine } from '../../services/ExpertDiagnosisEngine';
import { DrTurbineAI, ActionCard } from '../../services/DrTurbineAI';
import { GlassCard } from '../ui/GlassCard';
import { ModernButton } from '../ui/ModernButton';
import { TypewriterText } from '../ui/TypewriterText';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, ShieldCheck, DollarSign, AlertTriangle, TrendingDown, Hammer, BarChart3, Clock } from 'lucide-react';
import { EngineeringWisdomVault } from './EngineeringWisdomVault';
import { VibrationAnalyzer } from '../diagnostic-twin/VibrationAnalyzer';
import { SmartManual } from './SmartManual';

// --- TECHNICAL TURBINE SILHOUETTE WITH GLASSMORPHISM ---
const TurbineSilhouette: React.FC<{
    health: number;
    vibration?: number;
    temp?: number;
    flow?: number;
    head?: number;
    frequency?: number;
    alarms?: string[]
}> = ({ health, vibration, temp, flow, head, frequency, alarms = [] }) => {
    const { t } = useTranslation();
    const isCritical = health < 50 || (frequency || 0) > 55 || (temp || 0) > 45;
    const bearingColor = (temp || 0) > 60 ? '#EF4444' : health > 80 ? '#22D3EE' : '#F59E0B';
    const shaftColor = (vibration || 0) > 0.05 ? '#EF4444' : health > 80 ? '#06B6D4' : '#F59E0B';
    const runnerColor = isCritical ? '#EF4444' : health > 80 ? '#0891B2' : '#F59E0B';

    return (
        <div className="relative w-full h-[450px] flex items-center justify-center group">
            {/* AMBIENT GLOW BEHIND TURBINE */}
            <div className={`absolute w-64 h-64 rounded-full blur-[80px] transition-colors duration-1000 ${isCritical ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}></div>

            {/* TECHNICAL TURBINE SILHOUETTE SVG */}
            <svg viewBox="0 0 250 400" className="h-full relative z-10 drop-shadow-[0_0_40px_rgba(6,182,212,0.2)] transition-transform duration-700 group-hover:scale-105">
                <defs>
                    <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <linearGradient id="coolGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
                        <stop offset="100%" stopColor="rgba(8, 145, 178, 0.1)" />
                    </linearGradient>
                </defs>

                {/* Generator Structure - More Industrial */}
                <rect x="45" y="20" width="160" height="75" rx="4" fill="url(#coolGradient)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <path d="M50 40 L200 40 M50 60 L200 60 M50 80 L200 80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                {/* Shaft - Dynamic Rotation Animation */}
                <motion.rect
                    x="118" y="95" width="14" height="180"
                    fill={shaftColor}
                    animate={{
                        opacity: [0.7, 0.9, 0.7],
                        boxShadow: isCritical ? ["0 0 10px red", "0 0 20px red", "0 0 10px red"] : ["0 0 5px cyan", "0 0 10px cyan", "0 0 5px cyan"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    rx="1"
                />

                {/* Bearings with Thermal Mapping */}
                <circle cx="125" cy="120" r="16" fill="rgba(15, 23, 42, 0.8)" stroke={bearingColor} strokeWidth="2" filter="url(#glassGlow)" />
                <circle cx="125" cy="245" r="16" fill="rgba(15, 23, 42, 0.8)" stroke={bearingColor} strokeWidth="2" filter="url(#glassGlow)" />

                {/* Francis Runner - Enhanced Geometry */}
                <g transform="translate(125,290)">
                    <path d="M-45,-15 C -45,-15 -25,-45 0,-40 C 25,-45 45,-15 45,-15 L 45,25 C 45,25 25,55 0,50 C -25,55 -45,25 -45,25 Z"
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={runnerColor}
                        strokeWidth="1.5"
                        filter="url(#glassGlow)" />

                    {/* Animated Blades */}
                    <motion.path
                        d="M-30,-10 L30,-10 M-35,5 L35,5 M-30,20 L30,20"
                        stroke={runnerColor}
                        strokeWidth="1"
                        opacity="0.3"
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </g>

                {/* Energy Flow Synthesis */}
                <motion.path
                    d="M40 330 Q 125 390 210 330"
                    fill="none"
                    stroke={isCritical ? "#EF4444" : "#22D3EE"}
                    strokeWidth="4"
                    strokeDasharray="12,6"
                    animate={{ strokeDashoffset: [100, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </svg>

            {/* FLOATING DATA NODES (UI HUD FEEL) */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-[20%] right-[10%] glass-panel p-3 border-cyan-500/30"
            >
                <div className="text-[9px] text-cyan-400 font-black uppercase tracking-widest mb-1">{t('executive.silhouette.bearingTemp')}</div>
                <div className={`text-xl font-mono font-black ${isCritical ? 'text-red-400' : 'text-white'}`}>{temp?.toFixed(1)}°C</div>
            </motion.div>

            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-[55%] left-[10%] glass-panel p-3 border-cyan-500/30"
            >
                <div className="text-[9px] text-cyan-400 font-black uppercase tracking-widest mb-1">{t('executive.silhouette.vibration')}</div>
                <div className={`text-xl font-mono font-black ${isCritical ? 'text-red-400' : 'text-white'}`}>{vibration?.toFixed(3)} <span className="text-[10px]">mm/s</span></div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-[10%] flex gap-4"
            >
                <div className="glass-panel px-4 py-2 border-cyan-500/30">
                    <div className="text-[8px] text-slate-400 font-black uppercase mb-1">{t('executive.silhouette.healthScore')}</div>
                    <div className={`text-sm font-black ${health > 80 ? 'text-cyan-400' : 'text-amber-400'}`}>{health}%</div>
                </div>
            </motion.div>
        </div>
    );
};

export const ExecutiveDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { technicalState, connectTwinToExpertEngine, getDrTurbineConsultation, createComplexIdentity } = useProjectEngine();

    const assetIdentity = useMemo(() => {
        return createComplexIdentity && createComplexIdentity() ? createComplexIdentity() : null;
    }, [createComplexIdentity, technicalState]);

    const scadaFlow = technicalState.francis?.sensors?.flow_rate || 42.5;
    const scadaHead = technicalState.francis?.sensors?.net_head || 152.0;
    const scadaFrequency = technicalState.francis?.sensors?.grid_frequency || 50.0;

    const [aiCards, setAiCards] = useState<ActionCard[]>([]);
    const [aiMessage, setAiMessage] = useState<string>('');

    const scadaDiagnostics = useMemo(() => {
        return connectTwinToExpertEngine(scadaFlow, scadaHead, scadaFrequency);
    }, [connectTwinToExpertEngine, scadaFlow, scadaHead, scadaFrequency]);

    useEffect(() => {
        if (assetIdentity) {
            const consultation = getDrTurbineConsultation(scadaFlow, scadaHead, scadaFrequency);
            setAiCards(consultation.cards);
            setAiMessage(consultation.voiceMessage);
        }
    }, [assetIdentity, getDrTurbineConsultation, scadaFlow, scadaHead, scadaFrequency]);

    return (
        <div className="p-8 pb-32 space-y-12 animate-fade-in max-w-[1600px] mx-auto min-h-screen bg-slate-950 relative overflow-hidden">
            {/* GLASSMORPHISM BACKGROUND EFFECTS */}
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2306b6d4" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50`}></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* GLASSMORPHISM HEADER */}
            <div className="flex justify-between items-end backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
                <div className="relative">
                    <div className="absolute -top-2 -left-2 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] relative z-10 uppercase flex items-center gap-2">
                        {t('commander.title').split(' ')[0]} <span className="text-cyan-400">{t('commander.title').split(' ')[1]}</span>
                        <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-slate-400 font-mono tracking-[0.3em] uppercase">{t('executive.subtitle')}</p>
                        <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-bold tracking-widest animate-pulse">
                            {t('commander.verified')}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-3 text-sm text-emerald-400 font-bold uppercase flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        {t('commander.neuralLink')}
                    </div>
                    <ModernButton
                        variant="primary"
                        className="backdrop-blur-md bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30"
                        onClick={() => window.dispatchEvent(new CustomEvent('ANOHUB_TRIGGER_FORENSIC_EXPORT'))}
                    >
                        {t('executive.actions.downloadBrief')}
                    </ModernButton>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: DIGITAL TWIN (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <GlassCard
                        variant="commander"
                        title={t('executive.twin.topology')}
                        subtitle={t('executive.twin.label')}
                        className="h-full flex flex-col"
                        noPadding
                    >
                        <div className="flex-grow flex items-center justify-center p-6">
                            <TurbineSilhouette
                                health={scadaDiagnostics?.healthScore || 85}
                                vibration={0.032}
                                temp={67.5}
                                flow={scadaFlow}
                                head={scadaHead}
                                frequency={scadaFrequency}
                                alarms={scadaDiagnostics?.criticalAlarms?.map((a: { message: string }) => a.message) || []}
                            />
                        </div>

                        {/* SENSOR FOOTER */}
                        <div className="grid grid-cols-2 gap-[1px] bg-white/5 border-t border-white/10">
                            <div className="p-4 flex flex-col items-center">
                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('executive.sensors.activePower')}</span>
                                <span className="text-xl font-mono text-cyan-400 font-black">
                                    {(assetIdentity?.machineConfig.ratedPowerMW || 0).toFixed(1)} <span className="text-[10px] text-slate-400">MW</span>
                                </span>
                            </div>
                            <div className="p-4 flex flex-col items-center border-l border-white/10">
                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('executive.sensors.gridFrequency')}</span>
                                <span className={`text-xl font-mono font-black ${scadaFrequency > 55 || scadaFrequency < 45 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                                    {scadaFrequency.toFixed(1)} <span className="text-[10px] text-slate-400">Hz</span>
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* MIDDLE: KPIS & STRATEGY (5 Columns) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                    <div className="grid grid-cols-3 gap-6">
                        <GlassCard variant="commander" noPadding className="relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-pulse"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Power</p>
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors">
                                        {(assetIdentity?.machineConfig.ratedPowerMW || 0).toFixed(1)}
                                    </span>
                                    <span className="text-sm text-slate-500 font-bold font-mono">MW</span>
                                </div>
                                <div className="mt-4 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 inline-flex items-center gap-1.5">
                                    <ShieldCheck className="w-3 h-3 text-cyan-500" />
                                    <span className="text-[9px] text-cyan-500/80 font-mono font-bold uppercase tracking-wider">Verified Precision</span>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard variant="commander" noPadding className="relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">System Health</p>
                                    <Activity className={`w-4 h-4 ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'text-red-500' : 'text-emerald-400'}`} />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-5xl font-black tracking-tighter transition-colors ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'text-red-500' : 'text-emerald-400'}`}>
                                        {scadaDiagnostics?.healthScore || 85}
                                    </span>
                                    <span className="text-sm text-slate-500 font-bold font-mono">%</span>
                                </div>
                                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scadaDiagnostics?.healthScore || 85}%` }}
                                        className={`h-full shadow-[0_0_15px_currentColor] ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'bg-red-500 text-red-500' : 'bg-emerald-400 text-emerald-400'}`}
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard variant="commander" noPadding className="relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Net Head</p>
                                    <TrendingUp className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
                                        {scadaHead.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-slate-500 font-bold font-mono">m</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">Flow: {scadaFlow.toFixed(1)} m³/s</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* PERFORMANCE GAP WIDGET (NC-4.2 Benchmarking) */}
                    <GlassCard variant="commander" noPadding className="relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-red-500"></div>
                        <div className="p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Performance Gap</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black tracking-tighter ${(technicalState.physics.performanceGap || 0) > 98 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {(technicalState.physics.performanceGap || 0).toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">vs Design</span>
                                </div>
                            </div>
                            <div className="w-1/2 h-2 bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${technicalState.physics.performanceGap || 0}%` }}
                                />
                                <div className="absolute top-0 right-0 h-full w-[2px] bg-red-500/50" style={{ left: '95%' }}></div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* PHASE 2: NEURAL EXPANSION ROW */}
                    <div className="grid grid-cols-2 gap-6">
                        <GlassCard variant="commander" className="border-l-4 border-l-purple-500 bg-purple-500/5">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Hammer className="w-3 h-3 text-purple-400" />
                                    Structural Integrity
                                </h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-2xl font-black text-white tracking-tighter">
                                            {technicalState.structural?.remainingLife.toFixed(1)}%
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-mono">LIFE</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-purple-500"
                                            animate={{ width: `${technicalState.structural?.remainingLife}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard variant="commander" className="border-l-4 border-l-amber-500 bg-amber-500/5">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <BarChart3 className="w-3 h-3 text-amber-400" />
                                    Profit Index
                                </h4>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">
                                {technicalState.market?.profitabilityIndex.toFixed(2)}
                            </div>
                        </GlassCard>
                    </div>

                    <GlassCard variant="commander" className="flex-grow flex flex-col relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] relative">
                                <span className="text-2xl">🧠</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t('executive.ai.title')}</h3>
                                <div className="text-sm text-cyan-400/90 font-mono tracking-tight mt-1">
                                    <TypewriterText text={aiMessage} speed={25} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {aiCards.map((card, index) => (
                                <GlassCard
                                    key={card.id}
                                    noPadding
                                    variant="deep"
                                    className={`border-l-4 ${card.severity === 'CRITICAL' ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'}`}
                                >
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className={`font-black uppercase text-sm ${card.severity === 'CRITICAL' ? 'text-red-300' : 'text-amber-300'}`}>{card.title}</h4>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-4">{card.message}</p>
                                        <ModernButton variant="secondary" className="w-full text-[11px] h-10">⚡ {card.actionLabel}</ModernButton>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </GlassCard>

                    {/* VIBRATION SPECTRUM (NC-4.2 FFT Layer) */}
                    <VibrationAnalyzer />
                </div>

                {/* RIGHT: FINANCE & WISDOM (3 Columns) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <GlassCard
                        variant="commander"
                        title="Risk vs. Finance"
                        icon={<DollarSign className="w-5 h-5 text-amber-400" />}
                        className="border-amber-500/30 bg-amber-500/5"
                    >
                        <div className="space-y-6">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Maintenance Buffer</div>
                                <div className="text-2xl font-mono text-amber-400 font-bold">
                                    {(technicalState.financials?.maintenanceBufferEuro || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Annual Revenue Loss</div>
                                <div className="text-xl font-mono text-white font-bold">
                                    {(technicalState.financials?.lostRevenueEuro || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-amber-500/20">
                                <div className="text-[10px] text-emerald-400 uppercase font-black mb-1 flex items-center justify-between">
                                    Annualized Maintenance Saver
                                    <TrendingDown className="w-3 h-3" />
                                </div>
                                <div className="text-2xl font-mono text-emerald-400 font-bold">
                                    {(technicalState.financials?.maintenanceSavingsEuro || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </div>
                                <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                                    Estimated savings through early anomaly detection and failure prevention.
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard
                        variant="commander"
                        title="Thrust Bearing Monitor"
                        icon={<Activity className="w-4 h-4 text-cyan-400" />}
                        className="bg-black/40 border-cyan-500/20"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Axial Thrust</div>
                                    <div className={`text-2xl font-mono font-black ${(technicalState.physics?.axialThrustKN || 0) > 180 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                                        {(technicalState.physics?.axialThrustKN || 0).toFixed(1)} <span className="text-[10px]">kN</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Limit</div>
                                    <div className="text-sm font-mono text-slate-300">250.0 kN</div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${(technicalState.physics?.axialThrustKN || 0) > 180 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (technicalState.physics?.axialThrustKN || 0) / 2.5)}%` }}
                                />
                            </div>
                            {(technicalState.physics?.axialThrustKN || 0) > 180 && (
                                <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Thrust Overload Risk</span>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <EngineeringWisdomVault />
                    <SmartManual />
                </div>
            </div>
        </div>
    );
};