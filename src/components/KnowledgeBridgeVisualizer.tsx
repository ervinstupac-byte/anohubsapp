// Knowledge Bridge Visualizer
// Shows the active link between Genesis data and Operational Reality

import React, { useState, useEffect } from 'react';
import { Network, ArrowRight, Droplets, Zap, Clock, Coins } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { KnowledgeBridgeService } from '../services/KnowledgeBridgeService';
import { LifecycleManager } from '../services/LifecycleManager';

export const KnowledgeBridgeVisualizer: React.FC = () => {
    const project = LifecycleManager.getActiveProject();

    // Force specific Genesis data for demo if missing
    if (!project.genesis.siteParams.waterQuality) {
        project.genesis.siteParams.waterQuality = 'SAND'; // Demo scenario
    }

    const baselines = KnowledgeBridgeService.deriveBaselines(project);
    const schedule = KnowledgeBridgeService.getSmartSchedule(project);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <Network className="text-cyan-400" />
                Knowledge Bridge <span className="text-slate-500 text-sm normal-case border-l border-slate-700 pl-3">Genesis Data → Operational Strategy</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. SOURCE DATA (Genesis) */}
                <GlassCard className="p-6 border-l-4 border-cyan-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-8 opacity-5">
                        <Network size={120} />
                    </div>

                    <h3 className="text-xs font-bold text-cyan-400 uppercase mb-4">Source: Project Genesis</h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-950/50 flex items-center justify-center border border-cyan-500/30">
                                <Droplets className="text-cyan-400 w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Water Quality Input</div>
                                <div className="text-lg font-black text-white">{project.genesis.siteParams.waterQuality}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-950/50 flex items-center justify-center border border-cyan-500/30">
                                <Zap className="text-cyan-400 w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Planned Head</div>
                                <div className="text-lg font-black text-white">{project.genesis.siteParams.grossHead} m</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* ARROW */}
                <div className="hidden md:flex flex-col items-center justify-center text-slate-600">
                    <div className="text-[10px] font-mono mb-2 uppercase tracking-widest">Auto-Calibrating</div>
                    <ArrowRight size={32} className="animate-pulse" />
                </div>

                {/* 2. OPERATIONAL IMPACT (Live AI) */}
                <GlassCard className="p-6 border-l-4 border-emerald-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-8 opacity-5">
                        <Clock size={120} />
                    </div>

                    <h3 className="text-xs font-bold text-emerald-400 uppercase mb-4">Target: Maint. AI Strategy</h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-950/50 flex items-center justify-center border border-emerald-500/30">
                                <Clock className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Inspection Interval</div>
                                <div className="text-lg font-black text-white">
                                    {baselines.runnerInspectionIntervalHours} h
                                    <span className="text-xs text-amber-400 ml-2 font-normal">(Shortened by Sand)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-950/50 flex items-center justify-center border border-emerald-500/30">
                                <Coins className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Downtime Cost Risk</div>
                                <div className="text-lg font-black text-white">€ {baselines.revenueImpactPerHourDowntime.toFixed(0)} <span className="text-xs text-slate-500">/hr</span></div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

            </div>

            {/* 3. INSIGHTS */}
            <GlassCard className="mt-6 p-4 bg-slate-900/50 border border-slate-700/50">
                <h4 className="text-sm font-bold text-white mb-2 uppercase">Bridge Intelligence Log</h4>
                <div className="space-y-2">
                    {schedule.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start text-sm p-2 hover:bg-white/5 rounded">
                            <div className="min-w-[150px] font-mono text-cyan-400">{item.action}</div>
                            <div className="text-slate-300 flex-1">{item.reason}</div>
                            <div className="font-bold text-white whitespace-nowrap">Due in {item.dueInHours}h</div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};
