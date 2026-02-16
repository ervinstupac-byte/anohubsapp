import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export const SystemHealthCard: React.FC = () => {
    return (
        <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-50" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10">
                    <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">System Health</div>
                    <div className="text-2xl font-black text-white">85%</div>
                </div>
            </div>

            {/* Radial Gauge Simulated */}
            <div className="w-12 h-12 relative">
                <svg className="w-full h-full -rotate-90">
                    <circle className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                    <circle className="text-emerald-500" strokeWidth="4" strokeDasharray="125" strokeDashoffset="20" strokeLinecap="round" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                </svg>
            </div>
        </div>
    );
};

export const RiskStatusCard: React.FC = () => {
    return (
        <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-50" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-cyan-500/10">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Risk Status</div>
                    <div className="text-2xl font-black text-white uppercase">Nominal</div>
                </div>
            </div>

            <div className="w-12 h-12 flex items-center justify-center">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-cyan-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
};
