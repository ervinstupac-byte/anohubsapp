import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    text,
    className = '',
    fullScreen = false
}) => {

    // Size mapping
    const dimensions = {
        sm: { w: 'w-6', h: 'h-6', border: 'border-2' },
        md: { w: 'w-12', h: 'h-12', border: 'border-[3px]' },
        lg: { w: 'w-20', h: 'h-20', border: 'border-4' },
        xl: { w: 'w-32', h: 'h-32', border: 'border-[6px]' }
    };

    const currentSize = dimensions[size];

    const spinnerContent = (
        <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
            <div className="relative flex items-center justify-center">

                {/* Glow Effect */}
                <div className={`absolute bg-cyan-500/30 rounded-full blur-xl animate-pulse ${size === 'xl' ? 'w-48 h-48' : 'w-full h-full scale-150'}`}></div>

                {/* Outer Static Ring */}
                <div className={`${currentSize.w} ${currentSize.h} ${currentSize.border} border-slate-800 rounded-full absolute opacity-50`}></div>

                {/* Main Rotating Ring */}
                <div className={`
                    ${currentSize.w} ${currentSize.h} rounded-full 
                    ${currentSize.border} border-t-cyan-400 border-r-transparent border-b-cyan-600 border-l-transparent 
                    animate-spin shadow-[0_0_20px_rgba(34,211,238,0.5)]
                    relative z-10
                `}></div>

                {/* Inner Counter-Rotating Ring */}
                {size !== 'sm' && (
                    <div className={`
                     absolute rounded-full border-t-transparent border-r-slate-500 border-b-transparent border-l-slate-500
                     animate-[spin_1.5s_linear_infinite_reverse] opacity-60
                     ${size === 'xl' ? 'w-20 h-20 border-4' : size === 'lg' ? 'w-12 h-12 border-2' : 'w-7 h-7 border-2'}
                   `}></div>
                )}

                {/* Center Dot */}
                <div className={`absolute bg-white rounded-full ${size === 'sm' ? 'w-1 h-1' : 'w-2 h-2'} animate-pulse`}></div>
            </div>

            {text && (
                <div className="flex flex-col items-center gap-1">
                    <div className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
                        {text}
                    </div>
                    {/* Loading dots */}
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in pointer-events-none">
                {spinnerContent}
            </div>
        );
    }

    return spinnerContent;
};
// Uklonjen dupli eksport na dnu fajla.