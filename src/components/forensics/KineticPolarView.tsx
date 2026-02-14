import React, { useEffect, useRef, useState } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { motion, useAnimation } from 'framer-motion';
import { Activity, ShieldCheck, ZoomIn } from 'lucide-react';

export const KineticPolarView: React.FC = () => {
    const alignment = useTelemetryStore(state => state.alignment);
    const vibration = useTelemetryStore(state => state.mechanical.vibrationX || 0);
    const rpm = useTelemetryStore(state => state.mechanical.rpm || 0);
    
    // Config
    const [magnification, setMagnification] = useState(10); // 10x default
    const [rotation, setRotation] = useState(0);
    const requestRef = useRef<number>();
    
    // Physics Constants
    const BASE_RADIUS = 100;
    const CENTER = 150;
    
    // Animation Loop
    const animate = (time: number) => {
        // Calculate rotation based on RPM (simulated speed for visual if RPM is 0 or low)
        // If RPM is 0 (stopped), we might still want to slowly rotate to show the shape? 
        // Or if it's "Kinetic", it implies movement. 
        // Let's use actual RPM if > 0, else slow idle rotation (10 RPM equivalent)
        const effectiveRpm = rpm > 5 ? rpm : 10;
        const speedFactor = effectiveRpm / 60 * 360; // degrees per second
        
        // Use time delta for smooth animation
        // For simplicity in this loop, we'll just increment based on approximate frame time (16ms)
        // Ideally we use delta time.
        setRotation(prev => (prev + speedFactor * 0.016) % 360);
        
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [rpm]);

    if (!alignment) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-mono uppercase tracking-widest">No Kinetic Data Available</p>
                <p className="text-xs mt-2">Run Alignment Wizard to generate model.</p>
            </div>
        );
    }

    // Calculations
    // Eccentricity in pixels (Magnified)
    const E_px = alignment.eccentricity * magnification;
    // Phase in radians
    const phi_rad = (alignment.phase * Math.PI) / 180;
    
    // Wobble Offset:
    // The center of the shaft is offset by E at angle Phi.
    // As the shaft rotates, this offset point rotates around the true center?
    // Wait. "Runout" usually means the surface is not concentric. 
    // If we rotate the shaft, the geometric center of the shaft is fixed at (E, Phi) relative to rotation axis?
    // No, if it's bent, the cross-section center at the probe plane orbits the bearing center.
    // Let's assume the "Wobble" is the shaft center orbiting the true center.
    // Orbit Radius = E.
    // Current Orbit Angle = Rotation Angle + Phase? Or just Rotation Angle?
    // Usually Phase Lag is involved. Let's keep it simple:
    // The "High Spot" is at angle Phi on the shaft.
    // As the shaft rotates (angle Theta), the High Spot is at (Theta + Phi) in space.
    // So the offset vector rotates.
    
    // Visualizing the Shaft Cross-Section:
    // We draw a circle.
    // Its center (cx, cy) is calculated based on the current rotation angle.
    // cx = CENTER + E_px * cos(rotation_rad + phi_rad)
    // cy = CENTER + E_px * sin(rotation_rad + phi_rad)
    // This makes the circle "orbit" the center.
    
    const rot_rad = (rotation * Math.PI) / 180;
    const wobbleX = E_px * Math.cos(rot_rad + phi_rad);
    const wobbleY = E_px * Math.sin(rot_rad + phi_rad);

    // Vibration Overlay (Task 2)
    // We'll show a "Ghost" or "Force Vector" representing vibration.
    // Amplitude scales with vibration (mm/s).
    // Direction: Usually 1x is synchronous. We'll lock it to the rotation + some lag (e.g. 90 deg).
    const vibScale = vibration * 5; // Scale factor for visual
    const vibX = vibScale * Math.cos(rot_rad + phi_rad - Math.PI / 2); // 90 deg lag approx
    const vibY = vibScale * Math.sin(rot_rad + phi_rad - Math.PI / 2);

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Header / Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-4">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase">
                        <ZoomIn className="w-4 h-4" />
                        Magnification: {magnification}x
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        step="1"
                        value={magnification} 
                        onChange={(e) => setMagnification(parseInt(e.target.value))}
                        className="w-32 accent-cyan-500"
                    />
                </div>
                
                {/* Data Stats */}
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">Eccentricity</div>
                    <div className="text-sm font-mono font-bold text-cyan-400">{alignment.eccentricity.toFixed(3)} mm</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-2">Phase</div>
                    <div className="text-sm font-mono font-bold text-purple-400">{alignment.phase.toFixed(1)}°</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-2">Fit Quality</div>
                    <div className={`text-sm font-mono font-bold ${alignment.rsquared > 0.95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        R² = {alignment.rsquared.toFixed(3)}
                    </div>
                </div>
            </div>

            {/* Certified Badge (Task 3) */}
            {alignment.rsquared > 0.95 && (
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-4 right-4 z-10 bg-emerald-950/80 backdrop-blur border border-emerald-500/50 p-3 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-3"
                >
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <div>
                        <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">Sovereign Certified</div>
                        <div className="text-[10px] text-emerald-600 font-mono">HIGH FIDELITY FIT</div>
                    </div>
                </motion.div>
            )}

            {/* Canvas / SVG Area */}
            <div className="flex-1 flex items-center justify-center bg-slate-950/50 relative overflow-hidden">
                {/* Grid */}
                <svg width="100%" height="100%" viewBox="0 0 300 300" className="absolute inset-0 pointer-events-none opacity-20">
                    <circle cx="150" cy="150" r="50" fill="none" stroke="#334155" strokeDasharray="4 4" />
                    <circle cx="150" cy="150" r="100" fill="none" stroke="#334155" strokeDasharray="4 4" />
                    <line x1="150" y1="0" x2="150" y2="300" stroke="#334155" />
                    <line x1="0" y1="150" x2="300" y2="150" stroke="#334155" />
                </svg>

                <svg width="300" height="300" viewBox="0 0 300 300" className="z-0">
                    {/* 1. The "True Center" Reference */}
                    <circle cx={CENTER} cy={CENTER} r="2" fill="#475569" />

                    {/* 2. The Wobbling Shaft */}
                    <motion.g
                        // We animate the group's transform directly via React state for the "Wobble"
                        // The shaft rotates around its own center, BUT its center orbits the true center.
                        transform={`translate(${wobbleX}, ${wobbleY}) rotate(${rotation}, ${CENTER}, ${CENTER})`}
                        style={{ originX: "150px", originY: "150px" }} // Rotate around center of SVG
                    >
                         {/* Shaft Body */}
                        <circle 
                            cx={CENTER} 
                            cy={CENTER} 
                            r={BASE_RADIUS} 
                            fill="url(#shaftGradient)" 
                            stroke="#06b6d4" 
                            strokeWidth="2"
                            fillOpacity="0.1"
                        />
                        
                        {/* Phase Marker (The "High Spot") */}
                        <line 
                            x1={CENTER} 
                            y1={CENTER} 
                            x2={CENTER + BASE_RADIUS} 
                            y2={CENTER} 
                            stroke="#a855f7" 
                            strokeWidth="2" 
                            strokeDasharray="4 4"
                        />
                        <circle cx={CENTER + BASE_RADIUS} cy={CENTER} r="4" fill="#a855f7" />
                        <text x={CENTER + BASE_RADIUS + 10} y={CENTER} fill="#a855f7" fontSize="10" fontWeight="bold" alignmentBaseline="middle">
                            φ {alignment.phase.toFixed(0)}°
                        </text>

                        {/* Vibration Vector (Task 2) - Attached to shaft */}
                        {vibration > 0.5 && (
                            <g transform={`rotate(-90, ${CENTER}, ${CENTER})`}> 
                                {/* 90 deg lag for vibration peak relative to high spot? Simplified physics */}
                                <line 
                                    x1={CENTER} 
                                    y1={CENTER} 
                                    x2={CENTER + BASE_RADIUS + vibScale * 10} 
                                    y2={CENTER} 
                                    stroke="#ef4444" 
                                    strokeWidth="4" 
                                    strokeOpacity="0.5"
                                />
                                <text x={CENTER + BASE_RADIUS + vibScale * 10 + 5} y={CENTER} fill="#ef4444" fontSize="10" fontWeight="bold">
                                    VIB {vibration.toFixed(1)}
                                </text>
                            </g>
                        )}
                    </motion.g>

                    {/* 3. Definitions */}
                    <defs>
                        <radialGradient id="shaftGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-[10px] text-slate-500 font-mono">
                    LIVE KINETIC MODEL • {rpm.toFixed(0)} RPM • MAG {magnification}x
                </p>
            </div>
        </div>
    );
};
