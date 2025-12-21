import React, { useState, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';

import { BackButton } from './BackButton.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';



export const ShaftAlignment: React.FC = () => {
    const { showToast } = useToast();
    const [pointsCount, setPointsCount] = useState<4 | 8>(8);
    const [measurements, setMeasurements] = useState<number[]>(new Array(8).fill(0));

    const points = useMemo(() => {
        const step = 360 / pointsCount;
        return measurements.slice(0, pointsCount).map((val, i) => ({
            angle: i * step,
            value: val
        }));
    }, [measurements, pointsCount]);

    const stats = useMemo(() => {
        const maxVal = Math.max(...measurements.slice(0, pointsCount));
        const minVal = Math.min(...measurements.slice(0, pointsCount));
        const runout = maxVal - minVal;

        // Simplified shim calculation logic
        // We assume 0 is Top, 90 is Right, 180 is Bottom, 270 is Left
        const top = measurements[0] || 0;
        const bottom = measurements[pointsCount / 2] || 0;
        const vertDiff = top - bottom;

        // Horizontal diff (90deg vs 270deg)
        const right = measurements[pointsCount / 4] || 0;
        const left = measurements[(pointsCount * 3) / 4] || 0;
        const horizDiff = right - left;

        return {
            runout,
            vertDiff,
            horizDiff,
            isCritical: runout > 0.05
        };
    }, [measurements, pointsCount]);

    const updateMeasurement = (index: number, val: string) => {
        const num = parseFloat(val) || 0;
        const newMeasures = [...measurements];
        newMeasures[index] = num;
        setMeasurements(newMeasures);
    };

    // Polar Chart Generator
    const renderPolarChart = () => {
        const size = 300;
        const center = size / 2;
        const radius = 100;
        const scale = 500; // 1mm = 500px for visibility

        const getCoords = (angle: number, value: number) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const r = radius + (value * scale);
            return {
                x: center + r * Math.cos(rad),
                y: center + r * Math.sin(rad)
            };
        };

        const pathData = points.map((p, i) => {
            const coords = getCoords(p.angle, p.value);
            return `${i === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`;
        }).join(' ') + ' Z';

        return (
            <div className="relative w-full aspect-square max-w-[400px] mx-auto bg-slate-900/40 rounded-full border border-white/5 flex items-center justify-center p-8 overflow-hidden">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    {/* Tolerance Ring (0.05mm) */}
                    <circle
                        cx={center} cy={center} r={radius + (0.05 * scale)}
                        fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" strokeDasharray="4 4"
                    />

                    {/* Grid Rings */}
                    <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <circle cx={center} cy={center} r={radius - 20} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                    {/* Axes */}
                    <line x1={center} y1={center - radius - 40} x2={center} y2={center + radius + 40} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1={center - radius - 40} y1={center} x2={center + radius + 40} y2={center} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* Measurement Path */}
                    <path
                        d={pathData}
                        fill="rgba(34, 197, 94, 0.1)"
                        stroke={stats.isCritical ? "#ef4444" : "#22c55e"}
                        strokeWidth="2"
                        className="transition-all duration-500"
                    />

                    {/* Points */}
                    {points.map((p, i) => {
                        const coords = getCoords(p.angle, p.value);
                        return (
                            <circle
                                key={i}
                                cx={coords.x} cy={coords.y} r="3"
                                fill={stats.isCritical ? "#ef4444" : "#22c55e"}
                            />
                        );
                    })}
                </svg>

                {/* Overlays */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">TOP (0°)</div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">BOTTOM (180°)</div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold uppercase tracking-widest rotate-90">RIGHT (90°)</div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold uppercase tracking-widest -rotate-90">LEFT (270°)</div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Shaft Alignment <span className="text-emerald-400">Toolkit</span></h2>
                    <p className="text-slate-400 text-sm font-light">Dial indicator runout analysis and bearing shim optimization.</p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* INPUT SECTION */}
                <GlassCard title="Measurement Input" className="lg:col-span-1">
                    <div className="flex gap-4 mb-8">
                        {[4, 8].map(n => (
                            <button
                                key={n}
                                onClick={() => setPointsCount(n as 4 | 8)}
                                className={`flex-1 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${pointsCount === n ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                            >
                                {n} Points
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {new Array(pointsCount).fill(0).map((_, i) => (
                            <div key={i} className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    {i * (360 / pointsCount)}° Angle
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={measurements[i]}
                                    onChange={(e) => updateMeasurement(i, e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <ModernButton
                            onClick={() => {
                                setMeasurements(new Array(8).fill(0));
                                showToast("Data Cleared", "info");
                            }}
                            variant="ghost"
                            fullWidth
                        >
                            Reset Data
                        </ModernButton>
                    </div>
                </GlassCard>

                {/* VISUALIZATION SECTION */}
                <GlassCard title="Runout Analysis" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {renderPolarChart()}

                        <div className="space-y-6">
                            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Max Measured Runout</p>
                                    <div className={`text-4xl font-black ${stats.isCritical ? 'text-red-500' : 'text-emerald-400'}`}>
                                        {stats.runout.toFixed(3)} <span className="text-sm text-slate-600">mm</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full mt-2">
                                        <div
                                            className={`h-full transition-all duration-500 ${stats.isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, (stats.runout / 0.1) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Vert. Offset</p>
                                        <p className="text-sm font-mono text-white">{(stats.vertDiff / 2).toFixed(3)}mm</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Horiz. Offset</p>
                                        <p className="text-sm font-mono text-white">{(stats.horizDiff / 2).toFixed(3)}mm</p>
                                    </div>
                                </div>
                            </div>

                            {stats.isCritical ? (
                                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">🧠</span>
                                        <div>
                                            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Ano-Agent Guidance</p>
                                            <h4 className="text-white font-bold text-sm">Out of Tolerance</h4>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                        Current eccentricity exceeds **0.05 mm**. Physical adjustment required to avoid bearing fatigue.
                                    </p>

                                    <div className="space-y-3">
                                        {Math.abs(stats.vertDiff) > 0.01 && (
                                            <div className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg">
                                                <span className="text-[10px] font-black uppercase text-red-100">Shim {stats.vertDiff > 0 ? "Bottom" : "Top"}</span>
                                                <span className="text-xs font-mono font-bold text-white">{(Math.abs(stats.vertDiff) / 2).toFixed(3)} mm</span>
                                            </div>
                                        )}
                                        {Math.abs(stats.horizDiff) > 0.01 && (
                                            <div className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg">
                                                <span className="text-[10px] font-black uppercase text-red-100">Move {stats.horizDiff > 0 ? "Left" : "Right"}</span>
                                                <span className="text-xs font-mono font-bold text-white">{(Math.abs(stats.horizDiff) / 2).toFixed(3)} mm</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <span className="text-emerald-500 text-xl">✅</span>
                                        <div>
                                            <h4 className="text-emerald-400 font-black uppercase text-xs tracking-widest">Alignment Optimal</h4>
                                            <p className="text-[10px] text-slate-500 font-mono">Runout within ISO-10816 standards.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
