import React, { useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import Decimal from 'decimal.js';

interface Point {
    x: number;
    y: number;
}

interface ShaftOrbitPlotProps {
    vibrationX: number; // mils or mm/s
    vibrationY: number; // mils or mm/s
    size?: number;
    acousticNoiseFloor?: number; // dB
    baselinePoints?: Point[]; // Grey Ghost Orbit
    centerPath?: Point[]; // Thermal Drift Path (last 10 centers)
    onAnalysis?: (analysis: {
        eccentricity: number;
        isElliptical: boolean;
        isStructuralLoosenessConfirmed: boolean;
        peakAngle: number;
        centerMigration: number; // mm
        migrationAngle: number; // degrees
        currentCenter: Point;
        baselineCenter: Point | null;
    }) => void;
}

export interface ShaftOrbitPlotHandle {
    getSnapshot: () => string | null;
    getCurrentPoints: () => Point[];
}

export const ShaftOrbitPlot = React.memo(forwardRef<ShaftOrbitPlotHandle, ShaftOrbitPlotProps>(({
    vibrationX,
    vibrationY,
    size = 180,
    acousticNoiseFloor = 0,
    baselinePoints,
    centerPath,
    onAnalysis
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const MAX_POINTS = 100;

    // SCALE MATH (Normalize +/- 0.5mm to radius)
    const radius = useMemo(() => new Decimal(size).div(2).minus(20), [size]);
    const normalize = (val: number) => new Decimal(val).div(0.5).mul(radius).toNumber();

    // GEOMETRY ANALYSIS (Reactive for UI)
    const analysis = useMemo(() => {
        const history = pointsRef.current;
        if (history.length < 2) return { eccentricity: 0, isElliptical: false, isStructuralLoosenessConfirmed: false };

        let maxX = new Decimal(0);
        let maxY = new Decimal(0);
        history.forEach(p => {
            const px = new Decimal(p.x).abs();
            const py = new Decimal(p.y).abs();
            if (px.gt(maxX)) maxX = px;
            if (py.gt(maxY)) maxY = py;
        });

        const a_axis = maxX.gt(maxY) ? maxX : maxY;
        const b_axis = maxX.gt(maxY) ? maxY : maxX;

        let eccentricity = new Decimal(0);
        if (a_axis.gt(0)) {
            // e = sqrt(1 - (b^2 / a^2))
            eccentricity = Decimal.sqrt(new Decimal(1).minus(b_axis.pow(2).div(a_axis.pow(2))));
        }

        const eccNum = eccentricity.toNumber();
        const isElliptical = eccentricity.gt(0.75);
        const isStructuralLoosenessConfirmed = eccentricity.gt(0.8) && new Decimal(acousticNoiseFloor).gt(85);

        return { eccentricity: eccNum, isElliptical, isStructuralLoosenessConfirmed };
    }, [vibrationX, vibrationY, acousticNoiseFloor]);

    // Expose snapshot method and points for pinning
    useImperativeHandle(ref, () => ({
        getSnapshot: () => {
            return canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
        },
        getCurrentPoints: () => [...pointsRef.current]
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Add new point to history
        pointsRef.current.push({ x: vibrationX, y: vibrationY });
        if (pointsRef.current.length > MAX_POINTS) {
            pointsRef.current.shift();
        }

        // Setup CC-Standard High DPI
        const scale = window.devicePixelRatio || 1;
        canvas.width = size * scale;
        canvas.height = size * scale;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(scale, scale);

        const center = size / 2;

        // CLEAR & GRID
        ctx.clearRect(0, 0, size, size);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(center, 0); ctx.lineTo(center, size);
        ctx.moveTo(0, center); ctx.lineTo(size, center);
        ctx.stroke();

        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(center, center, radius.mul(0.5).toNumber(), 0, Math.PI * 2);
        ctx.arc(center, center, radius.toNumber(), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (pointsRef.current.length < 2) return;

        // 1. DRAW BASELINE (GHOST ORBIT)
        let baselineCenter: Point | null = null;
        if (baselinePoints && baselinePoints.length > 1) {
            const bX = baselinePoints.reduce((s, p) => s + p.x, 0) / baselinePoints.length;
            const bY = baselinePoints.reduce((s, p) => s + p.y, 0) / baselinePoints.length;
            baselineCenter = { x: bX, y: bY };

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'; // Slate 400 with alpha
            ctx.setLineDash([3, 3]);
            baselinePoints.forEach((p, i) => {
                const x = center + normalize(p.x);
                const y = center - normalize(p.y);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 1.5 DRAW CENTER PATH (THERMAL DRIFT)
        if (centerPath && centerPath.length > 1) {
            ctx.lineWidth = 2;
            centerPath.forEach((p, i) => {
                if (i === 0) return;
                const prev = centerPath[i - 1];

                // Gradient effect: newer segments are more opaque
                const alpha = (i / centerPath.length).toFixed(2);
                ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`; // Amber with alpha fade

                ctx.beginPath();
                ctx.moveTo(center + normalize(prev.x), center - normalize(prev.y));
                ctx.lineTo(center + normalize(p.x), center - normalize(p.y));
                ctx.stroke();
            });

            // Most recent center point dot
            const last = centerPath[centerPath.length - 1];
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(center + normalize(last.x), center - normalize(last.y), 3, 0, Math.PI * 2);
            ctx.fill();
        }

        if (pointsRef.current.length < 2) return;

        // 2. DRAW REAL-TIME TRAILING PATH
        ctx.beginPath();
        ctx.lineWidth = 1.5;

        let maxX = 0;
        let maxY = 0;
        let sumX = 0;
        let sumY = 0;

        pointsRef.current.forEach((p, i) => {
            const x = center + normalize(p.x);
            const y = center - normalize(p.y); // Invert Y for Cartesian

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            if (Math.abs(p.x) > maxX) maxX = Math.abs(p.x);
            if (Math.abs(p.y) > maxY) maxY = Math.abs(p.y);
            sumX += p.x;
            sumY += p.y;
        });

        const { eccentricity, isElliptical, isStructuralLoosenessConfirmed } = analysis;

        ctx.strokeStyle = isStructuralLoosenessConfirmed ? '#f43f5e' : (isElliptical ? '#ef4444' : '#22d3ee');
        ctx.stroke();

        // CENTER MIGRATION LOGIC
        const avgX = sumX / pointsRef.current.length;
        const avgY = sumY / pointsRef.current.length;
        let centerMigration = 0;
        let migrationAngle = 0;
        if (baselinePoints && baselinePoints.length > 0) {
            const bX = baselinePoints.reduce((s, p) => s + p.x, 0) / baselinePoints.length;
            const bY = baselinePoints.reduce((s, p) => s + p.y, 0) / baselinePoints.length;

            centerMigration = Math.sqrt(Math.pow(avgX - bX, 2) + Math.pow(avgY - bY, 2));
            migrationAngle = (Math.atan2(avgY - bY, avgX - bX) * 180 / Math.PI + 360) % 360;

            // Draw migration vector if significant
            if (centerMigration > 0.02) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.moveTo(center + normalize(bX), center - normalize(bY));
                ctx.lineTo(center + normalize(avgX), center - normalize(avgY));
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // PEAK DISPLACEMENT VECTOR
        const peakPoint = pointsRef.current.reduce((prev, curr) => {
            const d1 = Math.sqrt(prev.x ** 2 + prev.y ** 2);
            const d2 = Math.sqrt(curr.x ** 2 + curr.y ** 2);
            return d2 > d1 ? curr : prev;
        });

        const peakX = center + normalize(peakPoint.x);
        const peakY = center - normalize(peakPoint.y);
        const peakAngle = (Math.atan2(-peakPoint.y, peakPoint.x) * 180 / Math.PI + 360) % 360;

        // Draw Arrow
        ctx.strokeStyle = '#f59e0b'; // Amber
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center + normalize(avgX), center - normalize(avgY));
        ctx.lineTo(peakX, peakY);
        ctx.stroke();

        // Arrow head
        const arrowAngle = Math.atan2(peakY - center, peakX - center);
        ctx.beginPath();
        ctx.moveTo(peakX, peakY);
        ctx.lineTo(peakX - 10 * Math.cos(arrowAngle - Math.PI / 6), peakY - 10 * Math.sin(arrowAngle - Math.PI / 6));
        ctx.moveTo(peakX, peakY);
        ctx.lineTo(peakX - 10 * Math.cos(arrowAngle + Math.PI / 6), peakY - 10 * Math.sin(arrowAngle + Math.PI / 6));
        ctx.stroke();

        // LABELS
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 8px "JetBrains Mono"';
        ctx.fillText(`Φ: ${peakAngle.toFixed(1)}°`, peakX + 5, peakY - 5);
        ctx.fillText(`${eccentricity.toFixed(2)}e`, center + 5, center - 5);

        if (centerMigration > 0.1) {
            ctx.fillStyle = '#ef4444';
            ctx.fillText(`ΔC: ${centerMigration.toFixed(2)}mm`, 5, size - 5);
        }

        // Report back
        if (onAnalysis) {
            onAnalysis({
                eccentricity,
                isElliptical,
                isStructuralLoosenessConfirmed,
                peakAngle,
                centerMigration,
                migrationAngle,
                currentCenter: { x: avgX, y: avgY },
                baselineCenter
            });
        }

    }, [vibrationX, vibrationY, size, onAnalysis, analysis, radius]);

    return (
        <div className="relative group">
            <canvas ref={canvasRef} className="rounded-lg bg-slate-900/40 border border-white/5 shadow-2xl" />

            <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono">X: {vibrationX.toFixed(3)}mm</span>
                <span className="text-[10px] font-bold text-cyan-400 font-mono">Y: {vibrationY.toFixed(3)}mm</span>
            </div>

            <div className="absolute bottom-2 right-2 hidden group-hover:block">
                <span className="text-[8px] text-slate-500 font-mono uppercase">NC-9.0 Multi-Load View</span>
            </div>

            {baselinePoints && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded text-[7px] font-black text-slate-400 uppercase tracking-widest">
                    Baseline Active
                </div>
            )}

            {analysis.isStructuralLoosenessConfirmed && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-[1px] rounded-lg border-2 border-red-500 pointer-events-none p-4 text-center">
                    <div className="bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-tighter shadow-lg">
                        CRITICAL: Structural Looseness Confirmed via Acoustic Signature
                    </div>
                </div>
            )}
        </div>
    );
}));

ShaftOrbitPlot.displayName = 'ShaftOrbitPlot';
