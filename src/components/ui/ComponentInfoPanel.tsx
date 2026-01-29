import React, { useEffect, useState, useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
    Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import {
    X, Activity, Thermometer, Gauge, Zap, Brain, AlertTriangle,
    ChevronRight, Radio, CircleDot, Settings2, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useTelemetry, TelemetryData } from '../../contexts/TelemetryContext';
import { supabase } from '../../services/supabaseClient';

// Component metadata for turbine parts
const COMPONENT_METADATA: Record<string, {
    name: string;
    description: string;
    criticalParams: string[];
    icon: React.ReactNode;
}> = {
    crown: {
        name: 'Crown Plate',
        description: 'Upper structural element connecting runner to shaft. Critical for torque transmission and structural integrity.',
        criticalParams: ['Stress Distribution', 'Fatigue Cycles', 'Corrosion Index'],
        icon: <CircleDot className="w-4 h-4" />
    },
    band: {
        name: 'Band Ring',
        description: 'Outer circumferential component. Channels flow and maintains blade positioning under hydraulic load.',
        criticalParams: ['Cavitation Index', 'Erosion Rate', 'Hydraulic Load'],
        icon: <Settings2 className="w-4 h-4" />
    },
    runner: {
        name: 'Runner Blade',
        description: 'Primary energy conversion element. Transforms hydraulic energy into mechanical rotation.',
        criticalParams: ['Vibration Amplitude', 'Blade Angle', 'Pressure Differential'],
        icon: <Activity className="w-4 h-4" />
    },
    noseCone: {
        name: 'Nose Cone',
        description: 'Draft tube entry cone. Optimizes flow discharge and pressure recovery efficiency.',
        criticalParams: ['Draft Tube Pressure', 'Vortex Intensity', 'Flow Separation'],
        icon: <Gauge className="w-4 h-4" />
    }
};

interface ComponentInfoPanelProps {
    componentId: string | null;
    onClose: () => void;
    isOpen: boolean;
    className?: string;
}

interface RealtimeStatus {
    isConnected: boolean;
    lastUpdate: number;
    autonomousTriggerActive: boolean;
    alertLevel: 'nominal' | 'warning' | 'critical';
}

// Custom tooltip for charts
const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-950/95 border border-cyan-500/30 rounded px-3 py-2 shadow-xl backdrop-blur-sm">
            <div className="text-[10px] text-slate-400 font-mono mb-1">{label}</div>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-mono text-white">
                        {entry.value?.toFixed(2)} <span className="text-slate-500">{entry.unit || ''}</span>
                    </span>
                </div>
            ))}
        </div>
    );
};

