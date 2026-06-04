import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useDrillDown } from '../../contexts/DrillDownContext.tsx';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PhysicsEngine } from '../../core/PhysicsEngine';
import { ScadaCore } from './ScadaCore';
import { FinancialHealthPanel } from './FinancialHealthPanel';
import { SovereignComponentTree } from './SovereignComponentTree';
import { StressTestButton } from './StressTestButton';
import { StrategicConsultantView } from './StrategicConsultantView';
import { GreenHydrogenPanel } from './GreenHydrogenPanel';
import { CustomizableDashboard } from './CustomizableDashboard';
import { EmergencyOverlay } from '../ui/EmergencyOverlay';
import { ResonanceAudioSystem } from '../ui/ResonanceAudioSystem';
import { AudioSpectrogram } from '../forensics/AudioSpectrogram';
import { VisionAnalyzer } from '../forensics/VisionAnalyzer';
import { KillSwitch } from '../forensics/KillSwitch';
import { SystemHealth } from './SystemHealth';
import { SovereignVisualizer } from './SovereignVisualizer'; // Re-import for side panel
import { SovereignLedgerPanel } from './SovereignLedgerPanel';
import { SandboxOverlay } from './SandboxOverlay';
import {
  Sliders,
  Calculator,
  Droplets,
  Microscope,
  BookOpen,
  Shield,
  Layout,
  Zap,
  Activity,
  AlertCircle,
  TrendingDown,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { PulseArchiver } from '../../services/PulseArchiver';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import { SovereignGlobalState } from '../../services/SovereignGlobalState';
import SystemBoundaryAnalyzer from '../../services/SystemBoundaryAnalyzer';
// Import new components
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  GlassCard,
  ProgressBar,
} from '../../shared/components/ui';

