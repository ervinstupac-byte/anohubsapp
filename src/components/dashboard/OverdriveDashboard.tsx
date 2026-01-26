import React, { useState } from 'react';
import { Gauge, Flame, Droplets, AlertTriangle } from 'lucide-react';

interface OverdriveDashboardProps {
    thermal: {
        temperature: number; // °C
        limit: number; // °C
        margin: number; // °C
        overdriveAllowed: boolean;
    };
    cavitation: {
        detected: boolean;
        severity: 'NONE' | 'INCIPIENT' | 'MODERATE' | 'SEVERE';
        margin: number; // %
    };
    power: {
        current: number; // MW
        design: number; // MW (100%)
        overdrive: number; // MW (115%)
        physics: number; // MW (absolute max)
    };
}

export const OverdriveDashboard: React.FC<OverdriveDashboardProps> = ({ thermal, cavitation, power }) => {
    const [mode, setMode] = useState<'CONSERVATIVE' | 'OVERDRIVE'>('CONSERVATIVE');
    const [safetySlider, setSafetySlider] = useState(100); // 100 = design, 115 = overdrive

    const canOverdrive = thermal.overdriveAllowed && cavitation.severity === 'NONE';
    const maxSafeLoad = canOverdrive ? power.overdrive : power.design;

    const handleSliderChange = (value: number) => {
        setSafetySlider(value);
        setMode(value > 105 ? 'OVERDRIVE' : 'CONSERVATIVE');
    };

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-red-400" />
                Kinetic Overdrive Control
            </div>

            {/* Mode Indicator */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${mode === 'OVERDRIVE' ? 'bg-red-950 border-red-500' : 'bg-blue-950 border-blue-500'
                }`}>
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Operating Mode</div>
                    <div className={`text-6xl font-bold ${mode === 'OVERDRIVE' ? 'text-red-300' : 'text-blue-300'
                        }`}>
                        {mode}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                        {mode === 'OVERDRIVE' ? 'Physics-Limited Performance' : 'Design-Limited Performance'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Safety vs Performance Slider */}
                <div className="col-span-2 bg-slate-900 border border-purple-500 rounded-lg p-6">
                    <div className="text-lg font-bold text-purple-300 mb-4">Safety vs Performance Slider</div>

                    {!canOverdrive && (
                        <div className="mb-4 p-3 bg-amber-950 border border-amber-500 rounded">
                            <div className="flex items-center gap-2 text-amber-300 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                Overdrive unavailable: {!thermal.overdriveAllowed ? 'Thermal limit' : 'Cavitation risk'}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-400">← Conservative (Design Limits)</span>
                            <span className="text-red-400">Overdrive (Physics Limits) →</span>
                        </div>

                        <input
                            type="range"
                            min="80"
                            max="115"
                            value={safetySlider}
                            onChange={(e) => handleSliderChange(Number(e.target.value))}
                            disabled={!canOverdrive && safetySlider > 100}
                            className="w-full h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />

                        <div className="grid grid-cols-4 gap-2 text-xs text-slate-500">
                            <div className="text-center">80%</div>
                            <div className="text-center text-emerald-400 font-bold">100% (Design)</div>
                            <div className="text-center">110%</div>
                            <div className="text-center text-red-400 font-bold">115% (Max)</div>
                        </div>

                        {/* Current Target */}
                        <div className="mt-4 p-4 bg-slate-800 rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-slate-400">Target Load</div>
                                    <div className="text-3xl font-bold text-white font-mono">
                                        {((power.design * safetySlider) / 100).toFixed(1)} MW
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Load Factor</div>
                                    <div className={`text-3xl font-bold font-mono ${safetySlider > 105 ? 'text-red-400' : 'text-blue-400'
                                        }`}>
                                        {safetySlider}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thermal Status */}
                <div className="bg-slate-900 border border-orange-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <div className="text-lg font-bold text-orange-300">Thermal Status</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Peak Temperature</div>
                            <div className={`text-3xl font-bold font-mono ${thermal.temperature > thermal.limit * 0.9 ? 'text-red-400' :
                                    thermal.temperature > thermal.limit * 0.8 ? 'text-amber-400' :
                                        'text-emerald-400'
                                }`}>
                                {thermal.temperature.toFixed(1)}°C
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Thermal Margin</div>
                            <div className="text-xl font-bold text-cyan-300 font-mono">
                                {thermal.margin.toFixed(1)}°C
                            </div>
                            <div className="text-xs text-slate-500">
                                Limit: {thermal.limit}°C (Class F)
                            </div>
                        </div>

                        <div className={`p-3 rounded text-center font-bold ${thermal.overdriveAllowed ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                            }`}>
                            {thermal.overdriveAllowed ? '✅ OVERDRIVE OK' : '❌ THERMAL LIMIT'}
                        </div>
                    </div>
                </div>

                {/* Cavitation Status */}
                <div className="bg-slate-900 border border-cyan-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplets className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Cavitation Status</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Severity</div>
                            <div className={`text-2xl font-bold ${cavitation.severity === 'NONE' ? 'text-emerald-400' :
                                    cavitation.severity === 'INCIPIENT' ? 'text-blue-400' :
                                        cavitation.severity === 'MODERATE' ? 'text-amber-400' :
                                            'text-red-400'
                                }`}>
                                {cavitation.severity}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Acoustic Margin</div>
                            <div className="text-xl font-bold text-cyan-300 font-mono">
                                {cavitation.margin.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500">
                                Safety threshold: 5%
                            </div>
                        </div>

                        <div className={`p-3 rounded text-center font-bold ${cavitation.severity === 'NONE' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                            }`}>
                            {cavitation.severity === 'NONE' ? '✅ NO CAVITATION' : '⚠️ REDUCE LOAD'}
                        </div>
                    </div>
                </div>

                {/* Power Envelope */}
                <div className="col-span-2 bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-purple-300 mb-4">Power Envelope</div>

                    <div className="space-y-2">
                        {/* Design Load */}
                        <div className="flex items-center gap-2">
                            <div className="w-32 text-sm text-slate-400">Design (100%)</div>
                            <div className="flex-1 relative h-8 bg-slate-800 rounded">
                                <div
                                    className="absolute inset-y-0 left-0 bg-blue-500 rounded flex items-center justify-end pr-2"
                                    style={{ width: '100%' }}
                                >
                                    <span className="text-xs font-bold text-white">{power.design} MW</span>
                                </div>
                            </div>
                        </div>

                        {/* Current */}
                        <div className="flex items-center gap-2">
                            <div className="w-32 text-sm text-emerald-400 font-bold">Current</div>
                            <div className="flex-1 relative h-8 bg-slate-800 rounded">
                                <div
                                    className="absolute inset-y-0 left-0 bg-emerald-500 rounded flex items-center justify-end pr-2"
                                    style={{ width: `${(power.current / power.physics) * 100}%` }}
                                >
                                    <span className="text-xs font-bold text-white">{power.current} MW</span>
                                </div>
                            </div>
                        </div>

                        {/* Overdrive */}
                        <div className="flex items-center gap-2">
                            <div className="w-32 text-sm text-red-400 font-bold">Overdrive (115%)</div>
                            <div className="flex-1 relative h-8 bg-slate-800 rounded">
                                <div
                                    className="absolute inset-y-0 left-0 bg-red-500 rounded flex items-center justify-end pr-2"
                                    style={{ width: `${(power.overdrive / power.physics) * 100}%` }}
                                >
                                    <span className="text-xs font-bold text-white">{power.overdrive} MW</span>
                                </div>
                            </div>
                        </div>

                        {/* Physics Limit */}
                        <div className="flex items-center gap-2">
                            <div className="w-32 text-sm text-purple-400">Physics Limit</div>
                            <div className="flex-1 relative h-8 bg-slate-800 rounded border-2 border-purple-500">
                                <div className="absolute inset-0 flex items-center justify-end pr-2">
                                    <span className="text-xs font-bold text-purple-300">{power.physics} MW</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Footer */}
            {mode === 'OVERDRIVE' && (
                <div className="mt-6 p-4 bg-red-950 border border-red-500 rounded-lg">
                    <div className="text-sm font-bold text-red-300">⚠️ OVERDRIVE MODE ACTIVE</div>
                    <div className="text-xs text-slate-300 mt-1">
                        Operating beyond design limits. Continuous monitoring required. Extended operation may reduce component RUL.
                    </div>
                </div>
            )}
        </div>
    );
};
