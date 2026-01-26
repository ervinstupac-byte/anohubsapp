import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EcosystemMap } from '../ui/EcosystemMap';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface SystemOverviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SystemOverviewModal - Displays the high-level ecosystem map.
 * Allows users to visualize the connections between modules.
 */
export const SystemOverviewModal: React.FC<SystemOverviewModalProps> = ({ isOpen, onClose }) => {
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
                    className="w-full max-w-4xl"
                >
                    <GlassCard className="relative overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-cyan-400 tracking-wide">
                                    ANOHUB // SYSTEM TOPOLOGY
                                </h2>
                                <p className="text-xs text-slate-400 font-mono mt-1">
                                    Seamless Workflow Integration Status: ACTIVE
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
                        <div className="p-6 bg-slate-950/80">
                            <EcosystemMap />

                            <div className="mt-6 grid grid-cols-3 gap-4 text-xs font-mono text-slate-500 border-t border-white/5 pt-4">
                                <div>
                                    <span className="text-cyan-400 block mb-1">SYNC STATUS</span>
                                    BroadcastChannel Active (14ms latency)
                                </div>
                                <div>
                                    <span className="text-purple-400 block mb-1">DATA BRIDGE</span>
                                    Legacy Contexts &rarr; Zustand Store
                                </div>
                                <div>
                                    <span className="text-amber-400 block mb-1">EVENT LOOP</span>
                                    Protocol Markers &rarr; Executive Dashboard
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
