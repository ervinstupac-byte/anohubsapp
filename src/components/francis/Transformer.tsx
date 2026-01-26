import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Thermometer, Fan, AlertTriangle, AlertOctagon, Activity, ShieldCheck, Cpu, Waves } from 'lucide-react';
import { ROUTES } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const Transformer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    // Simulation Config
    const OIL_ALARM = 85;
    const OIL_TRIP = 95;
    const WINDING_ALARM = 95;
    const WINDING_TRIP = 105;

    // States (Retained for interactive simulation, but could be bridged to Cerebro)
    const [oilTemp, setOilTemp] = useState(65);
    const [liWindingTemp, setLiWindingTemp] = useState(70);
    const [buchholzState, setBuchholzState] = useState<'NORMAL' | 'ALARM' | 'TRIP'>('NORMAL');
    const [fansRunning, setFansRunning] = useState(false);

    const getTempStatus = (val: number, alarm: number, trip: number) => {
        if (val >= trip) return 'TRIP';
        if (val >= alarm) return 'ALARM';
        return 'NORMAL';
    };

    const oilStatus = getTempStatus(oilTemp, OIL_ALARM, OIL_TRIP);
    const windingStatus = getTempStatus(liWindingTemp, WINDING_ALARM, WINDING_TRIP);

    const triggerBuchholz = (state: 'ALARM' | 'TRIP') => {
        setBuchholzState(state);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-indigo-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-indigo-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <Zap className="text-white w-8 h-8 relative z-10 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 text-[10px] font-black border border-indigo-900/50 uppercase tracking-widest">SOP-ELEC-003</span>
                                <NeuralPulse color="indigo" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.transformer.title')}
                            </h1>
                            <p className="text-[10px] text-indigo-400/70 font-black uppercase tracking-[0.2em] italic">
                                {t('francis.transformer.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.HUB}`)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('actions.back')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* THERMAL INTELLIGENCE BLOCK */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Oil Temperature Module */}
                            <div className={`p-10 rounded-[3rem] border transition-all duration-700 relative overflow-hidden group/oil ${oilStatus === 'TRIP' ? 'bg-red-950/20 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : oilStatus === 'ALARM' ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.15)]' : 'bg-slate-900/60 border-white/5 shadow-2xl'}`}>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/oil:opacity-15 transition-opacity duration-700">
                                    <Thermometer className="w-32 h-32 text-white" />
                                </div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${oilStatus === 'NORMAL' ? 'bg-white/5' : 'bg-white/10 animate-pulse'}`}>
                                            <Thermometer className={`w-8 h-8 ${oilStatus === 'NORMAL' ? 'text-indigo-400' : 'text-white'}`} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-200 uppercase tracking-tighter italic">Oil Potential</h3>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic border ${oilStatus === 'NORMAL' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-red-600 text-white border-red-400 animate-pulse'}`}>
                                        {oilStatus}
                                    </div>
                                </div>
                                <div className="text-6xl font-black text-white mb-8 italic tracking-tighter relative z-10 tabular-nums">
                                    {oilTemp}<span className="text-2xl opacity-40 lowercase italic ml-1">°C</span>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 not-italic">Limit Gradient: {OIL_TRIP}°C</div>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="110"
                                    value={oilTemp}
                                    onChange={(e) => setOilTemp(parseInt(e.target.value))}
                                    className="w-full h-2 mb-4 bg-slate-950 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-white/10"
                                />
                            </div>

                            {/* Winding Temperature Module */}
                            <div className={`p-10 rounded-[3rem] border transition-all duration-700 relative overflow-hidden group/winding ${windingStatus === 'TRIP' ? 'bg-red-950/20 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : windingStatus === 'ALARM' ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.15)]' : 'bg-slate-900/60 border-white/5 shadow-2xl'}`}>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/winding:opacity-15 transition-opacity duration-700">
                                    <Activity className="w-32 h-32 text-white" />
                                </div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${windingStatus === 'NORMAL' ? 'bg-white/5' : 'bg-white/10 animate-pulse'}`}>
                                            <Activity className={`w-8 h-8 ${windingStatus === 'NORMAL' ? 'text-indigo-400' : 'text-white'}`} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-200 uppercase tracking-tighter italic">L1 Sub-Core</h3>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic border ${windingStatus === 'NORMAL' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-red-600 text-white border-red-400 animate-pulse'}`}>
                                        {windingStatus}
                                    </div>
                                </div>
                                <div className="text-6xl font-black text-white mb-8 italic tracking-tighter relative z-10 tabular-nums">
                                    {liWindingTemp}<span className="text-2xl opacity-40 lowercase italic ml-1">°C</span>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 not-italic">Trip Delta: {WINDING_TRIP}°C</div>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="120"
                                    value={liWindingTemp}
                                    onChange={(e) => setLiWindingTemp(parseInt(e.target.value))}
                                    className="w-full h-2 mb-4 bg-slate-950 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-white/10"
                                />
                            </div>
                        </div>

                        {/* Forced Cooling Array */}
                        <div className="p-10 bg-black/40 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 group/cool shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/cool:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex items-center gap-8 relative z-10">
                                <div className={`p-8 rounded-[2rem] transition-all duration-1000 ${fansRunning ? 'bg-cyan-600 shadow-[0_0_40px_rgba(6,182,212,0.4)] rotate-180' : 'bg-slate-900 rotate-0 grayscale'}`}>
                                    <Fan className={`w-12 h-12 text-white ${fansRunning ? 'animate-spin' : ''}`} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Forced Air Induction</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic mt-1">Automatic Permissive: 75°C Oil Trigger</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFansRunning(!fansRunning)}
                                className={`px-12 py-5 text-sm font-black rounded-full border-2 transition-all duration-300 italic tracking-widest relative z-10 ${fansRunning ? 'bg-cyan-600 border-cyan-400 text-white shadow-2xl hover:scale-105' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white hover:border-white/30'}`}
                            >
                                {fansRunning ? 'ARRAY ACTIVE' : 'ENGAGE MANUAL'}
                            </button>
                        </div>
                    </div>

                    {/* BUCHHOLZ ISOLATION LOGIC */}
                    <div className="lg:col-span-1">
                        <section className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 h-full flex flex-col justify-between group overflow-hidden relative shadow-2xl backdrop-blur-md">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <AlertTriangle className="w-32 h-32 text-amber-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-12 flex items-center gap-3 italic">
                                    <Waves className="w-5 h-5 text-amber-400 animate-pulse" /> Buchholz Critical Protection
                                </h3>

                                <div className="space-y-6">
                                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 group/relay ${buchholzState === 'NORMAL' ? 'bg-black/60 border-emerald-500/30' : 'bg-black/20 border-white/5 opacity-40'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-[11px] font-black uppercase italic tracking-widest ${buchholzState === 'NORMAL' ? 'text-emerald-400' : 'text-slate-600'}`}>Static Matrix</span>
                                            {buchholzState === 'NORMAL' && <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />}
                                        </div>
                                        <div className="text-sm font-bold text-slate-300 italic">Core Saturation: OK</div>
                                    </div>

                                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 group/relay ${buchholzState === 'ALARM' ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-900/20' : 'bg-black/60 border-white/5 hover:border-amber-500/30'}`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className={`text-[11px] font-black uppercase italic tracking-widest ${buchholzState === 'ALARM' ? 'text-amber-500' : 'text-slate-500'}`}>Gas Accrual</span>
                                            <button onClick={() => triggerBuchholz('ALARM')} className="text-[9px] px-4 py-1 bg-amber-600/20 text-amber-400 border border-amber-500/50 rounded-lg hover:bg-amber-600 hover:text-white transition-all font-black uppercase">Probe</button>
                                        </div>
                                        {buchholzState === 'ALARM' && <p className="text-xs text-amber-200 font-bold italic uppercase tracking-tighter leading-relaxed">Slow Gas Evolution Detected - DGA Intelligence Required.</p>}
                                    </div>

                                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 group/relay ${buchholzState === 'TRIP' ? 'bg-red-950/20 border-red-500 shadow-2xl shadow-red-900/30 animate-[pulse_2s_infinite]' : 'bg-black/60 border-white/5 hover:border-red-500/30'}`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className={`text-[11px] font-black uppercase italic tracking-widest ${buchholzState === 'TRIP' ? 'text-red-500 font-black' : 'text-slate-500'}`}>Impulse Surge</span>
                                            <button onClick={() => triggerBuchholz('TRIP')} className="text-[9px] px-4 py-1 bg-red-600/20 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-600 hover:text-white transition-all font-black uppercase">Force</button>
                                        </div>
                                        {buchholzState === 'TRIP' && (
                                            <div className="flex gap-4 items-center text-red-100">
                                                <AlertOctagon className="w-8 h-8 text-red-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Circuit Isolation Engaged</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {buchholzState !== 'NORMAL' ? (
                                <button
                                    onClick={() => setBuchholzState('NORMAL')}
                                    className="mt-12 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl hover:scale-101 transition-all italic relative z-10"
                                >
                                    Reset Logic Core
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.LOGBOOK}`)}
                                    className="mt-12 w-full py-5 bg-black/40 border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-[0.3em] rounded-[2rem] transition-all italic relative z-10"
                                >
                                    <Activity className="w-4 h-4 inline-block mr-2" /> Log Observation
                                </button>
                            )}
                        </section>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Transformer;
