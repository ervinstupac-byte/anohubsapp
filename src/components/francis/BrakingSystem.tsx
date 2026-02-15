import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Octagon, ArrowLeft, Wind, ShieldAlert, Fan, ArrowUpCircle, Cpu, Activity, Info } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const BrakingSystem: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Mapping from Telemetry
    const rpm = telemetry.mechanical?.rpm ?? 0;
    const rpmPerc = (rpm / 428.5) * 100;
    const airPressure = 7.0; // Bar (Mocked)
    const canBrake = rpmPerc < 20;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-red-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-red-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Octagon className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-red-950 text-red-500 text-[10px] font-black border border-red-900/50 uppercase tracking-widest">SOP-MECH-003</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.braking.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.braking.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* Real-time Focus Card */}
                <GlassCard title="Emergency Response & Braking Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-red-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-red-400" /> Machine Speed
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {rpmPerc.toFixed(1)} <span className="text-xs text-slate-500 uppercase ml-2">% RPM</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-red-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> Air Pressure
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                                {airPressure.toFixed(1)} <span className="text-xs text-slate-500 ml-1">BAR</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-red-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-amber-400" /> Permissive
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter uppercase ${canBrake ? 'text-emerald-400' : 'text-red-500 opacity-40'}`}>
                                {canBrake ? 'Active' : 'Locked'}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* 1. Technical Brake Protocol */}
                <section className="bg-red-950/10 border-l-[12px] border-red-600 p-8 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-red-900/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wind className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                        <div className="flex-grow">
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 flex items-center gap-3">
                                <Wind className="w-8 h-8 flex-shrink-0 animate-pulse" />
                                {t('francis.braking.s1Title')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="p-8 bg-black/40 rounded-3xl border border-white/5 transition-all group/opt hover:bg-black/60">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-2">{t('francis.braking.trig')}</span>
                                    <div className="text-2xl font-black text-white tracking-tighter italic">
                                        &lt; 20% <span className="text-xs font-bold text-slate-600 lowercase ml-2">({(428.5 * 0.2).toFixed(0)} RPM)</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-black/40 rounded-3xl border border-white/5 transition-all group/opt hover:bg-black/60">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-2">{t('francis.braking.app')}</span>
                                    <div className="text-2xl font-black text-amber-500 uppercase tracking-tighter italic">
                                        {t('francis.braking.puls')}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-red-600 text-white rounded-3xl shadow-2xl flex items-start gap-4">
                                <ShieldAlert className="w-10 h-10 flex-shrink-0" />
                                <div>
                                    <h4 className="text-xs font-black uppercase mb-1 tracking-widest">{t('francis.braking.lockTitle')}</h4>
                                    <p className="text-[11px] font-bold leading-relaxed opacity-90">{t('francis.braking.lockDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Dust Extractor */}
                    <GlassCard title={t('francis.braking.s2Title')} icon={<Fan className="text-slate-400" />}>
                        <div className="space-y-6">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className="text-[10px] font-black bg-emerald-900/30 text-emerald-500 px-4 py-1.5 rounded-xl border border-emerald-900 uppercase tracking-widest">STATUS: SYSTEM_SYNC</span>
                            </div>
                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Filter dP</span>
                                        <span className="text-lg font-black text-white font-mono">120 <span className="text-[10px] opacity-40">Pa</span></span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Post-Stop</span>
                                        <span className="text-lg font-black text-white font-mono">+15 <span className="text-[10px] opacity-40">MINS</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative group/warn overflow-hidden">
                                <div className="absolute inset-0 bg-amber-500/5 -translate-x-full group-hover/warn:translate-x-0 transition-transform duration-700" />
                                <h4 className="text-amber-500 text-[10px] font-black uppercase mb-3 tracking-[0.2em] relative z-10 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> {t('francis.braking.warnTitle')}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic relative z-10">{t('francis.braking.warnDesc')}</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Jacking System */}
                    <GlassCard title={t('francis.braking.s3Title')} icon={<ArrowUpCircle className="text-amber-500" />}>
                        <div className="space-y-8">
                            <div className="p-8 bg-amber-950/20 rounded-3xl border border-amber-900/30 text-center relative group/jack overflow-hidden">
                                <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover/jack:translate-y-0 transition-transform duration-700" />
                                <span className="text-[10px] text-amber-500/60 font-black uppercase mb-2 tracking-[0.2em] block relative z-10">{t('francis.braking.oilPress')}</span>
                                <div className="text-5xl font-black text-white font-mono tracking-tighter relative z-10">
                                    0 <span className="text-xl font-normal text-slate-500 uppercase ml-2 tracking-widest italic">BAR</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic border-l-2 border-slate-700 pl-4">
                                {t('francis.braking.jackDesc')}
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Permissive: Speed 0%</div>
                                <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Brakes Released</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};
