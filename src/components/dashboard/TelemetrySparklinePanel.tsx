/**
 * TELEMETRY SPARKLINE PANEL
 * Medical ECG-style sparklines for critical turbine metrics.
 * Part of NC-400: Professional Witness UI
 */

import React from 'react';
import { Activity, Thermometer, Gauge, TrendingUp, TrendingDown, Minus, Cpu, Waves } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { Sparkline } from '../ui/Sparkline';

interface SparklineMetricProps {
    label: string;
    value: number;
    unit: string;
    data: number[];
    color: string;
    icon: React.ReactNode;
    threshold?: { warning: number; alarm: number };
}

const SparklineMetric: React.FC<SparklineMetricProps> = ({
    label,
    value,
    unit,
    data,
    color,
    icon,
    threshold
}) => {
    // Calculate trend
    const recentData = data.slice(-10);
    const trend = recentData.length > 1
        ? recentData[recentData.length - 1] - recentData[0]
        : 0;

    // Determine status based on thresholds
    const getStatus = () => {
        if (!threshold) return 'normal';
        if (value >= threshold.alarm) return 'alarm';
        if (value >= threshold.warning) return 'warning';
        return 'normal';
    };
    const status = getStatus();

    return (
        <div className={`bg-slate-900 border transition-colors rounded-none ${status === 'alarm' ? 'border-red-500/50 bg-red-950/20' :
            status === 'warning' ? 'border-amber-500/50 bg-amber-950/20' :
                'border-slate-700'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-none ${status === 'alarm' ? 'bg-red-500/20 text-red-400' :
                        status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-700/50 text-slate-400'
                        }`}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {label}
                    </span>
                </div>
                {/* Trend indicator */}
                <div className={`flex items-center gap-1 text-[9px] ${trend > 0.5 ? 'text-red-400' :
                    trend < -0.5 ? 'text-emerald-400' :
                        'text-slate-500'
                    }`}>
                    {trend > 0.5 ? <TrendingUp className="w-3 h-3" /> :
                        trend < -0.5 ? <TrendingDown className="w-3 h-3" /> :
                            <Minus className="w-3 h-3" />}
                    {trend > 0 ? '+' : ''}{trend.toFixed(2)}
                </div>
            </div>

            {/* Value + Sparkline */}
            <div className="flex items-end justify-between gap-3">
                {/* Value */}
                <div>
                    <span className={`text-2xl font-black font-mono ${status === 'alarm' ? 'text-red-400' :
                        status === 'warning' ? 'text-amber-400' :
                            'text-white'
                        }`}>
                        {value.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">{unit}</span>
                </div>

                {/* ECG Sparkline */}
                <div className="flex-1 h-8 flex items-center justify-end">
                    <Sparkline
                        data={data.map(d => isNaN(d) ? 0 : d).length > 0 ? data.map(d => isNaN(d) ? 0 : d) : [0, 0]}
                        width={100}
                        height={28}
                        color={color}
                        className="opacity-80"
                    />
                </div>
            </div>

            {/* Data points count */}
            <div className="mt-2 pt-2 border-t border-slate-700/30 flex items-center justify-between">
                <span className="text-[8px] text-slate-600 uppercase tracking-widest">
                    {data.length}/50 samples
                </span>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${data.length > i * 10 ? color.includes('cyan') ? 'bg-cyan-400' :
                                color.includes('amber') ? 'bg-amber-400' : 'bg-emerald-400' : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const TelemetrySparklinePanel: React.FC<{ className?: string }> = ({ className = '' }) => {
    const telemetryHistory = useTelemetryStore(state => state.telemetryHistory);
    const mechanical = useTelemetryStore(state => state.mechanical);
    const hydraulic = useTelemetryStore(state => state.hydraulic);
    const governor = useTelemetryStore(state => state.governor);
    const physics = useTelemetryStore(state => state.physics);

    // Extract values from history
    const vibrationXData = telemetryHistory.vibrationX.map(p => p.value);
    const bearingTempData = telemetryHistory.bearingTemp.map(p => p.value);
    const flowData = telemetryHistory.flow.map(p => p.value);
    const pidOutputData = telemetryHistory.governorOutput.map(p => p.value);
    const surgePressureData = telemetryHistory.surgePressure.map(p => p.value);

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Live Telemetry
                    </span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono">
                    50-pt buffer
                </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-2">
                <SparklineMetric
                    label="Vibration X"
                    value={mechanical.vibrationX ?? 0}
                    unit="mm/s"
                    data={vibrationXData}
                    color="#22d3ee"
                    icon={<Activity className="w-3 h-3" />}
                    threshold={{ warning: 4.5, alarm: 7.1 }}
                />
                <SparklineMetric
                    label="Bearing Temp"
                    value={mechanical.bearingTemp ?? 0}
                    unit="°C"
                    data={bearingTempData}
                    color="#fbbf24"
                    icon={<Thermometer className="w-3 h-3" />}
                    threshold={{ warning: 70, alarm: 80 }}
                />
                <SparklineMetric
                    label="Flow Rate"
                    value={hydraulic.flow ?? 0}
                    unit="m³/s"
                    data={flowData}
                    color="#34d399"
                    icon={<Gauge className="w-3 h-3" />}
                />
                <SparklineMetric
                    label="PID Output"
                    value={governor.outputSignal?.toNumber() ?? 0}
                    unit="%/s"
                    data={pidOutputData}
                    color="#f97316"
                    icon={<Cpu className="w-3 h-3" />}
                />
                <SparklineMetric
                    label="Surge Pressure"
                    value={typeof physics.surgePressureBar === 'number' ? physics.surgePressureBar : 0}
                    unit="bar"
                    data={surgePressureData}
                    color="#8b5cf6"
                    icon={<Waves className="w-3 h-3" />}
                    threshold={{ warning: 10, alarm: 20 }}
                />
            </div>
        </div>
    );
};

export default TelemetrySparklinePanel;
