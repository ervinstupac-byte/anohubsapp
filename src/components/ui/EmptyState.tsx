import React from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertCircle, Database, Lightbulb, Wrench, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type EmptyStateVariant = 'telemetry' | 'noData' | 'error' | 'guided' | 'maintenance';

interface EmptyStateAction {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

interface EmptyStateProps {
    /** Variant determines icon and default message */
    variant?: EmptyStateVariant;
    /** Custom title (overrides variant default) */
    title?: string;
    /** Custom description */
    description?: string;
    /** Custom icon override */
    icon?: React.ElementType;
    /** Optional action button(s) */
    action?: EmptyStateAction;
    /** Secondary actions for guided variant */
    secondaryActions?: EmptyStateAction[];
    /** Optional custom className */
    className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: typeof Radio; defaultTitle: string; defaultDesc: string; color: string }> = {
    telemetry: {
        icon: Radio,
        defaultTitle: 'Waiting for Telemetry...',
        defaultDesc: 'The system is awaiting real-time data from sensors.',
        color: 'text-slate-500'
    },
    noData: {
        icon: Database,
        defaultTitle: 'No Data Available',
        defaultDesc: 'There is no data to display at this time.',
        color: 'text-slate-500'
    },
    error: {
        icon: AlertCircle,
        defaultTitle: 'Data Unavailable',
        defaultDesc: 'Unable to load data. Please try again.',
        color: 'text-red-400'
    },
    guided: {
        icon: Lightbulb,
        defaultTitle: 'Get Started',
        defaultDesc: 'Choose an action below to begin.',
        color: 'text-cyan-400'
    },
    maintenance: {
        icon: Wrench,
        defaultTitle: 'Scheduled Maintenance',
        defaultDesc: 'This feature is temporarily unavailable for maintenance.',
        color: 'text-amber-400'
    }
};

/**
 * Professional empty state component for scenarios when
 * data is missing, loading, or unavailable.
 * Uses GPU-accelerated pulse animation.
 * 
 * Variants:
 * - telemetry: Waiting for sensor data
 * - noData: No data to display
 * - error: Error loading data
 * - guided: Get started with suggested actions
 * - maintenance: Scheduled maintenance message
 */
export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
    variant = 'telemetry',
    title,
    description,
    icon: IconOverride,
    action,
    secondaryActions,
    className = ''
}) => {
    const { t } = useTranslation();
    const config = variantConfig[variant];
    const Icon = IconOverride || config.icon;

    const displayTitle = title || t(`emptyState.${variant}.title`, config.defaultTitle);
    const displayDesc = description || t(`emptyState.${variant}.description`, config.defaultDesc);

    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            {/* Pulsing Icon Container */}
            <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                className={`mb-4 p-4 rounded-full border border-white/10 ${variant === 'guided' ? 'bg-cyan-950/30' :
                    variant === 'maintenance' ? 'bg-amber-950/30' :
                        variant === 'error' ? 'bg-red-950/30' :
                            'bg-slate-800/50'
                    }`}
                style={{ willChange: 'opacity' }}
            >
                <Icon className={`w-8 h-8 ${config.color}`} />
            </motion.div>

            {/* Title */}
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                {displayTitle}
            </h4>

            {/* Description */}
            <p className="text-xs text-slate-500 max-w-xs">
                {displayDesc}
            </p>

            {/* Primary Action */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 px-4 py-2 text-xs font-bold text-cyan-400 
                               border border-cyan-500/30 rounded-lg
                               hover:bg-cyan-500/10 transition-colors duration-200
                               flex items-center gap-2"
                >
                    {action.icon}
                    {action.label}
                </button>
            )}

            {/* Secondary Actions (for guided variant) */}
            {secondaryActions && secondaryActions.length > 0 && (
                <div className="mt-4 w-full max-w-sm space-y-2">
                    {secondaryActions.map((sa, idx) => (
                        <button
                            key={idx}
                            onClick={sa.onClick}
                            className="w-full px-4 py-3 text-left text-xs font-bold text-slate-400 
                                       bg-slate-900/50 border border-white/5 rounded-lg
                                       hover:bg-slate-800 hover:text-white hover:border-cyan-500/30 
                                       transition-all flex items-center justify-between group"
                        >
                            <span className="flex items-center gap-2">
                                {sa.icon}
                                {sa.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

EmptyState.displayName = 'EmptyState';
