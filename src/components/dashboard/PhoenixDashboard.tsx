import React from 'react';
import { Flame, Zap, CheckCircle, Users } from 'lucide-react';

interface PhoenixDashboardProps {
    blackStart: {
        status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETE';
        currentStep: number;
        totalSteps: number;
    };
    island: {
        active: boolean;
        sizeMW: number;
        frequency: number;
        voltage: number;
    };
    restoration: {
        loadsRestored: number;
        totalLoads: number;
        population: number; // people powered
        stabilityIndex: number; // 0-100
    };
}

export const PhoenixDashboard: React.FC<PhoenixDashboardProps> = ({ blackStart, island, restoration }) => {
    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                The Phoenix - Grid Resurrection Protocol
            </div>

            {/* Black Start Status */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${blackStart.status === 'COMPLETE' ? 'bg-emerald-950 border-emerald-500' :
                    blackStart.status === 'IN_PROGRESS' ? 'bg-blue-950 border-blue-500' :
                        'bg-slate-900 border-slate-700'
                }`}>
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Black Start Sequence</div>
                    <div className={`text-5xl font-bold ${blackStart.status === 'COMPLETE' ? 'text-emerald-300' :
                            blackStart.status === 'IN_PROGRESS' ? 'text-blue-300' :
                                'text-slate-500'
                        }`}>
                        {blackStart.status}
                    </div>
                    {blackStart.status === 'IN_PROGRESS' && (
                        <div className="mt-4">
                            <div className="text-sm text-slate-400 mb-2">
                                Step {blackStart.currentStep}/{blackStart.totalSteps}
                            </div>
                            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-blue-500 transition-all"
                                    style={{ width: `${(blackStart.currentStep / blackStart.totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Island Grid Status */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${island.active ? 'border-cyan-500' : 'border-slate-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Island Grid</div>
                    </div>

                    <div className="space-y-3">
                        <div className={`p-4 rounded text-center ${island.active ? 'bg-cyan-950' : 'bg-slate-800'
                            }`}>
                            <div className={`text-3xl font-bold ${island.active ? 'text-cyan-300' : 'text-slate-500'
                                }`}>
                                {island.active ? '🏝️ ACTIVE' : '⏸️ STANDBY'}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Island Size</div>
                            <div className="text-3xl font-bold text-emerald-300 font-mono">
                                {island.sizeMW} MW
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-800 rounded p-2">
                                <div className="text-xs text-slate-400">Frequency</div>
                                <div className="text-lg font-bold text-cyan-300 font-mono">
                                    {island.frequency.toFixed(2)} Hz
                                </div>
                            </div>
                            <div className="bg-slate-800 rounded p-2">
                                <div className="text-xs text-slate-400">Voltage</div>
                                <div className="text-lg font-bold text-purple-300 font-mono">
                                    {island.voltage} kV
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restoration Progress */}
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <div className="text-lg font-bold text-emerald-300">Restoration Progress</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-2">Loads Restored</div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-emerald-300">
                                    {restoration.loadsRestored}
                                </span>
                                <span className="text-sm text-slate-500">/ {restoration.totalLoads}</span>
                            </div>
                            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-emerald-500"
                                    style={{ width: `${(restoration.loadsRestored / restoration.totalLoads) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                <div className="text-xs text-slate-400">Population Powered</div>
                            </div>
                            <div className="text-2xl font-bold text-blue-300">
                                {restoration.population.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-2">Grid Stability Index</div>
                            <div className={`text-3xl font-bold font-mono ${restoration.stabilityIndex > 90 ? 'text-emerald-300' :
                                    restoration.stabilityIndex > 70 ? 'text-blue-300' :
                                        'text-amber-300'
                                }`}>
                                {restoration.stabilityIndex}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recovery Timeline */}
                <div className="col-span-2 bg-slate-900 border border-orange-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-orange-300 mb-4">🔥 Phoenix Rising Timeline</div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
                            <div className="w-32 text-slate-400">T+0 min</div>
                            <div className="flex-1">Black-start initiated (DC + H2)</div>
                            <div className="text-emerald-400">✓</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
                            <div className="w-32 text-slate-400">T+15 min</div>
                            <div className="flex-1">UNIT-1 synchronized to island</div>
                            <div className="text-emerald-400">✓</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
                            <div className="w-32 text-slate-400">T+30 min</div>
                            <div className="flex-1">Local hospital & critical loads</div>
                            <div className="text-blue-400">→</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
                            <div className="w-32 text-slate-400">T+2 hours</div>
                            <div className="flex-1">Regional grid restoration (500 MW)</div>
                            <div className="text-slate-500">○</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sovereignty Statement */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-950 to-red-950 border border-orange-500 rounded-lg">
                <div className="text-sm font-bold text-orange-300">
                    🔥 THE PHOENIX PROTOCOL: When the grid falls, we become the grid. Autonomous. Sovereign. Eternal.
                </div>
            </div>
        </div>
    );
};
