import React, { useState } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PhysicsEngine } from '../../core/PhysicsEngine';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ScadaCore } from './ScadaCore';
import { FinancialHealthPanel } from './FinancialHealthPanel';
import { SovereignComponentTree } from './SovereignComponentTree';
import { StressTestButton } from './StressTestButton';
import { StrategicConsultantView } from './StrategicConsultantView';
import { Zap, TrendingDown, Activity, AlertCircle, Shield, Sliders, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import { SovereignGlobalState } from '../../services/SovereignGlobalState';
import { PulseArchiver } from '../../services/PulseArchiver';

export const MasterSovereignDashboard: React.FC = () => {
    const { 
        hydraulic, 
        mechanical, 
        physics, 
        identity, 
        sovereignPulse,
        lastUpdate,
        isCommanderMode,
        toggleCommanderMode,
        setHydraulic,
        setMechanical
    } = useTelemetryStore();

    // Commander Mode Setpoint State
    const [flowSetpoint, setFlowSetpoint] = useState(hydraulic?.flow || 42);
    const [loadSetpoint, setLoadSetpoint] = useState(mechanical?.rpm || 500);
    const [predictedPulse, setPredictedPulse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'strategic'>('dashboard');

    // Calculate predicted pulse when setpoints change
    React.useEffect(() => {
        // Safe boot: Start pulse archiving only after store is hydrated
        PulseArchiver.startArchiving();
        
        return () => {
            PulseArchiver.stopArchiving();
        };
    }, []);

    // Calculate predicted pulse when setpoints change
    React.useEffect(() => {
        if (isCommanderMode) {
            const pulse = ThePulseEngine.calculatePulse(
                [mechanical?.vibrationX || 100], // Asset health
                (flowSetpoint / 50) * 10000, // Revenue estimate
                50, // Market price
                0, // Active alarms
                0, // Cyber threat level
                0  // Eco violations
            );
            setPredictedPulse(pulse.index);
        }
    }, [flowSetpoint, loadSetpoint, isCommanderMode, mechanical?.vibrationX]);

    // Apply setpoints
    const applySetpoints = () => {
        // Update telemetry store
        setHydraulic({ flow: flowSetpoint });
        setMechanical({ rpm: loadSetpoint });

        // Record in SovereignGlobalState
        SovereignGlobalState.updateState({
            timestamp: Date.now(),
            physics: {
                vibration: mechanical?.vibrationX || 0,
                temperature: mechanical?.bearingTemp || 0,
                pressure: hydraulic?.head || 0,
                efficiency: hydraulic?.efficiency || 0,
                cavitation: 0
            },
            finance: {
                revenuePerHour: (flowSetpoint / 50) * 10000,
                molecularDebtRate: 0,
                netProfitRate: 0
            },
            integrity: {
                fatigueAccumulated: 0,
                remainingLifeEstimates: {}
            },
            crossCorrelations: {}
        });

        // Log commander action
        console.log(`[COMMANDER] Setpoints applied - Flow: ${flowSetpoint}m³/s, RPM: ${loadSetpoint}`);
    };

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
                    <div className="flex items-center gap-3">
                        {/* Strategic View Tab */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(activeTab === 'dashboard' ? 'strategic' : 'dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'strategic' 
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                        >
                            <Calculator className="w-4 h-4" />
                            {activeTab === 'strategic' ? 'Dashboard' : 'Strategic'}
                        </motion.button>

                        {/* Commander Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={toggleCommanderMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                isCommanderMode 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            {isCommanderMode ? 'COMMANDER ACTIVE' : 'COMMANDER MODE'}
                        </motion.button>

                        <StressTestButton />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Asset: {identity?.assetName || 'Unknown'}</span>
                    <span>•</span>
                    <span>Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}</span>
                    {isCommanderMode && (
                        <>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold">COMMANDER CONTROL ACTIVE</span>
                        </>
                    )}
                </div>
            </div>

            {/* Strategic Consultant View */}
            {activeTab === 'strategic' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <StrategicConsultantView />
                </motion.div>
            )}

            {/* Main Dashboard View */}
            {activeTab === 'dashboard' && (
                <>
                    {/* Commander Mode Setpoint Controls */}
                    <AnimatePresence>
                        {isCommanderMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6"
                            >
                                <GlassCard className="p-6 bg-gradient-to-br from-amber-900/20 to-slate-900/95 border border-amber-500/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sliders className="w-5 h-5 text-amber-400" />
                                        <h2 className="text-xl font-bold text-amber-400">Commander Setpoint Control</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Flow Setpoint Slider */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm text-slate-400">Flow Setpoint</label>
                                                <span className="text-amber-400 font-bold">{flowSetpoint.toFixed(1)} m³/s</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={flowSetpoint}
                                                onChange={(e) => setFlowSetpoint(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>0</span>
                                                <span>50</span>
                                                <span>100</span>
                                            </div>
                                        </div>

                                        {/* RPM Setpoint Slider */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm text-slate-400">RPM Setpoint</label>
                                                <span className="text-amber-400 font-bold">{loadSetpoint.toFixed(0)} RPM</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="300"
                                                max="750"
                                                step="10"
                                                value={loadSetpoint}
                                                onChange={(e) => setLoadSetpoint(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>300</span>
                                                <span>525</span>
                                                <span>750</span>
                                            </div>
                                        </div>

                                        {/* Predicted Pulse Impact */}
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="text-xs text-slate-400 mb-1">Predicted Pulse Index</div>
                                            <div className={`text-2xl font-bold ${
                                                (predictedPulse || 100) > 90 ? 'text-green-400' :
                                                (predictedPulse || 100) > 70 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                                {predictedPulse !== null ? predictedPulse.toFixed(1) : pulseIndex.toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {predictedPulse !== null ? 'Based on setpoints' : 'Current'}
                                            </div>
                                        </div>

                                        {/* Apply Button */}
                                        <div className="flex items-end">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={applySetpoints}
                                                className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-400 font-semibold flex items-center justify-center gap-2"
                                            >
                                                <Shield className="w-5 h-5" />
                                                Apply Commander Setpoints
                                            </motion.button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                </>
            )}
        </div>
    );
};
