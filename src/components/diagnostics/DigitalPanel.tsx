import React from 'react';

interface DigitalPanelProps {
    label: string;
    value: string | number;
    unit?: string;
    status?: 'normal' | 'warning' | 'critical';
    compact?: boolean;
    className?: string;
}

export const DigitalPanel: React.FC<DigitalPanelProps> = React.memo(({ label, value, unit, status = 'normal', compact = false, className = '' }) => {
    const color = status === 'critical' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-slate-200';
    const bg = 'bg-slate-900';
    const border = status === 'critical' ? 'border-red-700' : status === 'warning' ? 'border-amber-700' : 'border-slate-700';

    return (
        <div className={`flex flex-col ${compact ? 'px-2 py-0.5' : 'p-2'} rounded border ${bg} ${border} min-w-[80px] sm:min-w-[100px] flex-1 ${className}`}>
            <span className={`text-[9px] uppercase font-semibold text-slate-500 ${compact ? 'mb-0' : 'mb-1'} tracking-wider truncate`}>{label}</span>
            <div className={`${compact ? 'text-sm sm:text-base leading-tight' : 'text-base sm:text-lg'} font-mono font-semibold ${color} tracking-tight tabular-nums flex items-baseline gap-1`}>
                <span className="truncate">{value}</span>
                {unit && <span className="text-xs text-slate-500 ml-1 shrink-0">{unit}</span>}
            </div>
        </div>
    );
});
