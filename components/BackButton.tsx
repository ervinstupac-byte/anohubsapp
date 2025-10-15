import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, text = "Natrag" }) => {
  return (
    <button 
      onClick={onClick} 
      className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
      aria-label={text}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{text}</span>
    </button>
  );
};