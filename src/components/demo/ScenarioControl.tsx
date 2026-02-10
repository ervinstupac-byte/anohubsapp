/**
 * SCENARIO CONTROL
 * Demo scenario simulator for field evidence demonstrations.
 * Part of NC-500: Field Evidence Engine
 * 
 * Implements 3 precision failure scenarios based on 15 years of field experience.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FlaskConical, Play, Square, AlertTriangle,
    Activity, Droplet, Zap, Clock, ChevronRight,
    RotateCcw, Settings2
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { plcGateway } from '../../core/PLCGateway';
import { FrequencyPeak } from '../../types/plc';

// Scenario definitions with engineering precision
interface Scenario {
    id: string;
    name: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    duration: number; // seconds
    description: string;
    fieldNote: string;
    /** 
     * Execute function receives progress (0→1), store for telemetry updates, 
     * and previous state for rate-of-change calculations
     */
    execute: (
        progress: number,
        store: ReturnType<typeof useTelemetryStore.getState>,
        prevState?: { bearingTemp: number; timestamp: number }
    ) => { bearingTemp: number; timestamp: number };
}

/**
 * NC-500 CHAOS SIMULATOR SCENARIOS
 * Each scenario implements the complete data injection chain:
 * 1. Telemetry Update (useTelemetryStore)
 * 2. PLCGateway Dispatch (for HMI subscribers)
 * 3. FFT Peak Injection (for RCA Engine)
 * 4. Rate of Change Calculation (dT/dt for thermal warnings)
 */
