import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

interface OscilloscopeProps {
    dataType: 'ELECTRICAL' | 'ACOUSTIC';
    channels: {
        name: string;
        data: number[]; // Waveform samples
        color: string;
        unit: string;
    }[];
    sampleRate: number; // Hz
    timeWindow: number; // seconds
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ dataType, channels, sampleRate, timeWindow }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        drawGrid(ctx, canvas.width, canvas.height);

        // Draw waveforms
        channels.forEach((channel, idx) => {
            drawWaveform(ctx, channel.data, channel.color, canvas.width, canvas.height, idx);
        });

        // Draw time markers
        drawTimeMarkers(ctx, canvas.width, canvas.height, timeWindow);
    }, [channels, timeWindow]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;

        // Vertical lines (time divisions)
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines (voltage divisions)
        for (let i = 0; i <= 8; i++) {
            const y = (i / 8) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Center line (zero reference)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    };

    const drawWaveform = (
        ctx: CanvasRenderingContext2D,
        data: number[],
        color: string,
        width: number,
        height: number,
        channelIdx: number
    ) => {
        if (data.length === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const centerY = height / 2;
        const amplitude = height / 4; // Scale factor

        data.forEach((value, i) => {
            const x = (i / data.length) * width;
            const y = centerY - (value * amplitude);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw channel label
        ctx.fillStyle = color;
        ctx.font = '12px monospace';
        ctx.fillText(channels[channelIdx].name, 10, 20 + channelIdx * 20);
    };

    const drawTimeMarkers = (ctx: CanvasRenderingContext2D, width: number, height: number, timeWindow: number) => {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';

        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            const time = ((i / 10) * timeWindow * 1000).toFixed(0); // ms
            ctx.fillText(`${time}ms`, x + 2, height - 5);
        }
    };

    // Generate sine wave for demonstration
    const generateSineWave = (frequency: number, amplitude: number, samples: number): number[] => {
        const data: number[] = [];
        for (let i = 0; i < samples; i++) {
            const t = (i / samples) * timeWindow;
            const value = amplitude * Math.sin(2 * Math.PI * frequency * t);
            data.push(value);
        }
        return data;
    };

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                High-Resolution Oscilloscope - {dataType}
            </div>

            {/* Control Panel */}
            <div className="mb-4 bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                        <div className="text-slate-400 mb-1">Sample Rate</div>
                        <div className="text-cyan-300 font-mono font-bold">{sampleRate} Hz</div>
                    </div>
                    <div>
                        <div className="text-slate-400 mb-1">Time Window</div>
                        <div className="text-cyan-300 font-mono font-bold">{timeWindow}s</div>
                    </div>
                    <div>
                        <div className="text-slate-400 mb-1">Resolution</div>
                        <div className="text-cyan-300 font-mono font-bold">{(1000 / sampleRate).toFixed(2)} ms/sample</div>
                    </div>
                    <div>
                        <div className="text-slate-400 mb-1">Channels</div>
                        <div className="text-cyan-300 font-mono font-bold">{channels.length}</div>
                    </div>
                </div>
            </div>

            {/* Oscilloscope Display */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={400}
                    className="w-full rounded"
                />
            </div>

            {/* Channel Info */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                {channels.map((channel, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-700 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: channel.color }} />
                            <div className="text-sm font-bold text-white">{channel.name}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <div className="text-slate-500">Peak</div>
                                <div className="text-emerald-400 font-mono">
                                    {Math.max(...channel.data).toFixed(2)} {channel.unit}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500">RMS</div>
                                <div className="text-blue-400 font-mono">
                                    {Math.sqrt(channel.data.reduce((sum, v) => sum + v * v, 0) / channel.data.length).toFixed(2)} {channel.unit}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500">Freq</div>
                                <div className="text-purple-400 font-mono">50 Hz</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
