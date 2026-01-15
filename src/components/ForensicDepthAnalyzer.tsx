import React, { useMemo, useState } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { useForensics } from '../contexts/ForensicsContext.tsx';

export const ForensicDepthAnalyzer: React.FC = () => {
    const { frozenBuffer, isPostCaptureAction, resetForensics } = useForensics();
    const [replayIndex, setReplayIndex] = useState(0);

    const correlationMatrix = useMemo(() => {
        if (!frozenBuffer) return [];

        // Find T=0 (Incident Start) - assuming it's middle of buffer
        const incidentCenter = Math.floor(frozenBuffer.length / 2);
        const events = [];

        // Command Simulation
        events.push({ time: -50, label: 'WICKET_GATE_CLOSE_CMD', detail: 'Hydro-governor initiates emergency shutdown.' });

        // Find Pressure Jump
        const pressureJump = frozenBuffer.findIndex((p, i) => i > 0 && p.dpdt > 10);
        if (pressureJump !== -1) {
            events.push({ time: pressureJump - incidentCenter, label: 'HYDRAULIC_SURGE_DETECTED', detail: `dp/dt exceeded 10 bar/s at T+${pressureJump - incidentCenter}ms.` });
        }

        // Find Failure
        const failure = frozenBuffer.findIndex((p, i) => i > pressureJump && p.cylinderPressure < 5);
        if (failure !== -1) {
            events.push({ time: failure - incidentCenter, label: 'SYSTEM_RUPTURE', detail: 'Critical pressure loss. Mechanical integrity compromised.' });
        }

        return events.sort((a, b) => a.time - b.time);
    }, [frozenBuffer]);

    if (!frozenBuffer && !isPostCaptureAction) return null;

    if (isPostCaptureAction && !frozenBuffer) {
        return (
            <GlassCard title="Black Box: Finalizing Capture...">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase text-red-500 animate-pulse">Saving 60s MS-Snap Buffer</p>
                </div>
            </GlassCard>
        );
    }

    const currentPoint = frozenBuffer![replayIndex] || frozenBuffer![frozenBuffer!.length - 1];

    return (
        <GlassCard title="Forensic Depth Analyzer (Root Cause Matrix)">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-black text-white uppercase animate-pulse">MS-Snap Active</span>
                    <button onClick={resetForensics} className="text-[9px] text-slate-500 hover:text-white uppercase font-black">Clear Forensics</button>
                </div>

                {/* Correlation Matrix */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Event Correlation Timeline</p>
                    <div className="relative pl-4 space-y-4 border-l border-white/10 ml-2">
                        {correlationMatrix.map((ev, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-400" />
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-white uppercase leading-none">{ev.label}</p>
                                    <span className="text-[9px] font-mono text-cyan-400">T{ev.time > 0 ? '+' : ''}{ev.time}ms</span>
                                </div>
                                <p className="text-[9px] text-slate-500 italic mt-1">{ev.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Replay scrub */}
                <div className="pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-black/40 p-2 rounded">
                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Excitation Current</p>
                            <p className="text-sm font-mono text-amber-500">{currentPoint.excitationCurrent.toFixed(1)} A</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded">
                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Transient Delta</p>
                            <p className="text-sm font-mono text-red-400">{(currentPoint.dpdt - 1.2).toFixed(2)} σ</p>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max={frozenBuffer!.length - 1}
                        value={replayIndex}
                        onChange={(e) => setReplayIndex(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between mt-2">
                        <span className="text-[9px] font-mono text-slate-600">-30,000 ms</span>
                        <span className="text-[10px] font-black text-white">REPLAY CURSOR: {replayIndex - Math.floor(frozenBuffer!.length / 2)}ms</span>
                        <span className="text-[9px] font-mono text-slate-600">+30,000 ms</span>
                    </div>
                </div>

                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-[9px] font-black text-red-500 uppercase mb-1">Ano-Agent transient Analysis</p>
                    <p className="text-[10px] text-slate-300 italic">
                        "Odstupanje u dinamici hidraulike: provjeriti viskozitet ulja ili zagušenje na prigušnicama."
                    </p>
                </div>
            </div>
        </GlassCard>
    );
};
