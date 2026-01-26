import React from 'react';
import { motion } from 'framer-motion';

export const ThermalCard: React.FC = () => {
    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border shadow-2xl min-h-0">
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h3 className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 relative z-10 font-mono shrink-0">
                <div className="w-1.5 h-3 bg-red-500 rounded-full bloom-glow-red animate-pulse" />
                Babbitt Temperature
            </h3>

            <div className="flex gap-4 relative z-10 items-end min-h-0">
                <div className="flex-1 min-h-0">
                    <div className="text-[clamp(1.2rem,2.5vh,2rem)] font-black tracking-tighter text-red-500 bloom-glow-red font-mono leading-none truncate">42.8<span className="text-[clamp(8px,1vh,12px)] text-slate-500 ml-1 uppercase">°C</span></div>
                    <div className="text-[clamp(7px,0.8vh,9px)] text-slate-500 font-mono font-bold uppercase tracking-wider opacity-60 mt-1 truncate">Lower Bearing Pad B</div>
                </div>

                {/* Thermal Image (Heat Map) Mock */}
                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-lg border border-white/5 relative overflow-hidden bg-slate-950/80 shadow-inner group-hover:border-red-500/30 transition-colors shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(239,68,68,0.4),rgba(168,85,247,0.1)_50%,transparent_100%)] animate-pulse" />
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                        <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="1" />
                        <circle cx="65" cy="35" r="8" fill="#ef4444" opacity="0.6" className="blur-[4px]" />
                        <circle cx="45" cy="55" r="5" fill="#3b82f6" opacity="0.4" className="blur-[3px]" />
                    </svg>
                    <div className="absolute right-1 top-2 bottom-2 w-1 rounded-full bg-gradient-to-t from-blue-600 via-amber-500 to-red-600 opacity-80" />
                </div>
            </div>

            <div className="flex justify-between items-center text-[clamp(6px,0.8vh,8px)] font-mono text-slate-600 uppercase font-black z-10 border-t border-white/5 pt-2 shrink-0">
                <span>Ref: ISO-13709_Thermal</span>
                <span className="text-red-500/80 animate-pulse">Threshold Warning</span>
            </div>
        </div>
    );
}

export const ShaftLiftCard: React.FC = () => {
    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border shadow-2xl min-h-0">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h3 className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 relative z-10 font-mono shrink-0">
                <div className="w-1.5 h-3 bg-cyan-500 rounded-full bloom-glow-cyan animate-pulse" />
                Shaft Lift
            </h3>

            <div className="flex gap-4 relative z-10 items-end min-h-0">
                <div className="flex-1 min-h-0">
                    <div className="text-[clamp(1.2rem,2.5vh,2rem)] font-black tracking-tighter text-cyan-400 bloom-glow-cyan font-mono leading-none truncate">+120<span className="text-[clamp(8px,1vh,12px)] text-slate-500 ml-1 uppercase">µM</span></div>
                    <div className="text-[clamp(7px,0.8vh,9px)] text-slate-500 font-mono font-bold uppercase tracking-wider opacity-60 mt-1 truncate">Axial Positioning Delta</div>
                </div>

                <div className="w-20 lg:w-28 h-12 lg:h-20 relative bg-slate-950/60 rounded border border-white/5 overflow-hidden shrink-0">
                    <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
                        <rect x="0" y="22" width="100" height="16" fill="#1e293b" />
                        <rect x="40" y="10" width="20" height="40" fill="#334155" opacity="0.3" />
                        <line x1="50" y1="10" x2="50" y2="50" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 1" />
                        <path d="M45,22 L55,22 M45,38 L55,38" stroke="#06b6d4" strokeWidth="1" />
                        <motion.circle
                            cx="50" cy="18" r="2.5" fill="#06b6d4"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bloom-glow-cyan"
                        />
                    </svg>
                </div>
            </div>

            <div className="flex justify-between items-center text-[clamp(6px,0.8vh,8px)] font-mono text-slate-600 uppercase font-black z-10 border-t border-white/5 pt-2 shrink-0">
                <span>Source: NC-DISP-02</span>
                <span className="text-cyan-500/80">0.001mm precision</span>
            </div>
        </div>
    );
}

export const LabyrinthCard: React.FC = () => {
    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border shadow-2xl min-h-0">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h3 className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 relative z-10 font-mono shrink-0">
                <div className="w-1.5 h-3 bg-emerald-500 rounded-full bloom-glow-emerald animate-pulse" />
                Labyrinth Clearance
            </h3>

            <div className="flex gap-4 relative z-10 items-end min-h-0">
                <div className="flex-1 min-h-0">
                    <div className="text-[clamp(1.2rem,2.5vh,2rem)] font-black tracking-tighter text-emerald-400 bloom-glow-emerald font-mono leading-none truncate">0.45<span className="text-[clamp(8px,1vh,12px)] text-slate-500 ml-1 uppercase">MM</span></div>
                    <div className="text-[clamp(7px,0.8vh,9px)] text-slate-500 font-mono font-bold uppercase tracking-wider opacity-60 mt-1 truncate">Seal Gap Differential</div>
                </div>

                <div className="w-16 h-16 lg:w-24 lg:h-24 relative flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="264" strokeDashoffset="198" className="bloom-glow-emerald" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                        <span className="text-[clamp(8px,1vh,10px)] font-black text-white/80 font-mono">65%</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center text-[clamp(6px,0.8vh,8px)] font-mono text-slate-600 uppercase font-black z-10 border-t border-white/5 pt-2 shrink-0">
                <span>Safe Range: [0.4-0.6]</span>
                <span className="text-emerald-500/80">Optimized</span>
            </div>
        </div>
    );
}
