import React from 'react';
import { Droplets, Thermometer, Activity, Wind } from 'lucide-react';

interface CirculatoryData {
    unitId: string;
    bearing: {
        filmThickness: number; // micron
        padMaxTemp: number; // C
        jackingPump: 'OFF' | 'ON';
        regime: string;
    };
    cooling: {
        oilCoolerEff: number; // %
        airCoolerEff: number; // %
        foulingTrend: 'FLAT' | 'RISING';
    };
    oil: {
        viscosity: number; // cSt
        waterPPM: number;
        health: string;
    };
}

export const CirculatoryDashboard: React.FC<{ data: CirculatoryData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-900/30 rounded-full">
                    <Droplets className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Circulatory System Health</h2>
                    <p className="text-xs text-slate-400">Flow, Friction & Thermal Management • {data.unitId}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. BEARING TRIBOLOGY */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Bearing Tribology
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Film Thickness</span>
                                <span>Target: &gt;15 µm</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className={`text-2xl font-mono font-bold ${data.bearing.filmThickness < 15 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {data.bearing.filmThickness.toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-500 mb-1">µm</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={`h-full ${data.bearing.filmThickness < 15 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, data.bearing.filmThickness * 2)}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-800 p-2 rounded">
                                <span className="text-[10px] text-slate-400">Pad Temp</span>
                                <div className={`text-lg font-bold ${data.bearing.padMaxTemp > 80 ? 'text-amber-400' : 'text-slate-200'}`}>
                                    {data.bearing.padMaxTemp}°C
                                </div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <span className="text-[10px] text-slate-400">Regime</span>
                                <div className="text-sm font-bold text-blue-300">
                                    {data.bearing.regime}
                                </div>
                            </div>
                        </div>

                        <div className={`text-center p-1 rounded text-xs font-bold border ${data.bearing.jackingPump === 'ON' ? 'bg-amber-900/30 border-amber-500 text-amber-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            JACKING PUMP: {data.bearing.jackingPump}
                        </div>
                    </div>
                </div>

                {/* 2. COOLING CIRCUIT */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Wind className="w-4 h-4 text-cyan-400" />
                        Heat Exchange
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
                            <div>
                                <div className="text-xs text-slate-400">Oil Cooler Eff</div>
                                <div className={`text-xl font-bold ${data.cooling.oilCoolerEff < 70 ? 'text-red-400' : 'text-cyan-300'}`}>
                                    {data.cooling.oilCoolerEff.toFixed(0)}%
                                </div>
                            </div>
                            <div className="h-10 w-1 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="w-full bg-cyan-400"
                                    style={{ height: `${data.cooling.oilCoolerEff}%`, marginTop: `${100 - data.cooling.oilCoolerEff}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
                            <div>
                                <div className="text-xs text-slate-400">Generator Air</div>
                                <div className={`text-xl font-bold ${data.cooling.airCoolerEff < 70 ? 'text-red-400' : 'text-blue-300'}`}>
                                    {data.cooling.airCoolerEff.toFixed(0)}%
                                </div>
                            </div>
                            <div className="h-10 w-1 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="w-full bg-blue-400"
                                    style={{ height: `${data.cooling.airCoolerEff}%`, marginTop: `${100 - data.cooling.airCoolerEff}%` }}
                                />
                            </div>
                        </div>

                        <div className="text-xs text-center text-slate-500">
                            Fouling Trend: <span className={data.cooling.foulingTrend === 'RISING' ? 'text-amber-400' : 'text-emerald-400'}>{data.cooling.foulingTrend}</span>
                        </div>
                    </div>
                </div>

                {/* 3. FLUID INTEGRITY */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-purple-400" />
                        Fluid Integrity
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400 mb-1">ISO Viscosity (40°C Sim)</div>
                            <div className="text-2xl font-bold text-purple-300 font-mono">
                                {data.oil.viscosity.toFixed(0)} <span className="text-sm text-slate-500">cSt</span>
                            </div>
                            {data.oil.viscosity < 35 && <div className="text-[10px] text-red-400">⚠️ TOO THIN</div>}
                            {data.oil.viscosity > 60 && <div className="text-[10px] text-red-400">⚠️ OXIDIZED</div>}
                        </div>

                        <div className="bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400 mb-1">Water Content</div>
                            <div className={`text-xl font-bold font-mono ${data.oil.waterPPM > 500 ? 'text-red-400' : 'text-blue-300'}`}>
                                {data.oil.waterPPM} <span className="text-sm text-slate-500">ppm</span>
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-xs font-bold border ${data.oil.health === 'GOOD' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-red-950/30 border-red-500 text-red-400'}`}>
                            STATUS: {data.oil.health}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
