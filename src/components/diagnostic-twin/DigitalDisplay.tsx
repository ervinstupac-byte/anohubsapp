import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [isFlickering, setIsFlickering] = useState(false);

    useEffect(() => {
        setIsFlickering(true);
        const timer = setTimeout(() => setIsFlickering(false), 200);
        return () => clearTimeout(timer);
    }, [value]);

    const colorClasses = {
        cyan: 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]',
        orange: 'text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.9)]',
        red: 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]'
    };

    const bgClasses = {
        cyan: 'from-cyan-500/10 to-blue-500/5',
        orange: 'from-orange-500/10 to-yellow-500/5',
        red: 'from-red-500/10 to-pink-500/5'
    };

    const borderClasses = {
        cyan: 'border-cyan-500/20',
        orange: 'border-orange-500/20',
        red: 'border-red-500/20'
    };

    return (
        <div className={`flex flex-col items-center bg-gradient-to-br ${bgClasses[color]} border-2 ${borderClasses[color]} rounded-xl p-4 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${className}`}>
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{label}</span>
            <div className="flex items-baseline gap-2 relative">
                <div className={`
                    font-mono text-4xl font-black tracking-tight transition-all duration-300
                    ${colorClasses[color]}
                    ${isFlickering ? 'opacity-60 scale-95 skew-x-1' : 'opacity-100'}
                `}>
                    {value}
                </div>
                {unit && (
                    <span className={`text-sm font-bold ${colorClasses[color]} opacity-60 tracking-wide`}>
                        {unit}
                    </span>
                )}

                {/* Premium 7-Segment Background Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden select-none">
                    <div className="w-full h-full text-white font-mono text-4xl opacity-25 whitespace-nowrap flex items-center justify-center">
                        888.8
                    </div>
                </div>
            </div>
            {/* Decimal.js Verified Badge */}
            <div className="mt-3 px-2 py-0.5 rounded-full bg-slate-950/50 border border-white/5 flex items-center gap-1.5 self-end group-hover:border-cyan-500/30 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{t('commander.verified')}</span>
            </div>
        </div>
    );
});
