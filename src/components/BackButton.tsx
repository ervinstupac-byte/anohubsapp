import React from 'react';
import { useNavigation } from '../contexts/NavigationContext.tsx';

interface BackButtonProps {
    text?: string;
    className?: string;
    onClick?: () => void; 
}

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const BackButton: React.FC<BackButtonProps> = ({ 
    text = "Back", 
    className = "", 
    onClick 
}) => {
    const { navigateBack } = useNavigation();
    const handleClick = onClick || navigateBack;

    return (
        <button 
            onClick={handleClick} 
            className={`
                group flex items-center space-x-2 px-3 py-1.5 rounded-lg
                text-slate-500 text-xs font-bold uppercase tracking-wider
                border border-transparent
                transition-all duration-300 ease-out
                hover:text-cyan-400 hover:bg-slate-800/80 hover:border-slate-700 hover:shadow-lg
                active:scale-95
                ${className}
            `}
            aria-label={text}
        >
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 transform transition-transform duration-300 group-hover:-translate-x-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            <span>{text}</span>
        </button>
    );
};

// Uklonjen dupli eksport na dnu fajla.