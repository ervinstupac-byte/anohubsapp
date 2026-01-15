import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, 'title'> {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    icon?: ReactNode;
    variant?: 'base' | 'deep' | 'commander';
    noPadding?: boolean;
}

export const GlassCard = ({
    children,
    title,
    subtitle,
    className = "",
    action,
    icon,
    variant = 'base',
    noPadding = false,
    ...props
}: GlassCardProps) => {
    const variantClasses = {
        base: 'glass-panel',
        deep: 'glass-panel-deep',
        commander: 'glass-panel-deep noise-commander border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`${variantClasses[variant]} ${noPadding ? '' : 'p-6'} 
                     hover:border-cyan-500/40 transition-all duration-500 
                     ${className}`}
            {...props}
        >
            {(title || action) && (
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{icon}</div>}
                        <div>
                            {title && <h3 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h3>}
                            {subtitle && <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-black">{subtitle}</p>}
                        </div>
                    </div>
                    {action && <div className="ml-4">{action}</div>}
                </div>
            )}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};