import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, Settings, Ruler, Droplets, Activity, CheckCircle2 } from 'lucide-react';

export const RegulatingRing: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#003366] to-[#0f172a] border-b border-indigo-900/50 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-400/30 text-indigo-400">
                            <RefreshCw className="w-8 h-8 animate-[spin_12s_linear_infinite]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 text-[10px] font-bold border border-indigo-800 uppercase">SOP-MECH-005</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">REV 2.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.regRing.title')}
                            </h1>
                            <p className="text-xs text-indigo-200/70 font-bold tracking-widest mt-1 uppercase">
                                {t('francis.regRing.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-indigo-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.regRing.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

                {/* Intro Module: The Hunting Problem */}
                <section className="bg-red-950/20 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-red-500 border border-red-900/30">
                    <h3 className="text-red-400 font-black uppercase tracking-wider flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" /> {t('francis.regRing.introTitle')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3 text-[11px] text-red-200/80">
                            <p><strong className="text-white">{t('francis.regRing.context')}</strong></p>
                            <p>{t('francis.regRing.risk')}</p>
                        </div>
                        <div className="space-y-3 text-[11px] text-red-200/80">
                            <p><strong className="text-white">{t('francis.regRing.rootCause')}</strong></p>
                            <p>{t('francis.regRing.impact')}</p>
                        </div>
                    </div>
                </section>

                {/* SOP 1: Friction Analysis */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-amber-500" /> {t('francis.regRing.s1Title')}
                    </h2>
                    <p className="text-xs text-slate-400 mb-6 italic border-l-2 border-amber-500/30 pl-3">
                        {t('francis.regRing.s1Intro')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="p-4 bg-amber-950/10 rounded-xl border border-amber-900/20">
                            <h4 className="text-amber-400 text-xs font-black uppercase mb-2">{t('francis.regRing.s1RiskTitle')}</h4>
                            <p className="text-[10px] text-amber-200/70 mb-3">{t('francis.regRing.s1RiskText')}</p>
                            <div className="px-3 py-2 bg-amber-500/10 rounded text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                {t('francis.regRing.s1Action')}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-indigo-400 text-xs font-black uppercase">{t('francis.regRing.s1ProcTitle')}</h4>
                            <ul className="space-y-2 text-[10px] text-slate-300">
                                <li className="flex gap-2"><span className="text-indigo-500 font-bold">1.</span> {t('francis.regRing.s1Step1')}</li>
                                <li className="flex gap-2"><span className="text-indigo-500 font-bold">2.</span> {t('francis.regRing.s1Step2')}</li>
                            </ul>
                            <div className="mt-4 grid grid-cols-1 gap-2">
                                <div className="p-2 bg-green-950/30 border border-green-500/20 rounded text-[10px] text-green-400 font-bold">
                                    {t('francis.regRing.s1Pass')}
                                </div>
                                <div className="p-2 bg-red-950/30 border border-red-500/20 rounded text-[10px] text-red-400 font-bold">
                                    {t('francis.regRing.s1Fail')}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOP 2: Eccentric Pin Adjustment */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Settings className="text-cyan-500" /> {t('francis.regRing.s2Title')}
                    </h2>
                    <p className="text-xs text-slate-400 mb-6 italic">
                        {t('francis.regRing.s2Intro')}
                    </p>

                    <div className="mb-6 p-3 bg-cyan-950/20 border border-cyan-800/30 rounded">
                        <p className="text-[10px] text-cyan-300 font-mono">{t('francis.regRing.s2Physics')}</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-slate-300 text-xs font-black uppercase border-b border-slate-800 pb-2">{t('francis.regRing.s2ProcTitle')}</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-[10px] text-slate-400">
                            <div className="flex gap-3 items-start p-3 bg-slate-950 rounded border border-slate-800">
                                <span className="text-cyan-500 font-bold text-lg">01</span>
                                <p>{t('francis.regRing.s2Step1')}</p>
                            </div>
                            <div className="flex gap-3 items-start p-3 bg-slate-950 rounded border border-slate-800">
                                <span className="text-cyan-500 font-bold text-lg">02</span>
                                <p>{t('francis.regRing.s2Step2')}</p>
                            </div>
                            <div className="flex gap-3 items-start p-3 bg-slate-950 rounded border border-slate-800">
                                <span className="text-cyan-500 font-bold text-lg">03</span>
                                <p>{t('francis.regRing.s2Step3')}</p>
                            </div>
                            <div className="flex gap-3 items-start p-3 bg-slate-950 rounded border border-slate-800">
                                <span className="text-cyan-500 font-bold text-lg">04</span>
                                <p>{t('francis.regRing.s2Step4')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOP 3: Pre-Start Lubrication */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-blue-500 border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Droplets className="text-blue-500" /> {t('francis.regRing.s3Title')}
                    </h2>
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase mb-2">
                            {t('francis.regRing.s3Mandatory')}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                            <div className="bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400 font-bold border border-slate-700">1</div>
                            <p className="text-[10px] text-slate-300">{t('francis.regRing.s3Step1')}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                            <div className="bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400 font-bold border border-slate-700">2</div>
                            <p className="text-[10px] text-slate-300">{t('francis.regRing.s3Step2')}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                            <div className="bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400 font-bold border border-slate-700">3</div>
                            <p className="text-[10px] text-slate-300">{t('francis.regRing.s3Step3')}</p>
                        </div>
                    </div>
                </section>

                {/* Diagnostics Table */}
                <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-900 p-4 border-b border-slate-800">
                        <h3 className="text-slate-200 font-bold text-sm uppercase">{t('francis.regRing.diagTitle')}</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 pb-4 border-b border-slate-800/50">
                            <div>
                                <strong className="text-amber-500 text-[10px] uppercase block mb-1">{t('francis.regRing.diagSymp1')}</strong>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400">• {t('francis.regRing.diagCause1')}</p>
                                <p className="text-[10px] text-slate-400">• {t('francis.regRing.diagCause2')}</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <strong className="text-red-500 text-[10px] uppercase block mb-1">{t('francis.regRing.diagSymp2')}</strong>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold">{t('francis.regRing.diagAct1')}</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};
