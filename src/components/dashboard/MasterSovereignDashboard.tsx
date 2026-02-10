import React, { useState } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PhysicsEngine } from '../../core/PhysicsEngine';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ScadaCore } from './ScadaCore';
import { FinancialHealthPanel } from './FinancialHealthPanel';
import { SovereignComponentTree } from './SovereignComponentTree';
import { StressTestButton } from './StressTestButton';
import { StrategicConsultantView } from './StrategicConsultantView';
import { GreenHydrogenPanel } from './GreenHydrogenPanel';
import { EmergencyOverlay } from '../ui/EmergencyOverlay';
import { ResonanceAudioSystem } from '../ui/ResonanceAudioSystem';
import { AudioSpectrogram } from '../forensics/AudioSpectrogram';
import { VisionAnalyzer } from '../forensics/VisionAnalyzer';
import { KillSwitch } from '../forensics/KillSwitch';
import { SystemHealth } from './SystemHealth';
import { Zap, TrendingDown, Activity, AlertCircle, Shield, Sliders, Calculator, Droplets, Layout, Microscope, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import { SovereignGlobalState } from '../../services/SovereignGlobalState';
import { PulseArchiver } from '../../services/PulseArchiver';
import SystemBoundaryAnalyzer from '../../services/SystemBoundaryAnalyzer';

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
        setMechanical,
        executiveResult,
        educationMode,
        toggleEducationMode
    } = useTelemetryStore();

    // Commander Mode Setpoint State
    const [flowSetpoint, setFlowSetpoint] = useState(hydraulic?.flow || 42);
    const [loadSetpoint, setLoadSetpoint] = useState(mechanical?.rpm || 500);
    const [predictedPulse, setPredictedPulse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'strategic' | 'energy'>('dashboard');
    const [isForensicMode, setIsForensicMode] = useState(false);
    const [boundaryViolation, setBoundaryViolation] = useState<string | null>(null);
    
    const boundaryAnalyzer = new SystemBoundaryAnalyzer();

    // NC-10070: KillSwitch Activation
    const isShutdown = executiveResult?.activeProtections?.some(p => p.includes('SHUTDOWN')) || false;

    // NC-9200: Auto-Layout Logic
    const launchTacticalLayout = () => {
        const screenW = window.screen.availWidth;
        const screenH = window.screen.availHeight;
        
        // Layout: Scada (Left 50%), Finance (Top-Right), Forensics (Bottom-Right)
        const scadaW = Math.floor(screenW * 0.5);
        const sideW = screenW - scadaW;
        const sideH = Math.floor(screenH / 2);

        window.open('#/detach/scada?focus=true', 'detach_scada', `width=${scadaW},height=${screenH},left=0,top=0`);
        window.open('#/detach/financial', 'detach_financial', `width=${sideW},height=${sideH},left=${scadaW},top=0`);
        window.open('#/detach/forensics', 'detach_forensics', `width=${sideW},height=${sideH},left=${scadaW},top=${sideH}`);
    };

    // Check if setpoint is within safe boundaries
    const checkSetpointBoundaries = (flow: number, rpm: number) => {
        // Define safe boundaries
        const diagnosis = {
            entries: [
                { type: 'flow', value: flow, limit: 80, name: 'Flow Rate' },
                { type: 'rpm', value: rpm, limit: 600, name: 'RPM' }
            ],
            automatedActions: flow > 80 || rpm > 600 ? ['BOUNDARY_WARNING'] : []
        };
        
        const assessment = boundaryAnalyzer.assessConfidence(diagnosis);
        
        if (assessment.score < 60) {
            setBoundaryViolation(assessment.warning || 'Boundary violation detected');
        } else {
            setBoundaryViolation(null);
        }
        
        return assessment.score >= 60;
    };

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
            // Check boundaries when setpoints change
            checkSetpointBoundaries(flowSetpoint, loadSetpoint);
            
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
                        <SystemHealth />
                        {/* Strategic View Tab */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(activeTab === 'strategic' ? 'dashboard' : 'strategic')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'strategic' 
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                        >
                            <Calculator className="w-4 h-4" />
                            Strategic
                        </motion.button>

                        {/* Energy Hub Tab */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(activeTab === 'energy' ? 'dashboard' : 'energy')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'energy' 
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                        >
                            <Droplets className="w-4 h-4" />
                            Energy Hub
                        </motion.button>

                        {/* NC-10070: Forensic Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsForensicMode(!isForensicMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                isForensicMode 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                        >
                            <Microscope className="w-4 h-4" />
                            {isForensicMode ? 'FORENSICS ACTIVE' : 'FORENSICS'}
                        </motion.button>

                        {/* NC-11400: Education Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={toggleEducationMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                educationMode 
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            {educationMode ? 'EXPERT GUIDE ON' : 'EXPERT GUIDE'}
                        </motion.button>

                        {/* Commander Mode Toggle - ALWAYS VISIBLE */}
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

                        {/* NC-9200: Tactical Layout Launcher */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={launchTacticalLayout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30"
                            title="Open all modules across screens"
                        >
                            <Layout className="w-4 h-4" />
                            TACTICAL MAP
                        </motion.button>

                        <StressTestButton />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Asset: {identity?.assetName || 'Unknown'}</span>
                    <span>•</span>
                    <span>Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}</span>
                    <span>•</span>
                    <span className={isCommanderMode ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                        {isCommanderMode ? 'COMMANDER CONTROL ACTIVE' : 'GUEST MODE'}
                    </span>
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

            {/* Energy Hub View */}
            {activeTab === 'energy' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <GreenHydrogenPanel />
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
                                        {boundaryViolation && (
                                            <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full animate-pulse">
                                                <span className="text-xs text-red-400 font-medium">⚠ BOUNDARY VIOLATION</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Boundary Violation Warning */}
                                    {boundaryViolation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                        >
                                            <p className="text-sm text-red-400">{boundaryViolation}</p>
                                        </motion.div>
                                    )}

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
                            <ScadaCore forensicMode={isForensicMode} />
                        </div>
                    </GlassCard>
                </div>

                {/* FinancialHealthPanel or VisionAnalyzer (Forensic Mode) - 1 column */}
                <div className="lg:col-span-1">
                    {isForensicMode ? (
                         <div className="h-96">
                            <VisionAnalyzer />
                         </div>
                    ) : (
                        <FinancialHealthPanel />
                    )}
                </div>
            </div>

            {/* Bottom Row: SovereignComponentTree - Full Width */}
            <div className="w-full">
                <SovereignComponentTree />
            </div>
                </>
            )}

            <EmergencyOverlay />
            <ResonanceAudioSystem />

            {/* NC-10070: KillSwitch Global Overlay */}
            <AnimatePresence>
                {isShutdown && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8"
                    >
                        <div className="max-w-2xl w-full text-center space-y-8">
                            <div className="animate-pulse">
                                <Shield className="w-24 h-24 text-red-500 mx-auto mb-6" />
                                <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                                    SYSTEM LOCKDOWN
                                </h1>
                                <p className="text-xl text-red-400 font-mono">
                                    SOVEREIGN EXECUTIVE ENGINE HAS TRIGGERED PROTOCOL 9
                                </p>
                            </div>

                            <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-6 text-left">
                                <h3 className="text-red-400 font-bold mb-2 uppercase tracking-widest text-sm">Active Protections</h3>
                                <ul className="space-y-2">
                                    {executiveResult?.activeProtections.map((p, i) => (
                                        <li key={i} className="text-white font-mono flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-8">
                                <KillSwitch isActive={true} onEngage={() => {}} />
                            </div>

                            <p className="text-slate-500 text-xs font-mono mt-8">
                                MANUAL OVERRIDE REQUIRES PHYSICAL KEY INSERTION
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Watermark */}
            <div className="fixed bottom-4 right-4 text-[10px] text-slate-700 font-mono pointer-events-none z-0">
                SOVEREIGN LIVING SYSTEM • ACTIVE • NC-11405
            </div>
        </div>
    );
};
