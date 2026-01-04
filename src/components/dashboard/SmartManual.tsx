import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { GlassCard } from '../ui/GlassCard';
import { BookOpen, FileText, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SmartManual: React.FC = () => {
    const { t } = useTranslation();
    const { technicalState } = useProjectEngine();

    // Logic: Identify active critical triggers for SOP surfacing
    const axialThrust = technicalState.physics?.axialThrustKN || 0;
    const cavitationRisk = technicalState.physics?.hoopStressMPa > 140; // Simplified trigger
    const leakageStatus = technicalState.physics?.leakageStatus;

    const suggestedSOPs = useMemo(() => {
        const sops = [];

        if (axialThrust > 180) {
            sops.push({
                id: 'thrust-bearing-sop',
                title: 'Thrust Bearing Inspection & Lubrication',
                priority: 'CRITICAL',
                reason: 'Axial Thrust exceeds 180kN threshold',
                code: 'SOP-FR-042',
                link: '/maintenance/thrust-bearing'
            });
        }

        if (leakageStatus === 'DEGRADING' || leakageStatus === 'CRITICAL') {
            sops.push({
                id: 'seal-inspection-sop',
                title: 'Runner Seal Integrity Audit',
                priority: 'URGENT',
                reason: 'Specific Water Consumption decay detected',
                code: 'SOP-FR-015',
                link: '/maintenance/hydraulic-seals'
            });
        }

        if (cavitationRisk) {
            sops.push({
                id: 'cavitation-mitigation',
                title: 'Cavitation Prevention Handbook',
                priority: 'WARNING',
                reason: 'Operation near cavitation threshold',
                code: 'SOP-FR-008',
                link: '/maintenance/cavitation-repair'
            });
        }

        return sops;
    }, [axialThrust, leakageStatus, cavitationRisk]);

    return (
        <GlassCard
            variant="commander"
            title="Interactive Maintenance Core"
            subtitle="CEREBRO-Linked SOP Engine"
            icon={<BookOpen className="w-5 h-5 text-purple-400" />}
            className="h-full flex flex-col"
        >
            <div className="flex-grow space-y-4">
                <AnimatePresence mode="popLayout">
                    {suggestedSOPs.length > 0 ? (
                        suggestedSOPs.map((sop) => (
                            <motion.div
                                key={sop.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className={`p-4 rounded-xl border flex gap-4 items-start relative overflow-hidden group hover:scale-[1.02] transition-transform ${sop.priority === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 'bg-purple-500/5 border-purple-500/20'
                                    }`}
                            >
                                <div className={`mt-1 p-2 rounded-lg ${sop.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{sop.title}</h4>
                                        <span className="text-[8px] font-mono text-slate-500">{sop.code}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-3">{sop.reason}</p>
                                    <div className="flex gap-2">
                                        <button className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${sop.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                                            }`}>
                                            <ExternalLink className="w-3 h-3" />
                                            Open Interactive SOP
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-1">
                                    <div className={`w-1 h-1 rounded-full animate-pulse ${sop.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 py-12">
                            <FileText className="w-12 h-12 text-slate-600 mb-4" />
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No active critical SOPs required</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest px-1">
                    <span>Knowledge Base Sync</span>
                    <span className="text-emerald-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Live Link
                    </span>
                </div>
            </div>
        </GlassCard>
    );
};
