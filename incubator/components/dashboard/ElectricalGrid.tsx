import React from 'react';
import { Zap, Activity } from 'lucide-react';

interface ElectricalGridProps {
    generatorData: {
        activePower: number; // MW
        reactivePower: number; // MVAr
        voltage: number; // kV
        current: number; // A
        frequency: number; // Hz
        powerFactor: number;
    };
    breakerStatus: {
        generator: 'OPEN' | 'CLOSED';
        stepUp: 'OPEN' | 'CLOSED';
        grid: 'OPEN' | 'CLOSED';
    };
}

export const ElectricalGrid: React.FC<ElectricalGridProps> = ({ generatorData, breakerStatus }) => {
    return (
        <div className="w-full h-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                Electrical Single Line Diagram (SLD)
            </div>

            <div className="h-[calc(100%-3rem)] relative bg-slate-900 border border-slate-700 rounded-lg p-8">

                {/* Generator */}
                <div className="absolute left-20 top-1/2 transform -translate-y-1/2">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center border-4 border-yellow-500">
                        <div className="text-center">
                            <div className="text-2xl">⚡</div>
                            <div className="text-xs text-white font-bold mt-1">GEN</div>
                        </div>
                    </div>
                    <div className="mt-4 bg-slate-800 border border-yellow-500 rounded p-3">
                        <div className="text-xs font-bold text-yellow-300 mb-2">Generator Output</div>
                        <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">P:</span>
                                <span className="text-emerald-400 font-bold">{generatorData.activePower.toFixed(1)} MW</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">Q:</span>
                                <span className="text-blue-400">{generatorData.reactivePower.toFixed(1)} MVAr</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">V:</span>
                                <span className="text-yellow-400">{generatorData.voltage.toFixed(1)} kV</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">f:</span>
                                <span className={generatorData.frequency > 49.9 && generatorData.frequency < 50.1 ? 'text-emerald-400' : 'text-amber-400'}>
                                    {generatorData.frequency.toFixed(2)} Hz
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">PF:</span>
                                <span className="text-purple-400">{generatorData.powerFactor.toFixed(3)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bus Line from Generator */}
                <div className="absolute left-52 top-1/2 w-32 h-1 bg-yellow-500" />

                {/* Generator Breaker */}
                <Breaker
                    label="CB-GEN"
                    status={breakerStatus.generator}
                    position={{ left: 96, top: '50%' }}
                />

                {/* Step-Up Transformer */}
                <div className="absolute left-96 top-1/2 transform -translate-y-1/2">
                    <div className="w-24 h-32 border-4 border-blue-500 rounded flex flex-col items-center justify-center">
                        <div className="text-3xl">🔄</div>
                        <div className="text-xs text-blue-300 font-bold mt-1">TX</div>
                    </div>
                    <div className="text-xs text-center mt-2 text-slate-400 font-mono">Step-Up</div>
                    <div className="text-xs text-center text-blue-300 font-mono">13.8kV → 110kV</div>
                </div>

                {/* Bus Line to Step-Up */}
                <div className="absolute left-[28rem] top-1/2 w-32 h-1 bg-yellow-500" />

                {/* Step-Up Breaker */}
                <Breaker
                    label="CB-TX"
                    status={breakerStatus.stepUp}
                    position={{ left: 112, top: '50%' }}
                />

                {/* Bus Line to Grid */}
                <div className="absolute left-[36rem] top-1/2 w-40 h-1 bg-yellow-500" />

                {/* Grid Connection Breaker */}
                <Breaker
                    label="CB-GRID"
                    status={breakerStatus.grid}
                    position={{ left: 148, top: '50%' }}
                />

                {/* Grid Busbar */}
                <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                    <div className="w-32 h-48 bg-gradient-to-b from-red-900 to-red-950 border-4 border-red-500 rounded flex flex-col items-center justify-center">
                        <div className="text-4xl">⚡</div>
                        <div className="text-xs text-red-300 font-bold mt-2">GRID</div>
                        <div className="text-xs text-red-400 mt-1">110 kV</div>
                    </div>
                    <div className="mt-4 bg-slate-800 border border-red-500 rounded p-3">
                        <div className="text-xs font-bold text-red-300 mb-2">Grid Status</div>
                        <div className="text-xs text-emerald-400 font-mono">SYNCHRONIZED</div>
                    </div>
                </div>

                {/* Power Flow Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-slate-800 border border-emerald-500 rounded-full px-4 py-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-sm font-mono text-emerald-300">
                        Power Flow: {generatorData.activePower.toFixed(1)} MW → GRID
                    </span>
                </div>
            </div>
        </div>
    );
};

// Breaker Component
const Breaker: React.FC<{
    label: string;
    status: 'OPEN' | 'CLOSED';
    position: any;
}> = ({ label, status, position }) => {
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={position}
        >
            <div className={`w-16 h-16 rounded-full border-4 ${status === 'CLOSED' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
                } flex items-center justify-center`}>
                <div className="text-white font-bold text-lg">
                    {status === 'CLOSED' ? '⚡' : '⊗'}
                </div>
            </div>
            <div className={`text-xs text-center mt-2 font-mono font-bold ${status === 'CLOSED' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                {label}
            </div>
            <div className="text-[10px] text-center text-slate-400">
                {status}
            </div>
        </div>
    );
};
