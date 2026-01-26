
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, ShieldAlert, BadgeCheck } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { SystemHealth } from '../../services/LiveMathSync';

interface LiveHUDProps {
    health: SystemHealth;
    baseline?: SystemHealth; // Optional: comparison to previous state
}

export const LiveHUD: React.FC<LiveHUDProps> = ({ health, baseline }) => {
    // Calculate Deltas
    const powerDelta = baseline ? health.powerOutputKW - baseline.powerOutputKW : 0;
    const roiDelta = baseline ? health.roiYears - baseline.roiYears : 0;

    // Visual Cues
    const isPowerRising = powerDelta >= 0;
    const isRoiImproving = roiDelta <= 0; // Lower ROI years is better

    return (
        <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-4 items-end pointer-events-none">

            {/* Main HUD Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl min-w-[300px] pointer-events-auto"
            >
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black tracking-widest text-[#2dd4bf] uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Live Physics Delta
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-6">

                    {/* Power Metric */}
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Output</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white font-mono tracking-tight">
                                {health.powerOutputKW.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-500">kW</span>
                        </div>
                        {powerDelta !== 0 && (
                            <div className={`text - xs font - bold flex items - center ${isPowerRising ? 'text-emerald-500' : 'text-red-500'} `}>
                                {isPowerRising ? '+' : ''}{powerDelta.toFixed(1)} kW
                                {isPowerRising ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingUp className="w-3 h-3 ml-1 rotate-180" />}
                            </div>
                        )}
                    </div>

                    {/* ROI Metric */}
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">ROI Period</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white font-mono tracking-tight">
                                {health.roiYears.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-500">yrs</span>
                        </div>
                        {roiDelta !== 0 && (
                            <div className={`text - xs font - bold ${isRoiImproving ? 'text-emerald-500' : 'text-amber-500'} `}>
                                {roiDelta > 0 ? '+' : ''}{roiDelta.toFixed(1)} yrs
                            </div>
                        )}
                    </div>
                </div>

                {/* Safety Status */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {health.waterHammerSurgeBar > 50 ? ( // Arbitrary alert threshold
                            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                        ) : (
                            <BadgeCheck className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="text-xs font-bold text-slate-300">
                            Surge: {health.waterHammerSurgeBar.toFixed(1)} bar
                        </span>
                    </div>
                    {health.analysis.cavitationRisk && (
                        <span className="text-[10px] font-black text-red-500 px-2 py-1 bg-red-950/30 rounded animate-pulse">
                            CAVITATION
                        </span>
                    )}
                </div>

            </motion.div>
        </div>
    );
};
