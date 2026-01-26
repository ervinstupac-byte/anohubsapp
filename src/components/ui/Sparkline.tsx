import React from 'react';

// NEW: Event Markers support
interface SparklineMarker {
    index: number;
    color?: string; // e.g. yellow for protocol, purple for work order
}

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
    markers?: SparklineMarker[];
}

export const Sparkline: React.FC<SparklineProps> = React.memo(({
    data,
    width = 60,
    height = 20,
    color = '#22d3ee', // cyan-400 default
    className = '',
    markers = []
}) => {
    // Need at least 2 points to draw a line
    if (!data || data.length < 2) {
        return <div style={{ width, height }} className={`bg-slate-800/30 rounded ${className}`} />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // avoid division by zero

    // Calculate Y for a value
    const getY = (val: number) => height - (((val - min) / range) * height);

    // Calculate points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = getY(val);
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
            {/* Markers */}
            {markers.map((marker, i) => {
                if (marker.index < 0 || marker.index >= data.length) return null;
                const val = data[marker.index];
                const x = (marker.index / (data.length - 1)) * width;
                const y = getY(val);
                return (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="2"
                        fill={marker.color || '#FBBF24'} // Amber default
                        stroke="#0F172A"
                        strokeWidth="1"
                    />
                );
            })}

            {/* End Dot */}
            <circle
                cx={width}
                cy={getY(data[data.length - 1])}
                r="1.5"
                fill={color}
            />
        </svg>
    );
});

Sparkline.displayName = 'Sparkline';
