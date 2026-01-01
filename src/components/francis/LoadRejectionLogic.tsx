import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ZapOff, ArrowLeft, Activity, GitPullRequestClosed, Info } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const LoadRejectionLogic: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        // Trigger simulation
        const timer = setTimeout(() => {
            setScanned(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12">

            {/* Header */}
            <header className="bg-gradient-to-br from-red-950 to-[#0c0a09] border-b-2 border-red-600 py-6 px-4 md:px-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-lg border border-red-400/30 animate-pulse">
                            <ZapOff className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-orange-900/30 text-orange-400 text-[10px] font-bold border border-orange-900 uppercase">SOP-LOGIC-003</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 3.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.loadRejection.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.loadRejection.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 gap-8">

                {/* 1. Trigger Event */}
                <section className="bg-slate-900/40 border border-red-500/30 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-red-600 relative overflow-hidden group hover:border-red-500/50 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 animate-[scan_3s_infinite_linear] opacity-30 shadow-[0_0_15px_#ef4444]"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
                        <h2 className="text-xl font-black text-red-500 uppercase tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 animate-pulse" />
                            {t('francis.loadRejection.trigger.title')}
                        </h2>
                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full animate-pulse uppercase shadow-[0_0_15px_#ef4444]">
                            EVENT DETECTED
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed relative z-10">
                        {t('francis.loadRejection.trigger.desc')}
                    </p>
                </section>

                {/* 2. Execution Timeline */}
                <section className="bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-slate-700">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                        {t('francis.loadRejection.sequence.title')}
                    </h2>

                    <div className="px-4 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[39px] top-4 bottom-4 w-[2px] bg-slate-800"></div>

                        {/* Step 1 */}
                        <div className="relative pl-12 mb-8 group">
                            <div className="absolute left-[34px] top-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900 shadow-[0_0_10px_#ef4444] z-10"></div>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 group-hover:border-red-500/30 transition-colors">
                                <div>
                                    <h3 className="text-white text-[11px] font-black uppercase mb-1 tracking-widest text-red-400">
                                        {t('francis.loadRejection.step1.title')}
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        {t('francis.loadRejection.step1.desc')}
                                    </p>
                                </div>
                                <span className="text-[9px] font-mono text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase font-black whitespace-nowrap">
                                    PRIORITY 1
                                </span>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative pl-12 mb-8 group">
                            <div className="absolute left-[34px] top-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900 shadow-[0_0_10px_#ef4444] z-10"></div>
                            <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 group-hover:border-red-500/30 transition-colors">
                                <div className="w-full">
                                    <h3 className="text-white text-[11px] font-black uppercase mb-1 tracking-widest text-red-400">
                                        {t('francis.loadRejection.step2.title')}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 mb-3">
                                        {t('francis.loadRejection.step2.desc')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                                        <div className="p-2 bg-black/40 border border-slate-700/50 rounded text-center">
                                            <div className="text-[8px] text-slate-500 uppercase font-black">{t('francis.loadRejection.step2.p1')}</div>
                                            <div className="text-[9px] text-white font-black">100% &rarr; 20%</div>
                                        </div>
                                        <div className="p-2 bg-black/40 border border-slate-700/50 rounded text-center">
                                            <div className="text-[8px] text-slate-500 uppercase font-black">{t('francis.loadRejection.step2.p2')}</div>
                                            <div className="text-[9px] text-white font-black">20% &rarr; 0%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative pl-12 group">
                            <div className="absolute left-[34px] top-1.5 w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-900 z-10"></div>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900/30 p-4 rounded-lg border border-slate-800 opacity-75">
                                <div>
                                    <h3 className="text-slate-500 text-[11px] font-black uppercase mb-1 tracking-widest">
                                        {t('francis.loadRejection.step3.title')}
                                    </h3>
                                    <p className="text-[10px] text-slate-600">
                                        {t('francis.loadRejection.step3.desc')}
                                    </p>
                                </div>
                                <span className="text-[9px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded border border-slate-800 uppercase font-black whitespace-nowrap">
                                    WAITING...
                                </span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 3. Critical Safety Interlock */}
                <section className="bg-amber-950/10 border border-amber-900/30 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-amber-600">
                    <div className="flex items-center gap-3 mb-6">
                        <GitPullRequestClosed className="text-amber-500 w-6 h-6" />
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">
                            {t('francis.loadRejection.interlock.title')}
                        </h2>
                    </div>

                    <div className="bg-amber-950/20 border border-amber-900/40 p-5 rounded-2xl mb-6">
                        <p className="text-xs text-amber-200/80 font-bold mb-4 font-mono">
                            {t('francis.loadRejection.interlock.desc')}
                        </p>
                        <div className="p-4 bg-red-600 text-white rounded-xl text-center border-t-2 border-white/20 shadow-lg animate-[pulse_2s_infinite]">
                            <span className="text-xs font-black tracking-widest uppercase">
                                {t('francis.loadRejection.interlock.cmd')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p className="text-[10px] italic">
                            {t('francis.loadRejection.interlock.note')}
                        </p>
                    </div>
                </section>

            </main>
        </div>
    );
};
