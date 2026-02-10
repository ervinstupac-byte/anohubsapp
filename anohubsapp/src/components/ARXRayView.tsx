// AR X-Ray Visualization for Field Engineers
// Shows 3D internal components with real-time status overlay

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Maximize2, RotateCw, ZoomIn, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { EnhancedAsset } from '../models/turbine/types';
import { useTelemetry } from '../contexts/TelemetryContext';

interface ARXRayViewProps {
    asset: EnhancedAsset;
    compact?: boolean;
}

export const ARXRayView: React.FC<ARXRayViewProps> = ({ asset, compact = false }) => {
    const { telemetry } = useTelemetry();
    const [rotation, setRotation] = useState(0);
    const [xrayDepth, setXrayDepth] = useState(50); // 0-100, how deep to see
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

    const tData = telemetry[asset.id];

    // Component health status
    const componentStatus = {
        runner: getComponentHealth(tData?.vibration, 4.5),
        bearing_upper: getComponentHealth(tData?.temperature, 80),
        bearing_lower: getComponentHealth(tData?.temperature, 80),
        shaft: getComponentHealth((tData as any)?.cylinderPressure, 60),
        guide_vanes: getComponentHealth(tData?.vibration, 4.5),
        generator_rotor: getComponentHealth(tData?.temperature, 90),
        generator_stator: getComponentHealth(tData?.temperature, 90)
    };

    return (
        <GlassCard className={compact ? 'h-96' : 'h-[600px]'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">
                        <span className="text-white">AR X-Ray</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                            Internal View
                        </span>
                    </h3>
                    <p className="text-xs text-slate-400">See inside the turbine - Real-time component status</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400 mr-2">X-Ray Depth:</div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={xrayDepth}
                        onChange={(e) => setXrayDepth(parseInt(e.target.value))}
                        className="w-24"
                    />
                    <span className="text-sm font-bold text-cyan-400">{xrayDepth}%</span>
                </div>
            </div>

            {/* 3D Visualization Area */}
            <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-cyan-500/20 overflow-hidden flex-1">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="ar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#ar-grid)" />
                    </svg>
                </div>

                {/* 3D Model */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotateY: rotation }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {render3DTurbineModel(asset.turbine_family, xrayDepth, componentStatus, setSelectedComponent)}
                </motion.div>

                {/* Component Labels with Status */}
                <AnimatePresence>
                    {Object.entries(componentStatus).map(([component, status], index) => (
                        <ComponentLabel
                            key={component}
                            component={component}
                            status={status}
                            position={getLabelPosition(component, index)}
                            onClick={() => setSelectedComponent(component)}
                            isSelected={selectedComponent === component}
                        />
                    ))}
                </AnimatePresence>

                {/* Rotation control */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRotation(r => r - 15)}
                        className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center hover:bg-cyan-500/30 transition-colors"
                    >
                        <RotateCw className="w-5 h-5 text-cyan-400 transform rotate-180" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRotation(r => r + 15)}
                        className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center hover:bg-cyan-500/30 transition-colors"
                    >
                        <RotateCw className="w-5 h-5 text-cyan-400" />
                    </motion.button>
                </div>
            </div>

            {/* Component Detail Panel */}
            <AnimatePresence>
                {selectedComponent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-4 p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-white">{formatComponentName(selectedComponent)}</h4>
                            <button
                                onClick={() => setSelectedComponent(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <ComponentDetails component={selectedComponent} status={componentStatus[selectedComponent as keyof typeof componentStatus]} />
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};

// ===== 3D MODEL RENDERER =====

function render3DTurbineModel(
    family: string,
    xrayDepth: number,
    componentStatus: Record<string, 'HEALTHY' | 'WARNING' | 'CRITICAL'>,
    onSelectComponent: (component: string) => void
): React.ReactNode {
    const opacity = xrayDepth / 100;

    return (
        <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-2xl">
            {/* Shaft (always visible) */}
            <line
                x1="200" y1="50" x2="200" y2="350"
                stroke={getStatusColor(componentStatus.shaft)}
                strokeWidth="8"
                opacity={0.8 + opacity * 0.2}
                onClick={() => onSelectComponent('shaft')}
                className="cursor-pointer hover:opacity-100 transition-opacity"
            />

            {/* Upper Bearing */}
            <circle
                cx="200" cy="100" r="20"
                fill="none"
                stroke={getStatusColor(componentStatus.bearing_upper)}
                strokeWidth="4"
                opacity={opacity}
                onClick={() => onSelectComponent('bearing_upper')}
                className="cursor-pointer hover:opacity-100 transition-opacity"
            />

            {/* Runner (center) */}
            <circle
                cx="200" cy="200" r="60"
                fill="none"
                stroke={getStatusColor(componentStatus.runner)}
                strokeWidth="6"
                opacity={0.9}
                onClick={() => onSelectComponent('runner')}
                className="cursor-pointer hover:opacity-100 transition-opacity"
            />

            {/* Runner blades */}
            {[...Array(family === 'pelton' ? 18 : 8)].map((_, i) => {
                const angle = (i * (360 / (family === 'pelton' ? 18 : 8))) * Math.PI / 180;
                const x2 = 200 + Math.cos(angle) * 60;
                const y2 = 200 + Math.sin(angle) * 60;
                return (
                    <line
                        key={i}
                        x1="200" y1="200"
                        x2={x2} y2={y2}
                        stroke={getStatusColor(componentStatus.runner)}
                        strokeWidth="3"
                        opacity={opacity * 0.7}
                    />
                );
            })}

            {/* Lower Bearing */}
            <circle
                cx="200" cy="300" r="20"
                fill="none"
                stroke={getStatusColor(componentStatus.bearing_lower)}
                strokeWidth="4"
                opacity={opacity}
                onClick={() => onSelectComponent('bearing_lower')}
                className="cursor-pointer hover:opacity-100 transition-opacity"
            />

            {/* Guide Vanes (for Francis/Kaplan) */}
            {family !== 'pelton' && (
                <circle
                    cx="200" cy="200" r="100"
                    fill="none"
                    stroke={getStatusColor(componentStatus.guide_vanes)}
                    strokeWidth="2"
                    strokeDasharray="10,5"
                    opacity={opacity * 0.5}
                    onClick={() => onSelectComponent('guide_vanes')}
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                />
            )}

            {/* Generator components (if depth > 70%) */}
            {xrayDepth > 70 && (
                <>
                    <rect
                        x="170" y="30" width="60" height="40"
                        fill="none"
                        stroke={getStatusColor(componentStatus.generator_rotor)}
                        strokeWidth="2"
                        opacity={opacity * 0.6}
                        onClick={() => onSelectComponent('generator_rotor')}
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                    />
                    <rect
                        x="160" y="25" width="80" height="50"
                        fill="none"
                        stroke={getStatusColor(componentStatus.generator_stator)}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity={opacity * 0.4}
                        onClick={() => onSelectComponent('generator_stator')}
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                    />
                </>
            )}
        </svg>
    );
}

// ===== HELPER COMPONENTS =====

interface ComponentLabelProps {
    component: string;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    position: { x: string; y: string };
    onClick: () => void;
    isSelected: boolean;
}

const ComponentLabel: React.FC<ComponentLabelProps> = ({ component, status, position, onClick, isSelected }) => {
    const StatusIcon = status === 'HEALTHY' ? CheckCircle : status === 'WARNING' ? AlertCircle : XCircle;
    const statusColor = status === 'HEALTHY' ? 'text-emerald-400' : status === 'WARNING' ? 'text-amber-400' : 'text-red-400';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className={`absolute cursor-pointer ${position.x} ${position.y}`}
            onClick={onClick}
        >
            <div className={`px-2 py-1 rounded-lg backdrop-blur-md border transition-all ${isSelected
                    ? 'bg-cyan-500/30 border-cyan-500'
                    : 'bg-slate-900/70 border-white/20 hover:bg-slate-800/70'
                }`}>
                <div className="flex items-center gap-1">
                    <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                    <span className="text-[10px] font-bold text-white uppercase">{formatComponentName(component)}</span>
                </div>
            </div>
        </motion.div>
    );
};

const ComponentDetails: React.FC<{ component: string; status: 'HEALTHY' | 'WARNING' | 'CRITICAL' }> = ({ component, status }) => {
    const details = {
        runner: { temp: '42°C', vibration: '3.2 mm/s', wear: '15%' },
        bearing_upper: { temp: '65°C', vibration: '2.1 mm/s', oil_quality: 'Good' },
        bearing_lower: { temp: '68°C', vibration: '2.3 mm/s', oil_quality: 'Good' },
        shaft: { alignment: '0.045 mm/m', eccentricity: '0.12 mm', runout: '0.08 mm' },
        guide_vanes: { position: '75%', clearance: '0.3 mm', response: 'Normal' },
        generator_rotor: { temp: '78°C', air_gap: '10.2 mm', balance: 'Good' },
        generator_stator: { temp: '85°C', insulation: 'Good', cooling: 'Normal' }
    };

    const data = details[component as keyof typeof details] || {};

    return (
        <div className="grid grid-cols-3 gap-3">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-bold text-white">{value}</p>
                </div>
            ))}
        </div>
    );
};

