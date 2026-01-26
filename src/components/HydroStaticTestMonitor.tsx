// Hydro-Static Test Monitor - Real-time Pressure Drop Analysis
// Detects micro-cracks, air in system, seal leaks

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { CommissioningService } from '../services/CommissioningService';

interface HydroStaticTestMonitorProps {
    sessionId: string;
    onComplete: () => void;
}

export const HydroStaticTestMonitor: React.FC<HydroStaticTestMonitorProps> = ({ sessionId, onComplete }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [initialPressure, setInitialPressure] = useState(150); // bar
    const [readings, setReadings] = useState<Array<{ time: number; pressure: number }>>([]);
    const [testResult, setTestResult] = useState<any>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && startTime) {
            intervalRef.current = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000; // seconds

                // Simulate pressure drop (with some noise for realism)
                const dropRate = 0.3; // bar/min (normal seal leak)
                const noise = (Math.random() - 0.5) * 0.05;
                const pressure = initialPressure - (dropRate / 60) * elapsed + noise;

                setReadings(prev => [...prev, { time: elapsed, pressure }]);

                // Auto-stop after 5 minutes
                if (elapsed >= 300) {
                    stopTest();
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, startTime, initialPressure]);

    const startTest = () => {
        setIsRunning(true);
        setStartTime(Date.now());
        setReadings([{ time: 0, pressure: initialPressure }]);
        setTestResult(null);
    };

    const stopTest = async () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Analyze results
        if (readings.length > 10) {
            const result = await CommissioningService.logHydroStaticTest(
                sessionId,
                readings,
                initialPressure
            );
            setTestResult(result);
            onComplete();
        }
    };

    const currentPressure = readings.length > 0 ? readings[readings.length - 1].pressure : initialPressure;
    const elapsedTime = readings.length > 0 ? readings[readings.length - 1].time : 0;
    const dropRate = readings.length > 10
        ? ((readings[0].pressure - currentPressure) / elapsedTime) * 60
        : 0;

    return (
        <GlassCard>
            <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Hydro-Static</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                        Test Logger
                    </span>
                </h3>
                <p className="text-sm text-slate-400">
                    Monitor pressure drop to detect micro-cracks or air in system
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Controls & Metrics */}
                <div className="space-y-4">
                    {/* Initial Pressure Input */}
                    {!isRunning && readings.length === 0 && (
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                                Initial Test Pressure (bar)
                            </label>
                            <input
                                type="number"
                                value={initialPressure}
                                onChange={(e) => setInitialPressure(parseFloat(e.target.value) || 150)}
                                step="10"
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    )}

                    {/* Start/Stop Controls */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        {!isRunning ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startTest}
                                disabled={readings.length > 0}
                                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-black uppercase text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                            >
                                <Play className="w-5 h-5" />
                                Start Test
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={stopTest}
                                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg font-black uppercase text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/50 transition-all"
                            >
                                <Square className="w-5 h-5" />
                                Stop Test
                            </motion.button>
                        )}
                    </div>

                    {/* Live Metrics */}
                    <div className="space-y-3">
                        <MetricCard
                            label="Current Pressure"
                            value={`${currentPressure.toFixed(2)} bar`}
                            color="cyan"
                            isLive={isRunning}
                        />
                        <MetricCard
                            label="Elapsed Time"
                            value={`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toFixed(0).padStart(2, '0')}`}
                            color="purple"
                            isLive={isRunning}
                        />
                        <MetricCard
                            label="Drop Rate"
                            value={`${dropRate.toFixed(3)} bar/min`}
                            color={dropRate > 0.5 ? 'red' : dropRate > 0.2 ? 'orange' : 'emerald'}
                            isLive={isRunning}
                        />
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-lg border-2 ${testResult.isLinear
                                ? 'bg-emerald-950/20 border-emerald-500'
                                : 'bg-red-950/20 border-red-500'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {testResult.isLinear ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                )}
                                <p className="text-sm font-bold text-white">
                                    {testResult.isLinear ? 'Linear Drop - Normal' : 'Non-Linear Drop!'}
                                </p>
                            </div>
                            {testResult.suspectedIssue && (
                                <div className="mt-2 p-2 bg-red-950/30 rounded">
                                    <p className="text-xs text-red-300 font-bold mb-1">🤖 ANO-AGENT:</p>
                                    <p className="text-xs text-slate-300">
                                        Sumnja na {testResult.suspectedIssue === 'MICROCRACK' ? 'mikropukotinu' :
                                            testResult.suspectedIssue === 'AIR_IN_SYSTEM' ? 'zrak u sistemu' :
                                                'curenje brtvila'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Right: Pressure Graph */}
                <div className="lg:col-span-2">
                    <PressureGraph readings={readings} initialPressure={initialPressure} isLinear={testResult?.isLinear} />
                </div>
            </div>
        </GlassCard>
    );
};

