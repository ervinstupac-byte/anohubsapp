import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useForensics } from '../contexts/ForensicsContext.tsx';

export const BlackBoxForensics: React.FC = () => {
    const { frozenBuffer, lockedIncidentId, resetForensics } = useForensics();
    const [replayIndex, setReplayIndex] = useState(0);

    if (!frozenBuffer) {
        return (
            <GlassCard title="Black Box Forensics">
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                    <span className="text-4xl mb-4 grayscale opacity-20">📼</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">
                        Monitoring Standby<br />
                        <span className="text-[8px] opacity-50">Recording 1ms Rolling Buffer (10s)</span>
                    </p>
                </div>
            </GlassCard>
        );
    }

    const currentPoint = frozenBuffer[replayIndex] || frozenBuffer[frozenBuffer.length - 1];
    const msOffset = replayIndex; // Assuming 1ms intervals in replay mode

    return (
        <GlassCard title="Black Box Forensics (High-Speed Log)" className="border-l-4 border-l-red-600 bg-black/40 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest animate-pulse">INCIDIENT CAPTURED</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">ID: {lockedIncidentId}</p>
                    </div>
                    <button
                        onClick={resetForensics}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[8px] font-black text-slate-400 rounded uppercase transition-all"
                    >
                        Erase & Resume
                    </button>
                </div>

                {/* Correlation Metrics */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Pressure</p>
                        <p className="text-lg font-mono font-black text-red-500">{currentPoint.cylinderPressure.toFixed(1)} <span className="text-[8px] text-slate-600">bar</span></p>
                    </div>
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Servo Pos</p>
                        <p className="text-lg font-mono font-black text-cyan-400">{currentPoint.actuatorPosition.toFixed(1)} <span className="text-[8px] text-slate-600">%</span></p>
                    </div>
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Oil Temp</p>
                        <p className="text-lg font-mono font-black text-amber-500">{currentPoint.oilTemperature.toFixed(1)} <span className="text-[8px] text-slate-600">°C</span></p>
                    </div>
                </div>

                {/* DPDT Analyzer */}
                <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">Root Cause Correlation</p>
                        <span className="text-[9px] font-mono font-black text-red-500">dp/dt: {currentPoint.dpdt.toFixed(2)} bar/s</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic leading-snug">
                        {currentPoint.dpdt > 15
                            ? "CRITICAL: Non-linear pressure surge detected. Pipe rupture imminent at T+" + msOffset + "ms."
                            : "Pre-burst phase. Pressure accumulating due to actuator blockage."}
                    </p>
                </div>

                {/* REPLAY CONTROLS */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-mono font-black text-slate-500">
                        <span>-10.000 ms</span>
                        <span className="text-white">T + {msOffset} ms</span>
                        <span>EVENT</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={frozenBuffer.length - 1}
                        value={replayIndex}
                        onChange={(e) => setReplayIndex(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-center gap-4">
                        <button className="text-xs hover:text-red-500 transition-colors">⏮</button>
                        <button className="text-xs hover:text-red-500 transition-colors" onClick={() => {
                            const interval = setInterval(() => {
                                setReplayIndex(prev => {
                                    if (prev >= frozenBuffer.length - 1) {
                                        clearInterval(interval);
                                        return prev;
                                    }
                                    return prev + 10; // Playback speed
                                });
                            }, 50);
                        }}>▶</button>
                        <button className="text-xs hover:text-red-500 transition-colors">⏭</button>
                    </div>
                </div>

                <div className="bg-red-600/10 p-2 rounded flex items-center justify-center gap-2 border border-red-600/30">
                    <span className="animate-ping w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">AR REPLAY MODE AVAILABLE ON GEAR</span>
                </div>
            </div>
        </GlassCard>
    );
};