export const MasterSovereignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAsset } = useAssetContext();
  const { openMetricDrilldown } = useDrillDown();
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
    toggleEducationMode,
  } = useTelemetryStore();

  // Sandbox State (NC-12200)
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [sandboxValues, setSandboxValues] = useState({
    flow: hydraulic?.flow || 42,
    head:
      typeof physics?.netHead === 'object' && 'toNumber' in (physics.netHead as any)
        ? (physics.netHead as any).toNumber()
        : Number(physics?.netHead || 100),
    gate: 50,
  });
  const [sandboxStress, setSandboxStress] = useState<number | null>(null);

  // Commander Mode Setpoint State
  const [flowSetpoint, setFlowSetpoint] = useState(hydraulic?.flow || 42);
  const [loadSetpoint, setLoadSetpoint] = useState(mechanical?.rpm || 500);
  const [predictedPulse, setPredictedPulse] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'strategic' | 'energy' | 'custom'>(
    'dashboard'
  );
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

    window.open(
      '#/detach/scada?focus=true',
      'detach_scada',
      `width=${scadaW},height=${screenH},left=0,top=0`
    );
    window.open(
      '#/detach/financial',
      'detach_financial',
      `width=${sideW},height=${sideH},left=${scadaW},top=0`
    );
    window.open(
      '#/detach/forensics',
      'detach_forensics',
      `width=${sideW},height=${sideH},left=${scadaW},top=${sideH}`
    );
  };

  // Check if setpoint is within safe boundaries
  const checkSetpointBoundaries = (flow: number, rpm: number) => {
    // Define safe boundaries
    const diagnosis = {
      entries: [
        { type: 'flow', value: flow, limit: 80, name: 'Flow Rate' },
        { type: 'rpm', value: rpm, limit: 600, name: 'RPM' },
      ],
      automatedActions: flow > 80 || rpm > 600 ? ['BOUNDARY_WARNING'] : [],
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
        0 // Eco violations
      );
      setPredictedPulse(pulse.index);
    }
  }, [flowSetpoint, loadSetpoint, isCommanderMode, mechanical?.vibrationX]);

  // Sync selectedAsset with telemetry store
  React.useEffect(() => {
    if (selectedAsset) {
      const activeType = (
        selectedAsset.turbine_type ||
        selectedAsset.type ||
        'FRANCIS'
      ).toUpperCase() as any;
      useTelemetryStore.getState().updateTelemetry({
        identity: {
          ...useTelemetryStore.getState().identity,
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          turbineType: activeType,
          location: selectedAsset.location || 'Powerhouse 1',
          machineConfig: {
            ...useTelemetryStore.getState().identity.machineConfig,
            ratedPowerMW: selectedAsset.capacity || 12.5,
            orientation: (selectedAsset.specs?.orientation?.toUpperCase() || 'HORIZONTAL') as any,
          },
        },
        physics: {
          ...useTelemetryStore.getState().physics,
          powerMW: selectedAsset.capacity || 12.5,
        },
      });
    }
  }, [selectedAsset]);

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
        cavitation: 0,
      },
      finance: {
        revenuePerHour: (flowSetpoint / 50) * 10000,
        molecularDebtRate: 0,
        netProfitRate: 0,
      },
      integrity: {
        fatigueAccumulated: 0,
        remainingLifeEstimates: {},
      },
      crossCorrelations: {},
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

  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-slate-100 overflow-y-auto max-h-screen relative">
      {/* CSS-only bg grid (offline-safe) */}
      <div className="absolute inset-0 surface-grid opacity-20 pointer-events-none" />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all hover:scale-105"
              title="Back to Hub"
            >
              <Home className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Master Sovereign Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time hydro plant monitoring and control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <SystemHealth />
            {/* Strategic View Tab */}
            <button
              onClick={() => setActiveTab(activeTab === 'strategic' ? 'dashboard' : 'strategic')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'strategic'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Strategic
            </button>

            {/* Energy Hub Tab */}
            <button
              onClick={() => setActiveTab(activeTab === 'energy' ? 'dashboard' : 'energy')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'energy'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Droplets className="w-4 h-4" />
              Energy Hub
            </button>

            {/* Customizable Dashboard Tab */}
            <button
              onClick={() => setActiveTab(activeTab === 'custom' ? 'dashboard' : 'custom')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'custom'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layout className="w-4 h-4" />
              Custom Dashboard
            </button>

            {/* NC-10070: Forensic Mode Toggle */}
            <button
              onClick={() => setIsForensicMode(!isForensicMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isForensicMode
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Microscope className="w-4 h-4" />
              {isForensicMode ? 'FORENSICS ACTIVE' : 'FORENSICS'}
            </button>

            {/* NC-11400: Education Mode Toggle */}
            <button
              onClick={toggleEducationMode}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                educationMode
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {educationMode ? 'EXPERT GUIDE ON' : 'EXPERT GUIDE'}
            </button>

            {/* Commander Mode Toggle - ALWAYS VISIBLE */}
            <button
              onClick={toggleCommanderMode}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isCommanderMode
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              {isCommanderMode ? 'COMMANDER ACTIVE' : 'COMMANDER MODE'}
            </button>

            {/* NC-9200: Tactical Layout Launcher */}
            <button
              onClick={launchTacticalLayout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-cyan-500/20"
              title="Open all modules across screens"
            >
              <Layout className="w-4 h-4" />
              TACTICAL MAP
            </button>

            <StressTestButton />
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-400 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></span>
            <span className="font-medium">Asset: {identity?.assetName || 'Unknown'}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span>
            Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </span>
          <span className="text-slate-600">•</span>
          <span
            className={`font-semibold ${isCommanderMode ? 'text-amber-400' : 'text-slate-500'}`}
          >
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

      {/* Customizable Dashboard View */}
      {activeTab === 'custom' && (
        <div className="animate-in fade-in duration-300">
          <CustomizableDashboard />
        </div>
      )}

      {/* Main Dashboard View */}
      {activeTab === 'dashboard' && (
        <>
          {/* Commander Mode Setpoint Controls */}
          {isCommanderMode && (
            <div className="mb-8 animate-slide-up">
              <div className="p-8 bg-slate-900/70 border border-amber-500/30 rounded-xl shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <Sliders className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-amber-400 uppercase tracking-tight">
                    Commander Setpoint Control
                  </h2>
                  {boundaryViolation && (
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400 font-mono font-bold uppercase">
                        ⚠ BOUNDARY VIOLATION
                      </span>
                    </div>
                  )}
                </div>

                {/* Boundary Violation Warning */}
                {boundaryViolation && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 font-mono">{boundaryViolation}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Flow Setpoint Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Flow Setpoint
                      </label>
                      <span className="text-amber-400 font-mono font-bold text-xl tabular-nums">
                        {flowSetpoint.toFixed(1)} m³/s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={flowSetpoint}
                      onChange={e => setFlowSetpoint(parseFloat(e.target.value))}
                      className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                    />
                    <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* RPM Setpoint Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        RPM Setpoint
                      </label>
                      <span className="text-amber-400 font-mono font-bold text-xl tabular-nums">
                        {loadSetpoint.toFixed(0)} RPM
                      </span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="750"
                      step="10"
                      value={loadSetpoint}
                      onChange={e => setLoadSetpoint(parseFloat(e.target.value))}
                      className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                    />
                    <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                      <span>300</span>
                      <span>525</span>
                      <span>750</span>
                    </div>
                  </div>

                  {/* Predicted Pulse Impact */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <div className="text-xs uppercase font-mono text-slate-500 mb-2">
                      Predicted Pulse Index
                    </div>
                    <div
                      className={`text-3xl font-bold font-mono tabular-nums ${
                        (predictedPulse || 100) > 90
                          ? 'text-green-400'
                          : (predictedPulse || 100) > 70
                            ? 'text-amber-400'
                            : 'text-red-400'
                      }`}
                    >
                      {predictedPulse !== null ? predictedPulse.toFixed(1) : pulseIndex.toFixed(0)}%
                    </div>
                    <div className="text-xs uppercase font-mono text-slate-500 mt-2">
                      {predictedPulse !== null ? 'Based on setpoints' : 'Current'}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex items-end">
                    <button
                      onClick={applySetpoints}
                      className="w-full py-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-400 font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 hover:shadow-lg hover:shadow-amber-500/20"
                    >
                      <Shield className="w-5 h-5" />
                      Apply Commander Setpoints
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Row: 4 Metric Cards with 3D hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Power */}
            <div
              onClick={() =>
                openMetricDrilldown('shaftLift', 'Active Power Output', currentPower, 'MW', {
                  warning: 80,
                  critical: 100,
                })
              }
              className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 cursor-pointer card-3d"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Power
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-white tabular-nums">
                {currentPower.toFixed(1)}
              </div>
              <div className="text-xs uppercase font-mono text-slate-500 mt-1">MW</div>
              {/* Mini sparkline decoration */}
              <div className="mt-3 flex items-end gap-0.5 h-6">
                {[0.6, 0.8, 0.7, 0.9, 0.75, 1.0, 0.85, currentPower / 120].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500/30 rounded-sm transition-all"
                    style={{ height: `${Math.min(100, v * 100)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Efficiency */}
            <div
              onClick={() =>
                openMetricDrilldown('labyrinth', 'Hydraulic Efficiency', efficiency, '%', {
                  warning: 85,
                  critical: 80,
                })
              }
              className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-500/50 hover:shadow-green-500/10 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Efficiency
                </span>
              </div>
              <div
                className={`text-3xl font-bold font-mono tabular-nums ${getMetricColor(efficiency, { good: 88, warning: 80 })}`}
              >
                {efficiency.toFixed(1)}%
              </div>
              <div className="text-xs uppercase font-mono text-slate-500 mt-1">hydraulic</div>
              {isOffline && (
                <div className="text-[9px] font-mono text-amber-500/60 mt-1">↺ cached data</div>
              )}

              {/* Cavitation Risk Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-mono text-slate-400">
                    Cavitation Risk
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      cavitationRisk > 70
                        ? 'text-red-400'
                        : cavitationRisk > 40
                          ? 'text-amber-400'
                          : 'text-green-400'
                    }`}
                  >
                    {cavitationRisk.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cavitationRisk > 70
                        ? 'bg-red-500'
                        : cavitationRisk > 40
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${cavitationRisk}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sovereign Pulse Index */}
            <div
              onClick={() =>
                openMetricDrilldown('oilTan', 'Sovereign Pulse Index', pulseIndex, '%', {
                  warning: 85,
                  critical: 75,
                })
              }
              className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sovereign Pulse
                </span>
              </div>
              <div
                className={`text-3xl font-bold font-mono tabular-nums ${getMetricColor(pulseIndex, { good: 95, warning: 85 })}`}
              >
                {pulseIndex.toFixed(0)}
              </div>
              <div className="text-xs uppercase font-mono text-slate-500 mt-1">index</div>
            </div>

            {/* Hourly Loss */}
            <div
              onClick={() =>
                openMetricDrilldown('overhaul', 'Financial Loss Rate', hourlyLossEuro, '€/h', {
                  warning: 500,
                  critical: 1000,
                })
              }
              className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-500/50 hover:shadow-red-500/10 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hourly Loss
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-red-400 tabular-nums">
                €{hourlyLossEuro.toFixed(2)}
              </div>
              <div className="text-xs uppercase font-mono text-slate-500 mt-1">per hour</div>
            </div>
          </div>

          {/* Middle Row: ScadaCore (2/3) + Sidebar Stack (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* ScadaCore - 2 columns */}
            <div className="lg:col-span-2">
              <div className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-lg h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white tracking-tight">SCADA Core</h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse-soft"></span>
                    <span className="text-xs text-cyan-400 font-black uppercase tracking-wider">
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="flex-grow min-h-[384px]">
                  <ScadaCore forensicMode={isForensicMode} />
                </div>
              </div>
            </div>

            {/* Right-hand side stack - 1 column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <SovereignLedgerPanel />
              {isForensicMode ? (
                <div className="h-full flex-grow">
                  <VisionAnalyzer />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <FinancialHealthPanel />

                  {/* Sandbox Trigger */}
                  <div className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => setIsSandboxOpen(true)}
                      className="w-full py-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-700/50 transition-all group hover:border-cyan-500/30"
                    >
                      <Sliders className="w-5 h-5 text-green-400 group-hover:rotate-180 transition-transform duration-700" />
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-green-400">
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
        onCommit={vals => {
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
              <h3 className="text-status-error font-bold mb-2 uppercase tracking-widest text-sm">
                Active Protections
              </h3>
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
              <KillSwitch isActive={true} onEngage={() => {}} />
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
