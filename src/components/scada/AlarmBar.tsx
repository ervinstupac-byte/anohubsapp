import React from 'react';

interface AlarmBarProps {
    isActive: boolean;
    message?: string;
}

export const AlarmBar: React.FC<AlarmBarProps> = React.memo(({ isActive, message }) => {
    return (
        <div className={`
            fixed bottom-0 left-[280px] right-0 h-12 flex items-center justify-center 
            border-t-2 font-black tracking-[0.2em] transition-colors duration-500 z-50
            ${isActive
                ? 'bg-red-950/90 border-red-600 text-red-500 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-600'}
        `}>
            {isActive ? (
                <span className="flex items-center gap-4">
                    <span className="text-2xl">⚠️</span>
                    {message || 'ALARM ACTIVE'}
                    <span className="text-2xl">⚠️</span>
                </span>
            ) : (
                <span>SYSTEM NORMAL</span>
            )}
        </div>
    );
});
