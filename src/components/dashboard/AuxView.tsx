import React from 'react';
import { Battery, Droplets, Wind, AlertTriangle, Zap } from 'lucide-react';

interface AuxData {
    sump: {
        level: number; // %
        inflow: number; // l/s
        status: string;
    };
    air: {
        pressure: number; // bar
        brakeReady: boolean;
    };
    power: {
        dcVoltage: number;
        soc: number; // %
        autonomy: number; // hours
        mode: string;
    };
}

export const AuxView: React.FC<{ data: AuxData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-900/30 rounded-full">
                    <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Station Life Support</h2>
                    <p className="text-xs text-slate-400">Dewatering • Pneumatics • DC Power</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. DEWATERING (SUMP) */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.sump.level > 80 ? 'border-red-500' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        Station Sump
                    </h3>

                    <div className="space-y-4">
                        <div className="relative h-32 w-full bg-slate-800 rounded-b-lg overflow-hidden border-t-4 border-slate-600">
                            <div
                                className={`absolute bottom-0 w-full transition-all duration-1000 ${data.sump.level > 80 ? 'bg-red-500/50' : 'bg-blue-500/50'}`}
                                style={{ height: `${data.sump.level}%` }}
                            >
                                <div className="absolute top-0 w-full h-1 bg-white/20 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold font-mono shadow-black drop-shadow-md">{data.sump.level.toFixed(0)}%</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Inflow Mode</span>
                            <span className="font-mono text-cyan-300">{data.sump.inflow.toFixed(1)} L/s</span>
                        </div>

                        {data.sump.status === 'FLOOD_WARNING' && (
                            <div className="p-2 bg-red-950/50 border border-red-500 text-red-400 text-xs text-center font-bold animate-pulse">
                                🚨 FLOOD WARNING
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. PNEUMATICS (AIR) */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Wind className="w-4 h-4 text-cyan-400" />
                        Compressed Air
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">System Pressure</div>
                            <div className={`text-3xl font-bold font-mono ${data.air.pressure < 6.0 ? 'text-red-400' : 'text-cyan-300'}`}>
                                {data.air.pressure.toFixed(1)} <span className="text-lg">bar</span>
                            </div>
                        </div>

                        <div className={`p-3 rounded border text-center ${data.air.brakeReady ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-amber-950/30 border-amber-500'}`}>
                            <div className="text-xs font-bold text-slate-300 mb-1">BRAKES</div>
                            <div className={`text-lg font-bold ${data.air.brakeReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {data.air.brakeReady ? 'READY' : 'INHIBITED'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. DC POWER (BATTERY) */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.power.mode === 'ON_BATTERY' ? 'border-amber-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Battery className="w-4 h-4 text-purple-400" />
                        DC Power
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>110V DC Bus</span>
                                <span className={data.power.dcVoltage < 100 ? 'text-red-400' : 'text-emerald-400'}>
                                    {data.power.dcVoltage.toFixed(1)} V
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${data.power.soc > 50 ? 'bg-green-500' : data.power.soc > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${data.power.soc}%` }}
                                />
                            </div>
                            <div className="text-center text-xs text-slate-300 mt-1">{data.power.soc.toFixed(0)}% SoC</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-400">Status</div>
                                <div className={`text-xs font-bold ${data.power.mode === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {data.power.mode}
                                </div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-400">Autonomy</div>
                                <div className="text-xs font-bold text-white font-mono">
                                    {data.power.autonomy > 100 ? '>100h' : `${data.power.autonomy.toFixed(1)}h`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
