import React, { useEffect, useRef } from 'react';

interface ShaftOrbitPlotProps {
    vibrationX: number; // mils or mm/s
    vibrationY: number; // mils or mm/s
    size?: number;
    deltaTemp?: number; // Used to simulate ovality/misalignment
}

export const ShaftOrbitPlot: React.FC<ShaftOrbitPlotProps> = ({
    vibrationX,
    vibrationY,
    size = 120,
    deltaTemp = 0
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Setup High DPI
        const scale = window.devicePixelRatio || 1;
        canvas.width = size * scale;
        canvas.height = size * scale;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(scale, scale);

        const center = size / 2;
        const radius = (size / 2) - 10;

        const draw = (time: number) => {
            ctx.clearRect(0, 0, size, size);

            // Grid
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)'; // Cyan-500/20
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(center, 0); ctx.lineTo(center, size);
            ctx.moveTo(0, center); ctx.lineTo(size, center);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Orbit Logic (Lissajous)
            // If deltaTemp is high (>5), make it oval/chaotic to simulate misalignment
            const t = time * 0.005;

            // Base circularity
            const distortion = Math.min(deltaTemp / 10, 0.5); // Max 0.5 distortion

            ctx.strokeStyle = deltaTemp > 5 ? '#ef4444' : '#22d3ee'; // Red if critical, Cyan if good
            ctx.lineWidth = 2;
            ctx.shadowBlur = 4;
            ctx.shadowColor = ctx.strokeStyle;

            ctx.beginPath();
            for (let i = 0; i <= 100; i++) {
                const angle = (i / 100) * Math.PI * 2;

                // Simulate X/Y displacement
                const ampX = (vibrationX / 5) * radius * (1 + distortion); // Scale to canvas
                const ampY = (vibrationY / 5) * radius * (1 - distortion); // Flatten Y if misaligned (or vice versa)

                // Phase shift for ovality
                const phase = deltaTemp > 2 ? Math.PI / 4 : 0;

                const x = center + Math.cos(angle + t) * ampX;
                const y = center + Math.sin(angle + t + phase) * ampY;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Current Dot
            const currentAngle = (Math.PI * 2) * ((time % 1000) / 1000); // Just a visual spinner dot
            // Better: use the actual end of the loop
            const endX = center + Math.cos(2 * Math.PI + t) * (vibrationX / 5 * radius * (1 + distortion));
            const endY = center + Math.sin(2 * Math.PI + t + (deltaTemp > 2 ? Math.PI / 4 : 0)) * (vibrationY / 5 * radius * (1 - distortion));

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(endX, endY, 3, 0, Math.PI * 2);
            ctx.fill();

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [vibrationX, vibrationY, size, deltaTemp]);

    return (
        <div className="relative">
            <canvas ref={canvasRef} />
            <div className="absolute top-1 left-1 text-[8px] text-slate-500 font-mono">
                X: {vibrationX.toFixed(2)}
            </div>
            <div className="absolute bottom-1 right-1 text-[8px] text-slate-500 font-mono">
                Y: {vibrationY.toFixed(2)}
            </div>
            {deltaTemp > 5 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-red-500/80 -rotate-45">MISALIGNMENT</span>
                </div>
            )}
        </div>
    );
};
