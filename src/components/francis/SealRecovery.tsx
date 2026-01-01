import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, ArrowLeft, Lock, Construction } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const SealRecovery: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#451a03] to-[#1c1917] border-b-2 border-amber-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-600 rounded-lg border border-amber-400/30">
                            <LifeBuoy className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 text-[10px] font-bold border border-amber-900 uppercase">SOP-REC-001</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">REV 2.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.recovery.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.recovery.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-20">
                <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 text-center border border-amber-500/30 flex flex-col items-center justify-center space-y-8 min-h-[400px] shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition duration-500">
                    <div className="relative">
                        <Lock className="w-24 h-24 text-amber-500/20 absolute -inset-4 blur-xl animate-pulse" />
                        <Construction className="w-16 h-16 text-amber-500 relative z-10" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                            {t('francis.recovery.csTitle')}
                        </h2>
                        <p className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm animate-bounce">
                            {t('francis.recovery.csSubtitle')}
                        </p>
                    </div>

                    <div className="max-w-md bg-black/40 p-6 rounded-2xl border border-slate-800">
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            {t('francis.recovery.csDesc')}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500/60 animate-ping [animation-delay:200ms]"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500/30 animate-ping [animation-delay:400ms]"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};
