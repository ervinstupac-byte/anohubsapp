import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, ZapOff } from 'lucide-react';

export const Excitation: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-[#cbd5e1] font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#312e81] to-[#0c0a09] border-b-2 border-indigo-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-lg border border-indigo-400/30">
                            <ZapOff className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 text-[10px] font-bold border border-indigo-800 uppercase">SOP-ELEC-008</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 1.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.excitation.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.excitation.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* 1. Bootstrap / Field Flashing */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-indigo-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                            <Rocket className="w-6 h-6 text-indigo-400" /> {t('francis.excitation.s1Title')}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 items-center border-l-2 border-slate-800 pl-6 ml-2">
                            <div>
                                <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                                    {t('francis.excitation.s1Desc')}
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black shrink-0">01</div>
                                        <span className="text-[10px] text-slate-300">{t('francis.excitation.f1')}</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded bg-indigo-600 border border-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                                        <span className="text-[10px] text-slate-300 font-bold">{t('francis.excitation.f2')}</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black shrink-0">03</div>
                                        <span className="text-[10px] text-slate-300">{t('francis.excitation.f3')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-2xl">
                                <h4 className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">{t('francis.excitation.critTimer')}</h4>
                                <p className="text-[10px] text-slate-400 mb-4">
                                    {t('francis.excitation.critDesc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. AVR Logic */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-slate-700 border border-slate-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                            {t('francis.excitation.s2Title')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">{t('francis.excitation.firing')}</h4>
                                <div className="p-6 bg-black/40 border border-slate-800 rounded-2xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-slate-300">Alpha (&alpha;)</span>
                                        <span className="text-xs font-black text-indigo-400">150&deg; &rarr; 10&deg;</span>
                                    </div>
                                    <div className="w-full h-8 bg-slate-900 border border-slate-800 rounded flex overflow-hidden">
                                        <div className="w-1/4 bg-red-600/20 border-r border-red-600/30 flex items-center justify-center text-[8px] font-black text-red-500">INVERT</div>
                                        <div className="w-3/4 bg-green-600/20 flex items-center justify-center text-[8px] font-black text-green-500 uppercase">Rectify (Pulse Active)</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">{t('francis.excitation.lim')}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    {t('francis.excitation.limDesc')}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