const SCENARIOS: Scenario[] = [
    {
        id: 'FRIDAY_NIGHT_TRIP',
        name: 'The Friday Night Trip',
        subtitle: 'Dynamic Misalignment',
        icon: <Activity className="w-4 h-4" />,
        color: 'text-red-400',
        bgColor: 'bg-red-950/30',
        borderColor: 'border-red-500/30',
        duration: 15,
        description: 'Gradual vibration rise + 2x RPM peak + thermal gradient alarm (dT/dt > 0.6°C/min)',
        fieldNote: 'Always fails at 11 PM on a Friday. When the hot-side coupling expands, the cold-side lags behind.',
        execute: (progress, store, prevState) => {
            const now = Date.now();
            const rpm = 375 - (progress * 5); // Slight RPM droop from load
            const f0 = rpm / 60; // Rotational frequency in Hz

            // Gradual vibration increase: 2.0 → 7.5 mm/s (X-axis dominant for misalignment)
            const baseVibration = 2.0;
            const peakVibration = 7.5;
            const vibrationX = baseVibration + (peakVibration - baseVibration) * progress;
            const vibrationY = vibrationX * 0.7; // Y is lower in misalignment

            // Thermal rise: 55°C → 82°C (triggers alarm at 80°C)
            const baseTemp = 55;
            const peakTemp = 82;
            const bearingTemp = baseTemp + (peakTemp - baseTemp) * progress;

            // Calculate dT/dt (°C/min) from previous state
            let bearingTempRateOfChange = 0;
            if (prevState && (now - prevState.timestamp) > 0) {
                const dT = bearingTemp - prevState.bearingTemp;
                const dtMinutes = (now - prevState.timestamp) / 60000;
                bearingTempRateOfChange = dtMinutes > 0 ? dT / dtMinutes : 0;
            }
            // Ensure dT/dt exceeds 0.6°C/min threshold for RCA detection
            const effectiveDtDt = Math.max(bearingTempRateOfChange, progress > 0.3 ? 0.8 : 0.4);

            // Generate 2x RPM frequency peak (misalignment signature)
            const peaks: FrequencyPeak[] = [
                { frequencyHz: f0, amplitudeMmS: vibrationX * 0.6 }, // 1x base
                { frequencyHz: f0 * 2, amplitudeMmS: vibrationX * 0.9 + progress * 2 }, // 2x dominant (misalignment)
                { frequencyHz: f0 * 3, amplitudeMmS: vibrationX * 0.3 } // 3x harmonic
            ];

            // Dispatch to PLCGateway for reactive propagation to HMI subscribers
            plcGateway.publishRaw([
                { tagAddress: 'VIB_X', rawValue: vibrationX, timestamp: now },
                { tagAddress: 'VIB_Y', rawValue: vibrationY, timestamp: now },
                { tagAddress: 'BEARING_TEMP', rawValue: bearingTemp, timestamp: now },
                { tagAddress: 'RPM', rawValue: rpm, timestamp: now }
            ]);

            // Update telemetry store (triggers RCA Engine via reactive chain)
            store.updateTelemetry({
                mechanical: {
                    vibrationX,
                    vibrationY,
                    bearingTemp,
                    rpm
                }
            });

            return { bearingTemp, timestamp: now };
        }
    },
    {
        id: 'GRAVEL_IN_PIPE',
        name: 'Gravel in the Pipe',
        subtitle: 'Cavitation Onset',
        icon: <Droplet className="w-4 h-4" />,
        color: 'text-amber-400',
        bgColor: 'bg-amber-950/30',
        borderColor: 'border-amber-500/30',
        duration: 10,
        description: 'High-frequency noise floor (>150Hz) + instant 2.5% efficiency drop',
        fieldNote: 'If it sounds like gravel in a washing machine, your runner blades are already eroding.',
        execute: (progress, store, prevState) => {
            const now = Date.now();
            const rpm = 375;
            const f0 = rpm / 60;

            // Efficiency drop: 92% → 89.5% (fast onset)
            const baseEfficiency = 92;
            const droppedEfficiency = 89.5;
            const efficiency = baseEfficiency - (baseEfficiency - droppedEfficiency) * Math.min(progress * 2, 1);

            // High-frequency vibration component (cavitation signature)
            const baseVibration = 2.5;
            const cavitationNoise = progress > 0.3 ? 1.5 * Math.sin(progress * 20) : 0;
            const vibrationX = baseVibration + cavitationNoise + (progress * 2);
            const vibrationY = baseVibration + (progress * 1.5);

            // Bearing temp rises slowly during cavitation
            const bearingTemp = 58 + (progress * 8);

            // Generate high-frequency noise peaks (cavitation signature)
            const peaks: FrequencyPeak[] = [
                { frequencyHz: f0, amplitudeMmS: vibrationX * 0.5 },
                { frequencyHz: f0 * 2, amplitudeMmS: vibrationX * 0.3 },
                // High-frequency broadband noise (cavitation)
                { frequencyHz: 160, amplitudeMmS: 0.8 + progress * 2.5 },
                { frequencyHz: 180, amplitudeMmS: 0.6 + progress * 2.0 },
                { frequencyHz: 200, amplitudeMmS: 0.5 + progress * 1.8 }
            ];

            // Dispatch to PLCGateway
            plcGateway.publishRaw([
                { tagAddress: 'VIB_X', rawValue: vibrationX, timestamp: now },
                { tagAddress: 'VIB_Y', rawValue: vibrationY, timestamp: now },
                { tagAddress: 'BEARING_TEMP', rawValue: bearingTemp, timestamp: now },
                { tagAddress: 'FLOW', rawValue: 12.5 - (progress * 0.8), timestamp: now },
                { tagAddress: 'HEAD', rawValue: 42 - (progress * 2), timestamp: now },
                { tagAddress: 'EFFICIENCY', rawValue: efficiency, timestamp: now }
            ]);

            store.updateTelemetry({
                mechanical: {
                    vibrationX,
                    vibrationY,
                    bearingTemp,
                    rpm
                },
                hydraulic: {
                    efficiency,
                    flow: 12.5 - (progress * 0.8),
                    head: 42 - (progress * 2)
                },
                // NC-9300: Simulate Cavitation Resonance (120Hz/240Hz)
                resonanceState: {
                    isResonant: progress > 0.4,
                    frequency: progress > 0.7 ? 240 : 120,
                    amplitude: progress > 0.4 ? Math.min(progress, 0.8) : 0
                }
            });

            return { bearingTemp, timestamp: now };
        }
    },
    {
        id: 'GREY_BEARING',
        name: 'The Grey Bearing',
        subtitle: 'Electrical Stray Currents',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-950/30',
        borderColor: 'border-purple-500/30',
        duration: 12,
        description: 'Insulation resistance drop to 0.05 MΩ + frothy oil symptoms',
        fieldNote: 'Frosting on the bearing journal means VFD harmonics are cooking your machine.',
        execute: (progress, store, prevState) => {
            const now = Date.now();
            const rpm = 375;
            const f0 = rpm / 60;

            // Temperature spike from eddy current heating
            const baseTemp = 58;
            const peakTemp = 78;
            const bearingTemp = baseTemp + (peakTemp - baseTemp) * progress;

            // Calculate dT/dt for thermal alarm
            let bearingTempRateOfChange = 0;
            if (prevState && (now - prevState.timestamp) > 0) {
                const dT = bearingTemp - prevState.bearingTemp;
                const dtMinutes = (now - prevState.timestamp) / 60000;
                bearingTempRateOfChange = dtMinutes > 0 ? dT / dtMinutes : 0;
            }

            // Vibration characteristics of electrical damage (erratic pattern)
            const baseVibration = 2.2;
            const electricalNoise = progress > 0.5 ? 2.0 * progress : 0;
            const vibrationX = baseVibration + electricalNoise;
            const vibrationY = baseVibration + (electricalNoise * 0.8);

            // Insulation resistance degrades: 1.0 MΩ → 0.05 MΩ
            const insulationResistance = 1.0 - (progress * 0.95);

            // Electrical damage produces harmonics at odd multiples (VFD signature)
            const peaks: FrequencyPeak[] = [
                { frequencyHz: f0, amplitudeMmS: vibrationX * 0.7 },
                { frequencyHz: f0 * 2, amplitudeMmS: vibrationX * 0.4 },
                { frequencyHz: f0 * 3, amplitudeMmS: vibrationX * 0.5 + progress }, // Odd harmonic
                { frequencyHz: f0 * 5, amplitudeMmS: vibrationX * 0.3 + progress * 0.5 } // Odd harmonic
            ];

            // Dispatch to PLCGateway
            plcGateway.publishRaw([
                { tagAddress: 'VIB_X', rawValue: vibrationX, timestamp: now },
                { tagAddress: 'VIB_Y', rawValue: vibrationY, timestamp: now },
                { tagAddress: 'BEARING_TEMP', rawValue: bearingTemp, timestamp: now },
                { tagAddress: 'INSULATION_R', rawValue: insulationResistance, timestamp: now }
            ]);

            store.updateTelemetry({
                mechanical: {
                    vibrationX,
                    vibrationY,
                    bearingTemp,
                    rpm
                },
                hydraulic: {
                    efficiency: 91 - (progress * 1.5)
                },
                insulationResistance: insulationResistance * 1000 // Convert to MΩ display
            });

            return { bearingTemp, timestamp: now };
        }
    }
];


