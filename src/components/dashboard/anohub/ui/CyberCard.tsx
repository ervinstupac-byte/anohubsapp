import React from 'react';

interface CyberCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'danger' | 'warning' | 'neutral';
    title?: string;
}

export const CyberCard: React.FC<CyberCardProps> = ({ children, className = '', variant = 'primary', title }) => {
    const getBorderColor = () => {
        switch (variant) {
            case 'primary': return 'stroke-cyan-500/30';
            case 'danger': return 'stroke-red-500/30';
            case 'warning': return 'stroke-yellow-500/30';
            default: return 'stroke-slate-700';
        }
    };

    const getCornerColor = () => {
        switch (variant) {
            case 'primary': return 'fill-cyan-500';
            case 'danger': return 'fill-red-500';
            case 'warning': return 'fill-yellow-500';
            default: return 'fill-slate-600';
        }
    };

    return (
        <div className={`relative bg-slate-900/40 backdrop-blur-sm p-4 group ${className}`}>
            {/* SVG Border Frame with Cut Corners */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Frame Path */}
                    <path
                        d={`
               M 10 0 
               L calc(100% - 20) 0 
               L 100% 20 
               L 100% calc(100% - 10) 
               L calc(100% - 10) 100% 
               L 20 100% 
               L 0 calc(100% - 20) 
               L 0 10 
               Z
             `}
                        fill="none"
                        strokeWidth="1"
                        className={`${getBorderColor()} transition-colors duration-500 group-hover:stroke-opacity-80`}
                    />

                    {/* Technical Accents - Top Left */}
                    <path d="M 0 10 L 10 0 L 30 0" fill="none" strokeWidth="2" className={`${getBorderColor()} opacity-50`} />

                    {/* Technical Accents - Bottom Right Corner */}
                    <path d="M calc(100% - 30) 100% L calc(100% - 10) 100% L 100% calc(100% - 10)" fill="none" strokeWidth="2" className={`${getBorderColor()} opacity-50`} />

                    {/* Glowing Corner Notches */}
                    <rect x="-1" y="8" width="2" height="4" className={getCornerColor()} />
                    <rect x="calc(100% - 1)" y="calc(100% - 12)" width="2" height="4" className={getCornerColor()} />
                </svg>
            </div>

            {title && (
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2 flex items-center justify-between">
                    {title}
                    <div className={`w-1 h-1 rounded-full ${variant === 'primary' ? 'bg-cyan-500' : 'bg-slate-500'} shadow-[0_0_8px_currentColor]`} />
                </h3>
            )}

            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
