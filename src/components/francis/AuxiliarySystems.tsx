import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertTriangle, ShieldAlert, Cpu, Activity, Settings, Zap, Clock, Calendar } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const AuxiliarySystems: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-blue-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center justify-center md:justify-start gap-3">
                            <Settings className="w-8 h-8 text-blue-500 animate-spin-slow" />
                            {t('francis.auxiliary.title')}
                        </h1>
                        <p className="text-blue-400 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                            <NeuralPulse /> {t('francis.auxiliary.subtitle')} // NC-4.2 AI-TUNED
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600/10 border-2 border-blue-500/50 text-blue-400 rounded-full font-black hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all group uppercase text-xs tracking-tighter"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.auxiliary.back') || "Return"}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
                {/* Real-time Focus Card */}
                <GlassCard title="Auxiliary Control Hub" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> DC Control Voltage
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                110.2 <span className="text-xs text-slate-500">VDC</span>
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-400" /> Brakes Hydraulic
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                Ready
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3 text-blue-400" /> Drainage System
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter uppercase">
                                Optimal
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* SAFETY MODULE */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-red-900/20">
                    <div className="flex items-start gap-6">
                        <ShieldAlert className="w-12 h-12 text-red-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-2">
                                {t('francis.auxiliary.s1Title')}
                            </h3>
                            <div className="space-y-4 max-w-4xl">
                                <p className="font-black text-white text-xs tracking-widest uppercase opacity-80 border-b border-red-900/40 pb-2">
                                    {t('francis.auxiliary.context')}: {t('francis.auxiliary.s1Desc')}
                                </p>
                                <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-xs font-bold text-slate-300">
                                    <li className="flex gap-4">
                                        <span className="text-red-600">▸</span>
                                        <span><strong className="text-red-100 uppercase tracking-tighter mr-2">{t('francis.auxiliary.danger')}:</strong> {t('francis.auxiliary.s1Li1')}</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-red-600">▸</span>
                                        <span><strong className="text-red-100 uppercase tracking-tighter mr-2">{t('francis.auxiliary.rule')}:</strong> {t('francis.auxiliary.s1Li2')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOP 1 & 2 Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SOP 1 */}
                    <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                <span className="text-blue-400 font-black text-xs">01</span>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.auxiliary.sop1')}</h2>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic font-medium border-l-2 border-blue-500/30 pl-4">
                            {t('francis.auxiliary.sop1Desc')}
                        </p>
                        <div className="space-y-6 pt-4">
                            <div>
                                <h4 className="text-blue-400 text-[10px] font-black uppercase mb-3 tracking-widest">{t('francis.auxiliary.s2Title')}</h4>
                                <ul className="text-[10px] text-slate-500 space-y-2 font-bold uppercase tracking-tighter">
                                    <li className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                                        <span>{t('francis.auxiliary.setpoint')}</span>
                                        <span className="text-white">{t('francis.auxiliary.s2Li1')}</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                                        <span>{t('francis.auxiliary.tooEarly')}</span>
                                        <span className="text-amber-500">{t('francis.auxiliary.s2Li2')}</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                                        <span>{t('francis.auxiliary.tooLate')}</span>
                                        <span className="text-red-500">{t('francis.auxiliary.s2Li3')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* SOP 2 */}
                    <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                                <span className="text-purple-400 font-black text-xs">02</span>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('francis.auxiliary.sop2')}</h2>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic font-medium border-l-2 border-purple-500/30 pl-4">
                            {t('francis.auxiliary.sop2Desc')}
                        </p>
                        <div className="space-y-4 pt-4">
                            <h4 className="text-purple-400 text-[10px] font-black uppercase mb-3 tracking-widest">{t('francis.auxiliary.s4Title')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: t('francis.auxiliary.level1'), val: t('francis.auxiliary.s4Li1') },
                                    { label: t('francis.auxiliary.level2'), val: t('francis.auxiliary.s4Li2') },
                                    { label: t('francis.auxiliary.level3'), val: t('francis.auxiliary.s4Li3') },
                                    { label: t('francis.auxiliary.logic'), val: t('francis.auxiliary.s4Li4') }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <span className="block text-[8px] text-slate-600 font-black uppercase mb-1">{item.label}</span>
                                        <span className="text-[10px] text-slate-300 font-bold">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Checklist Summary */}
                <div className="bg-black/60 p-8 rounded-3xl border border-white/5 flex flex-wrap gap-12 items-center justify-center shadow-2xl">
                    {[
                        { icon: Clock, label: t('francis.auxiliary.weekly'), desc: t('francis.auxiliary.weeklyDesc'), color: 'text-blue-500' },
                        { icon: Activity, label: t('francis.auxiliary.monthly'), desc: t('francis.auxiliary.monthlyDesc'), color: 'text-amber-500' },
                        { icon: Calendar, label: t('francis.auxiliary.annually'), desc: t('francis.auxiliary.annuallyDesc'), color: 'text-emerald-500' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 group">
                            <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                            <div>
                                <span className="block text-[8px] text-slate-500 font-black uppercase tracking-tighter">{item.label}</span>
                                <span className="text-xs text-white font-black uppercase tracking-widest">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};
