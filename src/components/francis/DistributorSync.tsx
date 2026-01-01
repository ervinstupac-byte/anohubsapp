import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Skull, Settings2, Zap, Activity, ArrowLeft } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const DistributorSync: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0c0a09] text-[#d6d3d1] font-mono pb-12 overflow-x-hidden p-6 md:p-12">
            {/* Header */}
            <header className="mb-10 pb-6 border-b border-stone-800 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded bg-zinc-900/30 text-zinc-400 text-[10px] font-bold border border-zinc-900 uppercase">SOP-MECH-003</span>
                        <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.4</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('francis.distributorSync.title')}</h1>
                    <p className="text-stone-500 text-sm">{t('francis.distributorSync.subtitle')}</p>
                    {/* Language toggle handled globally in main layout, simplified here */}
                </div>

                <button
                    onClick={() => navigate(FRANCIS_PATHS.HUB)}
                    className="inline-flex items-center gap-2 bg-[#1c1917] border border-[#44403c] text-[#78716c] px-4 py-2 text-xs font-bold uppercase rounded hover:border-blue-500 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> <span>{t('francis.distributorSync.return')}</span>
                </button>
            </header>

            <main className="max-w-5xl mx-auto">
                {/* 1. The One-Vane Catastrophe */}
                <div className="bg-[#2a1210] border border-[#292524] border-l-4 border-l-red-600 p-6 mb-4 rounded shadow-md">
                    <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2">
                        <Skull className="w-5 h-5" /> {t('francis.distributorSync.s1Title')}
                    </h3>
                    <p className="text-sm text-stone-400 mb-4">
                        {t('francis.distributorSync.s1Desc')}
                    </p>
                    <div className="bg-red-900/10 p-3 rounded border border-red-900/30 text-xs text-stone-400">
                        <span>{t('francis.distributorSync.s1Warn')}</span>
                    </div>
                </div>

                {/* 2. Tolerance Specs */}
                <div className="bg-[#1c1917] border border-[#292524] border-l-4 border-l-[#44403c] p-6 mb-4 rounded shadow-md">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Settings2 className="w-5 h-5" /> {t('francis.distributorSync.s2Title')}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border-spacing-0 bg-black border border-slate-700 text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-slate-700 text-left bg-slate-800 text-slate-400">{t('francis.distributorSync.th1')}</th>
                                    <th className="p-2 border-b border-slate-700 text-left bg-slate-800 text-slate-400">{t('francis.distributorSync.th2')}</th>
                                    <th className="p-2 border-b border-slate-700 text-left bg-slate-800 text-slate-400">{t('francis.distributorSync.th3')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-stone-300">
                                <tr>
                                    <td className="p-2 border-b border-slate-700">{t('francis.distributorSync.p1')}</td>
                                    <td className="p-2 border-b border-slate-700">± 0.5 mm</td>
                                    <td className="p-2 border-b border-slate-700">{t('francis.distributorSync.m1')}</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-slate-700">{t('francis.distributorSync.p2')}</td>
                                    <td className="p-2 border-b border-slate-700">0.00 mm (Light-Tight)</td>
                                    <td className="p-2 border-b border-slate-700">{t('francis.distributorSync.m2')}</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-b border-slate-700">{t('francis.distributorSync.p3')}</td>
                                    <td className="p-2 border-b border-slate-700">&lt; 0.10 mm</td>
                                    <td className="p-2 border-b border-slate-700">{t('francis.distributorSync.m3')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Procedures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1c1917] border border-[#292524] border-l-4 border-l-[#44403c] p-6 rounded shadow-md">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" /> {t('francis.distributorSync.s3Title')}
                        </h3>
                        <p className="text-xs text-stone-500 mb-4">
                            {t('francis.distributorSync.s3Desc')}
                        </p>
                        <div className="bg-black/50 p-2 rounded border border-stone-800 text-[10px] text-stone-400">
                            <span>{t('francis.distributorSync.s3Check')}</span>
                        </div>
                    </div>
                    <div className="bg-[#1c1917] border border-[#292524] border-l-4 border-l-[#44403c] p-6 rounded shadow-md">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" /> {t('francis.distributorSync.s4Title')}
                        </h3>
                        <p className="text-xs text-stone-500 mb-4">
                            {t('francis.distributorSync.s4Desc')}
                        </p>
                        <div className="bg-red-900/10 p-2 rounded border border-red-900/30 text-[10px] text-red-400 font-bold">
                            <span>{t('francis.distributorSync.s4Rule')}</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
