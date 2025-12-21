// Digital Twin Overlay - AR Assistant with 3D Wireframe Models
// Visualizes 0.05 mm/m deviations with color-coded risk zones

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    AlertTriangle,
    Ruler,
    ThermometerSun,
    Activity,
    X,
    ZoomIn,
    RotateCw
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ITurbineModel, Anomaly } from '../../models/turbine/types';
import { EnhancedAsset } from '../../models/turbine/types';
import { useTelemetry } from '../../contexts/TelemetryContext';

interface DigitalTwinOverlayProps {
    asset: EnhancedAsset;
    turbineModel: ITurbineModel;
    compact?: boolean;
}

export const DigitalTwinOverlay: React.FC<DigitalTwinOverlayProps> = ({
    asset,
    turbineModel,
    compact = false
}) => {
    const { telemetry } = useTelemetry();
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    const tData = telemetry[asset.id];
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

    useEffect(() => {
        // Detect anomalies using turbine model
        if (tData) {
            const detected = turbineModel.detectAnomalies([{
                timestamp: Date.now(),
                assetId: asset.id,
                turbineFamily: asset.turbine_family,
                common: {
                    vibration: tData.vibration,
                    temperature: tData.temperature,
                    output_power: tData.output,
                    efficiency: tData.efficiency,
                    status: tData.status
                }
            }]);
            setAnomalies(detected);
        }
    }, [tData, turbineModel, asset]);

    return (
        <GlassCard className="bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 border-2 border-cyan-500/30 overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">
                        <span className="text-white">Digital Twin</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                            AR Overlay
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Real-time 3D deviation analysis • {asset.turbine_family.toUpperCase()} {turbineModel.variant}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRotation(r => r + 15)}
                        className="w-10 h-10 rounded-full bg-slate-800/50 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
                    >
                        <RotateCw className="w-5 h-5 text-cyan-400" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
                        className="w-10 h-10 rounded-full bg-slate-800/50 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
                    >
                        <ZoomIn className="w-5 h-5 text-cyan-400" />
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: 3D WIREFRAME MODEL */}
                <div className="lg:col-span-2">
                    <div className="aspect-[16/10] bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-cyan-500/20 relative overflow-hidden">
                        {/* Grid background */}
                        <div className="absolute inset-0 opacity-20">
                            <svg width="100%" height="100%">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>

                        {/* 3D Turbine Model */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ rotate: rotation, scale: zoom }}
                            transition={{ type: 'spring', stiffness: 100 }}
                        >
                            {renderTurbineWireframe(asset.turbine_family, anomalies)}
                        </motion.div>

                        {/* Anomaly markers */}
                        <AnimatePresence>
                            {anomalies.map((anomaly, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className={`absolute cursor-pointer ${getAnomalyPosition(index, anomalies.length)}`}
                                    onClick={() => setSelectedZone(anomaly.type)}
                                >
                                    <div className={`w-4 h-4 rounded-full ${getSeverityColor(anomaly.severity)} animate-ping absolute`} />
                                    <div className={`w-4 h-4 rounded-full ${getSeverityColor(anomaly.severity)}`} />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Measurement overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                            <MeasurementTooltip
                                label="Shaft Alignment"
                                value="0.048"
                                unit="mm/m"
                                status="OK"
                                tolerance="0.05"
                            />
                            <MeasurementTooltip
                                label="Vibration"
                                value={tData?.vibration.toFixed(2) || '0'}
                                unit="mm/s"
                                status={tData?.vibration > 4.5 ? 'CRITICAL' : 'OK'}
                                tolerance="4.5"
                            />
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-xs text-slate-400">Within Tolerance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-xs text-slate-400">Warning Zone</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs text-slate-400">Critical Deviation</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ANOMALY DETAILS */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-3">
                            Detected Anomalies
                        </h3>

                        {anomalies.length === 0 ? (
                            <div className="text-center py-8">
                                <Eye className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-50" />
                                <p className="text-xs text-emerald-400 font-bold">All Systems Optimal</p>
                                <p className="text-[10px] text-slate-500 mt-1">No deviations detected</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {anomalies.map((anomaly, index) => (
                                    <AnomalyCard
                                        key={index}
                                        anomaly={anomaly}
                                        selected={selectedZone === anomaly.type}
                                        onClick={() => setSelectedZone(anomaly.type)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tolerance Reference */}
                    <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-500/20">
                        <h3 className="text-sm font-black text-purple-400 uppercase tracking-wider mb-3">
                            Active Tolerances
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(turbineModel.getTolerances()).slice(0, 4).map(([key, threshold]) => (
                                <div key={key} className="flex justify-between text-xs">
                                    <span className="text-slate-400">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-white font-bold">
                                        {threshold.value} {threshold.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// ===== TURBINE WIREFRAME RENDERER =====

function renderTurbineWireframe(family: string, anomalies: Anomaly[]): React.ReactNode {
    const hasAnomalies = anomalies.length > 0;
    const color = hasAnomalies ? '#ef4444' : '#10b981';

    switch (family) {
        case 'kaplan':
            return (
                <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-2xl">
                    {/* Shaft */}
                    <line x1="150" y1="50" x2="150" y2="250" stroke={color} strokeWidth="3" />

                    {/* Hub */}
                    <circle cx="150" cy="150" r="30" fill="none" stroke={color} strokeWidth="2" />

                    {/* Blades (5) */}
                    {[...Array(5)].map((_, i) => {
                        const angle = (i * 72) * Math.PI / 180;
                        const x2 = 150 + Math.cos(angle) * 80;
                        const y2 = 150 + Math.sin(angle) * 80;
                        return (
                            <motion.line
                                key={i}
                                x1="150"
                                y1="150"
                                x2={x2}
                                y2={y2}
                                stroke={color}
                                strokeWidth="4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        );
                    })}

                    {/* Wicket gate ring */}
                    <circle cx="150" cy="150" r="100" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
                </svg>
            );

        case 'francis':
            return (
                <svg width="300" height="300" viewBox="0 0 300 300">
                    {/* Spiral case */}
                    <circle cx="150" cy="150" r="120" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />

                    {/* Runner */}
                    <circle cx="150" cy="150" r="60" fill="none" stroke={color} strokeWidth="3" />

                    {/* Blades (radial) */}
                    {[...Array(12)].map((_, i) => {
                        const angle = (i * 30) * Math.PI / 180;
                        return (
                            <line
                                key={i}
                                x1={150 + Math.cos(angle) * 30}
                                y1={150 + Math.sin(angle) * 30}
                                x2={150 + Math.cos(angle) * 60}
                                y2={150 + Math.sin(angle) * 60}
                                stroke={color}
                                strokeWidth="2"
                            />
                        );
                    })}

                    {/* Draft tube */}
                    <line x1="140" y1="210" x2="140" y2="270" stroke={color} strokeWidth="2" />
                    <line x1="160" y1="210" x2="160" y2="270" stroke={color} strokeWidth="2" />
                </svg>
            );

        case 'pelton':
            return (
                <svg width="300" height="300" viewBox="0 0 300 300">
                    {/* Runner disc */}
                    <circle cx="150" cy="150" r="80" fill="none" stroke={color} strokeWidth="3" />

                    {/* Buckets */}
                    {[...Array(18)].map((_, i) => {
                        const angle = (i * 20) * Math.PI / 180;
                        const x = 150 + Math.cos(angle) * 80;
                        const y = 150 + Math.sin(angle) * 80;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="8"
                                fill="none"
                                stroke={color}
                                strokeWidth="1.5"
                            />
                        );
                    })}

                    {/* Nozzles (4-jet) */}
                    {[0, 90, 180, 270].map((angle, i) => {
                        const rad = angle * Math.PI / 180;
                        const x1 = 150 + Math.cos(rad) * 100;
                        const y1 = 150 + Math.sin(rad) * 100;
                        const x2 = 150 + Math.cos(rad) * 150;
                        const y2 = 150 + Math.sin(rad) * 150;
                        return (
                            <g key={i}>
                                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" />
                                <circle cx={x2} cy={y2} r="5" fill={color} />
                            </g>
                        );
                    })}
                </svg>
            );

        default:
            return null;
    }
}

// ===== HELPER COMPONENTS =====

interface MeasurementTooltipProps {
    label: string;
    value: string;
    unit: string;
    status: 'OK' | 'CRITICAL';
    tolerance: string;
}

const MeasurementTooltip: React.FC<MeasurementTooltipProps> = ({ label, value, unit, status, tolerance }) => (
    <div className={`px-3 py-2 rounded-lg backdrop-blur-md border ${status === 'OK' ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-red-950/80 border-red-500/50'
        }`}>
        <p className="text-[9px] text-slate-400 uppercase font-bold">{label}</p>
        <p className={`text-lg font-black ${status === 'OK' ? 'text-emerald-400' : 'text-red-400'}`}>
            {value} <span className="text-xs text-slate-500">{unit}</span>
        </p>
        <p className="text-[8px] text-slate-500">Tolerance: {tolerance} {unit}</p>
    </div>
);

interface AnomalyCardProps {
    anomaly: Anomaly;
    selected: boolean;
    onClick: () => void;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly, selected, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${selected
                ? 'bg-cyan-500/20 border-cyan-500'
                : anomaly.severity === 'CRITICAL'
                    ? 'bg-red-950/30 border-red-500/30'
                    : 'bg-amber-950/30 border-amber-500/30'
            }`}
    >
        <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${anomaly.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                }`} />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{anomaly.type.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-slate-400 mt-1">{anomaly.parameter}</p>
                <p className="text-[9px] text-slate-500 mt-1">
                    {anomaly.currentValue.toFixed(2)} (Expected: {anomaly.expectedRange[0].toFixed(2)}-{anomaly.expectedRange[1].toFixed(2)})
                </p>
            </div>
        </div>
    </motion.div>
);

// ===== UTILITY FUNCTIONS =====

function getAnomalyPosition(index: number, total: number): string {
    const positions = [
        'top-1/4 left-1/4',
        'top-1/4 right-1/4',
        'bottom-1/4 left-1/4',
        'bottom-1/4 right-1/4',
        'top-1/2 left-1/4',
        'top-1/2 right-1/4'
    ];
    return positions[index % positions.length];
}

function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'CRITICAL':
            return 'bg-red-500';
        case 'HIGH':
            return 'bg-amber-500';
        default:
            return 'bg-yellow-500';
    }
}
