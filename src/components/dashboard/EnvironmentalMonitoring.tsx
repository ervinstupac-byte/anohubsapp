import React from 'react';
import { Eye, Thermometer, Wind, Camera } from 'lucide-react';

interface EnvironmentalMonitoringProps {
    environmental: {
        waterTemperature: number; // °C
        dissolvedOxygen: number; // mg/L
        pH: number;
        conductivity: number; // μS/cm
        ambientTemperature: number; // °C
        humidity: number; // %
        windSpeed: number; // m/s
    };
    cctv: {
        enabled: boolean;
        activeFeeds: number;
        totalCameras: number;
        recordingStatus: 'ACTIVE' | 'PAUSED' | 'ERROR';
    };
}

export const EnvironmentalMonitoring: React.FC<EnvironmentalMonitoringProps> = ({ environmental, cctv }) => {
    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-cyan-400" />
                Environmental & Safety Monitoring
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Water Quality */}
                <div className="bg-slate-900 border border-cyan-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Thermometer className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Water Quality</div>
                    </div>

                    <div className="space-y-3">
                        <EnvMetric
                            label="Temperature"
                            value={environmental.waterTemperature.toFixed(1)}
                            unit="°C"
                            status={environmental.waterTemperature > 25 ? 'warning' : 'normal'}
                            optimal="18-22°C"
                        />
                        <EnvMetric
                            label="Dissolved O₂"
                            value={environmental.dissolvedOxygen.toFixed(1)}
                            unit="mg/L"
                            status={environmental.dissolvedOxygen < 6 ? 'warning' : 'normal'}
                            optimal=">7 mg/L"
                        />
                        <EnvMetric
                            label="pH Level"
                            value={environmental.pH.toFixed(1)}
                            unit=""
                            status={environmental.pH < 6.5 || environmental.pH > 8.5 ? 'warning' : 'normal'}
                            optimal="6.5-8.5"
                        />
                        <EnvMetric
                            label="Conductivity"
                            value={environmental.conductivity.toFixed(0)}
                            unit="μS/cm"
                            status="normal"
                            optimal="<500"
                        />
                    </div>

                    {/* Water Quality Gauge */}
                    <div className="mt-4 p-3 bg-slate-800 rounded">
                        <div className="text-xs text-slate-400 mb-2">Overall Water Quality</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '85%' }} />
                            </div>
                            <div className="text-sm font-bold text-emerald-400">85%</div>
                        </div>
                    </div>
                </div>

                {/* Ambient Conditions */}
                <div className="bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Wind className="w-5 h-5 text-blue-400" />
                        <div className="text-lg font-bold text-blue-300">Ambient Conditions</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Air Temperature</div>
                            <div className="text-3xl font-bold text-blue-300 font-mono">
                                {environmental.ambientTemperature.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">°C</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Humidity</div>
                            <div className="text-3xl font-bold text-cyan-300 font-mono">
                                {environmental.humidity.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">%</div>
                        </div>

                        <div className="col-span-2 bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Wind Speed</div>
                            <div className="text-3xl font-bold text-emerald-300 font-mono">
                                {environmental.windSpeed.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-500">m/s</div>
                        </div>
                    </div>

                    <div className="mt-4 p-2 bg-blue-950/30 border border-blue-500/30 rounded text-xs text-blue-300">
                        <div className="flex items-center justify-between">
                            <span>Weather conditions</span>
                            <span className="font-bold">FAVORABLE</span>
                        </div>
                    </div>
                </div>

                {/* CCTV Integration */}
                <div className={`col-span-2 bg-slate-900 border-2 rounded-lg p-4 ${cctv.enabled ? 'border-emerald-500' : 'border-red-500'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-purple-400" />
                            <div className="text-lg font-bold text-purple-300">CCTV Security System</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${cctv.enabled ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                            }`}>
                            {cctv.enabled ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Active Feeds</div>
                            <div className="text-2xl font-bold text-emerald-300 font-mono">
                                {cctv.activeFeeds}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Total Cameras</div>
                            <div className="text-2xl font-bold text-blue-300 font-mono">
                                {cctv.totalCameras}
                            </div>
                        </div>

                        <div className="col-span-2 bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Recording Status</div>
                            <div className={`text-lg font-bold ${cctv.recordingStatus === 'ACTIVE' ? 'text-emerald-300' :
                                    cctv.recordingStatus === 'PAUSED' ? 'text-amber-300' : 'text-red-300'
                                }`}>
                                {cctv.recordingStatus}
                            </div>
                        </div>
                    </div>

                    {/* Camera Grid Placeholder */}
                    <div className="grid grid-cols-4 gap-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-video bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                <div className="text-center">
                                    <Camera className={`w-6 h-6 mx-auto mb-1 ${i < cctv.activeFeeds ? 'text-emerald-400' : 'text-slate-600'
                                        }`} />
                                    <div className="text-xs text-slate-500">CAM {i + 1}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-xs text-slate-400 text-center">
                        CCTV feeds placeholder - click to expand live view
                    </div>
                </div>
            </div>
        </div>
    );
};

const EnvMetric: React.FC<{
    label: string;
    value: string;
    unit: string;
    status: 'normal' | 'warning';
    optimal: string;
}> = ({ label, value, unit, status, optimal }) => {
    return (
        <div className="bg-slate-800 rounded p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-400">{label}</div>
                <div className={`text-xs px-2 py-0.5 rounded ${status === 'normal' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                    {status === 'normal' ? '✓' : '⚠'}
                </div>
            </div>
            <div className={`text-2xl font-bold font-mono ${status === 'normal' ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                {value} {unit}
            </div>
            <div className="text-xs text-slate-500 mt-1">Optimal: {optimal}</div>
        </div>
    );
};
