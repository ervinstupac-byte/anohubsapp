import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, BatteryCharging, AlertTriangle, Cpu, Activity, ShieldAlert } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const DCSystems: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();

    // Local simulation for individual cell drift, subbed to CEREBRO for bus
    const [voltages, setVoltages] = useState([2.25, 2.24, 2.25, 2.18, 2.26, 2.25]);
    const busVoltage = 122.4; // VDC (Mocked)
    const loadCurrent = 14.2; // Amps

    useEffect(() => {
        const interval = setInterval(() => {
            setVoltages(prev => prev.map(v => Number((v + (Math.random() * 0.02 - 0.01)).toFixed(2))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const isCritical = voltages.some(v => v < 2.20);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-red-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-red-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <BatteryCharging className="text-white w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-red-950 text-red-500 text-[10px] font-black border border-red-900/50 uppercase tracking-widest">SOP-ELEC-005</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.dcSystems.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.dcSystems.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. DC Bus Matrix */}
                <GlassCard title="Battery Bank & DC Bus Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-red-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Zap className="w-3 h-3 text-cyan-400" /> Bus Potential
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {busVoltage.toFixed(1)} <span className="text-xs text-slate-500 uppercase ml-2">VDC</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-red-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-amber-400" /> Static Load
                            </p>
                            <p className="text-3xl font-black text-amber-400 font-mono tracking-tighter">
                                {loadCurrent.toFixed(1)} <span className="text-xs text-slate-500 ml-1">Amps</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-red-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-emerald-400" /> Charge Efficiency
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter uppercase tabular-nums">
                                98.4 <span className="text-[10px] text-slate-500 font-bold ml-1">%</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* 2. Electrochemical Cell Drift */}
                <section className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 space-y-8">
                    <h3 className="text-slate-100 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4 flex justify-between items-center">
                        <span>{t('francis.dcSystems.batStat')}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-red-500 text-[9px] animate-pulse">Monitoring Cell Gradient</span>
                            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-red-600 animate-[charge_3s_infinite_ease-in-out]" />
                            </div>
                        </div>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                        {voltages.map((v, i) => (
                            <div key={i} className={`p-6 rounded-3xl border transition-all duration-500 group/cell ${v < 2.20 ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-black/40 border-white/5 hover:border-emerald-500/30'}`}>
                                <div className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest group-hover/cell:text-cyan-400 transition-colors tracking-tighter">Cell No. {i + 1}</div>
                                <div className={`text-2xl font-black font-mono tracking-tighter ${v < 2.20 ? 'text-red-500' : 'text-white'}`}>
                                    {v.toFixed(2)}<span className="text-[10px] opacity-40 ml-1">V</span>
                                </div>
                                {v < 2.20 && (
                                    <div className="mt-2 flex items-center gap-1 text-red-500 animate-pulse">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span className="text-[8px] font-black uppercase">Sulphation Risk</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-red-900/10 border-2 border-red-600/30 rounded-3xl flex gap-6 items-center">
                        <ShieldAlert className="text-red-600 w-12 h-12 flex-shrink-0 animate-pulse" />
                        <div>
                            <h4 className="text-red-500 text-[11px] font-black uppercase tracking-widest mb-1 italic">Industrial Safety Warning</h4>
                            <p className="text-sm text-slate-300 font-bold leading-relaxed">{t('francis.dcSystems.critDc')}</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* UPS Redundancy Table */}
                    <GlassCard title={t('francis.dcSystems.s2Title')} icon={<Zap className="text-red-500" />}>
                        <div className="space-y-6">
                            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">{t('francis.dcSystems.upsRedund')}</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between items-center p-6 bg-emerald-950/10 border border-emerald-500/20 rounded-3xl group/psu">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500 font-black">AC1</div>
                                        <span className="text-sm text-white font-black uppercase tracking-tighter">{t('francis.dcSystems.psu1')}</span>
                                    </div>
                                    <span className="text-[10px] font-black px-4 py-1.5 bg-emerald-600 text-white rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-900/20">Active Flux</span>
                                </div>
                                <div className="flex justify-between items-center p-6 bg-slate-900 border border-white/5 rounded-3xl group/psu grayscale opacity-60">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 text-slate-500 font-black">AC2</div>
                                        <span className="text-sm text-slate-400 font-black uppercase tracking-tighter">{t('francis.dcSystems.psu2')}</span>
                                    </div>
                                    <span className="text-[10px] font-black px-4 py-1.5 bg-slate-800 text-slate-500 rounded-xl uppercase tracking-widest">Neural Standby</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Earth Fault Diagnostic */}
                    <GlassCard title={t('francis.dcSystems.distFault')} icon={<Activity className="text-amber-500" />}>
                        <div className="p-8 bg-black/40 border border-white/5 rounded-3xl h-full flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('francis.dcSystems.earthFault')}</span>
                                <span className="text-lg text-emerald-400 font-black font-mono">0.0 <span className="text-[10px] opacity-40 lowercase">mA</span></span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner mb-8">
                                <div className="w-0 h-full bg-red-600 transition-all duration-1000" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
                                {t('francis.dcSystems.efDesc')}
                            </p>
                            <div className="mt-8 flex gap-3">
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">Galvanic Isolation 100%</div>
                                <div className="px-4 py-2 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-widest">Status: CLEAN</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};
