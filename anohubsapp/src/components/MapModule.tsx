import React from 'react';
import { GlobalMap } from './GlobalMap.tsx';

interface MapModuleProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MapModule: React.FC<MapModuleProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-md transition-all duration-300 animate-fade-in block">
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevents click-through
                    onClose();
                }}
                className="absolute top-6 right-6 z-[2001] p-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full border border-red-500/50 transition-colors pointer-events-auto"
            >
                <span className="text-sm font-bold uppercase tracking-widest">Close Map</span>
            </button>
            <div className="w-full h-full relative">
                <GlobalMap />
            </div>
        </div>
    );
};
