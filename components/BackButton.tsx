import React from 'react';
import { useNavigation } from '../contexts/NavigationContext.tsx';

interface BackButtonProps {
  text?: string;
  className?: string;
  onClick?: () => void; // Opcionalno: Ako želimo pregaziti defaultno ponašanje
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  text = "Back", 
  className = "", 
  onClick 
}) => {
  const { navigateBack } = useNavigation();

  // Ako korisnik pošalje svoju funkciju, koristi nju. Inače koristi defaultni navigateBack.
  const handleClick = onClick || navigateBack;

  return (
    <button 
      onClick={handleClick} 
      className={`
        group flex items-center space-x-2 px-4 py-2 rounded-lg
        text-slate-400 font-medium tracking-wide
        border border-transparent
        transition-all duration-300 ease-out
        hover:text-cyan-400 hover:bg-slate-800/50 hover:border-slate-700/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]
        active:scale-95
        ${className}
      `}
      aria-label={text}
    >
      {/* Strelica se pomiče ulijevo na hover */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{text}</span>
    </button>
  );
};