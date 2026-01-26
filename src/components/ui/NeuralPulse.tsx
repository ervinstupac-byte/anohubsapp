import React from 'react';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';

interface NeuralPulseProps {
    color?: 'cyan' | 'emerald' | 'blue' | 'purple' | 'slate' | 'indigo' | 'amber' | 'red' | 'white';
}

export const NeuralPulse: React.FC<NeuralPulseProps> = ({ color = 'cyan' }) => {
    const { patternWeights, hiveStatus } = useContextAwareness();

    // Calculate overall learning progress
    const weights = patternWeights || {};
    const totalWeight = Object.values(weights).reduce((sum: number, w: number) => sum + w, 0);
    const avgWeight = Object.keys(weights).length > 0 ? totalWeight / Object.keys(weights).length : 1.0;
    const progress = Math.min(Math.round((avgWeight - 1.0) * 100), 100);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-12 bg-slate-950/95 backdrop-blur-sm border-t border-cyan-900/20 z-40">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left: Sentinel Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${color === 'emerald' ? 'bg-emerald-500' :
                            color === 'blue' ? 'bg-blue-500' :
                                color === 'purple' ? 'bg-purple-500' :
                                    color === 'slate' ? 'bg-slate-500' :
                                        color === 'indigo' ? 'bg-indigo-500' :
                                            color === 'amber' ? 'bg-amber-500' :
                                                color === 'red' ? 'bg-red-500' :
                                                    color === 'white' ? 'bg-white' :
                                                        'bg-cyan-500'
                            }`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${color === 'emerald' ? 'text-emerald-400' :
                            color === 'blue' ? 'text-blue-400' :
                                color === 'purple' ? 'text-purple-400' :
                                    color === 'slate' ? 'text-slate-400' :
                                        color === 'indigo' ? 'text-indigo-400' :
                                            color === 'amber' ? 'text-amber-400' :
                                                color === 'red' ? 'text-red-400' :
                                                    color === 'white' ? 'text-white' :
                                                        'text-cyan-400'
                            }`}>
                            Sentinel Neural Pulse
                        </span>
                    </div>

                    {/* Learning Progress Bar */}
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${Math.max(progress, 10)}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-white">
                            {progress}%
                        </span>
                    </div>
                </div>

                {/* Center: Pattern Weights (Top 3) */}
                <div className="flex items-center gap-3">
                    {Object.entries(weights)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([pattern, weight]) => (
                            <div key={pattern} className="flex items-center gap-1.5">
                                <div className="w-1 h-3 bg-cyan-500/30 rounded-full overflow-hidden">
                                    <div
                                        className="w-full bg-cyan-500"
                                        style={{ height: `${Math.min((weight as number) * 50, 100)}%` }}
                                    />
                                </div>
                                <span className="text-[8px] font-mono text-slate-400">
                                    {pattern.slice(0, 12)}
                                </span>
                            </div>
                        ))}
                </div>

                {/* Right: Hive Status */}
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${hiveStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[9px] font-mono text-slate-400">
                        HIVE {hiveStatus?.connected ? 'SYNC' : 'OFFLINE'}
                    </span>
                </div>
            </div>
        </div>
    );
};
