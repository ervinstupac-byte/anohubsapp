import React, { useMemo } from 'react';
import { MaintenancePredictor } from '../../features/business/logic/MaintenancePredictor';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { Clock, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const MaintenanceTimelineCard: React.FC = () => {
    // Connect to Telemetry Store for live physics data
    const { mechanical, specializedState } = useTelemetryStore();

    // Derived Stress Factors
    const stressFactors = useMemo(() => {
        return {
            vibration: mechanical?.vibration || 0.0,
            temperature: mechanical?.bearingTemp || 45.0,
            cavitation: mechanical?.acousticMetrics?.cavitationIntensity || 0.0,
            efficiencyDrop: 0, // Not strictly monitored in this version
        };
    }, [mechanical, specializedState]);

    // Calculate Prediction
    const prediction = useMemo(() => {
        const index = MaintenancePredictor.calculateStressIndex(stressFactors);
        return MaintenancePredictor.estimateRemainingLife(index);
    }, [stressFactors]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CRITICAL': return 'text-red-400';
            case 'WARNING': return 'text-amber-400';
            default: return 'text-emerald-400';
        }
    };

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'CRITICAL': return 'bg-red-500';
            case 'WARNING': return 'bg-amber-500';
            default: return 'bg-emerald-500';
        }
    };

    return (
        <GlassCard title="Predictive Maintenance Timeline">
            <div className="space-y-6">
                {/* Header Stats */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Estimated Remaining Life</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black font-mono ${getStatusColor(prediction.status)}`}>
                                {prediction.days.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 font-mono uppercase">Days</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 ${getStatusColor(prediction.status)}`}>
                            {prediction.status === 'OPTIMAL' && <CheckCircle2 className="w-4 h-4" />}
                            {prediction.status === 'WARNING' && <AlertTriangle className="w-4 h-4" />}
                            {prediction.status === 'CRITICAL' && <AlertTriangle className="w-4 h-4 animate-pulse" />}
                            <span className="text-[10px] font-bold tracking-wider">{prediction.status}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="relative pt-6 pb-2">
                    {/* Progress Bar Background */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        {/* Fill calculated by inverse of stress/wear? Or simpler: mapped to a 10 year scale? 
                            Let's map Days / (10 years * 365) to get a percentage of "Total Design Life"
                        */}
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(prediction.status)}`}
                            style={{ width: `${Math.min(100, (prediction.days / (50000 / 24)) * 100)}%` }}
                        />
                    </div>

                    {/* Markers */}
                    <div className="absolute top-0 left-0 w-full flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                        <span>NOW</span>
                        <span>5y</span>
                        <span>10y</span>
                    </div>

                    {/* Dynamic Marker Pointer */}
                    <div
                        className="absolute top-4 -mt-1 ml-[-6px] transition-all duration-1000 ease-out"
                        style={{ left: `${Math.min(100, (prediction.days / (50000 / 24)) * 100)}%` }}
                    >
                        <div className={`w-3 h-3 rotate-45 border border-slate-900 ${getProgressBarColor(prediction.status)}`} />
                    </div>
                </div>

                {/* Stress Factors Mini-Grid */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                    <div className="p-2 bg-slate-900/50 rounded flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest">Vibration</span>
                        <span className={`text-xs font-mono font-bold ${stressFactors.vibration > 5 ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {stressFactors.vibration.toFixed(2)}
                        </span>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest">Temp</span>
                        <span className={`text-xs font-mono font-bold ${stressFactors.temperature > 70 ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {stressFactors.temperature.toFixed(1)}°
                        </span>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest">Cavitation</span>
                        <span className={`text-xs font-mono font-bold ${stressFactors.cavitation > 20 ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {stressFactors.cavitation.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded bg-blue-500/5 border border-blue-500/10">
                    <TrendingDown className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p className="text-[10px] text-blue-200/70 leading-relaxed">
                        Based on current hydraulic stress, the next major overhaul can be deferred by <span className="text-white font-bold">{Math.round(prediction.days * 0.15)} days</span> if vibration reduces by 10%.
                    </p>
                </div>
            </div>
        </GlassCard>
    );
};
