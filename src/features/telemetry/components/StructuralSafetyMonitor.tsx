import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StructuralSafetyMonitorProps {
    margin: number;
    hoopStress: number;
    yieldStrength: number;
}

export const StructuralSafetyMonitor: React.FC<StructuralSafetyMonitorProps> = ({ margin, hoopStress, yieldStrength }) => {
    const isCritical = margin < 25;
    const isWarning = margin < 50;

    const color = isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';
    const bgColor = isCritical ? 'bg-red-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-emerald-500/10';
    const borderColor = isCritical ? 'border-red-500/30' : isWarning ? 'border-amber-500/30' : 'border-emerald-500/30';

    return (
        <div className={`p-4 rounded-lg border ${bgColor} ${borderColor} transition-all`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Structural Integrity</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-black/40 border border-white/5">
                    <span className={`text-[9px] font-mono font-bold ${color}`}>
                        {margin.toFixed(1)}% MARGIN
                    </span>
                </div>
            </div>

            {/* Barlow Gauge */}
            <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 mb-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${margin}%` }}
                    className={`h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <div className="text-[8px] text-slate-500 font-mono uppercase">Hoop Stress</div>
                    <div className="text-xs font-mono text-white">{hoopStress.toFixed(2)} MPa</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] text-slate-500 font-mono uppercase">Yield Strength</div>
                    <div className="text-xs font-mono text-slate-300">{yieldStrength.toFixed(0)} MPa</div>
                </div>
            </div>

            {isCritical && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-2 bg-red-500/20 border border-red-500/40 rounded flex items-start gap-2"
                >
                    <AlertCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-red-200 leading-tight">
                        CRITICAL: Barlow stress exceeds safety limit. Reduce unit load immediately.
                    </span>
                </motion.div>
            )}

            {!isCritical && !isWarning && (
                <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] text-emerald-200">Structural Safety Factor Verified</span>
                </div>
            )}
        </div>
    );
};
