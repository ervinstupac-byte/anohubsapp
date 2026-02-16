import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Thermometer,
    Droplets,
    Activity,
    RefreshCw,
    AlertTriangle,
    Snowflake,
    Sun,
    StopCircle,
    ShieldAlert,
    Wind,
    Waves
} from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const CoolingWater: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();
    const [activeTab, setActiveTab] = useState<'winter' | 'summer' | 'failure'>('winter');

    // Telemetry from TelemetryStore
    const coolingFlow = 120; // L/s (Simulated or from francis.sensors)
    const coolingPressure = 4.2; // Bar
    const inletTemp = (telemetry.site?.temperature ?? 20) - 6.6; // Computed delta for cooling water

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12 selection:bg-cyan-500/30">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-cyan-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center justify-center md:justify-start gap-3">
                            <Snowflake className="w-8 h-8 text-cyan-500 animate-pulse" />
                            {t('francis.coolingWater.title')}
                        </h1>
                        <p className="text-cyan-400 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                            <NeuralPulse /> {t('francis.coolingWater.subtitle') || "THERMAL REJECTION LOGIC"} // NC-9.0 CRYOSYNC
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/40 border border-cyan-500/30 px-4 py-2 rounded-2xl flex flex-col items-end">
                            <span className="text-[8px] text-cyan-500 font-black uppercase tracking-tighter">Current Flow</span>
                            <span className="text-xl font-black font-mono text-white">{coolingFlow} <span className="text-[10px] text-slate-500">L/s</span></span>
                        </div>
                        <button
                            onClick={() => navigate(FRANCIS_PATHS.HUB)}
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-600/10 border-2 border-cyan-500/50 text-cyan-400 rounded-full font-black hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all group uppercase text-xs tracking-tighter"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                            <span>{t('francis.coolingWater.return') || "Return"}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
                {/* Real-time Status Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Auto-Strainers */}
                    <GlassCard title={t('francis.coolingWater.s1Title')} className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Waves className="w-48 h-48 text-cyan-500" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="bg-black/40 p-6 rounded-3xl border border-white/5 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{t('francis.coolingWater.dpVal')}</span>
                                    <span className="text-emerald-400 font-mono font-black text-xl bg-emerald-900/20 px-4 py-1 rounded-full border border-emerald-500/20">0.12 BAR</span>
                                </div>
                                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div className="w-[24%] bg-gradient-to-r from-cyan-500 to-emerald-500 h-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 italic font-bold leading-relaxed">{t('francis.coolingWater.dpDesc')}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-white/5 pb-2">{t('francis.coolingWater.flushLogic')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <Activity className="w-5 h-5 text-cyan-400 mb-2" />
                                        <strong className="block text-white text-[10px] font-black uppercase mb-1">{t('francis.coolingWater.trig')}</strong>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">0.30 Bar Delta</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <RefreshCw className="w-5 h-5 text-emerald-400 mb-2 animate-spin-slow" />
                                        <strong className="block text-white text-[10px] font-black uppercase mb-1">{t('francis.coolingWater.act')}</strong>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">60s Flush Cycle</span>
                                    </div>
                                    <div className="p-4 bg-red-900/10 rounded-2xl border border-red-500/20 hover:bg-red-900/20 transition-colors">
                                        <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
                                        <strong className="block text-red-400 text-[10px] font-black uppercase mb-1">{t('francis.coolingWater.jam')}</strong>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Manual Override</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Component Performance */}
                    <GlassCard title={t('francis.coolingWater.s2Title')} icon={<Thermometer className="text-cyan-400" />}>
                        <div className="overflow-hidden rounded-3xl border border-white/5 bg-black/40">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-cyan-900/40 text-cyan-400 font-black text-[9px] uppercase tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.coolingWater.thCol')}</th>
                                        <th className="p-4 border-b border-white/5 text-right">{t('francis.coolingWater.thFlow')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.coolingWater.thStat')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[1, 2, 3].map((i) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-colors border-b border-white/5">
                                            <td className="p-4 font-black uppercase tracking-tighter">{t(`francis.coolingWater.col${i}`)}</td>
                                            <td className="p-4 text-right font-mono font-black text-cyan-300">
                                                {i === 1 ? '850 m³/h' : i === 2 ? '45 L/min' : '30 L/min'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                                    {t('francis.coolingWater.healthy')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 p-6 bg-gradient-to-br from-cyan-950/40 to-black rounded-3xl border border-cyan-500/20 flex justify-between items-center group overflow-hidden relative">
                            <div className="absolute inset-0 bg-cyan-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                            <div className="relative z-10 flex flex-col">
                                <span className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-1">{t('francis.coolingWater.inletTemp')}</span>
                                <span className="text-3xl font-black font-mono text-white tracking-tighter tabular-nums">{inletTemp.toFixed(1)}°C</span>
                            </div>
                            <Snowflake className="w-12 h-12 text-cyan-500 relative z-10 opacity-50 group-hover:rotate-180 transition-transform duration-1000" />
                        </div>
                    </GlassCard>
                </div>

                {/* Thermal Regulation Logic Tabs */}
                <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-8">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Activity className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.coolingWater.s3Title')}</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {[
                            { id: 'winter', icon: Snowflake, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', label: t('francis.coolingWater.modeWinter') },
                            { id: 'summer', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', label: t('francis.coolingWater.modeSummer') },
                            { id: 'failure', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', label: t('francis.coolingWater.modeFail') }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center gap-4 group relative overflow-hidden ${activeTab === tab.id
                                    ? `${tab.bg} ${tab.border} ${tab.color} shadow-[0_0_30px_rgba(6,182,212,0.15)]`
                                    : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10'
                                    }`}
                            >
                                <div className={`p-4 rounded-2xl ${activeTab === tab.id ? 'bg-white/10' : 'bg-white/5'} transition-colors`}>
                                    <tab.icon className={`w-8 h-8 ${activeTab === tab.id ? tab.color : 'text-slate-600'}`} />
                                </div>
                                <span className={`font-black uppercase tracking-[0.2em] text-xs ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.label}</span>
                                {activeTab === tab.id && <div className={`absolute bottom-0 left-0 right-0 h-1 ${tab.id === 'winter' ? 'bg-cyan-500' : tab.id === 'summer' ? 'bg-amber-500' : 'bg-red-500'}`} />}
                            </button>
                        ))}
                    </div>

                    <div className="bg-black/60 p-8 rounded-3xl border border-white/5 min-h-[200px] flex items-center justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

                        {activeTab === 'winter' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl text-center space-y-4">
                                <h4 className="text-2xl font-black text-cyan-400 uppercase tracking-tighter">{t('francis.coolingWater.modeRec')}</h4>
                                <p className="text-slate-300 text-lg font-bold leading-relaxed">{t('francis.coolingWater.descWinter')}</p>
                                <div className="flex justify-center gap-2 pt-4">
                                    <NeuralPulse />
                                </div>
                            </div>
                        )}
                        {activeTab === 'summer' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl text-center space-y-4">
                                <h4 className="text-2xl font-black text-amber-400 uppercase tracking-tighter">{t('francis.coolingWater.modeFull')}</h4>
                                <p className="text-slate-300 text-lg font-bold leading-relaxed">{t('francis.coolingWater.descSummer')}</p>
                                <div className="flex justify-center gap-2 pt-4">
                                    <div className="w-12 h-1 bg-amber-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        )}
                        {activeTab === 'failure' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl text-center space-y-4">
                                <h4 className="text-2xl font-black text-red-500 uppercase tracking-tighter">{t('francis.coolingWater.modeMan')}</h4>
                                <p className="text-red-200 text-lg font-bold leading-relaxed italic">{t('francis.coolingWater.descFail')}</p>
                                <div className="flex justify-center gap-2 pt-4">
                                    <ShieldAlert className="w-8 h-8 text-red-600 animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CoolingWater;
