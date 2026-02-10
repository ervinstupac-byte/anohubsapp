import React, { useState, useEffect, useRef } from 'react';
import { Mic, Activity, Volume2, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

export const AudioSpectrogram: React.FC = () => {
    const { resonanceState } = useTelemetryStore();
    const [isListening, setIsListening] = useState(false);
    const [detectedPattern, setDetectedPattern] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Sync resonance state with detected pattern
    useEffect(() => {
        if (resonanceState.isResonant) {
            setDetectedPattern('SAND_HISS');
            setIsListening(true); // Auto-start visualization
        } else if (!isListening) {
             setDetectedPattern(null);
        }
    }, [resonanceState.isResonant]);

    // Mock Audio Visualizer Animation
    useEffect(() => {
        if (!isListening || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let frame = 0;

        const draw = () => {
            ctx.fillStyle = '#0f172a'; // Clear bg
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Frequency Bars
            const barWidth = 4;
            const barGap = 1;
            const barCount = canvas.width / (barWidth + barGap);

            for (let i = 0; i < barCount; i++) {
                // Simulate "Sand Hiss" at high frequencies (right side)
                let height = Math.random() * 50;

                // If "Sand" pattern is detected, spike the high freqs (last 20% of bars)
                // NC-10070: React to real resonance frequency
                if (resonanceState.isResonant && i > barCount * 0.8) {
                     height = 100 + Math.random() * 80;
                } else if (detectedPattern === 'SAND_HISS' && i > barCount * 0.8) {
                    // Legacy mock fallback
                    height = 100 + Math.random() * 50;
                }

                const x = i * (barWidth + barGap);
                const y = canvas.height - height;

                // Color Gradient
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#0ea5e9'); // Blue
                gradient.addColorStop(1, '#2dd4bf'); // Teal

                if (height > 120) {
                    ctx.fillStyle = '#ef4444'; // Red for spikes
                } else {
                    ctx.fillStyle = gradient;
                }

                ctx.fillRect(x, y, barWidth, height);
            }

            frame++;
            if (frame === 200 && !resonanceState.isResonant) {
                 // Only auto-stop if not driven by live resonance
                setDetectedPattern('SAND_HISS');
                setIsListening(false);
            } else {
                animationId = requestAnimationFrame(draw);
            }
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isListening, detectedPattern, resonanceState.isResonant]);

    const startListening = () => {
        setDetectedPattern(null);
        setIsListening(true);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full flex flex-col shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#2dd4bf]" /> Acoustic Signature
            </h3>

            <div className="relative flex-1 bg-black rounded-lg border border-white/10 overflow-hidden mb-4">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-full opacity-80"
                />

                {!isListening && !detectedPattern && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={startListening}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                <Mic className="w-8 h-8 text-[#2dd4bf]" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Listen</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Analysis Output */}
            <div className="h-24">
                {isListening && (
                    <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-mono">SAMPLING AUDIO 44.1kHz...</span>
                    </div>
                )}

                {detectedPattern === 'SAND_HISS' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-amber-950/30 border border-amber-500/50 p-3 rounded flex gap-3 items-center"
                    >
                        <div className="bg-amber-500/20 p-2 rounded-full">
                            <AlertOctagon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-500 uppercase">High Frequency Hiss (15kHz+)</h4>
                            <p className="text-xs text-amber-200">
                                Diagnosis: <b>Silica Sand detected in Pelton Nozzle.</b> <br />
                                Check desanding basin filters immediately.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
