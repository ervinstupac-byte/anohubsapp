import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, Settings, Ruler, Droplets, Activity, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const RegulatingRing: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Telemetry from Telemetry Store
    const frictionFactor = 0.42; // Placeholder for now
    const huntingActive = false; // Placeholder for now
    const ringPressure = (telemetry.physics?.staticPressureBar ?? 0) * 0.95;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-indigo-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-indigo-600 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 animate-[spin_10s_linear_infinite]" />
                            <RefreshCw className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-indigo-950 text-indigo-500 text-[10px] font-black border border-indigo-900/50 uppercase tracking-widest">SOP-MECH-005</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.regRing.title')}
                            </h1>
                            <p className="text-xs text-indigo-400 font-black tracking-widest mt-1 uppercase opacity-80">
                                {t('francis.regRing.subtitle')} // SERVO-KINEMATIC NODE
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.regRing.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* Real-time Focus Card */}
                <GlassCard title="Kinematic Friction Monitor" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-indigo-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-indigo-400" /> Friction Coeff
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {frictionFactor.toFixed(2)} <span className="text-xs text-slate-500 uppercase ml-1">μ</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-indigo-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-emerald-400" /> Servo Pressure
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                                {ringPressure.toFixed(1)} <span className="text-xs text-slate-500 ml-1">BAR</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-indigo-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Settings className="w-3 h-3 text-cyan-400" /> Hunting Status
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter uppercase ${huntingActive ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {huntingActive ? 'Detected' : 'Stabile'}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Intro Module: The Hunting Problem */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-red-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10 text-pretty">
                        <div className="flex-grow">
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 flex items-center gap-3">
                                <AlertTriangle className="w-8 h-8 flex-shrink-0 animate-pulse" />
                                {t('francis.regRing.introTitle')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8 mb-4">
                                <div className="space-y-3 text-[11px] font-bold text-slate-300 leading-relaxed italic border-l-2 border-red-500/30 pl-6">
                                    <p><strong className="text-red-400 uppercase tracking-widest block mb-1">{t('francis.regRing.context')}</strong> {t('francis.regRing.risk')}</p>
                                </div>
                                <div className="space-y-3 text-[11px] font-bold text-slate-300 leading-relaxed italic border-l-2 border-red-500/30 pl-6">
                                    <p><strong className="text-red-400 uppercase tracking-widest block mb-1">{t('francis.regRing.rootCause')}</strong> {t('francis.regRing.impact')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SOP 1: Friction Analysis */}
                    <GlassCard title={t('francis.regRing.s1Title')} icon={<Activity className="text-amber-500" />}>
                        <p className="text-[10px] text-slate-500 font-bold mb-8 uppercase tracking-widest leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
                            {t('francis.regRing.s1Intro')}
                        </p>

                        <div className="grid grid-cols-1 gap-8 mb-4">
                            <div className="p-6 bg-amber-950/10 rounded-none border border-amber-600/30 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-amber-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <h4 className="text-amber-500 text-[11px] font-black uppercase mb-3 tracking-[0.2em] relative z-10">{t('francis.regRing.s1RiskTitle')}</h4>
                                <p className="text-[11px] text-slate-300 mb-6 font-bold leading-relaxed relative z-10">{t('francis.regRing.s1RiskText')}</p>
                                <div className="px-5 py-2 bg-amber-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest relative z-10 shadow-lg text-center">
                                    {t('francis.regRing.s1Action')}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">{t('francis.regRing.s1ProcTitle')}</h4>
                                <div className="space-y-3">
                                    <div className="p-4 bg-white/5 rounded-none border border-white/10 flex gap-4 items-center group/opt">
                                        <div className="w-8 h-8 rounded-none bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-black text-[10px]">1</div>
                                        <span className="text-xs text-slate-300 font-bold opacity-80 group-hover/opt:opacity-100 transition-opacity">{t('francis.regRing.s1Step1')}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-none border border-white/10 flex gap-4 items-center group/opt">
                                        <div className="w-8 h-8 rounded-none bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-black text-[10px]">2</div>
                                        <span className="text-xs text-slate-300 font-bold opacity-80 group-hover/opt:opacity-100 transition-opacity">{t('francis.regRing.s1Step2')}</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="p-3 bg-emerald-950/20 border-2 border-emerald-500/20 rounded-none text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-none bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                        {t('francis.regRing.s1Pass')}
                                    </div>
                                    <div className="p-3 bg-red-950/20 border-2 border-red-500/20 rounded-none text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-none bg-red-500 shadow-[0_0_10px_#ef4444]" />
                                        {t('francis.regRing.s1Fail')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* SOP 2: Eccentric Pin Adjustment */}
                    <GlassCard title={t('francis.regRing.s2Title')} icon={<Settings className="text-cyan-400" />}>
                        <p className="text-[10px] text-slate-500 font-bold mb-8 uppercase tracking-widest leading-relaxed italic">
                            {t('francis.regRing.s2Intro')}
                        </p>

                        <div className="mb-8 p-6 bg-black/80 rounded-none border border-white/10 shadow-none relative overflow-hidden group">
                            <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            <p className="text-[11px] text-cyan-400 font-mono font-black tracking-tighter leading-relaxed relative z-10 text-center">
                                {t('francis.regRing.s2Physics')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">{t('francis.regRing.s2ProcTitle')}</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className="flex gap-4 p-5 bg-white/5 rounded-none border border-white/5 hover:bg-white/10 transition-colors group/step">
                                        <div className="w-10 h-10 rounded-none bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400 font-black shrink-0 transition-transform group-hover/step:scale-110">
                                            {step < 10 ? `0${step}` : step}
                                        </div>
                                        <p className="text-xs text-slate-300 font-bold leading-relaxed pt-1">{t(`francis.regRing.s2Step${step}`)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* SOP 3: Pre-Start Lubrication */}
                <section className="bg-indigo-900/10 border-l-[12px] border-indigo-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-indigo-900/20 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8 relative z-10">
                        <Droplets className="w-8 h-8 text-indigo-400" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.regRing.s3Title')}</h2>
                        <div className="ml-4 px-3 py-1 bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black rounded-none uppercase tracking-widest">{t('francis.regRing.s3Mandatory')}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="p-8 bg-black/60 rounded-none border border-white/10 text-center space-y-4 hover:border-indigo-500/30 transition-all group/card">
                                <div className="w-12 h-12 rounded-none bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center mx-auto mb-2 text-indigo-400 font-black text-xl shadow-none group-hover/card:scale-110 transition-transform">
                                    {step}
                                </div>
                                <p className="text-xs text-slate-300 font-black uppercase tracking-widest">{t(`francis.regRing.s3Step${step}`)}</p>
                                <div className="pt-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
