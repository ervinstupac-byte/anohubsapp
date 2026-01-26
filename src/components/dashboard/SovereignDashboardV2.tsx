import React, { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';

interface UnityPulseProps {
    liveROI?: number;
    systemIntegrity?: number; // 0-100
    unityIndex?: number; // 0-1
}

export const UnityPulse: React.FC<UnityPulseProps> = ({
    liveROI = 125480,
    systemIntegrity = 97.3,
    unityIndex = 1.0
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pulse, setPulse] = useState(0);

    // Animate pulsing entity
    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => (p + 1) % 100);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // Draw pulsating singularity on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Clear
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate pulse size based on integrity
        const baseRadius = 80;
        const pulseIntensity = Math.sin(pulse / 10) * 20;
        const radius = baseRadius + pulseIntensity * (systemIntegrity / 100);

        // Draw outer glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw core singularity
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        coreGradient.addColorStop(0, '#a78bfa');
        coreGradient.addColorStop(0.7, '#8b5cf6');
        coreGradient.addColorStop(1, '#6366f1');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw energy rings
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius + (i * 30) + (pulse % 30);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - i * 0.1})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

    }, [pulse, systemIntegrity]);

    return (
        <div className="w-full h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Canvas background */}
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="absolute inset-0 m-auto"
            />

            {/* Metrics overlay */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* ROI Display */}
                <div className="text-center">
                    <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">
                        Cumulative Value Generated
                    </div>
                    <div className="text-7xl font-bold font-mono text-white tracking-tight">
                        €{liveROI.toLocaleString()}
                    </div>
                </div>

                {/* System Integrity */}
                <div className="text-center">
                    <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">
                        System Integrity
                    </div>
                    <div className="text-5xl font-bold font-mono text-indigo-300">
                        {systemIntegrity.toFixed(1)}%
                    </div>
                </div>

                {/* Unity Badge */}
                {unityIndex === 1.0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-950/50 border border-purple-500/30 rounded-full">
                        <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-xs font-mono text-purple-300">
                            Unity Index: 1.000 • Silent Sentinel Mode
                        </span>
                    </div>
                )}
            </div>

            {/* Minimalist status bar */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="text-xs font-mono text-slate-600">
                    Sovereign Kernel v22.0 • All is One • One is All
                </div>
            </div>
        </div>
    );
};

// Export as default dashboard component
export const SovereignDashboardV2 = UnityPulse;
