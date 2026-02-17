import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Activity, Droplet, FileCheck, Zap, Cpu, Settings } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const HPU: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Mapping HPU data from Telemetry
    // If specific HPU sensors aren't in schema, we use relevant physics/mechanical data
    const staticPressure = telemetry.physics?.staticPressureBar ?? 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-emerald-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center justify-center md:justify-start gap-3">
                            <Settings className="w-8 h-8 text-emerald-500 animate-spin-slow" />
                            {t('francis.hpu.title')}
                        </h1>
                        <p className="text-emerald-400 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                            <NeuralPulse /> {t('francis.hpu.subtitle')} // HIGH-PRESSURE LOGIC
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600/10 border-2 border-emerald-500/50 text-emerald-400 rounded-none font-black hover:bg-emerald-500 hover:text-white hover:shadow-none transition-all group uppercase text-xs tracking-tighter"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.hpu.back_btn') || "Return"}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
                {/* Real-time Focus Card */}
                <GlassCard title="HPU Power Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-4 bg-white/5 rounded-none border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" /> Working Pressure
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {staticPressure.toFixed(1)} <span className="text-xs text-slate-500">BAR</span>
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-400" /> Accumulator Charge
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                98.4 <span className="text-xs text-slate-500">%</span>
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                <Droplet className="w-3 h-3 text-blue-400" /> Oil Viscosity
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter uppercase">
                                Optimal
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* SAFETY MODULE */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-red-900/20">
                    <div className="flex items-start gap-6">
                        <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-2">
                                {t('francis.hpu.safetyTitle')}
                            </h3>
                            <div className="space-y-4 max-w-4xl">
                                <p className="font-black text-white text-xs tracking-widest uppercase opacity-80 border-b border-red-900/40 pb-2">
                                    <strong className="text-red-600">{t('francis.hpu.danger')}:</strong> {t('francis.hpu.dangerDesc')}
                                </p>
                                <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-xs font-bold text-slate-300">
                                    <li className="flex gap-4">
                                        <span className="text-red-600">▸</span>
                                        <span><strong className="text-red-100 uppercase tracking-tighter mr-2">{t('francis.hpu.deEnergize')}:</strong> {t('francis.hpu.deEnDesc')}</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-red-600">▸</span>
                                        <span><strong className="text-red-100 uppercase tracking-tighter mr-2">{t('francis.hpu.injectRisk')}:</strong> {t('francis.hpu.injectDesc')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOP 1 & 2 Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SOP 1 - Accumulators */}
                    <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="w-8 h-8 rounded-none bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                                <span className="text-emerald-400 font-black text-xs">01</span>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.hpu.sop1Title')}</h2>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic font-medium border-l-2 border-emerald-500/30 pl-4">
                            {t('francis.hpu.accDesc')}
                        </p>
                        <div className="space-y-6 pt-4">
                            <div className="p-4 bg-black/40 rounded-none border border-emerald-500/20">
                                <h4 className="text-emerald-400 text-[10px] font-black uppercase mb-3 tracking-widest">{t('francis.hpu.sub1_1')}</h4>
                                <p className="text-xs font-bold text-slate-300 mb-2">{t('francis.hpu.p0Rule')}</p>
                                <div className="bg-emerald-950/30 border-l-4 border-emerald-500 p-3 rounded-none text-[10px] text-emerald-200">
                                    <strong className="block mb-1 font-black uppercase tracking-tighter">{t('francis.hpu.techNote')}</strong>
                                    {t('francis.hpu.techNoteDesc')}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SOP 2 - Sludge */}
                    <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="w-8 h-8 rounded-none bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                <span className="text-blue-400 font-black text-xs">02</span>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.hpu.sop2Title')}</h2>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic font-medium border-l-2 border-blue-500/30 pl-4">
                            {t('francis.hpu.sludgeDesc')}
                        </p>
                        <div className="pt-4">
                            <div className="p-4 bg-blue-900/10 rounded-none border border-blue-500/20 flex items-center gap-4">
                                <Droplet className="w-8 h-8 text-blue-500 animate-pulse" />
                                <div>
                                    <strong className="text-blue-400 text-[10px] font-black uppercase block mb-1 tracking-widest">{t('francis.hpu.target')}</strong>
                                    <p className="text-xs text-slate-300 font-mono">NAS Class 6 / ISO 17/15/12</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* SOP 3 - Water Hammer (HPU context) */}
                <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-none -mr-32 -mt-32" />
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6 relative z-10">
                        <div className="w-8 h-8 rounded-none bg-red-600/20 flex items-center justify-center border border-red-500/30">
                            <span className="text-red-400 font-black text-xs">03</span>
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.hpu.sop3Title')}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <p className="text-sm text-slate-300 leading-relaxed font-bold italic border-l-2 border-red-500/30 pl-6 mb-6">
                                {t('francis.hpu.hammerDesc')}
                            </p>
                            <h3 className="text-red-500 font-black text-xs uppercase tracking-widest mb-4">{t('francis.hpu.sub3_1')}</h3>
                        </div>
                        <div className="bg-black/80 rounded-none border border-white/10 p-8 flex flex-col items-center justify-center shadow-none">
                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">Physics Proof: Joukowsky Equation</span>
                            <div className="text-3xl font-black text-white font-mono tracking-tighter bg-emerald-950/20 px-6 py-4 rounded-none border border-emerald-500/30">
                                ΔP = ρ · c · Δv
                            </div>
                            <p className="text-[9px] text-slate-500 mt-4 uppercase font-bold text-center leading-relaxed">
                                High-speed valve closure triggers pressure wave propagation<br />HPU relief valves must respond within 15ms.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
