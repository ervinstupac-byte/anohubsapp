import React from 'react';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ZapOff,
    Activity,
    AlertOctagon,
    Gauge,
    ClipboardList,
    Wind,
    ShieldAlert,
    AlertTriangle
} from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';
import { GlassCard } from '../../shared/components/ui/GlassCard';

export const WaterHammer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { waterHammer } = useEngineeringMath();

    const isOverLimit = new Decimal(waterHammer.maxSurgeBar).gt(17.0);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className={`bg-gradient-to-r ${isOverLimit ? 'from-[#991b1b]' : 'from-[#7f1d1d]'} to-[#0c0a09] border-b ${isOverLimit ? 'border-red-500 animate-pulse' : 'border-red-900'} py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl transition-all`}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 ${isOverLimit ? 'bg-red-500' : 'bg-red-600'} rounded-lg border border-red-400/30`}>
                            <ZapOff className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded ${isOverLimit ? 'bg-red-600 text-white' : 'bg-red-900/30 text-red-400'} text-[10px] font-bold border border-red-900 uppercase`}>SOP-W-04</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">{t('francis.waterHammer.criticalSafety')}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.waterHammer.title')}
                            </h1>
                            <p className="text-xs text-red-200/70 font-bold tracking-widest mt-1 uppercase">
                                {isOverLimit ? "CRITICAL TRANSIENT DETECTED" : t('francis.waterHammer.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-red-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.waterHammer.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
                {/* Real-time Physics Narrative Card */}
                <GlassCard title={t('modules.penstock_safety')} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                        <ShieldAlert className="w-full h-full text-red-500" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('modules.peak_surge')}</p>
                                <p className={`text-4xl font-mono font-black ${isOverLimit ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                                    {waterHammer.maxSurgeBar.toFixed(2)} <span className="text-sm">bar</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Wave Speed (a)</p>
                                <p className="text-2xl font-mono text-white font-bold">{waterHammer.waveSpeed.toFixed(0)} <span className="text-xs">m/s</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-2xl border-2 ${waterHammer.burstSafetyFactor < 1.5 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]'}`}>
                                <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Burst Safety Factor (SF)</p>
                                <p className={`text-5xl font-black ${waterHammer.burstSafetyFactor < 1.5 ? 'text-red-500' : 'text-emerald-400'}`}>
                                    {waterHammer.burstSafetyFactor.toFixed(2)}
                                </p>
                                <div className="w-full h-2 bg-black/40 rounded-full mt-4 overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (waterHammer.burstSafetyFactor / 4) * 100)}%` }}
                                        className={`h-full ${waterHammer.burstSafetyFactor < 1.5 ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col justify-center bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Physics Narrative</span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300 font-bold italic">
                                    "{waterHammer.recommendation}"
                                </p>
                            </div>
                        </div>

                        {isOverLimit && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-600/20 border-2 border-red-500/40 rounded-2xl flex items-center gap-4 animate-pulse"
                            >
                                <AlertTriangle className="text-red-500 w-10 h-10 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-red-400 font-black uppercase tracking-tighter">Emergency Alert</p>
                                    <p className="text-xs text-white leading-snug font-bold">
                                        Peak pressure rise has breached the 17-bar safety threshold. Hoop stress in Penstock Section 4 is approaching yield point. Recommended: Immediate guide vane lock and slow relief.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </GlassCard>

                {/* Technical Procedures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-red-500" /> {t('francis.waterHammer.sec2Title')}
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between p-3 border-b border-white/5">
                                <span className="text-[10px] text-slate-500 font-black uppercase">{t('francis.waterHammer.nomHead')}</span>
                                <span className="text-sm font-black text-white">14.5 Bar</span>
                            </div>
                            <div className="flex justify-between p-3 border-b border-white/5">
                                <span className="text-[10px] text-slate-500 font-black uppercase">Max Transmitted Pressure</span>
                                <span className="text-sm font-black text-white">{waterHammer.maxSurgeBar.toFixed(2)} Bar</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Wind className="w-5 h-5 text-blue-500" /> {t('francis.waterHammer.sec3Title')}
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            {t('francis.waterHammer.sec3Desc')}
                        </p>
                        <div className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Breaker Status: Active/Normal</span>
                        </div>
                    </section>
                </div>

                <div className="bg-slate-900/40 p-10 rounded-3xl border border-slate-800 text-center">
                    <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{t('francis.waterHammer.sec4Title')}</h3>
                    <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        {t('francis.waterHammer.sec4Desc')}
                    </p>
                </div>
            </main>
        </div>
    );
};
