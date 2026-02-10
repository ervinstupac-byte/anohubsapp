import React from 'react';
import { Shield, Zap, AlertTriangle, TrendingDown } from 'lucide-react';
import { CorrosionCore, AnodeStatus } from '../../lib/physics/CorrosionCore';

interface CorrosionMonitorProps {
    anodes: AnodeStatus[];
    systemVoltage: number;
}

export const CorrosionMonitor: React.FC<CorrosionMonitorProps> = ({ anodes, systemVoltage }) => {
    const analysis = CorrosionCore.evaluateProtectionLevel(systemVoltage);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className={`w-5 h-5 ${analysis.color === '#ef4444' ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                        Molecular Integrity
                    </h3>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                    analysis.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                }`}>
                    {analysis.level}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-black/20 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> POTENTIAL (CSE)
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                        {systemVoltage.toFixed(0)} <span className="text-sm text-slate-500">mV</span>
                    </div>
                    <div className="text-[9px] mt-1" style={{ color: analysis.color }}>
                        {analysis.risk}
                    </div>
                </div>

                <div className="p-3 bg-black/20 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> ANODE LIFE
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                        {Math.min(...anodes.map(a => CorrosionCore.estimateAnodeLifeYears(a))).toFixed(1)} <span className="text-sm text-slate-500">yrs</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">
                        Limiting Component
                    </div>
                </div>
            </div>

            {/* Voltage Bar */}
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                {/* Target Zone (-850 to -1050) */}
                <div className="absolute left-[30%] width-[40%] h-full bg-emerald-500/20" />
                
                {/* Indicator */}
                <div 
                    className="absolute h-full w-1 bg-white shadow-[0_0_8px_white] transition-all duration-500"
                    style={{ 
                        left: `${Math.max(0, Math.min(100, ((systemVoltage + 1200) / 600) * 100))}%`,
                        backgroundColor: analysis.color
                    }} 
                />
            </div>
            <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
                <span>-1200mV</span>
                <span>-900mV</span>
                <span>-600mV</span>
            </div>
        </div>
    );
};
