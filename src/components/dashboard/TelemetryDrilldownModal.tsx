import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, Wrench, Info, Zap, Microscope, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useAssetContext } from '../../contexts/AssetContext';
import idAdapter from '../../utils/idAdapter';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

interface TelemetryDrilldownModalProps {
    isOpen: boolean;
    onClose: () => void;
    metricKey: 'labyrinth' | 'babbitt' | 'shaftLift' | 'oilTan' | 'overhaul';
    metricLabel: string;
    currentValue: number;
    threshold: { warning?: number; critical: number };
    unit: string;
    status: 'nominal' | 'warning' | 'critical';
}

// Generate realistic 30-day trend data with noise
const generateTrendData = (
    baseValue: number,
    threshold: { warning?: number; critical: number },
    assetId: number,
    days: number = 30
): { day: number; value: number }[] => {
    const data: { day: number; value: number }[] = [];
    const criticalPoint = threshold.critical;
    const warningPoint = threshold.warning || criticalPoint * 0.85;
    const seed = String(assetId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variance = (seed % 10) / 100;

    for (let i = 0; i < days; i++) {
        const progress = i / days;
        const trendBase = baseValue * (0.7 + 0.3 * progress);
        const noise = (Math.sin(i * 0.5 + seed) * 0.5 + Math.random() - 0.5) * trendBase * (0.05 + variance);
        let spike = 0;
        if (i > days * 0.7 && baseValue > warningPoint) {
            spike = Math.random() > 0.8 ? trendBase * 0.12 : 0;
        }
        data.push({ day: i + 1, value: Math.max(0, trendBase + noise + spike) });
    }
    data[days - 1].value = baseValue;
    return data;
};

export const TelemetryDrilldownModal: React.FC<TelemetryDrilldownModalProps> = ({
    isOpen,
    onClose,
    metricKey,
    metricLabel,
    currentValue,
    threshold,
    unit,
    status
}) => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const [isLive, setIsLive] = React.useState(true);
    const [forensicMode, setForensicMode] = React.useState(false);
    const [activeData, setActiveData] = React.useState<{ day: number; value: number }[]>([]);

    useEffect(() => {
        if (!selectedAsset) return;
        const numericId = idAdapter.toNumber(selectedAsset.id) || 0;
        const initialData = generateTrendData(currentValue, threshold, numericId);
        setActiveData(initialData);
    }, [currentValue, threshold, selectedAsset?.id]);

    useEffect(() => {
        if (!isLive || !isOpen) return;
        const interval = setInterval(() => {
            setActiveData(prev => {
                if (prev.length === 0) return prev;
                const nextDay = prev[prev.length - 1].day + 1;
                const lastValue = prev[prev.length - 1].value;
                const change = (Math.random() - 0.5) * (lastValue * 0.05);
                const newValue = Math.max(0, lastValue + change);
                const newPoint = { day: nextDay, value: newValue };
                return [...prev.slice(1), newPoint];
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isLive, isOpen]);

    if (!isOpen) return null;

    const getStatusColor = () => {
        switch (status) {
            case 'critical': return 'text-red-400';
            case 'warning': return 'text-amber-400';
            default: return 'text-emerald-400';
        }
    };

    const getGradientColor = () => {
        switch (status) {
            case 'critical': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#10b981';
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-4xl"
                >
                    <GlassCard className="border-cyan-500/30 overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${getStatusColor()}`}>
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-wide">{metricLabel}</h2>
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                        <span>SENSOR_ID: {metricKey.toUpperCase()}_01</span>
                                        <span className="text-slate-600">|</span>
                                        <span className={isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}>
                                            {isLive ? 'LIVE STREAMING' : 'OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setForensicMode(!forensicMode)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                                        forensicMode 
                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Microscope className="w-4 h-4" />
                                    <span className="text-xs font-bold">FORENSIC</span>
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Chart */}
                            <div className="lg:col-span-2 h-[350px] bg-slate-900/50 rounded-xl border border-white/5 p-4 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activeData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={getGradientColor()} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={getGradientColor()} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis dataKey="day" hide />
                                        <YAxis domain={[0, 'auto']} stroke="#475569" fontSize={10} tickFormatter={(val) => `${val.toFixed(1)}${unit}`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                            formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, metricLabel]}
                                            labelFormatter={(label) => `T-${30 - Number(label)} Days`}
                                        />
                                        <ReferenceLine y={threshold.critical} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRITICAL', fill: '#ef4444', fontSize: 10 }} />
                                        {threshold.warning && (
                                            <ReferenceLine y={threshold.warning} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'WARNING', fill: '#f59e0b', fontSize: 10 }} />
                                        )}
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={getGradientColor()} 
                                            fillOpacity={1} 
                                            fill="url(#colorValue)" 
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                
                                {forensicMode && (
                                    <div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 rounded p-2 backdrop-blur-md">
                                        <div className="text-[10px] font-mono text-purple-200">
                                            <div>σ (Sigma): 1.42</div>
                                            <div>Noise Floor: -80dB</div>
                                            <div>Sample Rate: 10Hz</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats Panel */}
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
                                    <div className="text-sm text-slate-400 mb-1">Current Value</div>
                                    <div className={`text-4xl font-black ${getStatusColor()} flex items-end gap-2`}>
                                        {currentValue.toFixed(2)}
                                        <span className="text-lg font-bold text-slate-500 mb-1.5">{unit}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Trend (30d)</span>
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            +4.2%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Peak (24h)</span>
                                        <span className="text-white font-mono">{(currentValue * 1.1).toFixed(2)} {unit}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Forecast</span>
                                        <span className="text-amber-400 font-bold flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            14 Days to Limit
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all group"
                                    onClick={() => setIsLive(!isLive)}
                                >
                                    {isLive ? <Zap className="w-4 h-4 text-amber-400" /> : <Zap className="w-4 h-4 text-slate-600" />}
                                    {isLive ? 'PAUSE LIVE FEED' : 'RESUME LIVE FEED'}
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
