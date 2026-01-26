import React from 'react';
import { Activity, Zap } from 'lucide-react';

interface HealingPulseProps {
    active: boolean;
    protocol?: string;
    targetMetric?: string;
    progress?: number; // 0-1
}

export const HealingPulse: React.FC<HealingPulseProps> = ({
    active,
    protocol = 'THERMAL_STABILIZATION',
    targetMetric = 'temperature',
    progress = 0.5
}) => {
    if (!active) return null;

    return (
        <div className="w-full bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/40 rounded-lg p-4 backdrop-blur-sm relative overflow-hidden">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 animate-pulse" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <Zap className="w-3 h-3 text-cyan-300 absolute -top-1 -right-1 animate-ping" />
                    </div>
                    <div>
                        <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
                            Autonomous Healing Active
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Protocol: {protocol.replace(/_/g, ' ')}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-200 font-mono">Stabilizing: <span className="text-white font-bold">{targetMetric}</span></span>
                        <span className="text-emerald-300 font-mono font-bold">{Math.round(progress * 100)}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 rounded-full"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-900/50 text-[10px] text-emerald-200/80 font-mono flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    System is actively correcting the identified root cause
                </div>
            </div>
        </div>
    );
};
