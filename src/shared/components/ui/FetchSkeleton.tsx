import React from 'react';
import { Skeleton } from './Skeleton';

interface FetchSkeletonProps {
    loading: boolean;
    count?: number;
    rows?: number;
    className?: string;
    children: React.ReactNode;
}

export const FetchSkeleton: React.FC<FetchSkeletonProps> = ({
    loading,
    count = 1,
    rows = 3,
    className = "",
    children
}) => {
    if (!loading) return <>{children}</>;

    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-3 p-4 bg-slate-900/40 rounded-xl border border-white/5">
                    {Array.from({ length: rows }).map((_, j) => (
                        <Skeleton
                            key={j}
                            height={j === 0 ? "1.5rem" : "1rem"}
                            width={j === 0 ? "60%" : j === rows - 1 ? "40%" : "100%"}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
