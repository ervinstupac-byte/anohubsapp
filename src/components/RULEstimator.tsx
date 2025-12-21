import React from 'react';
import { useAIPrediction } from '../contexts/AIPredictionContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';

export const RULEstimator: React.FC = () => {
    const { rulEstimates } = useAIPrediction();
    const { selectedAsset } = useAssetContext();

    if (!selectedAsset) return null;

    const estimates = rulEstimates[selectedAsset.id];
    if (!estimates || estimates.length === 0) return null;

    const getStatusColor = (remainingHours: number, criticalThreshold: number) => {
        const percentage = (remainingHours / criticalThreshold) * 100;
        if (percentage > 30) return 'text-emerald-400';
        if (percentage > 15) return 'text-amber-400';
        return 'text-red-400';
    };

    const getStatusIcon = (remainingHours: number, criticalThreshold: number) => {
        const percentage = (remainingHours / criticalThreshold) * 100;
        if (percentage > 30) return '✅';
        if (percentage > 15) return '⚠️';
        return '🔴';
    };

    const getStatusText = (remainingHours: number, criticalThreshold: number) => {
        const percentage = (remainingHours / criticalThreshold) * 100;
        if (percentage > 30) return 'GOOD';
        if (percentage > 15) return 'MONITOR';
        return 'REPLACE SOON';
    };

    return (
        <GlassCard className="bg-slate-900/40 border-l-4 border-l-purple-500">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">
                ⏱️ RUL Estimator (Remaining Useful Life)
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
                Procjena preostalog radnog vijeka sa stress faktorima
            </p>

            <div className="space-y-3">
                {estimates.map((estimate) => {
                    const failureProbability = estimate.remainingHours < estimate.criticalThreshold
                        ? Math.min(100, 100 - (estimate.remainingHours / estimate.criticalThreshold) * 100)
                        : 0;

                    return (
                        <div
                            key={estimate.componentId}
                            className="p-3 rounded-xl bg-slate-950/50 border border-white/5 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                                            {estimate.componentType.replace('_', ' ')}
                                        </span>
                                        <span className={`text-lg ${getStatusColor(estimate.remainingHours, estimate.criticalThreshold)}`}>
                                            {getStatusIcon(estimate.remainingHours, estimate.criticalThreshold)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="text-slate-500">RUL:</span>
                                        <span className={`font-mono font-black ${getStatusColor(estimate.remainingHours, estimate.criticalThreshold)}`}>
                                            {estimate.remainingHours.toFixed(0)}h
                                        </span>
                                        <span className="text-slate-600">|</span>
                                        <span className="text-slate-500">Confidence:</span>
                                        <span className="font-mono font-bold text-cyan-400">
                                            {(estimate.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[9px] font-black uppercase tracking-wider ${getStatusColor(estimate.remainingHours, estimate.criticalThreshold)}`}>
                                        {getStatusText(estimate.remainingHours, estimate.criticalThreshold)}
                                    </div>
                                    {failureProbability > 0 && (
                                        <div className="text-[10px] font-mono text-red-400 animate-pulse mt-1">
                                            {failureProbability.toFixed(0)}% Failure Risk
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-1000 ${estimate.remainingHours > estimate.criticalThreshold * 3 ? 'bg-emerald-500' :
                                            estimate.remainingHours > estimate.criticalThreshold * 1.5 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${Math.min(100, (estimate.remainingHours / (estimate.criticalThreshold * 10)) * 100)}%` }}
                                />
                            </div>

                            {/* Stress Factors - Expandable */}
                            <details className="group/details">
                                <summary className="text-[9px] text-slate-500 uppercase font-bold cursor-pointer hover:text-slate-400 transition-colors">
                                    Stress Factors ▼
                                </summary>
                                <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                    <div className="flex justify-between text-[9px]">
                                        <span className="text-slate-500">Sudden Starts:</span>
                                        <span className="font-mono text-slate-300">{estimate.stressFactors.suddenStarts}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px]">
                                        <span className="text-slate-500">Cavitation Hours:</span>
                                        <span className="font-mono text-amber-400">{estimate.stressFactors.cavitationHours.toFixed(1)}h</span>
                                    </div>
                                    <div className="flex justify-between text-[9px]">
                                        <span className="text-slate-500">Alignment Deviation:</span>
                                        <span className="font-mono text-cyan-400">{estimate.stressFactors.alignmentDeviation.toFixed(3)} mm</span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};
