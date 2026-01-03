// Alignment Wizard - Real-time Runout Diagram
// Interactive tool for 0.05 mm/m shaft centering

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Bluetooth, Target, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { CommissioningService } from '../services/CommissioningService';
import { useProjectEngine } from '../contexts/ProjectContext';

interface AlignmentWizardProps {
    sessionId: string;
    onComplete: () => void;
}

export const AlignmentWizard: React.FC<AlignmentWizardProps> = ({ sessionId, onComplete }) => {
    const { technicalState } = useProjectEngine(); // Linked to CEREBRO
    const [runoutPoints, setRunoutPoints] = useState<Array<{ angle: number; runout: number }>>([]);
    const [currentAngle, setCurrentAngle] = useState(0);
    const [manualRunout, setManualRunout] = useState('');
    const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
    const [finalAlignment, setFinalAlignment] = useState<number | null>(null);
    const [shaftSag, setShaftSag] = useState(0);

    const isHorizontal = technicalState.identity.name.toLowerCase().includes('horizontal') || technicalState.identity.type === 'Pelton';
    const bearingSpan = 5.0; // Default or from project site params

    const addRunoutPoint = async () => {
        const runout = parseFloat(manualRunout);
        if (isNaN(runout)) return;

        await CommissioningService.recordAlignmentPoint(
            sessionId,
            currentAngle,
            runout,
            isHorizontal
        );

        setRunoutPoints(prev => [...prev, { angle: currentAngle, runout }]);
        setManualRunout('');

        // Auto-increment angle
        setCurrentAngle(prev => (prev + 45) % 360);
    };

    const finalizeAlignment = async () => {
        const result = await CommissioningService.finalizeAlignment(sessionId, bearingSpan);
        setFinalAlignment(result.finalAlignment);
        setShaftSag(result.shaftSag);

        if (result.meetsStandard) {
            onComplete();
        }
    };

    const connectBluetooth = async () => {
        // Mock Bluetooth connection
        setIsBluetoothConnected(true);
        alert('Bluetooth dial indicator connected! (Mock)');
    };

    return (
        <GlassCard>
            <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">0.05 mm Alignment</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                        Wizard
                    </span>
                </h3>
                <p className="text-sm text-slate-400">
                    Rotate rotor manually and record runout at each position
                </p>
                {isHorizontal && (
                    <div className="mt-2 px-3 py-2 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <p className="text-xs text-amber-300">
                            Horizontal machine detected - Shaft sag will be auto-compensated
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Runout Diagram */}
                <div>
                    <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-400 uppercase font-bold">Runout Points Recorded</p>
                            <p className="text-sm font-black text-cyan-400">{runoutPoints.length}/8</p>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(runoutPoints.length / 8) * 100}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            />
                        </div>
                    </div>

                    {/* Polar Diagram */}
                    <RunoutDiagram points={runoutPoints} shaftSag={shaftSag} isHorizontal={isHorizontal} />

                    {/* Final Results */}
                    {finalAlignment !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mt-4 p-4 rounded-lg border-2 ${finalAlignment <= 0.05
                                ? 'bg-emerald-950/20 border-emerald-500'
                                : 'bg-red-950/20 border-red-500'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-white">Final Alignment</p>
                                {finalAlignment <= 0.05 ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-400" />
                                )}
                            </div>
                            <p className="text-3xl font-black text-white mb-1">
                                {finalAlignment.toFixed(3)} mm/m
                            </p>
                            <p className={`text-xs font-bold ${finalAlignment <= 0.05 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                Standard: 0.05 mm/m {finalAlignment <= 0.05 ? '✓ PASS' : '✗ FAIL'}
                            </p>
                            {isHorizontal && (
                                <p className="text-xs text-slate-400 mt-2">
                                    Shaft sag compensated: {shaftSag.toFixed(3)} mm
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Right: Input Controls */}
                <div className="space-y-4">
                    {/* Bluetooth Connection */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Bluetooth className={`w-5 h-5 ${isBluetoothConnected ? 'text-cyan-400' : 'text-slate-500'}`} />
                                <p className="text-sm font-bold text-white">Bluetooth Dial Indicator</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${isBluetoothConnected
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-slate-700/50 text-slate-400'
                                }`}>
                                {isBluetoothConnected ? 'CONNECTED' : 'DISCONNECTED'}
                            </div>
                        </div>
                        {!isBluetoothConnected && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={connectBluetooth}
                                className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-colors"
                            >
                                Connect Bluetooth Device
                            </motion.button>
                        )}
                    </div>

                    {/* Manual Input */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <p className="text-sm font-bold text-white mb-3">Manual Measurement Entry</p>

                        <div className="mb-3">
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                                Rotation Angle
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={currentAngle}
                                    onChange={(e) => setCurrentAngle(parseInt(e.target.value) || 0)}
                                    min="0"
                                    max="360"
                                    step="45"
                                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                />
                                <span className="text-sm text-slate-400 font-bold">°</span>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-1">
                                {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                                    <button
                                        key={angle}
                                        onClick={() => setCurrentAngle(angle)}
                                        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${currentAngle === angle
                                            ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500'
                                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {angle}°
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                                Runout Reading (mm)
                            </label>
                            <input
                                type="number"
                                value={manualRunout}
                                onChange={(e) => setManualRunout(e.target.value)}
                                step="0.001"
                                placeholder="0.045"
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={addRunoutPoint}
                            disabled={!manualRunout}
                            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                        >
                            <Target className="w-5 h-5" />
                            Record Point
                        </motion.button>
                    </div>

                    {/* Recorded Points List */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <p className="text-sm font-bold text-white mb-3">Recorded Points</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {runoutPoints.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-4">No points recorded yet</p>
                            ) : (
                                runoutPoints.map((point, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                                        <span className="text-xs text-slate-400">
                                            <RotateCw className="w-3 h-3 inline mr-1" />
                                            {point.angle}°
                                        </span>
                                        <span className="text-xs font-bold text-white">{point.runout.toFixed(3)} mm</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Finalize Button */}
                    {runoutPoints.length >= 4 && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={finalizeAlignment}
                            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg font-black uppercase text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Calculate Alignment
                        </motion.button>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

// ===== RUNOUT POLAR DIAGRAM =====

const RunoutDiagram: React.FC<{
    points: Array<{ angle: number; runout: number }>;
    shaftSag: number;
    isHorizontal: boolean;
}> = ({ points, shaftSag, isHorizontal }) => {
    const centerX = 200;
    const centerY = 200;
    const radius = 150;

    // Find max runout for scaling
    const maxRunout = points.length > 0 ? Math.max(...points.map(p => p.runout)) : 0.1;

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase font-bold mb-3 text-center">Runout Polar Diagram</p>
            <svg width="400" height="400" viewBox="0 0 400 400" className="mx-auto">
                {/* Circles (reference grid) */}
                {[0.25, 0.5, 0.75, 1.0].map((factor, i) => (
                    <circle
                        key={i}
                        cx={centerX}
                        cy={centerY}
                        r={radius * factor}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                    />
                ))}

                {/* Angle lines */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                    const rad = (angle * Math.PI) / 180;
                    const x = centerX + Math.cos(rad - Math.PI / 2) * radius;
                    const y = centerY + Math.sin(rad - Math.PI / 2) * radius;

                    return (
                        <g key={angle}>
                            <line
                                x1={centerX}
                                y1={centerY}
                                x2={x}
                                y2={y}
                                stroke="#475569"
                                strokeWidth="1"
                            />
                            <text
                                x={centerX + Math.cos(rad - Math.PI / 2) * (radius + 20)}
                                y={centerY + Math.sin(rad - Math.PI / 2) * (radius + 20)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#94a3b8"
                                fontSize="12"
                                fontWeight="bold"
                            >
                                {angle}°
                            </text>
                        </g>
                    );
                })}

                {/* Runout path */}
                {points.length > 1 && (
                    <path
                        d={points.map((point, i) => {
                            const rad = (point.angle * Math.PI) / 180;
                            const r = (point.runout / maxRunout) * radius;
                            const x = centerX + Math.cos(rad - Math.PI / 2) * r;
                            const y = centerY + Math.sin(rad - Math.PI / 2) * r;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ') + ' Z'}
                        fill="rgba(6, 182, 212, 0.1)"
                        stroke="#06b6d4"
                        strokeWidth="2"
                    />
                )}

                {/* Runout points */}
                {points.map((point, i) => {
                    const rad = (point.angle * Math.PI) / 180;
                    const r = (point.runout / maxRunout) * radius;
                    const x = centerX + Math.cos(rad - Math.PI / 2) * r;
                    const y = centerY + Math.sin(rad - Math.PI / 2) * r;

                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#06b6d4"
                            stroke="#0e7490"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Center point */}
                <circle cx={centerX} cy={centerY} r="4" fill="#f59e0b" />

                {/* Shaft sag indicator (for horizontal machines) */}
                {isHorizontal && shaftSag > 0 && (
                    <g>
                        <line
                            x1={centerX}
                            y1={centerY}
                            x2={centerX}
                            y2={centerY + (shaftSag / maxRunout) * radius}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                        <text
                            x={centerX + 10}
                            y={centerY + (shaftSag / maxRunout) * radius / 2}
                            fill="#f59e0b"
                            fontSize="10"
                            fontWeight="bold"
                        >
                            Sag: {shaftSag.toFixed(3)}mm
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
};
