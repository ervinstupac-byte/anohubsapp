
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Zap, Target, Layers, Info } from 'lucide-react';
import { TORQUE_STANDARDS } from '../../lib/data/TorqueStandards';
import { MECHANICAL_TOLERANCES } from '../../lib/physics/SovereignPhysicsEngine';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

// Reuse the SVG coordinates from the Vault (GeneratorDetailView & RunnerDetailView)
const OVERVIEW_HOTSPOTS = [
    { id: 'ov-gen', x: 18.5, y: 40.5, label: 'Generator Unit', type: 'GENERATOR_OV' },
    { id: 'ov-shaft', x: 41.8, y: 49.7, label: 'Shaft & Flywheel', type: 'SHAFT_OV' },
    { id: 'ov-spiral', x: 60.8, y: 53.2, label: 'Spiral Case', type: 'SPIRAL_OV' },
    { id: 'ov-runner', x: 60.8, y: 53.2, label: 'Francis Runner', type: 'RUNNER_OV' },
    { id: 'ov-miv', x: 81.9, y: 49.7, label: 'Main Inlet Valve', type: 'MIV_OV' },
    { id: 'ov-penstock', x: 94.3, y: 52.6, label: 'Penstock', type: 'PENSTOCK_OV' },
];

const GENERATOR_HOTSPOTS = [
    { id: 'gen-bearing', x: 15, y: 48, label: 'Front Bearing', type: 'ALIGNMENT' },
    { id: 'gen-anchor', x: 25, y: 75, label: 'Anchor Bolts', type: 'TORQUE_M36' },
    { id: 'gen-ground', x: 82, y: 35, label: 'Grounding Brush', type: 'ELECTRICAL' },
];

const RUNNER_HOTSPOTS = [
    { id: 'run-gap', x: 50, y: 35, label: 'Wearing Gap', type: 'GAP' },
    { id: 'run-cover', x: 80, y: 45, label: 'Head Cover', type: 'TORQUE_M24' },
    { id: 'run-blades', x: 50, y: 50, label: 'Runner Blades', type: 'CAVITATION' },
];

interface ForensicVisualizerProps {
    viewMode: 'GENERATOR' | 'RUNNER' | 'OVERVIEW';
    onHotspotSelect?: (hotspotId: string, context: any) => void;
}

