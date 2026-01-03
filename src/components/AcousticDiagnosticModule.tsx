import React, { useEffect, useRef, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useCerebro } from '../contexts/ProjectContext.tsx';

export const AcousticDiagnosticModule: React.FC = () => {
    const { state } = useCerebro();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastWarningTime = useRef<number>(0);

    const metrics = state.mechanical.acousticMetrics || {
        cavitationIntensity: 0,
        ultrasonicLeakIndex: 0,
        bearingGrindIndex: 0,
        acousticBaselineMatch: 1.0
    };

    // Voice Warning Logic
    useEffect(() => {
        const now = Date.now();
        if (now - lastWarningTime.current > 15000) { // Warning every 15s
            if (metrics.cavitationIntensity > 7) {
                const msg = new SpeechSynthesisUtterance('Detektovana intenzivna kavitacija. Provjerite pritisak usisne cijevi ili smanjite otvor lopatica.');
                msg.lang = 'bs-BA';
                window.speechSynthesis.speak(msg);
                lastWarningTime.current = now;
            } else if (metrics.ultrasonicLeakIndex > 7) {
                const msg = new SpeechSynthesisUtterance('Detektovano ultrazvučno šištanje. Moguće mikro-curenje ulja ili zraka. Provjerite spojeve crijeva.');
                msg.lang = 'bs-BA';
                window.speechSynthesis.speak(msg);
                lastWarningTime.current = now;
            }
        }
    }, [metrics]);

    // FFT Visualization Simulation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const barCount = 50; // Increased for higher freq
            const barWidth = width / barCount;

            for (let i = 0; i < barCount; i++) {
                let amplitude = 10 + Math.random() * 20;

                // Cavitation zone (10kHz - 20kHz)
                if (i > 25 && i < 35 && metrics.cavitationIntensity > 1) {
                    const cavitationBoost = (metrics.cavitationIntensity / 10) * height * 0.6;
                    amplitude += cavitationBoost + (Math.random() * 20);
                }

                // Ultrasonic zone (>20kHz simulated high-index bars)
                if (i >= 40 && metrics.ultrasonicLeakIndex > 1) {
                    const leakBoost = (metrics.ultrasonicLeakIndex / 10) * height * 0.7;
                    amplitude += leakBoost + (Math.random() * 30);
                }

                // Bearing grind zone
                if (i > 10 && i < 20 && metrics.bearingGrindIndex > 1) {
                    const grindBoost = (metrics.bearingGrindIndex / 10) * height * 0.4;
                    amplitude += grindBoost + (Math.random() * 15);
                }

                amplitude = Math.max(5, amplitude - (Math.random() * 10));

                const barHeight = (amplitude / 100) * height;

                let color = 'rgba(74, 222, 128, 0.4)';
                if (i >= 40 && metrics.ultrasonicLeakIndex > 5) color = 'rgba(34, 211, 238, 0.9)'; // Cyan (Ultrasonic)
                else if (i > 25 && i < 35 && metrics.cavitationIntensity > 5) color = 'rgba(239, 68, 68, 0.8)'; // Red (Cavitation)
                else if (i > 10 && i < 20 && metrics.bearingGrindIndex > 5) color = 'rgba(245, 158, 11, 0.8)'; // Amber (Grind)

                ctx.fillStyle = color;
                ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);

                if (barHeight > height * 0.6) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = color;
                } else {
                    ctx.shadowBlur = 0;
                }
            }

            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, [metrics]);

    return (
        <GlassCard title="Acoustic & Ultrasonic Diagnostic" className="relative overflow-hidden">
            <div className="space-y-4">
                {/* FFT Visualizer */}
                <div className="relative h-32 bg-black/60 rounded-xl border border-white/5 p-2 overflow-hidden">
                    <canvas ref={canvasRef} width={400} height={128} className="w-full h-full" />
                    <div className="absolute top-2 left-2 flex gap-2">
                        <span className="text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-1 border border-cyan-500/30 rounded uppercase">Acoustic Logic v4.1</span>
                        <span className="text-[8px] font-black bg-slate-500/20 text-slate-400 px-1 border border-slate-500/30 rounded uppercase tracking-widest">Ext. Mic: Connected</span>
                    </div>
                    <div className="absolute bottom-1 w-full flex justify-between px-2 text-[6px] text-slate-600 font-bold uppercase tracking-tighter">
                        <span>0Hz</span>
                        <span>10kHz</span>
                        <span>20kHz</span>
                        <span>30kHz</span>
                        <span>40kHz+</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border transition-all ${metrics.cavitationIntensity > 7 ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Cavitation Index</p>
                            <span className="text-xl">💨</span>
                        </div>
                        <p className={`text-2xl font-mono font-black ${metrics.cavitationIntensity > 7 ? 'text-red-500' : metrics.cavitationIntensity > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {metrics.cavitationIntensity.toFixed(1)}
                        </p>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${metrics.cavitationIntensity > 7 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${metrics.cavitationIntensity * 10}%` }} />
                        </div>
                    </div>

                    <div className={`p-3 rounded-xl border transition-all ${metrics.ultrasonicLeakIndex > 7 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Ultrasonic Leak</p>
                            <span className="text-xl">🔊</span>
                        </div>
                        <p className={`text-2xl font-mono font-black ${metrics.ultrasonicLeakIndex > 7 ? 'text-cyan-400' : 'text-white'}`}>
                            {metrics.ultrasonicLeakIndex.toFixed(1)}
                        </p>
                        <p className="text-[8px] text-slate-500 italic mt-1 uppercase font-bold tracking-tight">
                            {metrics.ultrasonicLeakIndex > 7 ? 'Micro-Leak Detected' : 'No Hissing Detected'}
                        </p>
                    </div>
                </div>

                {/* Baseline Comparison */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Baseline Match</p>
                        <p className={`text-lg font-mono font-black ${metrics.acousticBaselineMatch > 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {(metrics.acousticBaselineMatch * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Bearing Grind</p>
                        <p className={`text-lg font-mono font-black ${metrics.bearingGrindIndex > 7 ? 'text-red-500' : 'text-white'}`}>
                            {metrics.bearingGrindIndex.toFixed(1)}
                        </p>
                    </div>
                </div>

                {(metrics.cavitationIntensity > 7 || metrics.ultrasonicLeakIndex > 7) && (
                    <div className={`flex items-center p-3 rounded-xl gap-3 animate-pulse border ${metrics.ultrasonicLeakIndex > 7 ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-red-500/20 border-red-500/40'}`}>
                        <span className="text-xl">{metrics.ultrasonicLeakIndex > 7 ? '🚨' : '🎙️'}</span>
                        <p className={`text-[9px] font-bold leading-tight uppercase ${metrics.ultrasonicLeakIndex > 7 ? 'text-cyan-200' : 'text-red-200'}`}>
                            Ano-Agent: {metrics.ultrasonicLeakIndex > 7 ? 'Detektovano ultrazvučno šištanje. Moguće mikro-curenje. Provjerite spojeve.' : 'Detektovana intenzivna kavitacija. Provjerite pritiske.'}
                        </p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
