import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, ShieldAlert, ThermometerSnowflake, Filter, Undo2, Droplet, Clock, Calendar, AlertCircle } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const BearingsDetail: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12">

            {/* Header */}
            <header className="bg-gradient-to-br from-[#78350f] to-[#0c0a09] border-b-2 border-amber-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-600 rounded-lg border border-amber-400/30">
                            <RefreshCw className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 text-[10px] font-bold border border-amber-900 uppercase">SOP-ROT-001</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 3.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.bearingsCheck.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.bearingsCheck.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 gap-8">

                    {/* 1. Oil Film Criticality */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-red-600 border border-amber-500/20 animate-[pulse_2s_infinite]">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldAlert className="text-red-500 w-8 h-8" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                {t('francis.bearingsCheck.s1Title')}
                            </h2>
                        </div>
                        <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/40 mb-6">
                            <p className="text-sm text-red-200/80 leading-relaxed">
                                {t('francis.bearingsCheck.s1Desc')}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <strong className="text-red-400 text-[11px] uppercase block mb-1">
                                    {t('francis.bearingsCheck.danger')}
                                </strong>
                                <p className="text-[10px] text-slate-400">
                                    {t('francis.bearingsCheck.s1Li1')}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <strong className="text-amber-400 text-[11px] uppercase block mb-1">
                                    {t('francis.bearingsCheck.result')}
                                </strong>
                                <p className="text-[10px] text-slate-400">
                                    {t('francis.bearingsCheck.s1Li2')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Heat Exchange Logic */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-amber-600 border border-amber-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                            <ThermometerSnowflake className="w-5 h-5 text-amber-400" />
                            {t('francis.bearingsCheck.s2Title')}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                                    <h4 className="text-amber-500 text-[10px] font-black uppercase mb-3 tracking-widest">1.1 Intake Filtration</h4>
                                    <div className="flex gap-4">
                                        <Filter className="w-8 h-8 text-slate-500 flex-shrink-0" />
                                        <ul className="text-[10px] text-slate-400 space-y-2 list-disc ml-4">
                                            <li>{t('francis.bearingsCheck.s2Li1')}</li>
                                            <li>{t('francis.bearingsCheck.s2Li2')}</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                                    <h4 className="text-amber-500 text-[10px] font-black uppercase mb-3 tracking-widest">1.2 "Backflush" Protocol</h4>
                                    <div className="flex gap-4">
                                        <Undo2 className="w-8 h-8 text-slate-500 flex-shrink-0" />
                                        <ul className="text-[10px] text-slate-400 space-y-2 list-disc ml-4">
                                            <li>{t('francis.bearingsCheck.s3Li1')}</li>
                                            <li>{t('francis.bearingsCheck.s3Li2')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-950/10 border border-amber-900/30 rounded-xl">
                                <h4 className="text-white text-[11px] font-black uppercase mb-4 tracking-widest">
                                    {t('francis.bearingsCheck.s4Title')}
                                </h4>
                                <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-16 bg-amber-600/30 border border-amber-500/50 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Droplet className="text-amber-400 w-8 h-8" />
                                    </div>
                                    <div>
                                        <strong className="text-amber-400 text-xs block mb-1">{t('francis.bearingsCheck.symptom')}</strong>
                                        <p className="text-[10px] text-slate-500">{t('francis.bearingsCheck.s4Li1')}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-black/40 rounded border border-slate-800 text-[10px] text-slate-400">
                                    <strong className="text-red-500 mr-1 uppercase">{t('francis.bearingsCheck.action')}:</strong>
                                    <span>{t('francis.bearingsCheck.s4Li3')}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Limits & Triggers */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-slate-600 border border-amber-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                            {t('francis.bearingsCheck.tblTitle')}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-amber-900/40 text-amber-400 uppercase font-black text-[9px] tracking-widest">
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.bearingsCheck.tblCondition')}</th>
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.bearingsCheck.tblTemp')}</th>
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.bearingsCheck.tblAction')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    <tr>
                                        <td className="p-4 border-b border-slate-800 font-bold">{t('francis.bearingsCheck.tblNormal')}</td>
                                        <td className="p-4 border-b border-slate-800">18°C - 55°C</td>
                                        <td className="p-4 border-b border-slate-800">{t('francis.bearingsCheck.tblMonitor')}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-800 font-bold text-orange-500">{t('francis.bearingsCheck.tblAlarm')}</td>
                                        <td className="p-4 border-b border-slate-800 font-black">60°C</td>
                                        <td className="p-4 border-b border-slate-800">{t('francis.bearingsCheck.tblCheck')}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-800 font-bold text-red-500">{t('francis.bearingsCheck.tblTrip')}</td>
                                        <td className="p-4 border-b border-slate-800 font-black text-red-500">70°C</td>
                                        <td className="p-4 border-b border-slate-800">
                                            <strong className="uppercase block">{t('francis.bearingsCheck.tblEsd')}</strong>
                                            <span className="text-[10px] text-slate-500">{t('francis.bearingsCheck.tblNoRestart')}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Checklist */}
                    <section className="bg-amber-950/5 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20">
                        <h2 className="text-lg font-black text-amber-400 uppercase tracking-tight mb-6">
                            {t('francis.bearingsCheck.clTitle')}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex gap-3">
                                <Clock className="text-amber-500 w-5 h-5 flex-shrink-0" />
                                <div>
                                    <strong className="text-white text-[11px] uppercase block mb-1">{t('francis.bearingsCheck.daily')}</strong>
                                    <p className="text-[10px] text-slate-500">{t('francis.bearingsCheck.dailyDesc')}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Calendar className="text-amber-500 w-5 h-5 flex-shrink-0" />
                                <div>
                                    <strong className="text-white text-[11px] uppercase block mb-1">{t('francis.bearingsCheck.weekly')}</strong>
                                    <p className="text-[10px] text-slate-500">{t('francis.bearingsCheck.weeklyDesc')}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                                <div>
                                    <strong className="text-red-500 text-[11px] uppercase block mb-1">{t('francis.bearingsCheck.onAlarm')}</strong>
                                    <p className="text-[10px] text-slate-500">{t('francis.bearingsCheck.alarmDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};
