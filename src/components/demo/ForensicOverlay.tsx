import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertCircle } from 'lucide-react';

interface ForensicOverlayProps {
    isVisible: boolean;
    targetKKS: string;
    targetName: string;
    coordinates: { x: number; y: number }; // Percentage 0-100 relative to container
}

export const ForensicOverlay: React.FC<ForensicOverlayProps> = ({ isVisible, targetKKS, targetName, coordinates }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* RED OVERLAY FLASH */}
                    <motion.div
                        className="absolute inset-0 bg-red-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 0.5, times: [0, 0.1, 1] }}
                    />

                    {/* TARGET RETICLE */}
                    <motion.div
                        className="absolute transition-all duration-300 ease-out"
                        style={{ left: `${coordinates.x}%`, top: `${coordinates.y}%` }}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                    >
                        {/* Rotating Outer Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 -ml-8 -mt-8 border-2 border-red-500 rounded-full border-dashed opacity-70"
                        />

                        {/* Inner Crosshair */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Target className="w-8 h-8 text-red-500" />
                        </div>

                        {/* Connector Line */}
                        <motion.div
                            className="absolute top-8 left-8 w-24 h-[1px] bg-red-500 origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3 }}
                        />

                        {/* DATA CARD */}
                        <motion.div
                            className="absolute top-8 left-32 w-48 bg-black/80 border border-red-500/50 p-2 rounded backdrop-blur-md"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center gap-2 mb-1 border-b border-red-500/30 pb-1">
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Anomaly Detected</span>
                            </div>
                            <div className="text-xs font-mono font-bold text-white">{targetKKS}</div>
                            <div className="text-[10px] text-slate-400 uppercase">{targetName}</div>
                        </motion.div>
                    </motion.div>

                    {/* SCAN LINES */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
