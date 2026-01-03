import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Settings,
    ArrowLeft,
    AlertTriangle,
    Activity,
    Zap,
    ShieldAlert,
    Cpu,
    CheckCircle2,
    AlertOctagon,
    Gauge,
    ClipboardList
} from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';
import { GlassCard } from '../ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const GovernorPID: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();
    const { governor: governorMath, waterHammer } = useEngineeringMath();

    const governor = state.governor;
    const burstRate = 14.2; // ms, placeholder for reflex loop speed

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-blue-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center justify-center md:justify-start gap-3">
                            <Settings className="w-8 h-8 text-blue-500 animate-spin-slow" />
                            {t('francis.governorPID.title')}
                        </h1>
                        <p className="text-blue-400 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                            <NeuralPulse /> {t('francis.governorPID.subtitle')} // NC-4.2 AI-TUNED
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600/10 border-2 border-blue-500/50 text-blue-400 rounded-full font-black hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all group uppercase text-xs tracking-tighter"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.governorPID.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
                {/* 1. Integrated Physics Intelligence Card */}
                <GlassCard title={t('modules.governor_pid')} className="relative overflow-hidden group">
                    {/* Neural Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                        <svg width="100%" height="100%" viewBox="0 0 400 200">
                            <motion.polyline
                                points="0,100 50,110 100,50 150,150 200,90 250,100 300,105 350,95 400,100"
                                fill="none"
                                stroke="cyan"
                                strokeWidth="1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 5, repeat: Infinity }}
                            />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                        {/* Error Viz */}
                        <div className="lg:col-span-1 flex flex-col justify-center items-center p-6 bg-black/60 rounded-3xl border border-white/5 shadow-2xl">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="rgba(255,255,255,0.05)" strokeWidth="12"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor" strokeWidth="12"
                                        strokeLinecap="round"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        initial={{ strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 * (1 - Math.min(1, Math.abs(governorMath.error / 2))) }}
                                        className={Math.abs(governorMath.error) < 0.2 ? 'text-emerald-500' : 'text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-black font-mono text-white tracking-tighter">
                                        {Math.abs(governorMath.error).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Hz Δ Error</span>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-blue-400" /> Target Setpoint
                                    </p>
                                    <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                        {governor.setpoint.toFixed(2)} <span className="text-xs text-slate-500">Hz</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-amber-400" /> Dynamic Response
                                    </p>
                                    <p className={`text-3xl font-black font-mono tracking-tighter ${Math.abs(governorMath.error) < 0.2 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                                        {governor.actualValue.toFixed(2)} <span className="text-xs text-slate-500">Hz</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <p className="text-[10px] text-blue-400 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                        <Cpu className="w-3 h-3" /> Output Signal (Y)
                                    </p>
                                    <p className="text-3xl font-black text-blue-400 font-mono tracking-tighter">
                                        {governorMath.controlSignal.toFixed(1)}<span className="text-xs opacity-50">%</span>
                                    </p>
                                </div>
                            </div>

                            {/* Narrative Box */}
                            <div className={`p-6 rounded-2xl border-2 transition-all ${Math.abs(governorMath.error) > 0.5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Neural Reflex Analysis</span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-bold italic">
                                    {Math.abs(governorMath.error) > 0.5
                                        ? "🚨 AI WARNING: Significant frequency deviation detected. PID loop is in full saturating recovery. Ensure hydraulic bypass is inhibited."
                                        : `🤖 AI SYSTEM STABLE: PID Loop convergence verified at ${burstRate}ms reflex rate. ${waterHammer.recommendation}`}
                                </p>
                            </div>

                            {/* Gains Detail */}
                            <div className="flex flex-wrap justify-between items-center px-6 py-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner gap-4">
                                <div className="flex gap-8">
                                    <div className="text-center group/gain">
                                        <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Kp</span>
                                        <span className="text-sm font-mono font-black text-white group-hover/gain:text-blue-400 transition-colors">{governor.kp.toFixed(2)}</span>
                                    </div>
                                    <div className="text-center group/gain">
                                        <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Ki</span>
                                        <span className="text-sm font-mono font-black text-white group-hover/gain:text-blue-400 transition-colors">{governor.ki.toFixed(3)}</span>
                                    </div>
                                    <div className="text-center group/gain">
                                        <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Kd</span>
                                        <span className="text-sm font-mono font-black text-white group-hover/gain:text-blue-400 transition-colors">{governor.kd.toFixed(3)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 py-1 px-3 rounded-full border border-white/10">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Neural Reflex: {burstRate}ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Safety Alert (IEC Logic) */}
                <div className="bg-red-500/10 border-l-[12px] border-red-600 p-8 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-red-900/20">
                    <div className="flex items-start gap-6">
                        <AlertOctagon className="w-12 h-12 text-red-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-2">
                                {t('francis.governorPID.safetyTitle')}
                            </h3>
                            <p className="font-black text-white text-xs mb-6 tracking-[0.3em] opacity-80 uppercase border-b border-red-900/30 pb-2">
                                {t('francis.governorPID.stop')}
                            </p>
                            <ul className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-xs font-bold text-slate-300">
                                {[
                                    { title: 'sync', desc: 'syncDesc' },
                                    { title: 'loadStab', desc: 'loadDesc' },
                                    { title: 'estop', desc: 'estopDesc' },
                                    { title: 'comm', desc: 'commDesc' }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-4 group cursor-help">
                                        <span className="text-red-600 group-hover:scale-150 transition-transform">▸</span>
                                        <span>
                                            <strong className="text-red-100 uppercase tracking-tighter mr-2">{t(`francis.governorPID.${item.title}`)}:</strong>
                                            <span className="text-slate-400 group-hover:text-slate-100 transition-colors">{t(`francis.governorPID.${item.desc}`)}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PID Architecture Flow */}
                <section className="bg-slate-900/50 p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <Cpu className="w-6 h-6 text-blue-500" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.governorPID.basicsTitle')}</h3>
                    </div>

                    <div className="space-y-8">
                        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl italic font-medium border-l-2 border-blue-500/30 pl-6">
                            "{t('francis.governorPID.govDesc')}"
                        </p>

                        <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30" />

                            <h4 className="text-blue-400 font-black uppercase text-[10px] mb-6 tracking-[0.4em] text-center relative z-10">{t('francis.governorPID.loopTitle')}</h4>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
                                <div className="px-6 py-3 bg-black/60 rounded-xl border border-white/10 shadow-lg font-mono text-sm text-white">
                                    {t('francis.governorPID.errEq')}
                                </div>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-blue-500 font-black text-2xl hidden md:block"
                                >
                                    ➔
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-blue-500 font-black text-2xl md:hidden"
                                >
                                    ↓
                                </motion.div>
                                <div className="px-8 py-4 bg-blue-600/20 rounded-xl border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] font-mono text-base font-black text-blue-400">
                                    {t('francis.governorPID.outEq')}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Dead Band */}
                    <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md">
                        <div className="bg-white/5 p-4 font-black text-slate-400 flex justify-between items-center border-b border-white/5">
                            <span className="uppercase text-[10px] tracking-widest">{t('francis.governorPID.deadbandTitle')}</span>
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="p-8">
                            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                <strong className="text-white">{t('francis.governorPID.dbDef')}</strong> {t('francis.governorPID.dbDesc')}
                            </p>
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-black uppercase">{t('francis.governorPID.dbParam')}</span>
                                <span className="text-lg font-mono font-black text-white">{t('francis.governorPID.rpmRangeValue')}</span>
                            </div>
                        </div>
                    </section>

                    {/* Step Response */}
                    <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md">
                        <div className="bg-white/5 p-4 font-black text-slate-400 flex justify-between items-center border-b border-white/5">
                            <span className="uppercase text-[10px] tracking-widest">{t('francis.governorPID.stepRespTitle')}</span>
                            <Activity className="w-4 h-4" />
                        </div>
                        <div className="p-8">
                            <ul className="space-y-4">
                                {[
                                    { id: 'overshoot', val: t('francis.governorPID.overshootVal'), desc: 'overshootDesc' },
                                    { id: 'settleTime', val: t('francis.governorPID.settleTimeVal'), desc: 'settleDesc' },
                                    { id: 'oscillations', val: t('francis.governorPID.oscillationsVal'), desc: 'oscDesc' }
                                ].map((row, idx) => (
                                    <li key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-xs text-slate-500 font-black uppercase">{t(`francis.governorPID.${row.id}`)}</span>
                                        <span className="text-xs font-mono font-black text-emerald-400">{row.val}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Checklist */}
                <div className="bg-black/60 p-6 rounded-3xl flex flex-wrap gap-8 items-center justify-center text-[10px] border border-white/5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="uppercase font-black text-white tracking-widest">{t('francis.governorPID.checklist')}:</span>
                    </div>
                    {['software', 'monitor', 'docs', 'mechTools', 'safety'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-tighter">
                            <span className="text-emerald-500">✓</span> {t(`francis.governorPID.${item}`)}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};
