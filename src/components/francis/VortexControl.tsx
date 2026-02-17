import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wind, Activity, Timer, AlertTriangle, Check, Volume2, ShieldAlert, Cpu } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const VortexControl: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Mapping from Telemetry
    const headRelative = (telemetry.site?.grossHead ?? 152) / 152 * 100; // % of rated head
    const flowRelative = (telemetry.hydraulic?.flow ?? 42.5) / 42.5 * 100; // % of rated flow

    // Vortex intensity estimation logic
    const isVortexLikely = flowRelative < 65 || flowRelative > 95;
    const vortexFrequency = ((telemetry.mechanical?.rpm ?? 0) / 60) * 0.3; // Rheingans frequency

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-emerald-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-emerald-600 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 animate-[spin_5s_linear_infinite]" />
                            <Wind className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-emerald-950 text-emerald-500 text-[10px] font-black border border-emerald-900/50 uppercase tracking-widest">SOP-MECH-015</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.vortex.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.vortex.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Vortex Intelligence Hub */}
                <GlassCard title="Draft Tube Cavitation & Vortex Intelligence" className="relative overflow-hidden group">
                    <div data-hotspot-id="draft_tube" className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-emerald-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> Current Flow Flux
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {flowRelative.toFixed(1)} <span className="text-xs text-slate-500">% Rated</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-emerald-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" /> Vortex Frequency
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter ${isVortexLikely ? 'text-amber-500' : 'text-emerald-400'}`}>
                                {vortexFrequency.toFixed(2)} <span className="text-xs text-slate-500 ml-1">Hz</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-emerald-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Volume2 className="w-3 h-3 text-amber-400" /> Acoustic Intensity
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase tabular-nums">
                                {telemetry.mechanical?.acousticMetrics?.cavitationIntensity?.toFixed(1) ?? '2.4'} <span className="text-[10px] text-slate-500 font-bold ml-1">RMS</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* 2. Vortex Physics Narrative */}
                <section className="bg-emerald-950/10 border-l-[12px] border-emerald-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-emerald-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wind className="w-48 h-48 text-emerald-600" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10 text-pretty">
                        <div className="flex-grow">
                            <h2 className="text-emerald-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 flex items-center gap-3">
                                {t('francis.vortex.s1Title')}
                                <span className={`px-3 py-1 bg-emerald-900 border border-emerald-800 text-white text-[10px] font-black rounded-none uppercase tracking-widest`}>
                                    {isVortexLikely ? 'Rope Detected' : 'Stabile Flux'}
                                </span>
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-bold italic border-l-2 border-emerald-500/30 pl-6 mb-8">
                                {t('francis.vortex.s1Desc')}
                            </p>

                            <div className="h-32 bg-black/40 rounded-none relative overflow-hidden flex justify-center border border-white/5">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_20px_#10b981]" />
                                <div className="w-16 h-[200%] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent absolute origin-top transform rotate-12 blur-md" />
                                <div className="w-8 h-[200%] bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent absolute origin-top transform -rotate-12 blur-sm" />
                            </div>
                        </div>

                        <div className="w-full md:w-80 p-6 bg-slate-950/60 border border-slate-800 rounded-none shadow-none">
                            <h4 className="text-emerald-400 text-[10px] font-black uppercase mb-6 tracking-[0.2em]">{t('francis.vortex.freqCalc')} (RHEINGANS)</h4>
                            <ul className="space-y-4 text-[11px] text-slate-400 font-mono">
                                <li className="flex justify-between border-b border-white/5 pb-2"><span>Rated Speed (fn):</span> <span className="text-white">{((telemetry.mechanical?.rpm ?? 0) / 60).toFixed(2)} Hz</span></li>
                                <li className="flex justify-between text-white font-black pt-2 bg-emerald-950/20 p-2 rounded-none">
                                    <span>Vortex Mode (fv):</span>
                                    <span className="text-emerald-400">{(vortexFrequency).toFixed(2)} Hz</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Air Injection Module */}
                    <GlassCard title={t('francis.vortex.s3Title')} icon={<Wind className="text-cyan-400" />}>
                        <div className="space-y-6">
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{t('francis.vortex.airDesc')}</p>
                            <div className="grid grid-cols-1 gap-3">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="p-4 bg-white/5 rounded-none border border-white/10 flex items-center gap-4 group/opt hover:bg-white/10 transition-all">
                                        <div className="w-8 h-8 rounded-none bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400 font-black text-[10px]">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs text-slate-200 font-bold opacity-80 group-hover/opt:opacity-100 transition-opacity uppercase tracking-tighter">
                                            {t(`francis.vortex.tune${num}`)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-red-950/10 border border-red-500/20 rounded-none">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest">{t('francis.vortex.compCheck')}</h4>
                                    <ShieldAlert className="w-5 h-5 text-red-500/40" />
                                </div>
                                <p className="text-[11px] text-slate-300 font-mono mb-1">{t('francis.vortex.compSpecs')}</p>
                                <p className="text-[9px] text-red-400 font-black italic uppercase leading-tight">{t('francis.vortex.compWarn')}</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Acoustic Diagnosis Matrix */}
                    <GlassCard title={t('francis.vortex.s4Title')} icon={<Volume2 className="text-emerald-400" />}>
                        <div className="overflow-hidden rounded-none border border-white/10 bg-black/40 shadow-none">
                            <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-emerald-900/40 text-emerald-400 font-black uppercase tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.vortex.th1')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.vortex.th2')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.vortex.th3')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[1, 2, 3].map((rowIdx) => (
                                        <tr key={rowIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className={`p-4 font-black uppercase tracking-tighter group-hover:pl-6 transition-all ${rowIdx === 3 ? 'text-amber-500' : 'text-white'}`}>
                                                {t(`francis.vortex.td${rowIdx}_1`)}
                                            </td>
                                            <td className="p-4 font-bold opacity-70 group-hover:opacity-100 italic">{t(`francis.vortex.td${rowIdx}_2`)}</td>
                                            <td className={`p-4 text-right font-black uppercase tracking-tighter ${rowIdx === 3 ? 'text-red-500' : 'text-emerald-400'}`}>
                                                {t(`francis.vortex.td${rowIdx}_3`)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Load Optimization SOP */}
                <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Timer className="w-8 h-8 text-emerald-400" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.vortex.s2Title')}</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="p-8 bg-black/40 rounded-none border border-white/5 hover:bg-black/60 transition-all group/step border-t-4 border-t-emerald-600">
                                <div className="text-emerald-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">{t(`francis.vortex.step${step}Title`)}</div>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed opacity-80 group-hover/step:opacity-100 transition-opacity">
                                    {t(`francis.vortex.step${step}Desc`)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-950/10 border-2 border-amber-500/30 p-8 rounded-none flex gap-6 items-center">
                        <AlertTriangle className="text-amber-500 w-12 h-12 flex-shrink-0 animate-pulse" />
                        <div>
                            <span className="text-amber-500 text-[11px] font-black uppercase tracking-widest block mb-2">{t('francis.vortex.opRule')}</span>
                            <p className="text-sm text-slate-200 font-bold leading-relaxed italic">{t('francis.vortex.ruleText')}</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
