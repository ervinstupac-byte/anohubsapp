import React, { useState, useEffect, useMemo } from 'react';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { ExpertDiagnosisEngine } from '../../services/ExpertDiagnosisEngine';
import { DrTurbineAI, ActionCard } from '../../services/DrTurbineAI';
import { GlassCard } from '../ui/GlassCard';
import { ModernButton } from '../ui/ModernButton';

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
    // Dynamic styles based on sensor data with glassmorphism effects
    const isCritical = health < 50 || (frequency || 0) > 55 || (temp || 0) > 80;
    const bearingColor = (temp || 0) > 60 ? '#EF4444' : health > 80 ? '#10B981' : '#F59E0B';
    const shaftColor = (vibration || 0) > 0.05 ? '#EF4444' : health > 80 ? '#3B82F6' : '#F59E0B';
    const runnerColor = isCritical ? '#EF4444' : health > 80 ? '#06B6D4' : '#F59E0B';

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center">
            {/* GLASSMORPHISM BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/1 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"></div>

            {/* TECHNICAL TURBINE SILHOUETTE SVG */}
            <svg viewBox="0 0 250 400" className="h-full relative z-10 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <defs>
                    <filter id="glassGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="alarmPulse">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <linearGradient id="metalGradient" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#E2E8F0" />
                        <stop offset="50%" stopColor="#CBD5E1" />
                        <stop offset="100%" stopColor="#94A3B8" />
                    </linearGradient>
                    <linearGradient id="glassGradient" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </linearGradient>
                </defs>

                {/* Generator Housing */}
                <rect x="50" y="30" width="150" height="60" rx="8" fill="url(#glassGradient)" stroke="#64748B" strokeWidth="1.5" opacity="0.8" />

                {/* Shaft with Vibration Indicator */}
                <rect x="115" y="90" width="20" height="180" fill={shaftColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.9" rx="2">
                    {(vibration || 0) > 0.05 && <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.8s" repeatCount="indefinite" />}
                </rect>

                {/* Upper Bearing */}
                <circle cx="125" cy="120" r="15" fill={bearingColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.9">
                    {(temp || 0) > 60 && <animate attributeName="fill" values="#EF4444;#DC2626;#EF4444" dur="1.2s" repeatCount="indefinite" />}
                </circle>

                {/* Lower Bearing */}
                <circle cx="125" cy="240" r="15" fill={bearingColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.9">
                    {(temp || 0) > 60 && <animate attributeName="fill" values="#EF4444;#DC2626;#EF4444" dur="1.2s" repeatCount="indefinite" />}
                </circle>

                {/* Francis Runner (Technical Detail) */}
                <g transform="translate(125,280)">
                    <path d="M-40,-20 C -40,-20 -20,-50 0,-45 C 20,-50 40,-20 40,-20 L 40,20 C 40,20 20,50 0,45 C -20,50 -40,20 -40,20 Z"
                        fill={runnerColor}
                        filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"}
                        opacity="0.9" />
                    {/* Runner Blades */}
                    <path d="M-35,-15 L 0,-40 L 35,-15" stroke="#64748B" strokeWidth="1" fill="none" opacity="0.6" />
                    <path d="M-35,0 L 0,-25 L 35,0" stroke="#64748B" strokeWidth="1" fill="none" opacity="0.6" />
                    <path d="M-35,15 L 0,-10 L 35,15" stroke="#64748B" strokeWidth="1" fill="none" opacity="0.6" />
                </g>

                {/* Water Flow Animation */}
                <path d="M30 320 Q 125 380 220 320" fill="none" stroke={isCritical ? "#EF4444" : "#06B6D4"} strokeWidth="3" strokeDasharray="8,4" opacity="0.7">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                </path>

                {/* Head Pressure Indicator */}
                <rect x="20" y="340" width="20" height={(head || 0) / 5} fill={isCritical ? "#EF4444" : "#10B981"} opacity="0.8" rx="2" />
                <text x="30" y="375" textAnchor="middle" fontSize="8" fill="#64748B">H</text>

                {/* Flow Rate Indicator */}
                <rect x="210" y="340" width="20" height={(flow || 0) / 2} fill={isCritical ? "#EF4444" : "#3B82F6"} opacity="0.8" rx="2" />
                <text x="220" y="375" textAnchor="middle" fontSize="8" fill="#64748B">Q</text>
            </svg>

            {/* GLASSMORPHISM SENSOR OVERLAYS */}
            <div className="absolute top-[25%] right-[15%] bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                <div className="text-[10px] text-cyan-300 font-mono font-bold">BEARING TEMP</div>
                <div className={`text-lg font-black ${isCritical ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {temp?.toFixed(1) || '--'}°C
                </div>
            </div>

            <div className="absolute top-[60%] left-[15%] bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                <div className="text-[10px] text-cyan-300 font-mono font-bold">VIBRATION</div>
                <div className={`text-lg font-black ${isCritical ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {vibration?.toFixed(3) || '--'} mm/s
                </div>
            </div>

            <div className="absolute bottom-[20%] left-[10%] bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                <div className="text-[10px] text-cyan-300 font-mono font-bold">GRID FREQ</div>
                <div className={`text-lg font-black ${(frequency || 0) > 55 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {frequency?.toFixed(1) || '--'} Hz
                </div>
            </div>

            <div className="absolute bottom-[20%] right-[10%] bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                <div className="text-[10px] text-cyan-300 font-mono font-bold">HEALTH SCORE</div>
                <div className={`text-lg font-black ${health < 50 ? 'text-red-400 animate-pulse' : health > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {health.toFixed(0)}%
                </div>
            </div>

            {/* CRITICAL ALARMS OVERLAY */}
            {alarms.length > 0 && (
                <div className="absolute top-4 left-4 right-4 bg-red-900/30 backdrop-blur-md border border-red-500/50 rounded-lg p-3 animate-pulse">
                    <div className="text-red-300 font-bold text-sm mb-1">🚨 CRITICAL ALARMS</div>
                    {alarms.slice(0, 2).map((alarm, idx) => (
                        <div key={idx} className="text-red-200 text-xs">{alarm}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ExecutiveDashboard: React.FC = () => {
    const { technicalState, connectSCADAToExpertEngine, getDrTurbineConsultation, createComplexIdentity } = useProjectEngine();

    // Use Adapter to get full Asset Identity
    const assetIdentity = useMemo(() => {
        return createComplexIdentity && createComplexIdentity() ? createComplexIdentity() : null;
    }, [createComplexIdentity, technicalState]);

    // SCADA Integration State
    const [scadaFlow, setScadaFlow] = useState(42.5);
    const [scadaHead, setScadaHead] = useState(452.0);
    const [scadaFrequency, setScadaFrequency] = useState(50.0);
    const [viewMode, setViewMode] = useState<'SCADA' | 'DIGITAL_TWIN' | 'AI_CONSULTANT'>('SCADA');

    // AI Consultant State
    const [aiCards, setAiCards] = useState<ActionCard[]>([]);
    const [aiMessage, setAiMessage] = useState<string>('');

    // Get diagnostics from SCADA inputs
    const scadaDiagnostics = useMemo(() => {
        return connectSCADAToExpertEngine(scadaFlow, scadaHead, scadaFrequency);
    }, [connectSCADAToExpertEngine, scadaFlow, scadaHead, scadaFrequency]);

    // --- EFFECT: Consult Dr. Turbine ---
    useEffect(() => {
        if (assetIdentity) {
            const consultation = getDrTurbineConsultation(scadaFlow, scadaHead, scadaFrequency);
            setAiCards(consultation.cards);
            setAiMessage(consultation.voiceMessage);
        }
    }, [assetIdentity, getDrTurbineConsultation, scadaFlow, scadaHead, scadaFrequency]);

    return (
        <div className="p-8 pb-32 space-y-12 animate-fade-in max-w-[1600px] mx-auto min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* GLASSMORPHISM BACKGROUND EFFECTS */}
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50`}></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

            {/* GLASSMORPHISM HEADER */}
            <div className="flex justify-between items-end backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
                <div className="relative">
                    <div className="absolute -top-2 -left-2 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
                    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] relative z-10">
                        ANOHUB <span className="text-cyan-400">PRIME</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-mono tracking-widest uppercase mt-2">Executive Engineering interface // v1.0.5 UNIFIED</p>
                </div>
                <div className="flex gap-4">
                    <div className="backdrop-blur-md bg-black/20 border border-white/20 rounded-xl px-6 py-3 text-sm text-white font-bold uppercase">
                        SCADA ACTIVE
                    </div>
                    <ModernButton variant="primary" className="backdrop-blur-md bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30">
                        DOWNLOAD BRIEF
                    </ModernButton>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: DIGITAL TWIN (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="h-full backdrop-blur-xl bg-white/5 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden p-6">
                        <div className="absolute top-0 right-0 p-4 opacity-30 font-black text-8xl text-cyan-400/10 select-none z-0">TWIN</div>

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                                Live Asset Topology
                            </h3>
                            <div className="flex-grow flex items-center justify-center py-8">
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

                            {/* GLASSMORPHISM SENSOR READOUT */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <div className="backdrop-blur-md bg-black/20 p-4 rounded-xl border border-white/10 shadow-lg">
                                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Active Power</span>
                                    <span className="text-2xl font-mono text-white font-black">{(assetIdentity?.machineConfig.ratedPowerMW || 0).toFixed(1)} <span className="text-cyan-400 text-sm">MW</span></span>
                                </div>
                                <div className="backdrop-blur-md bg-black/20 p-4 rounded-xl border border-white/10 shadow-lg">
                                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Grid Frequency</span>
                                    {/* CRITICAL FREQUENCY ALARM */}
                                    <span className={`text-2xl font-mono font-black ${scadaFrequency > 55 || scadaFrequency < 45
                                        ? 'text-red-400 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                                        : 'text-emerald-400'
                                        }`}>
                                        {scadaFrequency.toFixed(1)} <span className="text-cyan-400 text-sm">Hz</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE: KPIS & STRATEGY (5 Columns) */}
                <div className="lg:col-span-5 flex flex-col gap-8">

                    {/* GLASSMORPHISM KPI ROW */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="backdrop-blur-xl bg-white/5 border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-6">Unit Health</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-8xl font-black tracking-tighter drop-shadow-xl ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'text-red-400' :
                                    (scadaDiagnostics?.healthScore || 85) > 80 ? 'text-cyan-400' : 'text-yellow-400'
                                    }`}>
                                    {scadaDiagnostics?.healthScore || 85}
                                </span>
                                <span className="text-3xl text-slate-400 font-bold">%</span>
                            </div>
                            <div className="mt-6 h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className={`h-full shadow-[0_0_15px_cyan] transition-all duration-1000 ${(scadaDiagnostics?.healthScore || 85) < 50 ? 'bg-red-500' :
                                    (scadaDiagnostics?.healthScore || 85) > 80 ? 'bg-cyan-500' : 'bg-yellow-500'
                                    }`} style={{ width: `${scadaDiagnostics?.healthScore || 85}%` }}></div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-6">Financial Risk</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-8xl font-black text-red-400 tracking-tighter drop-shadow-xl animate-pulse">
                                    {Math.floor((scadaDiagnostics?.diagnostics?.cavitationRisk ? 150 : 85) / 10)}
                                </span>
                                <span className="text-3xl text-slate-400 font-bold">k€</span>
                            </div>
                            <p className="text-[10px] text-red-400/60 mt-6 uppercase font-mono">Projected Loss (30d)</p>
                        </div>
                    </div>

                    {/* DR. TURBINE AI CHAT INTERFACE */}
                    <div className="flex-grow backdrop-blur-xl bg-white/5 border border-cyan-500/20 rounded-2xl p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_25px_cyan] animate-pulse">
                                <span className="text-xl">🧠</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">Dr. Turbine AI</h3>
                                <p className="text-sm text-cyan-400/90 font-mono animate-pulse tracking-wider">{aiMessage}</p>
                            </div>
                        </div>

                        {/* PHYSICS-BASED DIAGNOSIS CHAT */}
                        <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {aiCards.length === 0 && (
                                <div className="text-center py-12 backdrop-blur-md bg-green-900/10 rounded-xl border border-green-500/20">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <p className="text-green-400 text-lg font-bold mb-2">ALL SYSTEMS NOMINAL</p>
                                    <p className="text-slate-400 text-sm">Hydraulic parameters within optimal range.</p>
                                    <p className="text-slate-500 text-xs">Cavitation risk: LOW • Bearing temp: NORMAL • Vibration: ACCEPTABLE</p>
                                </div>
                            )}

                            {aiCards.map((card, index) => (
                                <div key={card.id} className={`backdrop-blur-md p-5 rounded-xl border-l-4 animate-fade-in relative overflow-hidden ${card.severity === 'CRITICAL'
                                    ? 'bg-red-950/20 border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                    : 'bg-amber-950/20 border-l-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                    }`}>
                                    {/* Animated background for critical alerts */}
                                    {card.severity === 'CRITICAL' && (
                                        <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                                    )}

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className={`font-bold uppercase text-base ${card.severity === 'CRITICAL' ? 'text-red-300' : 'text-amber-300'
                                                }`}>{card.title}</h4>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md ${card.severity === 'CRITICAL'
                                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                } animate-pulse`}>
                                                {card.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-200 mb-4 leading-relaxed">{card.message}</p>

                                        {/* Physics-based explanation */}
                                        <div className="bg-black/20 rounded-lg p-3 mb-4 border border-white/10">
                                            <p className="text-xs text-cyan-300 font-mono mb-1">PHYSICS ANALYSIS:</p>
                                            <p className="text-xs text-slate-300">
                                                {card.severity === 'CRITICAL' && card.title.includes('GRID')
                                                    ? `Frequency deviation >5% indicates potential generator decoupling. Risk of mechanical resonance at ${scadaFrequency}Hz.`
                                                    : card.severity === 'CRITICAL' && card.title.includes('CAVITATION')
                                                        ? `Flow: ${scadaFlow} m³/s, Head: ${scadaHead}m exceeds cavitation threshold. Runner clearance may be insufficient.`
                                                        : 'System parameters within acceptable range. Monitoring continues.'
                                                }
                                            </p>
                                        </div>

                                        <ModernButton
                                            variant="secondary"
                                            className={`w-full text-sm h-10 backdrop-blur-md ${card.severity === 'CRITICAL'
                                                ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300'
                                                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-300'
                                                }`}
                                            onClick={() => {
                                                // Could trigger work orders, emergency protocols, etc.
                                                console.log('Action triggered:', card.actionFunction);
                                            }}
                                        >
                                            <span className="mr-2">⚡</span>
                                            {card.actionLabel}
                                        </ModernButton>
                                    </div>
                                </div>
                            ))}

                            {/* AI Thinking Indicator */}
                            {aiCards.length > 0 && (
                                <div className="flex items-center gap-3 text-cyan-400 text-sm animate-pulse">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                                    <span className="font-mono">Dr. Turbine analyzing hydraulic signatures...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: COMMAND & CONTROL (3 Columns) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* EMERGENCY PROTOCOLS WITH GLASSMORPHISM */}
                    <div className="backdrop-blur-xl bg-red-950/10 border border-red-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <h4 className="text-red-400 font-bold uppercase text-sm mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Emergency Protocols
                        </h4>
                        <button
                            className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all active:scale-95 border border-red-500/30"
                            onClick={() => {
                                if (confirm("INITIATE EMERGENCY SCRAM? This will trip the turbine and may cause downtime.")) {
                                    console.log('Emergency shutdown initiated');
                                }
                            }}
                        >
                            🚨 SCRAM UNIT 🚨
                        </button>
                        <p className="text-[10px] text-red-400/80 mt-4 text-center font-mono tracking-wider">SAFETY LOCK DISENGAGED</p>
                    </div>

                    {/* SCADA CONTROLS */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h4 className="text-white font-bold uppercase text-sm mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            SCADA Controls
                        </h4>
                        <div className="space-y-4">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Flow Rate (m³/s)</label>
                                <input
                                    type="number"
                                    value={scadaFlow}
                                    onChange={(e) => setScadaFlow(parseFloat(e.target.value))}
                                    className="w-full bg-transparent border-b border-slate-600 text-white text-lg font-mono focus:outline-none focus:border-cyan-400"
                                    step="0.1"
                                />
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Head (m)</label>
                                <input
                                    type="number"
                                    value={scadaHead}
                                    onChange={(e) => setScadaHead(parseFloat(e.target.value))}
                                    className="w-full bg-transparent border-b border-slate-600 text-white text-lg font-mono focus:outline-none focus:border-cyan-400"
                                    step="1"
                                />
                            </div>
                            <div className={`bg-slate-900/50 p-4 rounded-lg border ${scadaFrequency > 55 ? 'border-red-500' : 'border-slate-700'}`}>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Grid Frequency (Hz)</label>
                                <input
                                    type="number"
                                    value={scadaFrequency}
                                    onChange={(e) => setScadaFrequency(parseFloat(e.target.value))}
                                    className={`w-full bg-transparent border-b text-white text-lg font-mono focus:outline-none ${scadaFrequency > 55 ? 'border-red-400 text-red-400' : 'border-slate-600 focus:border-cyan-400'
                                        }`}
                                    step="0.1"
                                />
                                {scadaFrequency > 55 && (
                                    <p className="text-red-400 text-xs mt-2 animate-pulse">⚠️ CRITICAL FREQUENCY DETECTED</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
