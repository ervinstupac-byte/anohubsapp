import React from 'react';
import { Zap, Activity, BatteryCharging, AlertTriangle } from 'lucide-react';

interface SynapseData {
    dga: {
        status: string;
        C2H2: number; // ppm
        fault: string;
    };
    pd: {
        index: number; // 0-100
        pC: number;
    };
    cb: {
        sf6: number; // %
        ops: number;
        status: string;
    };
}

export const SynapseView: React.FC<{ data: SynapseData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-900/30 rounded-full">
                    <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Synapse-Core (HV)</h2>
                    <p className="text-xs text-slate-400">Transformers • Switchgear • Insulation</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. TRANSFORMER DGA */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.dga.status !== 'NORMAL' ? 'border-red-500' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Oil Analysis (DGA)
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Fault Classification</div>
                            <div className={`text-sm font-bold ${data.dga.status === 'NORMAL' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {data.dga.fault}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs bg-slate-800 p-2 rounded">
                            <span className="text-slate-400">Acetylene (C2H2)</span>
                            <span className={`font-mono font-bold ${data.dga.C2H2 > 5 ? 'text-red-400' : 'text-white'}`}>
                                {data.dga.C2H2} ppm
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. PARTIAL DISCHARGE */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        HV Insulation
                    </h3>

                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">Health Index</div>
                            <div className={`text-3xl font-bold ${data.pd.index < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {data.pd.index.toFixed(0)}%
                            </div>
                        </div>

                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${data.pd.index < 60 ? 'bg-red-500' : data.pd.index < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${data.pd.index}%` }}
                            />
                        </div>

                        <div className="text-center text-[10px] text-slate-500">
                            Max Discharge: {data.pd.pC} pC
                        </div>
                    </div>
                </div>

                {/* 3. SWITCHGEAR (CB) */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.cb.status !== 'SERVICEABLE' ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <BatteryCharging className="w-4 h-4 text-cyan-400" />
                        Circuit Breaker
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div className="text-xs text-slate-400">SF6 Density</div>
                            <div className={`text-xl font-mono font-bold ${data.cb.sf6 < 95 ? 'text-red-400' : 'text-cyan-300'}`}>
                                {data.cb.sf6.toFixed(1)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div className="text-xs text-slate-400">Remaining Ops</div>
                            <div className="text-xl font-mono font-bold text-white">
                                {data.cb.ops}
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400">
                            Status: {data.cb.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
