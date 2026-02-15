import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Zap, Shield, AlertTriangle, CheckSquare, Settings, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const CathodicProtection: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Mapping from CEREBRO (Mocked for electrochemical context)
    const sacrificialCurrent = 1.2; // Amps
    const protectionPotential = -1100; // mV
    const isOptimal = protectionPotential < -850;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-emerald-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-emerald-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 animate-[spin_8s_linear_infinite]" />
                            <Atom className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-500 text-[10px] font-black border border-emerald-900/50 uppercase tracking-widest">SOP-MECH-014</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.cathodic.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.cathodic.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* Real-time Focus Card */}
                <GlassCard title="Electrochemical Protection Monitor" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-emerald-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" /> Sacrificial Flux
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {sacrificialCurrent.toFixed(2)} <span className="text-xs text-slate-500 uppercase ml-2">Amps</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-emerald-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> Protection Potential
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter ${isOptimal ? 'text-emerald-400' : 'text-amber-500'}`}>
                                {protectionPotential} <span className="text-xs text-slate-500 ml-1">mV</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-emerald-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Shield className="w-3 h-3 text-amber-400" /> Anode Health
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                Optimal
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Electrochemical Logic */}
                    <GlassCard title={t('francis.cathodic.s1Title')} icon={<Zap className="text-emerald-400" />}>
                        <div className="space-y-6">
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{t('francis.cathodic.s1Desc')}</p>
                            <div className="p-6 bg-black/40 border border-white/5 rounded-3xl shadow-inner group/rule overflow-hidden relative">
                                <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover/rule:translate-x-0 transition-transform duration-700" />
                                <span className="text-emerald-500 text-[10px] font-black uppercase block mb-3 tracking-[0.2em] relative z-10">{t('francis.cathodic.h1Rule')}</span>
                                <p className="text-[11px] text-slate-300 font-bold italic border-l-2 border-emerald-500/30 pl-4 relative z-10">
                                    {t('francis.cathodic.ruleDesc')}
                                </p>
                            </div>
                            <div className="p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-3xl relative group/spec overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover/spec:translate-y-0 transition-transform duration-700" />
                                <h4 className="text-white text-[10px] font-black uppercase mb-4 tracking-[0.2em] relative z-10">{t('francis.cathodic.h1Spec')}</h4>
                                <div className="flex items-center gap-6 p-6 bg-black/60 rounded-2xl mb-4 relative z-10 border border-white/10">
                                    <div className="p-4 bg-emerald-600 rounded-2xl shadow-xl group-hover/spec:scale-110 transition-transform">
                                        <Zap className="text-white w-8 h-8" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-emerald-400 font-black block uppercase tracking-widest mb-1">Target Potency</span>
                                        <span className="text-3xl font-black text-white font-mono tracking-tighter">{t('francis.cathodic.targetVal')}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic relative z-10 font-bold">
                                    {t('francis.cathodic.specNote')}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Troubleshooting Matrix */}
                    <GlassCard title={t('francis.cathodic.s3Title')} icon={<Settings className="text-emerald-400" />}>
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
                            <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-emerald-900/40 text-emerald-400 font-black uppercase tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.cathodic.th1')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.cathodic.th2')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.cathodic.th3')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[1, 2, 3].map((rowIdx) => (
                                        <tr key={rowIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-black text-emerald-400 uppercase tracking-tighter group-hover:pl-6 transition-all">
                                                {t(`francis.cathodic.obs${rowIdx}`)}
                                            </td>
                                            <td className="p-4 font-bold opacity-70 group-hover:opacity-100 italic">{t(`francis.cathodic.diag${rowIdx}`)}</td>
                                            <td className="p-4 text-right font-black text-white uppercase tracking-tighter group-active:scale-95 transition-transform">
                                                {t(`francis.cathodic.act${rowIdx}`)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 p-6 bg-black/40 rounded-3xl border border-white/5">
                            <div className="flex gap-4 items-center mb-4">
                                <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
                                <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">{t('francis.cathodic.h2Warn')}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">
                                {t('francis.cathodic.warnDesc')}
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Installation Pulse */}
                <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <CheckSquare className="w-8 h-8 text-emerald-400" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.cathodic.s2Title')}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">{t('francis.cathodic.steps')}</h4>
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="p-5 bg-black/40 rounded-2xl border border-white/5 flex gap-5 items-center group/step hover:border-emerald-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 font-black shrink-0 group-hover/step:rotate-12 transition-transform">
                                        {num}
                                    </div>
                                    <div className="text-[11px] text-slate-300 font-bold uppercase tracking-tight leading-relaxed">
                                        {num === 1 ? <span dangerouslySetInnerHTML={{ __html: t('francis.cathodic.l1') }} /> : t(`francis.cathodic.l${num}`)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-red-900/10 border-2 border-red-500/20 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center text-center group/crit">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/crit:opacity-10 transition-opacity">
                                <ShieldAlert className="w-32 h-32 text-red-600" />
                            </div>
                            <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-6 animate-bounce" />
                            <span className="text-[11px] text-red-400 font-black uppercase tracking-widest leading-relaxed mb-4">
                                {t('francis.cathodic.critAlert')}
                            </span>
                            <div className="p-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10 shadow-xl">
                                Protocol Zero Resistance
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
