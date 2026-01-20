import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCw,
    ArrowLeft,
    ShieldAlert,
    ThermometerSnowflake,
    Filter,
    Undo2,
    Droplet,
    Clock,
    Calendar,
    AlertCircle,
    Activity,
    Thermometer
} from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const BearingsDetail: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    const bearingTemp = state.mechanical.bearingTemp;
    const isHighTemp = bearingTemp > 60;
    const isCriticalTemp = bearingTemp > 70;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pb-12">

            {/* Header */}
            <header className={`bg-black/40 border-b-2 ${isCriticalTemp ? 'border-red-600 animate-pulse' : 'border-amber-500'} py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all`}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className={`p-3 ${isCriticalTemp ? 'bg-red-600' : 'bg-amber-600'} rounded-2xl border border-white/10 shadow-lg`}>
                            <RefreshCw className="text-white w-8 h-8 animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-500 text-[10px] font-black border border-amber-900/50 uppercase tracking-widest">SOP-ROT-001</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.bearingsCheck.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.bearingsCheck.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* Real-time Status Card */}
                <GlassCard title="Real-Time Thermal Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                        {/* Temp Viz */}
                        <div className="lg:col-span-1 flex flex-col justify-center items-center p-6 bg-black/60 rounded-3xl border border-white/5 shadow-2xl">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" data-hotspot-id="upper_guide_bearing">
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="rgba(255,255,255,0.05)" strokeWidth="12"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor" strokeWidth="12"
                                        strokeLinecap="round"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        style={{
                                            strokeDashoffset: 440 * (1 - Math.min(1, bearingTemp / 100)),
                                            transition: 'stroke-dashoffset 1s ease-in-out'
                                        }}
                                        className={isCriticalTemp ? 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : isHighTemp ? 'text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-emerald-500'}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-black font-mono text-white tracking-tighter">
                                        {bearingTemp.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-[#00aaff]">°Celsius</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Narrative */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p data-hotspot-id="upper_guide_bearing" className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                        <Thermometer className="w-3 h-3 text-cyan-400" /> Upper Guide Bearing
                                    </p>
                                    <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                        {bearingTemp.toFixed(1)} <span className="text-xs text-slate-500">°C</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                        <Droplet className="w-3 h-3 text-blue-400" /> Oil Film Health
                                    </p>
                                    <p className={`text-3xl font-black font-mono tracking-tighter ${isCriticalTemp ? 'text-red-500' : 'text-emerald-400'}`}>
                                        {isCriticalTemp ? 'CRITICAL' : 'OPTIMAL'}
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-purple-400" /> Vibration Sync
                                    </p>
                                    <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                        {state.mechanical.vibration.toFixed(2)} <span className="text-xs text-slate-500">mm/s</span>
                                    </p>
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl border-2 transition-all ${isHighTemp ? 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : 'bg-blue-500/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div data-hotspot-id="guide_bearing_indicator" className={`w-2 h-2 rounded-full ${isHighTemp ? 'bg-red-500' : 'bg-blue-400'}`} />
                                    <span className={`text-[10px] ${isHighTemp ? 'text-red-500' : 'text-blue-400'} font-black uppercase tracking-[0.2em]`}>Neural Diagnostic Engine</span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-bold italic">
                                    {isCriticalTemp
                                        ? "🚨 CRITICAL ALERT: Bearing temperature exceeds 70°C. Oil film degradation imminent. Immediate load rejection and unit shutdown recommended."
                                        : isHighTemp
                                            ? "🚨 WARNING: Thermal rise detected (>60°C). Check cooling water flow and radiator efficiency. Verify thermocouple calibration."
                                            : "🤖 SYSTEM STABLE: Thermal profile indicates laminar oil film flow. Cooling efficiency is within nominal range 18°C-55°C."}
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* 1. Oil Film Criticality */}
                <section className={`bg-slate-900/40 backdrop-blur-sm rounded-3xl p-8 border-l-[12px] ${isCriticalTemp ? 'border-red-600 animate-pulse' : 'border-red-600'} border border-white/5 shadow-2xl overflow-hidden relative`}>
                    <div className="absolute inset-0 bg-red-600/5 animate-[pulse_3s_infinite]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldAlert className="text-red-500 w-10 h-10" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {t('francis.bearingsCheck.s1Title')}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mb-8 font-bold italic border-l-2 border-red-500/30 pl-6">
                            {t('francis.bearingsCheck.s1Desc')}
                        </p>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-black/40 border border-red-500/20 rounded-2xl group hover:border-red-500/50 transition-colors">
                                <strong className="text-red-500 text-xs font-black uppercase block mb-3 tracking-widest group-hover:scale-105 transition-transform origin-left">
                                    {t('francis.bearingsCheck.danger')}
                                </strong>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t('francis.bearingsCheck.s1Li1')}
                                </p>
                            </div>
                            <div className="p-6 bg-black/40 border border-amber-500/20 rounded-2xl group hover:border-amber-500/50 transition-colors">
                                <strong className="text-amber-500 text-xs font-black uppercase block mb-3 tracking-widest group-hover:scale-105 transition-transform origin-left">
                                    {t('francis.bearingsCheck.result')}
                                </strong>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t('francis.bearingsCheck.s1Li2')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Heat Exchange & Action Plan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <ThermometerSnowflake className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.bearingsCheck.s2Title')}</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                <h4 className="text-amber-500 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                                    <Filter className="w-3 h-3" /> {t('francis.bearingsCheck.s2Sub1')}
                                </h4>
                                <ul className="text-xs text-slate-400 space-y-3 font-bold">
                                    <li className="flex gap-3"><span className="text-amber-500">▶</span> {t('francis.bearingsCheck.s2Li1')}</li>
                                    <li className="flex gap-3"><span className="text-amber-500">▶</span> {t('francis.bearingsCheck.s2Li2')}</li>
                                </ul>
                            </div>

                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                <h4 className="text-amber-500 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                                    <Undo2 className="w-3 h-3" /> {t('francis.bearingsCheck.s3Sub1')}
                                </h4>
                                <ul className="text-xs text-slate-400 space-y-3 font-bold">
                                    <li className="flex gap-3"><span className="text-amber-500">▶</span> {t('francis.bearingsCheck.s3Li1')}</li>
                                    <li className="flex gap-3"><span className="text-amber-500">▶</span> {t('francis.bearingsCheck.s3Li2')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.bearingsCheck.s4Title')}</h2>
                        </div>

                        <div className="flex-grow space-y-8">
                            <div className="flex gap-6 items-center">
                                <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Droplet className="text-amber-500 w-10 h-10" />
                                </div>
                                <div>
                                    <strong className="text-amber-400 text-xs font-black uppercase block mb-1 tracking-widest">{t('francis.bearingsCheck.symptom')}</strong>
                                    <p className="text-xs text-slate-300 font-bold leading-relaxed">{t('francis.bearingsCheck.s4Li1')}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-red-600/10 border-2 border-red-500/30 rounded-2xl shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-red-500" />
                                    <strong className="text-red-500 text-[10px] font-black uppercase tracking-widest">{t('francis.bearingsCheck.action')}</strong>
                                </div>
                                <p className="text-xs text-slate-200 font-bold italic leading-relaxed">{t('francis.bearingsCheck.s4Li3')}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Checklist Summary */}
                <div className="bg-black/60 p-8 rounded-3xl border border-white/5 flex flex-wrap gap-12 items-center justify-center shadow-2xl">
                    <div className="flex items-center gap-4 border-r border-white/10 pr-12">
                        <Clock className="w-8 h-8 text-amber-500" />
                        <div>
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-tighter">{t('francis.bearingsCheck.daily')}</span>
                            <span className="text-xs text-white font-black uppercase tracking-widest">{t('francis.bearingsCheck.dailyDesc')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="w-8 h-8 text-blue-500" />
                        <div>
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-tighter">{t('francis.bearingsCheck.weekly')}</span>
                            <span className="text-xs text-white font-black uppercase tracking-widest">{t('francis.bearingsCheck.weeklyDesc')}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
