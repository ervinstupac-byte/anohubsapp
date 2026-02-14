import React, { useState, useEffect } from 'react';
import { useFleet } from '../contexts/FleetContext.tsx';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore.ts';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { reportGenerator } from '../services/ReportGenerator.ts';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { DrTurbineAI, ActionCard } from '../services/DrTurbineAI.ts';
import { PhysicsEngine } from '../core/PhysicsEngine.ts';
import { ExpertDiagnosisEngine } from '../features/physics-core/ExpertDiagnosisEngine.ts';
import idAdapter from '../utils/idAdapter.ts';
import { Decimal } from 'decimal.js';
import { ENGINEERING_CONSTANTS } from '../core/TechnicalSchema.ts';
import { FinancialImpactEngine } from '../services/core/FinancialImpactEngine.ts';

// --- ENHANCED TECHNICAL TURBINE SILHOUETTE WITH GLASSMORPHISM ---
const TurbineSilhouette: React.FC<{
    health: number;
    vibration?: number;
    temp?: number;
    flow?: number;
    head?: number;
    frequency?: number;
    alarms?: string[]
}> = ({ health, vibration, temp, flow, head, frequency, alarms = [] }) => {
    // Dynamic styles based on sensor data with enhanced glassmorphism effects
    const isCritical = health < 50 || (frequency || 0) > 55 || (temp || 0) > 80;
    const bearingColor = (temp || 0) > 60 ? '#EF4444' : health > 80 ? '#10B981' : '#F59E0B';
    const shaftColor = (vibration || 0) > 0.05 ? '#EF4444' : health > 80 ? '#3B82F6' : '#F59E0B';
    const runnerColor = isCritical ? '#EF4444' : health > 80 ? '#06B6D4' : '#F59E0B';

    return (
        <div className="relative w-full h-[450px] flex items-center justify-center">
            {/* GLASSMORPHISM MULTI-LAYER BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/3 to-white/1 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]"></div>
            <div className="absolute inset-2 bg-gradient-to-tl from-cyan-500/5 to-blue-500/5 backdrop-blur-xl border border-white/5 rounded-2xl"></div>

            {/* TECHNICAL TURBINE SILHOUETTE SVG - ENHANCED DETAIL */}
            <svg viewBox="0 0 300 450" className="h-full relative z-10 drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                <defs>
                    <filter id="glassGlow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="alarmPulse">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neonGlow">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="metalGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#F1F5F9" />
                        <stop offset="30%" stopColor="#CBD5E1" />
                        <stop offset="70%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#64748B" />
                    </radialGradient>
                    <linearGradient id="glassGradient" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
                    </linearGradient>
                    <linearGradient id="waterGradient" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="50%" stopColor="#0891B2" />
                        <stop offset="100%" stopColor="#0E7490" />
                    </linearGradient>
                </defs>

                {/* Generator Housing - Enhanced Glass Effect */}
                <rect x="75" y="40" width="150" height="70" rx="12" fill="url(#glassGradient)" stroke="#64748B" strokeWidth="2" opacity="0.9" filter="url(#glassGlow)" />
                <rect x="85" y="50" width="130" height="50" rx="8" fill="url(#metalGradient)" opacity="0.7" />

                {/* Shaft with Vibration Indicator - Enhanced */}
                <rect x="140" y="110" width="20" height="220" fill={shaftColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.95" rx="3">
                    {(vibration || 0) > 0.05 && <animate attributeName="opacity" values="0.95;0.6;0.95" dur="0.8s" repeatCount="indefinite" />}
                </rect>

                {/* Upper Bearing - Enhanced with Detail */}
                <circle cx="150" cy="145" r="18" fill={bearingColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.95" stroke="#64748B" strokeWidth="1" />
                <circle cx="150" cy="145" r="12" fill="url(#metalGradient)" opacity="0.8" />
                {(temp || 0) > 60 && <animate attributeName="fill" values="#EF4444;#DC2626;#EF4444" dur="1.2s" repeatCount="indefinite" />}

                {/* Lower Bearing - Enhanced with Detail */}
                <circle cx="150" cy="290" r="18" fill={bearingColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.95" stroke="#64748B" strokeWidth="1" />
                <circle cx="150" cy="290" r="12" fill="url(#metalGradient)" opacity="0.8" />
                {(temp || 0) > 60 && <animate attributeName="fill" values="#EF4444;#DC2626;#EF4444" dur="1.2s" repeatCount="indefinite" />}

                {/* Francis Runner - Highly Detailed Technical Representation */}
                <g transform="translate(150,330)">
                    {/* Outer Runner Ring */}
                    <circle cx="0" cy="0" r="45" fill={runnerColor} filter={isCritical ? "url(#alarmPulse)" : "url(#glassGlow)"} opacity="0.9" stroke="#64748B" strokeWidth="1" />
                    <circle cx="0" cy="0" r="38" fill="url(#metalGradient)" opacity="0.8" />

                    {/* Runner Blades - Technical Detail */}
                    {Array.from({ length: 16 }, (_, i) => {
                        const angle = (i * 360) / 16;
                        const radian = (angle * Math.PI) / 180;
                        return (
                            <path
                                key={i}
                                d={`M ${Math.cos(radian) * 15} ${Math.sin(radian) * 15} L ${Math.cos(radian) * 35} ${Math.sin(radian) * 35}`}
                                stroke="#64748B"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.7"
                            />
                        );
                    })}

                    {/* Crown and Band Detail */}
                    <circle cx="0" cy="0" r="42" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                </g>

                {/* Enhanced Water Flow Animation */}
                <path d="M45 380 Q 150 420 255 380" fill="none" stroke={isCritical ? "#EF4444" : "url(#waterGradient)"} strokeWidth="4" strokeDasharray="12,6" opacity="0.8">
                    <animate attributeName="stroke-dashoffset" from="120" to="0" dur="2s" repeatCount="indefinite" />
                </path>

                {/* Water Particles Effect */}
                <g opacity="0.6">
                    <circle cx="100" cy="390" r="2" fill="#06B6D4">
                        <animateMotion dur="3s" repeatCount="indefinite">
                            <path d="M0,0 Q50,10 100,0" />
                        </animateMotion>
                    </circle>
                    <circle cx="150" cy="385" r="1.5" fill="#0891B2">
                        <animateMotion dur="2.5s" repeatCount="indefinite">
                            <path d="M0,0 Q50,-5 100,0" />
                        </animateMotion>
                    </circle>
                    <circle cx="200" cy="392" r="2.5" fill="#0E7490">
                        <animateMotion dur="3.5s" repeatCount="indefinite">
                            <path d="M0,0 Q50,8 100,0" />
                        </animateMotion>
                    </circle>
                </g>

                {/* Head Pressure Indicator - Enhanced */}
                <rect x="30" y="410" width="25" height={Math.max(10, Math.min(60, (head || 0) / 5))} fill={isCritical ? "#EF4444" : "#10B981"} opacity="0.9" rx="3" filter="url(#glassGlow)" />
                <rect x="35" y="415" width="15" height={Math.max(5, Math.min(50, (head || 0) / 6))} fill={isCritical ? "#DC2626" : "#059669"} opacity="0.7" />
                <text x="42.5" y="440" textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="bold">HEAD</text>
                <text x="42.5" y="452" textAnchor="middle" fontSize="8" fill="#475569">{(head || 0).toFixed(0)}m</text>

                {/* Flow Rate Indicator - Enhanced */}
                <rect x="245" y="410" width="25" height={Math.max(10, Math.min(60, (flow || 0) / 3))} fill={isCritical ? "#EF4444" : "#3B82F6"} opacity="0.9" rx="3" filter="url(#glassGlow)" />
                <rect x="250" y="415" width="15" height={Math.max(5, Math.min(50, (flow || 0) / 4))} fill={isCritical ? "#DC2626" : "#2563EB"} opacity="0.7" />
                <text x="257.5" y="440" textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="bold">FLOW</text>
                <text x="257.5" y="452" textAnchor="middle" fontSize="8" fill="#475569">{(flow || 0).toFixed(1)}m³/s</text>
            </svg>

            {/* ENHANCED GLASSMORPHISM SENSOR OVERLAYS */}
            <div className="absolute top-[20%] right-[8%] bg-black/25 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="text-[11px] text-cyan-300 font-mono font-bold uppercase tracking-wider">Bearing Temperature</div>
                <div className={`text-xl font-black ${isCritical ? 'text-red-400 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'}`}>
                    {temp?.toFixed(1) || '--'}°C
                </div>
            </div>

            <div className="absolute top-[55%] left-[8%] bg-black/25 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="text-[11px] text-cyan-300 font-mono font-bold uppercase tracking-wider">Vibration RMS</div>
                <div className={`text-xl font-black ${isCritical ? 'text-red-400 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'}`}>
                    {vibration?.toFixed(3) || '--'} mm/s
                </div>
            </div>

            <div className="absolute bottom-[15%] left-[8%] bg-black/25 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="text-[11px] text-cyan-300 font-mono font-bold uppercase tracking-wider">Grid Frequency</div>
                <div className={`text-xl font-black ${(frequency || 0) > 55 ? 'text-red-400 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'}`}>
                    {frequency?.toFixed(1) || '--'} Hz
                </div>
            </div>

            <div className="absolute bottom-[15%] right-[8%] bg-black/25 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="text-[11px] text-cyan-300 font-mono font-bold uppercase tracking-wider">Health Score</div>
                <div className={`text-xl font-black ${health < 50 ? 'text-red-400 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : health > 80 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'}`}>
                    {health.toFixed(0)}%
                </div>
            </div>

            {/* ENHANCED CRITICAL ALARMS OVERLAY WITH NEON EFFECTS */}
            {alarms.length > 0 && (
                <div className="absolute top-6 left-6 right-6 bg-red-900/40 backdrop-blur-xl border border-red-500/60 rounded-xl p-4 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        <div className="text-red-300 font-bold text-sm uppercase tracking-wider">Critical System Alarms</div>
                    </div>
                    {alarms.slice(0, 2).map((alarm, idx) => (
                        <div key={idx} className="text-red-200 text-xs font-mono bg-red-950/30 p-2 rounded border border-red-500/30">
                            {alarm}
                        </div>
                    ))}
                </div>
            )}

            {/* FREQUENCY CRITICAL WARNING - SPECIAL CASE FOR 98.2 Hz */}
            {(frequency || 0) > 55 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/20 backdrop-blur-xl border-2 border-red-500 rounded-full p-6 animate-pulse shadow-[0_0_60px_rgba(239,68,68,0.6)]">
                    <div className="text-center">
                        <div className="text-red-300 font-black text-2xl mb-1">⚠️ CRITICAL</div>
                        <div className="text-red-200 font-bold text-sm">Grid Frequency: {frequency?.toFixed(1)} Hz</div>
                        <div className="text-red-400 text-xs font-mono">Risk of Mechanical Destruction</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ExecutiveDashboard: React.FC = () => {
    const { fleetReports, totalMoneyAtRisk, globalFleetHealth } = useFleet();
    const { triggerEmergency, telemetry } = useTelemetry();
    const telemetryStore = useTelemetryStore();
    
    // Legacy context replacement - using telemetryStore as the source of truth
    const technicalState = telemetryStore;

    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(fleetReports[0]?.assetId || null);

    // SCADA Integration State
    const [scadaFlow, setScadaFlow] = useState<number>(42.5);
    const [scadaHead, setScadaHead] = useState<number>(152.0);
    const [scadaFreq, setScadaFreq] = useState<number>(50.0);

    // Derived State
    const selectedReport = fleetReports.find(r => r.assetId === selectedAssetId) || fleetReports[0];
    const liveTelemetry = selectedReport ? telemetry[selectedReport.assetId] : null;

    // Dr. Turbine AI State - Enhanced with SCADA
    const [aiCards, setAiCards] = useState<ActionCard[]>([]);
    const [aiMessage, setAiMessage] = useState("AI analyzing SCADA signals...");
    const [scadaDiagnostics, setScadaDiagnostics] = useState<any>(null);

    // Helper to bridge Simple Identity -> Complex AssetIdentity
    const createComplexIdentity = () => {
        if (!telemetryStore.identity) return null;
        return {
            ...telemetryStore.identity,
            manufacturer: telemetryStore.identity.manufacturer || 'AnoHUB Legacy',
            machineConfig: telemetryStore.identity.machineConfig || {
                orientation: 'VERTICAL',
                transmissionType: 'DIRECT',
                ratedPowerMW: 10,
                ratedSpeedRPM: 500,
                ratedHeadM: 100,
                ratedFlowM3S: 10,
                runnerDiameterMM: 1500,
                numberOfBlades: 15
            }
        };
    };

    // Helper for SCADA connection
    const connectSCADAToExpertEngine = (flow: number, head: number, frequency: number) => {
        // Construct simulated state for physics engine
        const scadaState: any = {
            ...telemetryStore,
            hydraulic: {
                ...telemetryStore.hydraulic,
                flowRate: new Decimal(flow),
                waterHead: new Decimal(head),
                flow: flow,
                head: head
            },
            physics: {
                ...telemetryStore.physics,
                hoopStress: telemetryStore.physics.hoopStress || new Decimal(0),
                powerMW: new Decimal(0), // Will be recalculated
                surgePressure: telemetryStore.physics.surgePressure || new Decimal(0),
            },
            penstock: {
                ...telemetryStore.penstock,
                materialYieldStrength: telemetryStore.penstock.materialYieldStrength || 355
            }
        };

        const physicsResult = PhysicsEngine.recalculatePhysics(scadaState);
        const diagnosis = ExpertDiagnosisEngine.runExpertDiagnosis(physicsResult, scadaState);

        const criticalAlarms = diagnosis.messages
            .filter(m => diagnosis.severity === 'CRITICAL')
            .map(m => ({ message: m.en }));

        return {
            healthScore: diagnosis.severity === 'CRITICAL' ? 40 : diagnosis.severity === 'WARNING' ? 70 : 98,
            criticalAlarms,
            diagnostics: diagnosis
        };
    };

    // Real-time Financial Risk
    const calculateIntegratedFinancialRisk = () => {
        if (!selectedReport) return totalMoneyAtRisk;
        // Simple override: if critical, assume high risk
        if (scadaDiagnostics?.healthScore < 50) return 50000;
        return selectedReport.moneyAtRisk;
    };

    const integratedRisk = calculateIntegratedFinancialRisk();

    // --- EFFECT: SCADA Integration with Expert Diagnosis Engine ---
    useEffect(() => {
        if (telemetryStore.identity) {
            // Connect SCADA inputs to Expert Diagnosis Engine
            const diagnostics = connectSCADAToExpertEngine(scadaFlow, scadaHead, scadaFreq);
            setScadaDiagnostics(diagnostics);

            // Enhanced Dr. Turbine consultation with SCADA data
            const complexIdentity = createComplexIdentity();
            if (complexIdentity) {
                const consultation = DrTurbineAI.consult(
                    complexIdentity,
                    scadaFlow,
                    scadaHead,
                    scadaFreq
                );

                setAiCards(consultation.cards);
                setAiMessage(consultation.voiceMessage);
            }

            // Trigger critical alarm for frequency 98.2 Hz
            if (scadaFreq >= 98.2) {
                setAiMessage("🚨 CRITICAL: Grid frequency 98.2 Hz detected. Mechanical destruction risk!");
                // Add critical frequency alarm card
                const criticalFreqCard: ActionCard = {
                    id: 'critical-frequency-98-2',
                    title: 'GRID FREQUENCY CRITICAL',
                    message: `Frequency: ${scadaFreq} Hz exceeds safe limits (>55 Hz). Risk of mechanical destruction at 98.2 Hz.`,
                    severity: 'CRITICAL',
                    actionLabel: 'EMERGENCY SHUTDOWN',
                    actionFunction: 'emergency_shutdown'
                };
                setAiCards(prev => [criticalFreqCard, ...prev]);
            }
        }
    }, [telemetryStore.identity, scadaFlow, scadaHead, scadaFreq]);

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
        <div className="p-8 pb-32 space-y-12 animate-fade-in max-w-[1600px] mx-auto min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* GLASSMORPHISM BACKGROUND EFFECTS */}
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
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
                    <select
                        className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 text-sm text-white outline-none font-bold uppercase cursor-pointer hover:border-cyan-500/50 transition-all shadow-lg"
                        value={selectedAssetId || ''}
                        onChange={(e) => setSelectedAssetId(idAdapter.toNumber(e.target.value))}
                    >
                        {fleetReports.map(r => <option key={r.assetId} value={r.assetId}>{r.assetName}</option>)}
                    </select>
                    <ModernButton variant="primary" onClick={handleExport} icon={<span>📑</span>} className="backdrop-blur-md bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30">
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
                                    health={scadaDiagnostics?.healthScore ?? selectedReport.healthScore}
                                    vibration={liveTelemetry?.vibration}
                                    temp={liveTelemetry?.temperature}
                                    flow={scadaFlow}
                                    head={scadaHead}
                                    frequency={scadaFreq}
                                    alarms={scadaDiagnostics?.criticalAlarms?.map((a: any) => a.message) || []}
                                />
                            </div>

                            {/* SCADA CONTROLS - GLASSMORPHISM INTERFACE */}
                            <div className="mt-auto space-y-4">
                                {/* SCADA Input Controls */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="backdrop-blur-xl bg-black/25 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                        <span className="text-[10px] text-cyan-300 uppercase block font-bold mb-2">Flow Rate (SCADA)</span>
                                        <input
                                            type="number"
                                            value={scadaFlow}
                                            onChange={(e) => setScadaFlow(Number(e.target.value))}
                                            className="w-full bg-transparent text-white text-lg font-mono font-black text-center focus:outline-none"
                                            step="0.1"
                                            min="0"
                                            max="500"
                                        />
                                        <span className="text-cyan-400 text-xs font-mono">m³/s</span>
                                    </div>
                                    <div className="backdrop-blur-xl bg-black/25 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                        <span className="text-[10px] text-cyan-300 uppercase block font-bold mb-2">Head (SCADA)</span>
                                        <input
                                            type="number"
                                            value={scadaHead}
                                            onChange={(e) => setScadaHead(Number(e.target.value))}
                                            className="w-full bg-transparent text-white text-lg font-mono font-black text-center focus:outline-none"
                                            step="1"
                                            min="0"
                                            max="1000"
                                        />
                                        <span className="text-cyan-400 text-xs font-mono">m</span>
                                    </div>
                                    <div className="backdrop-blur-xl bg-black/25 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                        <span className="text-[10px] text-cyan-300 uppercase block font-bold mb-2">Frequency (SCADA)</span>
                                        <input
                                            type="number"
                                            value={scadaFreq}
                                            onChange={(e) => setScadaFreq(Number(e.target.value))}
                                            className={`w-full bg-transparent text-lg font-mono font-black text-center focus:outline-none ${scadaFreq >= 98.2 ? 'text-red-400 animate-pulse' : 'text-white'
                                                }`}
                                            step="0.1"
                                            min="45"
                                            max="120"
                                        />
                                        <span className="text-cyan-400 text-xs font-mono">Hz</span>
                                    </div>
                                </div>

                                {/* Enhanced Sensor Readout */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="backdrop-blur-xl bg-black/25 p-4 rounded-xl border border-white/15 shadow-lg">
                                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Active Power</span>
                                        <span className="text-2xl font-mono text-white font-black">{(telemetryStore.physics?.powerMW?.toNumber?.() || 0).toFixed(1)} <span className="text-cyan-400 text-sm">MW</span></span>
                                    </div>
                                    <div className="backdrop-blur-xl bg-black/25 p-4 rounded-xl border border-white/15 shadow-lg">
                                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Health Score</span>
                                        <span className={`text-2xl font-mono font-black ${scadaDiagnostics?.healthScore < 50 ? 'text-red-400 animate-pulse' :
                                            scadaDiagnostics?.healthScore > 80 ? 'text-green-400' : 'text-yellow-400'
                                            }`}>
                                            {scadaDiagnostics?.healthScore?.toFixed(0) ?? selectedReport.healthScore.toFixed(0)}<span className="text-cyan-400 text-sm">%</span>
                                        </span>
                                    </div>
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
                                <span className={`text-8xl font-black tracking-tighter drop-shadow-xl ${selectedReport.healthScore < 50 ? 'text-red-400' :
                                    selectedReport.healthScore > 80 ? 'text-cyan-400' : 'text-yellow-400'
                                    }`}>
                                    {selectedReport.healthScore.toFixed(0)}
                                </span>
                                <span className="text-3xl text-slate-400 font-bold">%</span>
                            </div>
                            <div className="mt-6 h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className={`h-full shadow-[0_0_15px_cyan] transition-all duration-1000 ${selectedReport.healthScore < 50 ? 'bg-red-500' :
                                    selectedReport.healthScore > 80 ? 'bg-cyan-500' : 'bg-yellow-500'
                                    }`} style={{ width: `${selectedReport.healthScore}%` }}></div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-6">Integrated Financial Risk</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-8xl font-black text-red-400 tracking-tighter drop-shadow-xl animate-pulse">
                                    {(integratedRisk / 1000).toFixed(0)}
                                </span>
                                <span className="text-3xl text-slate-400 font-bold">k€</span>
                            </div>
                            <p className="text-[10px] text-red-400/60 mt-6 uppercase font-mono">30-Day Loss Projection (Integrated)</p>
                            <div className="mt-4 text-xs text-slate-500 font-mono">
                                Includes maintenance trends & health degradation
                            </div>
                        </div>
                    </div>

                    {/* DR. TURBINE AI - PHYSICS-BASED DIAGNOSTIC CHAT */}
                    <div className="flex-grow backdrop-blur-xl bg-white/5 border border-cyan-500/20 rounded-2xl p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_25px_cyan] animate-pulse">
                                <span className="text-xl">🧠</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">Dr. Turbine AI Diagnostic</h3>
                                <p className="text-sm text-cyan-400/90 font-mono animate-pulse tracking-wider">{aiMessage}</p>
                            </div>
                        </div>

                        {/* REAL-TIME SCADA STATUS */}
                        <div className="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-500/20">
                            <div className="text-xs text-cyan-300 font-mono mb-2">LIVE SCADA FEED:</div>
                            <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="text-center">
                                    <div className="text-slate-400">Flow</div>
                                    <div className="text-cyan-400 font-mono font-bold">{scadaFlow} m³/s</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-slate-400">Head</div>
                                    <div className="text-cyan-400 font-mono font-bold">{scadaHead} m</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-slate-400">Frequency</div>
                                    <div className={`font-mono font-bold ${scadaFreq >= 98.2 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                                        {scadaFreq} Hz
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PHYSICS-BASED DIAGNOSIS CHAT */}
                        <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {aiCards.length === 0 && scadaDiagnostics && (
                                <div className="text-center py-12 backdrop-blur-md bg-green-900/10 rounded-xl border border-green-500/20">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <p className="text-green-400 text-lg font-bold mb-2">HYDRAULIC SYSTEMS NOMINAL</p>
                                    <p className="text-slate-400 text-sm">All parameters within operational envelope.</p>
                                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                                        <div className="bg-black/20 p-2 rounded border border-green-500/20">
                                            <div className="text-green-400 font-mono">Cavitation Risk: LOW</div>
                                            <div className="text-slate-500">NPSH &gt; 2.5m (Safe)</div>
                                        </div>
                                        <div className="bg-black/20 p-2 rounded border border-green-500/20">
                                            <div className="text-green-400 font-mono">Grid Stability: OK</div>
                                            <div className="text-slate-500">Frequency: {scadaFreq} Hz</div>
                                        </div>
                                    </div>
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

                                        {/* ADVANCED PHYSICS ANALYSIS */}
                                        <div className="bg-black/20 rounded-lg p-3 mb-4 border border-white/10">
                                            <p className="text-xs text-cyan-300 font-mono mb-2">TURBOMACHINERY PHYSICS:</p>
                                            <div className="space-y-1 text-xs text-slate-300">
                                                {card.severity === 'CRITICAL' && card.title.includes('GRID') && (
                                                    <>
                                                        <div>• Frequency: {scadaFreq} Hz (Safe: 49.5-50.5 Hz)</div>
                                                        <div>• Mechanical stress: ∝ ω² (Centrifugal forces)</div>
                                                        <div>• Risk: Generator decoupling at &gt;55 Hz</div>
                                                        <div>• Action: Emergency governor activation</div>
                                                    </>
                                                )}
                                                {card.severity === 'CRITICAL' && card.title.includes('CAVITATION') && (
                                                    <>
                                                        <div>• NPSH_available = {scadaHead} - 2.5m = {(scadaHead - 2.5).toFixed(1)}m</div>
                                                        <div>• NPSH_required ∝ Q²/H (Flow-dependent)</div>
                                                        <div>• Cavitation occurs when NPSH_a &lt; NPSH_r</div>
                                                        <div>• Action: Reduce flow or increase head</div>
                                                    </>
                                                )}
                                                {card.severity !== 'CRITICAL' && (
                                                    <>
                                                        <div>• Hydraulic efficiency: η = P_mechanical/P_hydraulic</div>
                                                        <div>• Specific speed: n_q = n√Q / H^(3/4)</div>
                                                        <div>• Operating point: Stable within envelope</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <ModernButton
                                            variant="secondary"
                                            className={`w-full text-sm h-10 backdrop-blur-md ${card.severity === 'CRITICAL'
                                                ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300'
                                                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-300'
                                                }`}
                                            onClick={() => {
                                                if (card.actionFunction === 'emergency_shutdown') {
                                                    if (confirm("INITIATE EMERGENCY SHUTDOWN? This will stop the turbine.")) {
                                                        triggerEmergency(selectedReport.assetId, 'grid_frequency_critical');
                                                    }
                                                } else {
                                                    console.log('Action triggered:', card.actionFunction);
                                                }
                                            }}
                                        >
                                            <span className="mr-2">⚡</span>
                                            {card.actionLabel}
                                        </ModernButton>
                                    </div>
                                </div>
                            ))}

                            {/* AI Analysis Indicator */}
                            {aiCards.length > 0 && (
                                <div className="flex items-center gap-3 text-cyan-400 text-sm animate-pulse">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                                    <span className="font-mono">Dr. Turbine analyzing turbomachinery physics...</span>
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
                                    triggerEmergency(selectedReport.assetId, 'vibration_excess');
                                }
                            }}
                        >
                            🚨 SCRAM UNIT 🚨
                        </button>
                        <p className="text-[10px] text-red-400/80 mt-4 text-center font-mono tracking-wider">SAFETY LOCK DISENGAGED</p>
                    </div>

                    {/* GLOBAL INTELLIGENCE FEED */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex-1">
                        <h4 className="text-white font-bold uppercase text-sm mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            Global Intelligence
                        </h4>
                        <div className="space-y-4">
                            {[
                                { time: '10:42', msg: 'Grid frequency deviation detected (+0.05Hz)', type: 'warning' },
                                { time: '09:15', msg: 'Shift handover complete. No incidents.', type: 'success' },
                                { time: '08:30', msg: 'Daily market bid accepted @ €150/MWh', type: 'info' },
                                { time: '07:45', msg: 'SCADA: Critical frequency alarm at Unit T1', type: 'critical' }
                            ].map((log, i) => (
                                <div key={i} className={`flex gap-3 text-sm backdrop-blur-md p-3 rounded-lg border ${log.type === 'critical' ? 'bg-red-950/20 border-red-500/20 text-red-300' :
                                    log.type === 'warning' ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' :
                                        log.type === 'success' ? 'bg-green-950/20 border-green-500/20 text-green-300' :
                                            'bg-slate-950/20 border-white/10 text-slate-300'
                                    }`}>
                                    <span className="text-slate-500 font-mono text-xs">{log.time}</span>
                                    <span className="flex-1">{log.msg}</span>
                                    {log.type === 'critical' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
