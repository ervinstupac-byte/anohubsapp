import React, { useState, useEffect } from 'react';
import { useFleet } from '../contexts/FleetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { reportGenerator } from '../services/ReportGenerator.ts';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { DrTurbineAI, ActionCard } from '../services/DrTurbineAI.ts';
import { useProjectEngine } from '../contexts/ProjectContext.tsx';

// --- DIGITAL TWIN SVGs ---
const TurbineSilhouette: React.FC<{ health: number; vibration?: number; temp?: number }> = ({ health, vibration, temp }) => {
    // Dynamic styles based on sensor data
    const bearingColor = (temp || 0) > 60 ? '#EF4444' : '#10B981'; // User rule: >60C Red
    const shaftColor = (vibration || 0) > 0.05 ? '#EF4444' : '#3B82F6';

    return (
        <div className="relative w-full h-[300px] flex items-center justify-center">
            {/* SVG TURBINE SILHOUETTE */}
            <svg viewBox="0 0 200 300" className="h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <linearGradient id="metal" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#475569" /><stop offset="50%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
                </defs>

                {/* Generator Stator */}
                <path d="M40 20 L160 20 L160 80 L40 80 Z" fill="url(#metal)" stroke="#64748b" strokeWidth="2" />

                {/* Shaft - Dynamic Color */}
                <rect x="90" y="80" width="20" height="150" fill={shaftColor} filter="url(#glow)" opacity="0.8">
                    {(vibration || 0) > 0.05 && <animate attributeName="opacity" values="0.8;0.4;0.8" dur="0.5s" repeatCount="indefinite" />}
                </rect>

                {/* Bearing Block - Dynamic Color */}
                <rect x="70" y="140" width="60" height="20" rx="5" fill={bearingColor} stroke="white" strokeWidth="1">
                    {(temp || 0) > 60 && <animate attributeName="fill" values="#EF4444;#7F1D1D;#EF4444" dur="1s" repeatCount="indefinite" />}
                </rect>

                {/* Runner (Francis Style) */}
                <path d="M50 230 C 50 230, 90 280, 100 290 C 110 280, 150 230, 150 230 L 50 230" fill="url(#metal)" stroke="#38bdf8" />

                {/* Flow lines */}
                <path d="M20 250 Q 100 320 180 250" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5,5" opacity="0.5">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                </path>
            </svg>

            {/* SENSOR LABELS (Overlay) */}
            <div className="absolute top-[45%] right-[20%] text-[9px] text-white bg-slate-900/80 px-2 py-1 rounded border border-white/10">
                BRG_T: {temp?.toFixed(1) || '--'}°C
            </div>
            <div className="absolute bottom-[30%] left-[20%] text-[9px] text-white bg-slate-900/80 px-2 py-1 rounded border border-white/10">
                VIB: {vibration?.toFixed(3) || '--'} mm/s
            </div>
        </div>
    );
};

