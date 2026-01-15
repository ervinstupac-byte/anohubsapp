import React from 'react';

type SkeletonVariant = 'text' | 'card' | 'chart';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
    /** Visual variant for different contexts */
    variant?: SkeletonVariant;
    /** Enable premium shimmer animation */
    shimmer?: boolean;
}

const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded',
    card: 'rounded-xl',
    chart: 'rounded-lg'
};

/**
 * Premium skeleton loader with shimmer animation.
 * GPU-accelerated using translateX transform.
 */
export const Skeleton: React.FC<SkeletonProps> = React.memo(({
    className = "",
    width,
    height,
    circle = false,
    variant = 'text',
    shimmer = true
}) => {
    const baseClasses = `
        animate-pulse bg-slate-800/50 
        ${circle ? 'rounded-full' : variantStyles[variant]} 
        ${shimmer ? 'shimmer-overlay' : ''}
        ${className}
    `.trim();

    return (
        <div
            className={baseClasses}
            style={{
                width: width || '100%',
                height: height || '1rem'
            }}
        />
    );
});

Skeleton.displayName = 'Skeleton';

/**
 * Card-shaped skeleton for data cards
 */
export const CardSkeleton: React.FC<{ className?: string }> = React.memo(({ className = '' }) => (
    <div className={`glass-panel p-5 space-y-4 ${className}`}>
        <div className="flex justify-between items-start">
            <Skeleton variant="text" width="60%" height="1rem" />
            <Skeleton circle width={24} height={24} />
        </div>
        <Skeleton variant="text" width="40%" height="2.5rem" />
        <div className="pt-3 border-t border-white/5">
            <Skeleton variant="text" width="30%" height="0.75rem" />
        </div>
    </div>
));

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Chart-shaped skeleton for graph placeholders
 */
export const ChartSkeleton: React.FC<{ className?: string; height?: string }> = React.memo(({
    className = '',
    height = '200px'
}) => (
    <div className={`glass-panel p-5 ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <Skeleton variant="text" width="40%" height="1rem" />
            <Skeleton variant="text" width="20%" height="0.75rem" />
        </div>
        <Skeleton variant="chart" width="100%" height={height} />
    </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';
