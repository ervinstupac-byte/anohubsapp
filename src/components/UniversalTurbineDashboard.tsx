import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Gauge, Activity, Radio, Droplet, FlaskConical, Terminal } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard'; // Correct path assumption
import { TurbineFactory, TurbineType, KaplanTurbine, FrancisTurbine, PeltonTurbine, ITurbineBehavior } from '../models/turbine/TurbineFactory';
import { DecisionEngine } from '../services/DecisionEngine';
import { SafetyInterlockEngine } from '../services/SafetyInterlockEngine';
import { ScenarioControl } from './demo/ScenarioControl';
import { SystemAuditLog } from './ui/SystemAuditLog';
import { ForensicDeepDive } from './demo/ForensicDeepDive';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAssetContext } from '../contexts/AssetContext'; // NC-600
import { OptimizationHUD } from '../shared/components/hud/OptimizationHUD';

// Placeholder universal widgets
const VibrationMonitor = () => <div className="p-4 rounded bg-black/20 text-center"><Activity className="mx-auto mb-2 text-cyan-400" />Vibration: 2.4 mm/s</div>;
const TemperatureChart = () => <div className="p-4 rounded bg-black/20 text-center"><Gauge className="mx-auto mb-2 text-amber-400" />Bearing Temp: 65°C</div>;
const AcousticMonitor = () => <div className="p-4 rounded bg-black/20 text-center"><Radio className="mx-auto mb-2 text-fuchsia-400" />Cavitation: 2/10</div>;

