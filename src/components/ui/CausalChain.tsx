import React from 'react';
import { RootCauseAnalysis, CausalEvent } from '../../utils/RootCauseEngine';
import { AlertTriangle, TrendingUp, Zap, XCircle } from 'lucide-react';

interface CausalChainProps {
    analysis: RootCauseAnalysis | null;
    className?: string;
}

export const CausalChain: React.FC<CausalChainProps> = ({ analysis, className = '' }) => {
    if (!analysis) {
        return (
            <div className={`tactical-module p-6 ${className}`}>
                <div className="text-center text-slate-500 text-sm">
                    No root cause analysis available
                </div>
            </div>
        );
    }

    const getEventIcon = (eventType: CausalEvent['eventType']) => {
        switch (eventType) {
            case 'deviation': return <TrendingUp className="w-4 h-4" />;
            case 'threshold_breach': return <AlertTriangle className="w-4 h-4" />;
            case 'cascade': return <Zap className="w-4 h-4" />;
            case 'trip': return <XCircle className="w-4 h-4" />;
        }
    };

    const getEventColor = (eventType: CausalEvent['eventType']) => {
        switch (eventType) {
            case 'deviation': return 'text-amber-400 border-amber-500/30';
            case 'threshold_breach': return 'text-red-400 border-red-500/30';
            case 'cascade': return 'text-purple-400 border-purple-500/30';
            case 'trip': return 'text-red-500 border-red-500/50';
        }
    };

    return (
        <div className={`tactical-module ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Root Cause Analysis
                </h3>
                <div className="mt-1 text-[9px] text-slate-400 font-mono">
                    Confidence: {analysis.confidence}%
                </div>
            </div>

            {/* Primary Aggressor */}
            <div className="p-4 border-b border-white/5 bg-red-950/10">
                <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mt-1" />
                    <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">
                            ⚡ PRIMARY AGGRESSOR
                        </div>
                        <div className="text-sm font-mono text-white mb-2">
                            {analysis.primaryAggressor.sensorId.replace('SENSOR-', '').replace(/_/g, ' ')}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                            <div>
                                <span className="text-slate-500">Deviation:</span>{' '}
                                <span className="text-red-400 font-bold">
                                    +{analysis.primaryAggressor.magnitude.toFixed(1)}%
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Time:</span>{' '}
                                <span className="text-white">
                                    {new Date(analysis.primaryAggressor.deviationTime).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Causal Chain */}
            <div className="p-4">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">
                    CAUSAL CHAIN
                </div>

                <div className="space-y-2">
                    {analysis.causalChain.map((event: CausalEvent, index: number) => (
                        <div key={event.id} className="relative">
                            {/* Connector Line */}
                            {index < analysis.causalChain.length - 1 && (
                                <div className="absolute left-[11px] top-8 w-0.5 h-6 bg-gradient-to-b from-cyan-500/30 to-transparent" />
                            )}

                            {/* Event Card */}
                            <div className={`flex items-start gap-3 p-2 rounded-sm border ${getEventColor(event.eventType)} bg-slate-900/40`}>
                                <div className={`${getEventColor(event.eventType)} mt-0.5`}>
                                    {getEventIcon(event.eventType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[9px] font-mono text-white truncate">
                                            {index + 1}. {event.description}
                                        </span>
                                        <span className="text-[8px] font-mono text-slate-500 whitespace-nowrap">
                                            {new Date(event.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[8px] font-mono text-slate-400">
                                        <span>Magnitude: {event.magnitude.toFixed(1)}</span>
                                        <span>•</span>
                                        <span>Confidence: {event.confidence}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="px-4 py-3 border-t border-white/5 bg-slate-950/40">
                <div className="text-[9px] font-mono text-slate-300 leading-relaxed">
                    {analysis.summary}
                </div>
            </div>
        </div>
    );
};
