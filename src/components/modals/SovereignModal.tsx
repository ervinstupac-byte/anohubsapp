import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface SovereignModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    borderColor?: string;
    glowColor?: string;
}

export const SovereignModal: React.FC<SovereignModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    icon,
    borderColor = 'border-white/10',
    glowColor = 'rgba(6, 182, 212, 0.15)'
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-5xl max-h-[90vh] flex flex-col"
                >
                    <GlassCard
                        className={`relative flex flex-col h-full overflow-hidden border-t-2 ${borderColor}`}
                        style={{ boxShadow: `0 0 40px ${glowColor}` }}
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/40 relative overflow-hidden shrink-0">
                            {/* Animated Background Glow */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[150%] bg-cyan-500 blur-[80px] rounded-full animate-pulse" />
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-cyan-400">
                                    {icon || <Shield className="w-5 h-5" />}
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/5 transition-all text-slate-500 hover:text-white group relative z-10"
                            >
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-950/20">
                            {children}
                        </div>

                        {/* FOOTER / STATUS BAR */}
                        <div className="px-8 py-3 border-t border-white/5 bg-black/20 flex justify-between items-center shrink-0">
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Link_Verified</span>
                                </div>
                                <span className="text-[8px] font-mono text-slate-600 uppercase">ISO 9241-110 Compliant</span>
                            </div>
                            <div className="text-[8px] font-mono text-slate-600 uppercase">
                                Sovereign_Control_Instrument_v31.2
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
