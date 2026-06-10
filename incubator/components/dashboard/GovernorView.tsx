import React from 'react';
import { Gauge, Activity, ShieldCheck, Zap } from 'lucide-react';

interface GovernorData {
    mode: string;
    servoPosition: number; // %
    servoCommand: number; // %
    hpu: {
        pressure: number;
        strokesPossible: number;
        pumpStatus: string;
    };
    surge: {
        safetyMargin: number; // %
        cushionPoint: number; // %
    };
    gains: {
        Kp: number;
        Ki: number;
    };
}

export const GovernorView: React.FC<{ data: GovernorData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-900/30 rounded-full">
                        <Gauge className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Governor & HPU</h2>
                        <p className="text-xs text-slate-400">Hydraulic Actuation • {data.mode}</p>
                    </div>
                </div>

                <div className="flex gap-2 text-xs font-mono">
                    <div className="px-2 py-1 bg-slate-800 rounded border border-slate-600">
                        Kp: {data.gains.Kp.toFixed(1)}
                    </div>
                    <div className="px-2 py-1 bg-slate-800 rounded border border-slate-600">
                        Ki: {data.gains.Ki.toFixed(1)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. SERVO TRACKING */}
                <div className="col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Servo Response
                    </h3>

                    <div className="relative h-20 bg-slate-800 rounded-lg overflow-hidden flex items-center px-4">
                        {/* Track */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-700 -translate-y-1/2" />

                        {/* Cushion Point Marke r*/}
                        <div
                            className="absolute top-0 bottom-0 w-px bg-amber-500/50 border-r border-dashed border-amber-500"
                            style={{ left: `${data.surge.cushionPoint}%` }}
                        >
                            <span className="absolute top-2 left-1 text-[9px] text-amber-500">CUSHION</span>
                        </div>

                        {/* Command Marker */}
                        <div
                            className="absolute w-1 h-8 bg-blue-500 z-10 transition-all duration-300"
                            style={{ left: `calc(${data.servoCommand}% - 2px)` }}
                        >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-400">CMD</span>
                        </div>

                        {/* Actual Position (Piston) */}
                        <div
                            className="absolute w-4 h-6 bg-emerald-500 rounded z-20 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300"
                            style={{ left: `calc(${data.servoPosition}% - 8px)` }}
                        />
                    </div>

                    <div className="flex justify-between mt-2 text-xs font-mono">
                        <span className="text-emerald-400">POS: {data.servoPosition.toFixed(1)}%</span>
                        <span className="text-blue-400">CMD: {data.servoCommand.toFixed(1)}%</span>
                    </div>
                </div>

                {/* 2. SURGE SAFETY */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center">
                    <h3 className="text-sm font-bold text-slate-300 mb-2 flex justify-center items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Penstock Safety
                    </h3>
                    <div className={`text-3xl font-bold font-mono ${data.surge.safetyMargin < 20 ? 'text-red-400' : 'text-purple-300'}`}>
                        {data.surge.safetyMargin.toFixed(0)}%
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Water Hammer Margin</p>
                </div>

                {/* 3. HPU STATUS */}
                <div className="col-span-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Hydraulic Power Unit
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400">Pressure</div>
                            <div className={`text-xl font-bold font-mono ${data.hpu.pressure < 120 ? 'text-red-400' : 'text-amber-300'}`}>
                                {data.hpu.pressure.toFixed(1)} bar
                            </div>
                        </div>

                        <div className="bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400">Energy</div>
                            <div className="text-xl font-bold font-mono text-emerald-300">
                                {data.hpu.strokesPossible.toFixed(1)} <span className="text-sm text-slate-500">Strokes</span>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400">Pump Status</div>
                            <div className={`text-xl font-bold ${data.hpu.pumpStatus === 'RUNNING' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                                {data.hpu.pumpStatus}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
