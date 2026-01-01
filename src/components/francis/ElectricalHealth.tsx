import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, EyeOff, Sparkles, Thermometer, CircuitBoard } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const ElectricalHealth: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-[#cbd5e1] font-mono pb-12 overflow-x-hidden">
            <style>
                {`
                @keyframes corona-glow {
                    0% { text-shadow: 0 0 5px rgba(129, 140, 248, 0.2); }
                    50% { text-shadow: 0 0 15px rgba(129, 140, 248, 0.6); }
                    100% { text-shadow: 0 0 5px rgba(129, 140, 248, 0.2); }
                }
                .glow-text { animation: corona-glow 3s infinite; }
                `}
            </style>

            {/* Header */}
            <header className="bg-gradient-to-br from-[#312e81] to-[#0c0a09] border-b-2 border-indigo-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-lg border border-indigo-400/30">
                            <Activity className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 text-[10px] font-bold border border-indigo-800 uppercase">SOP-DIAG-002</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.elecHealth.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.elecHealth.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* 1. Invisible Degradation */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-red-600 bg-red-950/5 border border-red-500/20">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <h2 className="text-xl font-black text-red-500 uppercase tracking-tight flex items-center gap-2">
                                <EyeOff className="w-5 h-5" /> {t('francis.elecHealth.s1Title')}
                            </h2>
                            <span className="px-2 py-1 bg-red-900/30 text-red-500 text-[10px] font-black border border-red-900 uppercase">
                                HIGH VOLTAGE ALERT
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {t('francis.elecHealth.s1Desc')}
                        </p>
                    </section>

                    {/* 2. Dual Technical Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Corona Detection */}
                        <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-indigo-500/20">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-400 glow-text" />
                                <span>{t('francis.elecHealth.cTitle')}</span>
                            </h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-black/40 border border-slate-800 rounded-xl">
                                    <h4 className="text-indigo-400 text-[9px] font-black uppercase mb-2 tracking-widest">
                                        {t('francis.elecHealth.c1')}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 italic">
                                        {t('francis.elecHealth.c1Desc')}
                                    </p>
                                </div>
                                <div className="p-4 bg-black/40 border border-slate-800 rounded-xl">
                                    <h4 className="text-indigo-400 text-[9px] font-black uppercase mb-2 tracking-widest">
                                        {t('francis.elecHealth.c2')}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 italic">
                                        {t('francis.elecHealth.c2Desc')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Thermal Budget */}
                        <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-indigo-500/20">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-indigo-400" />
                                <span>{t('francis.elecHealth.tTitle')}</span>
                            </h2>

                            <div className="overflow-x-auto mb-6">
                                <table className="w-full text-left text-[10px] border-collapse">
                                    <thead>
                                        <tr className="bg-indigo-900/30 text-indigo-300 uppercase font-black text-[8px] tracking-widest">
                                            <th className="p-3 border-b border-indigo-800">{t('francis.elecHealth.thCl')}</th>
                                            <th className="p-3 border-b border-indigo-800">{t('francis.elecHealth.thMax')}</th>
                                            <th className="p-3 border-b border-indigo-800">{t('francis.elecHealth.thH')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        <tr>
                                            <td className="p-3 border-b border-slate-800 font-bold">Class B</td>
                                            <td className="p-3 border-b border-slate-800 font-black">130°C</td>
                                            <td className="p-3 border-b border-slate-800">145°C</td>
                                        </tr>
                                        <tr className="bg-indigo-900/10">
                                            <td className="p-3 border-b border-slate-800 font-bold text-indigo-400">Class F</td>
                                            <td className="p-3 border-b border-slate-800 font-black text-green-500">155°C</td>
                                            <td className="p-3 border-b border-slate-800">170°C</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[9px] text-slate-500 italic text-center">
                                {t('francis.elecHealth.tDesc')}
                            </p>
                        </section>
                    </div>

                    {/* 3. Interlock Logic */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-amber-600 border border-amber-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <CircuitBoard className="text-amber-500 w-6 h-6" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                {t('francis.elecHealth.logicTitle')}
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-2">
                                <div className="p-5 bg-amber-950/20 border border-amber-900/30 rounded-2xl">
                                    <strong className="text-amber-500 text-[10px] font-black uppercase mb-2 block tracking-widest">
                                        {t('francis.elecHealth.rule')}
                                    </strong>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        {t('francis.elecHealth.ruleDesc')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">{t('francis.elecHealth.stat')}</span>
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">{t('francis.elecHealth.stat2')}</span>
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};
