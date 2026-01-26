import React from 'react';
import { useTranslation } from 'react-i18next'; // DODANO: Za i18n
import { useNavigation } from '../contexts/NavigationContext.tsx';

interface BackButtonProps {
    /** Opcioni tekst dugmeta. Default je "Back" (prevedeno). */
    text?: string;
    /** Opcione Tailwind klase za prilagođavanje stila. */
    className?: string;
    /** Opcioni handler za predefiniranje akcije. Ako nije postavljen, koristi se navigateBack. */
    onClick?: () => void; 
}

// OSNOVNE KLASE ZA BACK DUGME
const BASE_CLASSES = `
    group flex items-center space-x-2 px-3 py-1.5 rounded-lg
    text-slate-500 text-xs font-bold uppercase tracking-wider
    border border-transparent
    transition-all duration-300 ease-out
    hover:text-cyan-400 hover:bg-slate-800/80 hover:border-slate-700 hover:shadow-lg
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
`;

// JEDINA DEKLARACIJA I EKSPORT KOMPONENTE BackButton
export const BackButton: React.FC<BackButtonProps> = ({ 
    text, 
    className = "", 
    onClick 
}) => {
    const { t } = useTranslation(); // DODANO: Prevođenje
    const { navigateBack } = useNavigation();

    // Prioritet: onClick prop > navigateBack iz konteksta
    const handleClick = onClick || navigateBack;
    
    // Prevođenje default teksta ako nije definiran putem prop-a
    const buttonText = text ?? t('actions.back', 'Back'); 

    return (
        <button 
            onClick={handleClick} 
            className={`${BASE_CLASSES} ${className}`}
            aria-label={buttonText} // Koristimo prevedeni tekst za pristupačnost
        >
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 transform transition-transform duration-300 group-hover:-translate-x-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    {/* SVG Ikona lijeve strelice */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            <span>{buttonText}</span>
        </button>
    );
};
