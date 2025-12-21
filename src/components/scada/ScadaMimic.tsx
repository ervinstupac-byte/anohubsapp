import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useTelemetry } from '../../contexts/TelemetryContext.tsx';
import { Tooltip } from '../ui/Tooltip.tsx';

import { DigitalDisplay } from './DigitalDisplay.tsx';

const TurbineUnit: React.FC<{ id: string; name: string; status: 'running' | 'stopped'; mw: number }> = React.memo(({ name, status, mw }) => (
    <div className="relative group">
        <Tooltip content={`${name} is currently ${status === 'running' ? 'Active & Generating' : 'Standby'}`}>
            <div className={`
                w-40 h-40 rounded-full border-4 flex items-center justify-center relative translate-y-8 transition-all duration-500
                ${status === 'running'
                    ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_30px_rgba(0,243,255,0.2)]'
                    : 'border-slate-800 bg-slate-900/50'}
            `}>
                <div className={`w-32 h-32 rounded-full border-2 border-dashed ${status === 'running' ? 'border-neon-cyan/30 animate-spin-slow' : 'border-slate-800'}`}></div>
                <div className="absolute text-center">
                    <DigitalDisplay value={mw} label={name} unit="MW" color={status === 'running' ? 'cyan' : 'red'} className="!bg-transparent !border-none !p-0" />
                </div>
            </div>
        </Tooltip>

        {/* Shaft */}
        <div className="w-4 h-16 bg-gradient-to-r from-slate-800 to-slate-700 mx-auto relative -z-10 shadow-lg"></div>

        {/* Turbine Runner */}
        <div className={`
            w-28 h-20 mx-auto rounded-b-xl border-x-2 border-b-2 flex items-center justify-center overflow-hidden transition-all duration-500
            ${status === 'running' ? 'border-neon-cyan/40 bg-neon-cyan/10' : 'border-slate-800 bg-slate-900'}
            ${mw === 0 ? 'bg-red-500/10 border-red-500/40' : ''}
        `}>
            {status === 'running' && mw > 0 && (
                <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,243,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
            )}
            {mw === 0 && (
                <div className="text-[10px] font-black text-red-500 animate-pulse tracking-tighter">EMERGENCY_SHUTDOWN</div>
            )}
        </div>
    </div>
));

export const ScadaMimic: React.FC = React.memo(() => {
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    const [isLoading, setIsLoading] = useState(true);

    const liveData = selectedAsset ? telemetry[selectedAsset.id] : null;
    const isCritical = liveData?.status === 'CRITICAL';

    // Mock Data
    const seed = selectedAsset ? selectedAsset.id.charCodeAt(0) : 0;
    const baseMw = isCritical ? 0 : (200 + (seed % 50));

    const [t1Mw, setT1Mw] = useState(baseMw);
    const [t2Mw, setT2Mw] = useState(baseMw);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, [selectedAsset]);

    // Simulate subtle fluctuation
    useEffect(() => {
        if (isLoading) return;
        setT1Mw(baseMw);
        setT2Mw(baseMw);

        const interval = setInterval(() => {
            setT1Mw(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1));
            setT2Mw(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1));
        }, 2000);
        return () => clearInterval(interval);
    }, [baseMw, isLoading]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-4xl space-y-8 animate-pulse">
                    <div className="h-12 w-48 bg-slate-900/50 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                    </div>
                    <div className="h-16 w-full bg-slate-900/50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">

            {/* Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            <div className="relative z-10 w-full max-w-5xl border border-white/5 bg-black/40 p-4 sm:p-6 md:p-12 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden self-center">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                    <div className="text-[10px] sm:text-xs font-black text-slate-500 tracking-[0.2em] border border-white/10 px-3 py-1 bg-white/5 rounded backdrop-blur-sm">
                        NEURAL INTERFACE :: SCADA
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-neon-cyan uppercase tracking-widest truncate max-w-[150px] sm:max-w-none drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                        ● {selectedAsset?.name || 'NO CONTEXT'}
                    </div>
                </div>

                <Tooltip content={isCritical ? "FATAL ERROR: Bearing Temperature Exceeded / High Vibration Detected" : "Infrastructure Status: All metrics within operational thresholds."}>
                    <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 text-[9px] sm:text-xs font-mono px-3 py-1 rounded backdrop-blur-sm flex items-center gap-2 border ${isCritical
                        ? 'text-red-500 bg-red-950/40 border-red-500 animate-pulse'
                        : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'}`}></span>
                        <span className="hidden sm:inline tracking-tighter uppercase font-black">
                            {isCritical ? 'CORE_STATUS: ALARM' : 'CORE_STATUS: STABLE'}
                        </span>
                        <span className="sm:hidden">{isCritical ? 'ALARM' : 'OK'}</span>
                    </div>
                </Tooltip>

                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-12 sm:pt-16 pb-8 sm:pb-12 relative gap-12 sm:gap-0">
                    <TurbineUnit id="t1" name="GEN T1" status="running" mw={t1Mw} />
                    <div className="w-full h-px sm:w-px sm:h-72 bg-gradient-to-b from-transparent via-white/10 to-transparent sm:mx-8"></div>
                    <TurbineUnit id="t2" name="GEN T2" status="running" mw={t2Mw} />
                </div>

                {/* FLOW_STATS PANEL */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <DigitalDisplay value={isCritical ? "ALARM" : "42.5"} label="FLOW_RATE" unit={isCritical ? "" : "m³/s"} color={isCritical ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={isCritical ? "FAIL" : "152.0"} label="HEAD_PRES" unit={isCritical ? "" : "m"} color={isCritical ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={isCritical ? "TRIP" : "98.2"} label="GRID_FREQ" unit={isCritical ? "" : "Hz"} color={isCritical ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={isCritical ? "ALERT" : "12.2"} label="COOLING_ΔT" unit={isCritical ? "" : "°C"} color={isCritical ? 'red' : 'cyan'} className="glass" />
                </div>
            </div>
        </div>
    );
});
