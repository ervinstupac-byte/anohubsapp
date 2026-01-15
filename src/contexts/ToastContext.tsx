import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastContextType, ToastType } from '../types.ts';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove nakon 4 sekunde
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* MODERN TOAST CONTAINER */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-4 pointer-events-none w-full max-w-sm">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto transform transition-all duration-500 ease-out animate-slide-in-right
                            p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-4 relative overflow-hidden group
                            ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100 shadow-emerald-900/50' : ''}
                            ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-100 shadow-red-900/50' : ''}
                            ${toast.type === 'warning' ? 'bg-amber-900/80 border-amber-500/50 text-amber-100 shadow-amber-900/50' : ''}
                            ${toast.type === 'info' ? 'bg-cyan-900/80 border-cyan-500/50 text-cyan-100 shadow-cyan-900/50' : ''}
                        `}
                    >
                        {/* Glow Effect */}
                        <div className={`absolute -top-10 -left-10 w-20 h-20 rounded-full blur-2xl opacity-50
                            ${toast.type === 'success' ? 'bg-emerald-500' : ''}
                            ${toast.type === 'error' ? 'bg-red-500' : ''}
                            ${toast.type === 'warning' ? 'bg-amber-500' : ''}
                            ${toast.type === 'info' ? 'bg-cyan-500' : ''}
                        `}></div>

                        {/* Icon */}
                        <div className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-inner border border-white/10
                            ${toast.type === 'success' ? 'bg-emerald-800' : ''}
                            ${toast.type === 'error' ? 'bg-red-800' : ''}
                            ${toast.type === 'warning' ? 'bg-amber-800' : ''}
                            ${toast.type === 'info' ? 'bg-cyan-800' : ''}
                        `}>
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✕'}
                            {toast.type === 'warning' && '⚠'}
                            {toast.type === 'info' && 'ℹ'}
                        </div>

                        {/* Content */}
                        <div className="flex-grow pt-1">
                            <p className="font-bold text-sm leading-tight drop-shadow-md">{toast.message}</p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};