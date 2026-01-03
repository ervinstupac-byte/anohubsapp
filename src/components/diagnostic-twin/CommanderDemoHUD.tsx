import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCerebro } from '../../contexts/ProjectContext';
import { DemoScenario, DEFAULT_TECHNICAL_STATE } from '../../models/TechnicalSchema';
import {
    Activity,
    Droplets,
    Thermometer,
    Zap,
    TrendingDown,
    Play,
    Square,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// TACTICAL SCENARIOS CONFIGURATION
const SCENARIOS = [
    {
        id: 'NORMAL' as DemoScenario,
        icon: Activity,
        color: 'cyan',
        label: 'Normal Operations',
        description: 'Stabilized nominal flow & 92% efficiency'
    },
    {
        id: 'SURGE' as DemoScenario,
        icon: Droplets,
        color: 'red',
        label: 'Penstock Surge',
        description: 'Joukowsky Spike (150% Nominal Pressure)'
    },
    {
        id: 'THERMAL' as DemoScenario,
        icon: Thermometer,
        color: 'orange',
        label: 'Thermal Instability',
        description: 'Vibration creep & Orbit deformation'
    },
    {
        id: 'CAVITATION' as DemoScenario,
        icon: Zap,
        color: 'purple',
        label: 'Cavitation Event',
        description: 'Acoustic Floor Shift & Erosion risk'
    },
    {
        id: 'LEAK' as DemoScenario,
        icon: TrendingDown,
        color: 'yellow',
        label: 'Efficiency Leak',
        description: 'Wicket Gate wear & 4% drop'
    },
];

export const CommanderDemoHUD: React.FC = () => {
    const { t } = useTranslation();
    const { state, dispatch } = useCerebro();
    const [isExpanded, setIsExpanded] = useState(false);

    // SMOTTH INTERPOLATION LOGIC
    const triggerScenario = (scenario: DemoScenario) => {
        // First, set the demo state
        dispatch({
            type: 'SET_DEMO_MODE',
            payload: { active: true, scenario }
        });

        // The actual numerical transitions happen here in the HUD component 
        // acting as a virtual PLC/Governor for the demo.
        let targetValues: any = {};

        switch (scenario) {
            case 'NORMAL':
                targetValues = {
                    hydraulic: { flow: 2.5, head: 450, efficiency: 0.92 },
                    mechanical: { vibrationX: 0.012, vibrationY: 0.008, bearingTemp: 42 }
                };
                break;
            case 'SURGE':
                targetValues = {
                    hydraulic: { flow: 3.8, head: 675 }, // 150% Surge
                    mechanical: { vibrationX: 0.045, vibrationY: 0.042 }
                };
                break;
            case 'THERMAL':
                targetValues = {
                    mechanical: {
                        vibrationX: 0.12, // Banana shape 
                        vibrationY: 0.04,
                        bearingTemp: 78
                    }
                };
                break;
            case 'CAVITATION':
                targetValues = {
                    hydraulic: { efficiency: 0.84 },
                };
                // Separate dispatch for acoustic floor since it is a different case in reducer
                dispatch({
                    type: 'UPDATE_ACOUSTIC_DATA',
                    payload: { cavitationIntensity: 8.5, bearingGrindIndex: 4.2 }
                });
                break;
            case 'LEAK':
                targetValues = {
                    hydraulic: { efficiency: 0.88 },
                    mechanical: { rpm: 495 }
                };
                break;
        }

        // Apply with a slight delay or just immediate - for DEMO we want impact
        if (targetValues.hydraulic) dispatch({ type: 'UPDATE_HYDRAULIC', payload: targetValues.hydraulic });
        if (targetValues.mechanical) dispatch({ type: 'UPDATE_MECHANICAL', payload: targetValues.mechanical });
    };

    const stopDemo = () => {
        dispatch({
            type: 'SET_DEMO_MODE',
            payload: { active: false, scenario: null }
        });
        // Reset to nominal values
        dispatch({ type: 'UPDATE_HYDRAULIC', payload: DEFAULT_TECHNICAL_STATE.hydraulic });
        dispatch({ type: 'UPDATE_MECHANICAL', payload: DEFAULT_TECHNICAL_STATE.mechanical });
        dispatch({ type: 'UPDATE_ACOUSTIC_DATA', payload: { cavitationIntensity: 0.5, bearingGrindIndex: 0.2 } });
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4 pointer-events-none">
            <motion.div
                layout
                className="pointer-events-auto overflow-hidden bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 px-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${state.demoMode.active ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]'}`} />
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {state.demoMode.active ? 'FORENSIC DEMO ACTIVE' : 'LIVE TELEMETRY MODE'}
                            </h3>
                            <p className="text-[9px] font-mono text-white/40">
                                {state.demoMode.scenario ? `TACTICAL_SCENARIO: ${state.demoMode.scenario}` : 'CC-STANDARD INTEGRITY: 100%'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {state.demoMode.active && (
                            <button
                                onClick={stopDemo}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 flex items-center gap-2 group"
                            >
                                <Square className="w-4 h-4 fill-current group-active:scale-90" />
                                <span className="text-[10px] font-black uppercase tracking-widest">STOP SIM</span>
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5 active:scale-95"
                        >
                            <Play className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4">
                                {SCENARIOS.map((scenario) => {
                                    const Icon = scenario.icon;
                                    const isActive = state.demoMode.scenario === scenario.id;

                                    return (
                                        <button
                                            key={scenario.id}
                                            onClick={() => triggerScenario(scenario.id)}
                                            className={`relative group p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 active:scale-95 ${isActive
                                                    ? `bg-${scenario.color}-500/20 border-${scenario.color}-500/50 shadow-[0_0_20px_rgba(var(--${scenario.color}-rgb),0.2)]`
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl transition-all ${isActive ? `bg-${scenario.color}-500 text-white` : 'bg-slate-800 text-slate-400 group-hover:text-white'
                                                }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className={`text-[10px] font-black uppercase tracking-tight mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                    {scenario.label}
                                                </h4>
                                                <p className="text-[8px] text-slate-500 leading-tight">
                                                    {scenario.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-glow"
                                                    className={`absolute inset-0 rounded-2xl border-2 border-${scenario.color}-500/50 pointer-events-none`}
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
