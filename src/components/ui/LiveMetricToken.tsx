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

    if (!metric) return <span className="inline-block px-1 bg-red-900/50 text-red-400 font-mono text-xs rounded border border-red-500/30">ERR: {sensorId}</span>;

    const isWarning = metric.status === 'warning' || metric.status === 'critical';

    return (
        <span className={`inline-flex items-center gap-2 align-middle px-2 py-0.5 rounded mx-1 border ${isWarning ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-800/50 border-cyan-500/30'}`}>
            <span className={`font-mono font-bold text-xs ${isWarning ? 'text-amber-400' : 'text-cyan-300'}`}>
                {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value} {metric.unit}
            </span>
            {metric.history && (
                <div className="w-8 h-4 opacity-70">
                    <Sparkline data={metric.history} width={32} height={16} color={isWarning ? '#fbbf24' : '#22d3ee'} />
                </div>
            )}
        </span>
    );
};
