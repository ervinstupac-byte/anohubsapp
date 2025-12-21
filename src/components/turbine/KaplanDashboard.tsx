// Kaplan Turbine Dashboard
// Component-based UI with dynamic panels for each variant

import React from 'react';
import { motion } from 'framer-motion';
import {
    Gauge,
    Droplets,
    Cog,
    AlertCircle,
    TrendingUp,
    Wind,
    Waves
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ITurbineModel } from '../../models/turbine/types';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useAssetContext } from '../../contexts/AssetContext';

interface KaplanDashboardProps {
    turbineModel: ITurbineModel;
}

export const KaplanDashboard: React.FC<KaplanDashboardProps> = ({ turbineModel }) => {
    const { telemetry } = useTelemetry();
    const { selectedAsset } = useAssetContext();

    if (!selectedAsset) return null;

    const tData = telemetry[selectedAsset.id];
    const kaplanData = (tData as any)?.kaplan_data || {};

    return (
        <div className="space-y-6">
            {/* PRIMARY CONTROLS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BladeAngleVisualizer
                    angle={kaplanData.blade_angle || 0}
                    setpoint={kaplanData.blade_angle_setpoint || 0}
                    tolerance={turbineModel.getTolerances().blade_angle_deviation}
                />

                <HubPositionMonitor
                    position={kaplanData.hub_position || 0}
                    tolerance={turbineModel.getTolerances().hub_play}
                />

                <WicketGateControl
                    position={kaplanData.wicket_gate_position || 0}
                />
            </div>

            {/* VARIANT-SPECIFIC PANELS */}
            {turbineModel.variant === 'kaplan_bulb' && (
                <BulbSpecificPanel
                    submersionDepth={kaplanData.generator_submersion_depth || 0}
                    sealPressure={kaplanData.seal_water_pressure || 0}
                />
            )}

            {turbineModel.variant === 'kaplan_horizontal' && (
                <HydraulicRunawayMonitor
                    servoPressure={kaplanData.servo_oil_pressure || 0}
                    hoseTension={kaplanData.hose_tension || 0}
                    pipeDiameter={kaplanData.pipe_diameter || 12}
                />
            )}

            {/* SERVO SYSTEM MONITORING */}
            <ServoSystemPanel
                pressure={kaplanData.servo_oil_pressure || 0}
                variant={turbineModel.variant}
            />
        </div>
    );
};

// ===== BLADE ANGLE VISUALIZER =====

interface BladeAngleVisualizerProps {
    angle: number;
    setpoint: number;
    tolerance: any;
}

