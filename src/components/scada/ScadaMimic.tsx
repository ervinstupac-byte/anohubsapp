import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { Tooltip } from '../ui/Tooltip.tsx';

const TurbineUnit: React.FC<{ id: string; name: string; status: 'running' | 'stopped'; mw: number }> = React.memo(({ name, status, mw }) => (
    <div className="relative group">
        <Tooltip content={`${name} is currently ${status === 'running' ? 'Active & Generating' : 'Standby'}`}>
            <div className={`
                w-32 h-32 rounded-full border-4 flex items-center justify-center relative translate-y-8 transition-all duration-500
                ${status === 'running'
                    ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    : 'border-slate-600 bg-slate-800/50'}
            `}>
                <div className={`w-24 h-24 rounded-full border-2 border-dashed ${status === 'running' ? 'border-emerald-400/50 animate-spin-slow' : 'border-slate-700'}`}></div>
                <div className="absolute text-center">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{name}</div>
                    <div className={`text-xl font-mono font-bold ${status === 'running' ? 'text-white' : 'text-slate-500'}`}>{mw} MW</div>
                </div>
            </div>
        </Tooltip>

        {/* Shaft */}
        <div className="w-4 h-16 bg-gradient-to-r from-slate-700 to-slate-600 mx-auto relative -z-10"></div>

        {/* Turbine Runner */}
        <div className={`
            w-24 h-16 mx-auto rounded-b-xl border-x-2 border-b-2 flex items-center justify-center overflow-hidden transition-all duration-500
            ${status === 'running' ? 'border-emerald-600/50 bg-cyan-900/30' : 'border-slate-700 bg-slate-900'}
        `}>
            {status === 'running' && (
                <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
            )}
        </div>
    </div>
));

export const ScadaMimic: React.FC = React.memo(() => {
    const { selectedAsset } = useAssetContext();
    const [isLoading, setIsLoading] = useState(true);

    // Mock Data
    const seed = selectedAsset ? selectedAsset.id.charCodeAt(0) : 0;
    const baseMw = 200 + (seed % 50);

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
            <div className="flex-1 flex flex-col items-center justify-center p-8">
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
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">

            {/* Grid Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 w-full max-w-4xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 md:p-12 rounded-xl backdrop-blur-sm shadow-2xl">
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                    <div className="text-[10px] sm:text-xs font-black text-slate-500 tracking-wider sm:tracking-[0.2em] border border-slate-700 px-2 py-1 rounded">
                        PROCESS MIMIC
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">
                        :: {selectedAsset?.name || 'NO CONTEXT'}
                    </div>
                </div>

                <Tooltip content="Infrastructure Status: All metrics within operational thresholds.">
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[9px] sm:text-xs font-mono text-emerald-500 bg-emerald-950/30 border border-emerald-900 px-2 py-1 rounded flex items-center gap-1 sm:gap-2">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="hidden sm:inline">SYSTEM OPTIMAL</span>
                        <span className="sm:hidden">OK</span>
                    </div>
                </Tooltip>

                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-12 sm:pt-8 pb-8 sm:pb-12 relative gap-4 sm:gap-0">
                    {/* INTAKE / PENSTOCK VISUAL (Simplified) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-cyan-900/30"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-12 sm:h-20 bg-cyan-900/30"></div>

                    <TurbineUnit id="t1" name="GEN T1" status="running" mw={t1Mw} />

                    <div className="w-full h-px sm:w-px sm:h-64 bg-slate-800/50 sm:mx-8"></div>

                    <TurbineUnit id="t2" name="GEN T2" status="running" mw={t2Mw} />

                    {/* Water Flow Lines (Decorative) - Hide on mobile */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 hidden sm:block" style={{ zIndex: -1 }}>
                        <path d="M 200 50 Q 200 150 250 200" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                        <path d="M 600 50 Q 600 150 550 200" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    </svg>
                </div>

                {/* OUTLET */}
                <div className="w-full h-12 bg-gradient-to-b from-cyan-900/20 to-transparent border-t border-cyan-800/30 rounded-b-xl mt-4 relative overflow-hidden">
                    <span className="absolute top-2 right-2 sm:right-4 text-[9px] sm:text-[10px] text-cyan-700 font-bold tracking-widest">
                        <span className="hidden sm:inline">TAILRACE LEVEL: 142.5m</span>
                        <span className="sm:hidden">TL: 142.5m</span>
                    </span>
                    <div className="absolute bottom-0 w-full h-1 bg-cyan-500/10"></div>
                </div>
            </div>
        </div>
    );
});
