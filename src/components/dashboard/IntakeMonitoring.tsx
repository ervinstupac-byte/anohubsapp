import React from 'react';
import { Droplets, AlertTriangle, Activity } from 'lucide-react';

interface IntakeMonitoringProps {
    intakeData: {
        trashRackDP: number; // Differential pressure in bar
        waterLevel: number; // meters
        flowRate: number; // m³/s
        temperature: number; // °C
        turbidity: number; // NTU
        dissolvedOxygen: number; // mg/L
    };
    cleaningRequired: boolean;
    lastCleaning: number; // timestamp
}

export const IntakeMonitoring: React.FC<IntakeMonitoringProps> = ({ intakeData, cleaningRequired, lastCleaning }) => {
    const dpThreshold = 0.5; // bar
    const dpPercentage = (intakeData.trashRackDP / dpThreshold) * 100;
    const daysSinceCleaning = Math.floor((Date.now() - lastCleaning) / (1000 * 60 * 60 * 24));

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Droplets className="w-6 h-6 text-blue-400" />
                Intake & Trash Rack Monitoring
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Trash Rack ΔP */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${cleaningRequired ? 'border-amber-500' : 'border-emerald-500'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-xs text-slate-400">Trash Rack ΔP</div>
                            <div className={`text-3xl font-bold font-mono ${cleaningRequired ? 'text-amber-300' : 'text-emerald-300'
                                }`}>
                                {intakeData.trashRackDP.toFixed(3)}
                            </div>
                            <div className="text-xs text-slate-500">bar</div>
                        </div>
                        {cleaningRequired && (
                            <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div
                            className={`absolute inset-y-0 left-0 transition-all ${cleaningRequired ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                            style={{ width: `${Math.min(100, dpPercentage)}%` }}
                        />
                    </div>

                    <div className="text-xs text-slate-400">
                        Threshold: {dpThreshold} bar ({dpPercentage.toFixed(0)}% of limit)
                    </div>

                    {cleaningRequired && (
                        <div className="mt-3 p-2 bg-amber-950 border border-amber-500 rounded text-xs text-amber-300">
                            ⚠️ CLEANING REQUIRED
                        </div>
                    )}
                </div>

                {/* Water Quality */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-3 font-bold">Water Quality</div>
                    <div className="space-y-3">
                        <QualityMetric
                            label="Temperature"
                            value={`${intakeData.temperature.toFixed(1)}°C`}
                            status={intakeData.temperature > 25 ? 'warning' : 'normal'}
                        />
                        <QualityMetric
                            label="Dissolved O₂"
                            value={`${intakeData.dissolvedOxygen.toFixed(1)} mg/L`}
                            status={intakeData.dissolvedOxygen < 6 ? 'warning' : 'normal'}
                        />
                        <QualityMetric
                            label="Turbidity"
                            value={`${intakeData.turbidity.toFixed(0)} NTU`}
                            status={intakeData.turbidity > 50 ? 'warning' : 'normal'}
                        />
                    </div>
                </div>

                {/* Intake Status */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-3 font-bold">Intake Status</div>
                    <div className="space-y-3">
                        <StatusMetric
                            label="Water Level"
                            value={`${intakeData.waterLevel.toFixed(1)} m`}
                        />
                        <StatusMetric
                            label="Flow Rate"
                            value={`${intakeData.flowRate.toFixed(1)} m³/s`}
                        />
                        <StatusMetric
                            label="Last Cleaning"
                            value={`${daysSinceCleaning} days ago`}
                        />
                    </div>
                </div>
            </div>

            {/* P&ID Schematic */}
            <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-6">
                <div className="text-sm font-bold text-slate-300 mb-4">Intake P&ID Schematic</div>

                <div className="relative h-48 bg-slate-800 rounded p-4">
                    {/* Simplified intake schematic */}
                    <svg width="100%" height="100%" className="text-slate-400">
                        {/* Reservoir */}
                        <rect x="20" y="20" width="200" height="120" fill="#0ea5e9" fillOpacity="0.2" stroke="#0ea5e9" strokeWidth="2" />
                        <text x="120" y="85" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold">Reservoir</text>

                        {/* Trash Rack */}
                        <g>
                            <rect x="220" y="30" width="80" height="100" fill="none" stroke={cleaningRequired ? '#f59e0b' : '#10b981'} strokeWidth="3" />
                            {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={240 + i * 15} y1="30" x2={240 + i * 15} y2="130"
                                    stroke={cleaningRequired ? '#f59e0b' : '#10b981'} strokeWidth="2" />
                            ))}
                            <text x="260" y="155" textAnchor="middle" fill={cleaningRequired ? '#f59e0b' : '#10b981'} fontSize="12" fontWeight="bold">
                                Trash Rack
                            </text>
                        </g>

                        {/* ΔP Sensor */}
                        <circle cx="260" cy="50" r="15" fill="#7c3aed" stroke="#a78bfa" strokeWidth="2" />
                        <text x="260" y="55" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">ΔP</text>
                        <text x="260" y="25" textAnchor="middle" fill="#a78bfa" fontSize="10">
                            {intakeData.trashRackDP.toFixed(3)} bar
                        </text>

                        {/* Intake Pipe */}
                        <rect x="300" y="70" width="150" height="20" fill="#0284c7" stroke="#0ea5e9" strokeWidth="2" />
                        <text x="375" y="85" textAnchor="middle" fill="white" fontSize="12">→ Turbine</text>
                    </svg>
                </div>
            </div>
        </div>
    );
};

const QualityMetric: React.FC<{ label: string; value: string; status: 'normal' | 'warning' }> = ({ label, value, status }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-sm font-mono font-bold ${status === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {value}
            </div>
        </div>
    );
};

const StatusMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-sm font-mono font-bold text-blue-400">{value}</div>
        </div>
    );
};
