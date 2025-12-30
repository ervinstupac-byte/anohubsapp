import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Droplet, ArrowLeft, Settings, AlertTriangle, MapPin } from 'lucide-react';

export const LubricationSystem: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#064e3b] to-[#0c0a09] border-b-2 border-emerald-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-lg border border-emerald-400/30 text-white relative">
                            <Droplet className="w-8 h-8 animate-bounce" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 text-[10px] font-bold border border-emerald-800 uppercase">SOP-MECH-020</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 4.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.lubrication.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-emerald-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.lubrication.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
                {/* 1. Central Grease System */}
                <section className="bg-amber-950/5 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-amber-600 border border-emerald-500/20">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Settings className="text-amber-500 w-5 h-5" />
                            {t('francis.lubrication.s1Title')}
                        </h2>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <span className="text-[9px] text-slate-500 uppercase font-black">
                                    {t('francis.lubrication.interval')}
                                </span>
                                <div className="text-xs font-black text-amber-500 uppercase">12 CYCLES / DAY</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] text-slate-500 uppercase font-black">
                                    {t('francis.lubrication.status')}
                                </span>
                                <div className="text-xs font-black text-emerald-500 uppercase">READY</div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-emerald-900/30 mb-8">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-[#064e3b] text-white uppercase font-black text-[10px]">
                                    <th className="p-3">{t('francis.lubrication.thZone')}</th>
                                    <th className="p-3">{t('francis.lubrication.thPts')}</th>
                                    <th className="p-3">{t('francis.lubrication.thDose')}</th>
                                    <th className="p-3">{t('francis.lubrication.thFb')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-black/20 text-slate-300">
                                {[
                                    { zone: 'tdReg', pts: '4 (Quadrants)', dose: '5cc', fb: 'fbSw', fbColor: 'text-emerald-500 font-black' },
                                    { zone: 'tdTop', pts: '20 (Points)', dose: '2cc', fb: 'fbEof', fbColor: 'text-emerald-500 font-black' },
                                    { zone: 'tdPins', pts: '40 (Joints)', dose: '1cc', fb: 'fbVis', fbColor: 'text-slate-500 italic' }
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-emerald-900/10">
                                        <td className="p-3 text-emerald-400 font-bold">{t(`francis.lubrication.${row.zone}`)}</td>
                                        <td className="p-3">{row.pts}</td>
                                        <td className="p-3">{row.dose}</td>
                                        <td className={`p-3 ${row.fbColor}`}>{t(`francis.lubrication.${row.fb}`)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-4">
                        <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
                        <div>
                            <span className="text-amber-500 text-[10px] font-black uppercase">
                                {t('francis.lubrication.blockLogic')}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {t('francis.lubrication.blockDesc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Lubricant Inventory */}
                <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-emerald-600 border border-emerald-500/20">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                        {t('francis.lubrication.s2Title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl">
                                <span className="text-emerald-500 text-[10px] font-black uppercase block mb-2">
                                    {t(`francis.lubrication.l${num}Type`)}
                                </span>
                                <p className="text-[10px] text-slate-300 font-bold mb-4">
                                    {t(`francis.lubrication.l${num}Use`)}
                                </p>
                                {num === 2 ? (
                                    <p className="text-[9px] text-white/40 italic">
                                        {t(`francis.lubrication.l${num}St`)}
                                    </p>
                                ) : (
                                    <div className="px-2 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 rounded inline-block text-[10px] font-black">
                                        {t(`francis.lubrication.l${num}St`)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Manual Route */}
                <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-emerald-600 border border-emerald-500/20">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                        {t('francis.lubrication.s3Title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center gap-3 p-4 bg-black/40 border border-slate-800 rounded-xl">
                                <MapPin className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                                <span className="text-[11px] text-slate-300">
                                    {t(`francis.lubrication.rt${num}`)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
