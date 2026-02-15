import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Merge, ArrowLeft, Crosshair, AlertTriangle, Activity, Zap, ShieldCheck } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const GridSync: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Synchroscope rotation simulation (Visual-only)
    const [rotation, setRotation] = useState(0);
    const [syncLocked, setSyncLocked] = useState(false);

    // Mock constants (Pending Telemetry Integration)
    const machineFreq = 50.02;
    const gridFreq = 50.00;
    const phaseDelta = 4.2; // Degrees

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 1.5) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-indigo-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-indigo-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <Merge className="text-white w-8 h-8 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-500 text-[10px] font-black border border-indigo-900/50 uppercase tracking-widest">SOP-OPS-009</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.gridSync.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.gridSync.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Synchroscope Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <GlassCard title="Vector Alignment Matrix" className="lg:col-span-2 overflow-hidden relative group">
                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            {/* Synchroscope UI */}
                            <div className="relative group/scope">
                                <div className="w-64 h-64 rounded-full border-8 border-slate-900 bg-black shadow-[0_0_50px_rgba(79,70,229,0.1)] flex items-center justify-center relative overflow-hidden">
                                    {/* Graduations */}
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="absolute w-1 h-3 bg-slate-800" style={{ transform: `rotate(${i * 30}deg) translateY(-110px)` }} />
                                    ))}

                                    {/* Sync Window */}
                                    <div className="absolute top-2 w-16 h-8 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg blur-[2px]" />
                                    <div className="absolute top-2 w-16 h-8 border-2 border-emerald-500/50 rounded-lg z-10 flex items-center justify-center">
                                        <div className="w-1 h-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    {/* Rotating Vector */}
                                    <div
                                        className="absolute w-1 h-28 bg-indigo-500 origin-bottom rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-shadow duration-300"
                                        style={{ transform: `rotate(${rotation}deg) translateY(-56px)` }}
                                    />

                                    {/* Center Cap */}
                                    <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 z-20" />
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    {t('francis.gridSync.scope')}
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2">{t('francis.gridSync.p1')}</span>
                                        <div className="text-2xl font-black text-white font-mono tracking-tighter italic">98.2 <span className="text-xs opacity-40 italic">%</span></div>
                                    </div>
                                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-2">{t('francis.gridSync.p2')}</span>
                                        <div className="text-2xl font-black text-white font-mono tracking-tighter italic">{machineFreq.toFixed(2)} <span className="text-xs opacity-40 italic">Hz</span></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-emerald-950/10 border border-emerald-500/20 rounded-3xl flex items-center justify-between group/status">
                                    <div>
                                        <span className="text-[10px] text-emerald-500 uppercase font-black block mb-1 tracking-widest">{t('francis.gridSync.p3')}</span>
                                        <div className="text-2xl font-black text-emerald-400 font-mono italic tracking-tighter">&plusmn; {phaseDelta}&deg;</div>
                                    </div>
                                    <ShieldCheck className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="space-y-8">
                        <div className="p-8 bg-indigo-950/20 border border-indigo-500/30 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Crosshair className="w-24 h-24 text-indigo-400" />
                            </div>
                            <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Crosshair className="w-4 h-4" /> {t('francis.gridSync.s1Title')}
                            </h3>
                            <p className="text-sm text-slate-300 font-bold italic leading-relaxed mb-6 border-l-2 border-indigo-500/30 pl-4 uppercase tracking-tighter">
                                {t('francis.gridSync.s1Desc')}
                            </p>
                            <div className="text-[9px] text-indigo-300 bg-indigo-900/30 p-3 rounded-xl border border-indigo-800/30 uppercase font-black">
                                Precision Sync Window Active
                            </div>
                        </div>

                        <div className="p-8 bg-amber-950/10 border-l-[10px] border-amber-600 rounded-r-[2.5rem] border border-amber-900/20">
                            <h4 className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 animate-pulse" /> Safety Critical
                            </h4>
                            <p className="text-xs text-slate-400 font-bold leading-relaxed italic">
                                {t('francis.gridSync.failDesc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Manual Procedure & Logic */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GlassCard title={t('francis.gridSync.s2Title')} icon={<Activity className="text-indigo-400" />}>
                        <div className="space-y-6">
                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] italic mb-4">
                                {t('francis.gridSync.s2Desc')}
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] hover:border-indigo-500/30 transition-all group/rule">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">01</div>
                                        <div>
                                            <h4 className="text-white text-xs font-black uppercase tracking-tight mb-1">{t('francis.gridSync.ruleDark')}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold italic">{t('francis.gridSync.ruleDesc')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-[2rem]">
                                    <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">{t('francis.gridSync.failTitle')}</h4>
                                    <p className="text-[10px] text-slate-300 font-bold leading-relaxed">System Lockout Triggered on 15&deg; Delta Breach.</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="bg-black/40 border border-white/5 p-12 rounded-[3rem] shadow-3xl text-center flex flex-col justify-center items-center">
                        <div className="w-24 h-24 rounded-full bg-indigo-600/10 border-4 border-indigo-500 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-20" />
                            <Zap className="text-indigo-500 w-10 h-10" />
                        </div>
                        <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-4">Breaker Permissive</h3>
                        <div className="px-8 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                            Auto-Sync Ready
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-8 w-full">
                            <div>
                                <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Grid V</div>
                                <div className="text-sm font-black text-white font-mono">11.45 kV</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Gen V</div>
                                <div className="text-sm font-black text-white font-mono">11.48 kV</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Sync T</div>
                                <div className="text-sm font-black text-white font-mono">0.02s</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
