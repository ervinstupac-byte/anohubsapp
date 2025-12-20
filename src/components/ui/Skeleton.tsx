import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = "",
    width,
    height,
    circle = false
}) => {
    return (
        <div
            className={`
                animate-pulse bg-slate-800/50 
                ${circle ? 'rounded-full' : 'rounded-lg'} 
                ${className}
            `}
            style={{
                width: width || '100%',
                height: height || '1rem'
            }}
        />
    );
};
