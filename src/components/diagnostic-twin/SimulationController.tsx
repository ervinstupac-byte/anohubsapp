import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCerebro } from '../../contexts/ProjectContext';
import { DemoScenario, DEFAULT_TECHNICAL_STATE } from '../../core/TechnicalSchema';
import { Activity, ShieldAlert, Zap, Droplets, RotateCcw, Play, Pause, ChevronRight } from 'lucide-react';

/**
 * SimulationController (Tactical Command v4.6)
 * 
 * Handles the interpolation of technicalState values for demo scenarios.
 */
export const SimulationController: React.FC = () => {
    const { state: techState, dispatch } = useCerebro();
    const [isOpen, setIsOpen] = useState(false);
    const [isInterpolating, setIsInterpolating] = useState(false);
    const interpolationRef = useRef<NodeJS.Timeout | null>(null);

    const scenarios: { id: DemoScenario; label: string; icon: any; color: string }[] = [
        { id: 'NORMAL', label: 'Normal Ops', icon: Activity, color: 'cyan' },
        { id: 'WATER_HAMMER', label: 'Water Hammer', icon: ShieldAlert, color: 'red' },
        { id: 'BEARING_FAILURE', label: 'Bearing Failure', icon: Droplets, color: 'orange' },
        { id: 'CAVITATION', label: 'Cavitation', icon: Zap, color: 'yellow' },
        { id: 'GRID_LOSS', label: 'Grid Loss', icon: Activity, color: 'purple' },
        { id: 'INFRASTRUCTURE_STRESS', label: 'Infra Stress', icon: ShieldAlert, color: 'orange' },
    ];

    const runScenario = (type: DemoScenario) => {
        if (interpolationRef.current) clearInterval(interpolationRef.current);
        setIsInterpolating(true);
        dispatch({ type: 'START_SCENARIO', payload: type });

        const duration = 2500; // 2.5 seconds
        const steps = 50;
        const interval = duration / steps;
        let currentStep = 0;

        // Target Values Definition
        const targets: any = {
            'NORMAL': {
                'physics.surgePressureBar': 55,
                'hydraulic.efficiency': 0.92,
                'hydraulic.flow': 42.5,
                'hydraulic.head': 152.0,
                'mechanical.vibration': 0.012
            },
            'WATER_HAMMER': {
                'physics.surgePressureBar': 145,
                'physics.waterHammerPressureBar': 85,
                'hydraulic.flow': 12.5 // Stoppage
            },
            'BEARING_FAILURE': {
                'physics.eccentricity': 0.85,
                'mechanical.vibrationX': 0.08,
                'mechanical.vibration': 5.5
            },
            'CAVITATION': {
                'hydraulic.efficiency': 0.85,
                'hydraulic.flow': 68.5, // High flow
                'hydraulic.head': 145.0,
                'mechanical.vibration': 0.095,
                'mechanical.acousticNoiseFloor': 120
            },
            'GRID_LOSS': {
                'mechanical.rpm': 625 // +25% spike
            },
            'INFRASTRUCTURE_STRESS': {
                'mechanical.bearingTemp': 82, // Exceeds thermal inertia & static limit
                'physics.eccentricity': 0.75, // Magnetic unbalance trigger
                'identity.startStopCount': 1056 // High cycle count for grease risk
            }
        };

        const target = targets[type];
        if (!target) {
            setIsInterpolating(false);
            return;
        }

        // Capture Start Values
        const startValues: any = {};
        Object.keys(target).forEach(key => {
            const parts = key.split('.');
            startValues[key] = (techState as any)[parts[0]][parts[1]];
        });

        interpolationRef.current = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            const nextPayload: any = {};
            Object.keys(target).forEach(key => {
                const parts = key.split('.');
                const start = startValues[key];
                const end = target[key];
                const current = start + (end - start) * progress;

                if (!nextPayload[parts[0]]) nextPayload[parts[0]] = { ...(techState as any)[parts[0]] };
                nextPayload[parts[0]][parts[1]] = current;
            });

            dispatch({ type: 'UPDATE_SIMULATION', payload: nextPayload });

            if (currentStep >= steps) {
                if (interpolationRef.current) clearInterval(interpolationRef.current);
                setIsInterpolating(false);
            }
        }, interval);
    };

    return (
        <div className="fixed bottom-8 right-8 z-30">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-80 mb-4"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Tactical Command</h3>
                            <div className="flex gap-2">
                                <div className={`w-2 h-2 rounded-full ${techState.demoMode.active ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {scenarios.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => runScenario(s.id)}
                                    disabled={isInterpolating}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${techState.demoMode.scenario === s.id
                                        ? `bg-${s.color}-500/20 border-${s.color}-500/40 text-${s.color}-400`
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <s.icon className={`w-4 h-4 ${techState.demoMode.scenario === s.id ? `text-${s.color}-400` : 'text-slate-500'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
                                    </div>
                                    {techState.demoMode.scenario === s.id && <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                                </button>
                            ))}
                        </div>

                        {isInterpolating && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-[8px] font-mono text-cyan-400 mb-1">
                                    <span>INTERPOLATING_STATE...</span>
                                    <span>{((techState.physics.surgePressureBar / 145) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-cyan-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2.5, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-cyan-500 text-black hover:scale-110 active:scale-95'
                    }`}
            >
                {isOpen ? <ChevronRight className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
        </div>
    );
};
