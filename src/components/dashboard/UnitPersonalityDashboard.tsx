import React from 'react';
import { Target, TrendingUp, Cpu, Activity } from 'lucide-react';

interface UnitPersonalityProps {
    unitId: string;
    type: 'FRANCIS' | 'KAPLAN' | 'PELTON';
    performance: {
        theoreticalEff: number;
        actualEff: number;
        gap: number;
    };
    tuning: {
        activeStrategies: string[]; // e.g. "Adaptive Cam", "Zone Avoidance"
        optimizationGain: number; // %
    };
}

export const UnitPersonalityDashboard: React.FC<UnitPersonalityProps> = ({ unitId, type, performance, tuning }) => {
    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-purple-400" />
                Unit Personality: {unitId}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Performance Gap */}
                <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <div className="text-lg font-bold text-slate-300">Performance Reality</div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Theoretical (Design)</span>
                                <span className="text-slate-300 font-mono">{performance.theoreticalEff.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${performance.theoreticalEff}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Actual (Real-time)</span>
                                <span className="text-emerald-300 font-mono">{performance.actualEff.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${performance.actualEff}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-3 bg-slate-800 rounded border border-slate-600">
                            <div className="text-xs text-slate-500 uppercase font-bold">Reality Gap</div>
                            <div className={`text-2xl font-black font-mono ${performance.gap > 2 ? 'text-red-400' : 'text-emerald-400'
                                }`}>
                                {performance.gap > 0 ? '-' : '+'}{Math.abs(performance.gap).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Adaptive Tuning Status */}
                <div className="bg-slate-900 border-2 border-purple-500 rounded-none p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <div className="text-lg font-bold text-purple-300">Adaptive Tuning</div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                            <div className="text-xs text-purple-300 uppercase font-bold mb-1">Optimization Gain</div>
                            <div className="text-3xl font-black text-purple-400 font-mono">
                                +{tuning.optimizationGain.toFixed(2)}%
                            </div>
                            <div className="text-xs text-slate-500 mt-1">vs Factory Default</div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-400 mb-2 uppercase font-bold">Active Strategies</div>
                            <div className="flex flex-wrap gap-2">
                                {tuning.activeStrategies.map((strat, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-800 text-cyan-400 text-xs rounded border border-cyan-900 font-mono">
                                        {strat}
                                    </span>
                                ))}
                                {tuning.activeStrategies.length === 0 && (
                                    <span className="text-slate-500 text-xs italic">None active</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Type-Specific Status */}
                <div className="col-span-2 bg-slate-900 border border-cyan-500 rounded-none p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <div className="text-sm font-bold text-cyan-300">Unit Specifics: {type}</div>
                    </div>

                    <div className="text-sm text-slate-300">
                        {type === 'KAPLAN' && (
                            <p>Using <b>Adaptive Combinator</b>. Learned 124 cam points. Next auto-calibration in 40h.</p>
                        )}
                        {type === 'PELTON' && (
                            <p><b>Nozzle Sequencer</b> Active. Current State: 4 Jets (Balanced X-Pattern). Needle deviation 1.2%.</p>
                        )}
                        {type === 'FRANCIS' && (
                            <p><b>Rough Zone Manager</b> Active. Avoidance Bands: 20-30 MW, 42-44 MW. Transition Speed: MAX.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
