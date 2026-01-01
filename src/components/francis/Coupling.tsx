import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Layers, Split, Crosshair, HelpCircle, AlertCircle } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const Coupling: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0c0a09] text-[#d6d3d1] font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="mb-10 pb-6 border-b border-stone-800 flex flex-col md:flex-row justify-between items-start p-6 md:p-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded bg-slate-900/30 text-slate-400 text-[10px] font-bold border border-slate-900 uppercase">SOP-MECH-002</span>
                        <span className="text-[10px] text-stone-500 uppercase font-bold">REV 1.3</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('francis.coupling.title')}</h1>
                    <p className="text-stone-500 text-sm">{t('francis.coupling.subtitle')}</p>
                </div>

                <button
                    onClick={() => navigate(FRANCIS_PATHS.HUB)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1c1917] border border-[#44403c] text-[#78716c] text-xs font-bold uppercase rounded hover:border-blue-500 hover:text-white transition mt-4 md:mt-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('francis.coupling.return')}</span>
                </button>
            </header>

            <main className="max-w-5xl mx-auto px-6 md:px-12">
                {/* 1. Foundation Risk */}
                <div className="bg-[#2a1210] border-l-4 border-l-red-600 border border-[#292524] p-6 mb-4">
                    <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> {t('francis.coupling.s1Title')}
                    </h3>
                    <p className="text-sm text-stone-400 mb-4">
                        {t('francis.coupling.s1Desc')}
                    </p>
                    <div className="bg-red-900/10 p-4 rounded border border-red-900/30">
                        <p className="text-xs text-stone-300">
                            <strong>{t('francis.coupling.s1Warn')}</strong>
                        </p>
                    </div>
                </div>

                {/* 2. Alignment Logic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-[#1c1917] border-l-4 border-l-[#44403c] border border-[#292524] p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5" /> {t('francis.coupling.s2Title')}
                        </h3>
                        <p className="text-xs text-stone-500 mb-4">{t('francis.coupling.s2Desc')}</p>
                        <div className="flex justify-center py-4 bg-black/40 rounded border border-stone-800">
                            <div className="w-12 h-12 border-2 border-blue-500/50 rounded flex items-center justify-center">
                                <span className="text-blue-500 text-xs">||</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#1c1917] border-l-4 border-l-[#44403c] border border-[#292524] p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Split className="w-5 h-5" /> {t('francis.coupling.s3Title')}
                        </h3>
                        <p className="text-xs text-stone-500 mb-4">{t('francis.coupling.s3Desc')}</p>
                        <div className="flex justify-center py-4 bg-black/40 rounded border border-stone-800">
                            <div className="w-12 h-12 border-2 border-blue-500/50 rounded flex items-center justify-center rotate-12">
                                <span className="text-blue-500 text-xs">/</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Rim & Face Procedure */}
                <div className="bg-[#1c1917] border-l-4 border-l-[#44403c] border border-[#292524] p-6 mb-4">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Crosshair className="w-5 h-5" /> {t('francis.coupling.s4Title')}
                    </h3>
                    <ol className="text-sm text-stone-400 space-y-3 list-decimal list-inside">
                        <li>{t('francis.coupling.s4L1')}</li>
                        <li>{t('francis.coupling.s4L2')}</li>
                        <li>{t('francis.coupling.s4L3')}</li>
                    </ol>
                </div>

                {/* 4. Bolt Integrity */}
                <div className="bg-[#1c1917] border-l-4 border-l-[#44403c] border border-[#292524] p-6 mb-4">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-[10px]">B</div> {t('francis.coupling.s5Title')}
                    </h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-900/10 rounded border border-blue-900/30">
                            <strong className="text-blue-400 block text-xs mb-1">{t('francis.coupling.loctite')}</strong>
                            <p className="text-[10px] text-stone-400">{t('francis.coupling.loctiteDesc')}</p>
                        </div>
                        <div className="p-3 bg-stone-900 rounded border border-stone-800">
                            <strong className="text-stone-300 block text-xs mb-1">{t('francis.coupling.sympt')}</strong>
                            <p className="text-[10px] text-stone-500">{t('francis.coupling.symptDesc')}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
