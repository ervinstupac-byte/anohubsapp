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
            
            {/* TOAST CONTAINER (UI) - Lebdeći element */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`
                            pointer-events-auto transform transition-all duration-300 ease-out animate-in slide-in-from-right
                            min-w-[300px] max-w-md p-4 rounded-lg shadow-2xl border-l-4 flex items-center justify-between
                            ${toast.type === 'success' ? 'bg-slate-900 text-white border-green-500 shadow-green-900/20' : ''}
                            ${toast.type === 'error' ? 'bg-slate-900 text-white border-red-500 shadow-red-900/20' : ''}
                            ${toast.type === 'warning' ? 'bg-slate-900 text-white border-yellow-500 shadow-yellow-900/20' : ''}
                            ${toast.type === 'info' ? 'bg-slate-900 text-white border-cyan-500 shadow-cyan-900/20' : ''}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">
                                {toast.type === 'success' && '✅'}
                                {toast.type === 'error' && '⚠️'}
                                {toast.type === 'warning' && '🚧'}
                                {toast.type === 'info' && 'ℹ️'}
                            </span>
                            <p className="font-semibold text-sm">{toast.message}</p>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 text-slate-400 hover:text-white"
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