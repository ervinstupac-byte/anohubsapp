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
        base: 'glass rounded-2xl',
        deep: 'glass-strong rounded-2xl',
        commander: 'glass-strong rounded-2xl border border-brand-500/30 shadow-glow'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`${variantClasses[variant]} ${noPadding ? '' : 'p-6'} 
                     hover:border-brand-400/40 transition-all duration-500 
                     ${className}`}
            {...props}
        >
            {(title || action) && (
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-brand-300">{icon}</div>}
                        <div>
                            {title && <h3 className="text-lg font-bold text-slate-100 tracking-tight uppercase font-header">{title}</h3>}
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
