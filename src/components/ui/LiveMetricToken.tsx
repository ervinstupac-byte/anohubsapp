import React from 'react';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { Sparkline } from './Sparkline';

interface LiveMetricTokenProps {
    sensorId: string;
}

export const LiveMetricToken: React.FC<LiveMetricTokenProps> = ({ sensorId }) => {
    const { liveMetrics } = useContextAwareness();

    // Find metric based on ID mapping (Mock mapping for now)
    // In real app, liveMetrics would be a dictionary keyed by ID.
    // Here we map simplified IDs to the known liveMetrics array labels.

    let metric: any = null;

    if (sensorId === 'PT-101' || sensorId === 'VIB-901-A') {
        metric = liveMetrics.find((m: any) => m.label === 'Vibration');
    } else if (sensorId === 'TMP-404-X') {
        metric = liveMetrics.find((m: any) => m.label === 'Bearing Temp');
    } else if (sensorId === 'PRE-202-B') {
        metric = liveMetrics.find((m: any) => m.label === 'DT Pressure');
    }

    if (!metric) return <span className="inline-block px-1.5 py-0.5 bg-red-950/20 text-red-500 font-mono text-[10px] font-bold rounded border border-red-500/30 uppercase tracking-widest">ERR: {sensorId}</span>;

    const isWarning = metric.status === 'warning' || metric.status === 'critical';
    const isCritical = metric.status === 'critical';

    return (
        <span className={`inline-flex items-center gap-2 align-middle px-2 py-0.5 mx-1 rounded-sm border backdrop-blur-sm transition-all duration-300 group overflow-hidden relative ${isCritical ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                isWarning ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                    'bg-slate-900/60 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
            }`}>
            {/* Liveness Shimmer */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">{metric.label}</span>

            <span className={`font-mono font-bold text-[11px] tabular-nums relative z-10 ${isCritical ? 'text-red-400' :
                    isWarning ? 'text-amber-400' :
                        'text-cyan-300'
                }`}>
                {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value} <span className="text-[9px] opacity-70">{metric.unit}</span>
            </span>

            {metric.history && (
                <div className="w-10 h-3 opacity-80 group-hover:opacity-100 transition-opacity flex items-center">
                    <Sparkline data={metric.history} width={40} height={12} color={isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#22d3ee'} />
                </div>
            )}
        </span>
    );
};
