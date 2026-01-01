import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Zap, Shield, AlertTriangle, CheckSquare, Settings } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const CathodicProtection: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-[#cbd5e1] font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#064e3b] to-[#0c0a09] border-b-2 border-emerald-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-lg border border-emerald-400/30 text-white">
                            <Atom className="w-8 h-8 animate-[spin_10s_linear_infinite]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 text-[10px] font-bold border border-emerald-800 uppercase">SOP-MECH-014</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.2</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.cathodic.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.cathodic.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
                {/* 1. Electrochemical Logic */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-emerald-600 border border-emerald-500/20">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                        {t('francis.cathodic.s1Title')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                                {t('francis.cathodic.s1Desc')}
                            </p>
                            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <span className="text-emerald-500 text-[10px] font-black uppercase block mb-1">{t('francis.cathodic.h1Rule')}</span>
                                <p className="text-[10px] text-slate-300">
                                    {t('francis.cathodic.ruleDesc')}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl">
                            <h4 className="text-white text-[10px] font-black uppercase mb-4">{t('francis.cathodic.h1Spec')}</h4>
                            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl mb-4">
                                <Zap className="text-emerald-500 w-8 h-8" />
                                <div>
                                    <span className="text-[10px] text-emerald-400 font-bold block">TARGET RESISTANCE</span>
                                    <span className="text-2xl font-black text-white">{t('francis.cathodic.targetVal')}</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-500 italic">
                                {t('francis.cathodic.specNote')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Installation Integrity */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-emerald-600 border border-emerald-500/20">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                        {t('francis.cathodic.s2Title')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{t('francis.cathodic.steps')}</h4>
                            <ul className="space-y-3 text-[10px] text-slate-400">
                                <li className="flex gap-2"><div className="w-4 h-4 text-emerald-500 flex items-center justify-center">1</div> <span dangerouslySetInnerHTML={{ __html: t('francis.cathodic.l1') }} /></li>
                                <li className="flex gap-2"><Settings className="w-4 h-4 text-emerald-500" /> <span>{t('francis.cathodic.l2')}</span></li>
                                <li className="flex gap-2"><CheckSquare className="w-4 h-4 text-emerald-500" /> <span>{t('francis.cathodic.l3')}</span></li>
                            </ul>
                        </div>
                        <div className="bg-black/40 border border-slate-800 p-6 rounded-2xl">
                            <h4 className="text-white text-[10px] font-black uppercase mb-4">{t('francis.cathodic.h2Warn')}</h4>
                            <p className="text-[10px] text-slate-500 mb-4">
                                {t('francis.cathodic.warnDesc')}
                            </p>
                            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="text-red-500 w-5 h-5" />
                                <span className="text-[10px] text-red-400 font-bold">{t('francis.cathodic.critAlert')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Troubleshooting Table */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-emerald-600 border border-emerald-500/20">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                        {t('francis.cathodic.s3Title')}
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-emerald-900/30">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#064e3b] text-white p-3 text-[10px] uppercase">{t('francis.cathodic.th1')}</th>
                                    <th className="bg-[#064e3b] text-white p-3 text-[10px] uppercase">{t('francis.cathodic.th2')}</th>
                                    <th className="bg-[#064e3b] text-white p-3 text-[10px] uppercase">{t('francis.cathodic.th3')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-black/20 text-[10px]">
                                <tr className="border-b border-emerald-900/10">
                                    <td className="text-emerald-400 font-bold p-3">{t('francis.cathodic.obs1')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.cathodic.diag1')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.cathodic.act1')}</td>
                                </tr>
                                <tr className="border-b border-emerald-900/10">
                                    <td className="text-emerald-400 font-bold p-3">{t('francis.cathodic.obs2')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.cathodic.diag2')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.cathodic.act2')}</td>
                                </tr>
                                <tr>
                                    <td className="text-emerald-400 font-bold p-3">{t('francis.cathodic.obs3')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.cathodic.diag3')}</td>
                                    <td className="p-3 text-slate-300">{t('francis.cathodic.act3')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};
