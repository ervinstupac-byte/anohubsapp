// Client Consultant Dashboard
// Represents the "Value Add" view for the owner/investor

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShieldCheck, Activity, AlertOctagon, Zap } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { PerformanceGuardService, OperatingPoint } from '../services/PerformanceGuardService';

export const ClientConsultantDashboard: React.FC = () => {
    // Simulated Real-time Data
    const [opPoint, setOpPoint] = useState<OperatingPoint>({
        flow: 12.5,
        netHead: 48.2,
        powerOutput: 5.2, // MW
        efficiency: 91.5,
        gateOpening: 82
    });

    // Financials
    const energyPrice = 85; // EUR/MWh
    const currentRevenuePerHr = opPoint.powerOutput * energyPrice;

    // Water Hammer Simulation Data
    const hammerStats = PerformanceGuardService.calculateSafeClosingTime(1200, 1600, 12, 'STEEL');

    // Loss Analysis
    const losses = PerformanceGuardService.analyzeLosses(
        50, // Gross
        opPoint.netHead,
        opPoint.flow,
        opPoint.powerOutput * 1000 / 0.96, // Est mech power 
        opPoint.powerOutput * 1000
    );

    const zoneInfo = PerformanceGuardService.checkOperatingZone(opPoint, 50, 14);

    return (
        <div className="min-h-screen p-6 bg-slate-950">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Consultant <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Value View</span>
                    </h1>
                    <p className="text-slate-400">Owner's Executive Dashboard</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 font-bold uppercase">Current Revenue Stream</div>
                    <div className="text-3xl font-black text-emerald-400 tabular-nums">
                        € {currentRevenuePerHr.toFixed(2)} <span className="text-sm text-slate-500">/ hr</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6">

                {/* 1. HILL CHART / EFFICIENCY AUDIT */}
                <div className="col-span-12 lg:col-span-6">
                    <GlassCard className="p-6 h-full relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="text-blue-400" />
                                Efficiency Hill Chart Audit
                            </h3>
                            <div className={`px-3 py-1 rounded text-xs font-black uppercase ${zoneInfo.zone === 'BEST_EFFICIENCY' ? 'bg-emerald-500 text-black' :
                                    zoneInfo.zone === 'VORTEX_ROPE' ? 'bg-amber-500 text-black' :
                                        zoneInfo.zone === 'CAVITATION_RISK' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                Phase: {zoneInfo.zone.replace('_', ' ')}
                            </div>
                        </div>

                        {/* Interactive Chart Visualization */}
                        <div className="relative h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 mt-4 flex items-center justify-center">
                            {/* SVG Chart Background (Abstract contours) */}
                            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M 10,90 Q 50,20 90,90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
                                <path d="M 20,90 Q 50,30 80,90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
                                <path d="M 30,90 Q 50,40 70,90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />

                                {/* Cavitation Zone */}
                                <rect x="80" y="60" width="20" height="40" fill="red" opacity="0.2" />
                            </svg>

                            {/* The Operating Point */}
                            <motion.div
                                className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"
                                initial={{ left: '50%', top: '50%' }}
                                animate={{
                                    left: `${(opPoint.flow / 16) * 100}%`, // Mock scaling
                                    top: `${100 - (opPoint.netHead / 60) * 100}%`
                                }}
                                transition={{ type: 'spring', damping: 20 }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-[10px] whitespace-nowrap border border-slate-600">
                                    {opPoint.efficiency.toFixed(1)}% Eff
                                </div>
                            </motion.div>

                            <div className="absolute bottom-2 right-2 text-xs text-slate-500">Flow (Q) →</div>
                            <div className="absolute top-2 left-2 text-xs text-slate-500">Head (H) ↑</div>
                        </div>

                        {zoneInfo.alert && (
                            <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded flex items-center gap-3">
                                <AlertOctagon className="text-red-400 w-5 h-5" />
                                <span className="text-sm text-red-200 font-bold">{zoneInfo.alert}</span>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* 2. HYDRAULIC SHOCK SAFEGUARD */}
                <div className="col-span-12 lg:col-span-3">
                    <GlassCard className="p-6 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-400" />
                            Servo Hard-Lock
                        </h3>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase">Critical Closing Time</div>
                                <div className="text-3xl font-black text-white">{hammerStats.criticalTime.toFixed(2)}s</div>
                                <div className="text-xs text-slate-500">2L / a (Physics limit)</div>
                            </div>

                            <div className="p-4 rounded bg-slate-900 border border-amber-500/30 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <div className="text-xs text-amber-500 font-bold uppercase mb-1">Safety Limit Enforced</div>
                                <div className="text-2xl font-black text-white">{hammerStats.minClosingTime.toFixed(1)}s</div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                    System will physically prevent servo moving faster than this to avoid {hammerStats.maxSurgePressure.toFixed(1)} bar surge.
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 3. LOSS TRACKER & ROI */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <GlassCard className="p-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Water-to-Wire Loss Audit</h3>
                        <div className="space-y-3">
                            <LossBar label="Trash Rack" value={losses.trashRackLossKW} total={opPoint.powerOutput * 1000} color="bg-blue-500" />
                            <LossBar label="Penstock Friction" value={losses.penstockFrictionLossKW} total={opPoint.powerOutput * 1000} color="bg-cyan-500" warning={losses.penstockFrictionLossKW > 50} />
                            <LossBar label="Generator Heat" value={losses.generatorElecLossKW} total={opPoint.powerOutput * 1000} color="bg-orange-500" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-emerald-400 w-4 h-4" />
                            <h3 className="text-xs font-bold text-emerald-400 uppercase">Consulting ROI</h3>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                            € 142,500
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                            Estimated annual savings via optimized efficiency operating points and cavitation prevention.
                        </p>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};

// Helper for loss bars
const LossBar = ({ label, value, total, color, warning }: any) => {
    const pct = (value / total) * 100 * 50; // Scale up for visibility
    return (
        <div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                <span>{label}</span>
                <span className={warning ? 'text-red-400 animate-pulse' : ''}>{value.toFixed(1)} kW</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${warning ? 'bg-red-500' : color}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
            </div>
        </div>
    );
};
