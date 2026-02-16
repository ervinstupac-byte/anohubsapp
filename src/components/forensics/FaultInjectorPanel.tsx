import React, { useState } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { Zap, AlertTriangle, Waves, RotateCcw, Activity, Hexagon } from 'lucide-react';
import Decimal from 'decimal.js';

export const FaultInjectorPanel: React.FC = () => {
    const { updateTelemetry, mechanical, physics, erosion } = useTelemetryStore();
    const [isVisible, setIsVisible] = useState(false);

    // Injection Handlers
    const injectThermalRunaway = () => {
        updateTelemetry({
            mechanical: {
                bearingTemp: 100 // Spike to 100°C (Red Zone)
            }
        });
    };

    const injectLoadRejection = () => {
        // Sudden load loss (Breaker Open) -> Overspeed
        // Simulate by cutting electrical load torque to 0
        // We achieve this by setting powerMW to 0 while keeping gate open
        // But PhysicsEngine recalculates power based on flow/head
        // So we must override the Governor Setpoint to 0 to simulate Trip
        // OR better: Introduce a "GridStatus" toggle in store?
        // For now, let's simulate a massive load drop by forcing a speed spike
        // which the governor should then fight
        updateTelemetry({
            mechanical: {
                rpm: 650 // Overspeed (Rated 500)
            },
            governor: {
                setpoint: new Decimal(0) // Trip logic: Close gates!
            }
        });
    };

    const injectCavitation = () => {
        updateTelemetry({
            mechanical: {
                vibration: 5.5, // > 2.0 mm/s
                vibrationX: 5.2,
                vibrationY: 4.8
            },
            physics: {
                eccentricity: 0.35 // Significant orbit offset
            }
        });
    };

    const injectWaterHammer = () => {
        updateTelemetry({
            physics: {
                surgePressureBar: 80, // Massive pressure spike
                waterHammerPressureBar: 80
            }
        });
    };

    const injectSedimentSurge = () => {
        updateTelemetry({
            erosion: {
                sedimentPPM: 5000, // Massive sand influx (5 g/l)
                severity: 'EXTREME'
            }
        });
    };

    const resetToNominal = () => {
        updateTelemetry({
            mechanical: {
                bearingTemp: 45,
                vibration: 0.5,
                vibrationX: 0.5,
                vibrationY: 0.4
            },
            physics: {
                eccentricity: 0.05,
                surgePressureBar: 0,
                waterHammerPressureBar: 0
            },
            erosion: {
                sedimentPPM: 50,
                severity: 'NEGLIGIBLE'
            }
        });
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 z-50 p-3 bg-red-900/80 hover:bg-red-800 text-white rounded-full shadow-lg border border-red-500/50 backdrop-blur-sm transition-all hover:scale-110"
                title="Open Fault Injection Panel"
            >
                <Zap className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-72 bg-slate-950/95 border border-red-500/30 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="px-4 py-3 bg-red-950/30 border-b border-red-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-100">
                        Fault Injector
                    </h3>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <span className="text-xs font-mono">[CLOSE]</span>
                </button>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-3">
                <button
                    onClick={injectThermalRunaway}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/50 rounded transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 group-hover:text-red-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white uppercase">Thermal Runaway</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">100°C</span>
                </button>

                <button
                    onClick={injectLoadRejection}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/50 rounded transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 group-hover:text-red-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white uppercase">Load Rejection</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">Trip</span>
                </button>

                <button
                    onClick={injectCavitation}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/50 rounded transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500 group-hover:text-red-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white uppercase">Cavitation / Vib</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">5.0 mm/s</span>
                </button>

                <button
                    onClick={injectWaterHammer}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/50 rounded transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-blue-500 group-hover:text-red-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white uppercase">Water Hammer</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">80 BAR</span>
                </button>

                <button
                    onClick={injectSedimentSurge}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/50 rounded transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <Hexagon className="w-4 h-4 text-amber-600 group-hover:text-red-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white uppercase">Sediment Surge</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">5000 PPM</span>
                </button>

                <div className="h-px bg-white/10 my-2" />

                <button
                    onClick={resetToNominal}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded transition-all text-emerald-400 hover:text-emerald-300"
                >
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Reset to Nominal</span>
                </button>
            </div>

            {/* Live Status Tiny Footer */}
            <div className="px-4 py-2 bg-black/40 text-[8px] font-mono text-slate-500 flex justify-between">
                <span>TEMP: {mechanical.bearingTemp?.toFixed(1)}°C</span>
                <span>VIB: {mechanical.vibration?.toFixed(2)}</span>
            </div>
        </div>
    );
};
