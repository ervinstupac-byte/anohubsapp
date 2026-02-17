import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2',
        bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full mt-2',
        left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2 mr-2',
        right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2 ml-2'
    };

    const arrows = {
        top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-slate-900',
        bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-slate-900',
        left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-slate-900',
        right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-slate-900'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-50 ${positions[position]} animate-fade-in`}>
                    <div className="bg-slate-900 text-slate-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border border-slate-700 whitespace-nowrap">
                        {content}
                        <div className={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`}></div>
                    </div>
                </div>
            )}
        </div>
    );
};
