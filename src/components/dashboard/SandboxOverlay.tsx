import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, RotateCcw, Activity, Gauge, Zap, Flame, Waves, BatteryWarning, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SYSTEM_CONSTANTS } from '../../config/SystemConstants';
import { computeEfficiencyFromHillChart } from '../../features/physics-core/UnifiedPhysicsCore';
import { saveLog } from '../../services/PersistenceService';

interface SandboxState {
    flow: number;
    head: number;
    gate: number;
    vibration?: number;
    temperature?: number;
    voltage?: number;
}

interface SandboxOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    currentValues: SandboxState;
    onUpdate: (values: SandboxState, results: { stress: number, efficiency: number }) => void;
    onCommit: (values: SandboxState) => void;
}

export const SandboxOverlay: React.FC<SandboxOverlayProps> = ({ 
    isOpen, onClose, currentValues, onUpdate, onCommit 
}) => {
    const { t } = useTranslation();
    const [values, setValues] = useState<SandboxState>({
        ...currentValues,
        vibration: currentValues.vibration ?? 2.5,
        temperature: currentValues.temperature ?? 65,
        voltage: currentValues.voltage ?? -950
    });
    
    // Physics State
    const [results, setResults] = useState({ stress: 0, efficiency: 0 });

    // Constants (Francis Turbine Estimations)
    const RADIUS = 2.5; // meters
    const THICKNESS = 0.04; // meters (40mm steel)

    const triggerDisaster = (type: 'VIBRATION' | 'THERMAL' | 'CATHODIC') => {
        // NC-25100: Log simulation scenario
        saveLog({
            event_type: 'SIMULATION_SCENARIO_TRIGGERED',
            reason: `User injected ${type} failure scenario`,
            active_protection: 'NONE',
            details: {
                scenario: type,
                timestamp: Date.now()
            }
        });

        setValues(prev => {
            const next = { ...prev };
            switch (type) {
                case 'VIBRATION': 
                    next.vibration = 12.5; // ISO 10816 Zone D
                    break;
                case 'THERMAL': 
                    next.temperature = 110; // Babbitt Melt
                    break;
                case 'CATHODIC': 
                    next.voltage = -400; // Rapid Oxidation
                    break;
            }
            return next;
        });
    };

    useEffect(() => {
        // 1. Calculate Pressure (Pa) = rho * g * h
        const pressure = SYSTEM_CONSTANTS.PHYSICS.WATER.DENSITY * SYSTEM_CONSTANTS.PHYSICS.GRAVITY * values.head;
        
        // 2. Calculate Hoop Stress (MPa) = (P * r) / t
        // Divide by 1e6 to get MPa
        const stressMPa = (pressure * RADIUS) / THICKNESS / 1e6;

        // 3. Calculate Efficiency
        const eff = computeEfficiencyFromHillChart('FRANCIS', values.head, values.flow);

        const newResults = { stress: stressMPa, efficiency: eff * 100 };
        setResults(newResults);
        onUpdate(values, newResults);
    }, [values]);

    const handleCommit = () => {
        // Mock Ingest Call
        console.log('[SovereignSandbox] Committing values to lineage:', values);

        // NC-25100: Log commit
        saveLog({
            event_type: 'SIMULATION_COMMITTED',
            reason: 'User applied simulation parameters to system',
            active_protection: 'NONE',
            details: {
                values,
                results
            }
        });

        onCommit(values);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 right-6 w-96 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-emerald-500/10">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-emerald-500/20 rounded-full text-emerald-600 hover:text-emerald-400 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
                                Predictive Sandbox
                            </span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-4">
                        {/* Inputs */}
                        <div className="space-y-3">
                            {/* CRITICAL SCENARIOS (NC-12500) */}
                            <div className="bg-red-500/5 rounded-lg p-2 border border-red-500/10">
                                <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Critical Scenarios
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                    <button 
                                        onClick={() => triggerDisaster('VIBRATION')}
                                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded flex flex-col items-center gap-1 transition-all group"
                                        title="Trigger Vibration Storm (12.5 mm/s)"
                                    >
                                        <Waves className="w-3 h-3 text-slate-400 group-hover:text-red-400" />
                                        <span className="text-[8px] text-slate-500 font-mono">VIB.STORM</span>
                                    </button>
                                    <button 
                                        onClick={() => triggerDisaster('THERMAL')}
                                        className="p-1.5 bg-slate-800 hover:bg-orange-500/20 border border-slate-700 hover:border-orange-500/50 rounded flex flex-col items-center gap-1 transition-all group"
                                        title="Trigger Thermal Meltdown (110°C)"
                                    >
                                        <Flame className="w-3 h-3 text-slate-400 group-hover:text-orange-400" />
                                        <span className="text-[8px] text-slate-500 font-mono">MELTDOWN</span>
                                    </button>
                                    <button 
                                        onClick={() => triggerDisaster('CATHODIC')}
                                        className="p-1.5 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 rounded flex flex-col items-center gap-1 transition-all group"
                                        title="Trigger Cathodic Failure (-400mV)"
                                    >
                                        <BatteryWarning className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
                                        <span className="text-[8px] text-slate-500 font-mono">RUST.FAIL</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>NET HEAD (m)</span>
                                    <span>{values.head.toFixed(1)}</span>
                                </div>
                                <input 
                                    type="range" min="50" max="150" step="0.5"
                                    value={values.head}
                                    onChange={(e) => setValues(prev => ({ ...prev, head: Number(e.target.value) }))}
                                    className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>FLOW RATE (m³/s)</span>
                                    <span>{values.flow.toFixed(1)}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="0.1"
                                    value={values.flow}
                                    onChange={(e) => setValues(prev => ({ ...prev, flow: Number(e.target.value) }))}
                                    className="w-full accent-cyan-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>GATE OPENING (%)</span>
                                    <span>{values.gate.toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="1"
                                    value={values.gate}
                                    onChange={(e) => setValues(prev => ({ ...prev, gate: Number(e.target.value) }))}
                                    className="w-full accent-amber-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Results Preview */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className={`p-3 rounded-lg border ${results.stress > 200 ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Gauge className={`w-3 h-3 ${results.stress > 200 ? 'text-red-400' : 'text-slate-400'}`} />
                                    <span className="text-[9px] font-black uppercase text-slate-500">HOOP STRESS</span>
                                </div>
                                <div className={`text-lg font-mono font-bold ${results.stress > 200 ? 'text-red-400' : 'text-slate-200'}`}>
                                    {results.stress.toFixed(1)} <span className="text-[10px]">MPa</span>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[9px] font-black uppercase text-slate-500">EFFICIENCY</span>
                                </div>
                                <div className="text-lg font-mono font-bold text-emerald-400">
                                    {results.efficiency.toFixed(1)}<span className="text-[10px]">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={() => setValues(currentValues)}
                                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-3 h-3" />
                                RESET
                            </button>
                            <button 
                                onClick={handleCommit}
                                className="flex-[2] py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                            >
                                <Save className="w-3 h-3" />
                                COMMIT TO DB
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
