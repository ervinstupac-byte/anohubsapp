import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GitPullRequest, ArrowLeft, AlertTriangle, Compass, RefreshCw, Flame, ShieldAlert, Activity, Cpu } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const MIVDetail: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const telemetry = useTelemetryStore();

    // Simulated Telemetry (Pending integration into HydraulicStream)
    const mivPosition = 100; // % Open
    const mivSealPressure = (telemetry.physics?.staticPressureBar ?? 150) + 2.4; // Derived from static pressure

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-blue-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-blue-600 rounded-none border border-white/10 shadow-none relative group">
                            <GitPullRequest className="text-white w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-blue-950 text-blue-500 text-[10px] font-black border border-blue-900/50 uppercase tracking-widest">SOP-MIV-01</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.mivDistributor.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.mivDistributor.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* Real-time Focus Card */}
                <GlassCard title="Main Inlet Valve Diagnostic Site" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-blue-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-blue-400" /> MIV Position
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {mivPosition}% <span className="text-xs text-slate-500 uppercase ml-2">Open</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-blue-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-emerald-400" /> Seal Pressure
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                                {mivSealPressure.toFixed(1)} <span className="text-xs text-slate-500 ml-1">BAR</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-blue-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <RefreshCw className="w-3 h-3 text-cyan-400" /> Bypass Status
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                Closed
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Critical Safety Module */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-red-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex items-start gap-6 relative z-10 text-pretty">
                        <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0 animate-pulse" />
                        <div>
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4">
                                {t('francis.mivDistributor.critical.title')}
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-bold italic border-l-2 border-red-500/30 pl-6">
                                {t('francis.mivDistributor.critical.desc')}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Calibration Hub */}
                    <GlassCard title={t('francis.mivDistributor.calibration.title')} icon={<Compass className="text-blue-400" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-black/40 rounded-none border border-white/5 group hover:border-emerald-500/30 transition-all">
                                <strong className="text-emerald-500 text-[10px] font-black uppercase block mb-4 tracking-[0.2em]">
                                    {t('francis.mivDistributor.calibration.zeroTitle')}
                                </strong>
                                <p className="text-xs text-slate-400 mb-6 font-bold leading-relaxed">
                                    {t('francis.mivDistributor.calibration.zeroDesc')}
                                </p>
                                <div className="bg-emerald-950/20 p-4 font-mono text-[10px] text-emerald-400 border border-emerald-500/20 rounded-none text-center">
                                    {t('francis.mivDistributor.calibration.zeroStatus')}
                                </div>
                            </div>

                            <div className="p-6 bg-black/40 rounded-none border border-white/5 group hover:border-blue-500/30 transition-all">
                                <strong className="text-blue-400 text-[10px] font-black uppercase block mb-4 tracking-[0.2em]">
                                    {t('francis.mivDistributor.calibration.openTitle')}
                                </strong>
                                <p className="text-xs text-slate-400 mb-6 font-bold leading-relaxed">
                                    {t('francis.mivDistributor.calibration.openDesc')}
                                </p>
                                <div className="bg-blue-950/20 p-4 font-mono text-[10px] text-blue-400 border border-blue-500/20 rounded-none text-center">
                                    {t('francis.mivDistributor.calibration.openTol')}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Synchronicity Protocol */}
                    <GlassCard title={t('francis.mivDistributor.synchronicity.title')} icon={<RefreshCw className="text-blue-400" />}>
                        <p className="text-[11px] text-slate-500 font-bold mb-8 uppercase tracking-widest leading-relaxed">
                            {t('francis.mivDistributor.synchronicity.desc')}
                        </p>
                        <div className="space-y-6">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex gap-4 group/step">
                                    <div className="w-10 h-10 rounded-none bg-blue-600/20 flex items-center justify-center border border-blue-500/30 text-blue-400 font-black shrink-0 transition-transform group-hover/step:translate-x-1">
                                        {step}
                                    </div>
                                    <div className="pt-1">
                                        <strong className="text-white text-[11px] font-black uppercase block mb-1 tracking-tighter">
                                            {t(`francis.mivDistributor.synchronicity.step${step}Title`)}
                                        </strong>
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                                            {t(`francis.mivDistributor.synchronicity.step${step}Desc`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 bg-amber-900/10 border-2 border-amber-500/30 p-6 rounded-none flex gap-4 items-center">
                            <Flame className="text-amber-500 w-8 h-8 flex-shrink-0 animate-pulse" />
                            <p className="text-[10px] text-amber-200 font-black uppercase tracking-widest">
                                <strong>{t('francis.mivDistributor.synchronicity.risk').split(':')[0]}:</strong>
                                {t('francis.mivDistributor.synchronicity.risk').split(':')[1]}
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Audit Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cylinder Audit */}
                    <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b border-white/5 pb-4">
                            {t('francis.mivDistributor.cylinder.title')}
                        </h2>
                        <div className="overflow-hidden rounded-none border border-white/10 bg-black/40">
                            <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-blue-900/40 text-blue-400 uppercase font-black tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.mivDistributor.cylinder.thComponent')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.mivDistributor.cylinder.thCheck')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.mivDistributor.cylinder.thFreq')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { key: 'wiper', id: 'mivc-01' },
                                        { key: 'welds', id: 'mivc-02' },
                                        { key: 'trans', id: 'mivc-03' }
                                    ].map((row, idx) => (
                                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-black uppercase group-hover:pl-6 transition-all">{t(`francis.mivDistributor.cylinder.${row.key}`)}</td>
                                            <td className="p-4 font-bold opacity-70 group-hover:opacity-100">{t(`francis.mivDistributor.cylinder.${row.key}Check`)}</td>
                                            <td className="p-4 text-right font-black text-blue-400 uppercase tracking-tighter">{t(`francis.mivDistributor.cylinder.${row.key}Freq`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Hose Lifecycle */}
                    <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b border-white/5 pb-4">
                            {t('francis.mivDistributor.hose.title')}
                        </h2>
                        <div className="overflow-hidden rounded-none border border-white/10 bg-black/40">
                            <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-blue-900/40 text-blue-400 uppercase font-black tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.mivDistributor.hose.thTag')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.mivDistributor.hose.thExp')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.mivDistributor.hose.thStatus')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { tag: 'HOSE-MIV-01', exp: t('francis.mivDistributor.hose.expJan25'), status: 'crit' },
                                        { tag: 'HOSE-MIV-02', exp: t('francis.mivDistributor.hose.expJan25'), status: 'crit' },
                                        { tag: 'HOSE-HPU-05', exp: t('francis.mivDistributor.hose.expJun27'), status: 'ok' }
                                    ].map((row, idx) => (
                                        <tr key={row.tag} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-black uppercase group-hover:pl-6 transition-all">{row.tag}</td>
                                            <td className="p-4 font-bold opacity-70 group-hover:opacity-100">{row.exp}</td>
                                            <td className={`p-4 text-right font-black uppercase tracking-tighter ${row.status === 'crit' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                                {row.status === 'crit' ? t('francis.mivDistributor.hose.crit') : t('common.ok')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
