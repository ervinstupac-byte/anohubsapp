import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { EfficiencyMonitor } from '../../features/telemetry/components/EfficiencyMonitor';
import { ScenarioController } from './ScenarioController';
import { Globe, ChevronUp, ChevronDown, LayoutDashboard, ShieldCheck, Activity, Zap, TrendingUp, DollarSign } from 'lucide-react';

const ExecutiveRibbon: React.FC = () => {
    const { units, gridFrequency } = useTelemetryStore();
    const totalRev = Object.values(units).reduce((acc, u: any) => acc + (u.financials?.currentRevenueEURh || 0), 0);

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
                    <span className="text-emerald-400 font-black">€{totalRev.toLocaleString()} EUR/H</span>
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
    const { units, fleet } = useTelemetryStore();
    const plantName = "MONOLIT_CORE";

    const theme = {
        bg: 'bg-emerald-500 bg-opacity-10',
        text: 'text-emerald-400',
        border: 'border-emerald-500 border-opacity-20'
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
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
                        <EfficiencyMonitor />
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
        </div>
    );
};