// Neural Status Indicator Component
const NeuralStatusIndicator: React.FC<{ status: RealtimeStatus }> = ({ status }) => {
    const statusConfig = {
        nominal: { color: 'bg-cyan-500', textColor: 'text-cyan-400', label: 'NOMINAL' },
        warning: { color: 'bg-amber-500', textColor: 'text-amber-400', label: 'ELEVATED' },
        critical: { color: 'bg-red-500', textColor: 'text-red-400', label: 'CRITICAL' }
    };

    const config = statusConfig[status.alertLevel];

    return (
        <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                        Neural Status
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[9px] font-mono text-slate-500">
                        {status.isConnected ? 'REALTIME' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Autonomous Trigger Status */}
                <div className="p-3 bg-slate-950/50 rounded border border-white/5">
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider mb-2">
                        Autonomous Trigger
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`relative w-3 h-3 rounded-full ${status.autonomousTriggerActive ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                            {status.autonomousTriggerActive && (
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                            )}
                        </div>
                        <span className={`text-xs font-mono font-bold ${status.autonomousTriggerActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {status.autonomousTriggerActive ? 'ACTIVE' : 'STANDBY'}
                        </span>
                    </div>
                </div>

                {/* Alert Level */}
                <div className="p-3 bg-slate-950/50 rounded border border-white/5">
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider mb-2">
                        Alert Level
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                        <span className={`text-xs font-mono font-bold ${config.textColor}`}>
                            {config.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Last Update */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] text-slate-600 font-mono">Last Sync</span>
                <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(status.lastUpdate).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
};

// Telemetry Chart Component
const TelemetryChart: React.FC<{
    title: string;
    data: { time: string; value: number }[];
    unit: string;
    color: string;
    threshold?: { value: number; label: string };
    icon: React.ReactNode;
}> = ({ title, data, unit, color, threshold, icon }) => {
    const latestValue = data[data.length - 1]?.value || 0;
    const previousValue = data[data.length - 2]?.value || latestValue;
    const trend = latestValue > previousValue ? 'up' : latestValue < previousValue ? 'down' : 'stable';

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-400';

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-800 rounded" style={{ color }}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                    <span className="text-sm font-mono font-bold text-white">
                        {latestValue.toFixed(2)}
                        <span className="text-[9px] text-slate-500 ml-1">{unit}</span>
                    </span>
                </div>
            </div>

            <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 8, fill: '#64748b' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 8, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        {threshold && (
                            <ReferenceLine
                                y={threshold.value}
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${title})`}
                            dot={false}
                            activeDot={{ r: 4, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {threshold && (
                <div className="mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-[8px] text-slate-500 font-mono">
                        Threshold: {threshold.value} {unit} ({threshold.label})
                    </span>
                </div>
            )}
        </div>
    );
};

export const ComponentInfoPanel: React.FC<ComponentInfoPanelProps> = ({
    componentId,
    onClose,
    isOpen,
    className = ''
}) => {
    const telemetryStore = useTelemetryStore();
    const { telemetry, activeIncident } = useTelemetry();

    const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
        isConnected: false,
        lastUpdate: Date.now(),
        autonomousTriggerActive: false,
        alertLevel: 'nominal'
    });

    const [telemetryHistory, setTelemetryHistory] = useState<{
        vibration: { time: string; value: number }[];
        temperature: { time: string; value: number }[];
        pressure: { time: string; value: number }[];
    }>({
        vibration: [],
        temperature: [],
        pressure: []
    });

    // Subscribe to realtime_hpp_status channel
    useEffect(() => {
        if (!supabase || typeof (supabase as any).channel !== 'function') {
            // Fallback for build/CI - simulate connection
            setRealtimeStatus(prev => ({ ...prev, isConnected: false }));
            return;
        }

        const channel = (supabase as any)
            .channel('intelligence_overlay_status')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'hpp_status' },
                (payload: any) => {
                    const data = payload.new as any;
                    if (data) {
                        setRealtimeStatus({
                            isConnected: true,
                            lastUpdate: Date.now(),
                            autonomousTriggerActive: data.autonomous_trigger_active || false,
                            alertLevel: data.status === 'CRITICAL' ? 'critical' :
                                data.status === 'WARNING' ? 'warning' : 'nominal'
                        });

                        // Update telemetry history
                        const timestamp = new Date().toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        });

                        setTelemetryHistory(prev => ({
                            vibration: [...prev.vibration.slice(-19), { time: timestamp, value: data.vibration || 0 }],
                            temperature: [...prev.temperature.slice(-19), { time: timestamp, value: data.temperature || 0 }],
                            pressure: [...prev.pressure.slice(-19), { time: timestamp, value: data.piezometric_pressure || 0 }]
                        }));
                    }
                }
            )
            .subscribe(() => {
                setRealtimeStatus(prev => ({ ...prev, isConnected: true }));
            });

        return () => {
            try { (supabase as any).removeChannel(channel); } catch (e) { /* cleanup */ }
        };
    }, []);

    // Generate simulated telemetry data when not connected to realtime
    useEffect(() => {
        if (realtimeStatus.isConnected) return;

        // Initialize with store data
        const initialVibration = telemetryStore.mechanical.vibrationX || 2.4;
        const initialTemp = telemetryStore.mechanical.bearingTemp || 55;
        const initialPressure = 4.2;

        const generateHistory = (baseValue: number, variance: number) => {
            return Array.from({ length: 20 }, (_, i) => ({
                time: new Date(Date.now() - (19 - i) * 5000).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }),
                value: baseValue + (Math.random() - 0.5) * variance
            }));
        };

        setTelemetryHistory({
            vibration: generateHistory(initialVibration, 0.8),
            temperature: generateHistory(initialTemp, 5),
            pressure: generateHistory(initialPressure, 0.3)
        });

        // Update autonomousTriggerActive based on incident
        setRealtimeStatus(prev => ({
            ...prev,
            autonomousTriggerActive: !!activeIncident,
            alertLevel: activeIncident ? 'critical' : 'nominal',
            lastUpdate: Date.now()
        }));
    }, [realtimeStatus.isConnected, telemetryStore, activeIncident]);

    // Update on telemetry changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (!realtimeStatus.isConnected) {
                const timestamp = new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                const vibBase = telemetryStore.mechanical.vibrationX || 2.4;
                const tempBase = telemetryStore.mechanical.bearingTemp || 55;

                setTelemetryHistory(prev => ({
                    vibration: [...prev.vibration.slice(-19), {
                        time: timestamp,
                        value: vibBase + (Math.random() - 0.5) * 0.5
                    }],
                    temperature: [...prev.temperature.slice(-19), {
                        time: timestamp,
                        value: tempBase + (Math.random() - 0.5) * 3
                    }],
                    pressure: [...prev.pressure.slice(-19), {
                        time: timestamp,
                        value: 4.2 + (Math.random() - 0.5) * 0.2
                    }]
                }));

                setRealtimeStatus(prev => ({
                    ...prev,
                    lastUpdate: Date.now(),
                    autonomousTriggerActive: !!activeIncident,
                    alertLevel: activeIncident ? 'critical' : telemetryStore.mechanical.vibrationX > 4.5 ? 'warning' : 'nominal'
                }));
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [realtimeStatus.isConnected, telemetryStore, activeIncident]);

    const componentMeta = componentId ? COMPONENT_METADATA[componentId] : null;

    if (!isOpen) return null;

    return (
        <div
            className={`fixed right-0 top-0 h-full w-[420px] bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/20 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className}`}
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-cyan-500/20">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
                            <Radio className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-white">
                                Intelligence Overlay
                            </h2>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                REALTIME TELEMETRY INTERFACE
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded transition-colors group"
                    >
                        <X className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-68px)] overflow-y-auto p-5 space-y-5">
                {/* Neural Status */}
                <NeuralStatusIndicator status={realtimeStatus} />

                {/* Component Info (when selected) */}
                {componentMeta && (
                    <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400">
                                {componentMeta.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{componentMeta.name}</h3>
                                <span className="text-[9px] text-slate-500 font-mono uppercase">
                                    ID: {componentId?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            {componentMeta.description}
                        </p>
                        <div className="space-y-2">
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider">
                                Critical Parameters
                            </div>
                            {componentMeta.criticalParams.map((param, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 p-2 bg-slate-950/50 rounded border border-white/5"
                                >
                                    <ChevronRight className="w-3 h-3 text-cyan-500" />
                                    <span className="text-xs font-mono text-slate-300">{param}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Telemetry Charts */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Live Telemetry
                        </span>
                    </div>

                    <TelemetryChart
                        title="Vibration"
                        data={telemetryHistory.vibration}
                        unit="mm/s"
                        color="#22d3ee"
                        threshold={{ value: 4.5, label: 'ISO 10816-3' }}
                        icon={<Activity className="w-3.5 h-3.5" />}
                    />

                    <TelemetryChart
                        title="Bearing Temp"
                        data={telemetryHistory.temperature}
                        unit="°C"
                        color="#f59e0b"
                        threshold={{ value: 75, label: 'Max Operating' }}
                        icon={<Thermometer className="w-3.5 h-3.5" />}
                    />

                    <TelemetryChart
                        title="Piezometric"
                        data={telemetryHistory.pressure}
                        unit="bar"
                        color="#10b981"
                        icon={<Gauge className="w-3.5 h-3.5" />}
                    />
                </div>

                {/* System Metrics */}
                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-lg">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-3">
                        System Metrics
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950/50 rounded">
                            <div className="text-[8px] text-slate-600 uppercase mb-1">RPM</div>
                            <div className="text-lg font-mono font-bold text-white">
                                {telemetryStore.mechanical.rpm || 500}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-950/50 rounded">
                            <div className="text-[8px] text-slate-600 uppercase mb-1">Flow</div>
                            <div className="text-lg font-mono font-bold text-white">
                                {telemetryStore.hydraulic.flow?.toFixed(1) || '42.5'}
                                <span className="text-xs text-slate-500 ml-1">m³/s</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-950/50 rounded">
                            <div className="text-[8px] text-slate-600 uppercase mb-1">Head</div>
                            <div className="text-lg font-mono font-bold text-white">
                                {telemetryStore.hydraulic.head?.toFixed(0) || '152'}
                                <span className="text-xs text-slate-500 ml-1">m</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-950/50 rounded">
                            <div className="text-[8px] text-slate-600 uppercase mb-1">Efficiency</div>
                            <div className="text-lg font-mono font-bold text-cyan-400">
                                {telemetryStore.physics.efficiency 
                                    ? ((telemetryStore.physics.efficiency as number) * 100).toFixed(1) 
                                    : '92.4'}
                                <span className="text-xs text-slate-500 ml-1">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expert Knowledge Connection */}
                <div className="p-4 bg-gradient-to-br from-cyan-950/30 to-slate-900/60 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Expert Knowledge Base
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">854 entries indexed</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-emerald-400 font-mono">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/95 border-t border-cyan-500/20">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span>ANOHUB HPP Risk Excellence</span>
                    <span>v2.0.0-NC9</span>
                </div>
            </div>
        </div>
    );
};

ComponentInfoPanel.displayName = 'ComponentInfoPanel';

export default ComponentInfoPanel;
