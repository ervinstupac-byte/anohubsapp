import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalMap } from './GlobalMap';
import { GlassCard } from '../shared/components/ui/GlassCard';

interface MapModuleProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MapModule: React.FC<MapModuleProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-full max-w-7xl max-h-[90vh]"
                >
                    <GlassCard className="relative h-full flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-cyan-400 tracking-wide">
                                    GLOBAL FLEET MAP
                                </h2>
                                <p className="text-xs text-slate-400 font-mono mt-1">
                                    Live Telemetry & Asset Tracking
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative bg-slate-950/80">
                            <GlobalMap />
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
