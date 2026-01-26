import React from 'react';
import { Activity, GitMerge, RotateCcw, PenTool } from 'lucide-react';

interface ActuatorData {
    unitId: string;
    diagnostics: {
        stiction: number; // 0-100
        deadband: number; // %
        status: string;
    };
    loops: {
        governorScore: number;
        avrScore: number;
        hunting: boolean;
    };
    reflex: {
        component: string;
        degradation: number; // %
        lastResponseMs: number;
    };
}

export const ActuatorView: React.FC<{ data: ActuatorData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-900/30 rounded-full">
                    <PenTool className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Actuator Health</h2>
                    <p className="text-xs text-slate-400">Mechanical Integrity • {data.unitId}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. STICTION & HYSTERESIS */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.diagnostics.stiction > 30 ? 'border-amber-500' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-cyan-400" />
                        Valve Mechanics
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Stiction Index</span>
                                <span className={data.diagnostics.stiction > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                                    {data.diagnostics.stiction.toFixed(0)}/100
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${data.diagnostics.stiction > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${data.diagnostics.stiction}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Deadband (Play)</span>
                                <span className="font-mono text-purple-300">
                                    {data.diagnostics.deadband.toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <div className={`text-center py-2 text-xs font-bold border rounded ${data.diagnostics.status === 'HEALTHY' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-red-950/30 border-red-500 text-red-400'}`}>
                            {data.diagnostics.status}
                        </div>
                    </div>
                </div>

                {/* 2. LOOP PERFORMANCE */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Loop Stability
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400">Governor</div>
                            <div className={`text-lg font-bold ${data.loops.governorScore < 80 ? 'text-amber-400' : 'text-blue-300'}`}>
                                {data.loops.governorScore.toFixed(0)} <span className="text-xs text-slate-500">score</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400">AVR</div>
                            <div className={`text-lg font-bold ${data.loops.avrScore < 80 ? 'text-amber-400' : 'text-blue-300'}`}>
                                {data.loops.avrScore.toFixed(0)} <span className="text-xs text-slate-500">score</span>
                            </div>
                        </div>

                        <div className={`text-center py-2 text-xs font-bold rounded ${data.loops.hunting ? 'bg-red-950/30 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                            {data.loops.hunting ? '⚠️ HUNTING / OSCILLATION' : 'Stable Control'}
                        </div>
                    </div>
                </div>

                {/* 3. REFLEX LOG */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <GitMerge className="w-4 h-4 text-emerald-400" />
                        Hydraulic Reflexes
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">{data.reflex.component}</div>
                            <div className={`text-2xl font-bold font-mono ${data.reflex.degradation > 20 ? 'text-red-400' : 'text-emerald-300'}`}>
                                {data.reflex.lastResponseMs} <span className="text-sm">ms</span>
                            </div>
                            <div className="text-[10px] slate-500 mt-1">Dead Time</div>
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Degradation vs Baseline</div>
                            <div className={`text-lg font-bold ${data.reflex.degradation > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                                +{data.reflex.degradation.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
