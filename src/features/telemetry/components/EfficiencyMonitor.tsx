import React, { useMemo } from 'react';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { computeEfficiencyFromHillChart } from '../../../features/physics-core/UnifiedPhysicsCore';
import { EfficiencyOptimizer } from '../../../services/EfficiencyOptimizer';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface EfficiencyMonitorProps {
    className?: string;
}

export const EfficiencyMonitor: React.FC<EfficiencyMonitorProps> = ({ className = '' }) => {
    const store = useTelemetryStore() as any;
    
    // Real-time telemetry data
    const hydraulic = useMemo(() => store?.hydraulic ?? {}, [store?.hydraulic]);
    const physics = useMemo(() => store?.physics ?? {}, [store?.physics]);
    
    // Calculate efficiency metrics
    const headM = useMemo(() => Number(hydraulic?.head ?? physics?.netHead ?? 0), [hydraulic, physics]);
    const flowM3s = useMemo(() => Number(hydraulic?.flow ?? 0), [hydraulic]);
    
    const efficiencyMetrics = useMemo(() => {
        const eta = computeEfficiencyFromHillChart('FRANCIS', headM, flowM3s);
        const { etaMax } = EfficiencyOptimizer.compute(headM || 0, flowM3s || 0, eta * 100);
        
        return {
            current: eta,
            optimal: etaMax || 0,
            delta: Math.max(0, ((etaMax || 0) - eta) * 100),
            percentage: (eta * 100).toFixed(1),
            status: eta >= 0.9 ? 'excellent' as const : eta >= 0.8 ? 'good' as const : eta >= 0.7 ? 'fair' as const : 'poor' as const
        };
    }, [headM, flowM3s]);

    const statusColors: Record<string, string> = {
        excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        good: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        fair: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        poor: 'text-red-400 bg-red-500/10 border-red-500/20'
    };

    return (
        <div className={`p-4 border border-white/5 rounded-xl bg-slate-900/40 backdrop-blur-sm ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EFFICIENCY MONITOR</h3>
                <div className={`px-2 py-1 rounded-full text-[8px] font-mono font-bold border ${statusColors[efficiencyMetrics.status]}`}>
                    {efficiencyMetrics.status.toUpperCase()}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="text-[clamp(18px,2.5vh,24px)] font-black text-white tabular-nums">
                        {efficiencyMetrics.percentage}%
                    </div>
                    <div className="text-[8px] font-mono text-slate-400">Current Efficiency</div>
                </div>
                <div>
                    <div className="text-[clamp(14px,2vh,18px)] font-black text-slate-300 tabular-nums">
                        {(efficiencyMetrics.optimal * 100).toFixed(1)}%
                    </div>
                    <div className="text-[8px] font-mono text-slate-400">Optimal Efficiency</div>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-slate-500">Efficiency Delta:</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white">{efficiencyMetrics.delta.toFixed(1)}%</span>
                        {efficiencyMetrics.delta > 5 ? (
                            <TrendingDown className="w-3 h-3 text-amber-400" />
                        ) : efficiencyMetrics.delta > 0 ? (
                            <Activity className="w-3 h-3 text-cyan-400" />
                        ) : (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-slate-500">Current Head:</span>
                    <span className="text-[10px] font-mono text-white">{headM.toFixed(1)} m</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-slate-500">Current Flow:</span>
                    <span className="text-[10px] font-mono text-white">{flowM3s.toFixed(1)} m³/s</span>
                </div>
            </div>
        </div>
    );
};
