import React, { useMemo, useRef, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useForensics } from '../contexts/ForensicsContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';

export const OrbitPlotter: React.FC = () => {
    const { telemetry } = useTelemetry();
    const { frozenBuffer } = useForensics();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
            ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
            ctx.stroke();

            // Draw limit circle
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.beginPath();
            ctx.arc(cx, cy, 60, 0, Math.PI * 2);
            ctx.stroke();

            const dataToDraw = frozenBuffer ? frozenBuffer.slice(-300) : [];

            if (dataToDraw.length > 1) {
                ctx.beginPath();
                ctx.lineWidth = 1.5;
                dataToDraw.forEach((p, i) => {
                    const x = cx + p.proximityX * 0.8;
                    const y = cy + p.proximityY * 0.8;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    const dist = Math.sqrt(p.proximityX ** 2 + p.proximityY ** 2);
                    ctx.strokeStyle = dist > 60 ? '#ef4444' : '#22d3ee';
                });
                ctx.stroke();
            } else {
                // Live mode animation
                const keys = Object.keys(telemetry);
                if (keys.length > 0) {
                    const latest = telemetry[keys[0]];
                    const x = cx + latest.proximityX * 0.8;
                    const y = cy + latest.proximityY * 0.8;
                    ctx.fillStyle = '#22d3ee';
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationFrame = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrame);
    }, [frozenBuffer, telemetry]);

    const diagnosis = useMemo(() => {
        if (frozenBuffer) {
            const maxX = Math.max(...frozenBuffer.map(p => Math.abs(p.proximityX)));
            const maxY = Math.max(...frozenBuffer.map(p => Math.abs(p.proximityY)));
            const ratio = maxX / maxY;
            if (ratio > 1.5 || ratio < 0.6) return { label: 'Mechanical Unbalance', color: 'text-red-500' };
            return { label: 'Shaft Orbit Nominal', color: 'text-emerald-500' };
        }
        return { label: 'Monitoring Orbit...', color: 'text-slate-500' };
    }, [frozenBuffer]);

    return (
        <GlassCard title="Orbit Plotter (Ples Vratila)">
            <div className="flex flex-col items-center">
                <canvas
                    ref={canvasRef}
                    width={200}
                    height={200}
                    className="bg-black/40 rounded-full border border-white/10 shadow-inner mb-4"
                />
                <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${diagnosis.color}`}>
                        {diagnosis.label}
                    </p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">X/Y Proximity Correlation Active</p>
                </div>
            </div>
        </GlassCard>
    );
};
