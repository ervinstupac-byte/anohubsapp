import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ShadowRealityChartProps {
    data: { timestamp: number, deltaP: number }[];
}

export const ShadowRealityChart: React.FC<ShadowRealityChartProps> = ({ data }) => {
    // Simple SVG Line Chart for simplicity and performance without heavy libs
    // Visualize cumulative delta

    const cumulativeData = data.reduce((acc, curr, idx) => {
        const prev = idx > 0 ? acc[idx - 1].val : 0;
        acc.push({ ...curr, val: prev + curr.deltaP });
        return acc;
    }, [] as { timestamp: number, deltaP: number, val: number }[]);

    if (cumulativeData.length === 0) return <div className="text-slate-500 text-xs text-center py-4">No Shadow Data</div>;

    const maxVal = Math.max(...cumulativeData.map(d => Math.abs(d.val)), 100);
    const height = 60;
    const width = 200;

    // Normalize to ViewBox
    const points = cumulativeData.map((d, i) => {
        const x = (i / (cumulativeData.length - 1 || 1)) * width;
        // Invert Y because SVG 0 is top
        // Scale so 0 is middle (height/2)
        const y = (height / 2) - ((d.val / maxVal) * (height / 2));
        return `${x},${y}`;
    }).join(' ');

    const lastVal = cumulativeData[cumulativeData.length - 1].val;
    const isPositive = lastVal >= 0;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded p-3 flex items-center justify-between gap-4">
            <div>
                <div className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1">Shadow vs. Reality</div>
                <div className={`text-lg font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-2`}>
                    {isPositive ? '+' : ''}{lastVal.toFixed(2)} €
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">Potential Profit Delta</div>
            </div>

            <svg width={width} height={height} className="overflow-visible">
                {/* Zero Line */}
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />

                {/* Data Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={isPositive ? '#34d399' : '#f87171'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Last Dot */}
                <circle
                    cx={width}
                    cy={(height / 2) - ((lastVal / maxVal) * (height / 2))}
                    r="3"
                    fill={isPositive ? '#34d399' : '#f87171'}
                />
            </svg>
        </div>
    );
};
