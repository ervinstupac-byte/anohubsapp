import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Zap } from 'lucide-react';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';

interface AlignmentVisualizerProps {
    alignment: number; // mm/m
    angle?: number; // degrees, if available
    size?: number;
}

export const AlignmentVisualizer: React.FC<AlignmentVisualizerProps> = ({
    alignment,
    angle = 45,
    size = 300
}) => {
    const [showThermal, setShowThermal] = useState(false);
    const { thermal } = useEngineeringMath();

    const goldenLimit = 0.05;
    const warningLimit = 0.08;
    const failureLimit = 0.12;

    // Scale: failureLimit maps to 80% of radius
    const radius = size / 2;
    const scaleFactor = (radius * 0.8) / failureLimit;

    const targetX = useMemo(() => {
        const rad = (angle * Math.PI) / 180;
        return (alignment * scaleFactor) * Math.cos(rad);
    }, [alignment, angle, scaleFactor]);

    const targetY = useMemo(() => {
        const rad = (angle * Math.PI) / 180;
        return (alignment * scaleFactor) * Math.sin(rad);
    }, [alignment, angle, scaleFactor]);

    const isOutsideGolden = alignment > goldenLimit;

    return (
        <div style={{ width: size, height: size }} className="relative bg-slate-950 rounded-full border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Grid Circles */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Failure Zone (Outer) */}
                <div
                    className="absolute border border-red-500/20 rounded-full"
                    style={{ width: failureLimit * scaleFactor * 2, height: failureLimit * scaleFactor * 2 }}
                />
                {/* Warning Zone */}
                <div
                    className="absolute border border-amber-500/30 rounded-full"
                    style={{ width: warningLimit * scaleFactor * 2, height: warningLimit * scaleFactor * 2 }}
                />

                {/* Golden Standard Circle (0.05 mm/m) */}
                <div
                    className={`absolute border-2 rounded-full z-20 ${isOutsideGolden ? 'border-cyan-500/40' : 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]'}`}
                    style={{
                        width: goldenLimit * scaleFactor * 2,
                        height: goldenLimit * scaleFactor * 2
                    }}
                >
                    {!isOutsideGolden && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter opacity-40">Precision</div>
                        </div>
                    )}
                </div>

                {/* Longevity Loss Zone Highlight */}
                {isOutsideGolden && (
                    <div
                        className="absolute rounded-full bg-gradient-to-r from-red-500/10 to-transparent animate-pulse z-10"
                        style={{
                            width: alignment * scaleFactor * 2,
                            height: alignment * scaleFactor * 2,
                            opacity: 0.3
                        }}
                    />
                )}

                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-white/5" />
                <div className="absolute h-full w-[1px] bg-white/5" />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Alignment Matrix (mm/m)
            </div>

            {/* Dynamic Target Point */}
            <motion.div
                animate={{ x: targetX, y: -targetY }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={`absolute w-4 h-4 rounded-full border-2 z-30 flex items-center justify-center shadow-lg ${isOutsideGolden ? 'border-red-500 bg-red-950' : 'border-emerald-400 bg-emerald-950'}`}
            >
                <div className={`w-1 h-1 rounded-full ${isOutsideGolden ? 'bg-red-500' : 'bg-emerald-400'}`} />
            </motion.div>

            {/* Thermal Projected Point (Ghost) */}
            {showThermal && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: 0.6,
                        scale: 1,
                        x: targetX + (thermal.growthMM * scaleFactor * 0.5), // Projected shift
                        y: -targetY - (thermal.growthMM * scaleFactor * 0.3)  // Projected rise
                    }}
                    className="absolute w-4 h-4 rounded-full border-2 border-dashed border-cyan-400 z-20 flex items-center justify-center"
                >
                    <Thermometer className="w-2 h-2 text-cyan-400" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-900/80 text-[7px] font-black px-1 rounded border border-cyan-500/50">
                        Projected @ {thermal.targetTemp}°C
                    </div>
                </motion.div>
            )}

            {/* Thermal Control Toggle */}
            <button
                onClick={() => setShowThermal(!showThermal)}
                className={`absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all z-50 ${showThermal ? 'bg-cyan-600 border-white text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/40 border-white/10 text-slate-400'}`}
            >
                <Thermometer className={`w-3 h-3 ${showThermal ? 'animate-pulse' : ''}`} />
                <span className="text-[8px] font-black uppercase tracking-widest">Thermal Comp</span>
            </button>

            {/* Reading HUD */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-40">
                <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase">Current Deviation</div>
                    <div className={`text-xl font-black tabular-nums italic ${isOutsideGolden ? 'text-red-500' : 'text-emerald-400'}`}>
                        {alignment.toFixed(3)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black text-slate-500 uppercase">Status</div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${isOutsideGolden ? 'text-amber-500' : 'text-cyan-400'}`}>
                        {isOutsideGolden ? 'Longevity Loss' : 'Heritage Optimal'}
                    </div>
                </div>
            </div>

            {/* Longevity Loss Zone Label */}
            {isOutsideGolden && (
                <div className="absolute top-1/2 left-1/2 translate-x-[40px] -translate-y-[40px] rotate-12 z-40">
                    <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-xl uppercase tracking-tighter animate-bounce">
                        Longevity Loss Zone
                    </div>
                </div>
            )}
        </div>
    );
};
