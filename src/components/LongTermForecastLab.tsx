import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity } from 'lucide-react';
import { QuantumForecaster } from '../services/QuantumForecaster';

export const LongTermForecastLab: React.FC = () => {
    const [startYear, setStartYear] = useState<number>(2026);
    const [currentWearState, setCurrentWearState] = useState<number>(25);
    const [results, setResults] = useState<ReturnType<QuantumForecaster['runDecadeSimulation']> | null>(null);

    const calculateForecast = useMemo(() => {
        const forecaster = new QuantumForecaster();
        return forecaster.runDecadeSimulation(startYear, currentWearState);
    }, [startYear, currentWearState]);

    const handleCalculate = () => {
        setResults(calculateForecast);
    };

    const handleReset = () => {
        setStartYear(2026);
        setCurrentWearState(25);
        setResults(null);
    };

    const getStatusColor = (survivalProb: number) => {
        if (survivalProb < 30) return 'bg-red-950/20 border-red-500';
        if (survivalProb < 60) return 'bg-amber-950/20 border-amber-500';
        return 'bg-emerald-950/20 border-emerald-500';
    };

    const getStatusIconColor = (survivalProb: number) => {
        if (survivalProb < 30) return 'text-red-400';
        if (survivalProb < 60) return 'text-amber-400';
        return 'text-emerald-400';
    };

    return (
        <div className="pb-12 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center pt-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
                        Long-Term Asset Forecast Lab
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Monte Carlo simulation for long-term asset failure prediction
                    </p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="Simulation Parameters" className="border-t-4 border-t-slate-500">
                    <div className="space-y-6">
                        <ModernInput
                            label="Start Year"
                            type="number"
                            value={startYear}
                            onChange={(e) => setStartYear(parseInt(e.target.value) || 2026)}
                            icon={<Activity className="w-4 h-4" />}
                            min="2020"
                            max="2030"
                        />
                        <ModernInput
                            label="Current Wear State (0-100%)"
                            type="number"
                            value={currentWearState}
                            onChange={(e) => setCurrentWearState(parseInt(e.target.value) || 0)}
                            icon={<Activity className="w-4 h-4" />}
                            min="0"
                            max="100"
                        />

                        <div className="flex gap-4 pt-4">
                            <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                                Run Simulation
                            </ModernButton>
                            <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                                Reset
                            </ModernButton>
                        </div>
                    </div>
                </GlassCard>

                {(results || true) && (
                    <GlassCard title="Simulation Results" className="border-t-4 border-t-slate-600">
                        <div className="space-y-6">
                            <div className={`p-4 rounded-xl border ${getStatusColor((results || calculateForecast).survivalProbability)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                            Survival Probability
                                        </p>
                                        <p className="text-2xl font-bold text-slate-100">
                                            {(results || calculateForecast).survivalProbability}%
                                        </p>
                                    </div>
                                    <Activity className={`w-10 h-10 ${getStatusIconColor((results || calculateForecast).survivalProbability)}`} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                        Target Year
                                    </p>
                                    <p className="text-2xl font-semibold text-slate-100">
                                        {(results || calculateForecast).targetYear}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                        Simulations
                                    </p>
                                    <p className="text-2xl font-semibold text-slate-100">
                                        {(results || calculateForecast).simulationCount}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                    Most Likely Failure Point
                                </p>
                                <p className="text-lg font-semibold text-slate-100">
                                    {(results || calculateForecast).mostLikelyFailure}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                                    Scenario Summary
                                </p>
                                <p className="text-sm text-slate-300">
                                    {(results || calculateForecast).scenarioSummary}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};
