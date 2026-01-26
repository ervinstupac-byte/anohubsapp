import React from 'react';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface StatCardProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    subtitle?: string;
    loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
    label,
    value,
    unit,
    trend,
    icon,
    subtitle,
    loading = false
}) => {
    if (loading) {
        return (
            <GlassCard className="flex flex-col gap-2">
                <div className="w-1/2 h-3 bg-slate-800 animate-pulse rounded"></div>
                <div className="w-3/4 h-8 bg-slate-800 animate-pulse rounded mt-2"></div>
                <div className="w-1/3 h-3 bg-slate-800 animate-pulse rounded"></div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="relative group overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors"></div>

            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                {icon && <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>}
            </div>

            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                    {value}
                </h3>
                {unit && <span className="text-sm font-bold text-slate-500">{unit}</span>}
            </div>

            {(trend || subtitle) && (
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    {trend ? (
                        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span>{trend.isPositive ? '▲' : '▼'}</span>
                            <span>{trend.value}%</span>
                        </div>
                    ) : (
                        <div />
                    )}
                    {subtitle && <span className="text-[10px] text-slate-500 font-medium italic">{subtitle}</span>}
                </div>
            )}
        </GlassCard>
    );
});

StatCard.displayName = 'StatCard';
