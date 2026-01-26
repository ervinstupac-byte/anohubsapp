import React from 'react';
import { CloudRain, Snowflake, Wind, Activity } from 'lucide-react';

interface AtmosData {
    inflow: {
        predictedM3s: number;
        lagHours: number;
        source: string;
    };
    snow: {
        sweMM: number;
        potentialMWh: number;
        meltRate: number;
    };
    weather: {
        pressure: number;
        bias: string;
        stormShift: number;
    };
}

export const AtmosView: React.FC<{ data: AtmosData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-900/30 rounded-full">
                    <CloudRain className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Atmos-Core Intelligence</h2>
                    <p className="text-xs text-slate-400">Meteorology • Hydrology • Snowpack</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. WATERSHED INFLOW */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Inflow Predictor
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Forecasted Q_in</div>
                            <div className="text-3xl font-bold font-mono text-emerald-300">
                                {data.inflow.predictedM3s.toFixed(1)} <span className="text-lg text-slate-500">m³/s</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Time of Conc.</span>
                            <span className="font-mono text-white">+{data.inflow.lagHours.toFixed(1)} hrs</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Driver</span>
                            <span className="font-bold text-sky-300">{data.inflow.source}</span>
                        </div>
                    </div>
                </div>

                {/* 2. SNOWPACK ENERGY */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-white" />
                        Frozen Reserve
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Snow Water Eq (SWE)</span>
                                <span className="font-mono text-white">{data.snow.sweMM} mm</span>
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-2xl font-bold text-sky-200">{data.snow.potentialMWh.toFixed(0)}</div>
                                <div className="text-[10px] text-slate-500">MWh Potential Stored</div>
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400">
                            Melt Rate: {data.snow.meltRate} mm/day
                        </div>
                    </div>
                </div>

                {/* 3. MESOSCALE WEATHER */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Wind className="w-4 h-4 text-indigo-400" />
                        Local Forecast
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Local Barometer</div>
                            <div className="text-2xl font-bold font-mono text-indigo-300">
                                {data.weather.pressure.toFixed(1)} <span className="text-xs text-slate-500">hPa</span>
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-xs font-bold border ${data.weather.stormShift < 0 ? 'bg-amber-950/30 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                            {data.weather.stormShift < 0
                                ? `⚠️ ACCELERATING (${data.weather.stormShift}h)`
                                : 'TIMING NOMINAL'}
                        </div>

                        <div className="text-center text-[10px] text-slate-500">
                            Model Bias: {data.weather.bias}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
