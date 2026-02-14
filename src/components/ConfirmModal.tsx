import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';

interface ConfirmModalProps {
    title: string;
    message: string;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    variant?: 'danger' | 'info' | 'success';
}

export default function ConfirmModal({ 
    title, 
    message, 
    open, 
    onConfirm, 
    onCancel,
    confirmLabel = 'Confirm',
    variant = 'danger'
}: ConfirmModalProps) {
    const getIcon = () => {
        switch (variant) {
            case 'success': return <CheckCircle className="w-6 h-6 text-green-400" />;
            case 'info': return <Info className="w-6 h-6 text-blue-400" />;
            default: return <AlertTriangle className="w-6 h-6 text-red-400" />;
        }
    };

    const getButtonColor = () => {
        switch (variant) {
            case 'success': return 'bg-green-600 hover:bg-green-500';
            case 'info': return 'bg-blue-600 hover:bg-blue-500';
            default: return 'bg-red-600 hover:bg-red-500';
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onCancel} 
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        <GlassCard className={`p-6 border-${variant === 'danger' ? 'red' : variant === 'success' ? 'green' : 'blue'}-500/30`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full bg-${variant === 'danger' ? 'red' : variant === 'success' ? 'green' : 'blue'}-500/10 border border-${variant === 'danger' ? 'red' : variant === 'success' ? 'green' : 'blue'}-500/20`}>
                                    {getIcon()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                    <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    onClick={onCancel} 
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onConfirm} 
                                    className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${getButtonColor()}`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
