import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '', 
  fullScreen = false 
}) => {
  
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-20 h-20 border-4',
    xl: 'w-32 h-32 border-8'
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        
        {/* Glow */}
        <div className={`absolute bg-cyan-500/20 rounded-full blur-xl animate-pulse ${size === 'xl' ? 'w-40 h-40' : 'w-full h-full'}`}></div>

        {/* Static Ring */}
        <div className={`${sizeClasses[size]} border-slate-700 rounded-full opacity-30 absolute`}></div>

        {/* Rotating Ring */}
        <div className={`
            ${sizeClasses[size]} rounded-full 
            border-t-cyan-400 border-r-transparent border-b-cyan-600 border-l-transparent 
            animate-spin shadow-[0_0_15px_rgba(34,211,238,0.4)]
        `}></div>

        {/* Inner Reverse Ring */}
        {size !== 'sm' && (
           <div className={`
              absolute rounded-full border-t-transparent border-r-slate-400 border-b-transparent border-l-slate-400
              animate-[spin_1s_linear_infinite_reverse] opacity-40
              ${size === 'xl' ? 'w-20 h-20 border-4' : size === 'lg' ? 'w-12 h-12 border-2' : 'w-8 h-8 border-2'}
           `}></div>
        )}
      </div>

      {text && (
        <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default Spinner;