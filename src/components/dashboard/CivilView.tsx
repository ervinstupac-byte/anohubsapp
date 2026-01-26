import React from 'react';
import { Mountain, TrendingDown, ArrowDownRight, Activity } from 'lucide-react';

interface CivilData {
    stability: {
        slidingFactor: number;
        status: string;
        seepage: number; // L/s
    };
    deformation: {
        maxDispMm: number;
        trendMmYr: number;
        alert: boolean;
    };
    seismic: {
        pga: number; // g
        freqShift: number; // %
    };
}

export const CivilView: React.FC<{ data: CivilData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-stone-800 rounded-full">
                    <Mountain className="w-6 h-6 text-stone-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Civil-Core Integrity</h2>
                    <p className="text-xs text-slate-400">Dam Stability • Geodetics • Seismic</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. STABILITY SAFETY FACTORS */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.stability.slidingFactor < 1.5 ? 'border-amber-500' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                        Dam Stability
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Sliding Safety Factor</div>
                            <div className={`text-3xl font-bold font-mono ${data.stability.slidingFactor < 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {data.stability.slidingFactor.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500">Target &gt; 1.5</div>

                        </div>

                        <div className="flex justify-between items-center text-xs bg-slate-800 p-2 rounded">
                            <span className="text-slate-400">Seepage</span>
                            <span className="font-mono text-blue-300">{data.stability.seepage.toFixed(1)} L/s</span>
                        </div>
                    </div>
                </div>

                {/* 2. GEODETIC DEFORMATION */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <ArrowDownRight className="w-4 h-4 text-orange-400" />
                        Deformation (InSAR)
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Max Displacement</span>
                                <span className={`font-mono font-bold ${data.deformation.alert ? 'text-red-400' : 'text-white'}`}>
                                    {data.deformation.maxDispMm.toFixed(1)} mm
                                </span>
                            </div>
                            <div className="w-full h-1 bg-slate-700 mt-2 rounded overflow-hidden">
                                <div
                                    className={`h-full ${data.deformation.alert ? 'bg-red-500' : 'bg-orange-500'}`}
                                    style={{ width: `${Math.min(100, data.deformation.maxDispMm * 5)}%` }} // Scale factor
                                />
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-500">
                            Trend: {data.deformation.trendMmYr > 0 ? '+' : ''}{data.deformation.trendMmYr.toFixed(1)} mm/yr
                        </div>
                    </div>
                </div>

                {/* 3. SEISMIC HEALTH */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-400" />
                        Seismic Response
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-400">PGA</div>
                                <div className="text-lg font-bold text-white">{data.seismic.pga.toFixed(3)}g</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-400">Stiffness</div>
                                <div className={`text-lg font-bold ${data.seismic.freqShift < -5 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {data.seismic.freqShift.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div className="p-2 border border-slate-700 rounded text-center text-[10px] text-slate-500 italic">
                            Natural Freq Analysis Active
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
