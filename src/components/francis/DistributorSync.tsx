import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Skull, Settings2, Zap, Activity, ArrowLeft, ShieldAlert, Cpu } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const DistributorSync: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    // Telemetry from CEREBRO
    const guideVaneOpening = state.specializedState?.sensors?.guide_vane_opening ?? 45.2; // %
    const syncDelta = 0.08; // mm (Mocked for current context)
    const isOutOfSync = syncDelta > 0.5;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-zinc-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-zinc-800 rounded-3xl border border-white/10 shadow-lg relative group">
                            <Settings2 className="text-white w-8 h-8 group-hover:rotate-180 transition-transform duration-1000" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest">SOP-MECH-003</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.distributorSync.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.distributorSync.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Real-time Focus Card */}
                <GlassCard title="Kinematic Synchronicity Monitor" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-cyan-400" /> Vane Opening
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {guideVaneOpening.toFixed(1)} <span className="text-xs text-slate-500">%</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" /> Sync Delta
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter ${isOutOfSync ? 'text-red-500' : 'text-emerald-400'}`}>
                                ± {syncDelta.toFixed(2)} <span className="text-xs text-slate-500">mm</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-400" /> Servo Torque
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase">
                                Nominal
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* 2. Critical Alert: The One-Vane Catastrophe */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-red-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Skull className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <ShieldAlert className="w-12 h-12 text-red-600 flex-shrink-0" />
                        <div>
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4">
                                {t('francis.distributorSync.s1Title')}
                                <span className="ml-4 px-3 py-1 bg-red-900 border border-red-800 text-white text-[10px] font-black rounded uppercase tracking-widest animate-pulse">Critical Fail-Point</span>
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-bold italic border-l-2 border-red-500/30 pl-6 mb-6">
                                {t('francis.distributorSync.s1Desc')}
                            </p>
                            <div className="bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block shadow-lg">
                                {t('francis.distributorSync.s1Warn')}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tolerance Specs */}
                    <GlassCard title={t('francis.distributorSync.s2Title')} icon={<Settings2 className="text-zinc-400" />}>
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-zinc-900/60 text-zinc-400 font-black text-[9px] uppercase tracking-[0.2em]">
                                        <th className="p-4 border-b border-white/5">{t('francis.distributorSync.th1')}</th>
                                        <th className="p-4 border-b border-white/5">{t('francis.distributorSync.th2')}</th>
                                        <th className="p-4 border-b border-white/5 text-right font-black">{t('francis.distributorSync.th3')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[
                                        { point: t('francis.distributorSync.p1'), val: '± 0.5 mm', method: t('francis.distributorSync.m1') },
                                        { point: t('francis.distributorSync.p2'), val: '0.00 mm', method: t('francis.distributorSync.m2') },
                                        { point: t('francis.distributorSync.p3'), val: '< 0.10 mm', method: t('francis.distributorSync.m3') }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-black uppercase tracking-tighter group-hover:pl-6 transition-all">{row.point}</td>
                                            <td className="p-4 font-mono font-black text-cyan-400">{row.val}</td>
                                            <td className="p-4 text-right text-[10px] font-bold text-slate-500 italic uppercase">{row.method}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Procedures Grid */}
                    <div className="space-y-6">
                        <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-4 group hover:bg-slate-900/80 transition-all">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <Zap className="w-5 h-5 text-zinc-400" />
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">{t('francis.distributorSync.s3Title')}</h3>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {t('francis.distributorSync.s3Desc')}
                            </p>
                            <div className="p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800 text-[10px] text-zinc-200 font-black uppercase tracking-widest text-center border-l-4 border-l-emerald-500">
                                {t('francis.distributorSync.s3Check')}
                            </div>
                        </section>

                        <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-4 group hover:bg-slate-900/80 transition-all">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <Activity className="w-5 h-5 text-red-500" />
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">{t('francis.distributorSync.s4Title')}</h3>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {t('francis.distributorSync.s4Desc')}
                            </p>
                            <div className="p-4 bg-red-950/10 rounded-2xl border border-red-500/20 text-[10px] text-red-400 font-black uppercase tracking-widest text-center border-l-4 border-l-red-600">
                                {t('francis.distributorSync.s4Rule')}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};
