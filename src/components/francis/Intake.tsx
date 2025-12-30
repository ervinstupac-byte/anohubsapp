import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Skull, ZapOff, Gauge, Layers, Archive, TrendingUp, AlertOctagon } from 'lucide-react';

export const Intake: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-[#cbd5e1] font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#083344] to-[#0c0a09] border-b-2 border-cyan-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-600 rounded-lg border border-cyan-400/30">
                            <Layers className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 text-[10px] font-bold border border-cyan-900 uppercase">SOP-OPS-001</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 3.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.intake.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-cyan-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.intake.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* Step 1 */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-red-600 border border-red-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Skull className="text-red-500 w-8 h-8" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('francis.intake.s1Title')}</h2>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 italic">{t('francis.intake.s1P1')}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg">
                                <strong className="text-red-400 text-[11px] uppercase block mb-1">Impact: Power Loss</strong>
                                <p className="text-[10px] text-red-200/70">{t('francis.intake.s1Li1')}</p>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <strong className="text-white text-[11px] uppercase block mb-1">Intake Integrity</strong>
                                <p className="text-[10px] text-slate-500">{t('francis.intake.s1Li2')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Step 2 */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-cyan-600 border border-cyan-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <ZapOff className="w-5 h-5 text-cyan-400" /> {t('francis.intake.s2Title')}
                        </h2>
                        <p className="text-sm text-slate-400 mb-8">{t('francis.intake.s2P1')}</p>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-3 tracking-widest">{t('francis.intake.s2Li1')}</div>
                                <Gauge className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
                                <p className="text-[10px] text-slate-400">Differential Pressure (dP) Analysis</p>
                            </div>
                            <div className="bg-slate-900/50 p-5 rounded-xl border border-cyan-500/30 text-center">
                                <div className="text-[9px] text-cyan-500 uppercase font-black mb-3 tracking-widest">{t('francis.intake.s2Li2')}</div>
                                <div className="text-2xl font-black text-white mb-1">&gt; 20 <span className="text-xs font-normal text-slate-500">cm</span></div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Initiate Cleaning</p>
                            </div>
                            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-3 tracking-widest">{t('francis.intake.s2Li3')}</div>
                                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                                <p className="text-[10px] text-slate-400">Automatic / Manual Raking</p>
                            </div>
                        </div>
                    </section>

                    {/* Step 3 */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-slate-600 border border-slate-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                            <Archive className="w-5 h-5 text-slate-400" /> {t('francis.intake.s3Title')}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-cyan-400 text-[10px] font-black uppercase mb-4 tracking-widest">{t('francis.intake.s3Sub1')}</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <TrendingUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <div>
                                            <strong className="text-white text-xs block">{t('francis.intake.s3Li1')}</strong>
                                            <p className="text-[10px] text-slate-500">Sand strips the oxide layer off the runner/guide vanes.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <AlertOctagon className="text-red-500 w-4 h-4 flex-shrink-0" />
                                        <div>
                                            <strong className="text-white text-xs block">{t('francis.intake.s3Li2')}</strong>
                                            <p className="text-[10px] text-slate-500">Provides a rough surface for bubble formation.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                                <h4 className="text-slate-100 text-[10px] font-black uppercase mb-4 tracking-widest">{t('francis.intake.s3Sub2')}</h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 text-[11px]">
                                        <span className="w-5 h-5 bg-slate-800 flex items-center justify-center rounded text-[10px] font-bold">01</span>
                                        <span className="text-slate-400">{t('francis.intake.s3Oli1')}</span>
                                    </li>
                                    <li className="flex gap-3 text-[11px]">
                                        <span className="w-5 h-5 bg-slate-800 flex items-center justify-center rounded text-[10px] font-bold">02</span>
                                        <span className="text-slate-400">{t('francis.intake.s3Oli2')}</span>
                                    </li>
                                    <li className="flex gap-3 text-[11px]">
                                        <span className="w-5 h-5 bg-slate-800 flex items-center justify-center rounded text-[10px] font-bold">03</span>
                                        <span className="text-slate-400">{t('francis.intake.s3Oli3')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* CHECKLIST */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 bg-cyan-950/10 border-cyan-500/20 border-l-4 border-l-cyan-500">
                        <h2 className="text-lg font-black text-cyan-400 uppercase tracking-tight mb-6">{t('francis.intake.clTitle')}</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <span className="text-[9px] font-black text-cyan-500 uppercase block mb-1">DAILY</span>
                                <p className="text-[10px] text-slate-300">{t('francis.intake.cl1')}</p>
                            </div>
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <span className="text-[9px] font-black text-cyan-500 uppercase block mb-1">WEEKLY</span>
                                <p className="text-[10px] text-slate-300">{t('francis.intake.cl2')}</p>
                            </div>
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                                <span className="text-[9px] font-black text-red-500 uppercase block mb-1">STORM EVENT</span>
                                <p className="text-[10px] text-slate-300">{t('francis.intake.cl3')}</p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};
