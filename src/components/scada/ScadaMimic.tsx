import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';

const TurbineUnit: React.FC<{ id: string; name: string; status: 'running' | 'stopped'; mw: number }> = React.memo(({ name, status, mw }) => (
    <div className="relative group">
        {/* Generator Housing */}
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

    // Mock Data - deterministic random based on asset ID to simulate different states
    const seed = selectedAsset ? selectedAsset.id.charCodeAt(0) : 0;
    const baseMw = 200 + (seed % 50);

    const [t1Mw, setT1Mw] = useState(baseMw);
    const [t2Mw, setT2Mw] = useState(baseMw);

    // Simulate subtle fluctuation
    useEffect(() => {
        setT1Mw(baseMw);
        setT2Mw(baseMw);

        const interval = setInterval(() => {
            setT1Mw(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1));
            setT2Mw(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1));
        }, 2000);
        return () => clearInterval(interval);
    }, [baseMw]);

    return (
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-8">

            {/* Grid Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 w-full max-w-4xl border border-slate-800 bg-slate-950/80 p-12 rounded-xl backdrop-blur-sm shadow-2xl">
                <div className="absolute top-4 left-4 flex items-center gap-3">
                    <div className="text-xs font-black text-slate-500 tracking-[0.2em] border border-slate-700 px-2 py-1 rounded">
                        PROCESS MIMIC
                    </div>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        :: {selectedAsset?.name || 'NO CONTEXT'}
                    </div>
                </div>

                <div className="absolute top-4 right-4 text-xs font-mono text-emerald-500 bg-emerald-950/30 border border-emerald-900 px-2 py-1 rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    SYSTEM OPTIMAL
                </div>

                <div className="flex justify-around items-end pt-8 pb-12 relative">
                    {/* INTAKE / PENSTOCK VISUAL (Simplified) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-cyan-900/30"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-cyan-900/30"></div>

                    <TurbineUnit id="t1" name="GEN T1" status="running" mw={t1Mw} />

                    <div className="w-px h-64 bg-slate-800/50 mx-8"></div>

                    <TurbineUnit id="t2" name="GEN T2" status="running" mw={t2Mw} />

                    {/* Water Flow Lines (Decorative) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: -1 }}>
                        <path d="M 200 50 Q 200 150 250 200" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                        <path d="M 600 50 Q 600 150 550 200" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    </svg>
                </div>

                {/* OUTLET */}
                <div className="w-full h-12 bg-gradient-to-b from-cyan-900/20 to-transparent border-t border-cyan-800/30 rounded-b-xl mt-4 relative overflow-hidden">
                    <span className="absolute top-2 right-4 text-[10px] text-cyan-700 font-bold tracking-widest">TAILRACE LEVEL: 142.5m</span>
                    <div className="absolute bottom-0 w-full h-1 bg-cyan-500/10"></div>
                </div>
            </div>
        </div>
    );
});
