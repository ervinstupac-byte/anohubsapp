import React, { useMemo } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { MaintenanceEngine, SOPMapping } from '../../services/MaintenanceEngine';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ClipboardList, AlertCircle, HardHat, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExpertMaintenanceAdvisorCard: React.FC = () => {
    const diagnosis = useTelemetryStore(state => state.diagnosis);

    const actionPlan = useMemo(() => {
        if (!diagnosis) return [];
        return MaintenanceEngine.generateActionPlan(diagnosis);
    }, [diagnosis]);

    const getPriorityStyles = (priority: SOPMapping['priority']) => {
        switch (priority) {
            case 'HIGH': return 'border-red-500/30 bg-red-500/5 text-red-200';
            case 'MEDIUM': return 'border-amber-500/30 bg-amber-500/5 text-amber-200';
            case 'LOW': return 'border-blue-500/30 bg-blue-500/5 text-blue-200';
        }
    };

    return (
        <GlassCard
            title="Expert Maintenance Advisor"
            subtitle="Physics-Driven Standard Operating Procedures"
            icon={<HardHat className="w-4 h-4 text-emerald-400" />}
        >
            <div className="space-y-4">
                <AnimatePresence>
                    {actionPlan.length > 0 ? (
                        actionPlan.map((sop, idx) => (
                            <motion.div
                                key={sop.failureMode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-4 rounded-xl border ${getPriorityStyles(sop.priority)}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <h4 className="text-xs font-black uppercase tracking-widest">{sop.failureMode.replace(/_/g, ' ')}</h4>
                                    </div>
                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5">
                                        {sop.kbRef}
                                    </span>
                                </div>

                                <p className="text-[11px] leading-relaxed mb-4 font-medium opacity-90">
                                    {sop.action}
                                </p>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    {sop.steps.map(step => (
                                        <div key={step.step} className="flex gap-3 text-[10px]">
                                            <span className="font-mono text-slate-500 mt-0.5">{step.step}.</span>
                                            <p className={`flex-1 leading-tight ${step.critical ? 'text-white font-bold' : 'text-slate-400'}`}>
                                                {step.description}
                                                {step.critical && <span className="ml-2 text-[8px] px-1 bg-red-500 text-white rounded font-black tracking-tighter">CRITICAL</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                    <FileText className="w-3 h-3" />
                                    Open Full SOP Documentation
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center opacity-40">
                            <ClipboardList className="w-12 h-12 mb-3 text-slate-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Maintenance Directives</p>
                            <p className="text-[9px] text-slate-500 mt-1">System is operating within nominal thresholds</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
};
