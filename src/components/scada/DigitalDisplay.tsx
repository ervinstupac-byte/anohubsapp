import React from 'react';

interface DigitalDisplayProps {
    value: number | string;
    label: string;
    unit?: string;
    color?: 'cyan' | 'orange' | 'red' | 'green';
    className?: string;
}

export const DigitalDisplay: React.FC<DigitalDisplayProps> = React.memo(({
    value,
    label,
    unit,
    color = 'cyan',
    className = ''
}) => {
    
    // Map legacy colors to SCADA status
    const getStatusColor = (c: string) => {
        switch(c) {
            case 'red': return 'text-status-error';
            case 'orange': return 'text-status-warning';
            case 'green': return 'text-status-ok';
            case 'cyan': default: return 'text-status-info';
        }
    };

    const statusColor = getStatusColor(color);

    return (
        <div className={`flex flex-col items-center bg-scada-panel border border-scada-border rounded-sm p-4 ${className}`}>
            <span className="text-xs font-bold text-scada-muted uppercase tracking-widest mb-2 font-mono">{label}</span>
            <div className="flex items-baseline gap-1">
                <div className={`
                    font-mono text-3xl font-bold tracking-tight tabular-nums
                    ${statusColor}
                `}>
                    {value}
                </div>
                {unit && (
                    <span className="text-xs font-mono text-scada-muted font-normal ml-1">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
});
