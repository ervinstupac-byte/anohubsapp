import React, { useEffect, useState } from 'react';
import { Activity, Zap, Database, Brain, Target } from 'lucide-react';

interface SovereignPulseProps {
    kernelActive?: boolean;
    lastLatency?: number;
    currentStage?: string;
}

export const SovereignPulse: React.FC<SovereignPulseProps> = ({
    kernelActive = true,
    lastLatency = 12.4,
    currentStage = 'DIAGNOSE'
}) => {
    const [pulse, setPulse] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const layers = [
        { name: 'FOUNDATION', icon: Database, color: 'cyan', description: 'Telemetry Intake' },
        { name: 'MIDDLE', icon: Brain, color: 'purple', description: 'Decision Engine' },
        { name: 'UNIT', icon: Target, color: 'emerald', description: 'Action Execution' }
    ];

    return (
        <div className="w-full bg-slate-950/95 border border-indigo-500/30 rounded-lg p-6 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-0.5 bg-gradient-to-t from-transparent via-indigo-500 to-transparent"
                        style={{
                            left: `${(i * 5)}%`,
                            height: `${50 + Math.sin((pulse + i * 10) / 10) * 30}%`,
                            bottom: 0,
                            opacity: 0.6,
                            transition: 'height 0.3s ease-out'
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg animate-pulse">
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-sm font-mono font-bold uppercase tracking-widest text-indigo-300">
                                Sovereign Kernel
                            </div>
                            <div className="text-xs text-indigo-500/70 font-mono">
                                Vertical Synthesis Active
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400">Latency:</span>
                        <span className="text-emerald-400 font-bold">{lastLatency.toFixed(1)}ms</span>
                    </div>
                </div>

                {/* 3D Layer Visualization */}
                <div className="space-y-4">
                    {layers.map((layer, idx) => {
                        const isActive = currentStage === layer.name;
                        const Icon = layer.icon;

                        return (
                            <div
                                key={layer.name}
                                className={`
                                    relative p-4 rounded-lg border-2 transition-all duration-300
                                    ${isActive
                                        ? `bg-${layer.color}-950/80 border-${layer.color}-500 shadow-lg shadow-${layer.color}-500/20`
                                        : 'bg-slate-900/50 border-slate-700'}
                                `}
                                style={{
                                    transform: `perspective(1000px) rotateX(${-5 * (2 - idx)}deg) translateZ(${idx * 20}px)`,
                                    marginLeft: `${idx * 20}px`
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${isActive ? `text-${layer.color}-400` : 'text-slate-500'}`} />
                                        <div>
                                            <div className={`text-sm font-bold font-mono ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                {layer.name}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">
                                                {layer.description}
                                            </div>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <Zap className={`w-4 h-4 text-${layer.color}-400 animate-pulse`} />
                                    )}
                                </div>

                                {/* Data flow indicator */}
                                {idx < layers.length - 1 && (
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                                        <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-transparent animate-pulse" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Status Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {kernelActive ? 'Reactive Pipeline Active' : 'Standby'}
                    </div>
                    <div className="text-indigo-400 font-mono">
                        Foundation ⟹ Middle ⟹ Unit
                    </div>
                </div>
            </div>
        </div>
    );
};
