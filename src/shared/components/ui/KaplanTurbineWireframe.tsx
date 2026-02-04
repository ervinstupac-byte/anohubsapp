import React from 'react';

interface KaplanTurbineWireframeProps {
    activeFeature?: string;
    className?: string;
}

export const KaplanTurbineWireframe: React.FC<KaplanTurbineWireframeProps> = ({ activeFeature, className }) => {
    return (
        <div
            className={`relative w-full aspect-square max-w-[500px] mx-auto ${className}`}
            data-ready="true"
            data-testid="kaplan-wireframe-container"
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-cyan-500/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
            >
                {/* Scroll Casing Outlines */}
                <path d="M10,50 Q10,10 50,10 Q90,10 90,50 Q90,90 50,90 Q10,90 10,50" strokeDasharray="2 2" className="opacity-30" />

                {/* Vertical Shaft */}
                <rect x="48" y="5" width="4" height="60" rx="1" />

                {/* Kaplan Blades (Propeller type) */}
                <g className="animate-spin-slow origin-center" style={{ transformOrigin: '50px 65px' }}>
                    <path d="M50,65 L30,55 L30,75 Z" fill="currentColor" className="opacity-20" />
                    <path d="M50,65 L70,55 L70,75 Z" fill="currentColor" className="opacity-20" />
                    <path d="M50,65 L40,85 L60,85 Z" fill="currentColor" className="opacity-20" />
                    <circle cx="50" cy="65" r="3" fill="currentColor" />
                </g>

                {/* Stay Vanes / Guide Vanes */}
                <circle cx="50" cy="65" r="25" strokeDasharray="1 1" className="opacity-40" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                    <line
                        key={deg}
                        x1="50" y1="65"
                        x2={50 + 20 * Math.cos(deg * Math.PI / 180)}
                        y2={65 + 20 * Math.sin(deg * Math.PI / 180)}
                        className="opacity-50"
                    />
                ))}

                {/* Annotation Lines */}
                <line x1="70" y1="20" x2="85" y2="20" strokeWidth="0.2" />
                <text x="86" y="21" className="text-[2px] fill-cyan-400/60 font-mono">K_SHAFT_V</text>
            </svg>

            {/* SCANNING LINE OVERLAY */}
            <div className="absolute inset-x-0 h-[1.5px] bg-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scanning-line" />
        </div>
    );
};
