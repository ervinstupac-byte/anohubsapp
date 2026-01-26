import React from 'react';
import { Zap, Activity, Wind, TrendingUp } from 'lucide-react';

interface ResilienceDashboardProps {
    resonance: {
        powerRecovered: number; // W
        annualValue: number; // EUR/year
        rulImpact: number; // hours
    };
    harmonics: {
        thdReduction: number; // %
        powerSaved: number; // kW
        heatingReduction: number; // °C
    };
    injection: {
        active: boolean;
        cavitationReduction: number; // %
        coverage: number; // %
    };
}

export const ResilienceDashboard: React.FC<ResilienceDashboardProps> = ({ resonance, harmonics, injection }) => {
    const totalPowerSaved = harmonics.powerSaved + (resonance.powerRecovered / 1000);
    const annualValue = resonance.annualValue + (harmonics.powerSaved * 8760 * 0.07); // 70 EUR/MWh

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-400" />
                Resilience Matrix - Efficiency Leak Tracker
            </div>

            {/* Total Savings */}
            <div className="mb-6 p-6 rounded-lg border-2 bg-emerald-950 border-emerald-500">
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Total Parasitic Loss Recovery</div>
                    <div className="text-6xl font-bold text-emerald-300">
                        {totalPowerSaved.toFixed(1)} kW
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                        Annual value: €{annualValue.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Resonance Harvesting */}
                <div className="bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <div className="text-lg font-bold text-purple-300">Resonance Harvesting</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Power Recovered</div>
                            <div className="text-3xl font-bold text-purple-300 font-mono">
                                {resonance.powerRecovered.toFixed(0)} W
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Annual Value</div>
                            <div className="text-xl font-bold text-emerald-400 font-mono">
                                €{resonance.annualValue.toFixed(0)}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Bearing RUL Gain</div>
                            <div className="text-xl font-bold text-cyan-400 font-mono">
                                +{resonance.rulImpact.toFixed(0)} hrs
                            </div>
                        </div>

                        <div className="p-2 rounded bg-purple-950 text-center text-xs text-purple-300">
                            8 piezo sensors active
                        </div>
                    </div>
                </div>

                {/* Harmonic Shaping */}
                <div className="bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <div className="text-lg font-bold text-blue-300">Harmonic Shaping</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">THD Reduction</div>
                            <div className="text-3xl font-bold text-blue-300 font-mono">
                                -{harmonics.thdReduction.toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Power Loss Saved</div>
                            <div className="text-xl font-bold text-emerald-400 font-mono">
                                {harmonics.powerSaved.toFixed(1)} kW
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Stator Cooling</div>
                            <div className="text-xl font-bold text-cyan-400 font-mono">
                                -{harmonics.heatingReduction.toFixed(1)}°C
                            </div>
                        </div>

                        <div className="p-2 rounded bg-blue-950 text-center text-xs text-blue-300">
                            Counter-harmonics active
                        </div>
                    </div>
                </div>

                {/* Micro-Injection */}
                <div className="bg-slate-900 border border-cyan-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Wind className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Micro-Injection Shield</div>
                    </div>

                    <div className="space-y-3">
                        <div className={`p-4 rounded ${injection.active ? 'bg-emerald-950' : 'bg-slate-800'
                            }`}>
                            <div className="text-center">
                                <div className="text-xs text-slate-400 mb-1">Status</div>
                                <div className={`text-2xl font-bold ${injection.active ? 'text-emerald-300' : 'text-slate-500'
                                    }`}>
                                    {injection.active ? '✅ ACTIVE' : '⏸️ STANDBY'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Cavitation Reduction</div>
                            <div className="text-xl font-bold text-cyan-400 font-mono">
                                {injection.cavitationReduction.toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Blade Coverage</div>
                            <div className="text-xl font-bold text-blue-400 font-mono">
                                {injection.coverage.toFixed(0)}%
                            </div>
                            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                                <div
                                    className="absolute inset-y-0 left-0 bg-cyan-500"
                                    style={{ width: `${injection.coverage}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-2 rounded bg-cyan-950 text-center text-xs text-cyan-300">
                            12 injection valves
                        </div>
                    </div>
                </div>

                {/* Cumulative Benefits */}
                <div className="col-span-3 bg-slate-900 border border-emerald-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-emerald-300 mb-4">Cumulative Efficiency Gains</div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-800 rounded p-3 text-center">
                            <div className="text-xs text-slate-400 mb-1">Power Recovered</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                {totalPowerSaved.toFixed(1)} kW
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3 text-center">
                            <div className="text-xs text-slate-400 mb-1">Annual Revenue</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                €{annualValue.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3 text-center">
                            <div className="text-xs text-slate-400 mb-1">RUL Extension</div>
                            <div className="text-2xl font-bold text-cyan-400">
                                +{resonance.rulImpact.toFixed(0)} hrs
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3 text-center">
                            <div className="text-xs text-slate-400 mb-1">Systems Active</div>
                            <div className="text-2xl font-bold text-purple-400">
                                3/3
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-500 rounded">
                        <div className="text-xs font-bold text-emerald-300">
                            ♻️ Zero-Loss Philosophy: Every watt of parasitic loss converted to useful energy or longevity
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