export const UniversalTurbineDashboard: React.FC = () => {
    // NC-600: Use AssetContext as Single Source of Truth
    const { selectedAsset, selectAsset } = useAssetContext();

    // NC-700: Demo Type Override (for visual demo only)
    const [demoOverrideType, setDemoOverrideType] = useState<TurbineType | null>(null);

    // Determine active type from global state or demo override
    const activeType = (demoOverrideType || selectedAsset?.turbine_type || selectedAsset?.type || 'FRANCIS').toUpperCase() as TurbineType;

    // State driven by activeType
    const [model, setModel] = useState<ITurbineBehavior>(TurbineFactory.create(activeType));
    const [interlockStatus, setInterlockStatus] = useState(SafetyInterlockEngine.getStatus());

    // NC-500: Commissioning Mode State
    const [isCommissioningMode, setIsCommissioningMode] = useState(false);
    const [forensicModalOpen, setForensicModalOpen] = useState(false);

    // Telemetry store for RCA results
    const rcaResults = useTelemetryStore(state => state.rcaResults);
    const selectedRCA = rcaResults.length > 0 ? rcaResults[0] : null;

    // NC-700: Demo Mode "Sales Layer" State
    const [showSalesOverlay, setShowSalesOverlay] = useState(false);
    const [demoStep, setDemoStep] = useState<string>('');

    // Sync model when type changes
    useEffect(() => {
        setModel(TurbineFactory.create(activeType));
    }, [activeType]);

    // NC-700: Final Proof
    const handleExportPDF = () => {
        setShowSalesOverlay(false); // Hide the tip

        // 1. Show Toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-8 right-8 bg-emerald-950/90 border border-emerald-500 text-emerald-400 p-4 rounded-lg shadow-2xl z-[200] flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500';
        toast.innerHTML = `
            <div class="p-2 bg-emerald-500/20 rounded-full">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
                <h4 class="font-bold text-sm uppercase mb-1">Forensic Report Ready</h4>
                <p class="text-xs text-emerald-100/80">Downloading Proof... <strong>€18,400</strong></p>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);

        // 2. Generate and Download PDF Logic
        import('../services/ForensicReportService').then(({ ForensicReportService }) => {
            const blob = ForensicReportService.generateSovereignDiagnosticAudit({
                unitId: selectedAsset?.name || 'DEMO-UNIT-01',
                rcaResult: {
                    cause: 'Nozzle Erosion -> Hydraulic Imbalance',
                    confidence: 99.2,
                    severity: 'CRITICAL',
                    evidence: ['Vibration Spike > 8.5mm/s', 'Efficiency Drift -2.5%', 'Harmonic Resonance at 18kHz'],
                    recommendation: 'Immediate shut down and nozzle replacement. Verify needle alignment.'
                },
                baselineData: {
                    runnerMaterial: 'Stainless Steel 13Cr4Ni',
                    ceramicCoatingApplied: true,
                    commissioningDate: '2023-01-15'
                },
                telemetrySnapshot: {
                    vibrationX: 8.5,
                    vibrationY: 4.2,
                    bearingTemp: 78,
                    efficiency: 89.5
                },
                spectrumBefore: [0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1],
                spectrumAfter: [0.2, 0.3, 0.8, 4.5, 2.1, 0.8, 0.4, 0.2],
                sparklineData: [45, 46, 47, 48, 85, 92, 88, 50, 48, 46],
                fieldTip: {
                    tip: 'Erosion in Pelton nozzles often manifests as high-frequency vibration before efficiency loss.',
                    action: 'Check needle seat integrity.',
                    threshold: '> 4.5 mm/s'
                },
                t: ((k: string) => k) as any
            });
            ForensicReportService.openAndDownloadBlob(blob, 'Sovereign_Diagnostic_Audit.pdf');
        });
    };

    const handleComplete = () => {
        setDemoStep('COMPLETE');
    };

    // NC-700: Demo Event Listeners
    useEffect(() => {
        const handleFault = (e: any) => {
            setShowSalesOverlay(true);
            setDemoStep('FAULT_DETECTED');
            // Auto open forensic modal after short delay for dramatic effect
            setTimeout(() => setForensicModalOpen(true), 1500);
        };

        window.addEventListener('DEMO_FAULT_DETECTED', handleFault);
        window.addEventListener('DEMO_SEQUENCE_COMPLETE', handleComplete);
        return () => {
            window.removeEventListener('DEMO_FAULT_DETECTED', handleFault);
            window.removeEventListener('DEMO_SEQUENCE_COMPLETE', handleComplete);
        };
    }, []); // Removed handleComplete from dependencies to avoid loop, it's stable

    // Dynamic Styles based on turbine
    const colors = model.getColorScheme();

    return (
        <div className={`min-h-screen p-6 transition-colors duration-1000 bg-gradient-to-br ${colors.background} relative`}>

            {/* NC-700: Sales Overlay "The Guide" */}
            <AnimatePresence>
                {showSalesOverlay && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="bg-white text-slate-900 border-l-4 border-red-500 shadow-2xl p-4 rounded-r max-w-sm">
                            <h4 className="font-black text-sm uppercase flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                Sovereign Insight
                            </h4>
                            <p className="text-sm font-medium">
                                "Look here: The system detected the erosion 12 hours before a standard SCADA would trigger a trip."
                            </p>
                            <div className="mt-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                ROI Value: €18,400 Prevented
                            </div>
                        </div>
                        {/* Connection Line */}
                        <div className="w-0.5 h-32 bg-red-500/50 absolute left-0 top-full mx-auto shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP BAR */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                        AnoHUB <span style={{ color: colors.primary }}>OS</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-xs">{selectedAsset?.name || 'VIRTUAL-ASSET-01'}</span>
                        <span className="text-xs uppercase font-bold">• {activeType} CONFIGURATION</span>
                    </div>
                </div>

                {/* Interlock Status */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 ${interlockStatus.status === 'LOCKED' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' :
                    interlockStatus.status === 'UNLOCKED' ? 'border-amber-500 bg-amber-950/40 text-amber-400' :
                        'border-red-500 bg-red-950/40 text-red-100 animate-pulse'
                    }`}>
                    <Shield className="w-5 h-5" />
                    <span className="font-black text-sm uppercase">SCADA {interlockStatus.status}</span>
                </div>

                {/* NC-500: Commissioning Mode Toggle */}
                <button
                    onClick={() => setIsCommissioningMode(!isCommissioningMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase ${isCommissioningMode
                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                        }`}
                >
                    <FlaskConical className="w-4 h-4" />
                    {isCommissioningMode ? 'Exit Testing' : 'Testing Mode'}
                </button>

                {/* NC-700: Master Demo Trigger */}
                <button
                    onClick={() => {
                        import('../services/demo/DemoStorytellerService').then(({ DemoStorytellerService }) => {
                            DemoStorytellerService.runMasterDemo(
                                async (type) => setDemoOverrideType(type),
                                (level, src, msg) => console.log(`[${level}] ${src}: ${msg}`)
                            );
                        });
                    }}
                    className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse"
                >
                    RUN MASTER DEMO
                </button>
            </header>

            {/* MAIN DASHBOARD GRID */}
            <div className="grid grid-cols-12 gap-6">

                {/* LEFT: Universal Metrics (Always present) */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <GlassCard className="p-4 border-l-4" style={{ borderColor: colors.primary }}>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Universal Vitals</h3>
                        <div className="space-y-4">
                            <VibrationMonitor />
                            <TemperatureChart />
                            <AcousticMonitor />
                        </div>
                    </GlassCard>
                </div>

                {/* CENTER: Morphing Area (Turbine Specific) */}
                <div className="col-span-12 lg:col-span-6">
                    <motion.div
                        key={activeType} // Triggers animation on switch
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-full"
                    >
                        <GlassCard className="h-full p-6 relative overflow-hidden">
                            {/* Background Watermark */}
                            <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                                {/* Ideally an SVG of the turbine type */}
                                <h1 className="text-9xl font-black">{activeType[0]}</h1>
                            </div>

                            <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-3">
                                <span style={{ color: colors.primary }}>///</span> {activeType} Specific Diagnostics
                            </h2>

                            {/* KAPLAN SPECIFIC UI */}
                            {activeType === 'KAPLAN' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
                                        <h3 className="text-cyan-400 font-bold mb-2">Blade-Gate Correlation</h3>
                                        <div className="h-32 flex items-center justify-center border-t border-r border-cyan-500/20">
                                            {/* Simulated Curve */}
                                            <svg width="100%" height="100%" viewBox="0 0 100 100">
                                                <path d="M 10,90 Q 50,50 90,10" fill="none" stroke={colors.primary} strokeWidth="2" />
                                                <circle cx="60" cy="40" r="3" fill="white" /> {/* Operating point */}
                                            </svg>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">Deviation: <span className="text-white">0.2°</span> (Optimal)</p>
                                    </div>
                                    <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
                                        <h3 className="text-cyan-400 font-bold mb-2">Draft Tube Vortex</h3>
                                        <div className="text-center py-4">
                                            <span className="text-3xl font-black text-white">0.05</span>
                                            <span className="text-xs block text-slate-500">Pressure Pulsation (bar)</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-emerald-500 w-[20%]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PELTON SPECIFIC UI */}
                            {activeType === 'PELTON' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-lg">
                                        <h3 className="text-fuchsia-400 font-bold mb-4">Multi-Nozzle Force Balance</h3>
                                        <div className="flex justify-between items-end h-32 px-4 pb-2">
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <div key={n} className="flex flex-col items-center gap-1 group">
                                                    <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{90 + Math.random() * 10}%</div>
                                                    <div
                                                        className="w-8 bg-fuchsia-500 rounded-t-sm"
                                                        style={{ height: `${80 + Math.random() * 20}%`, opacity: n === 3 ? 0.6 : 1 }}
                                                    ></div>
                                                    <span className="text-xs font-bold text-slate-300">N{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Anomaly Highlight */}
                                        <p className="text-xs text-amber-400 mt-2 font-bold text-center">⚠️ Nozzle 3: Possible Tip Erosion detected</p>
                                    </div>
                                </div>
                            )}

                            {/* FRANCIS SPECIFIC UI */}
                            {activeType === 'FRANCIS' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                                        <h3 className="text-emerald-400 font-bold mb-2">Labyrinth Seal Leakage</h3>
                                        <div className="text-center py-2">
                                            <span className="text-2xl font-black text-white">12.4</span>
                                            <span className="text-xs block text-slate-500">L/min</span>
                                        </div>
                                        <p className="text-xs text-emerald-300 text-center mt-1">✓ Within limits</p>
                                    </div>
                                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                                        <h3 className="text-emerald-400 font-bold mb-2">Vortex Rope Monitor</h3>
                                        <div className="flex items-center justify-center h-20">
                                            <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin"></div>
                                        </div>
                                        <p className="text-center text-xs text-slate-400">Stable Core</p>
                                    </div>
                                </div>
                            )}

                        </GlassCard>
                    </motion.div>
                </div>

                {/* RIGHT: Decision Engine & Safety */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    {/* AI BRAIN */}
                    <GlassCard className="p-4 bg-purple-950/20 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                            <h3 className="text-sm font-bold text-purple-300 uppercase">Decision Engine</h3>
                        </div>
                        <p className="text-sm text-white font-medium mb-2">
                            "System optimal. No anomalous patterns detected in last 24h."
                        </p>
                        <div className="text-xs text-slate-400 mt-3 p-2 bg-black/30 rounded">
                            Last Logic Check: {new Date().toLocaleTimeString()}
                        </div>
                    </GlassCard>

                    {/* SAFETY GUARD */}
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-300 uppercase">Hardware Verify</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                            12mm-to-16mm Safety Guard Active. Simulation required for any hydraulic changes.
                        </p>
                        <button className="w-full py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded hover:bg-slate-700 transition">
                            SIMULATE CHANGE
                        </button>
                    </GlassCard>

                    {/* NC-500: Scenario Control (Commissioning Mode Only) */}
                    <AnimatePresence>
                        {isCommissioningMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ScenarioControl className="mt-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* NC-500: RCA Detection Alert (when results available) */}
                    {selectedRCA && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                        >
                            <GlassCard className="p-4 bg-red-950/30 border border-red-500/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <h3 className="text-sm font-bold text-red-300 uppercase">Anomaly Detected</h3>
                                </div>
                                <p className="text-sm text-white font-medium mb-2">
                                    {selectedRCA.cause}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-red-400">{selectedRCA.confidence}% Confidence</span>
                                    <button
                                        onClick={() => setForensicModalOpen(true)}
                                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition font-bold"
                                    >
                                        INVESTIGATE
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>

            </div>

            {/* NC-500: System Audit Log (Footer Area) */}
            <div className="mt-6">
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-slate-300 uppercase">System Audit Log</h3>
                        <span className="ml-auto text-xs text-slate-500">Real-time diagnostic feed</span>
                    </div>
                    <SystemAuditLog maxEntries={5} />
                </GlassCard>
            </div>

            {/* NC-500: Forensic Deep Dive Modal */}
            <ForensicDeepDive
                result={selectedRCA}
                isOpen={forensicModalOpen}
                onClose={() => setForensicModalOpen(false)}
                onExportPDF={handleExportPDF}
            />
            <OptimizationHUD variant="overlay" />
        </div>
    );
};
