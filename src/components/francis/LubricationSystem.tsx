import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Droplet, ArrowLeft, Settings, AlertTriangle, MapPin, Activity, CheckCircle2, Info } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const LubricationSystem: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Derived State from Telemetry Store
    const oilHealthScore = telemetry.fluidIntelligence?.healthScore ?? 92.4; // %
    const isActiveCycle = true;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-emerald-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-emerald-600 rounded-none border border-white/10 shadow-none relative group">
                            <Droplet className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-none flex items-center justify-center border-2 border-emerald-600">
                                <Activity className="w-2 h-2 text-emerald-600 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-emerald-950 text-emerald-500 text-[10px] font-black border border-emerald-900/50 uppercase tracking-widest">SOP-MECH-020</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.lubrication.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.lubrication.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
                {/* Real-time Status Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center text-center p-8 bg-black/60 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2 relative z-10">System Status</span>
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 relative z-10 animate-pulse" />
                        <span className="text-3xl font-black text-white uppercase tracking-tighter relative z-10">Active</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Last Cycle: 12m ago</span>
                    </GlassCard>

                    <GlassCard className="lg:col-span-3 p-8">
                        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Settings className="text-emerald-500 w-6 h-6 animate-spin-slow" />
                                {t('francis.lubrication.s1Title')}
                            </h2>
                            <div className="flex gap-8">
                                <div className="text-right">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{t('francis.lubrication.interval')}</span>
                                    <div className="text-xl font-black text-emerald-500 tabular-nums">12/24 <span className="text-[10px] opacity-60">Cycles</span></div>
                                </div>
                                <div className="text-right border-l border-white/5 pl-8">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Oil Health</span>
                                    <div className="text-xl font-black text-blue-400 tabular-nums">{oilHealthScore}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-none border border-white/10 shadow-none bg-black/40 mb-8">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-emerald-900/40 text-emerald-400 uppercase font-black text-[9px] tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.lubrication.thZone')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.lubrication.thPts')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.lubrication.thDose')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.lubrication.thFb')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { zone: 'tdReg', pts: '4 (Quadrants)', dose: '5cc', fb: 'fbSw', fbColor: 'text-emerald-400 font-black' },
                                        { zone: 'tdTop', pts: '20 (Points)', dose: '2cc', fb: 'fbEof', fbColor: 'text-emerald-400 font-black' },
                                        { zone: 'tdPins', pts: '40 (Joints)', dose: '1cc', fb: 'fbVis', fbColor: 'text-slate-500 italic' }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-emerald-500 font-black uppercase tracking-tighter group-hover:pl-6 transition-all">{t(`francis.lubrication.${row.zone}`)}</td>
                                            <td className="p-4 font-bold">{row.pts}</td>
                                            <td className="p-4 font-mono font-black">{row.dose}</td>
                                            <td className={`p-4 text-right ${row.fbColor} uppercase text-[10px] tracking-widest`}>{t(`francis.lubrication.${row.fb}`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-amber-900/10 border-2 border-amber-600/30 rounded-none flex items-start gap-6 shadow-none">
                            <AlertTriangle className="text-amber-500 w-10 h-10 flex-shrink-0 animate-pulse" />
                            <div>
                                <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
                                    {t('francis.lubrication.blockLogic')}
                                </span>
                                <p className="text-xs text-slate-300 font-bold italic leading-relaxed">
                                    {t('francis.lubrication.blockDesc')}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Inventory & Manual Route Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inventory */}
                    <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Info className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.lubrication.s2Title')}</h2>
                        </div>
                        <div className="grid gap-6">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="p-5 bg-black/40 border border-white/5 rounded-none group hover:border-blue-500/30 transition-all flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-300 transition-colors">
                                            {t(`francis.lubrication.l${num}Type`)}
                                        </span>
                                        <p className="text-xs text-slate-400 font-bold">
                                            {t(`francis.lubrication.l${num}Use`)}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border ${num === 2 ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                        {t(`francis.lubrication.l${num}St`)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Manual Route */}
                    <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-8 relative overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 relative z-10">
                            <MapPin className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.lubrication.s3Title')}</h2>
                        </div>
                        <div className="grid gap-4 relative z-10">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex items-center gap-4 p-5 bg-black/60 border border-white/10 rounded-none hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                    <div className="w-8 h-8 rounded-none bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                        <span className="text-emerald-500 font-black text-xs">P{num}</span>
                                    </div>
                                    <span className="text-xs text-slate-200 font-black uppercase tracking-widest">
                                        {t(`francis.lubrication.rt${num}`)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};