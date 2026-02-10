import React, { ButtonHTMLAttributes } from 'react';

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    icon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {

    // Base Styles
    const baseStyles = "relative overflow-hidden rounded-xl font-bold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3 px-6 text-sm";

    // Variants
    const variants = {
        primary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/40 border border-white/10 active:opacity-90",
        secondary: "bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-white/10 hover:border-white/20 backdrop-blur-md active:bg-slate-700",
        danger: "bg-red-600 hover:bg-red-500 text-white border border-red-400/50 shadow-lg shadow-red-900/30 active:bg-red-700",
        ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white border border-transparent active:bg-white/10"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    {icon && <span className="text-lg">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};