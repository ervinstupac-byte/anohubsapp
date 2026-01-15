import React from 'react';
import { Upload, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

export const ActionCard: React.FC = () => {
    return (
        <button className="w-full h-full min-h-[100px] bg-slate-900/40 backdrop-blur-sm rounded p-4 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all flex flex-col justify-between border border-white/5 active:translate-y-0.5 active:bg-slate-900/60">
            {/* Brushed Metal Texture */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] pointer-events-none" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10 text-left">
                <span className="text-[9px] text-slate-400 font-black font-mono uppercase tracking-[0.2em] opacity-80">Protocol Genesis</span>
                <h2 className="text-2xl font-black text-slate-200 leading-tight uppercase drop-shadow-sm flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-cyan-400/80" />
                    New Audit
                </h2>
            </div>

            <div className="relative z-10 flex justify-end">
                <div className="bg-slate-800 p-2 rounded border border-slate-900 shadow-inner group-hover:bg-cyan-600 transition-colors">
                    <Upload className="w-4 h-4 text-cyan-400 group-hover:text-white" />
                </div>
            </div>

            {/* Etched border effect */}
            <div className="absolute inset-0 border border-white/20 pointer-events-none" />
        </button>
    );
};

export const LiveAnalytics: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <AnalyticsGraph title="Vibration Spectrum" color="text-emerald-400" glowClass="bloom-glow-emerald" />
            <AnalyticsGraph title="Oil Properties" color="text-amber-400" glowClass="bloom-glow-amber" />
            <AnalyticsGraph title="Active Power" color="text-cyan-400" glowClass="bloom-glow-cyan" />
            <AnalyticsGraph title="Grid Sync" color="text-purple-400" glowClass="bloom-glow-purple" />
        </div>
    );
};

const AnalyticsGraph: React.FC<{ title: string, color: string, glowClass?: string }> = ({ title, color, glowClass }) => (
    <div className="bg-slate-950 border border-slate-800 p-3 rounded flex flex-col relative overflow-hidden group">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />

        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-4 relative z-10 flex justify-between items-center">
            {title}
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${color}`} />
        </div>

        <div className={`h-16 w-full flex items-end gap-1 relative z-10`}>
            {[...Array(15)].map((_, i) => {
                const h = 20 + Math.random() * 80;
                return (
                    <div key={i} className={`flex-1 ${color} ${glowClass} opacity-60 group-hover:opacity-100 transition-all`}
                        style={{
                            height: `${h}%`,
                            backgroundColor: 'currentColor',
                            boxShadow: h > 70 ? '0 0 10px currentColor' : 'none'
                        }} />
                )
            })}
        </div>

        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_2px]" />
    </div>
);

export const SystemAlerts: React.FC = () => {
    return (
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-lg p-4 h-full flex flex-col metallic-border overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                <span>SYSTEM ALERTS</span>
                <span className="text-red-500 animate-pulse text-[8px]">CRITICAL SCAN ACTIVE</span>
            </h3>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <AlertItem severity="low" time="10:42" message="Vibration drift detected" />
                <AlertItem severity="medium" time="09:15" message="Oil pressure deviation" />
                <AlertItem severity="low" time="08:30" message="Network latency spike" />
                <AlertItem severity="high" time="07:12" message="Emergency stop test" />
            </div>

            <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 bloom-glow-red" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-30" />
                </div>
                <span className="text-[8px] font-mono text-slate-600 font-bold">NODE: Commander_01</span>
            </div>
        </div>
    );
};

const AlertItem: React.FC<{ severity: 'low' | 'medium' | 'high', time: string, message: string }> = ({ severity, time, message }) => {
    const configs = {
        low: { color: 'text-emerald-400', glow: 'bloom-glow-emerald', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        medium: { color: 'text-amber-400', glow: 'bloom-glow-amber', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
        high: { color: 'text-red-500', glow: 'bloom-glow-red', bg: 'bg-red-500/10', border: 'border-red-500/30' }
    };
    const c = configs[severity];

    return (
        <div className={`flex items-center gap-3 p-2 rounded border ${c.bg} ${c.border} group/alert hover:border-white/20 transition-colors`}>
            <div className={`${c.color} ${c.glow}`}>
                {severity === 'high' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-tight truncate group-hover/alert:text-white transition-colors">{message}</span>
                    <span className="text-[8px] font-mono text-slate-500 font-bold">{time}</span>
                </div>
            </div>
        </div>
    );
};
