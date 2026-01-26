import React from 'react';

interface TacticalCardProps {
    title: string;
    status?: 'nominal' | 'warning' | 'critical' | 'unknown';
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
    title,
    status = 'nominal',
    children,
    className = '',
    headerAction
}) => {
    const statusColors = {
        nominal: 'border-cyan-500/20 bg-slate-950/40',
        warning: 'border-amber-500/30 bg-amber-950/10',
        critical: 'border-red-500/30 bg-red-950/10',
        unknown: 'border-slate-500/20 bg-slate-950/40'
    };

    const statusIndicator = {
        nominal: 'bg-cyan-500',
        warning: 'bg-amber-500',
        critical: 'bg-red-500',
        unknown: 'bg-slate-500'
    };

    return (
        <div className={`tactical-module ${statusColors[status]} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusIndicator[status]} animate-pulse`} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                        {title}
                    </h3>
                </div>
                {headerAction}
            </div>

            {/* Content */}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};
