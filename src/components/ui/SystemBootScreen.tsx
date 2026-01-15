import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SystemBootScreen (COMMANDER NC-4.2)
 * High-end initialization experience with technical flickering text and premium aesthetics.
 */
export const SystemBootScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const technicalMessages = [
        "NEURAL CORE INITIALIZATION...",
        "VERIFYING ASSET INTEGRITY...",
        "ESTABLISHING HIVE CONSENSUS...",
        "SECURITY PROTOCOLS ACTIVE.",
        "SYSTEM OPTIMAL."
    ];

    useEffect(() => {
        const duration = 2500; // 2.5 seconds boot sequence for readability
        const interval = 25;
        const step = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + step;
                if (next >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setIsVisible(false);
                        if (onComplete) onComplete();
                    }, 500);
                    return 100;
                }
                return next;
            });
        }, interval);

        // Flicker through messages
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % technicalMessages.length);
        }, 350);

        return () => {
            clearInterval(timer);
            clearInterval(messageInterval);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Background Grid/Effect */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)]" />
                        <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    </div>

                    <div className="relative w-80 md:w-96 space-y-6">
                        {/* Logo or Brand Marker */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex flex-col items-center mb-8"
                        >
                            <div className="text-cyan-500 font-bold tracking-[0.3em] text-sm mb-2">ANOHUB</div>
                            <div className="h-[2px] w-12 bg-cyan-500/50" />
                        </motion.div>

                        {/* Progress Container */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-[10px] font-mono tracking-wider">
                                <motion.span
                                    key={messageIndex}
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    className="text-cyan-400 uppercase"
                                >
                                    {technicalMessages[messageIndex]}
                                </motion.span>
                                <span className="text-slate-500">{Math.round(progress)}%</span>
                            </div>

                            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center flex-col items-center gap-4">
                            <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-[8px] text-slate-600 font-mono uppercase tracking-[0.2em]"
                            >
                                Secure Engineering Protocol Active
                            </motion.div>

                            {/* EMERGENCY BYPASS BUTTON (Appears if stuck > 3s) */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 3 }} // Show after 3 seconds
                                onClick={() => {
                                    console.warn('[SystemBoot] User initiated manual bypass.');
                                    if (onComplete) onComplete();
                                }}
                                className="text-[9px] text-red-500/50 hover:text-red-400 border border-red-900/30 hover:border-red-500/50 px-3 py-1 bg-red-900/10 rounded cursor-pointer transition-colors uppercase tracking-widest mt-4"
                            >
                                Emergency Bypass
                            </motion.button>
                        </div>
                    </div>

                    {/* Scanning Line Effect */}
                    <motion.div
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                        className="absolute left-0 right-0 h-[10vh] bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
