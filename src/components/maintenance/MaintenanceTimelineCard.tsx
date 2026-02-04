import React, { useMemo } from 'react';
import { useMaintenancePrediction } from '../../features/maintenance/hooks/useMaintenancePrediction';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { Clock, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EventJournal } from '../../services/EventJournal';
import { History, Zap, Layout } from 'lucide-react';

export const MaintenanceTimelineCard: React.FC = () => {
    // 1. Connect to the Expert Predictive Hook
    const maintenanceEvents = useMaintenancePrediction();

    // 2. Connect to Telemetry
    const { mechanical } = useTelemetryStore();

    // 3. Get Recent System Events
    const recentEvents = useMemo(() => {
        try {
            return EventJournal.recent().slice(0, 5);
        } catch (e) {
            return [];
        }
    }, [mechanical.vibrationX]); // Refresh when mechanical data updates

    // For this card, we focus on the most urgent event
    const prediction = maintenanceEvents[0];

    if (!prediction) return null;

    const getStatusColor = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL': return 'text-red-400';
            case 'PRIORITY': return 'text-amber-400';
            case 'PLANNING': return 'text-cyan-400';
            default: return 'text-emerald-400';
        }
    };

    const getProgressBarColor = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL': return 'bg-red-500';
            case 'PRIORITY': return 'bg-amber-500';
            case 'PLANNING': return 'bg-cyan-500';
            default: return 'bg-emerald-500';
        }
    };

    return (
        <GlassCard title="Predictive Maintenance Timeline">
            <div className="space-y-6">
                {/* Header Stats */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Estimated Remaining Life</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black font-mono ${getStatusColor(prediction.urgency)}`}>
                                {prediction.daysRemaining.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 font-mono uppercase">Days</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 ${getStatusColor(prediction.urgency)}`}>
                            {prediction.urgency === 'LOW' && <CheckCircle2 className="w-4 h-4" />}
                            {prediction.urgency === 'MEDIUM' && <AlertTriangle className="w-4 h-4" />}
                            {prediction.urgency === 'HIGH' && <AlertTriangle className="w-4 h-4" />}
                            {prediction.urgency === 'CRITICAL' && <AlertTriangle className="w-4 h-4 animate-pulse" />}
                            <span className="text-[10px] font-bold tracking-wider">{prediction.urgency}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="relative pt-6 pb-2">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(prediction.urgency)}`}
                            style={{ width: `${Math.min(100, (prediction.daysRemaining / 3650) * 100)}%` }}
                        />
                    </div>

                    <div className="absolute top-0 left-0 w-full flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                        <span>NOW</span>
                        <span>5y</span>
                        <span>10y</span>
                    </div>

                    <div
                        className="absolute top-4 -mt-1 ml-[-6px] transition-all duration-1000 ease-out"
                        style={{ left: `${Math.min(100, (prediction.daysRemaining / 3650) * 100)}%` }}
                    >
                        <div className={`w-3 h-3 rotate-45 border border-slate-900 ${getProgressBarColor(prediction.urgency)}`} />
                    </div>
                </div>

                {/* System Event Stream (NC-86 Sanitization) */}
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sovereign Event Stream</span>
                    </div>

                    <div className="space-y-3">
                        {recentEvents.length === 0 ? (
                            <p className="text-[10px] text-slate-600 italic">Listening for system events...</p>
                        ) : (
                            recentEvents.map((ev, idx) => (
                                <div key={idx} className="flex items-start gap-3 group">
                                    <div className="mt-1">
                                        {ev.type === 'ALARM_ACK' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                        {ev.type === 'LOAD_SHED' && <Zap className="w-3 h-3 text-amber-500" />}
                                        {ev.type === 'UNIT_TOGGLE' && <Layout className="w-3 h-3 text-cyan-500" />}
                                        {!['ALARM_ACK', 'LOAD_SHED', 'UNIT_TOGGLE'].includes(ev.type) && <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1 ml-0.5" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{ev.type.replace(/_/g, ' ')}</span>
                                            <span className="text-[8px] font-mono text-slate-600">{new Date(ev.ts).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 line-clamp-1 group-hover:text-slate-300 transition-colors">
                                            {typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload).substring(0, 40) + '...'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded bg-blue-500/5 border border-blue-500/10">
                    <TrendingDown className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p className="text-[10px] text-blue-200/70 leading-relaxed">
                        Reasoning: <span className="text-white font-bold">{prediction.reason}</span>. High-precision aging model active.
                    </p>
                </div>
            </div>
        </GlassCard>
    );
};
