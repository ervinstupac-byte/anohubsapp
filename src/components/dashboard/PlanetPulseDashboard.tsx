import React from 'react';
import { Globe, Radio, Waves, Shield } from 'lucide-react';

interface PlanetPulseDashboardProps {
    seismic: {
        stressLevel: number; // 0-100
        earthquakeProbability: number; // %
        magnitude?: number;
    };
    solar: {
        kpIndex: number; // 0-9
        shieldActive: boolean;
        xrayClass: string;
    };
    atmospheric: {
        pressure: number; // hPa
        headAdjustment: number; // meters
    };
}

export const PlanetPulseDashboard: React.FC<PlanetPulseDashboardProps> = ({ seismic, solar, atmospheric }) => {
    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-400" />
                Planet Pulse - Gaia Awareness
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Seismic Status */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${seismic.earthquakeProbability > 50 ? 'border-red-500' :
                        seismic.stressLevel > 60 ? 'border-amber-500' :
                            'border-emerald-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Waves className="w-5 h-5 text-emerald-400" />
                        <div className="text-lg font-bold text-emerald-300">Seismic Stability</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Rock Stress Level</div>
                            <div className={`text-3xl font-bold font-mono ${seismic.stressLevel > 70 ? 'text-red-400' :
                                    seismic.stressLevel > 50 ? 'text-amber-400' :
                                        'text-emerald-400'
                                }`}>
                                {seismic.stressLevel.toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Earthquake Probability</div>
                            <div className="text-2xl font-bold text-amber-400">
                                {seismic.earthquakeProbability.toFixed(0)}%
                            </div>
                            {seismic.magnitude && (
                                <div className="text-xs text-slate-500 mt-1">
                                    Est. magnitude: M{seismic.magnitude.toFixed(1)}
                                </div>
                            )}
                        </div>

                        <div className={`p-2 rounded text-center text-xs font-bold ${seismic.earthquakeProbability > 50 ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                            }`}>
                            {seismic.earthquakeProbability > 50 ? '⚠️ ELEVATED RISK' : '✅ STABLE'}
                        </div>
                    </div>
                </div>

                {/* Solar Weather */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${solar.shieldActive ? 'border-orange-500' : 'border-blue-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Radio className="w-5 h-5 text-orange-400" />
                        <div className="text-lg font-bold text-orange-300">Solar Weather</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Geomagnetic Field (Kp)</div>
                            <div className={`text-3xl font-bold font-mono ${solar.kpIndex >= 6 ? 'text-red-400' :
                                    solar.kpIndex >= 4 ? 'text-amber-400' :
                                        'text-emerald-400'
                                }`}>
                                {solar.kpIndex}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {solar.kpIndex >= 6 ? 'STORM' :
                                    solar.kpIndex >= 4 ? 'ACTIVE' : 'QUIET'}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">X-Ray Class</div>
                            <div className="text-2xl font-bold text-purple-400">
                                {solar.xrayClass}
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-xs font-bold ${solar.shieldActive ? 'bg-orange-950 text-orange-300' : 'bg-blue-950 text-blue-300'
                            }`}>
                            {solar.shieldActive ? '🛡️ SHIELD ACTIVE' : '⏸️ MONITORING'}
                        </div>
                    </div>
                </div>

                {/* Atmospheric */}
                <div className="bg-slate-900 border-2 border-cyan-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Atmospheric</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Pressure</div>
                            <div className="text-3xl font-bold text-cyan-400 font-mono">
                                {atmospheric.pressure.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-500">hPa</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Head Adjustment</div>
                            <div className={`text-2xl font-bold font-mono ${atmospheric.headAdjustment > 0 ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                {atmospheric.headAdjustment > 0 ? '+' : ''}{atmospheric.headAdjustment.toFixed(2)}m
                            </div>
                        </div>

                        <div className="p-2 rounded bg-cyan-950 text-center text-xs font-bold text-cyan-300">
                            ✅ COMPENSATED
                        </div>
                    </div>
                </div>

                {/* Planetary Status */}
                <div className="col-span-3 bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-blue-300 mb-4">🌍 Planetary Integration Status</div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-slate-400 mb-1">ULF Sensors</div>
                            <div className="text-xl font-bold text-emerald-400">4 Active</div>
                            <div className="text-xs text-slate-500">72h earthquake window</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-slate-400 mb-1">Space Weather Link</div>
                            <div className="text-xl font-bold text-orange-400">NOAA/NASA Real-time</div>
                            <div className="text-xs text-slate-500">GIC auto-blocking enabled</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-slate-400 mb-1">Barometric Compensation</div>
                            <div className="text-xl font-bold text-cyan-400">±0.3m Range</div>
                            <div className="text-xs text-slate-500">Live efficiency adjustment</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gaia Philosophy */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-950 to-emerald-950 border border-blue-500 rounded-lg">
                <div className="text-sm font-bold text-blue-300">
                    🌍 GAIA LINK: From local machine to planetary-aware entity. Connected to Earth's seismic pulse, Sun's magnetic storms, and atmospheric rhythms.
                </div>
            </div>
        </div>
    );
};
