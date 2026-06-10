import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface ValueLeak {
    assetId: string;
    assetName: string;
    source: string;
    baselineLoss: number;
    recoveredValue: number;
    remainingLeak: number;
    currentCompensation: number;
}

interface ValueGuardProps {
    leaks?: ValueLeak[];
}

export const ValueGuard: React.FC<ValueGuardProps> = ({ leaks = [] }) => {
    const totalLoss = leaks.reduce((sum, l) => sum + l.baselineLoss, 0);
    const totalRecovered = leaks.reduce((sum, l) => sum + l.recoveredValue, 0);
    const totalLeaking = leaks.reduce((sum, l) => sum + l.remainingLeak, 0);
    const compensationRate = totalLoss > 0 ? (totalRecovered / totalLoss) * 100 : 0;

    return (
        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <div className="text-sm font-mono font-bold uppercase tracking-widest text-amber-300">
                        Value Guard
                    </div>
                    <div className="text-xs text-amber-500/70 font-mono">
                        Economic Leak Tracking & Recovery
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-950/50 border border-red-500/30 rounded p-3">
                    <div className="text-xs text-red-400 font-mono mb-1">Total Baseline Loss</div>
                    <div className="text-2xl font-bold font-mono text-red-300">
                        €{(totalLoss / 1000).toFixed(0)}k
                    </div>
                    <div className="text-[10px] text-red-500/70 font-mono">per year</div>
                </div>

                <div className="bg-emerald-950/50 border border-emerald-500/30 rounded p-3">
                    <div className="text-xs text-emerald-400 font-mono mb-1">Software Recovered</div>
                    <div className="text-2xl font-bold font-mono text-emerald-300">
                        €{(totalRecovered / 1000).toFixed(0)}k
                    </div>
                    <div className="text-[10px] text-emerald-500/70 font-mono">
                        {compensationRate.toFixed(0)}% compensation
                    </div>
                </div>

                <div className="bg-amber-950/50 border border-amber-500/30 rounded p-3">
                    <div className="text-xs text-amber-400 font-mono mb-1">Still Leaking</div>
                    <div className="text-2xl font-bold font-mono text-amber-300">
                        €{(totalLeaking / 1000).toFixed(0)}k
                    </div>
                    <div className="text-[10px] text-amber-500/70 font-mono">per year</div>
                </div>
            </div>

            {/* Individual Leaks */}
            <div className="space-y-3">
                {leaks.map((leak) => {
                    const Icon = leak.currentCompensation > 50 ? TrendingUp : TrendingDown;
                    const statusColor = leak.currentCompensation > 70 ? 'emerald' :
                        leak.currentCompensation > 30 ? 'amber' : 'red';

                    return (
                        <div
                            key={leak.assetId}
                            className={`bg-slate-800/50 border border-${statusColor}-500/20 rounded p-3`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="text-xs font-bold text-white font-mono">
                                        {leak.assetId}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                        {leak.source}
                                    </div>
                                </div>
                                <Icon className={`w-4 h-4 text-${statusColor}-400`} />
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`absolute inset-y-0 left-0 bg-${statusColor}-500 transition-all`}
                                    style={{ width: `${leak.currentCompensation}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                                <div>
                                    <span className="text-red-400">Loss: €{(leak.baselineLoss / 1000).toFixed(0)}k</span>
                                </div>
                                <div>
                                    <span className="text-emerald-400">Recovered: €{(leak.recoveredValue / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-${statusColor}-400`}>
                                        {leak.currentCompensation.toFixed(0)}% compensated
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400 font-mono text-center">
                Software ROI: {totalRecovered > 0 ? `€${totalRecovered.toLocaleString()}/year recovered` : 'Calculating...'}
            </div>
        </div>
    );
};