// ===== HELPER COMPONENTS =====

const MetricCard: React.FC<{
    label: string;
    value: string;
    color: string;
    isLive?: boolean;
}> = ({ label, value, color, isLive }) => {
    const colorClasses = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        emerald: 'text-emerald-400',
        orange: 'text-orange-400',
        red: 'text-red-400'
    };

    return (
        <div className={`p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 ${isLive ? 'animate-pulse' : ''}`}>
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</p>
            <p className={`text-xl font-black ${colorClasses[color as keyof typeof colorClasses]}`}>
                {value}
            </p>
        </div>
    );
};

const PressureGraph: React.FC<{
    readings: Array<{ time: number; pressure: number }>;
    initialPressure: number;
    isLinear?: boolean;
}> = ({ readings, initialPressure, isLinear }) => {
    const width = 600;
    const height = 400;
    const padding = 40;

    if (readings.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-500">Start test to see pressure graph...</p>
            </div>
        );
    }

    const maxTime = Math.max(...readings.map(r => r.time), 60);
    const minPressure = Math.min(...readings.map(r => r.pressure)) - 5;
    const maxPressure = initialPressure + 5;

    const xScale = (time: number) => padding + (time / maxTime) * (width - 2 * padding);
    const yScale = (pressure: number) => height - padding - ((pressure - minPressure) / (maxPressure - minPressure)) * (height - 2 * padding);

    // Linear regression line
    const n = readings.length;
    const sumX = readings.reduce((sum, r) => sum + r.time, 0);
    const sumY = readings.reduce((sum, r) => sum + r.pressure, 0);
    const sumXY = readings.reduce((sum, r) => sum + r.time * r.pressure, 0);
    const sumXX = readings.reduce((sum, r) => sum + r.time * r.time, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase font-bold mb-3 text-center">Pressure vs Time</p>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(i => {
                    const time = (maxTime / 5) * i;
                    return (
                        <g key={i}>
                            <line
                                x1={xScale(time)}
                                y1={padding}
                                x2={xScale(time)}
                                y2={height - padding}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                            />
                            <text
                                x={xScale(time)}
                                y={height - padding + 20}
                                textAnchor="middle"
                                fill="#94a3b8"
                                fontSize="12"
                            >
                                {Math.floor(time)}s
                            </text>
                        </g>
                    );
                })}

                {/* Pressure axis labels */}
                {[0, 1, 2, 3, 4].map(i => {
                    const pressure = minPressure + ((maxPressure - minPressure) / 4) * i;
                    return (
                        <text
                            key={i}
                            x={padding - 10}
                            y={yScale(pressure)}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fill="#94a3b8"
                            fontSize="12"
                        >
                            {pressure.toFixed(0)}
                        </text>
                    );
                })}

                {/* Linear regression line */}
                {isLinear !== undefined && (
                    <line
                        x1={xScale(0)}
                        y1={yScale(intercept)}
                        x2={xScale(maxTime)}
                        y2={yScale(slope * maxTime + intercept)}
                        stroke={isLinear ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                )}

                {/* Actual pressure curve */}
                <path
                    d={readings.map((r, i) =>
                        `${i === 0 ? 'M' : 'L'} ${xScale(r.time)} ${yScale(r.pressure)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                />

                {/* Data points */}
                {readings.map((r, i) => (
                    <circle
                        key={i}
                        cx={xScale(r.time)}
                        cy={yScale(r.pressure)}
                        r="3"
                        fill="#06b6d4"
                    />
                ))}
            </svg>
        </div>
    );
};
