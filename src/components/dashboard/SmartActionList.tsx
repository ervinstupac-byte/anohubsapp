import React, { useMemo } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { ActionEngine, Recommendation } from '../../features/business/logic/ActionEngine';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { Zap, AlertTriangle, TrendingUp, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SmartActionList: React.FC = () => {
    // 1. Consume full state for analysis
    const telemetryState = useTelemetryStore(state => state);

    // 2. Generate Recommendations (Memoized)
    const recommendations = useMemo(() => {
        return ActionEngine.generateRecommendations(telemetryState as any);
    }, [telemetryState.mechanical, telemetryState.hydraulic]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'border-red-500/50 bg-red-500/10 text-red-100';
            case 'MEDIUM': return 'border-amber-500/50 bg-amber-500/10 text-amber-100';
            case 'LOW': return 'border-blue-500/50 bg-blue-500/10 text-blue-100';
            default: return 'border-slate-500/30 bg-slate-500/5';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SAFETY': return <ShieldAlert className="w-5 h-5 text-red-400" />;
            case 'OPTIMIZATION': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
            case 'MAINTENANCE': return <Zap className="w-5 h-5 text-amber-400" />;
            default: return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <GlassCard
            title="Smart Action Engine"
            subtitle="AI-Driven Recommendations"
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            className="flex flex-col h-full"
        >
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {recommendations.length > 0 ? (
                        recommendations.map((rec) => (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-4 rounded-xl border flex gap-4 group hover:scale-[1.01] transition-transform cursor-pointer ${getPriorityColor(rec.priority)}`}
                            >
                                <div className="mt-1">
                                    {getIcon(rec.actionType)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm uppercase tracking-wide">{rec.title}</h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-black/20 uppercase`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs opacity-90 leading-relaxed mb-3">
                                        {rec.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-[10px] uppercase font-mono tracking-wider opacity-70">
                                        <span>Trigger: {rec.relatedMetric}</span>
                                        <span className="font-bold text-white">{rec.triggerValue}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 opacity-50">
                            <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500" />
                            <p className="text-xs uppercase font-bold tracking-widest text-emerald-200">System Optimal</p>
                            <p className="text-[10px] text-emerald-200/50 mt-1">No actions required</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <span>Active Logic Rules: 5</span>
                <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Analysis
                </span>
            </div>
        </GlassCard>
    );
};
