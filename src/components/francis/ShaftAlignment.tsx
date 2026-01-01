import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Ruler, ArrowLeft, RotateCw, Info, Zap, Sun, Footprints, AlertTriangle } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const ShaftAlignment: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12">

            {/* Header */}
            <header className="bg-gradient-to-br from-[#78350f] to-[#0c0a09] border-b-2 border-amber-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-600 rounded-lg border border-amber-400/30">
                            <Ruler className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 text-[10px] font-bold border border-amber-900 uppercase">SOP-MECH-005</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.3</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.shaftAlignment.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.shaftAlignment.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 gap-8">

                    {/* 1. Run Out Limits */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-amber-600 border border-amber-500/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <RotateCw className="w-5 h-5 text-amber-400" />
                            {t('francis.shaftAlignment.runOut.title')}
                        </h2>

                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-amber-900/40 text-amber-400 uppercase font-black text-[9px] tracking-widest">
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.shaftAlignment.runOut.thLoc')}</th>
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.shaftAlignment.runOut.thLim')}</th>
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.shaftAlignment.runOut.thStat')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[1, 2, 3].map((row) => (
                                        <tr key={row} className="border-b border-slate-800">
                                            <td className="p-4">{t(`francis.shaftAlignment.runOut.loc${row}`)}</td>
                                            <td className="p-4 font-mono">{row === 1 ? '0.05' : row === 2 ? '0.03' : '0.05'}</td>
                                            <td className={`p-4 font-bold ${row === 3 ? 'text-amber-500' : 'text-green-500'}`}>
                                                {row === 3 ? t('francis.shaftAlignment.runOut.stat3_warn') : t(`francis.shaftAlignment.runOut.stat${row}`)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                            <Info className="w-3 h-3" />
                            <p>{t('francis.shaftAlignment.runOut.method')}</p>
                        </div>
                    </section>

                    {/* 2. Laser Alignment */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-amber-600 border border-amber-500/20">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                {t('francis.shaftAlignment.laser.title')}
                            </h2>
                            <span className="text-[10px] font-black bg-amber-900/30 text-amber-500 px-3 py-1 rounded border border-amber-800 uppercase tracking-widest">
                                {t('francis.shaftAlignment.laser.interval')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-400 font-bold uppercase">{t('francis.shaftAlignment.laser.vOffset')}</span>
                                    <span className="text-sm font-black text-white">+0.12mm</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-400 font-bold uppercase">{t('francis.shaftAlignment.laser.hOffset')}</span>
                                    <span className="text-sm font-black text-white">-0.05mm</span>
                                </div>
                            </div>

                            <div className="p-5 bg-amber-950/20 border-2 border-amber-500/30 rounded-xl relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 opacity-10">
                                    <Sun className="w-24 h-24 text-amber-500" />
                                </div>
                                <h4 className="text-amber-500 text-[10px] font-black uppercase mb-3 tracking-widest relative z-10">
                                    {t('francis.shaftAlignment.laser.thermalTitle')}
                                </h4>
                                <p className="text-[11px] text-slate-300 leading-relaxed relative z-10">
                                    {t('francis.shaftAlignment.laser.thermalDesc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Soft Foot Check */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-slate-600 border border-slate-700/50">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Footprints className="w-5 h-5 text-slate-400" />
                            {t('francis.shaftAlignment.softFoot.title')}
                        </h2>
                        <p className="text-sm text-slate-400 mb-8">
                            {t('francis.shaftAlignment.softFoot.desc')}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { id: 'c1', val: '0.02mm', ok: true },
                                { id: 'c2', val: '0.01mm', ok: true },
                                { id: 'c3', val: '0.02mm', ok: true },
                                { id: 'c4', val: '0.08mm', ok: false }
                            ].map((c) => (
                                <div key={c.id} className={`${c.ok ? 'bg-slate-900/40 border-slate-700' : 'bg-red-950/20 border-red-500/50 border-2'} p-4 rounded-xl border text-center`}>
                                    <span className={`text-[9px] uppercase font-black block mb-2 ${c.ok ? 'text-slate-500' : 'text-red-500'}`}>
                                        {t(`francis.shaftAlignment.softFoot.${c.id}`)}
                                    </span>
                                    <div className={`text-sm font-black ${c.ok ? 'text-green-500' : 'text-red-500'}`}>
                                        {c.val}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <div className="flex items-center gap-3 px-4 py-2 bg-red-600/20 border border-red-600/50 rounded-lg animate-pulse">
                                <AlertTriangle className="text-red-500 w-4 h-4" />
                                <span className="text-[10px] font-black text-red-200 uppercase tracking-widest">
                                    {t('francis.shaftAlignment.softFoot.action')}
                                </span>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};
