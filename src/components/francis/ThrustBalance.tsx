import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, AlertTriangle, Check, Droplet, Layers } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const ThrustBalance: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#064e3b] to-[#0c0a09] border-b border-emerald-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-lg border border-emerald-400/30">
                            <ArrowRightLeft className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 text-[10px] font-bold border border-emerald-800 uppercase">SOP-MECH-012</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">REV 2.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.thrustBalance.title')}
                            </h1>
                            <p className="text-xs text-emerald-200/70 font-bold tracking-widest mt-1 uppercase">
                                {t('francis.thrustBalance.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-emerald-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.thrustBalance.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. The Silent Killer */}
                <section className="bg-red-950/20 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-red-500 border border-red-900/30">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <h3 className="text-red-500 font-black uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> {t('francis.thrustBalance.s1Title')}
                        </h3>
                        <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-bold text-red-500 uppercase">
                            {t('francis.thrustBalance.alert')}
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                        {t('francis.thrustBalance.s1Desc')}
                    </p>

                    <div className="relative h-24 bg-black/30 rounded-xl flex items-center px-6 border border-slate-800/50">
                        <div className="flex flex-col items-center mr-6">
                            <span className="text-[8px] text-slate-500 font-bold uppercase mb-1">{t('francis.thrustBalance.vectorRunner')}</span>
                            <div className="w-8 h-12 bg-emerald-600/30 border border-emerald-500 rounded"></div>
                        </div>
                        <div className="flex-1 h-1 bg-red-600 relative mx-4">
                            <div className="absolute right-0 -top-2 w-0 h-0 border-l-[10px] border-l-red-600 border-y-[5px] border-y-transparent"></div>
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded shadow">~220 kN</span>
                        </div>
                        <div className="flex flex-col items-center ml-6">
                            <span className="text-[8px] text-slate-500 font-bold uppercase mb-1">{t('francis.thrustBalance.vectorThrust')}</span>
                            <div className="w-8 h-12 bg-amber-600/30 border border-amber-500 rounded"></div>
                        </div>
                    </div>
                </section>

                {/* 2. Balance Hole System */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-emerald-600 border border-slate-800">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6" >
                        {t('francis.thrustBalance.s2Title')}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[10px] text-emerald-400 font-black uppercase mb-3 tracking-widest">{t('francis.thrustBalance.designIntent')}</h4>
                            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                                {t('francis.thrustBalance.intentDesc')}
                            </p>
                            <ul className="space-y-3 text-[10px] text-slate-300">
                                <li className="flex gap-2 items-center">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>{t('francis.thrustBalance.i1')}</span>
                                </li>
                                <li className="flex gap-2 items-center">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>{t('francis.thrustBalance.i2')}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl">
                            <h4 className="text-white text-xs font-black uppercase mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-slate-500" />
                                {t('francis.thrustBalance.siltMgmt')}
                            </h4>
                            <p className="text-[9px] text-slate-500 italic mb-4 leading-relaxed">
                                {t('francis.thrustBalance.siltDesc')}
                            </p>
                            <div className="flex justify-between items-center p-3 bg-red-950/20 border border-red-900/40 rounded-lg">
                                <span className="text-[10px] text-red-400 font-bold">{t('francis.thrustBalance.critLimit')}</span>
                                <span className="text-xs font-black text-red-500">{t('francis.thrustBalance.critVal')}</span>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};
