import React from 'react';
import { useAIPrediction } from '../contexts/AIPredictionContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';

export const AutonomousWorkOrderStatus: React.FC = () => {
    const { autonomousOrders, acknowledgeWorkOrder } = useAIPrediction();

    if (autonomousOrders.length === 0) {
        return null; // Only show when there are autonomous orders
    }

    return (
        <GlassCard className="bg-gradient-to-br from-purple-950/30 to-pink-950/20 border-l-4 border-l-pink-500 animate-pulse">
            <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="text-lg">🤖</span> Autonomous Work Order System
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
                AI automatski generiše radne naloge pri vjerovatnoći kvara ≥95%
            </p>

            <div className="space-y-4">
                {autonomousOrders.map((order) => (
                    <div
                        key={order.id}
                        className="p-4 bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/30 rounded-xl"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl animate-bounce">🤖</span>
                                    <h4 className="text-sm font-black text-pink-300 uppercase tracking-tight">
                                        AUTONOMOUS WORK ORDER GENERATED
                                    </h4>
                                </div>
                                <div className="space-y-1 text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Work Order ID:</span>
                                        <span className="font-mono text-pink-400 font-bold">{order.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Asset:</span>
                                        <span className="font-bold text-white">{order.assetName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Component:</span>
                                        <span className="font-bold text-amber-400 uppercase">{order.component.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Trigger:</span>
                                        <span className="font-bold text-red-400">
                                            AI Prediction ({order.failureProbability.toFixed(0)}% failure probability)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <div className={`px-3 py-1.5 rounded-lg border ${order.status === 'AUTO_GENERATED'
                                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                                        : order.status === 'ACKNOWLEDGED'
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    }`}>
                                    <span className="text-[9px] font-black uppercase tracking-wider">
                                        {order.status === 'AUTO_GENERATED' ? '🟡 PENDING' :
                                            order.status === 'ACKNOWLEDGED' ? '🔵 ACKNOWLEDGED' :
                                                '🟢 IN PROGRESS'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reserved Parts */}
                        <div className="mb-3">
                            <h5 className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-2">
                                Reserved Parts:
                            </h5>
                            <div className="space-y-1.5">
                                {order.reservedParts.map((part, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-[10px]">
                                        <span className="text-emerald-400">✅</span>
                                        <span className="font-mono text-slate-300">{part}</span>
                                        <span className="text-[9px] text-emerald-400 font-bold">× 1</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Status */}
                        <div className="p-3 bg-slate-950/50 border border-white/5 rounded-lg mb-3">
                            <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-lg">📱</span>
                                <div className="flex-1">
                                    <p className="text-slate-300 font-bold">
                                        Notification sent to: <span className="text-cyan-400">{order.assignedEngineer || 'Engineering Team'}</span>
                                    </p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {order.status === 'AUTO_GENERATED' && (
                                <>
                                    <button
                                        onClick={() => acknowledgeWorkOrder(order.id)}
                                        className="flex-1 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded text-[9px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        ✓ ACKNOWLEDGE
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded text-[9px] font-black text-purple-400 hover:bg-purple-500 hover:text-white transition-all uppercase tracking-widest">
                                        👁️ VIEW DETAILS
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded text-[9px] font-black text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">
                                        🚨 ESCALATE
                                    </button>
                                </>
                            )}
                            {order.status === 'ACKNOWLEDGED' && (
                                <>
                                    <button className="flex-1 px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded text-[9px] font-black text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest">
                                        🔧 START INTERVENTION
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded text-[9px] font-black text-purple-400 hover:bg-purple-500 hover:text-white transition-all uppercase tracking-widest">
                                        📋 VIEW CHECKLIST
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Timeline indicator */}
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                <span>⏱️</span>
                                <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
                                <span className="text-red-400 font-bold animate-pulse ml-auto">
                                    URGENT - Component Failure Imminent
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-pink-950/20 border border-pink-500/20 rounded-lg">
                <p className="text-[9px] text-pink-300 font-bold uppercase tracking-wider">
                    📊 Active Autonomous Orders: {autonomousOrders.length}
                </p>
                <p className="text-[8px] text-slate-500 mt-1">
                    System automatically monitors failure probabilities and generates work orders when threshold exceeds 95%
                </p>
            </div>
        </GlassCard>
    );
};
