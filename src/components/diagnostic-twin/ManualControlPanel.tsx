import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { ManualDataEntry } from '../ManualDataEntry';

export const ManualControlPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 shadow-2xl"
                    >
                        <div className="relative">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-2 -right-2 p-1 bg-slate-800 rounded-full border border-slate-600 text-slate-400 hover:text-white z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <ManualDataEntry />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg border backdrop-blur-sm transition-all duration-300 flex items-center justify-center ${
                    isOpen 
                        ? 'bg-cyan-600 border-cyan-400 text-white rotate-90' 
                        : 'bg-slate-900/80 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400'
                }`}
                title="Manual Injection Control"
            >
                <Settings className="w-6 h-6" />
            </button>
        </div>
    );
};
