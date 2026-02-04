import React from 'react';

interface PeltonTurbineWireframeProps {
    activeFeature?: string;
    className?: string;
}

export const PeltonTurbineWireframe: React.FC<PeltonTurbineWireframeProps> = ({ activeFeature, className }) => {
    return (
        <div
            className={`relative w-full aspect-square max-w-[500px] mx-auto ${className}`}
            data-ready="true"
            data-testid="pelton-wireframe-container"
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-cyan-500/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
            >
                {/* Outer Housing */}
                <rect x="15" y="15" width="70" height="70" rx="4" strokeDasharray="2 2" className="opacity-20" />

                {/* Horizontal Shaft */}
                <line x1="5" y1="50" x2="95" y2="50" strokeWidth="2" strokeDasharray="10 2" className="opacity-30" />

                {/* Pelton Runner (Buckets) */}
                <g className="animate-spin-slow origin-center" style={{ transformOrigin: '50px 50px' }}>
                    <circle cx="50" cy="50" r="15" strokeWidth="1" />
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                        <path
                            key={deg}
                            d={`M ${50 + 15 * Math.cos(deg * Math.PI / 180)} ${50 + 15 * Math.sin(deg * Math.PI / 180)} 
                               L ${50 + 25 * Math.cos((deg + 5) * Math.PI / 180)} ${50 + 25 * Math.sin((deg + 5) * Math.PI / 180)} 
                               Q ${50 + 30 * Math.cos(deg * Math.PI / 180)} ${50 + 30 * Math.sin(deg * Math.PI / 180)} 
                                 ${50 + 25 * Math.cos((deg - 5) * Math.PI / 180)} ${50 + 25 * Math.sin((deg - 5) * Math.PI / 180)} Z`}
                            fill="currentColor"
                            className="opacity-40"
                        />
                    ))}
                </g>

                {/* Nozzle / Jet */}
                <path d="M10,80 L40,65" strokeWidth="2" stroke="currentColor" className="text-cyan-400" />
                <path d="M40,65 L45,62 L45,68 Z" fill="currentColor" className="text-cyan-400" />

                {/* Annotation */}
                <text x="10" y="90" className="text-[2px] fill-cyan-400/60 font-mono">P_JET_01_INJECT</text>
            </svg>

            {/* SCANNING LINE OVERLAY */}
            <div className="absolute inset-x-0 h-[1.5px] bg-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scanning-line" />
        </div>
    );
};
