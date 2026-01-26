import React from 'react';
import { Home, Droplets, TrendingDown, AlertTriangle } from 'lucide-react';

interface CivilIntegrityProps {
    damData: {
        waterLevel: number; // meters above foundation
        maxWaterLevel: number; // meters
        piezometers: Array<{
            id: string;
            location: string;
            pressure: number; // bar
            elevation: number; // m
        }>;
        seepageRate: number; // L/s
        maxSeepageRate: number; // L/s
        pendulums: Array<{
            id: string;
            location: string;
            displacement: number; // mm
            direction: string; // downstream/upstream
            threshold: number; // mm
        }>;
        temperature: number; // °C (concrete temp)
    };
    safetyFactor: number;
    structuralHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WARNING' | 'CRITICAL';
}

export const CivilIntegrityDashboard: React.FC<CivilIntegrityProps> = ({ damData, safetyFactor, structuralHealth }) => {
    const waterLevelPct = (damData.waterLevel / damData.maxWaterLevel) * 100;
    const seepagePct = (damData.seepageRate / damData.maxSeepageRate) * 100;
    const criticalDisplacements = damData.pendulums.filter(p => p.displacement > p.threshold);

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Home className="w-6 h-6 text-slate-400" />
                Civil Integrity & Dam Monitoring
            </div>

            {/* Structural Health Alert */}
            {structuralHealth !== 'EXCELLENT' && structuralHealth !== 'GOOD' && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${structuralHealth === 'CRITICAL' ? 'bg-red-950 border-red-500' :
                        structuralHealth === 'WARNING' ? 'bg-amber-950 border-amber-500' :
                            'bg-blue-950 border-blue-500'
                    }`}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-6 h-6 ${structuralHealth === 'CRITICAL' ? 'text-red-400 animate-pulse' : 'text-amber-400'
                            }`} />
                        <div className="text-lg font-bold">
                            {structuralHealth === 'CRITICAL' ? '🚨 CRITICAL STRUCTURAL ALERT' :
                                structuralHealth === 'WARNING' ? '⚠️ STRUCTURAL WARNING' :
                                    'ℹ️ MONITORING REQUIRED'}
                        </div>
                    </div>
                </div>
            )}

            {/* Safety Factor */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${safetyFactor >= 1.5 ? 'bg-emerald-950 border-emerald-500' :
                    safetyFactor >= 1.2 ? 'bg-amber-950 border-amber-500' :
                        'bg-red-950 border-red-500'
                }`}>
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Dam Safety Factor (FS)</div>
                    <div className={`text-6xl font-bold font-mono ${safetyFactor >= 1.5 ? 'text-emerald-300' :
                            safetyFactor >= 1.2 ? 'text-amber-300' :
                                'text-red-300'
                        }`}>
                        {safetyFactor.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        Required: FS ≥ 1.5 (Excellent), FS ≥ 1.2 (Acceptable)
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Reservoir Status */}
                <div className="bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <div className="text-lg font-bold text-blue-300">Reservoir Level</div>
                    </div>

                    <div className="mb-4">
                        <div className="text-xs text-slate-400 mb-2">Water Level</div>
                        <div className="text-4xl font-bold text-blue-300 font-mono mb-1">
                            {damData.waterLevel.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">
                            meters above foundation ({waterLevelPct.toFixed(0)}% of max)
                        </div>
                    </div>

                    {/* Water level gauge */}
                    <div className="relative h-48 bg-slate-800 rounded border border-slate-700 overflow-hidden">
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                            style={{ height: `${waterLevelPct}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-2xl font-bold text-white drop-shadow-lg">
                                {waterLevelPct.toFixed(0)}%
                            </div>
                        </div>
                        {/* Max level line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />
                        <div className="absolute top-1 right-2 text-xs text-red-400">
                            Max: {damData.maxWaterLevel.toFixed(0)}m
                        </div>
                    </div>
                </div>

                {/* Seepage Monitoring */}
                <div className="bg-slate-900 border border-cyan-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Seepage Rate (Q<sub>seep</sub>)</div>
                    </div>

                    <div className="mb-4">
                        <div className="text-xs text-slate-400 mb-2">Current Flow</div>
                        <div className={`text-4xl font-bold font-mono mb-1 ${seepagePct > 80 ? 'text-red-400' :
                                seepagePct > 60 ? 'text-amber-400' : 'text-cyan-300'
                            }`}>
                            {damData.seepageRate.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">
                            L/s ({seepagePct.toFixed(0)}% of threshold)
                        </div>
                    </div>

                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div
                            className={`absolute inset-y-0 left-0 transition-all ${seepagePct > 80 ? 'bg-red-500' :
                                    seepagePct > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                                }`}
                            style={{ width: `${Math.min(100, seepagePct)}%` }}
                        />
                    </div>

                    {seepagePct > 80 && (
                        <div className="p-2 bg-red-950 border border-red-500 rounded text-xs text-red-300">
                            ⚠️ Excessive seepage - inspection required
                        </div>
                    )}
                </div>

                {/* Piezometers */}
                <div className="col-span-2 bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-purple-300 mb-4">Piezometric Pressures</div>

                    <div className="grid grid-cols-4 gap-3">
                        {damData.piezometers.map((piezo) => (
                            <div key={piezo.id} className="bg-slate-800 rounded p-3">
                                <div className="text-xs text-slate-400 mb-1">{piezo.id}</div>
                                <div className="text-xs text-slate-500 mb-2">{piezo.location}</div>
                                <div className="text-2xl font-bold text-purple-300 font-mono">
                                    {piezo.pressure.toFixed(2)}
                                </div>
                                <div className="text-xs text-slate-500">bar</div>
                                <div className="text-xs text-slate-600 mt-1">
                                    @ {piezo.elevation.toFixed(0)}m
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pendulum Displacements */}
                <div className="col-span-2 bg-slate-900 border border-orange-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-orange-300 mb-4">Pendulum Displacements</div>

                    {criticalDisplacements.length > 0 && (
                        <div className="mb-3 p-2 bg-red-950 border border-red-500 rounded text-xs text-red-300">
                            ⚠️ {criticalDisplacements.length} pendulum(s) exceed threshold
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        {damData.pendulums.map((pend) => {
                            const exceedsThreshold = pend.displacement > pend.threshold;
                            const pct = (pend.displacement / pend.threshold) * 100;

                            return (
                                <div
                                    key={pend.id}
                                    className={`bg-slate-800 rounded p-3 border-2 ${exceedsThreshold ? 'border-red-500' : 'border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-xs font-bold text-white">{pend.id}</div>
                                        {exceedsThreshold && (
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">{pend.location}</div>

                                    <div className={`text-3xl font-bold font-mono mb-1 ${exceedsThreshold ? 'text-red-400' : 'text-orange-300'
                                        }`}>
                                        {pend.displacement.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        mm {pend.direction}
                                    </div>

                                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 ${exceedsThreshold ? 'bg-red-500' : 'bg-orange-500'
                                                }`}
                                            style={{ width: `${Math.min(100, pct)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1">
                                        Threshold: {pend.threshold} mm
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Concrete Temperature */}
                <div className="col-span-2 bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Concrete Temperature</div>
                            <div className="text-2xl font-bold text-slate-300 font-mono">
                                {damData.temperature.toFixed(1)}°C
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Health Status</div>
                            <div className={`text-lg font-bold ${structuralHealth === 'EXCELLENT' || structuralHealth === 'GOOD' ? 'text-emerald-400' :
                                    structuralHealth === 'FAIR' ? 'text-blue-400' :
                                        structuralHealth === 'WARNING' ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {structuralHealth}
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Last Inspection</div>
                            <div className="text-sm text-slate-300 font-mono">
                                30 days ago
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
