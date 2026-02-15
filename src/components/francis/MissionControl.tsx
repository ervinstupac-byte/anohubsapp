import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Activity, Zap, Lock, Scale, DoorOpen, ShieldAlert, AlertTriangle, ArrowLeft, Cpu, Timer, ShieldCheck, Waves } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

interface FaultState {
    n2: boolean;
    sync: boolean;
    dp: boolean;
    angle: boolean;
}

export const MissionControl: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // PROCEDURE STATE
    const [step, setStep] = useState(1);
    const [forensicPressure, setForensicPressure] = useState(0.0);
    const [isFilling, setIsFilling] = useState(false);

    // FAULTS STATE
    const [faults, setFaults] = useState<FaultState>({
        n2: false,
        sync: false,
        dp: false,
        angle: false
    });

    // TIMELINE PROGRESS CALCULATION
    const timelineHeight = step === 5 ? '100%' : `${((step - 1) / 4) * 100}%`;

    const toggleFault = (key: keyof FaultState) => {
        setFaults(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const confirmStep = (stepId: number) => {
        if (stepId === 1 && faults.n2) return;
        if (stepId === 2 && faults.sync) return;
        if (stepId === 3 && faults.dp) return;
        if (stepId === 4 && faults.angle) return;

        if (stepId === 4) {
            setStep(5);
        } else {
            setStep(stepId + 1);
        }
    };

    useEffect(() => {
        if (isFilling) {
            const limit = faults.dp ? 11.0 : 14.5;
            const interval = setInterval(() => {
                setForensicPressure(prev => {
                    const next = prev + 0.2;
                    if (next >= limit) {
                        clearInterval(interval);
                        setIsFilling(false);
                        return limit;
                    }
                    return next;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isFilling, faults.dp]);

    const getNodeClass = (nodeId: number) => {
        if (step > nodeId) return "border-emerald-500 bg-emerald-950/5 opacity-100";
        if (step === nodeId) return "border-cyan-500 bg-cyan-950/10 shadow-[0_0_30px_rgba(14,165,233,0.15)] opacity-100 translate-x-2";
        return "border-slate-800 bg-slate-900/40 opacity-40";
    };

    const getCircleClass = (nodeId: number) => {
        if (step > nodeId) return "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_#10b981]";
        if (step === nodeId) return "bg-slate-950 border-cyan-400 shadow-[0_0_20px_#22d3ee] scale-125";
        return "bg-slate-900 border-slate-700";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-cyan-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-cyan-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <Activity className="text-white w-8 h-8 relative z-10 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-500 text-[10px] font-black border border-cyan-900/50 uppercase tracking-widest">SOP-MC-001</span>
                                <NeuralPulse color="cyan" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.missionControl.title')}
                            </h1>
                            <p className="text-[10px] text-cyan-500/70 font-black uppercase tracking-[0.2em] italic">
                                {t('francis.missionControl.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{t('francis.missionControl.systemStatus')}</div>
                            <div className={`text-xl font-black tracking-tighter uppercase tabular-nums ${step === 5 ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                                {step === 5 ? t('francis.missionControl.unitReady') : t('francis.missionControl.sequenceHold')}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(FRANCIS_PATHS.HUB)}
                            className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 text-cyan-500 group-hover:-translate-x-1 transition" />
                            <span>{t('francis.missionControl.returnBtn')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8">

                {/* 1. Precision Audit Panel */}
                <div className="mb-12 p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                            <Cpu className="w-4 h-4 text-purple-500" /> {t('francis.missionControl.simTitle')}
                        </span>
                        <div className="px-3 py-1 bg-purple-600 text-white text-[9px] font-black rounded-lg shadow-lg uppercase tracking-widest">Expert Override Mode</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(['n2', 'sync', 'dp', 'angle'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => toggleFault(f)}
                                className={`p-4 rounded-2xl border transition-all duration-300 group/fault ${faults[f]
                                    ? 'bg-red-950/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                                    : 'bg-black/40 border-white/5 hover:border-purple-500/50 grayscale hover:grayscale-0'}`}
                            >
                                <div className="text-[9px] font-black uppercase tracking-tighter transition-colors mb-1 opacity-60 group-hover/fault:opacity-100">
                                    [GATE {f === 'n2' ? 1 : f === 'sync' ? 2 : f === 'dp' ? 3 : 4}]
                                </div>
                                <div className={`text-[11px] font-black uppercase ${faults[f] ? 'text-red-500' : 'text-slate-400'}`}>
                                    {f === 'n2' ? 'Low N2 Pres' : f === 'sync' ? 'Sync Error' : f === 'dp' ? 'High Delta-P' : 'GUV Angle Err'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Sequence Workflow */}
                <div className="relative pl-12 md:pl-20 py-8">
                    {/* Vertical Progression Rail */}
                    <div className="absolute left-6 md:left-10 top-0 bottom-0 w-1.5 bg-slate-900 border-x border-white/5 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 w-full bg-emerald-500 shadow-[0_0_20px_#10b981] transition-all duration-1000 ease-in-out"
                            style={{ height: timelineHeight }}
                        />
                    </div>

                    {[1, 2, 3, 4].map((nodeId) => {
                        const iconMap = [Zap, Lock, Scale, DoorOpen];
                        const Icon = iconMap[nodeId - 1];
                        const nodeKey = `node${nodeId}`;
                        const isBlocked = (nodeId === 1 && faults.n2) || (nodeId === 2 && faults.sync) || (nodeId === 3 && faults.dp) || (nodeId === 4 && faults.angle);

                        return (
                            <div key={nodeId} className={`relative mb-16 p-10 rounded-[3rem] border transition-all duration-700 backdrop-blur-md group/node ${getNodeClass(nodeId)}`}>
                                {/* Node Bullet */}
                                <div className={`absolute -left-[3.35rem] md:-left-[4.35rem] top-12 w-8 h-8 rounded-full border-4 transition-all duration-700 z-10 flex items-center justify-center font-black text-[10px] ${getCircleClass(nodeId)} ${step >= nodeId ? 'text-white' : 'text-slate-700'}`}>
                                    {nodeId}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Icon className={`w-10 h-10 ${step >= nodeId ? 'text-cyan-400' : 'text-slate-700'}`} />
                                            <div>
                                                <h3 className={`text-2xl font-black uppercase tracking-tighter ${step >= nodeId ? 'text-white shadow-cyan-900/20' : 'text-slate-700'}`}>
                                                    {t(`francis.missionControl.${nodeKey}.title`)}
                                                </h3>
                                                <p className={`text-sm font-bold italic transition-colors leading-relaxed uppercase tracking-tighter ${step >= nodeId ? 'text-slate-400' : 'text-slate-800'}`}>
                                                    {t(`francis.missionControl.${nodeKey}.desc`)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dynamic Data Module */}
                                        <div className={`p-6 rounded-3xl border transition-all duration-500 ${step >= nodeId ? 'bg-black/40 border-white/5' : 'bg-transparent border-transparent opacity-20'}`}>
                                            {nodeId === 1 && (
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Oil Component Matrix</span>
                                                        <div className="text-xl font-black text-white font-mono italic">14.2 <span className="text-xs opacity-40 lowercase italic">MPa</span></div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">N2 Pre-Charge Intelligence</span>
                                                        <div className={`text-xl font-black font-mono italic ${faults.n2 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                                            {faults.n2 ? 'BREACH (10.1 MPa)' : 'NOMINAL'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {nodeId === 2 && (
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Vane Sync Delta (1-20)</span>
                                                        <div className={`text-xl font-black font-mono italic ${faults.sync ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                                            {faults.sync ? 'VANE 4 ERROR' : '0.0% LOCKED'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Mechanical Squeeze</span>
                                                        <div className="text-xl font-black text-emerald-500 font-mono italic uppercase tracking-tighter">Active Stability</div>
                                                    </div>
                                                </div>
                                            )}
                                            {nodeId === 3 && (
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Upstream Potential</span>
                                                            <span className="text-lg font-black text-white font-mono">14.5 Bar</span>
                                                        </div>
                                                        <div className="flex flex-col text-right">
                                                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Spiral Velocity Head</span>
                                                            <span className={`text-lg font-black font-mono ${faults.dp && forensicPressure >= 11 ? "text-red-500 animate-pulse" : forensicPressure >= 14.5 ? "text-emerald-500" : "text-white"}`}>
                                                                {forensicPressure.toFixed(1)} Bar
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-slate-900 rounded-full border border-white/5 overflow-hidden shadow-inner">
                                                        <div className={`h-full transition-all duration-300 ${faults.dp && forensicPressure >= 11 ? 'bg-red-500' : 'bg-cyan-500'} shadow-[0_0_15px_rgba(34,211,238,0.3)]`} style={{ width: `${(forensicPressure / 14.5) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            {nodeId === 4 && (
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Main Valve Interlock</span>
                                                        <div className="text-xl font-black text-emerald-500 font-mono italic uppercase tracking-tighter">Released Permissive</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Differential Target Angle</span>
                                                        <div className={`text-xl font-black font-mono italic ${faults.angle ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                                            {faults.angle ? '45.0° (STUCK)' : '80.0°'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {isBlocked && step === nodeId && (
                                            <div className="p-6 bg-red-950/20 border-2 border-red-500/50 rounded-[2rem] flex items-center gap-6 animate-[shake_0.5s_infinite]">
                                                <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                                                <div>
                                                    <h4 className="text-red-500 font-black text-[10px] uppercase tracking-widest italic mb-1">Safety Critical Blockage</h4>
                                                    <p className="text-xs text-red-200 font-bold uppercase tracking-tight">
                                                        {nodeId === 1 ? 'N2 PRESSURE CRITICAL BREACH - MANUAL AUDIT REQUIRED' :
                                                            nodeId === 2 ? 'VANE 4 DEVIATION DETECTED (+2.1mm) - CHECK RING BOLTS' :
                                                                nodeId === 3 ? 'DELTA P > 3 BAR - CAVITATION RISK IN SPIRAL CASE' :
                                                                    'VALVE STUCK @ 45° - TORQUE LIMIT EXCEEDED'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full md:w-80 flex flex-col justify-center">
                                        {step > nodeId ? (
                                            <div className="w-full py-4 bg-emerald-600 text-white font-black rounded-3xl text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/30 italic">
                                                <ShieldCheck className="w-4 h-4" /> Logic Confirmed
                                            </div>
                                        ) : step === nodeId ? (
                                            nodeId === 3 && !isFilling && forensicPressure < 14.5 ? (
                                                <button
                                                    onClick={() => setIsFilling(true)}
                                                    className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-400 text-white font-black rounded-3xl text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all hover:scale-105 italic flex items-center justify-center gap-4 group/btn"
                                                >
                                                    <Waves className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    {t('francis.missionControl.actions.startFilling')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => confirmStep(nodeId)}
                                                    className={`w-full py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 italic flex items-center justify-center gap-4 group/btn ${isBlocked
                                                        ? 'bg-red-950/20 border-2 border-red-500 text-red-500 opacity-60 cursor-not-allowed'
                                                        : 'bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-400 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-105'}`}
                                                >
                                                    {isBlocked ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                                                    {nodeId === 4 ? t('francis.missionControl.actions.openMiv') : nodeId === 3 ? t('francis.missionControl.actions.fillingComplete') : nodeId === 2 ? t('francis.missionControl.actions.confirmZero') : t('francis.missionControl.actions.confirm')}
                                                </button>
                                            )
                                        ) : (
                                            <div className="w-full py-4 bg-slate-900 text-slate-700 font-black rounded-3xl text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic">
                                                Locked Sequence
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ESD - Global Safety Layer */}
                <div className="mt-12 bg-red-950/20 border-l-[16px] border-red-600 p-12 rounded-r-[4rem] border border-red-900/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="w-64 h-64 text-red-600" />
                    </div>
                    <div className="flex items-center gap-8 mb-10 relative z-10">
                        <div className="p-6 bg-red-600 rounded-[2rem] shadow-3xl">
                            <ShieldAlert className="text-white w-12 h-12 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 italic">{t('francis.missionControl.esdTitle')}</h2>
                            <div className="px-4 py-1 bg-red-900/40 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-900/50 inline-block italic">Emergency Shutdown Protocol Active</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="flex items-center gap-5 p-6 bg-black/40 rounded-3xl border border-red-500/20 group/stat">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] group-hover:scale-125 transition-transform" />
                            <span className="text-sm font-black text-red-100 uppercase tracking-tighter italic">Gravity Weights: <span className="text-emerald-500">ARMED & NOMINAL</span></span>
                        </div>
                        <div className="flex items-center gap-5 p-6 bg-black/40 rounded-3xl border border-red-500/20 group/stat">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] group-hover:scale-125 transition-transform" />
                            <span className="text-sm font-black text-red-100 uppercase tracking-tighter italic">Hydraulic Integrity: <span className="text-emerald-500">NOMINAL FLUX</span></span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
