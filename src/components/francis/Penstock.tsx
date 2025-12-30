import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Octagon, AlertTriangle, ArrowDown } from 'lucide-react';
import { ROUTES } from '../../routes/paths';

export const Penstock: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Joukowsky Simulation State
    const [closureTime, setClosureTime] = useState(10); // seconds

    // Simplified Joukowsky Calc: dP = rho * a * dV
    // Here we strictly follow user instruction: Pressure Rise = (Constant / Closure Time)
    // Let's pick a Constant such that 10s = 2 bar, and 1s = 20 bar.
    // Constant = 20.

    const calculatePressureRise = (time: number) => {
        if (time <= 0) return 100; // Avoid infinity
        return 20 / time;
    };

    const pressureRise = calculatePressureRise(closureTime);
    const isDanger = closureTime < 3;
    const basePressure = 15; // Static head (bar)
    const totalPressure = basePressure + pressureRise;
    const maxDesignPressure = 25; // bar

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono p-4 md:p-8">
            <button onClick={() => navigate(`/francis/${ROUTES.FRANCIS.HUB}`)} className="flex items-center gap-2 mb-6 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>{t('actions.back', 'Back to Hub')}</span>
            </button>

            <header className="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                        <Activity className="w-8 h-8 text-slate-200" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">{t('francis.penstock.title', 'Penstock Integrity')}</h1>
                        <p className="text-slate-500 text-xs tracking-widest">{t('francis.penstock.subtitle', 'Pressure Monitoring & Thickness')}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Joukowsky Calculator */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-900/30 rounded border border-red-500/30">
                            <ArrowDown className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="font-bold text-white uppercase">{t('francis.penstock.hammer', 'Hidraulički Udar (Joukowsky)')}</h3>
                    </div>

                    <div className="space-y-8">
                        {/* Slider */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Effective Closure Time (s)</label>
                                <span className={`text-2xl font-black ${isDanger ? 'text-red-500' : 'text-cyan-400'}`}>
                                    {closureTime} s
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="20"
                                step="0.5"
                                value={closureTime}
                                onChange={(e) => setClosureTime(parseFloat(e.target.value))}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isDanger ? 'bg-red-900/50 accent-red-500' : 'bg-slate-800 accent-cyan-500'}`}
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-1 uppercase font-bold">
                                <span>Fast (Danger)</span>
                                <span>Slow (Safe)</span>
                            </div>
                        </div>

                        {/* Results Vis */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950 rounded border border-slate-800">
                                <div className="text-[10px] text-slate-500 uppercase mb-1">Pressure Rise (Delta)</div>
                                <div className={`text-2xl font-mono ${isDanger ? 'text-red-400' : 'text-yellow-400'}`}>
                                    +{pressureRise.toFixed(1)} bar
                                </div>
                            </div>
                            <div className="p-4 bg-slate-950 rounded border border-slate-800">
                                <div className="text-[10px] text-slate-500 uppercase mb-1">Total Pressure</div>
                                <div className={`text-2xl font-mono ${totalPressure > maxDesignPressure ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                    {totalPressure.toFixed(1)} bar
                                </div>
                                <div className="text-[10px] text-slate-600 mt-1">Design Max: {maxDesignPressure} bar</div>
                            </div>
                        </div>

                        {/* Gauge Visual */}
                        <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            {/* Safety Marker */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${(maxDesignPressure / 40) * 100}%` }} title="Design Limit" />

                            {/* Bar */}
                            <div
                                className={`h-full transition-all duration-300 ${isDanger ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-cyan-600 to-blue-500'}`}
                                style={{ width: `${Math.min((totalPressure / 40) * 100, 100)}%` }}
                            />
                        </div>

                        {isDanger && (
                            <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/50 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-400 uppercase mb-1">CRITICAL WARNING</h4>
                                    <p className="text-xs text-red-200/70">
                                        Closure time is too fast! Resulting pressure shockwave exceeds penstock design limits.
                                        Risk of catastrophic rupture.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Synapse Link */}
                        <div className="pt-4 border-t border-slate-700">
                            <button
                                onClick={() => navigate(`/${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.LOGBOOK}`, {
                                    state: { source: 'Penstock (Joukowsky)', reason: isDanger ? 'Water Hammer Risk' : 'Routine Check' }
                                })}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded border border-slate-600 transition-colors"
                            >
                                <Activity className="w-4 h-4" />
                                {t('actions.logObservation', 'Log Observation')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Wall Thickness Monitor */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-800 rounded border border-slate-600">
                            <Octagon className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-white uppercase">{t('francis.penstock.thickness', 'Wall Thickness Monitoring')}</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Upper Section (Inlet)', current: 24.8, original: 25.0, status: 'GOOD' },
                            { label: 'Mid Section (Elbow)', current: 23.2, original: 25.0, status: 'WARNING' },
                            { label: 'Lower Section (MIV)', current: 28.5, original: 29.0, status: 'GOOD' },
                        ].map((section, idx) => (
                            <div key={idx} className="p-4 bg-slate-950 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-300">{section.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${section.status === 'GOOD' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                        }`}>{section.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span>Current: <span className="text-white font-mono">{section.current}mm</span></span>
                                    <span>Original: <span className="text-slate-400 font-mono">{section.original}mm</span></span>
                                    <span>Loss: <span className="text-red-400 font-mono">-{(section.original - section.current).toFixed(1)}mm</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Penstock;
