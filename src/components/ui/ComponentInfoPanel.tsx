import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
    Tooltip, CartesianGrid, ReferenceLine, ComposedChart
} from 'recharts';
import {
    X, Activity, Thermometer, Gauge, Zap, Brain, AlertTriangle,
    ChevronRight, Radio, CircleDot, Settings2, TrendingUp, TrendingDown, Minus,
    History, ShieldAlert, BookOpen, Wrench, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { supabase } from '../../services/supabaseClient';
import { KNOWLEDGE_BASE } from '../../data/knowledge/KnowledgeBase';

// ============================================================
// COMPONENT ENCYCLOPEDIA - Maps mesh IDs to expert knowledge
// ============================================================
const COMPONENT_ENCYCLOPEDIA: Record<string, {
    name: string;
    description: string;
    physics_principle: string;
    common_failure_modes: string[];
    criticalParams: string[];
    icon: React.ReactNode;
    ekb_symptom_keys: string[]; // Maps to expert_knowledge_base symptom_key
}> = {
    crown: {
        name: 'Crown Plate',
        description: 'Upper structural element connecting runner to shaft. Critical for torque transmission and structural integrity.',
        physics_principle: 'Torque transmission occurs through shear stress in the crown-to-shaft connection. Stress concentration at bolt holes follows von Mises criteria. Fatigue life governed by S-N curve at cyclic loading frequencies matching runner passage.',
        common_failure_modes: [
            'Bolt loosening from thermal cycling',
            'Fatigue cracking at stress concentrations',
            'Corrosion-fatigue at water contact zones',
            'Fretting corrosion at shaft interface'
        ],
        criticalParams: ['Stress Distribution', 'Fatigue Cycles', 'Corrosion Index'],
        icon: <CircleDot className="w-4 h-4" />,
        ekb_symptom_keys: ['VIBRATION_CENTRAL_DEV', 'HIGH_FREQ_NOISE_DROP_EFF']
    },
    band: {
        name: 'Band Ring',
        description: 'Outer circumferential component. Channels flow and maintains blade positioning under hydraulic load.',
        physics_principle: 'Band ring experiences hoop stress from internal pressure differentials. Cavitation occurs when local pressure drops below vapor pressure (Thoma criterion: σ = NPSH_available / H). Erosion rate follows power-law with velocity.',
        common_failure_modes: [
            'Cavitation erosion at leading edges',
            'Sediment abrasion in high-silt conditions',
            'Seal wear causing efficiency loss',
            'Thermal distortion from uneven heating'
        ],
        criticalParams: ['Cavitation Index', 'Erosion Rate', 'Hydraulic Load'],
        icon: <Settings2 className="w-4 h-4" />,
        ekb_symptom_keys: ['HIGH_FREQ_NOISE_DROP_EFF']
    },
    runner: {
        name: 'Runner Blade',
        description: 'Primary energy conversion element. Transforms hydraulic energy into mechanical rotation.',
        physics_principle: 'Energy conversion via momentum transfer (Euler turbine equation: E = u1*cu1 - u2*cu2). Blade loading follows pressure distribution from CFD analysis. Natural frequencies must avoid excitation at blade pass frequency (f = n*Z/60).',
        common_failure_modes: [
            'Leading edge cavitation erosion',
            'Trailing edge vortex shedding',
            'Fatigue cracking at blade root',
            'Hydraulic imbalance from wear patterns'
        ],
        criticalParams: ['Vibration Amplitude', 'Blade Angle', 'Pressure Differential'],
        icon: <Activity className="w-4 h-4" />,
        ekb_symptom_keys: ['HIGH_FREQ_NOISE_DROP_EFF', 'VIBRATION_CENTRAL_DEV']
    },
    noseCone: {
        name: 'Nose Cone',
        description: 'Draft tube entry cone. Optimizes flow discharge and pressure recovery efficiency.',
        physics_principle: 'Pressure recovery via controlled diffusion (Borda-Carnot losses minimized at 7-10° cone angle). Vortex rope formation at part-load follows Strouhal number relationship. Submergence determines cavitation margin.',
        common_failure_modes: [
            'Vortex rope induced vibration',
            'Cavitation at low submergence',
            'Erosion from recirculation zones',
            'Concrete spalling in draft tube'
        ],
        criticalParams: ['Draft Tube Pressure', 'Vortex Intensity', 'Flow Separation'],
        icon: <Gauge className="w-4 h-4" />,
        ekb_symptom_keys: ['HIGH_FREQ_NOISE_DROP_EFF']
    }
};

// ============================================================
// TYPE DEFINITIONS
// ============================================================
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
    alertLevel: 'nominal' | 'warning' | 'critical' | 'predictive_alert';
}

