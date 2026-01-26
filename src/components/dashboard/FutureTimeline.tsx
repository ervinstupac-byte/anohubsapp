import React from 'react';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface FutureTimelineProps {
    predictions: {
        twoMin: {
            load: number;
            frequency: number;
            stability: 'STABLE' | 'WARNING' | 'CRITICAL';
        };
        fiveMin: {
            load: number;
            frequency: number;
            stability: 'STABLE' | 'WARNING' | 'CRITICAL';
        };
        tenMin: {
            load: number;
            frequency: number;
            stability: 'STABLE' | 'WARNING' | 'CRITICAL';
        };
    };
    monteCarlo: {
        breachProbability: number; // %
        preemptiveAction?: string;
    };
}

export const FutureTimeline: React.FC<FutureTimelineProps> = ({ predictions, monteCarlo }) => {
    const timePoints = [
        { label: '2 min', data: predictions.twoMin },
        { label: '5 min', data: predictions.fiveMin },
        { label: '10 min', data: predictions.tenMin }
    ];

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-cyan-400" />
                Future Timeline - Temporal Anticipation
            </div>

            {/* Monte Carlo Alert */}
            {monteCarlo.breachProbability > 50 && (
                <div className="mb-6 p-4 bg-red-950 border-2 border-red-500 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <div className="text-lg font-bold text-red-300">
                            Stability Breach Predicted ({monteCarlo.breachProbability.toFixed(0)}%)
                        </div>
                    </div>
                    {monteCarlo.preemptiveAction && (
                        <div className="text-sm text-slate-300">
                            Preemptive action: {monteCarlo.preemptiveAction}
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="grid grid-cols-3 gap-6">
                {timePoints.map((point, idx) => (
                    <div key={idx} className={`bg-slate-900 border-2 rounded-lg p-4 ${point.data.stability === 'CRITICAL' ? 'border-red-500' :
                            point.data.stability === 'WARNING' ? 'border-amber-500' :
                                'border-emerald-500'
                        }`}>
                        <div className="text-center mb-4">
                            <div className="text-sm text-slate-400">T + {point.label}</div>
                            <div className={`text-4xl font-bold ${point.data.stability === 'CRITICAL' ? 'text-red-300' :
                                    point.data.stability === 'WARNING' ? 'text-amber-300' :
                                        'text-emerald-300'
                                }`}>
                                {point.data.stability}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-800 rounded p-3">
                                <div className="text-xs text-slate-400 mb-1">Load</div>
                                <div className="text-2xl font-bold text-white font-mono">
                                    {point.data.load.toFixed(1)} MW
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded p-3">
                                <div className="text-xs text-slate-400 mb-1">Frequency</div>
                                <div className={`text-2xl font-bold font-mono ${Math.abs(point.data.frequency - 50) > 0.1 ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                    {point.data.frequency.toFixed(3)} Hz
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continuous Anticipation Status */}
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-950 to-purple-950 border border-cyan-500 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <div className="text-sm font-bold text-cyan-300">Continuous Anticipation Active</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-300">
                    <div>🔮 1000 Monte Carlo simulations/minute</div>
                    <div>📡 5 upstream sensors (15km coverage)</div>
                    <div>🧠 Neural controller: zero-spike mode</div>
                </div>
            </div>
        </div>
    );
};
