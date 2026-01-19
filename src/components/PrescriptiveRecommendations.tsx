import React from 'react';
import { useAIPrediction } from '../contexts/AIPredictionContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';

export const PrescriptiveRecommendations: React.FC = () => {
    const { prescriptions, executeAction } = useAIPrediction();
    const { selectedAsset } = useAssetContext();

    if (!selectedAsset) return null;

    // Get prescriptions for selected asset
    const assetPrescriptions = Array.from(prescriptions.entries()).filter(([key]) =>
        key.startsWith(String(selectedAsset.id))
    );

    if (assetPrescriptions.length === 0) {
        return (
            <GlassCard className="bg-slate-900/40 border-l-4 border-l-emerald-500">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">
                    💊 Prescriptive Recommendations
                </h3>
                <p className="text-[10px] text-slate-500 mb-3">
                    AI-generirane preporuke za akciju
                </p>
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-center">
                    <p className="text-xs text-emerald-400 font-bold">✅ All Systems Operating Optimally</p>
                    <p className="text-[9px] text-slate-500 mt-1">No prescriptive actions required</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="bg-slate-900/40 border-l-4 border-l-amber-500">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
                💊 Prescriptive Recommendations
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
                AI ne samo dijagnostikuje - već kaže šta uraditi
            </p>

            <div className="space-y-4">
                {assetPrescriptions.map(([key, prescription]) => {
                    const isCritical = prescription.failureProbability >= 90;
                    const isHigh = prescription.failureProbability >= 70;

                    return (
                        <div
                            key={key}
                            className={`p-4 rounded-xl border ${isCritical
                                ? 'bg-red-950/30 border-red-500/30'
                                : isHigh
                                    ? 'bg-amber-950/30 border-amber-500/30'
                                    : 'bg-slate-950/30 border-slate-700/30'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">
                                            {isCritical ? '🔴' : isHigh ? '⚠️' : '🟡'}
                                        </span>
                                        <h4 className={`text-sm font-black uppercase tracking-tight ${isCritical ? 'text-red-300' : isHigh ? 'text-amber-300' : 'text-slate-300'
                                            }`}>
                                            {isCritical ? 'CRITICAL PREDICTION' : isHigh ? 'HIGH RISK' : 'MEDIUM RISK'}
                                        </h4>
                                    </div>
                                    <div className="space-y-0.5 text-[10px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Component:</span>
                                            <span className="font-bold text-white uppercase">{prescription.component.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Failure Probability:</span>
                                            <span className={`font-mono font-black ${isCritical ? 'text-red-400 animate-pulse' : isHigh ? 'text-amber-400' : 'text-yellow-400'
                                                }`}>
                                                {prescription.failureProbability.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className={`p-3 rounded-lg mb-3 ${isCritical ? 'bg-red-900/20' : isHigh ? 'bg-amber-900/20' : 'bg-slate-900/20'
                                }`}>
                                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                                    {prescription.message}
                                </p>
                            </div>

                            {/* Actions */}
                            {prescription.actions.length > 0 && (
                                <div className="space-y-3">
                                    {/* Immediate Actions */}
                                    {prescription.actions.filter(a => a.type === 'IMMEDIATE').length > 0 && (
                                        <div>
                                            <h5 className="text-[9px] text-red-400 font-black uppercase tracking-wider mb-2">
                                                IMMEDIATE ACTIONS:
                                            </h5>
                                            <div className="space-y-2">
                                                {prescription.actions
                                                    .filter(a => a.type === 'IMMEDIATE')
                                                    .map((action, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <span className="text-emerald-400 mt-0.5">✅</span>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-slate-300 font-medium mb-1">
                                                                    {action.action.replace(/_/g, ' ')}
                                                                    {action.value && ` by ${action.value}%`}
                                                                </p>
                                                                {action.executable && (
                                                                    <button
                                                                        onClick={() => executeAction(selectedAsset.id, action.action, action.value)}
                                                                        className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-[9px] font-black text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
                                                                    >
                                                                        EXECUTE NOW
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Scheduled Actions */}
                                    {prescription.actions.filter(a => a.type === 'SCHEDULED').length > 0 && (
                                        <div>
                                            <h5 className="text-[9px] text-amber-400 font-black uppercase tracking-wider mb-2">
                                                SCHEDULED ACTIONS:
                                            </h5>
                                            <div className="space-y-2">
                                                {prescription.actions
                                                    .filter(a => a.type === 'SCHEDULED')
                                                    .map((action, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <span className="text-amber-400 mt-0.5">📅</span>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-slate-300 font-medium mb-1">
                                                                    {action.action.replace(/_/g, ' ')} within {action.timeframe}
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-[9px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all uppercase tracking-widest">
                                                                        CREATE WORK ORDER
                                                                    </button>
                                                                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                                                        ✅ Parts In Stock
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Monitoring Actions */}
                                    {prescription.actions.filter(a => a.type === 'MONITORING').length > 0 && (
                                        <div>
                                            <h5 className="text-[9px] text-cyan-400 font-black uppercase tracking-wider mb-2">
                                                MONITORING:
                                            </h5>
                                            <div className="space-y-2">
                                                {prescription.actions
                                                    .filter(a => a.type === 'MONITORING')
                                                    .map((action, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <span className="text-cyan-400 mt-0.5">👁️</span>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-slate-300 font-medium">
                                                                    {action.action.replace(/_/g, ' ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};