// ===== UTILITY FUNCTIONS =====

function getComponentHealth(value: number | undefined, threshold: number): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    if (!value) return 'HEALTHY';
    if (value > threshold * 1.2) return 'CRITICAL';
    if (value > threshold) return 'WARNING';
    return 'HEALTHY';
}

function getStatusColor(status: 'HEALTHY' | 'WARNING' | 'CRITICAL'): string {
    switch (status) {
        case 'HEALTHY': return '#10b981';
        case 'WARNING': return '#f59e0b';
        case 'CRITICAL': return '#ef4444';
    }
}

function formatComponentName(component: string): string {
    return component.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getLabelPosition(component: string, index: number): { x: string; y: string } {
    const positions: Record<string, { x: string; y: string }> = {
        runner: { x: 'left-1/2 -translate-x-1/2', y: 'top-1/2 -translate-y-1/2' },
        bearing_upper: { x: 'left-1/4', y: 'top-1/4' },
        bearing_lower: { x: 'left-3/4', y: 'bottom-1/4' },
        shaft: { x: 'right-1/4', y: 'top-1/2 -translate-y-1/2' },
        guide_vanes: { x: 'left-1/2 -translate-x-1/2', y: 'bottom-1/4' },
        generator_rotor: { x: 'left-1/4', y: 'top-12' },
        generator_stator: { x: 'right-1/4', y: 'top-12' }
    };

    return positions[component] || { x: 'left-1/2', y: 'top-1/2' };
}
