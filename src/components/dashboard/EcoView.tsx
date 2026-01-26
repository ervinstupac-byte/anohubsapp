import React from 'react';
import { Droplets, Fish, Mountain, Leaf } from 'lucide-react';

interface EcoData {
    water: {
        do: number; // mg/L
        compliant: boolean;
        aerating: boolean;
    };
    fish: {
        season: string;
        flow: number; // m3/s
        count: number;
    };
    sediment: {
        ppm: number;
        risk: number; // 0-100
        safe: boolean;
    };
}

export const EcoView: React.FC<{ data: EcoData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-900/30 rounded-full">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Eco-Sovereignty</h2>
                    <p className="text-xs text-slate-400">Environmental Integration & Compliance</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. WATER QUALITY (DO) */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${!data.water.compliant ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        River Oxygen
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Dissolved Oxygen</div>
                            <div className={`text-3xl font-bold font-mono ${data.water.do < 5.0 ? 'text-red-400' : 'text-cyan-300'}`}>
                                {data.water.do.toFixed(1)} <span className="text-lg text-slate-500">mg/L</span>
                            </div>
                        </div>

                        <div className={`text-center py-2 text-xs font-bold border rounded ${data.water.aerating ? 'bg-blue-900/30 border-blue-400 text-blue-300' : 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'}`}>
                            {data.water.aerating ? '💨 AERATION ACTIVE' : 'PASSIVE MONITORING'}
                        </div>
                    </div>
                </div>

                {/* 2. FISH PASSAGE */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Fish className="w-4 h-4 text-emerald-400" />
                        Migration Logic
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800 p-2 rounded">
                            <span className="text-xs text-slate-400">Season</span>
                            <span className="text-xs font-bold text-white">{data.fish.season.replace('_', ' ')}</span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-800 p-2 rounded">
                            <span className="text-xs text-slate-400">Passage Flow</span>
                            <span className="text-lg font-mono text-cyan-300">{data.fish.flow.toFixed(1)} m³/s</span>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold font-mono text-emerald-400">{data.fish.count}</div>
                            <div className="text-[10px] text-slate-500">Daily Passage Count</div>
                        </div>
                    </div>
                </div>

                {/* 3. SEDIMENT */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.sediment.risk > 60 ? 'border-amber-500' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-amber-600" />
                        Sediment Load
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Sand Content</div>
                            <div className={`text-2xl font-bold font-mono ${data.sediment.ppm > 2000 ? 'text-red-400' : 'text-amber-200'}`}>
                                {data.sediment.ppm.toFixed(0)} <span className="text-sm text-slate-500">ppm</span>
                            </div>
                        </div>

                        <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${data.sediment.risk > 80 ? 'bg-red-500' : data.sediment.risk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${data.sediment.risk}%` }}
                            />
                        </div>
                        <div className="text-center text-xs text-slate-400">
                            Abrasion Risk: {data.sediment.risk.toFixed(0)}%
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
