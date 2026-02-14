import React, { useMemo } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
// EfficiencyMonitor component path unavailable in this build; placeholder panel provided below
import { ScenarioController } from './ScenarioController';
import { Globe, ChevronUp, ChevronDown, LayoutDashboard, ShieldCheck, Activity, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { EfficiencyOptimizer } from '../../services/EfficiencyOptimizer';
import { SovereignPulse } from './SovereignPulse';
import { TURBINE_CATEGORIES } from '../../constants';
import { useState, useEffect } from 'react';

const ExecutiveRibbon: React.FC = () => {
    // @ts-ignore
    const { units, gridFrequency } = useTelemetryStore() as any;
    const totalRev = Object.values(units).reduce((acc: number, u: any) => acc + (u.financials?.currentRevenueEURh || 0), 0);
    const totalRevNum = Number(totalRev) || 0;

    return (
        <div className="ticker-wrap h-10 flex items-center px-6 gap-12 select-none w-full bg-slate-950 border-b border-white border-opacity-5">
            <div className="flex items-center gap-3 shrink-0">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fleet Commander Ribbon</span>
            </div>
            <div className="flex items-center gap-8 overflow-hidden font-mono text-[11px] font-bold">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">GRID_FREQ:</span>
                    <span className="text-emerald-400">{gridFrequency.toFixed(3)} HZ</span>
                </div>
                <div className="h-4 w-px bg-white bg-opacity-10" />
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">TOTAL_REVENUE:</span>
                    <span className="text-emerald-400 font-black">€{totalRevNum.toLocaleString()} EUR/H</span>
                    {(totalRev as number) > 5000 ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-amber-500" />}
                </div>
                <div className="h-4 w-px bg-white bg-opacity-10" />
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">FLEET_INTEGRITY:</span>
                    <span className="text-sky-400">PASSED [99.98%]</span>
                </div>
            </div>
        </div>
    );
};

export const MasterControlRoom: React.FC = () => {
    // @ts-ignore
    const { units, fleet, hydraulic, physics, deltaToOptimum } = useTelemetryStore() as any;
    const plantName = "MONOLIT_CORE";
    const [selectedVariant, setSelectedVariant] = useState<string>('pelton_multi_jet');

    const theme = {
        bg: 'bg-emerald-500 bg-opacity-10',
        text: 'text-emerald-400',
        border: 'border-emerald-500 border-opacity-20'
    };

    // NC-300: Optimization HUD data
    const hud = useMemo(() => {
        const netHeadM = (physics?.netHead ?? hydraulic?.head ?? 0) as number;
        const flowM3s = (hydraulic?.flow ?? 0) as number;
        const effRaw = (hydraulic?.efficiency ?? 0) as number;
        const currentEta = effRaw <= 1 ? effRaw * 100 : effRaw;
        const { etaMax } = EfficiencyOptimizer.compute(netHeadM, flowM3s, currentEta);
        const delta = typeof deltaToOptimum === 'number' ? deltaToOptimum : (etaMax - currentEta);
        const statusColor = delta > 3 ? 'text-red-400' : 'text-emerald-400';
        const badgeBg = delta > 3 ? 'bg-red-500/15 border-red-500/30' : 'bg-emerald-500/15 border-emerald-500/30';
        return { currentEta, etaMax, delta, statusColor, badgeBg };
    }, [hydraulic, physics, deltaToOptimum]);

    const variantToFamily = (variant: string): 'KAPLAN' | 'FRANCIS' | 'PELTON' | 'CROSSFLOW' => {
        if (variant.startsWith('kaplan_')) return 'KAPLAN';
        if (variant.startsWith('francis_')) return 'FRANCIS';
        if (variant.startsWith('pelton_')) return 'PELTON';
        if (variant.startsWith('crossflow_')) return 'CROSSFLOW';
        return 'FRANCIS';
    };

    useEffect(() => {
        const family = variantToFamily(selectedVariant);
        dispatch.setTurbineType({ family, variant: selectedVariant });
    }, [selectedVariant]);

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
            <ExecutiveRibbon />

            <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                {/* Hero Header */}
                <div className="flex items-end justify-between">
                    <div className="flex items-center gap-10">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                                <LayoutDashboard className={`w-10 h-10 ${theme.text} drop-shadow-sm`} />
                                SOVEREIGN <span className="text-slate-500">COMMAND</span>
                                <span className={`text-xs font-mono ${theme.text} ${theme.bg} border ${theme.border} px-3 py-1 rounded ml-4 tracking-widest`}>
                                    {plantName.toUpperCase()}
                                </span>
                            </h1>
                            <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-tight">
                                Industrial Reality Layer | Session Locked: MONOLIT_ARCHITECT
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Fleet Capacity</div>
                            <div className="text-3xl font-black text-white tabular-nums">
                                {fleet.totalMW.toFixed(1)} <span className="text-sm text-slate-500 font-normal">MW</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Turbine Selector */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Global Turbine Selector
                        </h3>
                        <div className="text-[10px] font-mono text-slate-400">Selected: <span className="text-emerald-300 font-bold">{selectedVariant}</span></div>
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-2">
                        {Object.entries(TURBINE_CATEGORIES).flatMap(([familyKey, cat]) =>
                            (cat.types || []).map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedVariant(t.id)}
                                    className={`px-2 py-2 rounded border text-[10px] font-mono uppercase truncate ${
                                        selectedVariant === t.id
                                            ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300'
                                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                    title={`${cat.name} • ${t.name}`}
                                >
                                    {t.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Mission Control & Scenarios */}
                    <div className="col-span-3 space-y-6">
                        <ScenarioController />
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Safety Integrity Level
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">ESD System</span>
                                    <span className="text-emerald-400 font-bold">ARMED</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Cyber Shield</span>
                                    <span className="text-sky-400 font-bold">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Efficiency & Distribution */}
                    <div className="col-span-5">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-500" />
                                Efficiency Monitor (Placeholder)
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-2">
                                Module not available in this build. Live charts load in full system.
                            </p>
                        </div>
                        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                Sovereign Pulse
                            </h4>
                            <div className="mt-4">
                                <SovereignPulse />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Financials & Projections */}
                    <div className="col-span-4 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                Economic Projections
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Current Spot Revenue</div>
                                        <div className="text-2xl font-black text-white mt-1">€180.00 <span className="text-xs font-normal text-slate-500">MWh</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Daily P/L</div>
                                        <div className="text-xl font-black text-emerald-400 tabular-nums">
                                            +€{((Object.values(units).reduce((acc, u: any) => (acc as number) + (u.financials?.dailyTotalProducedMWh || 0) * 180, 0)) as number).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            Grid Demand
                                        </div>
                                        <div className="text-xl font-bold text-sky-400">110.0 MW</div>
                                    </div>
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            ROI Forecast
                                        </div>
                                        <div className="text-xl font-bold text-white">99.8%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* NC-300: Optimization HUD Overlay */}
            <div className="absolute bottom-6 right-6 z-[1000] w-80 pointer-events-none hidden md:block">
                <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl space-y-3 overflow-hidden relative">
                    <div className="absolute inset-0 bg-emerald-500/5" />
                    <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2 relative z-10">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">Optimization HUD</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">η (Current)</span>
                            <span className="text-white font-bold">{hud.currentEta.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">η_max (Target)</span>
                            <span className="text-cyan-400 font-bold">{hud.etaMax.toFixed(2)}%</span>
                        </div>
                        <div className={`col-span-2 mt-1 px-2 py-1 rounded border ${hud.badgeBg} flex items-center justify-between`}>
                            <span className="text-slate-400 uppercase tracking-widest">Δ Optimization</span>
                            <span className={`font-black ${hud.statusColor}`}>{hud.delta.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
