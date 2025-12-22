/**
 * Interactive Asset Silhouette
 * Visual Digital Twin representation with real-time status hotspotting
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIFinding } from '../../types/aiFinding';
import { HealthScore } from '../../types/diagnostics';

interface InteractiveAssetSilhouetteProps {
    turbineType: 'PELTON' | 'FRANCIS' | 'KAPLAN';
    health: HealthScore['breakdown'];
    findings: AIFinding[];
}

interface Hotspot {
    id: string;
    label: string;
    x: number;
    y: number;
    status: 'OK' | 'WARNING' | 'CRITICAL';
    metric?: string;
}

export const InteractiveAssetSilhouette: React.FC<InteractiveAssetSilhouetteProps> = ({
    turbineType,
    health,
    findings
}) => {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    // Determine zone status based on health scores & findings
    const getZoneStatus = (zone: string, score: number): 'OK' | 'WARNING' | 'CRITICAL' => {
        // Override if there is a critical finding for this zone
        const hasCriticalFinding = findings.some(f =>
            f.severity === 'CRITICAL' && f.aiDiagnosis.toLowerCase().includes(zone.toLowerCase())
        );
        if (hasCriticalFinding) return 'CRITICAL';

        if (score < 60) return 'CRITICAL';
        if (score < 80) return 'WARNING';
        return 'OK';
    };

    // Define hotspots based on turbine type (Simplified Schematic for now - Generic Vertical)
    const hotspots: Hotspot[] = [
        {
            id: 'generator',
            label: 'Generator Stator',
            x: 50, y: 20,
            status: getZoneStatus('generator', health.sensory), // approximated mapping
            metric: 'Vib: 0.8mm/s'
        },
        {
            id: 'bearing_upper',
            label: 'Upper Guide Bearing',
            x: 50, y: 35,
            status: getZoneStatus('bearing', health.mechanical),
            metric: 'Temp: 62°C'
        },
        {
            id: 'shaft',
            label: 'Main Shaft',
            x: 50, y: 50,
            status: getZoneStatus('shaft', health.mechanical),
            metric: 'Runout: 0.05mm'
        },
        {
            id: 'bearing_lower',
            label: 'Turbine Guide Bearing',
            x: 50, y: 65,
            status: getZoneStatus('bearing', health.mechanical),
            metric: 'Temp: 58°C'
        },
        {
            id: 'runner',
            label: 'Runner / Impeller',
            x: 50, y: 80,
            status: getZoneStatus('runner', health.hydraulic),
            metric: 'Eff: 94.2%'
        }
    ];

    const getColor = (status: 'OK' | 'WARNING' | 'CRITICAL') => {
        switch (status) {
            case 'CRITICAL': return '#ef4444'; // red-500
            case 'WARNING': return '#f59e0b'; // amber-500
            default: return '#10b981'; // emerald-500
        }
    };

    return (
        <div className="relative w-full h-[500px] bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden group">

            {/* Background Grid - Engineering Feel */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#2dd4bf 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* Schematic SVG */}
            <svg viewBox="0 0 200 400" className="h-full w-auto drop-shadow-2xl opacity-80">
                {/* Generator House */}
                <path d="M40,10 L160,10 L160,80 L40,80 Z" fill="none" stroke="#475569" strokeWidth="2" />
                <path d="M50,20 L150,20 L150,70 L50,70 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

                {/* Shaft */}
                <path d="M95,80 L105,80 L105,300 L95,300 Z" fill="#cbd5e1" />

                {/* Bearings */}
                <rect x="80" y="120" width="40" height="20" rx="2" fill="#334155" stroke="#475569" />
                <rect x="80" y="240" width="40" height="20" rx="2" fill="#334155" stroke="#475569" />

                {/* Runner (Generic) */}
                <path d="M60,300 L140,300 L120,350 L80,350 Z" fill="#334155" stroke="#94a3b8" />

                {/* Water Flow Indicators */}
                <motion.path
                    d="M20,320 Q50,320 60,300"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeOpacity="0.5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    strokeDasharray="5 5"
                />
                <motion.path
                    d="M180,320 Q150,320 140,300"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeOpacity="0.5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    strokeDasharray="5 5"
                />
            </svg>

            {/* Interactive Hotspots Overlay */}
            {hotspots.map((spot) => (
                <div
                    key={spot.id}
                    className="absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer z-10 flex items-center justify-center"
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    onMouseEnter={() => setHoveredZone(spot.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                >
                    {/* Pulse Effect */}
                    <motion.div
                        className="absolute inset-0 rounded-full opacity-50"
                        style={{ backgroundColor: getColor(spot.status) }}
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />

                    {/* Core Core */}
                    <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: getColor(spot.status) }}
                    />

                    {/* Tooltip */}
                    <AnimatePresence>
                        {hoveredZone === spot.id && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 30 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute left-full top-1/2 -translate-y-1/2 bg-slate-800/90 backdrop-blur border border-slate-600 rounded-lg p-3 w-48 shadow-xl"
                            >
                                <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">{spot.label}</div>
                                <div className="text-lg font-mono font-bold text-white flex justify-between items-center">
                                    {spot.metric}
                                    <span style={{ color: getColor(spot.status) }} className="text-xs px-1.5 py-0.5 rounded bg-white/10">
                                        {spot.status}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 text-xs text-slate-500 font-mono">
                MODEL: {turbineType}_GEN_V2
                <br />
                LIVE LINK ACTIVE
            </div>
        </div>
    );
};
