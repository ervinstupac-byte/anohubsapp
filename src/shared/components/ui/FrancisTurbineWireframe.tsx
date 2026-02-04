import { motion } from 'framer-motion';
import { useDiagnostic } from '../../../contexts/DiagnosticContext';

interface FrancisTurbineWireframeProps {
    activeFeature?: string;
    className?: string;
}

export const FrancisTurbineWireframe: React.FC<FrancisTurbineWireframeProps> = ({ activeFeature, className }) => {
    const { setActiveModal } = useDiagnostic();
    const isShaftActive = activeFeature === 'shaft-alignment' || activeFeature === 'shaft';
    const isBearingActive = activeFeature === 'bearing-health' || activeFeature === 'bearings' || activeFeature === 'temperature';

    return (
        <div
            className={`relative w-full aspect-square max-w-[500px] mx-auto ${className}`}
            data-ready="true"
            data-testid="turbine-wireframe-container"
        >
            {/* SVG STAGE */}
            <svg
                id="turbine-blueprint-svg"
                data-testid="turbine-blueprint-svg"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full cursor-crosshair"
            >
                {/* 1px Grid / Blueprint aesthetics */}
                <circle cx="200" cy="200" r="180" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.5" />
                <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.5" />
                <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.5" />

                {/* COMPONENT OUTLINES & TOLERANCES (Blueprint Style) */}
                <g strokeOpacity="0.2" stroke="#22d3ee" strokeDasharray="2 2" strokeWidth="0.5">
                    <circle cx="200" cy="200" r="140" />
                    <circle cx="200" cy="200" r="100" />
                </g>

                {/* SPIRAL CASING (SCROLL) */}
                <path
                    id="spiral-casing"
                    data-testid="spiral-casing"
                    d="M200 60C122.68 60 60 122.68 60 200C60 277.32 122.68 340 200 340C277.32 340 340 277.32 340 200C340 161.34 324.33 126.34 298.995 101.005"
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="1.2"
                    className="cursor-pointer hover:stroke-cyan-400 transition-colors"
                    onClick={() => setActiveModal('MECHANICAL')}
                />

                {/* RUNNER ASSEMBLY (STAY VANES & BLADES) */}
                <g id="runner" data-testid="runner" className="cursor-pointer group" onClick={() => setActiveModal('MECHANICAL')}>
                    <circle cx="200" cy="200" r="65" stroke="#06b6d4" strokeWidth="2" opacity="0.3" className="group-hover:opacity-60 transition-opacity" />
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                        <motion.path
                            key={angle}
                            d={`M200 200 L${200 + Math.cos((angle * Math.PI) / 180) * 60} ${200 + Math.sin((angle * Math.PI) / 180) * 60} Q${200 + Math.cos(((angle + 15) * Math.PI) / 180) * 40} ${200 + Math.sin(((angle + 15) * Math.PI) / 180) * 40} 200 200`}
                            stroke="#06b6d4"
                            strokeWidth="1"
                            opacity="0.5"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            style={{ originX: '200px', originY: '200px' }}
                            className="group-hover:stroke-cyan-300 transition-colors"
                        />
                    ))}
                </g>

                {/* SHAFT ASSEMBLY */}
                <g id="shaft" data-testid="shaft" className="cursor-pointer" onClick={() => setActiveModal('MECHANICAL')}>
                    <motion.rect
                        x="193"
                        y="40"
                        width="14"
                        height="320"
                        stroke="#06b6d4"
                        strokeWidth="1"
                        fill={isShaftActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent'}
                        className="hover:stroke-cyan-300 transition-colors"
                        animate={isShaftActive ? {
                            stroke: ['#06b6d4', '#22d3ee', '#06b6d4'],
                            opacity: [0.6, 1, 0.6],
                            filter: ['drop-shadow(0 0 2px #06b6d4)', 'drop-shadow(0 0 12px #06b6d4)', 'drop-shadow(0 0 2px #06b6d4)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </g>

                {/* BEARINGS PULSE ZONES */}
                <g id="bearings" data-testid="bearings" className="cursor-pointer" onClick={() => setActiveModal('MECHANICAL')}>
                    {/* Upper Guide Bearing */}
                    <motion.g
                        animate={isBearingActive ? { opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ originX: '200px', originY: '110px' }}
                    >
                        <rect x="180" y="100" width="40" height="20" stroke="#06b6d4" strokeWidth="1" fill={isBearingActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent'} className="hover:stroke-cyan-300 transition-colors" />
                        <line x1="180" y1="110" x2="220" y2="110" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.5" />
                        {isBearingActive && <circle cx="200" cy="110" r="15" stroke="#ef4444" strokeWidth="0.5" opacity="0.4" />}
                    </motion.g>

                    {/* Lower Guide Bearing */}
                    <motion.g
                        animate={isBearingActive ? { opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        style={{ originX: '200px', originY: '280px' }}
                    >
                        <rect x="180" y="270" width="40" height="20" stroke="#06b6d4" strokeWidth="1" fill={isBearingActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent'} className="hover:stroke-cyan-300 transition-colors" />
                        <line x1="180" y1="280" x2="220" y2="280" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.5" />
                        {isBearingActive && <circle cx="200" cy="280" r="15" stroke="#ef4444" strokeWidth="0.5" opacity="0.4" />}
                    </motion.g>
                </g>

                {/* GUIDE VANES */}
                <g id="guide-vanes">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                        <g key={angle} transform={`rotate(${angle} 200 200)`}>
                            <rect x="280" y="195" width="15" height="10" rx="2" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
                            <line x1="287" y1="195" x2="287" y2="185" stroke="#06b6d4" strokeWidth="0.5" opacity="0.3" />
                        </g>
                    ))}
                </g>

                {/* TECH CALLOUTS (NC-31 High-Grade) */}
                <g className="text-[5px] font-mono fill-cyan-400 opacity-60">
                    <text x="230" y="50">V_ALIGN: 0.02mm/m</text>
                    <text x="230" y="115">BRG_UP: 42.5°C</text>
                    <text x="230" y="285">BRG_LOW: 45.2°C</text>
                    <text x="70" y="100">RUNNER: 13Cr4Ni</text>
                    <text x="70" y="300">FLOW: LAMINAR</text>

                    {/* Dimensions & Tolerance Indicators */}
                    <line x1="60" y1="360" x2="340" y2="360" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="1 2" />
                    <line x1="60" y1="355" x2="60" y2="365" stroke="#06b6d4" strokeWidth="0.5" />
                    <line x1="340" y1="355" x2="340" y2="365" stroke="#06b6d4" strokeWidth="0.5" />
                    <text x="180" y="370" className="text-[6px]">REF: ISO-10816-3</text>
                </g>
            </svg>

            {/* SCANNING LINE OVERLAY */}
            <div className="absolute inset-x-0 h-[1.5px] bg-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.9)] z-10 animate-scanning-line pointer-events-none" />

            {/* CORNER BRACKETS (Refined) */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/30" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/30" />
        </div >
    );
};
