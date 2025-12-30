import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Skull, Brush, ThermometerSun, ShieldCheck, Power } from 'lucide-react';

export const GeneratorIntegrity: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#312e81] to-[#0c0a09] border-b-2 border-[#818cf8] py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-lg border border-indigo-400/30">
                            <Zap className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 text-[10px] font-bold border border-indigo-800 uppercase">SOP-ELEC-004</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 3.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.generatorIntegrity.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.generatorIntegrity.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* 1. Carbon Dust Warning */}
                    <section className="bg-red-950/20 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-red-600 border border-red-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-black/80 to-transparent opacity-20 pointer-events-none group-hover:opacity-40 transition duration-1000"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
                            <h2 className="text-xl font-black text-red-500 uppercase tracking-tight flex items-center gap-2">
                                <Skull className="w-5 h-5" />
                                {t('francis.generatorIntegrity.s1Title')}
                            </h2>
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-900/30 text-red-500 border border-red-900 tracking-widest">
                                {t('francis.generatorIntegrity.critRisk')}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-6 relative z-10">
                            {t('francis.generatorIntegrity.s1Desc')}
                        </p>
                        <div className="p-4 bg-red-600/90 text-white rounded-xl relative z-10 shadow-lg shadow-red-900/20 animate-pulse">
                            <p className="text-[10px] font-black uppercase text-center tracking-widest">
                                {t('francis.generatorIntegrity.s1Rule')}
                            </p>
                        </div>
                    </section>

                    {/* 2. Dual Technical Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Brush Protocol */}
                        <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-indigo-500/10">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                <Brush className="w-5 h-5 text-indigo-400" />
                                <span>{t('francis.generatorIntegrity.brushTitle')}</span>
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                            {t('francis.generatorIntegrity.b1')}
                                        </span>
                                        <span className="text-xs font-black text-white">25-30%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">
                                        {t('francis.generatorIntegrity.b1Desc')}
                                    </p>
                                </div>
                                <div className="h-px bg-slate-800"></div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                            {t('francis.generatorIntegrity.b2')}
                                        </span>
                                        <span className="text-xs font-black text-indigo-400">1.5 - 2.0 N/cm²</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">
                                        {t('francis.generatorIntegrity.b2Desc')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Heater Logic */}
                        <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-indigo-500/10">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                <ThermometerSun className="w-5 h-5 text-indigo-400" />
                                <span>{t('francis.generatorIntegrity.heatTitle')}</span>
                            </h2>

                            <div className="bg-indigo-950/20 p-5 rounded-2xl border border-indigo-900/30 mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-indigo-600 rounded-lg">
                                        <Power className="text-white w-4 h-4" />
                                    </div>
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest">
                                        AUTO-ACTIVE ON STOP
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    {t('francis.generatorIntegrity.heatDesc')}
                                </p>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Heater Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                    <span className="text-[10px] font-black text-green-500">READY</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 3. Integrity Tests */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-indigo-500/10">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            {t('francis.generatorIntegrity.testTitle')}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[1, 2].map((num) => (
                                <div key={num} className="bg-slate-800/30 border border-indigo-500/20 p-5 rounded-2xl hover:bg-slate-800/50 hover:border-indigo-500/50 transition duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-indigo-900/30 rounded border border-indigo-800 text-indigo-400 font-black text-xs">
                                            {num === 1 ? 'IR (MEGGER)' : 'TERM (BOX)'}
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-900 text-slate-500 border border-slate-700">
                                            {t(`francis.generatorIntegrity.freq${num === 1 ? 'Ann' : 'Mon'}`)}
                                        </span>
                                    </div>
                                    <h4 className="text-white text-xs font-black uppercase mb-2 group-hover:text-indigo-300 transition">
                                        {t(`francis.generatorIntegrity.t${num}`)}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        {t(`francis.generatorIntegrity.t${num}Desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
