import React from 'react';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { Sparkline } from '../../../components/ui/Sparkline';

interface LiveMetricTokenProps {
    sensorId: string;
}

export const LiveMetricToken = React.memo<LiveMetricTokenProps>(({ sensorId }) => {
    // Direct Subscription to Telemetry Store (Atomic)
    const metricData = useTelemetryStore((state) => {
        if (sensorId === 'PT-101' || sensorId === 'VIB-901-A') {
            return {
                label: 'Vibration',
                value: state.mechanical.vibration,
                unit: 'mm/s',
                status: state.mechanical.vibration > 4.5 ? 'critical' : (state.mechanical.vibration > 2.8 ? 'warning' : 'nominal'),
                history: state.mechanical.vibrationHistory?.map(p => p.y)
            };
        }
        if (sensorId === 'TMP-404-X') {
            return {
                label: 'Bearing Temp',
                value: state.mechanical.bearingTemp,
                unit: '°C',
                status: state.mechanical.bearingTemp > 80 ? 'critical' : (state.mechanical.bearingTemp > 65 ? 'warning' : 'nominal'),
                history: []
            };
        }
        if (sensorId === 'PRE-202-B') {
            // Mapping to calculated surge pressure from physics engine
            const pressure = state.physics.surgePressure ? state.physics.surgePressure.toNumber() / 100000 : 0; // Pa to Bar rough
            return {
                label: 'Surge Pressure', // Changed from DT Pressure as we have Surge available
                value: pressure,
                unit: 'Bar',
                status: pressure > 40 ? 'critical' : 'nominal',
                history: []
            };
        }
        return null;
    });

    const metric = metricData;

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
});

LiveMetricToken.displayName = 'LiveMetricToken';
