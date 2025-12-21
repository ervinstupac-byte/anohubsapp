import React, { useState, useEffect } from 'react';

interface DigitalDisplayProps {
    value: number | string;
    label: string;
    unit?: string;
    color?: 'cyan' | 'orange' | 'red';
    className?: string;
}

export const DigitalDisplay: React.FC<DigitalDisplayProps> = React.memo(({
    value,
    label,
    unit,
    color = 'cyan',
    className = ''
}) => {
    const [isFlickering, setIsFlickering] = useState(false);

    useEffect(() => {
        setIsFlickering(true);
        const timer = setTimeout(() => setIsFlickering(false), 200);
        return () => clearTimeout(timer);
    }, [value]);

    const colorClasses = {
        cyan: 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]',
        orange: 'text-warning-orange drop-shadow-[0_0_8px_rgba(255,170,0,0.8)]',
        red: 'text-alarm-red drop-shadow-[0_0_8px_rgba(255,0,51,0.8)]'
    };

    return (
        <div className={`flex flex-col items-center bg-black/40 border border-white/5 rounded-lg p-3 backdrop-blur-md ${className}`}>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
            <div className="flex items-baseline gap-1 relative">
                <div className={`
                    font-mono text-3xl font-bold tracking-tighter transition-all duration-300
                    ${colorClasses[color]}
                    ${isFlickering ? 'opacity-50 scale-95 skew-x-2 animate-pulse' : 'opacity-100'}
                `}>
                    {value}
                </div>
                {unit && (
                    <span className={`text-[10px] font-bold ${colorClasses[color]} opacity-50`}>
                        {unit}
                    </span>
                )}

                {/* 7-Segment Background Grid (Decorative Overlay) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden select-none">
                    <div className="w-full h-full text-white font-mono text-3xl opacity-20 whitespace-nowrap">
                        888.8
                    </div>
                </div>
            </div>
        </div>
    );
});