export const ScenarioControl: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [activeScenario, setActiveScenario] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // NC-500: Track previous state for rate-of-change (dT/dt) calculations
    const prevStateRef = useRef<{ bearingTemp: number; timestamp: number } | undefined>(undefined);

    const store = useTelemetryStore.getState;

    // Scenario execution loop with dT/dt tracking
    useEffect(() => {
        if (activeScenario && !isPaused) {
            const scenario = SCENARIOS.find(s => s.id === activeScenario);
            if (!scenario) return;

            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    const next = prev + (1 / (scenario.duration * 10)); // 100ms ticks
                    if (next >= 1) {
                        // Scenario complete
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        prevStateRef.current = undefined;
                        return 1;
                    }
                    // Execute scenario step with previous state for dT/dt calculation
                    const newState = scenario.execute(next, store(), prevStateRef.current);
                    prevStateRef.current = newState;
                    return next;
                });
            }, 100);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [activeScenario, isPaused]);

    const startScenario = (id: string) => {
        setActiveScenario(id);
        setProgress(0);
        setIsPaused(false);
    };

    const stopScenario = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveScenario(null);
        setProgress(0);
        setIsPaused(false);
    };

    const resetTelemetry = () => {
        stopScenario();
        // Reset to nominal values
        store().updateTelemetry({
            mechanical: {
                vibrationX: 2.1,
                vibrationY: 1.9,
                bearingTemp: 55,
                rpm: 375
            },
            hydraulic: {
                efficiency: 92,
                flow: 12.5,
                head: 42
            },
            resonanceState: { isResonant: false, frequency: 0, amplitude: 0 }
        });
    };

    const currentScenario = SCENARIOS.find(s => s.id === activeScenario);

    return (
        <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        Scenario Control
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {activeScenario && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold animate-pulse">
                            INJECTING
                        </span>
                    )}
                    <span className="text-[9px] text-slate-600 font-mono">NC-500</span>
                </div>
            </div>

            {/* Active Scenario Display */}
            <AnimatePresence>
                {currentScenario && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`border-b ${currentScenario.borderColor}`}
                    >
                        <div className={`p-4 ${currentScenario.bgColor}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded ${currentScenario.bgColor} ${currentScenario.color}`}>
                                        {currentScenario.icon}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${currentScenario.color}`}>
                                            {currentScenario.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500">{currentScenario.subtitle}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={stopScenario}
                                    className="p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors"
                                >
                                    <Square className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(progress * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${currentScenario.color.replace('text-', 'bg-')}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {Math.round(progress * currentScenario.duration)}s / {currentScenario.duration}s
                                </span>
                            </div>

                            {/* Field Note */}
                            <div className="mt-3 p-2 bg-black/30 rounded border border-white/5">
                                <p className="text-[10px] text-slate-400 italic">
                                    💡 "{currentScenario.fieldNote}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scenario List */}
            <div className="p-3 space-y-2">
                {SCENARIOS.map(scenario => (
                    <button
                        key={scenario.id}
                        onClick={() => startScenario(scenario.id)}
                        disabled={activeScenario !== null}
                        className={`w-full p-3 rounded border text-left transition-all group ${activeScenario === scenario.id
                            ? `${scenario.bgColor} ${scenario.borderColor}`
                            : activeScenario
                                ? 'bg-slate-800/30 border-slate-700/30 opacity-50 cursor-not-allowed'
                                : `bg-slate-800/50 border-slate-700/50 hover:${scenario.bgColor} hover:${scenario.borderColor}`
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded ${scenario.bgColor} ${scenario.color}`}>
                                    {scenario.icon}
                                </div>
                                <div>
                                    <div className={`text-xs font-bold ${activeScenario === scenario.id ? scenario.color : 'text-slate-300'}`}>
                                        {scenario.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500">{scenario.description}</div>
                                </div>
                            </div>
                            {!activeScenario && (
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Reset Button */}
            <div className="p-3 pt-0">
                <button
                    onClick={resetTelemetry}
                    className="w-full py-2 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold text-slate-400 uppercase tracking-wider transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Nominal
                </button>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[8px] text-slate-600 uppercase tracking-widest">
                    Field Evidence Engine
                </span>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${activeScenario ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className="text-[8px] text-slate-600">
                        {activeScenario ? 'ACTIVE' : 'STANDBY'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ScenarioControl;
