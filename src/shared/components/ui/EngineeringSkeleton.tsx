import React from 'react';
import { GLASS, RADIUS, SPACING, SPACING_COMPACT } from '../../design-tokens';
import { useDensity } from '../../../stores/useAppStore';

interface EngineeringSkeletonProps {
    variant?: 'stat' | 'instrument' | 'info' | 'tactical';
    height?: string; // Optional override
    className?: string;
}

export const EngineeringSkeleton: React.FC<EngineeringSkeletonProps> = ({
    variant = 'info',
    height,
    className = ''
}) => {
    const { densityMode } = useDensity();
    const isCompact = densityMode === 'compact';
    const spacing = isCompact ? SPACING_COMPACT : SPACING;

    // Base shimmer effect (non-emissive for field-mode)
    const shimmer = "bg-slate-800/50";

    if (variant === 'stat') {
        return (
            <div className={`${GLASS.base} ${RADIUS.cardLg} ${spacing.cardPadding} border-l-4 border-slate-700 ${className}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`h-3 w-24 rounded-none ${shimmer}`} />
                    <div className={`h-4 w-4 rounded-none ${shimmer}`} />
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                    <div className={`h-8 w-32 rounded-none ${shimmer}`} />
                    <div className={`h-4 w-8 rounded-none ${shimmer}`} />
                </div>
                <div className="border-t border-white/5 pt-3">
                    <div className={`h-2 w-full rounded-none ${shimmer}`} />
                </div>
            </div>
        );
    }

    if (variant === 'instrument') {
        return (
            <div className={`relative ${RADIUS.card} border-2 border-slate-700/50 bg-slate-900/50 ${className}`}>
                {!isCompact && (
                    <>
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-none bg-slate-800" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-none bg-slate-800" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-none bg-slate-800" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-none bg-slate-800" />
                    </>
                )}

                <div className={`relative z-10 ${spacing.cardPadding}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-none ${shimmer}`} />
                            <div className="space-y-1">
                                <div className={`h-3 w-20 rounded-none ${shimmer}`} />
                                <div className={`h-2 w-12 rounded-none ${shimmer}`} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 rounded-none p-3 border border-white/5 mb-2">
                        <div className={`h-8 w-24 rounded-none ${shimmer}`} />
                    </div>

                    <div className={`h-4 w-full rounded-none ${shimmer}`} />
                </div>
            </div>
        );
    }

    // Default (Info/Tactical)
    return (
        <div className={`${GLASS.base} ${RADIUS.cardLg} ${spacing.cardPadding} ${className}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-none ${shimmer}`} />
                    <div className="space-y-2">
                        <div className={`h-4 w-32 rounded-none ${shimmer}`} />
                        <div className={`h-3 w-20 rounded-none ${shimmer}`} />
                    </div>
                </div>
            </div>
            <div className={`h-20 w-full rounded-none ${shimmer}`} />
        </div>
    );
};
