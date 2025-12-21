import React from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { MultiSensorCorrelation } from './MultiSensorCorrelation.tsx';
import { RULEstimator } from './RULEstimator.tsx';
import { IncidentGhostSimulator } from './IncidentGhostSimulator.tsx';
import { PrescriptiveRecommendations } from './PrescriptiveRecommendations.tsx';
import { AutonomousWorkOrderStatus } from './AutonomousWorkOrderStatus.tsx';
import { useAIPrediction } from '../contexts/AIPredictionContext.tsx';

export const AIPredictiveModule: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { isEvaluating } = useAIPrediction();

    if (!selectedAsset) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard className="bg-gradient-to-r from-purple-950/40 via-cyan-950/40 to-pink-950/40 border-2 border-cyan-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">
                            <span className="text-white">AI Predictive</span>{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                                Engine
                            </span>
                        </h2>
                        <p className="text-sm text-slate-400 font-light">
                            Multivarijantna analiza podataka sa autonomnim pokretanjem radnih naloga
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isEvaluating ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                    AI Evaluating...
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                    AI Active
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info badges */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="p-2 bg-slate-900/50 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Spider Logic</p>
                        <p className="text-xs text-cyan-400 font-black">🕷️ 3-Sensor</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">RUL Estimator</p>
                        <p className="text-xs text-purple-400 font-black">⏱️ 4 Comp.</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Incident Ghost</p>
                        <p className="text-xs text-amber-400 font-black">👻 Pattern</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Prescriptive AI</p>
                        <p className="text-xs text-pink-400 font-black">💊 Actions</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Auto WO</p>
                        <p className="text-xs text-red-400 font-black">🤖 @95%</p>
                    </div>
                </div>
            </GlassCard>

            {/* Autonomous Work Orders - Shown first if any exist */}
            <AutonomousWorkOrderStatus />

            {/* Multi-Sensor Correlation (Spider Logic) */}
            <MultiSensorCorrelation />

            {/* RUL Estimator */}
            <RULEstimator />

            {/* Incident Ghost Simulator */}
            <IncidentGhostSimulator />

            {/* Prescriptive Recommendations */}
            <PrescriptiveRecommendations />
        </div>
    );
};
