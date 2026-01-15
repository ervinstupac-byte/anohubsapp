import React from 'react';
import { motion } from 'framer-motion';

export const LiveTelemetryFooter: React.FC = () => {
    return (
        <footer className="h-24 bg-[#0a0a0c] border-t border-slate-800/80 relative overflow-hidden flex items-center px-6 gap-8 metallic-border">
            {/* OSCILLOSCOPE GRID GLOW */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:25px_25px] opacity-20 pointer-events-none" />

            <div className="flex items-center justify-between w-full h-full px-4 relative z-10">
                {/* 1. STATUS LAMPS */}
                <div className="flex items-center gap-4 shrink-0 border-r border-white/5 pr-6 h-full">
                    <div className="flex flex-col gap-1">
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">SYNC_LOCK</div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 bloom-glow-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                        </div>
                    </div>
                </div>

                {/* 2. WAVEFORMS CONTAINER */}
                <div className="flex-1 flex items-center gap-4 px-6 h-full overflow-hidden pointer-events-none">
                    <Waveform color="text-cyan-400" glow="bloom-glow-cyan" delay="0s" label="PHASE_A" freq={1.2} />
                    <Waveform color="text-emerald-400" glow="bloom-glow-emerald" delay="0.5s" label="PHASE_B" freq={1.1} />
                    <Waveform color="text-purple-400" glow="bloom-glow-purple" delay="1s" label="PHASE_C" freq={1.3} />
                    <Waveform color="text-amber-500" glow="bloom-glow-amber" delay="1.5s" label="NEUTRAL" freq={0.8} />
                </div>

                {/* 3. HARDWARE TELEMETRY */}
                <div className="flex items-center gap-6 shrink-0 border-l border-white/5 pl-6 h-full py-2">
                    <DigitalReadout label="GRID_FREQ" value="50.02" unit="Hz" color="text-cyan-400" />
                    <DigitalReadout label="LOAD_FACTOR" value="92.4" unit="%" color="text-emerald-400" />
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="text-right">
                        <div className="text-[10px] font-black text-cyan-400 font-mono tracking-tighter">ANOHUB_LINK_v4.5</div>
                        <div className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter font-black">Secure_Encryption: 256-bit</div>
                    </div>
                </div>
            </div>

            {/* CRT SCANLINES OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
        </footer>
    );
};

const Waveform: React.FC<{ color: string, glow: string, delay: string, label: string, freq: number }> = ({ color, glow, delay, label, freq }) => (
    <div className="flex-1 min-w-[120px] h-12 relative flex flex-col justify-center">
        <div className="absolute -top-1 left-0 text-[7px] font-black text-slate-600 font-mono tracking-widest uppercase">{label}</div>
        <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
            <motion.path
                d="M 0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`${color} ${glow} opacity-80`}
                initial={{ pathOffset: 0 }}
                animate={{ pathOffset: [-1, 0] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5 / freq,
                    ease: "linear",
                    delay: parseFloat(delay)
                }}
            />
            {/* Ghost signal */}
            <motion.path
                d="M 0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className={`${color} opacity-10`}
                initial={{ pathOffset: 0 }}
                animate={{ pathOffset: [-1, 0] }}
                transition={{
                    repeat: Infinity,
                    duration: 3 / freq,
                    ease: "linear",
                    delay: parseFloat(delay)
                }}
            />
        </svg>
    </div>
);

const DigitalReadout: React.FC<{ label: string, value: string, unit: string, color: string }> = ({ label, value, unit, color }) => (
    <div className="flex flex-col items-end min-w-[60px]">
        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest font-mono">{label}</span>
        <div className={`text-sm font-mono font-black ${color} drop-shadow-sm`}>
            {value}<span className="text-[9px] text-slate-500 ml-0.5">{unit}</span>
        </div>
    </div>
);
