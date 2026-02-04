import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ToastProps {
    alerts: string[];
    onDismiss?: (index: number) => void;
}

export const ToastSystem: React.FC<ToastProps> = ({ alerts, onDismiss }) => {
    return (
        <div className="fixed bottom-8 left-8 z-[var(--z-banner)] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert + index} // Simple keying
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        className="pointer-events-auto bg-[#1a0f0f] border-l-4 border-red-500 text-white p-4 rounded shadow-2xl flex items-start gap-4 max-w-sm"
                    >
                        <div className="bg-red-500/10 p-2 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-1">Legacy Guard Warning</h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {alert}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
