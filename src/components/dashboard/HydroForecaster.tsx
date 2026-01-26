import React from 'react';
import { CloudRain, TrendingUp, AlertTriangle } from 'lucide-react';

interface HydroForecast {
    timestamp: number;
    predictedInflow: number; // m³/s
    actualInflow?: number; // m³/s (if available)
    confidence: number; // 0-100%
}

interface HydroForecasterProps {
    forecasts: HydroForecast[];
    currentReservoirLevel: number; // meters
    reservoirCapacity: number; // m³
    upstreamStations: {
        name: string;
        distance: number; // km upstream
        currentFlow: number; // m³/s
        rainIntensity: number; // mm/h
    }[];
}

export const HydroForecaster: React.FC<HydroForecasterProps> = ({
    forecasts,
    currentReservoirLevel,
    reservoirCapacity,
    upstreamStations
}) => {
    const next24h = forecasts.filter(f => f.timestamp <= Date.now() + 24 * 60 * 60 * 1000);
    const peakInflow = Math.max(...next24h.map(f => f.predictedInflow));
    const avgInflow = next24h.reduce((sum, f) => sum + f.predictedInflow, 0) / next24h.length;

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CloudRain className="w-6 h-6 text-blue-400" />
                Hydrological Intelligence
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left: Current Status */}
                <div className="space-y-4">
                    <div className="bg-slate-900 border border-blue-500 rounded-lg p-4">
                        <div className="text-xs text-blue-400 font-bold mb-3">Reservoir Status</div>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-slate-400 mb-1">Current Level</div>
                                <div className="text-3xl font-bold text-blue-300 font-mono">
                                    {currentReservoirLevel.toFixed(1)}m
                                </div>
                            </div>
                            <div className="relative h-40 bg-slate-800 rounded border border-slate-700 overflow-hidden">
                                {/* Water level visualization */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                                    style={{ height: `${(currentReservoirLevel / 100) * 100}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-white drop-shadow-lg">
                                    {((currentReservoirLevel / 100) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                        <div className="text-xs text-slate-400 font-bold mb-3">24h Forecast Summary</div>
                        <div className="space-y-2">
                            <ForecastMetric label="Peak Inflow" value={`${peakInflow.toFixed(0)} m³/s`} />
                            <ForecastMetric label="Avg Inflow" value={`${avgInflow.toFixed(0)} m³/s`} />
                            <ForecastMetric label="Trend" value="RISING" color="amber" />
                        </div>
                    </div>
                </div>

                {/* Center: Timeline Chart */}
                <div className="col-span-2">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-full">
                        <div className="text-xs text-slate-400 font-bold mb-4">Water Arrival Timeline (Next 24h)</div>

                        <div className="relative h-64 bg-slate-800 rounded p-4">
                            {/* Simple bar chart */}
                            <div className="flex items-end justify-between h-full gap-1">
                                {next24h.slice(0, 24).map((forecast, i) => {
                                    const barHeight = (forecast.predictedInflow / peakInflow) * 100;
                                    const hour = new Date(forecast.timestamp).getHours();

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                            {/* Actual inflow (if available) */}
                                            {forecast.actualInflow && (
                                                <div
                                                    className="w-full bg-emerald-500/50 rounded-t"
                                                    style={{ height: `${(forecast.actualInflow / peakInflow) * 100}%` }}
                                                />
                                            )}
                                            {/* Predicted inflow */}
                                            <div
                                                className={`w-full ${forecast.actualInflow ? 'bg-blue-500/50' : 'bg-blue-500'} rounded-t transition-all hover:bg-blue-400`}
                                                style={{ height: `${barHeight}%` }}
                                                title={`${hour}:00 - ${forecast.predictedInflow.toFixed(0)} m³/s (${forecast.confidence}% confidence)`}
                                            />
                                            {i % 3 === 0 && (
                                                <div className="text-[10px] text-slate-500 mt-1">{hour}h</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-4 mt-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded" />
                                    <span className="text-slate-400">Predicted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500/50 rounded" />
                                    <span className="text-slate-400">Actual</span>
                                </div>
                            </div>
                        </div>

                        {/* Upstream Stations */}
                        <div className="mt-4 space-y-2">
                            <div className="text-xs text-slate-400 font-bold mb-2">Upstream Sensors</div>
                            <div className="grid grid-cols-2 gap-2">
                                {upstreamStations.map((station, i) => (
                                    <div key={i} className="bg-slate-800 rounded p-2 border border-slate-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs font-bold text-slate-300">{station.name}</div>
                                            <CloudRain className={`w-3 h-3 ${station.rainIntensity > 5 ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div>
                                                <div className="text-slate-500">Flow</div>
                                                <div className="text-blue-300 font-mono">{station.currentFlow} m³/s</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Rain</div>
                                                <div className="text-blue-300 font-mono">{station.rainIntensity} mm/h</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ForecastMetric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'blue' }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-sm font-mono font-bold text-${color}-300`}>{value}</div>
        </div>
    );
};
