import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ZapOff, ArrowLeft, Activity, GitPullRequestClosed, Info, AlertTriangle, ShieldAlert, Cpu, Timer } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const LoadRejectionLogic: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Data from Telemetry
    const [scanned, setScanned] = useState(false);
    const waterHammerPressure = (telemetry.physics?.staticPressureBar ?? 0) * 1.4; // Simulated dynamic rise

    useEffect(() => {
        const timer = setTimeout(() => {
            setScanned(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-red-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-red-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <ZapOff className="text-white w-8 h-8 relative z-10" />
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-red-950 text-red-500 text-[10px] font-black border border-red-900/50 uppercase tracking-widest">SOP-LOGIC-003</span>
                                <NeuralPulse color="red" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.loadRejection.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.loadRejection.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                {/* 1. Critical Event Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <GlassCard title="Transient Intelligence" className="lg:col-span-2 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 animate-[scan_3s_infinite_linear] opacity-30 shadow-[0_0_15px_#ef4444]" />
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <div className="space-y-6 flex-1">
                                <h2 className="text-red-500 font-black text-xl uppercase tracking-tighter flex items-center gap-3 italic">
                                    <Activity className="w-6 h-6 animate-pulse" /> {t('francis.loadRejection.trigger.title')}
                                </h2>
                                <p className="text-sm text-slate-300 font-bold leading-relaxed italic border-l-2 border-red-500/30 pl-4 uppercase tracking-tighter">
                                    {t('francis.loadRejection.trigger.desc')}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 w-full md:w-64">
                                <div className="p-6 bg-black/60 rounded-3xl border border-red-500/20 shadow-inner group/val">
                                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-2">{t('francis.loadRejection.step2.p1')}</span>
                                    <div className="text-3xl font-black text-white font-mono tracking-tighter italic">1.8 <span className="text-xs opacity-40 lowercase italic">s</span></div>
                                </div>
                                <div className="p-6 bg-black/60 rounded-3xl border border-red-500/20 shadow-inner group/val">
                                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-2">{t('francis.loadRejection.step2.p2')}</span>
                                    <div className="text-3xl font-black text-white font-mono tracking-tighter italic">12.4 <span className="text-xs opacity-40 lowercase italic">s</span></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="p-10 bg-red-950/20 border-2 border-red-600 rounded-[3rem] shadow-3xl text-center flex flex-col justify-center items-center group overflow-hidden relative">
                        <div className="absolute inset-0 bg-red-600/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.4)] relative z-10">
                            <AlertTriangle className="text-white w-10 h-10 animate-bounce" />
                        </div>
                        <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-2 relative z-10">Critical Event</h3>
                        <div className="px-6 py-2 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 relative z-10">
                            Detected: Full Load Trip
                        </div>
                    </div>
                </div>

                {/* 2. Sequence Timeline */}
                <GlassCard title={t('francis.loadRejection.sequence.title')} icon={<Timer className="text-red-500" />}>
                    <div className="space-y-12 relative mt-8">
                        {/* Vertical Trace */}
                        <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-slate-900 border-x border-white/5 rounded-full" />

                        {[1, 2, 3].map((num) => (
                            <div key={num} className="relative pl-16 group/step">
                                <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 shadow-xl border-2 z-10 ${num === 3 ? 'bg-slate-950 border-slate-800 text-slate-700 opacity-50' : 'bg-red-600 border-red-400 text-white shadow-red-900/40'}`}>
                                    {num}
                                </div>
                                <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 hover:translate-x-2 ${num === 3 ? 'bg-slate-900/40 border-white/5 opacity-50' : 'bg-black/40 border-red-500/20 hover:border-red-500/50 shadow-2xl'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className={`text-xl font-black uppercase tracking-tighter ${num === 3 ? 'text-slate-500' : 'text-white italic'}`}>
                                            {t(`francis.loadRejection.step${num}.title`)}
                                        </h3>
                                        {num < 3 && <span className="text-[9px] font-black px-3 py-1 bg-red-600 text-white rounded-lg uppercase tracking-widest shadow-lg">Executing</span>}
                                    </div>
                                    <p className={`text-sm font-bold italic leading-relaxed group-hover/step:text-slate-200 transition-colors uppercase tracking-tight ${num === 3 ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {t(`francis.loadRejection.step${num}.desc`)}
                                    </p>
                                    {num === 2 && (
                                        <div className="mt-8 flex gap-4">
                                            <div className="px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest">{t('francis.loadRejection.step2.p1')} Active</div>
                                            <div className="px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest">{t('francis.loadRejection.step2.p2')} Standby</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Safety Interlock */}
                    <div className="bg-amber-950/10 border-l-[12px] border-amber-600 p-12 rounded-r-[3rem] border border-amber-900/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <GitPullRequestClosed className="w-32 h-32 text-amber-500" />
                        </div>
                        <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-3xl bg-amber-600 flex items-center justify-center shadow-2xl">
                                <ShieldAlert className="text-white w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.loadRejection.interlock.title')}</h2>
                        </div>
                        <p className="text-sm text-slate-300 font-bold italic leading-relaxed mb-8 border-l-2 border-amber-500/30 pl-6 uppercase tracking-tight">
                            {t('francis.loadRejection.interlock.desc')}
                        </p>
                        <div className="p-8 bg-red-600 rounded-3xl border-t-4 border-red-400 shadow-2xl relative z-10 animate-pulse text-center">
                            <span className="text-xs font-black text-white uppercase tracking-[0.3em] italic">{t('francis.loadRejection.interlock.cmd')}</span>
                        </div>
                    </div>

                    {/* Intelligence Note */}
                    <GlassCard title="Hydraulic Compliance" icon={<Info className="text-slate-500" />}>
                        <div className="flex flex-col justify-center h-full space-y-8">
                            <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 italic">
                                <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic border-l-2 border-slate-700 pl-4">
                                    {t('francis.loadRejection.interlock.note')}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
                                    <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Pressure Rise</span>
                                    <span className="text-lg font-black text-white font-mono tracking-tighter">{waterHammerPressure.toFixed(1)} Bar</span>
                                </div>
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
                                    <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Overspeed Lim</span>
                                    <span className="text-lg font-black text-white font-mono tracking-tighter">140%</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};
