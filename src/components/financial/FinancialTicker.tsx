import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, DollarSign, Activity, AlertOctagon } from 'lucide-react';
import { useFinancialYield } from '../../hooks/useFinancialYield';

export const FinancialTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
    const {
        revenueLossPerHour,
        currentRevenuePerHour,
        efficiencyLossPercent,
        isFinancialCritical,
        currency,
        energyPrice
    } = useFinancialYield();

    return (
        <div className={`relative overflow-hidden group ${className}`}>
            {/* Background Glow based on Criticality */}
            <div className={`absolute inset-0 transition-opacity duration-1000 opacity-20 ${isFinancialCritical ? 'bg-red-900/40 animate-pulse' : 'bg-emerald-900/20'
                }`}></div>

            <div className={`relative z-10 flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-xl border-y sm:border sm:rounded-2xl transition-colors duration-500 ${isFinancialCritical ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-slate-800'
                }`}>

                {/* LEFT: The Problem (Loss) */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border flex items-center justify-center ${isFinancialCritical
                            ? 'bg-red-500/10 border-red-500/30 text-red-500'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        }`}>
                        {isFinancialCritical ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5">
                            Real-Time Revenue Leakage
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tabular-nums tracking-tight ${isFinancialCritical ? 'text-white' : 'text-slate-200'
                                }`}>
                                -{currency}{revenueLossPerHour}
                            </span>
                            <span className="text-sm font-bold text-slate-500">/ hour</span>
                        </div>
                    </div>
                </div>

                {/* MIDDLE: Context (Why?) */}
                <div className="hidden md:flex flex-col items-center px-8 border-x border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-bold text-cyan-400 uppercase">System Efficiency Delta</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-slate-300">
                        {efficiencyLossPercent}% <span className="text-slate-600 text-sm">below peak</span>
                    </span>
                </div>

                {/* RIGHT: The "So What" (Impact) */}
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-white/5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-slate-400">MARKET PRICE: {currency}{energyPrice}/MWh</span>
                    </div>
                    <AnimatePresence mode="wait">
                        {isFinancialCritical && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-end gap-2 text-red-400"
                            >
                                <AlertOctagon className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-tight">Immediate Action Required</span>
                            </motion.div>
                        )}
                        {!isFinancialCritical && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs font-medium text-emerald-500 uppercase tracking-widest"
                            >
                                Revenue Stream Optimized
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
