import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PhysicsEngine } from '../../core/PhysicsEngine';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ScadaCore } from './ScadaCore';
import { FinancialHealthPanel } from './FinancialHealthPanel';
import { SovereignComponentTree } from './SovereignComponentTree';
import { StressTestButton } from './StressTestButton';
import { Zap, TrendingDown, Activity, Euro, AlertCircle } from 'lucide-react';

export const MasterSovereignDashboard: React.FC = () => {
    const { 
        hydraulic, 
        mechanical, 
        physics, 
        identity, 
        sovereignPulse,
        lastUpdate 
    } = useTelemetryStore();

    // Calculate metrics
    const currentPower = physics?.powerMW ? Number(physics.powerMW) : 0;
    const efficiency = hydraulic?.efficiency || 0;
    const pulseIndex = sovereignPulse?.index || 100;
    
    // Calculate cavitation risk using PhysicsEngine
    const cavitationRisk = React.useMemo(() => {
        if (!hydraulic?.head || !hydraulic?.flow || !mechanical?.vibrationX) return 0;
        
        const sigma = Math.sqrt(hydraulic.flow * 9.81 * hydraulic.head) / 1000; // Simplified Thoma number approximation
        const riskPercent = Math.min(100, Math.max(0, (sigma - 0.1) * 500)); // Scale to 0-100%
        
        return riskPercent;
    }, [hydraulic?.head, hydraulic?.flow, mechanical?.vibrationX]);
    
    // Calculate hourly loss
    const baselinePower = hydraulic?.baselineOutputMW ? Number(hydraulic.baselineOutputMW) : 100;
    const powerLossMW = Math.max(0, baselinePower - currentPower);
    const pricePerMWh = 85;
    const hourlyLossEuro = powerLossMW * pricePerMWh;

    const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
        if (value >= thresholds.good) return 'text-green-400';
        if (value >= thresholds.warning) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getMetricBg = (value: number, thresholds: { good: number; warning: number }) => {
        if (value >= thresholds.good) return 'bg-green-500/10 border-green-500/20';
        if (value >= thresholds.warning) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-white mb-2">Master Sovereign Dashboard</h1>
                    <StressTestButton />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Asset: {identity?.assetName || 'Unknown'}</span>
                    <span>•</span>
                    <span>Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}</span>
                </div>
            </div>

            {/* Top Row: 4 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Active Power */}
                <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Active Power</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {currentPower.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">MW</div>
                </GlassCard>

                {/* Efficiency */}
                <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-400">Efficiency</span>
                    </div>
                    <div className={`text-2xl font-bold ${getMetricColor(efficiency, { good: 88, warning: 80 })}`}>
                        {efficiency.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">hydraulic</div>
                    
                    {/* Cavitation Risk Progress Bar */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400">Cavitation Risk</span>
                            <span className={`text-xs font-medium ${
                                cavitationRisk > 70 ? 'text-red-400' : 
                                cavitationRisk > 40 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                                {cavitationRisk.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    cavitationRisk > 70 ? 'bg-red-500' : 
                                    cavitationRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${cavitationRisk}%` }}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Sovereign Pulse Index */}
                <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-slate-400">Sovereign Pulse</span>
                    </div>
                    <div className={`text-2xl font-bold ${getMetricColor(pulseIndex, { good: 95, warning: 85 })}`}>
                        {pulseIndex.toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">index</div>
                </GlassCard>

                {/* Hourly Loss */}
                <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-slate-400">Hourly Loss</span>
                    </div>
                    <div className="text-2xl font-bold text-red-300">
                        €{hourlyLossEuro.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">per hour</div>
                </GlassCard>
            </div>

            {/* Middle Row: ScadaCore (2/3) + FinancialHealthPanel (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* ScadaCore - 2 columns */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">SCADA Core</h3>
                            <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                                <span className="text-xs text-blue-400 font-medium">LIVE</span>
                            </div>
                        </div>
                        <div className="h-96">
                            <ScadaCore />
                        </div>
                    </GlassCard>
                </div>

                {/* FinancialHealthPanel - 1 column */}
                <div className="lg:col-span-1">
                    <FinancialHealthPanel />
                </div>
            </div>

            {/* Bottom Row: SovereignComponentTree - Full Width */}
            <div className="w-full">
                <SovereignComponentTree />
            </div>
        </div>
    );
};
