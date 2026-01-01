import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZapOff, Activity, AlertOctagon, Gauge, ClipboardList, Wind } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const WaterHammer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#7f1d1d] to-[#0c0a09] border-b border-red-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-lg border border-red-400/30">
                            <ZapOff className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-400 text-[10px] font-bold border border-red-900 uppercase">SOP-W-04</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">CRITICAL SAFETY</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.waterHammer.title')}
                            </h1>
                            <p className="text-xs text-red-200/70 font-bold tracking-widest mt-1 uppercase">
                                {t('francis.waterHammer.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-red-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.waterHammer.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Closing Law */}
                <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-red-600 border border-slate-800 animate-[pulse_3s_infinite]">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <span className="text-red-500">01.</span> {t('francis.waterHammer.sec1Title').split(' ').slice(1).join(' ')}
                    </h2>
                    <p className="text-sm text-slate-400 mb-8">
                        {t('francis.waterHammer.sec1Desc')}
                    </p>

                    {/* Chart Visualization Placeholder - simplified without SVG for now */}
                    <div className="relative h-48 w-full border-l-2 border-b-2 border-slate-700 mb-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMEwwIDIwTDIwIDIwTDIwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzksIDY4LCA2OCwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]">
                        <div className="absolute left-2 top-2 text-[9px] text-green-500 font-bold uppercase">100% OPEN</div>
                        <div className="absolute bottom-2 right-2 text-[9px] text-red-500 font-bold uppercase">0% CLOSED</div>

                        {/* CSS Lines */}
                        <div className="absolute left-0 bottom-1/5 w-[60%] h-[80%] border-t-4 border-red-500/80 transform origin-bottom-left -rotate-[33deg] translate-y-[-10%]"></div>
                        <div className="absolute left-[60%] bottom-0 w-[40%] h-[20%] border-t-4 border-red-500/80 border-dashed transform origin-bottom-left -rotate-[14deg]"></div>

                        <div className="absolute left-[30%] top-[45%] text-[10px] text-white font-black uppercase whitespace-nowrap">Fast Phase</div>
                        <div className="absolute left-[65%] top-[85%] text-[10px] text-slate-500 font-black uppercase whitespace-nowrap">Cushion Phase</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/40 p-4 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{t('francis.waterHammer.phase1Title')}</div>
                            <div className="text-sm font-black text-white">{t('francis.waterHammer.phase1Val')}</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{t('francis.waterHammer.phase2Title')}</div>
                            <div className="text-sm font-black text-white">{t('francis.waterHammer.phase2Val')}</div>
                        </div>
                        <div className="bg-red-950/40 p-4 rounded border border-red-900/50">
                            <div className="text-[9px] text-red-500 uppercase font-black mb-1">{t('francis.waterHammer.tripLimit')}</div>
                            <div className="text-sm font-black text-red-500">{t('francis.waterHammer.tripVal')}</div>
                        </div>
                    </div>
                </section>

                {/* 2 & 3. Pressure & Vacuum */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pressure */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-orange-600 border border-slate-800">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Gauge className="w-5 h-5" /> {t('francis.waterHammer.sec2Title')}
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl text-center">
                                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('francis.waterHammer.nomHead')}</div>
                                <div className="text-2xl font-black text-white">14.5 <span className="text-xs font-normal text-slate-500">Bar</span></div>
                            </div>
                            <div className="bg-red-950/30 border-2 border-red-500 p-4 rounded-xl text-center">
                                <div className="text-[9px] text-red-500 uppercase font-black tracking-widest mb-1">{t('francis.waterHammer.maxSurge')}</div>
                                <div className="text-3xl font-black text-red-500">18.1 <span className="text-xs font-normal text-red-900">Bar</span></div>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-800 pt-3">
                                {t('francis.waterHammer.sec2Note')}
                            </p>
                        </div>
                    </section>

                    {/* Vacuum Breaker */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-blue-600 border border-slate-800">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Wind className="w-5 h-5" /> {t('francis.waterHammer.sec3Title')}
                        </h2>
                        <p className="text-sm text-slate-400 mb-6">
                            {t('francis.waterHammer.sec3Desc')}
                        </p>
                        <div className="flex items-center gap-4 bg-black/60 p-5 rounded-xl border border-blue-900/30">
                            <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></div>
                            <span className="text-xs font-black text-green-400 uppercase tracking-widest">{t('francis.waterHammer.valveStatus')}</span>
                        </div>
                    </section>
                </div>

                {/* 4. Post Event */}
                <section className="bg-slate-950/40 rounded-2xl p-8 border-l-4 border-l-slate-600">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-slate-400" /> {t('francis.waterHammer.sec4Title')}
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {t('francis.waterHammer.sec4Desc')}
                    </p>
                </section>

            </main>
        </div>
    );
};
