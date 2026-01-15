import React from 'react';
import { motion } from 'framer-motion';

export const ThermalCard: React.FC = () => {
    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border shadow-2xl">
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10 font-mono">
                <div className="w-1.5 h-3 bg-red-500 rounded-full bloom-glow-red animate-pulse" />
                Babbitt Temperature
            </h3>

            <div className="flex gap-4 relative z-10 items-end">
                <div className="flex-1">
                    <div className="text-3xl font-black tracking-tighter text-red-500 bloom-glow-red font-mono leading-none">42.8<span className="text-sm text-slate-500 ml-1 uppercase">°C</span></div>
                    <div className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider opacity-60 mt-1">Lower Bearing Pad B</div>
                </div>

                {/* Thermal Image (Heat Map) Mock */}
                <div className="w-24 h-24 rounded-lg border border-white/5 relative overflow-hidden bg-slate-950/80 shadow-inner group-hover:border-red-500/30 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(239,68,68,0.4),rgba(168,85,247,0.1)_50%,transparent_100%)] animate-pulse" />

                    {/* Bearing Cross-section silhouette */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                        <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="1" />
                        {/* Thermal spots */}
                        <circle cx="65" cy="35" r="8" fill="#ef4444" opacity="0.6" className="blur-[4px]" />
                        <circle cx="45" cy="55" r="5" fill="#3b82f6" opacity="0.4" className="blur-[3px]" />
                    </svg>

                    {/* Scale */}
                    <div className="absolute right-1 top-2 bottom-2 w-1.5 rounded-full bg-gradient-to-t from-blue-600 via-amber-500 to-red-600 opacity-80" />
                </div>
            </div>

            <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase font-black z-10 border-t border-white/5 pt-2">
                <span>Ref: ISO-13709_Thermal</span>
                <span className="text-red-500/80 animate-pulse">Threshold Warning (+40%)</span>
            </div>
        </div>
    );
}

export const ShaftLiftCard: React.FC = () => {
    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border shadow-2xl">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10 font-mono">
                <div className="w-1.5 h-3 bg-cyan-500 rounded-full bloom-glow-cyan animate-pulse" />
                Shaft Lift
            </h3>

            <div className="flex gap-4 relative z-10 items-end">
                <div className="flex-1">
                    <div className="text-3xl font-black tracking-tighter text-cyan-400 bloom-glow-cyan font-mono leading-none">+120<span className="text-sm text-slate-500 ml-1 uppercase">µM</span></div>
                    <div className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider opacity-60 mt-1">Axial Positioning Delta</div>
                </div>

                {/* Technical Schematic */}
                <div className="w-28 h-20 relative bg-slate-950/60 rounded border border-white/5 overflow-hidden">
                    <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
                        {/* Shaft Schematic */}
                        <rect x="0" y="22" width="100" height="16" fill="#1e293b" />
                        <rect x="40" y="10" width="20" height="40" fill="#334155" opacity="0.3" />
                        {/* Measuring Point */}
                        <line x1="50" y1="10" x2="50" y2="50" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 1" />
                        <path d="M45,22 L55,22 M45,38 L55,38" stroke="#06b6d4" strokeWidth="1" />
                        {/* Dynamic Marker */}
                        <motion.circle
                            cx="50" cy="18" r="2.5" fill="#06b6d4"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bloom-glow-cyan"
                        />
                        <text x="55" y="15" fill="#06b6d4" fontSize="6" fontFamily="monospace" fontWeight="bold">LIFT_ACT</text>
                    </svg>
                </div>
            </div>

            <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase font-black z-10 border-t border-white/5 pt-2">
                <span>Source: NC-DISP-02</span>
                <span className="text-cyan-500/80">Calibration: 0.001mm</span>
            </div>
        </div>
    );
}

export const LabyrinthCard: React.FC = () => {
    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border shadow-2xl">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10 font-mono">
                <div className="w-1.5 h-3 bg-emerald-500 rounded-full bloom-glow-emerald animate-pulse" />
                Labyrinth Clearance
            </h3>

            <div className="flex gap-4 relative z-10 items-end">
                <div className="flex-1">
                    <div className="text-3xl font-black tracking-tighter text-emerald-400 bloom-glow-emerald font-mono leading-none">0.45<span className="text-sm text-slate-500 ml-1 uppercase">MM</span></div>
                    <div className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider opacity-60 mt-1">Seal Gap Differential</div>
                </div>

                {/* Circular Manometer / Gauge */}
                <div className="w-24 h-24 relative flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Background Ring */}
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#065f46" strokeWidth="8" strokeDasharray="264" strokeDashoffset="66" opacity="0.4" />
                        {/* Value Ring */}
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="264" strokeDashoffset="198" className="bloom-glow-emerald" />

                        {/* Technical Markings */}
                        {[...Array(12)].map((_, i) => (
                            <line
                                key={i}
                                x1="50" y1="8" x2="50" y2="12"
                                stroke="white" strokeWidth="1" opacity="0.3"
                                transform={`rotate(${i * 30} 50 50)`}
                            />
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                        <span className="text-[10px] font-black text-white/80 font-mono">65%</span>
                        <span className="text-[7px] text-slate-500 uppercase font-black">Capacity</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase font-black z-10 border-t border-white/5 pt-2">
                <span>Safe Range: [0.4-0.6]</span>
                <span className="text-emerald-500/80">Status: Optimized</span>
            </div>
        </div>
    );
}
