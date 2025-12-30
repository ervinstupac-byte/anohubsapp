import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Merge, ArrowLeft, Crosshair, AlertTriangle } from 'lucide-react';

export const GridSync: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [rotation, setRotation] = useState(0);

    // Simulate Synchroscope Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 2) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#312e81] to-[#0c0a09] border-b-2 border-indigo-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-lg border border-indigo-400/30">
                            <Merge className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 text-[10px] font-bold border border-indigo-800 uppercase">SOP-OPS-009</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 1.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.gridSync.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.gridSync.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* 1. The Sync Window */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-indigo-600 border border-slate-800 shadow-lg hover:shadow-indigo-900/20 transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <Crosshair className="w-5 h-5 text-indigo-400" />
                                    {t('francis.gridSync.s1Title')}
                                </h2>
                                <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                                    {t('francis.gridSync.s1Desc')}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                                        <span className="text-[8px] text-slate-500 font-black uppercase mb-1 block">
                                            {t('francis.gridSync.p1')}
                                        </span>
                                        <span className="text-xs font-black text-white">&plusmn; 5%</span>
                                    </div>
                                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                                        <span className="text-[8px] text-slate-500 font-black uppercase mb-1 block">
                                            {t('francis.gridSync.p2')}
                                        </span>
                                        <span className="text-xs font-black text-white">&plusmn; 0.1 Hz</span>
                                    </div>
                                    <div className="p-3 bg-slate-900/50 border border-indigo-900/50 rounded-lg">
                                        <span className="text-[8px] text-indigo-400 font-black uppercase mb-1 block">
                                            {t('francis.gridSync.p3')}
                                        </span>
                                        <span className="text-xs font-black text-indigo-400">&plusmn; 10&deg;</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                {/* Synchroscope */}
                                <div className="w-[120px] h-[120px] border-4 border-slate-800 rounded-full relative bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                                    {/* Sync Window Marker */}
                                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[20%] h-[10%] bg-green-500/30 border border-green-500 rounded-[2px] z-10 box-border"></div>

                                    {/* Needle */}
                                    <div
                                        className="absolute top-1/2 left-1/2 w-[2px] h-[45%] bg-indigo-500 origin-top -translate-x-1/2"
                                        style={{ transform: `translateX(-50%) rotate(${180 + rotation}deg)` }}
                                    ></div>

                                    {/* Center Dot */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-500 z-20"></div>
                                </div>
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                    {t('francis.gridSync.scope')}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* 2. Manual Protocol */}
                    <section className="bg-amber-950/10 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-amber-600 border border-amber-900/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                            {t('francis.gridSync.s2Title')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-slate-400 mb-6">
                                    {t('francis.gridSync.s2Desc')}
                                </p>
                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative group">
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-red-950">
                                            !
                                        </div>
                                        <h4 className="text-xs font-black text-white uppercase ml-4">
                                            {t('francis.gridSync.ruleDark')}
                                        </h4>
                                        <p className="text-[9px] text-slate-500 ml-4 mt-1">
                                            {t('francis.gridSync.ruleDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-2xl">
                                <h4 className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">
                                    {t('francis.gridSync.failTitle')}
                                </h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    {t('francis.gridSync.failDesc')}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
