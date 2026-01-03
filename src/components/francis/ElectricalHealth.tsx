import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, EyeOff, Sparkles, Thermometer, CircuitBoard, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const ElectricalHealth: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    // Mapping from CEREBRO
    const genVoltage = state.physics.staticPressureBar * 0.18; // Mock derivation for current context
    const isHighVoltage = genVoltage > 13.8;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-indigo-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-indigo-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Zap className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-500 text-[10px] font-black border border-indigo-900/50 uppercase tracking-widest">SOP-DIAG-002</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.elecHealth.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.elecHealth.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Real-time Focus Card */}
                <GlassCard title="Electrical Intelligence Hub" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> Gen Voltage
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                13.8 <span className="text-xs text-slate-500">kV</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-indigo-400" /> Partial Discharge
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter uppercase">
                                Low <span className="text-[10px] text-slate-500 ml-1">5 pC</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Thermometer className="w-3 h-3 text-amber-400" /> Stator Core Temp
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                72.4 <span className="text-xs text-slate-500">°C</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* 2. Invisible Degradation Critical Notice */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-red-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <EyeOff className="w-12 h-12 text-red-600 flex-shrink-0" />
                        <div>
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 flex items-center gap-3">
                                {t('francis.elecHealth.s1Title')}
                                <span className="px-3 py-1 bg-red-900 border border-red-800 text-white text-[10px] font-black rounded uppercase tracking-widest animate-pulse">Critical Alert</span>
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-bold italic border-l-2 border-red-500/30 pl-6">
                                {t('francis.elecHealth.s1Desc')}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Corona Detection */}
                    <GlassCard title={t('francis.elecHealth.cTitle')} icon={<Sparkles className="text-indigo-400" />}>
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="p-6 bg-black/40 border border-indigo-500/20 rounded-3xl hover:bg-indigo-900/10 transition-all group">
                                    <h4 className="text-indigo-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        {t(`francis.elecHealth.c${i}`)}
                                    </h4>
                                    <p className="text-xs text-slate-300 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {t(`francis.elecHealth.c${i}Desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Thermal Budget */}
                    <GlassCard title={t('francis.elecHealth.tTitle')} icon={<Thermometer className="text-indigo-400" />}>
                        <div className="overflow-hidden rounded-3xl border border-white/5 bg-black/40 mb-6 shadow-2xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-indigo-900/40 text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.elecHealth.thCl')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.elecHealth.thMax')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.elecHealth.thH')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { class: 'Class B', max: '130°C', hotspot: '145°C', active: false },
                                        { class: 'Class F', max: '155°C', hotspot: '170°C', active: true }
                                    ].map((row, idx) => (
                                        <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${row.active ? 'bg-indigo-900/10' : ''}`}>
                                            <td className={`p-4 font-black uppercase tracking-tighter ${row.active ? 'text-indigo-400' : ''}`}>{row.class}</td>
                                            <td className="p-4 font-mono font-black">{row.max}</td>
                                            <td className="p-4 text-right font-mono font-black text-indigo-300">{row.hotspot}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-indigo-950/20 rounded-2xl border border-indigo-500/20">
                            <Info className="w-5 h-5 text-indigo-500" />
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter leading-tight">
                                {t('francis.elecHealth.tDesc')}
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Interlock Logic */}
                <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-amber-600/20 flex items-center justify-center border border-amber-500/30">
                            <CircuitBoard className="text-amber-500 w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.elecHealth.logicTitle')}</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="md:col-span-3 space-y-6">
                            <div className="p-8 bg-amber-950/10 border border-amber-500/20 rounded-3xl relative">
                                <div className="absolute top-0 right-0 px-4 py-1 bg-amber-600 text-black text-[9px] font-black uppercase rounded-bl-xl tracking-widest">Logic Rule</div>
                                <h4 className="text-amber-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">{t('francis.elecHealth.rule')}</h4>
                                <p className="text-slate-200 text-sm font-bold italic leading-relaxed">
                                    {t('francis.elecHealth.ruleDesc')}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: t('francis.elecHealth.stat'), active: false, color: 'bg-red-500' },
                                { label: t('francis.elecHealth.stat2'), active: true, color: 'bg-emerald-500' }
                            ].map((stat, idx) => (
                                <div key={idx} className="p-4 bg-black/60 rounded-2xl border border-white/5 flex justify-between items-center group/stat">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover/stat:text-white transition-colors">{stat.label}</span>
                                    <div className={`w-3 h-3 rounded-full ${stat.color} opacity-40 group-hover/stat:opacity-100 transition-opacity ${stat.active ? 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const Info = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
