import React, { useState, useEffect } from 'react';
import { Thermometer, Clock, Snowflake, AlertTriangle } from 'lucide-react';

export const PostMortemMonitor: React.FC = () => {
    // State
    const [minutesSinceShutdown, setMinutesSinceShutdown] = useState(0);
    const [thermalRate, setThermalRate] = useState(0.5); // deg C / min
    const [isEmergencyCooling, setIsEmergencyCooling] = useState(false);

    // Simulation Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setMinutesSinceShutdown(prev => Math.min(prev + 1, 120));
        }, 1000); // Speed up time for demo (1 sec = 1 min)
        return () => clearInterval(timer);
    }, []);

    // Monitoring Logic
    useEffect(() => {
        if (thermalRate > 2.0 && !isEmergencyCooling) {
            setIsEmergencyCooling(true);
        } else if (thermalRate <= 2.0 && isEmergencyCooling) {
            setIsEmergencyCooling(false);
        }
    }, [thermalRate]);

    return (
        <div className="glass-panel p-6 border-l-4 border-l-[#2dd4bf] relative overflow-hidden bg-slate-900 rounded-xl border border-white/10">
            {/* Background Alert */}
            {isEmergencyCooling && (
                <div className="absolute inset-0 bg-red-500/10 animate-pulse z-0 pointer-events-none" />
            )}

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-400" /> Post-Mortem Watchdog
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                        UNIT STATUS: OFF-LINE • MONITORING TERMINAL INERTIA
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono">{minutesSinceShutdown}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold ml-1">min post-stop</span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8">
                {/* Thermal Rate Input (Simulation) */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex justify-between">
                        <span>BEARING THERMAL INERTIA</span>
                        <span className={`${thermalRate > 2 ? 'text-red-500' : 'text-emerald-500'} font-mono`}>{thermalRate.toFixed(1)} °C/min</span>
                    </label>
                    <input
                        type="range" min="0" max="4" step="0.1"
                        value={thermalRate}
                        onChange={(e) => setThermalRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                        <span>STABLE</span>
                        <span>CRITICAL ({'>'}2.0)</span>
                    </div>
                </div>

                {/* Status Output */}
                <div className="flex flex-col justify-end">
                    {isEmergencyCooling ? (
                        <div className="bg-red-500 text-white p-3 rounded-lg shadow-xl animate-bounce">
                            <div className="flex items-center gap-2 mb-1">
                                <Snowflake className="w-5 h-5 animate-spin" />
                                <span className="font-black uppercase text-sm">Emergency Protocol</span>
                            </div>
                            <p className="text-xs font-bold opacity-90">
                                RISK OF SHAFT SEIZURE DETECTED.
                                <br />AUTO-DEPLOYING AUX COOLING PUMPS.
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-emerald-500 opacity-80">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Cooling Curve Nominal</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CheckCircleIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
