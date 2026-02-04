import React from 'react';

interface SimpleSparklineProps {
    data: number[];
    width?: number;
    height?: number;
    className?: string;
}

export const SimpleSparkline: React.FC<SimpleSparklineProps> = ({ data, width = 100, height = 30, className }) => {
    if (!data.length) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    // Color logic: Cyan if stable (last 2 values delta < 5%), Amber if volatile
    const lastValue = data[data.length - 1];
    const prevValue = data[data.length - 2] || lastValue;
    const delta = Math.abs(lastValue - prevValue) / (prevValue || 1);
    const color = delta > 0.10 ? '#f59e0b' : '#06b6d4';

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
        >
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                style={{ filter: `drop-shadow(0 0 2px ${color}44)` }}
            />
        </svg>
    );
};
