import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { BackButton } from './BackButton.tsx';
import { useForensics } from '../contexts/ForensicsContext.tsx';

type ARMode = 'RECOGNITION' | 'ASSEMBLY' | 'GAUGE' | 'REMOTE' | 'SPATIAL' | 'FORENSICS_REPLAY';

export const ARManager: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { showToast } = useToast();
    const { frozenBuffer } = useForensics();

    const [mode, setMode] = useState<ARMode>('RECOGNITION');
    const [streamActive, setStreamActive] = useState(false);
    const [isRemoteCalling, setIsRemoteCalling] = useState(false);
    const [spatialDeviation, setSpatialDeviation] = useState(0);

    // 1. Camera Initialization
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreamActive(true);
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                showToast("Camera access required for AR Field Guide", "error");
            }
        }
        startCamera();
        return () => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    // 2. AR Drawing Loop
    const drawOverlay = useCallback(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !streamActive || !selectedAsset) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const assetTele = telemetry[selectedAsset.id];

        // Simulated AI recognition area
        if (mode === 'RECOGNITION') {
            // Target: Component (Simulated position)
            const x = canvas.width * 0.4;
            const y = canvas.height * 0.3;

            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 200, 200);

            // Label
            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 12px Mono';
            ctx.fillText(`ID: ${selectedAsset.name.toUpperCase()} COMPONENT`, x, y - 10);

            // Flow Direction (Dynamic arrows)
            const time = Date.now() * 0.005;
            const arrowX = x + 100;
            const arrowY = y + 100 + Math.sin(time) * 20;

            ctx.beginPath();
            ctx.moveTo(arrowX, y + 20);
            ctx.lineTo(arrowX, y + 180);
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#22d3ee';
            ctx.fillText(`↓ HYDRAULIC FLOW (${assetTele?.cylinderPressure.toFixed(1) || 45} bar)`, arrowX + 5, arrowY);

            // Measurement Target
            ctx.beginPath();
            ctx.arc(x + 180, y + 50, 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.fill();
            ctx.fillText('MEASUREMENT POINT A1', x + 195, y + 55);
        }

        if (mode === 'ASSEMBLY') {
            // "Ghost" Guide: Correct vs Wrong
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.fillRect(50, 100, 150, 300);
            ctx.strokeStyle = '#ef4444';
            ctx.strokeRect(50, 100, 150, 300);
            ctx.fillStyle = '#ef4444';
            ctx.fillText('WRONG: 16mm PIPE DETECTED', 60, 120);
            ctx.font = 'bold 40px Arial';
            ctx.fillText('X', 100, 250);

            // Success Guide
            ctx.strokeStyle = '#10b981';
            ctx.strokeRect(250, 100, 150, 300);
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 12px Mono';
            ctx.fillText('CORRECT: 12mm ASSEMBLY', 260, 120);
            ctx.beginPath();
            ctx.moveTo(270, 250); ctx.lineTo(300, 280); ctx.lineTo(350, 200);
            ctx.stroke();
        }

        if (mode === 'GAUGE') {
            // Gauge reading simulation
            const gx = canvas.width / 2;
            const gy = canvas.height / 2;

            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(gx, gy, 80, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fbbf24';
            ctx.fillText('SCANNING ANALOG GAUGE...', gx - 60, gy - 95);

            const forensicVal = (45.2 + Math.random() * 0.4).toFixed(1);
            ctx.fillStyle = "#10b981";
            ctx.font = 'bold 24px Mono';
            ctx.fillText(`${forensicVal} bar`, gx - 40, gy + 10);
        }

        if (mode === 'SPATIAL') {
            // Marker and deviation
            const mx = canvas.width / 2;
            const my = canvas.height / 2;

            ctx.strokeStyle = spatialDeviation > 0.05 ? '#ef4444' : '#10b981';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(mx - 50, my); ctx.lineTo(mx + 50, my);
            ctx.moveTo(mx, my - 50); ctx.lineTo(mx, my + 50);
            ctx.stroke();

            ctx.fillStyle = spatialDeviation > 0.05 ? '#ef4444' : '#10b981';
            ctx.font = 'bold 16px Mono';
            ctx.fillText(`DEVIATION: ${spatialDeviation.toFixed(3)} mm`, mx - 80, my + 80);
        }

        if (mode === 'FORENSICS_REPLAY' && frozenBuffer) {
            const rx = canvas.width / 2;
            const ry = canvas.height / 2;

            // Draw time-slice "Ghost" segments
            ctx.lineWidth = 2;
            const step = Math.floor(frozenBuffer.length / 20);
            frozenBuffer.forEach((point, i) => {
                if (i % step !== 0) return;

                const opacity = i / frozenBuffer.length;
                const offset = (i / frozenBuffer.length) * 100;

                ctx.strokeStyle = point.dpdt > 10 ? `rgba(220, 38, 38, ${opacity})` : `rgba(34, 211, 238, ${opacity})`;
                ctx.beginPath();
                ctx.arc(rx + offset - 50, ry + (point.cylinderPressure - 45) * 5, 10, 0, Math.PI * 2);
                ctx.stroke();
            });

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 14px Mono';
            ctx.fillText("HIGH-SPEED REPLAY ACTIVE (1ms resolution)", rx - 150, ry - 120);
        }

        requestAnimationFrame(drawOverlay);
    }, [mode, streamActive, spatialDeviation, selectedAsset, telemetry]);

    useEffect(() => {
        const id = requestAnimationFrame(drawOverlay);
        return () => cancelAnimationFrame(id);
    }, [drawOverlay]);

    // Spatial simulation (Random jitter)
    useEffect(() => {
        if (mode === 'SPATIAL') {
            const interval = setInterval(() => {
                const dev = Math.random() * 0.1;
                setSpatialDeviation(dev);
                if (dev > 0.05) {
                    if (navigator.vibrate) navigator.vibrate(100);
                    // could play sound too
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, [mode]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-0 m-0 overflow-hidden">
            {/* Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
            />

            {/* AR Canvas */}
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            />

            {/* UI Layer */}
            <div className="absolute inset-0 flex flex-col z-20 pointer-events-none">
                <header className="p-6 flex justify-between items-start pointer-events-auto">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">AR FIELD GUIDE <span className="text-cyan-400">v2.0</span></h2>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">Spatial AI Inspection Module</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <BackButton text="Close AR" />
                        <ModernButton
                            variant="secondary"
                            onClick={() => setIsRemoteCalling(!isRemoteCalling)}
                            className={isRemoteCalling ? 'bg-red-500 text-white border-red-500' : ''}
                        >
                            {isRemoteCalling ? '📞 END SUPPORT' : '📡 CALL ENGINEER'}
                        </ModernButton>
                    </div>
                </header>

                <main className="flex-grow flex items-center justify-center">
                    {mode === 'RECOGNITION' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-cyan-500/30 rounded-full animate-spin-slow pointer-events-none" />
                    )}

                    {isRemoteCalling && (
                        <div className="absolute top-24 right-6 w-48 aspect-video bg-slate-900/80 border border-cyan-500/30 rounded-xl overflow-hidden pointer-events-auto">
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500 rounded text-[8px] font-black text-black">REMOTE: ING. STEVAN</div>
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <span className="text-2xl">👨‍🔧</span>
                                <div className="text-[8px] text-cyan-400 animate-pulse font-mono font-bold uppercase">Streaming live feed...</div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="p-6 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent">
                    <div className="max-w-4xl mx-auto grid grid-cols-6 gap-4">
                        {(['RECOGNITION', 'ASSEMBLY', 'GAUGE', 'SPATIAL', 'REMOTE', 'FORENSICS_REPLAY'] as ARMode[]).map((m) => (
                            <button
                                key={m}
                                disabled={m === 'FORENSICS_REPLAY' && !frozenBuffer}
                                onClick={() => setMode(m)}
                                className={`px-4 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tighter ${mode === m ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105' : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'} ${m === 'FORENSICS_REPLAY' && !frozenBuffer ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                {m.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 p-4 bg-slate-950/80 border border-white/5 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 text-xl border border-cyan-500/20">🤖</div>
                        <div className="flex-grow">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Ano-Agent Visual Analysis</p>
                            <p className="text-xs text-white leading-tight italic">
                                {mode === 'RECOGNITION' && "Component identified. Pressure levels matching Telemetry (45.2 bar). Flow direction nominal."}
                                {mode === 'ASSEMBLY' && "CRITICAL ALERT: Wrong pipe diameter (16mm) detected on primary circuit. Risks hydraulic hammer."}
                                {mode === 'GAUGE' && "Synchronizing visual sensor reading with ProjectContext... (45 bar captured)."}
                                {mode === 'SPATIAL' && spatialDeviation > 0.05 ? "TOLERANCE EXCEEDED. Alignment deviation: >0.05mm. Adjust base bolts immediately." : "Spatial alignment stable."}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Simulated Remote Drawing Overlay */}
            {isRemoteCalling && (
                <div className="absolute inset-0 z-40 pointer-events-none">
                    <svg className="w-full h-full">
                        <circle cx="45%" cy="35%" r="30" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="10 5">
                            <animate attributeName="stroke-dashoffset" from="0" to="15" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <text x="45%" y="30%" className="fill-red-500 text-[10px] font-bold uppercase">ING: LOOSEN THIS BOLT FIRST</text>
                    </svg>
                </div>
            )}
        </div>
    );
};
