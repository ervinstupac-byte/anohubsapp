import React from 'react';

// Proširujemo standardne HTML atribute za div element
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    title,
    subtitle,
    action,
    ...props // Ovdje hvatamo 'style', 'onClick', itd.
}) => {
    return (
        <div
            className={`
                bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 
                shadow-[0_4px_24px_rgba(0,0,0,0.5)] 
                ring-1 ring-white/5
                ${className}
            `}
            {...props}
        >
            {(title || action) && (
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {title && <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-400 font-medium">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};