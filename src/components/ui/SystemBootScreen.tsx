import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SystemBootScreen (COMMANDER NC-9.0)
 * High-end initialization experience with technical flickering text and premium aesthetics.
 */
export const SystemBootScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);

    const slides = [
        {
            title: "Sovereign Hydro Intelligence",
            subtitle: "Asset Risk Excellence",
            content: "Welcome to Monolit. Your digital twin for predictive maintenance and engineering sovereignty."
        },
        {
            title: "The Sovereign Forge",
            subtitle: "Physics-Guarded Design",
            content: "Input Head and Flow. Let our engine calculate specific speed (nq) and recommend the perfect turbine."
        },
        {
            title: "Command Center",
            subtitle: "Multi-Monitor War Room",
            content: "Orchestrate live telemetry, vibration spectra, and ROI reports across your entire workspace."
        }
    ];

    useEffect(() => {
        // Slide duration: 3s per slide -> 9s total
        const totalDuration = 9000;
        const interval = 100;
        const step = 100 / (totalDuration / interval);

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

        const slideTimer = setInterval(() => {
            setSlideIndex(prev => (prev + 1) % slides.length);
        }, 3000); // 3 seconds per slide

        return () => {
            clearInterval(timer);
            clearInterval(slideTimer);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans"
                >
                    {/* Background Grid/Effect */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)]" />
                        <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    </div>

                    <div className="relative w-[500px] text-center space-y-8 p-8">
                        {/* Logo or Brand Marker */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex flex-col items-center mb-12"
                        >
                            <div className="text-cyan-500 font-bold tracking-[0.3em] text-sm mb-2">MONOLIT</div>
                            <div className="h-[2px] w-12 bg-cyan-500/50" />
                        </motion.div>

                        {/* Content Slides */}
                        <div className="h-32 flex flex-col items-center justify-center">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={slideIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-4"
                                >
                                    <h1 className="text-3xl font-bold text-white tracking-wide uppercase">
                                        {slides[slideIndex].title}
                                    </h1>
                                    <h2 className="text-sm text-cyan-400 uppercase tracking-[0.2em]">
                                        {slides[slideIndex].subtitle}
                                    </h2>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                                        {slides[slideIndex].content}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Progress Container */}
                        <div className="space-y-2 mt-8 max-w-xs mx-auto">
                            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                                <span>INITIALIZING...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </div>

                        <div className="flex justify-center mt-4">
                            {/* EMERGENCY BYPASS BUTTON */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 4 }}
                                onClick={() => {
                                    if (onComplete) onComplete();
                                }}
                                className="text-[9px] text-slate-600 hover:text-white border border-transparent hover:border-white/20 px-3 py-1 rounded transition-colors uppercase tracking-widest"
                            >
                                SKIP INTRO
                            </motion.button>
                        </div>
                    </div>

                    {/* Scanning Line Effect */}
                    <motion.div
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute left-0 right-0 h-[10vh] bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
