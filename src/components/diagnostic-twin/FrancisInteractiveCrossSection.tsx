import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProjectEngine } from '../../contexts/ProjectContext';

export const FrancisInteractiveCrossSection: React.FC = () => {
    const { technicalState } = useProjectEngine();

    // Physics-driven state extraction
    const pressure = technicalState.physics?.surgePressureBar || 45;
    const vaneOpening = technicalState.francis?.sensors?.guide_vane_opening || 65;
    const rpm = technicalState.mechanical.rpm || 428;
    const isCavitation = technicalState.demoMode.active && technicalState.demoMode.scenario === 'CAVITATION';

    // Color Interpolation for Spiral Casing (Blue based on pressure)
    // Nominal: 45 Bar -> light blue. Critical: > 100 Bar -> Deep Intense Blue/Red
    const casingColor = useMemo(() => {
        if (pressure > 120) return '#3b82f6'; // Intense Blue
        if (pressure > 80) return '#60a5fa'; // Strong Blue
        return '#93c5fd'; // Light Blue
    }, [pressure]);

    // Runner Pulse logic for Cavitation
    const runnerGlow = isCavitation ? '#f59e0b' : '#2dd4bf'; // Orange pulse if cavitation

    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto group">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <defs>
                    <radialGradient id="runnerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={runnerGlow} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={runnerGlow} stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* DRAFT TUBE - BOTTOM EXIT */}
                <path
                    d="M150,300 L250,300 L280,380 L120,380 Z"
                    fill="rgba(15, 23, 42, 0.6)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                />
                <motion.path
                    d="M160,310 Q200,340 240,310 M170,330 Q200,360 230,330"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.3)"
                    strokeWidth="2"
                    animate={{ strokeDashoffset: [0, 40] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    strokeDasharray="10 5"
                />

                {/* SPIRAL CASING (SCROLL CASE) */}
                <motion.path
                    d="M200,50 C300,50 350,150 350,200 C350,300 250,330 200,330 C150,330 50,300 50,200 C50,150 100,50 200,50 Z"
                    fill="none"
                    stroke={casingColor}
                    strokeWidth="12"
                    initial={{ opacity: 0.8 }}
                    animate={{
                        strokeWidth: pressure > 100 ? [10, 14, 10] : 10,
                        opacity: pressure > 100 ? [0.6, 1, 0.6] : 0.8
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <path
                    d="M200,70 C280,70 320,150 320,200 C320,280 240,310 200,310 C160,310 80,280 80,200 C80,150 120,70 200,70 Z"
                    fill="rgba(15, 23, 42, 0.8)"
                />

                {/* WICKET GATES (GUIDE VANES) */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 30) * (Math.PI / 180);
                    const r = 85;
                    const x = 200 + r * Math.cos(angle);
                    const y = 200 + r * Math.sin(angle);
                    // Rotation based on guide vane opening %
                    // 0% -> Closed (perpendicular to radial), 100% -> Open (aligned with radial)
                    const gateRotation = (vaneOpening / 100) * 45;

                    return (
                        <motion.rect
                            key={i}
                            x={x - 10} y={y - 2} width="20" height="4" rx="1"
                            fill="rgba(255,255,255,0.4)"
                            style={{
                                originX: "200px",
                                originY: "200px",
                                rotate: (i * 30) + gateRotation
                            }}
                            animate={{ opacity: vaneOpening < 20 ? [0.4, 1, 0.4] : 0.6 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    );
                })}

                {/* RUNNER (THE HEART) */}
                <g transform="translate(200,200)">
                    {/* Pulsing glow for cavitation */}
                    <motion.circle
                        r="60"
                        fill="url(#runnerGlow)"
                        animate={isCavitation ? { scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] } : { scale: 1, opacity: 0.2 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />

                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10 / (rpm / 100), ease: "linear" }}
                    >
                        {/* Runner Blades */}
                        {[...Array(9)].map((_, i) => (
                            <path
                                key={i}
                                d="M0,0 Q20,-40 40,-10 L45,0 Q25,-10 0,0"
                                fill={isCavitation ? "#f59e0b" : "#2dd4bf"}
                                transform={`rotate(${i * 40})`}
                                opacity="0.8"
                            />
                        ))}
                        <circle r="15" fill="#1e293b" stroke="#2dd4bf" strokeWidth="2" />
                    </motion.g>
                </g>

                {/* SHAFT */}
                <rect x="194" y="0" width="12" height="200" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.05)" />
            </svg>

            {/* FLOATING HUD LABELS */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-2 rounded border border-white/10">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{isCavitation ? "Cavitation Warning" : "Spiral Case Pressure"}</div>
                <div className={`text-xl font-mono font-black ${pressure > 100 ? 'text-red-400' : 'text-cyan-400'}`}>
                    {pressure.toFixed(1)} <span className="text-[10px]">Bar</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded border border-white/10">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Wicket Gates</div>
                <div className="text-xl font-mono font-black text-emerald-400">
                    {vaneOpening.toFixed(1)} <span className="text-[10px]">%</span>
                </div>
            </div>
        </div>
    );
};
