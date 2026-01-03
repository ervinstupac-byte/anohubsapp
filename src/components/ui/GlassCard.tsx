import React, { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    action?: ReactNode;
    style?: React.CSSProperties;
    onClick?: () => void;
    icon?: ReactNode;
}

export const GlassCard = ({
    children,
    title,
    subtitle,
    className = "",
    action,
    style,
    onClick,
    icon
}: GlassCardProps) => (
    <div
        onClick={onClick}
        style={style}
        className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 
                 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-cyan-500/30 transition-all duration-500 
                 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {(title || action) && (
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {icon && <div className="text-cyan-500">{icon}</div>}
                    <div>
                        {title && <h3 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h3>}
                        {subtitle && <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
                    </div>
                </div>
                {action && <div className="ml-4">{action}</div>}
            </div>
        )}
        {children}
    </div>
);