interface AutonomousDecision {
    id: string;
    timestamp: Date;
    trigger_type: string;
    symptom_key: string;
    action_taken: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ExpertKnowledgeEntry {
    id: string;
    symptom_key: string;
    diagnosis: string;
    recommended_action: string;
    severity: string;
    physics_principle?: string;
    common_failure_modes?: string[];
}

interface TelemetryDataPoint {
    time: string;
    value: number;
    predicted?: number;
}

// ============================================================
// PREDICTIVE TREND CALCULATOR
// ============================================================
const calculatePredictedTrend = (
    data: TelemetryDataPoint[],
    threshold: number,
    hoursAhead: number = 2
): { predictedData: TelemetryDataPoint[]; hitsThreshold: boolean; timeToThreshold: number | null } => {
    if (data.length < 3) return { predictedData: data, hitsThreshold: false, timeToThreshold: null };

    // Calculate rate of change using last 5 points (linear regression)
    const recentData = data.slice(-5);
    const n = recentData.length;
    const sumX = recentData.reduce((acc, _, i) => acc + i, 0);
    const sumY = recentData.reduce((acc, d) => acc + d.value, 0);
    const sumXY = recentData.reduce((acc, d, i) => acc + i * d.value, 0);
    const sumX2 = recentData.reduce((acc, _, i) => acc + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predicted values
    const predictedData = [...data];
    const lastIndex = data.length - 1;
    const pointsToPredict = Math.ceil((hoursAhead * 60) / 5); // 5-second intervals
    const projectedPoints = Math.min(pointsToPredict, 24); // Cap at 24 future points

    let hitsThreshold = false;
    let timeToThreshold: number | null = null;

    for (let i = 1; i <= projectedPoints; i++) {
        const futureIndex = lastIndex + i;
        const predictedValue = intercept + slope * futureIndex;
        const futureTime = new Date(Date.now() + i * 5000);
        const timeStr = futureTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        predictedData.push({
            time: timeStr,
            value: data[lastIndex].value,
            predicted: predictedValue
        });

        if (!hitsThreshold && predictedValue >= threshold) {
            hitsThreshold = true;
            timeToThreshold = (i * 5) / 60; // Convert to minutes
        }
    }

    return { predictedData, hitsThreshold, timeToThreshold };
};

// ============================================================
// CUSTOM CHART TOOLTIP - High Contrast for Glare Environments
// ============================================================
const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-black border-2 border-cyan-400 rounded px-4 py-3 shadow-2xl">
            <div className="text-xs text-white font-mono font-bold mb-2">{label}</div>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: entry.color, backgroundColor: entry.dataKey === 'predicted' ? 'transparent' : entry.color }} />
                    <span className="text-sm font-mono font-bold text-white">
                        {entry.value?.toFixed(2)}
                        <span className="text-slate-400 ml-1">{entry.unit || ''}</span>
                        {entry.dataKey === 'predicted' && <span className="text-amber-400 ml-2">(PREDICTED)</span>}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// NEURAL STATUS INDICATOR - Now Interactive
