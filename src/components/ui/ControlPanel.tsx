import React from 'react';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface ControlPanelProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    title,
    subtitle,
    icon,
    children,
    className = "",
    action
}) => {
    return (
        <GlassCard className={className}>
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-xl text-cyan-400">{icon}</span>}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">{title}</h3>
                        {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {action && <div className="flex items-center">{action}</div>}
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </GlassCard>
    );
};
