import React from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    width = 60,
    height = 20,
    color = '#22d3ee', // cyan-400 default
    className = ''
}) => {
    // Need at least 2 points to draw a line
    if (!data || data.length < 2) {
        return <div style={{ width, height }} className={`bg-slate-800/30 rounded ${className}`} />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // avoid division by zero

    // Calculate points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedVal = (val - min) / range;
        // SVG coordinates: y=0 is top, so we invert
        const y = height - (normalizedVal * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className={`overflow-visible ${className}`}>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Optional: Add a dot at the end */}
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range * height)}
                r="1.5"
                fill={color}
            />
        </svg>
    );
};
