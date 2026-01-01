import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wind, Activity, Timer, AlertTriangle, Check, Volume2 } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const VortexControl: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#064e3b] to-[#0c0a09] border-b border-emerald-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-lg border border-emerald-400/30">
                            <Wind className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 text-[10px] font-bold border border-emerald-800 uppercase">SOP-MECH-015</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">REV 2.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.vortex.title')}
                            </h1>
                            <p className="text-xs text-emerald-200/70 font-bold tracking-widest mt-1 uppercase">
                                {t('francis.vortex.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-emerald-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.vortex.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Physics of Vortex Formation */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-red-500 border border-slate-800">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6">
                        {t('francis.vortex.s1Title')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                                {t('francis.vortex.s1Desc')}
                            </p>
                            {/* Simple CSS animation for vortex rope */}
                            <div className="h-24 bg-black/40 rounded-xl relative overflow-hidden flex justify-center">
                                <div className="w-8 h-[200%] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent absolute animate-[spin_3s_linear_infinite] origin-top transform rotate-12 blur-sm"></div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl">
                            <h4 className="text-emerald-400 text-[10px] font-black uppercase mb-4">{t('francis.vortex.freqCalc')}</h4>
                            <ul className="space-y-3 text-[10px] text-slate-400 font-mono">
                                <li className="flex justify-between"><span>{t('francis.vortex.calc1').split(':')[0]}:</span> <span>{t('francis.vortex.calc1').split(':')[1]}</span></li>
                                <li className="flex justify-between"><span>{t('francis.vortex.calc2').split(':')[0]}:</span> <span>{t('francis.vortex.calc2').split(':')[1]}</span></li>
                                <li className="flex justify-between text-white font-bold border-t border-slate-800 pt-2">
                                    <span>{t('francis.vortex.calc3').split(':')[0]}:</span>
                                    <span className="text-emerald-400">{t('francis.vortex.calc3').split(':')[1]}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 2. Load Shifting Diagnostic */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-emerald-600 border border-slate-800">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6">
                        {t('francis.vortex.s2Title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <span className="text-emerald-500 text-[10px] font-black uppercase block mb-1">{t('francis.vortex.step1Title')}</span>
                            <p className="text-[9px] text-slate-500">{t('francis.vortex.step1Desc')}</p>
                        </div>
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <span className="text-emerald-500 text-[10px] font-black uppercase block mb-1">{t('francis.vortex.step2Title')}</span>
                            <p className="text-[9px] text-slate-500">{t('francis.vortex.step2Desc')}</p>
                        </div>
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                            <span className="text-emerald-500 text-[10px] font-black uppercase block mb-1">{t('francis.vortex.step3Title')}</span>
                            <p className="text-[9px] text-slate-500">{t('francis.vortex.step3Desc')}</p>
                        </div>
                    </div>

                    <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-start gap-4">
                        <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
                        <div>
                            <span className="text-amber-500 text-[10px] font-black uppercase">{t('francis.vortex.opRule')}</span>
                            <p className="text-[10px] text-slate-400 mt-1">{t('francis.vortex.ruleText')}</p>
                        </div>
                    </div>
                </section>

                {/* 3. Air Injection Tuning */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-cyan-600 border border-slate-800">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6">
                        {t('francis.vortex.s3Title')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-[11px] text-slate-400">{t('francis.vortex.airDesc')}</p>
                            <ul className="space-y-2 text-[10px] text-cyan-500 font-bold">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> <span>{t('francis.vortex.tune1')}</span></li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> <span>{t('francis.vortex.tune2')}</span></li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> <span>{t('francis.vortex.tune3')}</span></li>
                            </ul>
                        </div>
                        <div className="p-6 bg-black/40 border border-slate-800 rounded-2xl">
                            <h4 className="text-white text-[10px] font-black uppercase mb-3">{t('francis.vortex.compCheck')}</h4>
                            <p className="text-[11px] text-slate-300 font-mono mb-2">{t('francis.vortex.compSpecs')}</p>
                            <p className="text-[9px] text-slate-500 italic border-l-2 border-red-500/50 pl-2">{t('francis.vortex.compWarn')}</p>
                        </div>
                    </div>
                </section>

                {/* 4. Acoustic Diagnosis */}
                <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-8">
                    <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-slate-200 font-bold text-sm uppercase">{t('francis.vortex.s4Title')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-emerald-950/20 text-[10px] text-emerald-400 uppercase">
                                    <th className="p-3 border-b border-slate-800">{t('francis.vortex.th1')}</th>
                                    <th className="p-3 border-b border-slate-800">{t('francis.vortex.th2')}</th>
                                    <th className="p-3 border-b border-slate-800">{t('francis.vortex.th3')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px] text-slate-400">
                                <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition">
                                    <td className="p-3 text-emerald-400 font-bold">{t('francis.vortex.td1_1')}</td>
                                    <td className="p-3">{t('francis.vortex.td1_2')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.vortex.td1_3')}</td>
                                </tr>
                                <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition">
                                    <td className="p-3 text-white font-bold">{t('francis.vortex.td2_1')}</td>
                                    <td className="p-3">{t('francis.vortex.td2_2')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.vortex.td2_3')}</td>
                                </tr>
                                <tr className="hover:bg-slate-900/30 transition">
                                    <td className="p-3 text-amber-500 font-bold">{t('francis.vortex.td3_1')}</td>
                                    <td className="p-3">{t('francis.vortex.td3_2')}</td>
                                    <td className="p-3 text-red-500 font-black">{t('francis.vortex.td3_3')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>
        </div>
    );
};