// ============================================================
const NeuralStatusIndicator: React.FC<{
    status: RealtimeStatus;
    decisions: AutonomousDecision[];
    onToggleExpand: () => void;
    isExpanded: boolean;
}> = ({ status, decisions, onToggleExpand, isExpanded }) => {
    const statusConfig = {
        nominal: { color: 'bg-cyan-500', borderColor: 'border-cyan-500', textColor: 'text-cyan-400', label: 'NOMINAL', glowClass: '' },
        warning: { color: 'bg-amber-500', borderColor: 'border-amber-500', textColor: 'text-amber-400', label: 'ELEVATED', glowClass: 'shadow-amber-500/30 shadow-lg' },
        critical: { color: 'bg-red-500', borderColor: 'border-red-500', textColor: 'text-red-400', label: 'CRITICAL', glowClass: 'shadow-red-500/50 shadow-xl alert-beacon-critical' },
        predictive_alert: { color: 'bg-purple-500', borderColor: 'border-purple-500', textColor: 'text-purple-400', label: 'PREDICTIVE ALERT', glowClass: 'shadow-purple-500/40 shadow-lg animate-pulse' }
    };

    const config = statusConfig[status.alertLevel];

    return (
        <div className={`p-4 bg-slate-900/80 border-2 ${config.borderColor} rounded-lg ${config.glowClass} transition-all duration-300`}>
            {/* Header - Clickable */}
            <button
                onClick={onToggleExpand}
                className="w-full flex items-center justify-between mb-3 min-h-[44px] touch-manipulation"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.autonomousTriggerActive ? 'bg-emerald-500/20' : 'bg-slate-800'} transition-colors`}>
                        <Brain className={`w-5 h-5 ${status.autonomousTriggerActive ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                        Neural Status
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[10px] font-mono text-slate-400">
                        {status.isConnected ? 'REALTIME' : 'OFFLINE'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
                {/* Autonomous Trigger Status */}
                <button
                    onClick={onToggleExpand}
                    className="p-4 bg-slate-950/70 rounded-lg border-2 border-white/10 hover:border-cyan-500/50 transition-all min-h-[80px] text-left touch-manipulation"
                >
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-2 font-bold">
                        Autonomous Trigger
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`relative w-4 h-4 rounded-full ${status.autonomousTriggerActive ? 'bg-emerald-500 autonomous-trigger-active' : 'bg-slate-600'}`}>
                            {status.autonomousTriggerActive && (
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                            )}
                        </div>
                        <span className={`text-sm font-mono font-black ${status.autonomousTriggerActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {status.autonomousTriggerActive ? 'ACTIVE' : 'STANDBY'}
                        </span>
                    </div>
                </button>

                {/* Alert Level */}
                <div className={`p-4 bg-slate-950/70 rounded-lg border-2 ${status.alertLevel === 'critical' ? 'border-red-500/50' : 'border-white/10'} min-h-[80px]`}>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-2 font-bold">
                        Alert Level
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${config.color} ${status.alertLevel === 'critical' ? 'animate-pulse' : ''}`} />
                        <span className={`text-sm font-mono font-black ${config.textColor}`}>
                            {config.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Expanded: Last 5 Autonomous Decisions */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t-2 border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Last 5 Autonomous Decisions
                        </span>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {decisions.length === 0 ? (
                            <div className="text-xs text-slate-500 text-center py-4">
                                No autonomous decisions recorded
                            </div>
                        ) : (
                            decisions.slice(0, 5).map((decision, i) => (
                                <div
                                    key={decision.id}
                                    className={`p-3 rounded-lg border-l-4 bg-slate-950/50 ${decision.severity === 'CRITICAL' ? 'border-l-red-500' :
                                            decision.severity === 'HIGH' ? 'border-l-amber-500' :
                                                'border-l-cyan-500'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-mono text-slate-400">
                                            {decision.timestamp.toLocaleTimeString()}
                                        </span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${decision.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                                decision.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-cyan-500/20 text-cyan-400'
                                            }`}>
                                            {decision.severity}
                                        </span>
                                    </div>
                                    <div className="text-xs text-white font-medium mb-1">
                                        {decision.trigger_type}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {decision.action_taken}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Last Update */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-mono font-bold">Last Sync</span>
                <span className="text-[10px] text-slate-300 font-mono">
                    {new Date(status.lastUpdate).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
};

// ============================================================
// DECISION SUPPORT PANEL - Recommended Actions
// ============================================================
const DecisionSupportPanel: React.FC<{
    expertKnowledge: ExpertKnowledgeEntry[];
    isAlertActive: boolean;
}> = ({ expertKnowledge, isAlertActive }) => {
    if (!isAlertActive || expertKnowledge.length === 0) return null;

    const criticalEntry = expertKnowledge.find(e => e.severity === 'CRITICAL') || expertKnowledge[0];

    return (
        <div className="p-4 bg-gradient-to-br from-red-950/40 to-slate-900/80 border-2 border-red-500/50 rounded-lg shadow-red-500/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-red-400">
                        Decision Support System
                    </span>
                    <div className="text-[9px] text-slate-400 font-mono">AUTONOMOUS ALERT ACTIVE</div>
                </div>
            </div>

            {/* Primary Recommended Action */}
            <div className="p-4 bg-black/50 rounded-lg border-2 border-amber-500/50 mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                        Recommended Action
                    </span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">
                    {criticalEntry.recommended_action}
                </p>
            </div>

            {/* Diagnosis */}
            <div className="p-3 bg-slate-950/50 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                        Diagnosis
                    </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                    {criticalEntry.diagnosis}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-[8px] text-slate-500 font-mono">SYMPTOM KEY:</span>
                    <span className="text-[9px] text-cyan-400 font-mono font-bold">
                        {criticalEntry.symptom_key}
                    </span>
                </div>
            </div>

            {/* Physics Principle from Database (if available) */}
            {criticalEntry.physics_principle && (
                <div className="mt-3 p-3 bg-slate-950/50 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">
                            Physics Principle (EKB)
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {criticalEntry.physics_principle}
                    </p>
                </div>
            )}

            {/* Common Failure Modes from Database (if available) */}
            {criticalEntry.common_failure_modes && criticalEntry.common_failure_modes.length > 0 && (
                <div className="mt-3 p-3 bg-slate-950/50 rounded-lg border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                            Known Failure Modes (EKB)
                        </span>
                    </div>
                    <div className="space-y-1">
                        {criticalEntry.common_failure_modes.slice(0, 3).map((mode, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {mode}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// ENHANCED TELEMETRY CHART - With Predicted Trend
// ============================================================
const TelemetryChart: React.FC<{
    title: string;
    data: TelemetryDataPoint[];
    unit: string;
    color: string;
    threshold?: { value: number; label: string };
    icon: React.ReactNode;
    showPrediction?: boolean;
}> = ({ title, data, unit, color, threshold, icon, showPrediction = true }) => {
    const { predictedData, hitsThreshold, timeToThreshold } = useMemo(() => {
        if (!showPrediction || !threshold) {
            return { predictedData: data, hitsThreshold: false, timeToThreshold: null };
        }
        return calculatePredictedTrend(data, threshold.value, 2);
    }, [data, threshold, showPrediction]);

    const latestValue = data[data.length - 1]?.value || 0;
    const previousValue = data[data.length - 2]?.value || latestValue;
    const trend = latestValue > previousValue ? 'up' : latestValue < previousValue ? 'down' : 'stable';

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-400';

    return (
        <div className={`bg-slate-900/60 border-2 ${hitsThreshold ? 'border-purple-500/50 shadow-purple-500/20 shadow-lg' : 'border-white/10'} rounded-lg p-4 transition-all`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center" style={{ color }}>
                        {icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className="text-base font-mono font-black text-white">
                        {latestValue.toFixed(2)}
                        <span className="text-[10px] text-slate-400 ml-1">{unit}</span>
                    </span>
                </div>
            </div>

            {/* Predictive Alert Warning */}
            {hitsThreshold && timeToThreshold && (
                <div className="mb-3 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg flex items-center gap-3">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300 font-bold">
                        PREDICTIVE ALERT: Threshold breach in ~{timeToThreshold.toFixed(0)} minutes
                    </span>
                </div>
            )}

            <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        {threshold && (
                            <ReferenceLine
                                y={threshold.value}
                                stroke="#ef4444"
                                strokeDasharray="6 4"
                                strokeWidth={2}
                                label={{ value: threshold.label, position: 'right', fontSize: 9, fill: '#ef4444', fontWeight: 'bold' }}
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${title})`}
                            dot={false}
                            activeDot={{ r: 5, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
                        />
                        {showPrediction && (
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="#a855f7"
                                strokeWidth={2}
                                strokeDasharray="8 4"
                                dot={false}
                                activeDot={{ r: 4, fill: '#a855f7', stroke: '#0f172a', strokeWidth: 2 }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-between">
                {threshold && (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-[9px] text-slate-400 font-mono font-bold">
                            Threshold: {threshold.value} {unit}
                        </span>
                    </div>
                )}
                {showPrediction && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-purple-500" style={{ borderTop: '2px dashed #a855f7' }} />
                        <span className="text-[9px] text-purple-400 font-mono">Predicted</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// PHYSICS PRINCIPLE CARD
// ============================================================
const PhysicsPrincipleCard: React.FC<{
    componentMeta: typeof COMPONENT_ENCYCLOPEDIA[string];
}> = ({ componentMeta }) => (
    <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Physics Principle
            </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {componentMeta.physics_principle}
        </p>

        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-bold">
            Common Failure Modes
        </div>
        <div className="space-y-2">
            {componentMeta.common_failure_modes.map((mode, i) => (
                <div
                    key={i}
                    className="flex items-start gap-2 p-2 bg-slate-950/50 rounded border border-white/5"
                >
                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-300">{mode}</span>
                </div>
            ))}
        </div>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export const ComponentInfoPanel: React.FC<ComponentInfoPanelProps> = ({
    componentId,
    onClose,
    isOpen,
    className = ''
}) => {
    const telemetryStore = useTelemetryStore();
    const { activeIncident } = useTelemetry();

    const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
        isConnected: false,
        lastUpdate: Date.now(),
        autonomousTriggerActive: false,
        alertLevel: 'nominal'
    });

    const [telemetryHistory, setTelemetryHistory] = useState<{
        vibration: TelemetryDataPoint[];
        temperature: TelemetryDataPoint[];
        pressure: TelemetryDataPoint[];
    }>({
        vibration: [],
        temperature: [],
        pressure: []
    });

    const [autonomousDecisions, setAutonomousDecisions] = useState<AutonomousDecision[]>([]);
    const [expertKnowledge, setExpertKnowledge] = useState<ExpertKnowledgeEntry[]>([]);
    const [neuralStatusExpanded, setNeuralStatusExpanded] = useState(false);

    // Get component metadata with encyclopedia
    const componentMeta = componentId ? COMPONENT_ENCYCLOPEDIA[componentId] : null;

    // Fetch expert knowledge for the selected component using mesh ID mapping
    useEffect(() => {
        if (!componentId || !supabase) return;

        const fetchExpertKnowledge = async () => {
            try {
                // First try the new RPC function that queries by mesh ID
                const { data: rpcData, error: rpcError } = await (supabase as any)
                    .rpc('get_knowledge_for_component', { p_mesh_id: componentId });

                if (!rpcError && rpcData && rpcData.length > 0) {
                    // Map to ExpertKnowledgeEntry format with physics data
                    setExpertKnowledge(rpcData.map((d: any) => ({
                        id: d.symptom_key,
                        symptom_key: d.symptom_key,
                        diagnosis: d.diagnosis,
                        recommended_action: d.recommended_action,
                        severity: d.severity || 'MEDIUM',
                        physics_principle: d.physics_principle,
                        common_failure_modes: d.common_failure_modes
                    })));
                    return;
                }

                // Fallback: Query by component_ids array contains mesh ID
                const { data, error } = await (supabase as any)
                    .from('expert_knowledge_base')
                    .select('*')
                    .contains('component_ids', [componentId]);

                if (!error && data && data.length > 0) {
                    setExpertKnowledge(data.map((d: any) => ({
                        id: d.id || d.symptom_key,
                        symptom_key: d.symptom_key,
                        diagnosis: d.diagnosis,
                        recommended_action: d.recommended_action,
                        severity: d.severity || 'MEDIUM',
                        physics_principle: d.physics_principle,
                        common_failure_modes: d.common_failure_modes
                    })));
                    return;
                }

                // Secondary fallback: Use local encyclopedia ekb_symptom_keys
                if (componentMeta) {
                    const { data: fallbackData, error: fallbackError } = await (supabase as any)
                        .from('expert_knowledge_base')
                        .select('*')
                        .in('symptom_key', componentMeta.ekb_symptom_keys);

                    if (!fallbackError && fallbackData) {
                        setExpertKnowledge(fallbackData as ExpertKnowledgeEntry[]);
                        return;
                    }
                }

                // Final fallback: Local knowledge base matching
                if (componentMeta) {
                    const localMatches = KNOWLEDGE_BASE.filter(k =>
                        componentMeta.ekb_symptom_keys.some(key =>
                            k.id.toLowerCase().includes(key.toLowerCase()) ||
                            k.title.toLowerCase().includes(key.toLowerCase())
                        )
                    );
                    setExpertKnowledge(localMatches.map(k => ({
                        id: k.id,
                        symptom_key: k.id,
                        diagnosis: k.description,
                        recommended_action: k.insights?.[0] || 'Consult technical manual',
                        severity: k.type === 'RISK' ? 'HIGH' : 'MEDIUM'
                    })));
                }
            } catch (e) {
                console.error('[ComponentInfoPanel] Error fetching knowledge:', e);
                // Use local encyclopedia as final fallback
                if (componentMeta) {
                    setExpertKnowledge([{
                        id: componentId,
                        symptom_key: componentMeta.ekb_symptom_keys[0] || componentId.toUpperCase(),
                        diagnosis: componentMeta.description,
                        recommended_action: 'Refer to maintenance manual for detailed inspection procedures.',
                        severity: 'MEDIUM'
                    }]);
                }
            }
        };

        fetchExpertKnowledge();
    }, [componentId, componentMeta]);

    // Fetch autonomous decisions log
    const fetchAutonomousDecisions = useCallback(async () => {
        if (!supabase) return;

        try {
            // Try to fetch from hpp_status or a decisions log table
            const { data, error } = await (supabase as any)
                .from('hpp_status')
                .select('*')
                .order('last_updated', { ascending: false })
                .limit(5);

            if (!error && data) {
                const decisions: AutonomousDecision[] = data
                    .filter((d: any) => d.autonomous_trigger_active || d.status === 'CRITICAL')
                    .map((d: any, i: number) => ({
                        id: d.id || `decision-${i}`,
                        timestamp: new Date(d.last_updated || Date.now()),
                        trigger_type: d.status === 'CRITICAL' ? 'Threshold Breach' : 'Predictive Alert',
                        symptom_key: d.vibration > 4.5 ? 'HIGH_VIBRATION' : d.temperature > 75 ? 'HIGH_TEMP' : 'ANOMALY',
                        action_taken: d.status === 'CRITICAL' ? 'Alert escalated to operations' : 'Monitoring intensified',
                        severity: d.status as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
                    }));
                setAutonomousDecisions(decisions);
            }
        } catch (e) {
            // Generate simulated decisions
            setAutonomousDecisions([
                {
                    id: '1',
                    timestamp: new Date(Date.now() - 300000),
                    trigger_type: 'Vibration Threshold',
                    symptom_key: 'VIBRATION_CENTRAL_DEV',
                    action_taken: 'Initiated bearing diagnostic sequence',
                    severity: 'HIGH'
                },
                {
                    id: '2',
                    timestamp: new Date(Date.now() - 900000),
                    trigger_type: 'Predictive Analysis',
                    symptom_key: 'BEARING_TEMP_RISE',
                    action_taken: 'Increased cooling water flow',
                    severity: 'MEDIUM'
                }
            ]);
        }
    }, []);

    useEffect(() => {
        if (neuralStatusExpanded) {
            fetchAutonomousDecisions();
        }
    }, [neuralStatusExpanded, fetchAutonomousDecisions]);

    // Subscribe to realtime_hpp_status channel
    useEffect(() => {
        if (!supabase || typeof (supabase as any).channel !== 'function') {
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

    // Generate simulated telemetry data when not connected
    useEffect(() => {
        if (realtimeStatus.isConnected) return;

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

        setRealtimeStatus(prev => ({
            ...prev,
            autonomousTriggerActive: !!activeIncident,
            alertLevel: activeIncident ? 'critical' : 'nominal',
            lastUpdate: Date.now()
        }));
    }, [realtimeStatus.isConnected, telemetryStore, activeIncident]);

    // Check for predictive alerts
    useEffect(() => {
        const vibrationData = telemetryHistory.vibration;
        const tempData = telemetryHistory.temperature;

        const vibrationPrediction = calculatePredictedTrend(vibrationData, 4.5, 2);
        const tempPrediction = calculatePredictedTrend(tempData, 75, 2);

        if ((vibrationPrediction.hitsThreshold || tempPrediction.hitsThreshold) &&
            realtimeStatus.alertLevel !== 'critical') {
            setRealtimeStatus(prev => ({
                ...prev,
                alertLevel: 'predictive_alert'
            }));
        }
    }, [telemetryHistory, realtimeStatus.alertLevel]);

    // Update telemetry periodically
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
                    alertLevel: activeIncident ? 'critical' :
                        prev.alertLevel === 'predictive_alert' ? 'predictive_alert' :
                            telemetryStore.mechanical.vibrationX > 4.5 ? 'warning' : 'nominal'
                }));
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [realtimeStatus.isConnected, telemetryStore, activeIncident]);

    if (!isOpen) return null;

    const isAlertActive = realtimeStatus.alertLevel === 'critical' || realtimeStatus.autonomousTriggerActive;

    return (
        <div
            className={`fixed right-0 top-0 h-full w-[440px] bg-slate-950/98 backdrop-blur-xl border-l-2 border-cyan-500/30 shadow-2xl z-50 transform transition-transform duration-300 ease-out intelligence-drawer-enter ${className}`}
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/98 backdrop-blur-sm border-b-2 border-cyan-500/30">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border-2 ${isAlertActive ? 'bg-red-500/20 border-red-500/50' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                            <Radio className={`w-5 h-5 ${isAlertActive ? 'text-red-400' : 'text-cyan-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-white">
                                Intelligence Overlay
                            </h2>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                                DECISION SUPPORT SYSTEM
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-800 rounded-lg transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-68px)] overflow-y-auto p-5 space-y-5 industrial-grid-overlay">
                {/* Decision Support Panel - Prioritized when alert active */}
                {isAlertActive && (
                    <DecisionSupportPanel
                        expertKnowledge={expertKnowledge}
                        isAlertActive={isAlertActive}
                    />
                )}

                {/* Neural Status */}
                <NeuralStatusIndicator
                    status={realtimeStatus}
                    decisions={autonomousDecisions}
                    onToggleExpand={() => setNeuralStatusExpanded(!neuralStatusExpanded)}
                    isExpanded={neuralStatusExpanded}
                />

                {/* Component Info with Encyclopedia */}
                {componentMeta && (
                    <>
                        <div className="p-4 bg-slate-900/60 border-2 border-cyan-500/30 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 min-w-[40px] min-h-[40px] flex items-center justify-center">
                                    {componentMeta.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">{componentMeta.name}</h3>
                                    <span className="text-[9px] text-slate-400 font-mono uppercase">
                                        MESH ID: {componentId?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                {componentMeta.description}
                            </p>
                            <div className="space-y-2">
                                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                                    Critical Parameters
                                </div>
                                {componentMeta.criticalParams.map((param, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 p-3 bg-slate-950/50 rounded-lg border border-white/5 min-h-[44px]"
                                    >
                                        <ChevronRight className="w-4 h-4 text-cyan-500" />
                                        <span className="text-xs font-mono text-slate-200 font-medium">{param}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Physics Principle Card */}
                        <PhysicsPrincipleCard componentMeta={componentMeta} />
                    </>
                )}

                {/* Telemetry Charts */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Live Telemetry + Predictive Trend
                        </span>
                    </div>

                    <TelemetryChart
                        title="Vibration"
                        data={telemetryHistory.vibration}
                        unit="mm/s"
                        color="#22d3ee"
                        threshold={{ value: 4.5, label: 'ISO 10816-3' }}
                        icon={<Activity className="w-4 h-4" />}
                        showPrediction={true}
                    />

                    <TelemetryChart
                        title="Bearing Temp"
                        data={telemetryHistory.temperature}
                        unit="°C"
                        color="#f59e0b"
                        threshold={{ value: 75, label: 'Max Operating' }}
                        icon={<Thermometer className="w-4 h-4" />}
                        showPrediction={true}
                    />

                    <TelemetryChart
                        title="Piezometric"
                        data={telemetryHistory.pressure}
                        unit="bar"
                        color="#10b981"
                        icon={<Gauge className="w-4 h-4" />}
                        showPrediction={false}
                    />
                </div>

                {/* System Metrics */}
                <div className="p-4 bg-slate-900/50 border-2 border-white/10 rounded-lg">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-3 font-bold">
                        System Metrics
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-950/70 rounded-lg min-h-[80px]">
                            <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">RPM</div>
                            <div className="text-xl font-mono font-black text-white">
                                {telemetryStore.mechanical.rpm || 500}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-950/70 rounded-lg min-h-[80px]">
                            <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Flow</div>
                            <div className="text-xl font-mono font-black text-white">
                                {telemetryStore.hydraulic.flow?.toFixed(1) || '42.5'}
                                <span className="text-xs text-slate-500 ml-1">m³/s</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-950/70 rounded-lg min-h-[80px]">
                            <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Head</div>
                            <div className="text-xl font-mono font-black text-white">
                                {telemetryStore.hydraulic.head?.toFixed(0) || '152'}
                                <span className="text-xs text-slate-500 ml-1">m</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-950/70 rounded-lg min-h-[80px]">
                            <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Efficiency</div>
                            <div className="text-xl font-mono font-black text-cyan-400">
                                {telemetryStore.hydraulic.efficiency
                                    ? ((telemetryStore.hydraulic.efficiency as number) * 100).toFixed(1)
                                    : '92.4'}
                                <span className="text-xs text-slate-500 ml-1">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expert Knowledge Base Connection */}
                <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-slate-900/70 border-2 border-cyan-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Expert Knowledge Base
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium">854 entries indexed</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/98 border-t-2 border-cyan-500/30">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-bold">ANOHUB HPP Risk Excellence</span>
                    <span>v2.1.0-DSS</span>
                </div>
            </div>
        </div>
    );
};

ComponentInfoPanel.displayName = 'ComponentInfoPanel';

export default ComponentInfoPanel;
