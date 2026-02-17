import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Activity, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, Info, Cpu, Settings, ShieldAlert } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const Excitation: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // States
    const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO'); // AVR vs FCR
    const [fieldBreaker, setFieldBreaker] = useState(false);
    const [fieldFlashing, setFieldFlashing] = useState(false);
    const [voltagePerc, setVoltagePerc] = useState(0); // 0 to 100%

    // Telemetry from CEREBRO (Simulateded for current context)
    const thyristorTemp = 42.4; // °C
    const fieldCurrent = (voltagePerc * 8.5).toFixed(1);

    // Simulation logic
    const toggleFieldBreaker = () => {
        const newState = !fieldBreaker;
        setFieldBreaker(newState);
        if (!newState) {
            setVoltagePerc(0);
            setFieldFlashing(false);
        }
    };

    const activateFlashing = () => {
        if (!fieldBreaker) return;
        setFieldFlashing(true);
        // Simulate voltage buildup
        setTimeout(() => setVoltagePerc(20), 500);
        setTimeout(() => setVoltagePerc(60), 1000);
        setTimeout(() => setVoltagePerc(100), 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-amber-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-amber-600 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Zap className="text-white w-8 h-8 relative z-10" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-amber-950 text-amber-500 text-[10px] font-black border border-amber-900/50 uppercase tracking-widest">SOP-ELEC-008</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.excitation.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.excitation.return') || "Return"}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. System Monitor Hub */}
                <GlassCard title={t('francis.excitation.monitor')} icon={<Activity className="text-amber-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="md:col-span-2 p-8 bg-black/60 rounded-none border border-white/5 shadow-none space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Generator Voltage Output</span>
                                <span className={`text-2xl font-black font-mono tracking-tighter tabular-nums ${voltagePerc >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>{voltagePerc.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-slate-900 rounded-none overflow-hidden border border-white/5 shadow-none">
                                <div
                                    className={`h-full transition-all duration-1000 shadow-none ${voltagePerc >= 95 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-none' : 'bg-gradient-to-r from-amber-600 to-yellow-400'}`}
                                    style={{ width: `${voltagePerc}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="p-4 bg-white/5 rounded-none border border-white/10">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Excitation Current</span>
                                    <span className="text-xl font-black text-cyan-400 font-mono tracking-tighter">{fieldCurrent} <span className="text-[10px] opacity-60 uppercase">Amps</span></span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-none border border-white/10">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Thyristor Temp</span>
                                    <span className="text-xl font-black text-white font-mono tracking-tighter">{thyristorTemp} <span className="text-[10px] opacity-60 uppercase">°C</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-none border border-white/5 group">
                            {voltagePerc >= 95 ? (
                                <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-none flex items-center justify-center border-2 border-emerald-500/50 shadow-none">
                                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest leading-relaxed">System Stable<br />Ready for Sync</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <div className="w-20 h-20 bg-slate-800 rounded-none flex items-center justify-center border-2 border-slate-700">
                                        <Activity className="w-10 h-10 text-slate-500 animate-pulse" />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Monitoring<br />Voltage Ramp</span>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Control Panel */}
                    <GlassCard title="Excitation Control Panel" icon={<Settings className="text-amber-400" />}>
                        <div className="space-y-6">
                            {/* Mode Selector */}
                            <div className="bg-black/40 p-6 rounded-none border border-white/5 space-y-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('francis.excitation.mode')}</h3>
                                <div className="flex bg-slate-900/80 p-1.5 rounded-none border border-white/5">
                                    <button
                                        onClick={() => setMode('AUTO')}
                                        className={`flex-1 py-3 text-xs font-black rounded-none transition-all uppercase tracking-widest ${mode === 'AUTO' ? 'bg-indigo-600 text-white shadow-none' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Auto (AVR)
                                    </button>
                                    <button
                                        onClick={() => setMode('MANUAL')}
                                        className={`flex-1 py-3 text-xs font-black rounded-none transition-all uppercase tracking-widest ${mode === 'MANUAL' ? 'bg-amber-600 text-white shadow-none' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Manual (FCR)
                                    </button>
                                </div>
                            </div>

                            {/* Field Breaker */}
                            <div className="bg-black/40 p-6 rounded-none border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('francis.excitation.fieldBreaker')}</h3>
                                    <div className={`text-lg font-black tracking-tighter uppercase ${fieldBreaker ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {fieldBreaker ? 'Closed (Active)' : 'Open (Isolated)'}
                                    </div>
                                </div>
                                <button onClick={toggleFieldBreaker} className="focus:outline-none transform hover:scale-110 transition-transform">
                                    {fieldBreaker ? (
                                        <ToggleRight className="w-12 h-12 text-emerald-500 cursor-pointer drop-shadow-[0_0_10px_#10b981]" />
                                    ) : (
                                        <ToggleLeft className="w-12 h-12 text-slate-700 cursor-pointer" />
                                    )}
                                </button>
                            </div>

                            {/* Field Flashing */}
                            <div className={`bg-black/40 p-8 rounded-none border border-white/5 transition-all duration-500 overflow-hidden relative ${fieldBreaker ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                                <div className="absolute inset-0 bg-amber-500/5 -translate-y-full group-hover:translate-y-0 transition-transform" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('francis.excitation.flashing')}</h3>
                                    {fieldFlashing && <span className="px-3 py-1 bg-amber-900/30 text-amber-500 text-[9px] font-black border border-amber-800 rounded-none uppercase tracking-widest animate-pulse">Flashing Active</span>}
                                </div>
                                <p className="text-xs text-slate-400 font-bold italic leading-relaxed mb-6 relative z-10">
                                    Required for initial voltage buildup if residual magnetism is below 2.5% rated kV.
                                </p>
                                <button
                                    onClick={activateFlashing}
                                    disabled={fieldFlashing || voltagePerc > 10}
                                    className={`w-full py-4 rounded-none border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-95 relative z-10
                                        ${fieldFlashing ? 'bg-emerald-950/20 text-emerald-500 border-emerald-500/30 cursor-default grayscale' : 'bg-amber-600 hover:bg-amber-500 text-white border-transparent shadow-none'}`}
                                >
                                    {fieldFlashing ? 'Process Complete' : 'Activate Initial Flash'}
                                </button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Safety & Protocol Card */}
                    <div className="space-y-6">
                        <section className="bg-red-900/10 border-l-[12px] border-red-600 p-8 rounded-none shadow-none backdrop-blur-sm border border-red-900/20 relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldAlert className="w-32 h-32 text-red-600" />
                            </div>
                            <div className="flex items-start gap-6 relative z-10">
                                <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0 animate-pulse" />
                                <div>
                                    <h2 className="text-red-500 font-extrabold text-xl uppercase tracking-tighter mb-4">Interlock Safety Logic</h2>
                                    <ul className="space-y-3 text-[11px] font-bold text-slate-300">
                                        <li className="flex gap-4">
                                            <span className="text-red-600">▸</span>
                                            <span>Field breaker inhibited if static rectifier temperature {'>'} 85°C.</span>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="text-red-600">▸</span>
                                            <span>Auto-trip on Over-Excitation (OEL) active after 10s.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-4 h-4 text-amber-500" /> Performance Analysis
                            </h3>
                            <div className="p-6 bg-black/40 rounded-none border border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 font-bold uppercase">Rectifier Efficiency</span>
                                    <span className="text-white font-black">99.4%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-none">
                                    <div className="w-[99.4%] bg-emerald-500 h-full" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">
                                    Neural analysis indicates optimal harmonic suppression in the thyristor bridge. No sign of bridge unbalance.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Excitation;
