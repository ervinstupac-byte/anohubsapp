import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';
import { SovereignBrainCore, SystemState, StrategicDirective } from '../services/SovereignBrainCore';

export const StrategicDecisionLab: React.FC = () => {
    const [state, setState] = useState<SystemState>({
        marketPriceEur: 100,
        machineHealthIndex: 85,
        hydraulicHeadM: 95,
        environmentalCompliant: true,
        safetyInterlocksClear: true,
        gridStabilityRequest: false
    });

    const [directive, setDirective] = useState<StrategicDirective | null>(null);

    const calculateDirective = useMemo(() => {
        return SovereignBrainCore.determineStrategy(state);
    }, [state]);

    const handleCalculate = () => {
        setDirective(calculateDirective);
    };

    const handleReset = () => {
        setState({
            marketPriceEur: 100,
            machineHealthIndex: 85,
            hydraulicHeadM: 95,
            environmentalCompliant: true,
            safetyInterlocksClear: true,
            gridStabilityRequest: false
        });
        setDirective(null);
    };

    const getStatusColor = (strategy: string) => {
        switch (strategy) {
            case 'SAFETY_SHUTDOWN':
                return 'bg-red-950/20 border-red-500';
            case 'GRID_SUPPORT':
            case 'ECO_CONSTRAINT':
                return 'bg-amber-950/20 border-amber-500';
            case 'CONSERVE_ASSET':
                return 'bg-slate-900/50 border-slate-500';
            case 'MAX_PROFIT':
                return 'bg-emerald-950/20 border-emerald-500';
            default:
                return 'bg-slate-900/50 border-slate-600';
        }
    };

    const getStatusIconColor = (strategy: string) => {
        switch (strategy) {
            case 'SAFETY_SHUTDOWN':
                return 'text-red-400';
            case 'GRID_SUPPORT':
            case 'ECO_CONSTRAINT':
                return 'text-amber-400';
            case 'CONSERVE_ASSET':
                return 'text-slate-400';
            case 'MAX_PROFIT':
                return 'text-emerald-400';
            default:
                return 'text-slate-400';
        }
    };

    return (
        <div className="pb-12 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center pt-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
                        Strategic Decision Lab
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        System strategy optimization using Sovereign Brain Core
                    </p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="System State" className="border-t-4 border-t-slate-500">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <ModernInput
                                label="Market Price (EUR)"
                                type="number"
                                value={state.marketPriceEur}
                                onChange={(e) => setState({ ...state, marketPriceEur: parseFloat(e.target.value) || 0 })}
                                icon={<Activity className="w-4 h-4" />}
                                min="0"
                                max="300"
                                step="1"
                            />
                            <ModernInput
                                label="Machine Health Index"
                                type="number"
                                value={state.machineHealthIndex}
                                onChange={(e) => setState({ ...state, machineHealthIndex: parseFloat(e.target.value) || 0 })}
                                icon={<CheckCircle className="w-4 h-4" />}
                                min="0"
                                max="100"
                                step="1"
                            />
                        </div>
                        <ModernInput
                            label="Hydraulic Head (m)"
                            type="number"
                            value={state.hydraulicHeadM}
                            onChange={(e) => setState({ ...state, hydraulicHeadM: parseFloat(e.target.value) || 0 })}
                            icon={<Waves className="w-4 h-4" />}
                            min="0"
                            max="200"
                            step="1"
                        />
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={state.environmentalCompliant}
                                    onChange={(e) => setState({ ...state, environmentalCompliant: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                                />
                                <span>Environmental Compliant</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={state.safetyInterlocksClear}
                                    onChange={(e) => setState({ ...state, safetyInterlocksClear: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                                />
                                <span>Safety Interlocks Clear</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={state.gridStabilityRequest}
                                    onChange={(e) => setState({ ...state, gridStabilityRequest: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                                />
                                <span>Grid Stability Request</span>
                            </label>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                                Calculate Directive
                            </ModernButton>
                            <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                                Reset
                            </ModernButton>
                        </div>
                    </div>
                </GlassCard>

                {(directive || true) && (
                    <GlassCard title="Strategic Directive" className="border-t-4 border-t-slate-600">
                        <div className="space-y-6">
                            <div className={`p-4 rounded-xl border ${getStatusColor((directive || calculateDirective).strategy)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Strategy</p>
                                        <p className="text-xl font-semibold text-slate-100">{(directive || calculateDirective).strategy}</p>
                                    </div>
                                    <Activity className={`w-10 h-10 ${getStatusIconColor((directive || calculateDirective).strategy)}`} />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Target Load (MW)</p>
                                <p className="text-2xl font-semibold text-slate-100">{(directive || calculateDirective).targetLoadMW === -1 ? 'Variable' : (directive || calculateDirective).targetLoadMW}</p>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Priority Score</p>
                                <p className="text-2xl font-semibold text-slate-100">{(directive || calculateDirective).priorityScore}</p>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Rationale</p>
                                <p className="text-sm text-slate-300">{(directive || calculateDirective).rationale}</p>
                            </div>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};