export const ExecutiveDashboard: React.FC = () => {
    const { fleetReports, totalMoneyAtRisk, globalFleetHealth } = useFleet();
    const { triggerEmergency, telemetry } = useTelemetry();
    const { technicalState } = useProjectEngine();
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(fleetReports[0]?.assetId || null);

    // Derived State
    const selectedReport = fleetReports.find(r => r.assetId === selectedAssetId) || fleetReports[0];
    const liveTelemetry = selectedReport ? telemetry[selectedReport.assetId] : null;

    // Dr. Turbine AI State
    const [aiCards, setAiCards] = useState<ActionCard[]>([]);
    const [aiMessage, setAiMessage] = useState("System analyzing...");

    // --- EFFECT: Consult Dr. Turbine ---
    useEffect(() => {
        if (technicalState.assetIdentity && liveTelemetry) {
            // Live Grid Freq simulation 
            // (In a real app, this comes from liveTelemetry, we default to 50 if missing)
            const freq = 50.0;

            const consultation = DrTurbineAI.consult(
                technicalState.assetIdentity,
                technicalState.assetIdentity.operationalMapping.currentPoint?.flowM3S || 10,
                technicalState.assetIdentity.operationalMapping.currentPoint?.headM || 50,
                freq
            );

            setAiCards(consultation.cards);
            setAiMessage(consultation.voiceMessage);
        }
    }, [technicalState, liveTelemetry]);

    const handleExport = () => {
        const reportData = {
            fleetHealth: globalFleetHealth,
            totalMoneyAtRisk: totalMoneyAtRisk,
            reports: fleetReports.map(r => ({
                assetName: r.assetName,
                score: r.healthScore,
                efficiency: r.efficiencyIndex,
                risk: r.moneyAtRisk,
                readiness: r.readiness
            })),
            integrityHash: 'ANO-SHA256-' + Math.random().toString(16).slice(2, 10).toUpperCase()
        };
        const blob = reportGenerator.generateExecutiveBriefing(reportData);
        reportGenerator.downloadReport(blob, `Executive_Briefing_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="p-8 pb-32 space-y-12 animate-fade-in max-w-[1600px] mx-auto min-h-screen bg-[url('/assets/images/grid-bg.png')] bg-fixed bg-cover">

            {/* TOP BAR */}
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        ANOHUB <span className="text-cyan-400">PRIME</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-mono tracking-widest uppercase mt-2">Executive Engineering interface // v1.0.4</p>
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-sm text-white outline-none font-bold uppercase cursor-pointer hover:border-cyan-500/50 transition-all"
                        value={selectedAssetId || ''}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                    >
                        {fleetReports.map(r => <option key={r.assetId} value={r.assetId}>{r.assetName}</option>)}
                    </select>
                    <ModernButton variant="primary" onClick={handleExport} icon={<span>📑</span>}>
                        DOWNLOAD BRIEF
                    </ModernButton>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: DIGITAL TWIN (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <GlassCard className="h-full border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50 font-black text-8xl text-white/5 select-none z-0">TWIN</div>

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-widest mb-2">Live Asset Topology</h3>
                            <div className="flex-grow flex items-center justify-center py-8">
                                <TurbineSilhouette
                                    health={selectedReport.healthScore}
                                    vibration={liveTelemetry?.vibration}
                                    temp={liveTelemetry?.temperature}
                                />
                            </div>

                            {/* LIVE SENSOR READOUT (Grid Layout) */}
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="bg-black/40 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-slate-500 uppercase block">Active Power</span>
                                    <span className="text-xl font-mono text-white">{(liveTelemetry?.output || 0).toFixed(1)} MW</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-slate-500 uppercase block">Grid Freq</span>
                                    <span className={`text-xl font-mono ${((liveTelemetry as any)?.rpm || 50) < 49.5 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>50.00 Hz</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* MIDDLE: KPIS & STRATEGY (5 Columns) */}
                <div className="lg:col-span-5 flex flex-col gap-8">

                    {/* GIANT KPI ROW */}
                    <div className="grid grid-cols-2 gap-6">
                        <GlassCard className="border-t-4 border-t-cyan-500 bg-gradient-to-br from-slate-900/90 to-slate-950/90 hover:scale-[1.02] transition-transform">
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-4">Unit Health</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-white tracking-tighter">{selectedReport.healthScore.toFixed(0)}</span>
                                <span className="text-2xl text-slate-600 font-bold">%</span>
                            </div>
                            <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 shadow-[0_0_15px_cyan]" style={{ width: `${selectedReport.healthScore}%` }}></div>
                            </div>
                        </GlassCard>

                        <GlassCard className="border-t-4 border-t-red-500 bg-gradient-to-br from-slate-900/90 to-slate-950/90 hover:scale-[1.02] transition-transform">
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-4">Financial Risk</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-red-500 tracking-tighter">{(selectedReport.moneyAtRisk / 1000).toFixed(0)}</span>
                                <span className="text-2xl text-slate-600 font-bold">k€</span>
                            </div>
                            <p className="text-[10px] text-red-400/60 mt-4 uppercase font-mono">Projected Loss (30d)</p>
                        </GlassCard>
                    </div>

                    {/* Dr. Turbine Chat Interface */}
                    <div className="flex-grow bg-[#000000]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_cyan]">
                                <span className="text-xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Dr. Turbine AI</h3>
                                <p className="text-xs text-cyan-400/80 animate-pulse">{aiMessage}</p>
                            </div>
                        </div>

                        {/* Action Cards Container */}
                        <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {aiCards.length === 0 && (
                                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                    <span className="text-3xl block mb-2">✅</span>
                                    <p className="text-slate-400 text-sm">No critical anomalies detected.</p>
                                    <p className="text-slate-600 text-xs">System operating within nominal parameters.</p>
                                </div>
                            )}

                            {aiCards.map((card) => (
                                <div key={card.id} className={`p-4 rounded-xl border-l-4 ${card.severity === 'CRITICAL' ? 'bg-red-950/30 border-l-red-500' : 'bg-amber-950/30 border-l-amber-500'} animate-fade-in`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold uppercase text-sm ${card.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>{card.title}</h4>
                                        <span className="text-[9px] font-black bg-black/40 px-2 py-0.5 rounded text-white">{card.severity}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 mb-4">{card.message}</p>
                                    <ModernButton variant="secondary" className="w-full text-xs h-8 bg-white/10 hover:bg-white/20 border-white/20">
                                        ⚡ {card.actionLabel}
                                    </ModernButton>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: COMMAND & CONTROL (3 Columns) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Manual Override Switch */}
                    <GlassCard className="bg-red-950/10 border-red-500/20">
                        <h4 className="text-red-500 font-bold uppercase text-xs mb-4">Emergency Protocols</h4>
                        <button
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all active:scale-95"
                            onClick={() => {
                                if (confirm("INITIATE EMERGENCY SCRAM? This will trip the turbine.")) {
                                    triggerEmergency(selectedReport.assetId, 'vibration_excess');
                                }
                            }}
                        >
                            SCRAM UNIT
                        </button>
                        <p className="text-[9px] text-red-400/60 mt-2 text-center">Safety Lock Disengaged</p>
                    </GlassCard>

                    {/* Strategic Feed */}
                    <GlassCard title="Global Intelligence">
                        <div className="space-y-4 mt-2">
                            {[
                                { time: '10:42', msg: 'Grid frequency deviation detected (+0.05Hz)' },
                                { time: '09:15', msg: 'Shift handover complete. No incidents.' },
                                { time: '08:30', msg: 'Daily market bid accepted @ €150/MWh' }
                            ].map((log, i) => (
                                <div key={i} className="flex gap-3 text-xs border-b border-white/5 pb-2 last:border-0">
                                    <span className="text-slate-500 font-mono">{log.time}</span>
                                    <span className="text-slate-300">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
