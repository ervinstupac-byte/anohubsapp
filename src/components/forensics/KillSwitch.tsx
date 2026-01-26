import React, { useState } from 'react';
import { AlertOctagon, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

interface KillSwitchProps {
    onEngage: () => void;
    isActive: boolean;
}

export const KillSwitch: React.FC<KillSwitchProps> = ({ onEngage, isActive }) => {
    const [isSliding, setIsSliding] = useState(false);

    return (
        <div className="relative w-full max-w-sm mx-auto mt-8">
            <div className={`p-1 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-emerald-900/20 border-emerald-500' : 'bg-red-950/30 border-red-500/50'}`}>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 250 }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragStart={() => setIsSliding(true)}
                    onDragEnd={(_, info) => {
                        setIsSliding(false);
                        if (info.offset.x > 200 && !isActive) {
                            onEngage();
                        }
                    }}
                    className={`
                        relative z-10 flex items-center justify-center w-16 h-16 rounded-full shadow-lg
                        ${isActive ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}
                        cursor-grab active:cursor-grabbing
                    `}
                >
                    {isActive ? <Lock size={24} /> : <AlertOctagon size={24} />}
                </motion.button>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-red-400/50'}`}>
                        {isActive ? 'SECURE' : 'SLIDE TO KILL'}
                    </span>
                </div>
            </div>

            {!isActive && (
                <p className="text-center text-[10px] text-red-500 mt-2 font-mono uppercase tracking-wider animate-pulse">
                    ⚠️ Protocol 9: Irreversible Isolation
                </p>
            )}
        </div>
    );
};
