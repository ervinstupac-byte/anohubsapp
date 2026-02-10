import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Droplets, Activity, RefreshCw, AlertTriangle, Snowflake, Sun, StopCircle } from 'lucide-react';

const CoolingWater: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'winter' | 'summer' | 'failure'>('winter');

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

                {/* Header */}
                <header className="border-b-4 border-cyan-500 pb-6 bg-gradient-to-r from-slate-900 to-slate-900/50 p-6 rounded-lg shadow-lg shadow-cyan-900/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-full">
                            <Snowflake className="w-10 h-10 text-cyan-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-cyan-500 uppercase glitch-text">
                                {t('francis.coolingWater.title')}
                            </h1>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded tracking-wider border border-cyan-500/30">FLOW: 120 L/s</span>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded tracking-wider border border-green-500/30">P: 4.2 BAR</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Auto-Strainers */}
                    <section className="bg-slate-900 rounded-lg p-6 border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <RefreshCw className="w-32 h-32 text-cyan-500" />
                        </div>

                        <h3 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3 relative z-10">
                            <RefreshCw className="w-6 h-6 text-cyan-400" />
                            {t('francis.coolingWater.s1Title')}
                        </h3>

                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6 relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400 text-sm font-bold tracking-wider">{t('francis.coolingWater.dpVal')}</span>
                                <span className="text-green-400 font-mono font-bold bg-green-900/20 px-2 rounded">0.12 Bar</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="w-[24%] bg-green-500 h-full" />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 italic">{t('francis.coolingWater.dpDesc')}</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-widest border-b border-slate-800 pb-1">{t('francis.coolingWater.flushLogic')}</h4>

                            <div className="grid gap-3">
                                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded border border-slate-700/50">
                                    <Activity className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-slate-200 text-sm">{t('francis.coolingWater.trig')}</strong>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded border border-slate-700/50">
                                    <RefreshCw className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-slate-200 text-sm">{t('francis.coolingWater.act')}</strong>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-red-950/20 rounded border border-red-500/20">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-red-300 text-sm">{t('francis.coolingWater.jam')}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-bold">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    {t('francis.coolingWater.statusClean')}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Coolers & Flow Rates */}
                    <section className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
                            <Thermometer className="w-6 h-6 text-cyan-400" />
                            {t('francis.coolingWater.s2Title')}
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700">
                                        <th className="pb-3 pl-2 font-medium">{t('francis.coolingWater.thCol')}</th>
                                        <th className="pb-3 text-right font-medium">{t('francis.coolingWater.thFlow')}</th>
                                        <th className="pb-3 pr-2 text-right font-medium">{t('francis.coolingWater.thStat')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {[1, 2, 3].map((i) => (
                                        <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 pl-2 font-medium text-slate-200">{t(`francis.coolingWater.col${i}`)}</td>
                                            <td className="py-4 text-right font-mono text-cyan-300">
                                                {i === 1 ? '850 m³/h' : i === 2 ? '45 L/min' : '30 L/min'}
                                            </td>
                                            <td className="py-4 pr-2 text-right">
                                                <span className="text-green-400 font-bold text-xs bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
                                                    {t('francis.coolingWater.healthy')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('francis.coolingWater.inletTemp')}</span>
                            <span className="text-2xl font-mono text-cyan-400">8.4°C</span>
                        </div>
                    </section>
                </div>

                {/* Temp Regulation Logic */}
                <section className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
                        <Activity className="w-6 h-6 text-cyan-400" />
                        {t('francis.coolingWater.s3Title')}
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('winter')}
                            className={`flex-1 p-4 rounded-lg border transition-all duration-300 flex flex-col items-center gap-2 ${activeTab === 'winter'
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                        >
                            <Snowflake className="w-6 h-6" />
                            <span className="font-bold">{t('francis.coolingWater.modeWinter')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('summer')}
                            className={`flex-1 p-4 rounded-lg border transition-all duration-300 flex flex-col items-center gap-2 ${activeTab === 'summer'
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                        >
                            <Sun className="w-6 h-6" />
                            <span className="font-bold">{t('francis.coolingWater.modeSummer')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('failure')}
                            className={`flex-1 p-4 rounded-lg border transition-all duration-300 flex flex-col items-center gap-2 ${activeTab === 'failure'
                                    ? 'bg-red-500/10 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                        >
                            <AlertTriangle className="w-6 h-6" />
                            <span className="font-bold">{t('francis.coolingWater.modeFail')}</span>
                        </button>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 min-h-[150px] flex items-center justify-center text-center">
                        {activeTab === 'winter' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg">
                                <h4 className="text-xl font-bold text-cyan-400 mb-2">{t('francis.coolingWater.modeRec')}</h4>
                                <p className="text-slate-300 text-lg">{t('francis.coolingWater.descWinter')}</p>
                                <div className="mt-4 flex justify-center gap-2 opacity-60">
                                    <div className="h-1 w-12 bg-cyan-500/20 rounded-full" />
                                    <div className="h-1 w-12 bg-cyan-500 rounded-full" />
                                    <div className="h-1 w-12 bg-cyan-500/20 rounded-full" />
                                </div>
                            </div>
                        )}
                        {activeTab === 'summer' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg">
                                <h4 className="text-xl font-bold text-amber-400 mb-2">{t('francis.coolingWater.modeFull')}</h4>
                                <p className="text-slate-300 text-lg">{t('francis.coolingWater.descSummer')}</p>
                                <div className="mt-4 flex justify-center gap-2 opacity-60">
                                    <div className="h-1 w-12 bg-amber-500 rounded-full" />
                                    <div className="h-1 w-12 bg-amber-500/20 rounded-full" />
                                    <div className="h-1 w-12 bg-amber-500/20 rounded-full" />
                                </div>
                            </div>
                        )}
                        {activeTab === 'failure' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg">
                                <h4 className="text-xl font-bold text-red-400 mb-2">{t('francis.coolingWater.modeMan')}</h4>
                                <p className="text-red-200 text-lg">{t('francis.coolingWater.descFail')}</p>
                                <div className="mt-4 flex justify-center gap-2 opacity-60">
                                    <div className="h-1 w-12 bg-red-500/20 rounded-full" />
                                    <div className="h-1 w-12 bg-red-500/20 rounded-full" />
                                    <div className="h-1 w-12 bg-red-500 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <button
                    onClick={() => navigate('/francis')}
                    className="mt-8 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('francis.coolingWater.return')}
                </button>
            </div>
        </div>
    );
};

export default CoolingWater;
