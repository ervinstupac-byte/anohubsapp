import React, { InputHTMLAttributes } from 'react';

interface ModernInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({ 
    label, 
    error, 
    icon, 
    fullWidth = true, 
    className = '', 
    ...props 
}) => {
    return (
        <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className} mb-4`}>
            {label && (
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    {label}
                </label>
            )}
            
            <div className="relative group">
                {/* Icon Position */}
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                        {icon}
                    </div>
                )}

                <input
                    className={`
                        w-full bg-slate-950/50 text-white placeholder-slate-600
                        border border-slate-700/50 rounded-xl
                        ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
                        text-sm font-medium transition-all duration-300
                        focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:bg-slate-900
                        hover:border-slate-600
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    {...props}
                />
                
                {/* Subtle shine effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
            </div>

            {error && (
                <p className="mt-1 ml-1 text-xs text-red-400 font-medium animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};