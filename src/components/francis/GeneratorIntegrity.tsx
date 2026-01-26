import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Skull, Brush, ThermometerSun, ShieldCheck, Power, Activity, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const GeneratorIntegrity: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    // Telemetry from CEREBRO
    const brushPressure = 1.8; // N/cm²
    const isReady = true;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-indigo-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-indigo-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <Zap className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-500 text-[10px] font-black border border-indigo-900/50 uppercase tracking-widest">SOP-ELEC-004</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.generatorIntegrity.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-indigo-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.generatorIntegrity.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Dust & Risk Criticality */}
                <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-r-3xl shadow-2xl backdrop-blur-sm border border-red-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Skull className="w-48 h-48 text-red-600" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                        <div className="flex-grow">
                            <h2 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 flex items-center gap-3">
                                {t('francis.generatorIntegrity.s1Title')}
                                <span className="px-3 py-1 bg-red-900 border border-red-800 text-white text-[10px] font-black rounded uppercase tracking-widest animate-pulse">{t('francis.generatorIntegrity.critRisk')}</span>
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed font-bold italic border-l-2 border-red-500/30 pl-6 mb-8">
                                {t('francis.generatorIntegrity.s1Desc')}
                            </p>
                            <div className="p-6 bg-red-600/90 text-white rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-transform duration-500">
                                <p className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                                    {t('francis.generatorIntegrity.s1Rule')}
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-64 flex flex-col items-center justify-center p-8 bg-black/60 rounded-3xl border border-white/5 shadow-inner">
                            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50 mb-4">
                                <Activity className="w-12 h-12 text-red-500 animate-pulse" />
                            </div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Grounding Risk</span>
                            <span className="text-2xl font-black text-red-500 uppercase tracking-tighter">High</span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Brush Protocol */}
                    <GlassCard title={t('francis.generatorIntegrity.brushTitle')} icon={<Brush className="text-indigo-400" />}>
                        <div className="space-y-8">
                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 group overflow-hidden relative">
                                <div className="absolute inset-0 bg-indigo-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <div className="flex justify-between items-center mb-4 relative z-10">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                        {t('francis.generatorIntegrity.b1')}
                                    </span>
                                    <span className="text-xl font-black text-white font-mono tracking-tighter">25-30%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4 relative z-10">
                                    <div className="w-[30%] bg-indigo-500 h-full" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold italic relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {t('francis.generatorIntegrity.b1Desc')}
                                </p>
                            </div>

                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 group overflow-hidden relative">
                                <div className="absolute inset-0 bg-indigo-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <div className="flex justify-between items-center mb-4 relative z-10">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                        {t('francis.generatorIntegrity.b2')}
                                    </span>
                                    <span className="text-xl font-black text-indigo-400 font-mono tracking-tighter">{brushPressure.toFixed(1)} <span className="text-[10px] opacity-60">N/cm²</span></span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4 relative z-10">
                                    <div className="w-[60%] bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold italic relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {t('francis.generatorIntegrity.b2Desc')}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Heater Logic */}
                    <GlassCard title={t('francis.generatorIntegrity.heatTitle')} icon={<ThermometerSun className="text-indigo-400" />}>
                        <div className="bg-indigo-950/20 p-8 rounded-3xl border border-indigo-900/30 mb-8 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                            <div className="flex items-center gap-6 mb-6 relative z-10">
                                <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl group-hover:rotate-12 transition-transform">
                                    <Power className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Logic Status</div>
                                    <div className="text-xl font-black text-indigo-400 uppercase tracking-tighter">Auto-Active on Stop</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 font-bold leading-relaxed relative z-10">
                                {t('francis.generatorIntegrity.heatDesc')}
                            </p>
                        </div>

                        <div className="flex justify-between items-center px-6 py-4 bg-black/40 rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Heater Relay Status</span>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse"></div>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Nominal</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Integrity Tests */}
                <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-8">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('francis.generatorIntegrity.testTitle')}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[1, 2].map((num) => (
                            <div key={num} className="bg-black/40 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-black/60 transition-all border-l-4 border-l-indigo-600 shadow-2xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-4 py-1.5 bg-indigo-950/50 rounded-xl border border-indigo-500/30 text-indigo-400 font-black text-[10px] tracking-widest uppercase">
                                        {num === 1 ? 'Insulation (Megger)' : 'Terminal Sync'}
                                    </div>
                                    <span className="px-4 py-1 rounded-full text-[9px] font-black uppercase bg-white/5 text-slate-400 border border-white/10 tracking-widest">
                                        {t(`francis.generatorIntegrity.freq${num === 1 ? 'Ann' : 'Mon'}`)}
                                    </span>
                                </div>
                                <h4 className="text-white text-lg font-black uppercase mb-4 tracking-tighter group-hover:text-indigo-300 transition-colors">
                                    {t(`francis.generatorIntegrity.t${num}`)}
                                </h4>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                    {t(`francis.generatorIntegrity.t${num}Desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