const BladeAngleVisualizer: React.FC<BladeAngleVisualizerProps> = ({ angle, setpoint, tolerance }) => {
    const deviation = Math.abs(angle - setpoint);
    const isOutOfTolerance = deviation > (tolerance?.value || 0.1);

    return (
        <GlassCard className={`border-l-4 ${isOutOfTolerance ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Cog className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Blade Angle</p>
                    <p className="text-xs text-slate-400">Kut lopatica rotora</p>
                </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Background arc */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="8"
                    />
                    {/* Value arc */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={isOutOfTolerance ? '#ef4444' : '#10b981'}
                        strokeWidth="8"
                        strokeDasharray={`${(angle / 30) * 283} 283`}
                        className="transition-all duration-500"
                    />
                    {/* Setpoint marker */}
                    <circle
                        cx={50 + 40 * Math.cos((setpoint / 30) * 2 * Math.PI - Math.PI / 2)}
                        cy={50 + 40 * Math.sin((setpoint / 30) * 2 * Math.PI - Math.PI / 2)}
                        r="3"
                        fill="#fbbf24"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{angle.toFixed(1)}°</span>
                    <span className="text-xs text-slate-500">of {setpoint.toFixed(1)}°</span>
                </div>
            </div>

            {/* Deviation indicator */}
            <div className={`p-2 rounded-lg text-center ${isOutOfTolerance ? 'bg-red-950/30 border border-red-500/30' : 'bg-emerald-950/30 border border-emerald-500/30'
                }`}>
                <p className={`text-xs font-bold ${isOutOfTolerance ? 'text-red-400' : 'text-emerald-400'}`}>
                    Deviation: {deviation.toFixed(2)}° {isOutOfTolerance && '⚠️ OUT OF TOLERANCE'}
                </p>
            </div>
        </GlassCard>
    );
};

// ===== HUB POSITION MONITOR =====

interface HubPositionMonitorProps {
    position: number;
    tolerance: any;
}

const HubPositionMonitor: React.FC<HubPositionMonitorProps> = ({ position, tolerance }) => {
    const isExcessive = position > (tolerance?.value || 0.02);

    return (
        <GlassCard className={`border-l-4 ${isExcessive ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Hub Play</p>
                    <p className="text-xs text-slate-400">Igra u centru lopatica</p>
                </div>
            </div>

            {/* Linear bar */}
            <div className="mb-4">
                <div className="h-24 w-full bg-slate-800/50 rounded-lg relative overflow-hidden">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(position / 0.1) * 100}%` }}
                        className={`absolute bottom-0 left-0 right-0 ${isExcessive ? 'bg-gradient-to-t from-red-500 to-red-300' : 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                            }`}
                    />
                    {/* Tolerance line */}
                    <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400"
                        style={{ bottom: `${(tolerance?.value || 0.02) / 0.1 * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                    <p className="text-2xl font-black text-white">{(position * 1000).toFixed(1)}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">µm</p>
                </div>
                <div>
                    <p className="text-2xl font-black text-amber-400">{((tolerance?.value || 0.02) * 1000).toFixed(0)}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Max µm</p>
                </div>
            </div>

            {isExcessive && (
                <div className="mt-3 p-2 bg-red-950/30 border border-red-500/30 rounded text-center">
                    <p className="text-[10px] text-red-400 font-bold">⚠️ Bearing wear detected</p>
                </div>
            )}
        </GlassCard>
    );
};

// ===== WICKET GATE CONTROL =====

interface WicketGateControlProps {
    position: number;
}

const WicketGateControl: React.FC<WicketGateControlProps> = ({ position }) => {
    return (
        <GlassCard className="border-l-4 border-l-cyan-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Wind className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Wicket Gate</p>
                    <p className="text-xs text-slate-400">Pozicija prsten-lopatic</p>
                </div>
            </div>

            {/* Fan visualization */}
            <div className="relative w-32 h-32 mx-auto mb-4">
                {[...Array(8)].map((_, i) => {
                    const rotation = (i * 45) + (position / 100 * 30);
                    return (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 w-16 h-1 bg-cyan-400/50 origin-left"
                            style={{
                                transform: `translate(-50%, -50%) rotate(${rotation}deg)`
                            }}
                        />
                    );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-cyan-400" />
                </div>
            </div>

            <div className="text-center">
                <p className="text-4xl font-black text-cyan-400 mb-1">{position.toFixed(1)}%</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${position}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                    />
                </div>
            </div>
        </GlassCard>
    );
};

// ===== BULB-SPECIFIC PANEL =====

interface BulbSpecificPanelProps {
    submersionDepth: number;
    sealPressure: number;
}

const BulbSpecificPanel: React.FC<BulbSpecificPanelProps> = ({ submersionDepth, sealPressure }) => {
    const sealCritical = sealPressure < 1.5;

    return (
        <GlassCard className="border-l-4 border-l-blue-500">
            <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Bulb Configuration - Capsule Monitoring
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-slate-400 mb-2">Generator Submersion Depth</p>
                    <p className="text-3xl font-black text-white">{submersionDepth.toFixed(1)} <span className="text-lg text-slate-500">m</span></p>
                </div>

                <div className={`p-4 rounded-lg border ${sealCritical ? 'bg-red-950/20 border-red-500/30' : 'bg-emerald-950/20 border-emerald-500/20'
                    }`}>
                    <p className="text-xs text-slate-400 mb-2">Seal Water Pressure</p>
                    <p className={`text-3xl font-black ${sealCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                        {sealPressure.toFixed(1)} <span className="text-lg text-slate-500">bar</span>
                    </p>
                    {sealCritical && (
                        <p className="text-[10px] text-red-400 font-bold mt-2">⚠️ Risk of water ingress</p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

// ===== HYDRAULIC RUNAWAY MONITOR (Horizontal Kaplan) =====

interface HydraulicRunawayMonitorProps {
    servoPressure: number;
    hoseTension: number;
    pipeDiameter: number;
}

const HydraulicRunawayMonitor: React.FC<HydraulicRunawayMonitorProps> = ({
    servoPressure,
    hoseTension,
    pipeDiameter
}) => {
    const pressureHigh = servoPressure > 55;
    const tensionHigh = hoseTension > 300;
    const pipeChanged = pipeDiameter !== 12; // Expected original diameter

    const riskLevel = pressureHigh && tensionHigh ? 'CRITICAL' : (pressureHigh || tensionHigh) ? 'HIGH' : 'OK';

    return (
        <GlassCard className={`border-l-4 ${riskLevel === 'CRITICAL' ? 'border-l-red-500 animate-pulse' :
                riskLevel === 'HIGH' ? 'border-l-amber-500' :
                    'border-l-emerald-500'
            }`}>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Waves className="w-5 h-5" />
                Hydraulic Runaway Protection
                {pipeChanged && <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />}
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`p-3 rounded-lg ${pressureHigh ? 'bg-red-950/30 border-2 border-red-500' : 'bg-slate-800/30'}`}>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Servo Pressure</p>
                    <p className={`text-2xl font-black ${pressureHigh ? 'text-red-400' : 'text-white'}`}>
                        {servoPressure.toFixed(1)} <span className="text-sm">bar</span>
                    </p>
                </div>

                <div className={`p-3 rounded-lg ${tensionHigh ? 'bg-amber-950/30 border-2 border-amber-500' : 'bg-slate-800/30'}`}>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Hose Tension</p>
                    <p className={`text-2xl font-black ${tensionHigh ? 'text-amber-400' : 'text-white'}`}>
                        {hoseTension.toFixed(0)} <span className="text-sm">kN</span>
                    </p>
                </div>

                <div className={`p-3 rounded-lg ${pipeChanged ? 'bg-amber-950/30 border-2 border-amber-500 animate-pulse' : 'bg-slate-800/30'}`}>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Pipe Diameter</p>
                    <p className={`text-2xl font-black ${pipeChanged ? 'text-amber-400' : 'text-white'}`}>
                        {pipeDiameter} <span className="text-sm">mm</span>
                    </p>
                </div>
            </div>

            {(riskLevel === 'CRITICAL' || riskLevel === 'HIGH' || pipeChanged) && (
                <div className={`p-3 rounded-lg border ${riskLevel === 'CRITICAL' ? 'bg-red-950/30 border-red-500/50' : 'bg-amber-950/30 border-amber-500/50'
                    }`}>
                    <p className="text-xs font-bold text-white mb-2">
                        {riskLevel === 'CRITICAL' && '🔴 CRITICAL: '}
                        {pipeChanged ? 'PATTERN MATCH: 2024-KM-HC-001 Incident!' : 'Hydraulic System Under Stress'}
                    </p>
                    <p className="text-[10px] text-slate-300">
                        {pipeChanged
                            ? 'Pipe diameter change detected (12mm → 16mm). This matches historical runaway incident. Reduce pressure by 10% immediately!'
                            : 'Monitor pressure rate closely. Check for oil leaks or air in system.'
                        }
                    </p>
                </div>
            )}
        </GlassCard>
    );
};

// ===== SERVO SYSTEM PANEL =====

interface ServoSystemPanelProps {
    pressure: number;
    variant: string;
}

const ServoSystemPanel: React.FC<ServoSystemPanelProps> = ({ pressure, variant }) => {
    return (
        <GlassCard className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    Servo Oil System
                </h3>
                <span className="text-xs text-slate-500">{variant.replace('kaplan_', '').toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-purple-400">{pressure.toFixed(1)}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Pressure (bar)</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-emerald-400">46</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Viscosity (cSt)</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-cyan-400">42</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Temp (°C)</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                    <p className="text-2xl font-black text-white">125</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Flow (l/min)</p>
                </div>
            </div>
        </GlassCard>
    );
};
