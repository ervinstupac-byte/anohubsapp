import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Octagon, ArrowLeft, Wind, ShieldAlert, Fan, ArrowUpCircle } from 'lucide-react';

export const BrakingSystem: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#451a03] to-[#0c0a09] border-b-2 border-amber-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-lg border border-red-400/30">
                            <Octagon className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 text-[10px] font-bold border border-amber-900 uppercase">SOP-MECH-003</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.braking.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.braking.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* 1. Air Brakes */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-red-600 border border-slate-800 shadow-lg hover:shadow-red-900/20 transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Wind className="w-5 h-5 text-red-500" />
                                {t('francis.braking.s1Title')}
                            </h2>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-500 uppercase font-black">{t('francis.braking.press')}</span>
                                <span className="text-xl font-black text-red-500 tracking-widest uppercase">
                                    7.0 BAR <span className="text-[10px] text-slate-500 ml-1 font-normal">{t('francis.braking.res')}</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-3 tracking-widest">
                                    {t('francis.braking.trig')}
                                </div>
                                <div className="text-2xl font-black text-white">&lt; 20% <span className="text-xs font-normal text-slate-500 tracking-normal">(85 RPM)</span></div>
                            </div>
                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-3 tracking-widest">
                                    {t('francis.braking.app')}
                                </div>
                                <div className="text-2xl font-black text-amber-500 uppercase tracking-tight">
                                    {t('francis.braking.puls')}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-red-950/20 border-2 border-red-500/50 rounded-2xl relative overflow-hidden animate-[pulse-red_2s_infinite]">
                            <div className="flex gap-4 items-center relative z-10">
                                <ShieldAlert className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-red-500 text-xs font-black uppercase mb-1 tracking-widest">
                                        {t('francis.braking.lockTitle')}
                                    </h4>
                                    <p className="text-[11px] text-red-200/70 leading-relaxed">
                                        {t('francis.braking.lockDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Dust Extractor & Jacking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Dust Extractor */}
                        <section className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-slate-700 relative overflow-hidden group">
                            {/* Dust Particles Animation Simulation */}
                            <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white/10 rounded-full animate-[dust-float_4s_infinite_linear]"></div>
                            <div className="absolute top-[50%] left-[30%] w-1 h-1 bg-white/10 rounded-full animate-[dust-float_4s_infinite_linear_1s]"></div>
                            <div className="absolute top-[80%] left-[15%] w-1 h-1 bg-white/10 rounded-full animate-[dust-float_4s_infinite_linear_2s]"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <Fan className="w-5 h-5 text-slate-400" />
                                    {t('francis.braking.s2Title')}
                                </h2>
                                <span className="text-[9px] font-black bg-green-900/30 text-green-500 px-3 py-1 rounded border border-green-900 uppercase">
                                    STATUS: ACTIVE
                                </span>
                            </div>

                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-500 font-black uppercase">Filter dP</span>
                                    <span className="text-white font-black">120 Pa</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-500 font-black uppercase">Post-Shutdown Timer</span>
                                    <span className="text-white font-black">+15 MINS</span>
                                </div>
                            </div>

                            <div className="p-4 bg-black/60 rounded-xl border border-slate-800 relative z-10">
                                <h4 className="text-amber-500 text-[9px] font-black uppercase mb-2 tracking-widest">
                                    {t('francis.braking.warnTitle')}
                                </h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                    {t('francis.braking.warnDesc')}
                                </p>
                            </div>
                        </section>

                        {/* Jacking */}
                        <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-amber-600">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                <ArrowUpCircle className="w-5 h-5 text-amber-500" />
                                {t('francis.braking.s3Title')}
                            </h2>

                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-6 text-center">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">
                                    {t('francis.braking.oilPress')}
                                </div>
                                <div className="text-3xl font-black text-white">
                                    0 <span className="text-xs font-normal text-slate-500 uppercase">BAR</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {t('francis.braking.jackDesc')}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-[8px] font-black px-2 py-1 bg-green-900/20 text-green-500 border border-green-900/30 rounded uppercase">
                                        Permissive: Speed 0%
                                    </span>
                                    <span className="text-[8px] font-black px-2 py-1 bg-green-900/20 text-green-500 border border-green-900/30 rounded uppercase">
                                        Brakes Released
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
};
