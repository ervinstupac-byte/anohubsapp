import React from 'react';
import { STATUS_COLORS, StatusType } from '../../design-tokens';

interface StatusIndicatorProps {
    /** Status type determines color and animation */
    status: StatusType;
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Show pulsing animation for active states */
    pulse?: boolean;
    /** Optional label text */
    label?: string;
    /** Show as pill badge with label */
    variant?: 'dot' | 'badge' | 'led';
    /** Additional className */
    className?: string;
}

const SIZE_CLASSES = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
};

const LABEL_SIZE_CLASSES = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]'
};

/**
 * StatusIndicator — Unified status display component
 * 
 * Use this for all status indicators across the application:
 * - Sync status dots
 * - Alert badges
 * - System health indicators
 * - Connection status
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    size = 'sm',
    pulse = false,
    label,
    variant = 'dot',
    className = ''
}) => {
    const colors = STATUS_COLORS[status];
    const shouldPulse = pulse || status === 'critical' || status === 'syncing';

    // Dot variant — simple colored dot
    if (variant === 'dot') {
        return (
                <div
                className={`
                    ${SIZE_CLASSES[size]} 
                    ${colors.dot} 
                    rounded-none
                    ${className}
                `}
                title={label || status.toUpperCase()}
            />
        );
    }

    // LED variant — industrial rack-mount look
    if (variant === 'led') {
        return (
            <div className={`flex items-center gap-1.5 ${className}`}>
                <div
                    className={`
                        ${SIZE_CLASSES[size]} 
                        ${colors.dot} 
                        rounded-none
                    `}
                />
                {label && (
                    <span className={`${LABEL_SIZE_CLASSES[size]} font-mono text-slate-500 uppercase tracking-widest`}>
                        {label}
                    </span>
                )}
            </div>
        );
    }

    // Badge variant — pill with background
    return (
        <div
            className={`
                inline-flex items-center gap-1.5 
                px-2 py-0.5 
                ${colors.bg} ${colors.border} border 
                rounded-none
                ${className}
            `}
        >
            <div className={`${SIZE_CLASSES[size]} ${colors.dot} rounded-none`} />
            {label && (
                <span className={`${LABEL_SIZE_CLASSES[size]} ${colors.text} font-black uppercase tracking-wider`}>
                    {label}
                </span>
            )}
        </div>
    );
};

StatusIndicator.displayName = 'StatusIndicator';
