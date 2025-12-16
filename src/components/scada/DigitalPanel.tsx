import React from 'react';

interface DigitalPanelProps {
    label: string;
    value: string | number;
    unit?: string;
    status?: 'normal' | 'warning' | 'critical';
}

export const DigitalPanel: React.FC<DigitalPanelProps> = ({ label, value, unit, status = 'normal' }) => {
    const color = status === 'critical' ? 'text-red-500' : status === 'warning' ? 'text-amber-500' : 'text-cyan-400';
    const bg = status === 'critical' ? 'bg-red-950/30' : 'bg-slate-900/50';
    const border = status === 'critical' ? 'border-red-500/50' : 'border-slate-700';

    return (
        <div className={`flex flex-col p-2 rounded border ${bg} ${border} min-w-[120px]`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">{label}</span>
            <div className={`text-2xl font-mono font-black ${color} tracking-tight tabular-nums flex items-baseline gap-1`}>
                {value}
                {unit && <span className="text-xs font-bold text-slate-600 ml-1">{unit}</span>}
            </div>
        </div>
    );
};
