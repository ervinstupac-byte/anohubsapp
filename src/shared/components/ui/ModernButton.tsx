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
    const baseStyles = "relative overflow-hidden rounded-none font-bold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-4 px-6 text-sm uppercase";

    // Variants
    const variants = {
        primary: "bg-cyan-700 hover:bg-cyan-600 text-white border border-cyan-500/50 active:bg-cyan-800",
        secondary: "bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-600 active:bg-slate-700",
        danger: "bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700 hover:border-red-500 active:bg-red-900",
        ghost: "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent hover:border-slate-700 active:bg-slate-800"
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
