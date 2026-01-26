import React from 'react';
import { motion } from 'framer-motion';
// MIGRATED: From useProjectEngine to specialized stores
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

export const FrancisHillChart: React.FC = () => {
    // MIGRATION: Replaced useProjectEngine with useTelemetryStore
    const { hydraulic, mechanical } = useTelemetryStore();

    // Core Parameters (with null safety)
    const flow = hydraulic?.flow || 42.5;
    const head = hydraulic?.head || 152.0;
    const efficiency = hydraulic?.efficiency || 0.92;
    const rpm = mechanical?.rpm || 500;

    // MHE Calibration: Convert Physical units to SVG coordinates (0-400)
    // Assume MHE Flow Range: 0 - 15 m3/s (Typical for <5MW)
    // Assume MHE Head Range: 0 - 100 m
    const x = (flow / 15) * 400;
    const y = 400 - (head / 100) * 400;

    // Center point for MHE BEP (Higher specific speed ns)
    const bepX = (10 / 15) * 400; // 10 m3/s
    const bepY = 400 - (65 / 100) * 400; // 65 m

    const isInefficient = efficiency < 0.88;
    const isOverSpeed = rpm > 750; // Critical over-speed for small horizontal units (>150% of 500)

    return (
        <div className="relative w-full aspect-square bg-slate-900/50 rounded-2xl border border-white/10 p-6 overflow-hidden">
            <div className="absolute top-4 left-6 z-10">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Live Hill Chart // Topology v4.2
                </h3>
            </div>

            <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                    <linearGradient id="hillGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* GRID LINES */}
                {[...Array(5)].map((_, i) => (
                    <React.Fragment key={i}>
                        <line x1="0" y1={i * 100} x2="400" y2={i * 100} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <line x1={i * 100} y1="0" x2={i * 100} y2="400" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    </React.Fragment>
                ))}

                {/* EFFICIENCY CONTOURS (Hill Visualization) */}
                <ellipse cx={bepX} cy={bepY} rx="150" ry="120" fill="url(#hillGrad)" stroke="rgba(45, 212, 191, 0.2)" strokeWidth="1" />
                <ellipse cx={bepX} cy={bepY} rx="100" ry="80" fill="rgba(45, 212, 191, 0.05)" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="1" />
                <ellipse cx={bepX} cy={bepY} rx="50" ry="40" fill="rgba(45, 212, 191, 0.1)" stroke="rgba(45, 212, 191, 0.5)" strokeWidth="2" />

                {/* BEP TARGET CROSSHAIR */}
                <line x1={bepX - 10} y1={bepY} x2={bepX + 10} y2={bepY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1={bepX} y1={bepY - 10} x2={bepX} y2={bepY + 10} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <text x={bepX + 12} y={bepY - 10} fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">BEP</text>

                {/* LIVE OPERATING POINT */}
                <motion.g
                    initial={{ x: 200, y: 200 }}
                    animate={{ x, y }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    {/* Ripple Effect for focus */}
                    <motion.circle
                        r="12"
                        stroke={isInefficient ? "#f59e0b" : "#2dd4bf"}
                        strokeWidth="2"
                        fill="none"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <circle r="6" fill={isInefficient ? "#f59e0b" : "#2dd4bf"} className="shadow-lg" />

                    {/* Data Label */}
                    <g transform="translate(10, -10)">
                        <rect width="70" height="30" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255,255,255,0.1)" />
                        <text x="5" y="12" fill="white" fontSize="9" fontWeight="bold">{(efficiency * 100).toFixed(1)}% Eff</text>
                        <text x="5" y="24" fill="#94a3b8" fontSize="8">{flow.toFixed(1)} m³/s</text>
                    </g>
                </motion.g>

                {/* AXIS LABELS */}
                <text x="5" y="390" fill="rgba(255,255,255,0.4)" fontSize="10" fontStyle="italic">FLOW (m³/s)</text>
                <text x="10" y="20" fill="rgba(255,255,255,0.4)" fontSize="10" fontStyle="italic" transform="rotate(90, 10, 20)">HEAD (m)</text>
            </svg>

            {/* STATUS ALERT */}
            <div className="absolute bottom-4 left-6 right-6 space-y-2">
                {isInefficient && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-500/10 border border-amber-500/30 p-2 rounded flex items-center justify-between"
                    >
                        <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Efficiency Violation</span>
                        <span className="text-[10px] text-white font-mono">FINANCIAL_LOSS_ACTIVE</span>
                    </motion.div>
                )}

                {isOverSpeed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 p-2 rounded flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                        <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Over-speed (Pobjeg)</span>
                        <span className="text-[10px] text-white font-mono animate-pulse">CRITICAL_STOP_RECOMMENDED</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
