import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GitPullRequest, ArrowLeft, AlertTriangle, Compass, RefreshCw, Flame } from 'lucide-react';

export const MIVDetail: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const SectionHeader = ({ icon: Icon, title, color = "text-blue-500" }: { icon: React.ElementType<{ className?: string }>, title: string, color?: string }) => (
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            {title}
        </h2>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12">

            {/* Header */}
            <header className="bg-gradient-to-br from-[#1e3a8a] to-[#0c0a09] border-b-2 border-blue-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg border border-blue-400/30">
                            <GitPullRequest className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 text-[10px] font-bold border border-blue-900 uppercase">SOP-MIV-01</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 2.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.mivDistributor.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-blue-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.mivDistributor.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8">

                {/* Critical Alert */}
                <div className="bg-red-950/40 border-2 border-red-500 p-6 rounded-xl mb-12 flex gap-4 items-start animate-[pulse_2s_infinite]">
                    <AlertTriangle className="text-red-500 w-10 h-10 flex-shrink-0" />
                    <div>
                        <strong className="text-red-500 text-lg uppercase block mb-1">
                            {t('francis.mivDistributor.critical.title')}
                        </strong>
                        <p className="text-red-100 text-sm leading-relaxed">
                            {t('francis.mivDistributor.critical.desc')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">

                    {/* 1. MIV Calibration */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-blue-600 border border-blue-500/20">
                        <SectionHeader icon={Compass} title={t('francis.mivDistributor.calibration.title')} />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                                <strong className="text-blue-400 text-xs font-black uppercase block mb-3">
                                    {t('francis.mivDistributor.calibration.zeroTitle')}
                                </strong>
                                <p className="text-sm text-slate-400 mb-4">
                                    {t('francis.mivDistributor.calibration.zeroDesc')}
                                </p>
                                <div className="bg-black/80 p-3 font-mono text-xs text-green-500 border border-slate-800 rounded">
                                    {t('francis.mivDistributor.calibration.zeroStatus')}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                                <strong className="text-blue-400 text-xs font-black uppercase block mb-3">
                                    {t('francis.mivDistributor.calibration.openTitle')}
                                </strong>
                                <p className="text-sm text-slate-400 mb-4">
                                    {t('francis.mivDistributor.calibration.openDesc')}
                                </p>
                                <div className="bg-black/80 p-3 font-mono text-xs text-blue-400 border border-slate-800 rounded">
                                    {t('francis.mivDistributor.calibration.openTol')}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Distributor Sync */}
                    <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-l-blue-600 border border-blue-500/20">
                        <SectionHeader icon={RefreshCw} title={t('francis.mivDistributor.synchronicity.title')} />
                        <p className="text-sm text-slate-400 mb-8">
                            {t('francis.mivDistributor.synchronicity.desc')}
                        </p>

                        <div className="space-y-6 pl-4 border-l-2 border-slate-800 ml-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-[18px] h-[18px] bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                                        {step}
                                    </div>
                                    <strong className="text-white text-sm block mb-1">
                                        {t(`francis.mivDistributor.synchronicity.step${step}Title`)}
                                    </strong>
                                    <p className="text-xs text-slate-400">
                                        {t(`francis.mivDistributor.synchronicity.step${step}Desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-orange-900/20 border border-orange-500/30 p-4 rounded-xl flex gap-3">
                            <Flame className="text-orange-500 w-6 h-6 flex-shrink-0" />
                            <p className="text-xs text-orange-200">
                                <strong>{t('francis.mivDistributor.synchronicity.risk').split(':')[0]}:</strong>
                                {t('francis.mivDistributor.synchronicity.risk').split(':')[1]}
                            </p>
                        </div>
                    </section>

                    {/* Tables */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 3. Cylinder Audit */}
                        <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">
                                {t('francis.mivDistributor.cylinder.title')}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-blue-900/40 text-blue-400 uppercase font-black text-[9px] tracking-widest">
                                            <th className="p-4 border-b border-blue-500/30">{t('francis.mivDistributor.cylinder.thComponent')}</th>
                                            <th className="p-4 border-b border-blue-500/30">{t('francis.mivDistributor.cylinder.thCheck')}</th>
                                            <th className="p-4 border-b border-blue-500/30">{t('francis.mivDistributor.cylinder.thFreq')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {[
                                            { key: 'wiper', id: 'mivc-01' },
                                            { key: 'welds', id: 'mivc-02' },
                                            { key: 'trans', id: 'mivc-03' }
                                        ].map((row, idx) => (
                                            <tr key={row.id} className={idx % 2 === 0 ? '' : 'bg-slate-800/40'}>
                                                <td className="p-4 border-b border-slate-800">{t(`francis.mivDistributor.cylinder.${row.key}`)}</td>
                                                <td className="p-4 border-b border-slate-800">{t(`francis.mivDistributor.cylinder.${row.key}Check`)}</td>
                                                <td className="p-4 border-b border-slate-800">{t(`francis.mivDistributor.cylinder.${row.key}Freq`)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 4. Hose Lifecycle */}
                        <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">
                                {t('francis.mivDistributor.hose.title')}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-blue-900/40 text-blue-400 uppercase font-black text-[9px] tracking-widest">
                                            <th className="p-4 border-b border-blue-500/30">{t('francis.mivDistributor.hose.thTag')}</th>
                                            <th className="p-4 border-b border-blue-500/30">{t('francis.mivDistributor.hose.thExp')}</th>
                                            <th className="p-4 border-b border-blue-500/30">{t('francis.mivDistributor.hose.thStatus')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {[
                                            { tag: 'HOSE-MIV-01', exp: 'Jan 2025', status: 'crit' },
                                            { tag: 'HOSE-MIV-02', exp: 'Jan 2025', status: 'crit' },
                                            { tag: 'HOSE-HPU-05', exp: 'Jun 2027', status: 'ok' }
                                        ].map((row, idx) => (
                                            <tr key={row.tag} className={idx % 2 === 0 ? '' : 'bg-slate-800/40'}>
                                                <td className="p-4 border-b border-slate-800">{row.tag}</td>
                                                <td className="p-4 border-b border-slate-800">{row.exp}</td>
                                                <td className={`p-4 border-b border-slate-800 font-bold ${row.status === 'crit' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                                    {row.status === 'crit' ? t('francis.mivDistributor.hose.crit') : 'OK'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
};
