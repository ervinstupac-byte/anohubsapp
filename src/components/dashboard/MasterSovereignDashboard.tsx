import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PhysicsEngine } from '../../core/PhysicsEngine';
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
import { SovereignVisualizer } from './SovereignVisualizer'; // Re-import for side panel
import { SovereignLedgerPanel } from './SovereignLedgerPanel';
import { SandboxOverlay } from './SandboxOverlay';
import { Sliders, Calculator, Droplets, Microscope, BookOpen, Shield, Layout, Zap, Activity, AlertCircle, TrendingDown, ArrowLeft, Home } from 'lucide-react';
import { PulseArchiver } from '../../services/PulseArchiver';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import { SovereignGlobalState } from '../../services/SovereignGlobalState';
import SystemBoundaryAnalyzer from '../../services/SystemBoundaryAnalyzer';

export const MasterSovereignDashboard: React.FC = () => {
    const navigate = useNavigate();
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

    // Sandbox State (NC-12200)
    const [isSandboxOpen, setIsSandboxOpen] = useState(false);
    const [sandboxValues, setSandboxValues] = useState({
        flow: hydraulic?.flow || 42,
        head: typeof physics?.netHead === 'object' && 'toNumber' in (physics.netHead as any) ? (physics.netHead as any).toNumber() : Number(physics?.netHead || 100),
        gate: 50
    });
    const [sandboxStress, setSandboxStress] = useState<number | null>(null);

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
    const currentPower = physics?.powerMW || 0;
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
    const baselinePower = hydraulic?.baselineOutputMW ? hydraulic.baselineOutputMW.toNumber() : 100;
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
        <div className="min-h-screen bg-scada-bg p-6 text-scada-text">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-scada-panel rounded-none text-scada-muted hover:text-scada-text transition-colors"
                            title="Back to Hub"
                        >
                            <Home className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-scada-text font-header tracking-tight uppercase">Master Sovereign Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SystemHealth />
                        {/* Strategic View Tab */}
                        <button
                            onClick={() => setActiveTab(activeTab === 'strategic' ? 'dashboard' : 'strategic')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'strategic'
                                ? 'bg-status-info/20 text-status-info border border-status-info/50'
                                : 'bg-scada-panel text-scada-muted border border-scada-border hover:text-scada-text'
                                }`}
                        >
                            <Calculator className="w-4 h-4" />
                            Strategic
                        </button>

                        {/* Energy Hub Tab */}
                        <button
                            onClick={() => setActiveTab(activeTab === 'energy' ? 'dashboard' : 'energy')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'energy'
                                ? 'bg-status-info/20 text-status-info border border-status-info/50'
                                : 'bg-scada-panel text-scada-muted border border-scada-border hover:text-scada-text'
                                }`}
                        >
                            <Droplets className="w-4 h-4" />
                            Energy Hub
                        </button>

                        {/* NC-10070: Forensic Mode Toggle */}
                        <button
                            onClick={() => setIsForensicMode(!isForensicMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-colors ${isForensicMode
                                ? 'bg-status-ok/20 text-status-ok border border-status-ok/50'
                                : 'bg-scada-panel text-scada-muted border border-scada-border hover:text-scada-text'
                                }`}
                        >
                            <Microscope className="w-4 h-4" />
                            {isForensicMode ? 'FORENSICS ACTIVE' : 'FORENSICS'}
                        </button>

                        {/* NC-11400: Education Mode Toggle */}
                        <button
                            onClick={toggleEducationMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-colors ${educationMode
                                ? 'bg-status-info/20 text-status-info border border-status-info/50'
                                : 'bg-scada-panel text-scada-muted border border-scada-border hover:text-scada-text'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            {educationMode ? 'EXPERT GUIDE ON' : 'EXPERT GUIDE'}
                        </button>

                        {/* Commander Mode Toggle - ALWAYS VISIBLE */}
                        <button
                            onClick={toggleCommanderMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-colors ${isCommanderMode
                                ? 'bg-status-warning/20 text-status-warning border border-status-warning/50'
                                : 'bg-scada-panel text-scada-muted border border-scada-border hover:text-scada-text'
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            {isCommanderMode ? 'COMMANDER ACTIVE' : 'COMMANDER MODE'}
                        </button>

                        {/* NC-9200: Tactical Layout Launcher */}
                        <button
                            onClick={launchTacticalLayout}
                            className="flex items-center gap-2 px-4 py-2 rounded-none font-medium transition-colors bg-scada-panel text-status-info border border-status-info/50 hover:bg-scada-panel/80"
                            title="Open all modules across screens"
                        >
                            <Layout className="w-4 h-4" />
                            TACTICAL MAP
                        </button>

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
                <div className="animate-in fade-in duration-300">
                    <StrategicConsultantView />
                </div>
            )}

            {/* Energy Hub View */}
            {activeTab === 'energy' && (
                <div className="animate-in fade-in duration-300">
                    <GreenHydrogenPanel />
                </div>
            )}

            {/* Main Dashboard View */}
            {activeTab === 'dashboard' && (
                <>
                    {/* Commander Mode Setpoint Controls */}
                    {isCommanderMode && (
                        <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="p-6 bg-scada-panel border border-status-warning rounded-sm shadow-scada-card">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sliders className="w-5 h-5 text-status-warning" />
                                    <h2 className="text-xl font-bold text-status-warning uppercase tracking-tight font-header">Commander Setpoint Control</h2>
                                    {boundaryViolation && (
                                        <div className="px-3 py-1 bg-status-error/20 border border-status-error/30 rounded-sm">
                                            <span className="text-xs text-status-error font-mono font-bold uppercase">⚠ BOUNDARY VIOLATION</span>
                                        </div>
                                    )}
                                </div>

                                {/* Boundary Violation Warning */}
                                {boundaryViolation && (
                                    <div className="mb-4 p-3 bg-status-error/10 border border-status-error/20 rounded-sm">
                                        <p className="text-sm text-status-error font-mono">{boundaryViolation}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Flow Setpoint Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs uppercase tracking-wider text-scada-muted font-bold font-mono">Flow Setpoint</label>
                                            <span className="text-status-warning font-mono font-bold tabular-nums">{flowSetpoint.toFixed(1)} m³/s</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={flowSetpoint}
                                            onChange={(e) => setFlowSetpoint(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-scada-bg rounded-none appearance-none cursor-pointer accent-status-warning"
                                        />
                                        <div className="flex justify-between text-[10px] text-scada-muted font-mono mt-1">
                                            <span>0</span>
                                            <span>50</span>
                                            <span>100</span>
                                        </div>
                                    </div>

                                    {/* RPM Setpoint Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs uppercase tracking-wider text-scada-muted font-bold font-mono">RPM Setpoint</label>
                                            <span className="text-status-warning font-mono font-bold tabular-nums">{loadSetpoint.toFixed(0)} RPM</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="300"
                                            max="750"
                                            step="10"
                                            value={loadSetpoint}
                                            onChange={(e) => setLoadSetpoint(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-scada-bg rounded-none appearance-none cursor-pointer accent-status-warning"
                                        />
                                        <div className="flex justify-between text-[10px] text-scada-muted font-mono mt-1">
                                            <span>300</span>
                                            <span>525</span>
                                            <span>750</span>
                                        </div>
                                    </div>

                                    {/* Predicted Pulse Impact */}
                                    <div className="bg-scada-bg border border-scada-border rounded-sm p-3">
                                        <div className="text-[10px] uppercase font-mono text-scada-muted mb-1">Predicted Pulse Index</div>
                                        <div className={`text-2xl font-bold font-mono tabular-nums ${(predictedPulse || 100) > 90 ? 'text-status-ok' :
                                            (predictedPulse || 100) > 70 ? 'text-status-warning' : 'text-status-error'
                                            }`}>
                                            {predictedPulse !== null ? predictedPulse.toFixed(1) : pulseIndex.toFixed(0)}%
                                        </div>
                                        <div className="text-[10px] uppercase font-mono text-scada-muted mt-1">
                                            {predictedPulse !== null ? 'Based on setpoints' : 'Current'}
                                        </div>
                                    </div>

                                    {/* Apply Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={applySetpoints}
                                            className="w-full py-3 bg-status-warning/20 hover:bg-status-warning/30 border border-status-warning/50 rounded-sm text-status-warning font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Apply Commander Setpoints
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Row: 4 Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Active Power */}
                        <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-status-info" />
                                <span className="text-xs font-mono uppercase text-scada-muted">Active Power</span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-scada-text tabular-nums">
                                {currentPower.toFixed(1)}
                            </div>
                            <div className="text-[10px] uppercase font-mono text-scada-muted mt-1">MW</div>
                        </div>

                        {/* Efficiency */}
                        <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-status-ok" />
                                <span className="text-xs font-mono uppercase text-scada-muted">Efficiency</span>
                            </div>
                            <div className={`text-2xl font-bold font-mono tabular-nums ${getMetricColor(efficiency, { good: 88, warning: 80 })}`}>
                                {efficiency.toFixed(1)}%
                            </div>
                            <div className="text-[10px] uppercase font-mono text-scada-muted mt-1">hydraulic</div>

                            {/* Cavitation Risk Progress Bar */}
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] uppercase font-mono text-scada-muted">Cavitation Risk</span>
                                    <span className={`text-[10px] font-mono font-medium ${cavitationRisk > 70 ? 'text-status-error' :
                                        cavitationRisk > 40 ? 'text-status-warning' : 'text-status-ok'
                                        }`}>
                                        {cavitationRisk.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-scada-bg border border-scada-border rounded-sm h-1.5">
                                    <div
                                        className={`h-full rounded-sm transition-all duration-300 ${cavitationRisk > 70 ? 'bg-status-error' :
                                            cavitationRisk > 40 ? 'bg-status-warning' : 'bg-status-ok'
                                            }`}
                                        style={{ width: `${cavitationRisk}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sovereign Pulse Index */}
                        <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-status-info" />
                                <span className="text-xs font-mono uppercase text-scada-muted">Sovereign Pulse</span>
                            </div>
                            <div className={`text-2xl font-bold font-mono tabular-nums ${getMetricColor(pulseIndex, { good: 95, warning: 85 })}`}>
                                {pulseIndex.toFixed(0)}
                            </div>
                            <div className="text-[10px] uppercase font-mono text-scada-muted mt-1">index</div>
                        </div>

                        {/* Hourly Loss */}
                        <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-status-error" />
                                <span className="text-xs font-mono uppercase text-scada-muted">Hourly Loss</span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-status-error tabular-nums">
                                €{hourlyLossEuro.toFixed(2)}
                            </div>
                            <div className="text-[10px] uppercase font-mono text-scada-muted mt-1">per hour</div>
                        </div>
                    </div>

                    {/* Middle Row: ScadaCore (2/3) + FinancialHealthPanel (1/3) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* ScadaCore - 2 columns */}
                        <div className="lg:col-span-2">
                            <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-scada-text font-header uppercase tracking-tight">SCADA Core</h3>
                                    <div className="px-2 py-1 bg-status-info/20 border border-status-info/30 rounded-sm">
                                        <span className="text-xs text-status-info font-black uppercase tracking-widest">LIVE</span>
                                    </div>
                                </div>
                                <div className="h-96">
                                    <ScadaCore forensicMode={isForensicMode} />
                                </div>
                            </div>
                        </div>

                        {/* SovereignLedgerPanel - Immutable Record (Replaces Visualizer in Default View) */}
                        <div className="lg:col-span-1">
                            <SovereignLedgerPanel />
                        </div>

                        {/* FinancialHealthPanel or VisionAnalyzer (Forensic Mode) - 1 column */}
                        <div className="lg:col-span-1">
                            {isForensicMode ? (
                                <div className="h-96">
                                    <VisionAnalyzer />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <FinancialHealthPanel />
                                    
                                    {/* Sandbox Trigger (Moved here) */}
                                    <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                                         <button
                                            onClick={() => setIsSandboxOpen(true)}
                                            className="w-full py-3 bg-scada-bg border border-scada-border rounded-sm flex items-center justify-center gap-2 hover:bg-scada-panel transition-colors group"
                                        >
                                            <Sliders className="w-4 h-4 text-status-ok group-hover:rotate-180 transition-transform duration-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-scada-muted group-hover:text-status-ok">
                                                Predictive Sandbox
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: SovereignComponentTree - Full Width */}
                    <div className="w-full">
                        <SovereignComponentTree />
                    </div>
                </>
            )}

            {/* Sandbox Overlay (NC-12200) */}
            <SandboxOverlay
                isOpen={isSandboxOpen}
                onClose={() => {
                    setIsSandboxOpen(false);
                    setSandboxStress(null);
                }}
                currentValues={sandboxValues}
                onUpdate={(vals, results) => {
                    setSandboxValues(vals);
                    setSandboxStress(results.stress);
                }}
                onCommit={(vals) => {
                    console.log('Committing Sandbox:', vals);
                }}
            />

            <EmergencyOverlay />
            <ResonanceAudioSystem />

            {/* NC-10070: KillSwitch Global Overlay */}
            {isShutdown && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="max-w-2xl w-full text-center space-y-8">
                        <div className="animate-pulse">
                            <Shield className="w-24 h-24 text-status-error mx-auto mb-6" />
                            <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                                SYSTEM LOCKDOWN
                            </h1>
                            <p className="text-xl text-status-error font-mono">
                                SOVEREIGN EXECUTIVE ENGINE HAS TRIGGERED PROTOCOL 9
                            </p>
                        </div>

                        <div className="bg-status-error/10 border border-status-error/50 rounded-sm p-6 text-left">
                            <h3 className="text-status-error font-bold mb-2 uppercase tracking-widest text-sm">Active Protections</h3>
                            <ul className="space-y-2">
                                {executiveResult?.activeProtections.map((p, i) => (
                                    <li key={i} className="text-white font-mono flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-status-error" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-8">
                            <KillSwitch isActive={true} onEngage={() => { }} />
                        </div>

                        <p className="text-scada-muted text-xs font-mono mt-8">
                            MANUAL OVERRIDE REQUIRES PHYSICAL KEY INSERTION
                        </p>
                    </div>
                </div>
            )}
            {/* Watermark */}
            <div className="fixed bottom-4 right-4 text-[10px] text-scada-muted font-mono pointer-events-none z-0">
                SOVEREIGN LIVING SYSTEM • ACTIVE • NC-11405
            </div>
        </div>
    );
};
