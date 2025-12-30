import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, MoveHorizontal, Anchor, View, Ruler, DropletOff } from 'lucide-react';

export const Penstock: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-[#cbd5e1] font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#1e3a8a] to-[#0c0a09] border-b-2 border-blue-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg border border-blue-400/30">
                            {/* Replaced Waves with ScanLine as closest theme fit or keep generic icon */}
                            <ScanLine className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 text-[10px] font-bold border border-blue-900 uppercase">SOP-MECH-002</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.4</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.penstock.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-blue-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.penstock.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* Step 1: UT Checks */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-xl p-8 border-l-4 border-l-blue-600 border border-blue-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <ScanLine className="w-5 h-5 text-blue-400" /> {t('francis.penstock.s1Title')}
                        </h2>

                        <div className="space-y-6">
                            {/* Section A */}
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 font-bold uppercase">{t('francis.penstock.secA')}</span>
                                    <span className="text-sm text-white font-black">12.4mm</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-[95%]"></div>
                                </div>
                            </div>
                            {/* Section B */}
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 font-bold uppercase">{t('francis.penstock.secB')}</span>
                                    <span className="text-sm text-yellow-500 font-black">11.8mm</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-full w-[90%]"></div>
                                </div>
                                <p className="text-[10px] text-yellow-600 font-bold mt-2 uppercase tracking-tight">
                                    {t('francis.penstock.secBNote')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Expansion Joint */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-xl p-8 border-l-4 border-l-blue-600 border border-blue-500/20">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <MoveHorizontal className="w-5 h-5 text-blue-400" /> {t('francis.penstock.s2Title')}
                            </h2>
                            <span className="text-[10px] font-black bg-green-900/30 text-green-400 px-3 py-1 rounded border border-green-800 uppercase tracking-widest">
                                {t('francis.penstock.statusSeal')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-1">
                                    {t('francis.penstock.shiftSummer')}
                                </div>
                                <div className="text-xl font-black text-white">+12 <span className="text-xs font-normal text-slate-500">mm</span></div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-500 uppercase font-black mb-1">
                                    {t('francis.penstock.shiftWinter')}
                                </div>
                                <div className="text-xl font-black text-white">-8 <span className="text-xs font-normal text-slate-500">mm</span></div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                            <h3 className="text-blue-400 text-[10px] font-black uppercase mb-2 tracking-widest">
                                {t('francis.penstock.maintTitle')}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {t('francis.penstock.maintDesc')}
                            </p>
                        </div>
                    </section>

                    {/* Step 3: Anchor Blocks */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-xl p-8 border-l-4 border-l-red-600 border border-red-500/20">
                        <h2 className="text-xl font-black text-red-500 uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Anchor className="w-5 h-5" /> {t('francis.penstock.s3Title')}
                        </h2>
                        <p className="text-sm text-slate-400 mb-8">
                            {t('francis.penstock.s3Desc')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
                                <View className="w-4 h-4 text-slate-500 mb-3" />
                                <strong className="text-white text-[11px] uppercase block mb-1">
                                    {t('francis.penstock.chk1T')}
                                </strong>
                                <p className="text-[10px] text-slate-500">
                                    {t('francis.penstock.chk1D')}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
                                <Ruler className="w-4 h-4 text-slate-500 mb-3" />
                                <strong className="text-white text-[11px] uppercase block mb-1">
                                    {t('francis.penstock.chk2T')}
                                </strong>
                                <p className="text-[10px] text-slate-500">
                                    {t('francis.penstock.chk2D')}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
                                <DropletOff className="w-4 h-4 text-slate-500 mb-3" />
                                <strong className="text-white text-[11px] uppercase block mb-1">
                                    {t('francis.penstock.chk3T')}
                                </strong>
                                <p className="text-[10px] text-slate-500">
                                    {t('francis.penstock.chk3D')}
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};
