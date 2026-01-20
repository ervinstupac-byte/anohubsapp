import React from 'react';
import { motion } from 'framer-motion';

interface TurbineLoaderProps {
    message?: string;
}

export const TurbineLoader: React.FC<TurbineLoaderProps> = ({ message = "Generiranje..." }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-10">
            {/* Turbine Container */}
            <div className="relative w-24 h-24 flex items-center justify-center">

                {/* Outer Ring (Stator) */}
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                <motion.div
                    className="absolute inset-0 border-t-4 border-[#2dd4bf] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Runner (Rotor) - SVG Representation of Pelton Bucket */}
                <motion.svg
                    viewBox="0 0 24 24"
                    className="w-12 h-12 text-[#2dd4bf] drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                </motion.svg>
            </div>

            {/* Technical Message */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[#2dd4bf] font-mono text-sm tracking-widest uppercase">
                    {message}
                </span>
                <span className="text-slate-500 text-[10px] font-mono">
                    PROCESSING_DATA_STREAM
                </span>
            </div>
        </div>
    );
};