export const ForensicVisualizer: React.FC<ForensicVisualizerProps> = ({ viewMode, onHotspotSelect }) => {
    const { t } = useTranslation();
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
    
    // Connect to Telemetry Store for ISO 10816-5 Pulse Logic
    const mechanical = useTelemetryStore(state => state.mechanical);
    const activeAlarms = useTelemetryStore(state => state.activeAlarms);

    let hotspots = GENERATOR_HOTSPOTS;
    let bgImage = '/geno_fr_h_manje_od_5.svg';

    if (viewMode === 'RUNNER') {
        hotspots = RUNNER_HOTSPOTS;
        bgImage = '/francis_runner_info.svg';
    } else if (viewMode === 'OVERVIEW') {
        hotspots = OVERVIEW_HOTSPOTS;
        bgImage = '/Turbine_Grouped.svg';
    }

    // Helper to get Sovereign Standard data for the active hotspot
    const getStandardData = (type: string) => {
        switch (type) {
            case 'TORQUE_M36':
                return {
                    title: 'Torque Standard (M36)',
                    value: `${TORQUE_STANDARDS.ANCHOR_M36.torqueNm} Nm`,
                    context: 'Star Pattern Required',
                    icon: Shield,
                    color: 'text-amber-400'
                };
            case 'TORQUE_M24':
                return {
                    title: 'Torque Standard (M24)',
                    value: `${TORQUE_STANDARDS.HEAD_COVER_M24.torqueNm} Nm`,
                    context: 'Check Lubrication',
                    icon: Shield,
                    color: 'text-amber-400'
                };
            case 'ALIGNMENT':
                return {
                    title: 'Alignment Tolerance',
                    value: `${MECHANICAL_TOLERANCES.ALIGNMENT_MM_M} mm/m`,
                    context: 'ISO 10816-5',
                    icon: Target,
                    color: 'text-cyan-400'
                };
            case 'GAP':
                return {
                    title: 'Wearing Gap Limit',
                    value: `${MECHANICAL_TOLERANCES.WEARING_GAP_MIN_MM} - ${MECHANICAL_TOLERANCES.WEARING_GAP_MAX_MM} mm`,
                    context: 'Efficiency Critical',
                    icon: Layers,
                    color: 'text-emerald-400'
                };
            case 'ELECTRICAL':
                return {
                    title: 'Shaft Grounding',
                    value: '< 10 mΩ',
                    context: 'Prevent EDM',
                    icon: Zap,
                    color: 'text-purple-400'
                };
            case 'GENERATOR_OV':
                return {
                    title: 'Generator Unit',
                    value: 'DRILL-DOWN',
                    context: 'Click to Enter',
                    icon: Zap,
                    color: 'text-cyan-400',
                    drillDown: 'GENERATOR'
                };
            case 'RUNNER_OV':
                return {
                    title: 'Francis Runner',
                    value: 'DRILL-DOWN',
                    context: 'Click to Enter',
                    icon: Layers,
                    color: 'text-cyan-400',
                    drillDown: 'RUNNER'
                };
            case 'SHAFT_OV':
                return {
                    title: 'Shaft & Flywheel',
                    value: 'Nominal',
                    context: 'Coupling Secure',
                    icon: Target,
                    color: 'text-emerald-400'
                };
            case 'SPIRAL_OV':
                return {
                    title: 'Spiral Case',
                    value: 'Pressurized',
                    context: 'No Cavitation',
                    icon: Layers,
                    color: 'text-blue-400'
                };
            case 'MIV_OV':
                return {
                    title: 'Main Inlet Valve',
                    value: 'Open (100%)',
                    context: 'Hydraulic Lock',
                    icon: Shield,
                    color: 'text-emerald-400'
                };
            case 'PENSTOCK_OV':
                return {
                    title: 'Penstock',
                    value: 'Flow Stable',
                    context: 'Water Hammer Monitor',
                    icon: Droplets,
                    color: 'text-blue-400'
                };
            default:
                return null;
        }
    };

    const handleHotspotClick = (spot: typeof hotspots[0]) => {
        const isActive = activeHotspot === spot.id;
        const nextState = isActive ? null : spot.id;
        setActiveHotspot(nextState);
        
        if (nextState && onHotspotSelect) {
            const data = getStandardData(spot.type);
            onHotspotSelect(spot.id, {
                label: spot.label,
                ...data
            });
        }
    };

    // Determine if a hotspot should pulse red based on Telemetry
    const isAlarmActive = (type: string) => {
        // 1. Check specific alarms
        const hasMechAlarm = activeAlarms.some(a => a.message.includes('SOVEREIGN_MECHANICAL_ALARM'));
        
        // 2. Check Raw Values (ISO 10816-5 Logic)
        if (type === 'ALIGNMENT') {
            const maxVib = Math.max(mechanical.vibrationX || 0, mechanical.vibrationY || 0);
            return maxVib > 0.1 || hasMechAlarm; // 0.1 mm/s threshold for demo pulse
        }
        if (type === 'GAP') {
             // Logic: If efficiency drops drastically, wearing gap might be issue
             // For visualizer, we assume alarm state is sufficient
             return hasMechAlarm;
        }
        return false;
    };

    const activeData = activeHotspot ? getStandardData(hotspots.find(h => h.id === activeHotspot)?.type || '') : null;

    return (
        <div className="relative w-full h-[600px] bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden group shadow-2xl">
            
            {/* Background Layer with Blueprint Filter */}
            <div className="absolute inset-0 flex items-center justify-center p-8 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                <img 
                    src={bgImage} 
                    alt="Blueprint" 
                    className="w-full h-full object-contain"
                    style={{ filter: 'sepia(1) hue-rotate(180deg) saturate(1.5) brightness(0.8)' }} 
                />
            </div>

            {/* Interactive SVG Overlay */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
                {hotspots.map((spot) => {
                    const isCritical = isAlarmActive(spot.type);
                    const pulseColor = isCritical ? '#ef4444' : (spot.id === activeHotspot ? '#22d3ee' : '#94a3b8');
                    
                    return (
                        <g 
                            key={spot.id} 
                            onClick={() => handleHotspotClick(spot)}
                            className="cursor-pointer hover:opacity-100 transition-opacity"
                        >
                            {/* Pulsing Ring */}
                            <motion.circle
                                cx={spot.x}
                                cy={spot.y}
                                r="3"
                                fill="transparent"
                                stroke={pulseColor}
                                strokeWidth={isCritical ? "0.5" : "0.2"}
                                animate={{ 
                                    r: isCritical ? [3, 8, 3] : [3, 4, 3], 
                                    opacity: isCritical ? [0.8, 0, 0.8] : [0.5, 1, 0.5] 
                                }}
                                transition={{ duration: isCritical ? 1 : 2, repeat: Infinity }}
                            />
                            
                            {/* Core Dot */}
                            <circle 
                                cx={spot.x} 
                                cy={spot.y} 
                                r="1.5" 
                                className={isCritical ? "fill-red-500" : "fill-cyan-500/80"} 
                            />
                            
                            {/* Leader Line (Visible on Hover/Active) */}
                            <AnimatePresence>
                                {(activeHotspot === spot.id || isCritical) && (
                                    <motion.g
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <line 
                                            x1={spot.x} y1={spot.y} 
                                            x2={spot.x + 10} y2={spot.y - 10} 
                                            stroke={pulseColor} 
                                            strokeWidth="0.2" 
                                        />
                                        <text 
                                            x={spot.x + 12} y={spot.y - 12} 
                                            fill={pulseColor} 
                                            fontSize="3" 
                                            fontWeight="bold"
                                            fontFamily="monospace"
                                        >
                                            {spot.label.toUpperCase()} {isCritical && '⚠'}
                                        </text>
                                    </motion.g>
                                )}
                            </AnimatePresence>
                        </g>
                    );
                })}
            </svg>

            {/* Sovereign Data Card (The Oracle Overlay) */}
            <AnimatePresence>
                {activeData && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-4 right-4 w-64 bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md rounded-lg p-4 shadow-2xl z-20"
                    >
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                            <div className={`p-2 rounded bg-slate-800 ${activeData.color}`}>
                                <activeData.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sovereign Standard</h4>
                                <div className="text-sm font-black text-white">{activeData.title}</div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Target Value</div>
                                <div className={`text-xl font-mono font-bold ${activeData.color}`}>
                                    {activeData.value}
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-2 bg-slate-800/50 p-2 rounded">
                                <Info className="w-3 h-3 text-slate-400 mt-0.5" />
                                <div className="text-xs text-slate-300 italic">
                                    "{activeData.context}"
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Toggle */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="px-3 py-1 bg-black/60 rounded text-xs font-mono text-cyan-500 border border-cyan-500/20">
                    MODE: {viewMode}
                </div>
                {activeAlarms.length > 0 && (
                    <div className="px-3 py-1 bg-red-500/20 rounded text-xs font-mono text-red-400 border border-red-500/30 animate-pulse">
                        ALARM ACTIVE
                    </div>
                )}
            </div>
        </div>
    );
};
