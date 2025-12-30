import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, AlertOctagon, Microscope, Droplet, HandMetal, CheckSquare } from 'lucide-react';

export const Linkage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#003366] to-[#0f172a] border-b border-blue-900/50 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30 text-blue-400">
                            <LinkIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[10px] font-bold border border-blue-800 uppercase">SOP-MECH-006</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">REV 2.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.linkage.title')}
                            </h1>
                            <p className="text-xs text-blue-200/70 font-bold tracking-widest mt-1 uppercase">
                                {t('francis.linkage.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-blue-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-blue-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.linkage.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

                {/* Intro Module: The Cost of Backlash */}
                <section className="bg-orange-950/20 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-orange-500 border border-orange-900/30">
                    <h3 className="text-orange-400 font-black uppercase tracking-wider flex items-center gap-2 mb-4">
                        <AlertOctagon className="w-5 h-5" /> {t('francis.linkage.introTitle')}
                    </h3>
                    <div className="space-y-3 text-[11px] text-orange-200/80">
                        <div className="flex gap-2">
                            <strong className="text-white min-w-[60px]">{t('francis.linkage.context').split(':')[0]}:</strong>
                            <span>{t('francis.linkage.context').split(':')[1]}</span>
                        </div>
                        <div className="flex gap-2">
                            <strong className="text-white min-w-[60px]">{t('francis.linkage.risk').split(':')[0]}:</strong>
                            <span>{t('francis.linkage.risk').split(':')[1]}</span>
                        </div>
                    </div>
                </section>

                {/* SOP 1: Linkage Logic */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Microscope className="text-teal-500" /> {t('francis.linkage.s1Title')}
                    </h2>
                    <p className="text-xs text-slate-400 mb-6 italic border-l-2 border-teal-500/30 pl-3">
                        {t('francis.linkage.s1Logic')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-teal-400 text-xs font-black uppercase mb-3">{t('francis.linkage.s1Proc')}</h4>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="p-2 bg-slate-800 rounded-lg text-teal-500 font-bold border border-slate-700">1</div>
                                    <p className="text-[10px] text-slate-300 pt-1">{t('francis.linkage.s1Step1')}</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="p-2 bg-slate-800 rounded-lg text-teal-500 font-bold border border-slate-700">2</div>
                                    <p className="text-[10px] text-slate-300 pt-1">{t('francis.linkage.s1Step2')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 justify-center">
                            <div className="p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
                                <p className="text-[10px] text-green-400 font-bold uppercase mb-1">{t('francis.linkage.s1Pass')}</p>
                            </div>
                            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
                                <p className="text-[10px] text-red-400 font-bold uppercase mb-1">{t('francis.linkage.s1Fail')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOP 2: Lubrication Audit */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Droplet className="text-yellow-500" /> {t('francis.linkage.s2Title')}
                    </h2>
                    <p className="text-xs text-slate-400 mb-6 italic">
                        {t('francis.linkage.s2Desc')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-yellow-950/10 border border-yellow-900/30 rounded-xl">
                            <h4 className="text-[10px] text-yellow-500 font-black uppercase mb-2">AUDIT</h4>
                            <p className="text-[10px] text-slate-300">{t('francis.linkage.s2Audit').split(':')[1]}</p>
                        </div>
                        <div className="p-4 bg-yellow-950/10 border border-yellow-900/30 rounded-xl">
                            <h4 className="text-[10px] text-yellow-500 font-black uppercase mb-2">VISUAL</h4>
                            <p className="text-[10px] text-slate-300">{t('francis.linkage.s2Vis').split(':')[1]}</p>
                        </div>
                    </div>
                </section>

                {/* SOP 3: Swing Test */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-purple-500 border border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <HandMetal className="text-purple-500" /> {t('francis.linkage.s3Title')}
                    </h2>
                    <div className="mb-6 p-3 bg-red-950/30 border border-red-500/30 rounded">
                        <strong className="text-red-400 text-[10px] uppercase block mb-1">WARNING:</strong>
                        <p className="text-[10px] text-red-200">{t('francis.linkage.s3Safety')}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-lg">
                            <h4 className="text-purple-400 text-[10px] font-black uppercase mb-2">PROCEDURE</h4>
                            <p className="text-[10px] text-slate-300">{t('francis.linkage.s3Proc')}</p>
                        </div>
                        <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-lg">
                            <h4 className="text-purple-400 text-[10px] font-black uppercase mb-2">CRITERIA</h4>
                            <p className="text-[10px] text-slate-300">{t('francis.linkage.s3Crit')}</p>
                        </div>
                    </div>
                </section>

                {/* Checklist */}
                <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-8">
                    <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-slate-200 font-bold text-sm uppercase">{t('francis.linkage.checklistTitle')}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                            <span>{t('francis.linkage.chk1')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                            <span>{t('francis.linkage.chk2')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                            <span>{t('francis.linkage.chk3')}</span>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};
