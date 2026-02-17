import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, LayoutDashboard, Megaphone, ZapOff, Hand, ChevronRight, AlertTriangle, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const EmergencyProtocols: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Data from Telemetry Store
    const gridFreq = telemetry.governor?.actualValue?.toNumber() ?? 50.0;
    const isGridCrit = gridFreq < 48.0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-red-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-red-600 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            <AlertOctagon className="text-white w-10 h-10 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-red-950 text-red-500 text-[10px] font-black border border-red-900/50 uppercase tracking-widest">SOP-EM-999</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.emergencyProtocols.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <LayoutDashboard className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.emergencyProtocols.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                {/* 1. Global Emergency Pulse */}
                <div className="bg-red-900/10 border-l-[12px] border-red-600 p-10 rounded-none shadow-none backdrop-blur-sm border border-red-900/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Megaphone className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex items-start gap-8 relative z-10">
                        <Megaphone className="text-red-600 w-12 h-12 flex-shrink-0 animate-bounce" />
                        <div>
                            <h2 className="text-red-500 font-extrabold text-3xl uppercase tracking-tighter mb-4 shadow-none">
                                {t('francis.emergencyProtocols.noticeHead')}
                            </h2>
                            <p className="text-lg text-slate-200 font-bold italic leading-relaxed max-w-4xl border-l-2 border-red-500/30 pl-6">
                                {t('francis.emergencyProtocols.noticeBody')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-16">
                    {/* PROTOCOL 1: SDO - STATION BLACKOUT */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 bg-red-950/20 p-4 rounded-none border border-red-900/50">
                            <span className="px-4 py-1.5 bg-red-600 text-white text-[11px] font-black rounded-none shadow-none">P-01</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.emergencyProtocols.p1.title')}</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <GlassCard title={t('francis.emergencyProtocols.p1.scenario')} icon={<ZapOff className="text-red-500" />}>
                                <p className="text-sm text-slate-400 font-bold italic leading-relaxed mb-8">{t('francis.emergencyProtocols.p1.scenarioDesc')}</p>
                                <div className="p-8 bg-black/60 rounded-none border border-red-500/20 shadow-none group/warn overflow-hidden relative">
                                    <div className="absolute inset-0 bg-red-500/5 -translate-x-full group-hover/warn:translate-x-0 transition-transform duration-1000" />
                                    <h4 className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em] relative z-10">{t('francis.emergencyProtocols.p1.dangerHead')}</h4>
                                    <p className="text-sm text-red-200 font-black relative z-10 opacity-80 group-hover/warn:opacity-100 transition-opacity">
                                        {t('francis.emergencyProtocols.p1.dangerDesc')}
                                    </p>
                                </div>
                            </GlassCard>

                            <GlassCard title={t('francis.emergencyProtocols.p1.autoResp')} icon={<Cpu className="text-red-400" />}>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((num) => (
                                        <div key={num} className="p-5 bg-black/40 rounded-none border border-white/5 flex gap-5 items-center group/step hover:bg-black/60 transition-all border-l-4 border-l-red-600">
                                            <div className="text-red-500 font-black text-xs uppercase opacity-40 group-hover/step:opacity-100 transition-opacity">0{num}</div>
                                            <div className="text-[11px] text-slate-300 font-bold uppercase tracking-tight leading-relaxed">
                                                {t(`francis.emergencyProtocols.p1.auto${num}`)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        <div className="p-10 bg-black/40 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <div className="absolute inset-0 bg-amber-500/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                            <h3 className="text-amber-500 font-black mb-8 flex items-center gap-4 uppercase text-lg tracking-tighter relative z-10">
                                <Hand className="w-8 h-8 animate-pulse" /> {t('francis.emergencyProtocols.p1.manualHead')}
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6 relative z-10">
                                {[1, 2, 3].map(num => (
                                    <div key={num} className={`p-8 rounded-none border transition-all duration-500 group/man ${num === 3 ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900/60 border-white/5 hover:border-amber-500/30'}`}>
                                        <div className="text-xs text-white font-black uppercase tracking-tight leading-relaxed opacity-80 group-hover/man:opacity-100 transition-opacity">
                                            {t(`francis.emergencyProtocols.p1.man${num}`)}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                            <ShieldAlert className={`w-5 h-5 ${num === 3 ? 'text-red-500' : 'text-amber-500/20'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* PROTOCOL 2: SILT FLOOD */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 bg-amber-950/20 p-4 rounded-none border border-amber-900/50">
                            <span className="px-4 py-1.5 bg-amber-600 text-white text-[11px] font-black rounded-none shadow-none">P-02</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.emergencyProtocols.p2.title')}</h2>
                        </div>

                        <div className="bg-amber-950/10 border-l-[8px] border-amber-600 border border-amber-900/20 p-8 rounded-none mb-8">
                            <p className="text-sm text-slate-200 font-bold italic">
                                {t('francis.emergencyProtocols.p2.desc')}
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-none border border-white/10 bg-black/40 shadow-none">
                            <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                    <tr className="bg-amber-900/40 text-amber-500 uppercase font-black tracking-[0.2em]">
                                        <th className="p-6 border-b border-white/5">{t('francis.emergencyProtocols.p2.thConc')}</th>
                                        <th className="p-6 border-b border-white/5">{t('francis.emergencyProtocols.p2.thStatus')}</th>
                                        <th className="p-6 border-b border-white/5 text-right font-black">{t('francis.emergencyProtocols.p2.thAction')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { range: '1000 - 3000', key: 'Warn', color: 'text-amber-500' },
                                        { range: '3000 - 5000', key: 'Crit', color: 'text-orange-500' },
                                        { range: '> 5000', key: 'Em', color: 'text-red-500 animate-pulse' }
                                    ].map((row, idx) => (
                                        <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors group ${row.key === 'Em' ? 'bg-red-950/10' : ''}`}>
                                            <td className="p-6 font-mono font-black text-lg tracking-tighter text-white">{row.range} <span className="text-xs opacity-40 font-sans">ppm</span></td>
                                            <td className={`p-6 font-black uppercase tracking-widest ${row.color}`}>{t(`francis.emergencyProtocols.p2.st${row.key}`)}</td>
                                            <td className="p-6 text-right font-bold opacity-80 group-hover:opacity-100 transition-opacity italic">{t(`francis.emergencyProtocols.p2.act${row.key}`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Grid Anomaly Intelligence */}
                <section className="bg-black/40 p-10 rounded-none border border-cyan-900/30 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-10 relative z-10">
                        <Activity className="w-8 h-8 text-cyan-500" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter shadow-none">Frequency Desync Intelligence</h2>
                        <div className="ml-auto px-4 py-1.5 bg-cyan-600 text-white text-[11px] font-black rounded-none shadow-none">P-06</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 relative z-10">
                        <div className="p-10 bg-black/60 rounded-none border border-white/5 flex justify-between items-center group/freq">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('francis.emergencyProtocols.p6.limit')}</span>
                                <div className="text-5xl font-black text-red-500 font-mono tracking-tighter group-hover/freq:scale-105 transition-transform duration-500">
                                    {gridFreq} <span className="text-sm font-normal text-slate-500 lowercase opacity-40">Hz</span>
                                </div>
                            </div>
                            <div className="w-20 h-20 rounded-none border-4 border-red-500/20 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-none border-t-4 border-red-500 animate-spin" />
                                <AlertTriangle className="text-red-500 w-8 h-8 animate-pulse" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-4">
                            <div className="text-xl font-black text-amber-500 uppercase tracking-tighter mb-2 italic">
                                {t('francis.emergencyProtocols.p6.resp')}
                            </div>
                            <p className="text-sm text-slate-300 font-bold leading-relaxed opacity-80 border-l-2 border-amber-500/30 pl-4 italic">
                                {t('francis.emergencyProtocols.p6.desc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer Validation */}
                <div className="mt-16 pt-12 border-t border-white/5 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900/60 rounded-none border border-white/5 mb-6">
                        <ShieldAlert className="w-4 h-4 text-slate-500" />
                        <span className="text-[10px] text-slate-500 font-black tracking-[0.3em] uppercase">{t('francis.emergencyProtocols.footer')}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};