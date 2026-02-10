
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Lightbulb, AlertTriangle, ArrowRight, X, FileText, Wrench, Zap } from 'lucide-react';
import { ForensicVisualizer } from '../components/dashboard/ForensicVisualizer';
import { AncestralOracleService, WisdomTooltip, ANCESTRAL_PATTERNS } from '../services/AncestralOracleService';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { ForensicReportService } from '../services/ForensicReportService';
import { AlignmentWizard } from '../components/forensics/AlignmentWizard';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';

// Mapping Visualizer Types to Oracle Patterns for "Contextual Wisdom"
const CONTEXT_MAP: Record<string, keyof typeof ANCESTRAL_PATTERNS> = {
    'ALIGNMENT': 'MISALIGNMENT_2X',
    'GAP': 'CAVITATION_SIGMA',
    'ELECTRICAL': 'SHAFT_CURRENT',
    'TORQUE_M36': 'LOOSENESS_PHASE',
    'TORQUE_M24': 'LOOSENESS_PHASE',
    'CAVITATION': 'CAVITATION_SIGMA'
};

const ForensicHub: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'GENERATOR' | 'RUNNER' | 'OVERVIEW'>('OVERVIEW');
    const [selectedContext, setSelectedContext] = useState<{ component: string; value?: string } | null>(null);
    const [wisdomFeed, setWisdomFeed] = useState<WisdomTooltip[]>([]);
    const [showAlignmentWizard, setShowAlignmentWizard] = useState(false);
    
    // NC-13800: STRESS TEST STATE
    const [simSigma, setSimSigma] = useState<number | null>(null);
    const [simEff, setSimEff] = useState<number | null>(null);
    const [simRpm, setSimRpm] = useState<number | null>(null);
    const [calculatedLoss, setCalculatedLoss] = useState<string | null>(null);

    // Telemetry & Alarms
    const activeAlarms = useTelemetryStore(state => state.activeAlarms);
    const telemetry = useTelemetryStore(state => ({ mechanical: state.mechanical, hydraulic: state.hydraulic }));
    
    // Effective Values (Live + Sim)
    const rpm = simRpm !== null ? simRpm : (telemetry.mechanical?.rpm || 0);
    const effectiveTelemetry = {
        ...telemetry,
        hydraulic: {
            ...telemetry.hydraulic,
            sigma: simSigma !== null ? simSigma : (telemetry.hydraulic as any)?.sigma,
            efficiency: simEff !== null ? simEff : telemetry.hydraulic?.efficiency
        }
    };

    // 1. Reactive Wisdom Feed (Based on Alarms & Telemetry)
    useEffect(() => {
        // Consult Oracle whenever alarms change
        const alarmCodes = activeAlarms.map(a => a.message.includes('MECHANICAL') ? 'SOVEREIGN_MECHANICAL_ALARM' : a.id);
        const tip = AncestralOracleService.consult(alarmCodes, effectiveTelemetry);
        
        if (tip) {
            addWisdom(tip);
        }
    }, [activeAlarms, effectiveTelemetry, simSigma]); // Depend on effectiveTelemetry to catch sim updates

    const addWisdom = (tip: WisdomTooltip) => {
        setWisdomFeed(prev => {
            // Avoid duplicates
            if (prev.some(t => t.id === tip.id)) return prev;
            return [tip, ...prev].slice(0, 5); // Keep last 5
        });
    };

    const handleHotspotSelect = (id: string, context: any) => {
        // 0. Check for Drill-Down Action
        if (context.drillDown) {
            setActiveTab(context.drillDown);
            return;
        }

        // 1. Update Knowledge Panel Context
        setSelectedContext({
            component: context.label,
            value: context.value
        });

        // 2. Trigger Oracle Fly-In (Drill-Down Logic)
        const label = context.label.toUpperCase();
        let oracleKey: keyof typeof ANCESTRAL_PATTERNS | undefined;
        
        if (label.includes('ALIGNMENT') || label.includes('BEARING')) oracleKey = 'MISALIGNMENT_2X';
        else if (label.includes('GAP') || label.includes('CAVITATION')) oracleKey = 'CAVITATION_SIGMA';
        else if (label.includes('TORQUE') || label.includes('ANCHOR') || label.includes('COVER')) oracleKey = 'LOOSENESS_PHASE';
        else if (label.includes('GROUND') || label.includes('ELECTRICAL')) oracleKey = 'SHAFT_CURRENT';

        if (oracleKey) {
            const wisdom = AncestralOracleService.getWisdom(oracleKey);
            addWisdom({
                ...wisdom,
                id: `${wisdom.id}-${Date.now()}` // Unique ID for animation
            });
        }
    };

    const removeWisdom = (id: string) => {
        setWisdomFeed(prev => prev.filter(t => t.id !== id));
    };

    const handleGenerateReport = async () => {
        const currentEff = effectiveTelemetry.hydraulic?.efficiency || 0.94;
        const targetEff = 0.92;
        
        // NC-13800: Financial Loss Logic
        if (currentEff < targetEff) {
            const powerMW = 5.2;
            const priceEur = 65;
            const lossMWh = (targetEff - currentEff) * powerMW;
            const lossEur = lossMWh * priceEur;
            setCalculatedLoss(`EFFICIENCY ALERT: ${currentEff.toFixed(2)} < ${targetEff}. HOURLY LOSS: €${lossEur.toFixed(2)}`);
        } else {
            setCalculatedLoss(null);
        }

        const reportData = {
            assetName: "Unit 1 - Francis (Forensic Audit)",
            kpis: {
                capex: 12000000,
                revenue: 2500000,
                opex: 150000,
                roi: 18.5,
                lcoe: 45.2,
                payback: 4.8,
                powerMW: 5.2,
                energyGWh: 38.5
            },
            assumptions: {
                electricityPrice: 0.065,
                interestRate: 4.5,
                lifespan: 40,
                opexPercent: 1.5
            }
        };

        const service = new ForensicReportService();
        const blob = service.generateFinancialProspectus({
            ...reportData,
            t: t as any // Type assertion for i18n
        });

        // Trigger download
        ForensicReportService.openAndDownloadBlob(blob, `Forensic_Report_${Date.now()}.pdf`, true);
    };

    return (
        <div className="w-full h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            {/* HEADER */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                        <Activity className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter">Forensic Hub</h1>
                        <p className="text-xs text-slate-400 font-mono">NC-13200 Command Center</p>
                    </div>
                </div>

                {/* NC-13800: STRESS TEST CONTROLS */}
                <div className="flex items-center gap-2 px-4 py-1 bg-black/40 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Stress Test:</span>
                    <button 
                        onClick={() => setSimSigma(prev => prev === 1.1 ? null : 1.1)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simSigma === 1.1 ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        SIGMA 1.1
                    </button>
                    <button 
                        onClick={() => setSimEff(prev => prev === 0.88 ? null : 0.88)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simEff === 0.88 ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        EFF 0.88
                    </button>
                    <button 
                        onClick={() => setSimRpm(prev => prev === 120 ? null : 120)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${simRpm === 120 ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        RPM 120
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* ALIGNMENT WIZARD TRIGGER */}
                    <button 
                        onClick={() => rpm <= 5 && setShowAlignmentWizard(true)}
                        disabled={rpm > 5}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                            rpm > 5 
                            ? 'bg-red-950/20 border-red-500/50 cursor-not-allowed opacity-80 animate-pulse' 
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                        }`}
                    >
                        <Wrench className={`w-4 h-4 ${rpm > 5 ? 'text-red-500' : 'text-purple-400'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${rpm > 5 ? 'text-red-400' : 'text-white'}`}>
                            {rpm > 5 ? 'LOCKOUT ACTIVE' : 'Alignment Wizard'}
                        </span>
                        {rpm > 5 ? (
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" title="Unsafe: Rotating" />
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Safe: Stopped" />
                        )}
                    </button>

                    {/* REPORT GENERATION */}
                    <button 
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Generate Prospectus</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: VISUALIZER (HOTSPOTS) */}
                <div className="flex-1 relative bg-grid-pattern">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 pointer-events-none" />
                    <ForensicVisualizer 
                        viewMode={activeTab}
                        onHotspotSelect={handleHotspotSelect}
                    />
                    
                    {/* View Controls */}
                    <div className="absolute bottom-8 left-8 flex gap-2">
                        {['OVERVIEW', 'GENERATOR', 'RUNNER'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md border transition-all ${
                                    activeTab === tab 
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                                    : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {tab} View
                            </button>
                        ))}
                    </div>

                    {/* FINANCIAL LOSS OVERLAY */}
                    <AnimatePresence>
                        {calculatedLoss && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="absolute bottom-24 right-8 bg-red-950/80 border border-red-500 backdrop-blur-xl p-4 rounded-xl shadow-2xl max-w-sm"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <h3 className="text-sm font-black text-white uppercase">Revenue Hemorrhage</h3>
                                </div>
                                <div className="text-xs font-mono text-red-200">
                                    {calculatedLoss}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: INTELLIGENCE FEED (ANCESTRAL ORACLE) */}
                <div className="w-96 border-l border-slate-800 bg-slate-900/30 backdrop-blur-sm p-6 flex flex-col gap-6">
                    {/* Context Panel */}
                    <div className="h-32">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Active Context</h3>
                        <AnimatePresence mode="wait">
                            {selectedContext ? (
                                <motion.div
                                    key="context"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700"
                                >
                                    <div className="text-cyan-400 font-bold text-lg mb-1">{selectedContext.component}</div>
                                    <div className="text-slate-400 text-sm font-mono">{selectedContext.value || 'Monitoring...'}</div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-slate-600 italic text-sm text-center mt-8"
                                >
                                    Select a hotspot to analyze...
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Wisdom Feed */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <h3 className="text-xs font-black text-amber-500/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            Ancestral Oracle Feed
                        </h3>
                        
                        <div className="space-y-3">
                            <AnimatePresence>
                                {wisdomFeed.map((tip) => (
                                    <motion.div
                                        key={tip.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className={`p-4 rounded-xl border relative overflow-hidden group ${
                                            tip.severity === 'CRITICAL' ? 'bg-red-950/20 border-red-500/30' : 
                                            tip.severity === 'WARNING' ? 'bg-amber-950/20 border-amber-500/30' : 
                                            'bg-slate-800/50 border-slate-700'
                                        }`}
                                    >
                                        <button 
                                            onClick={() => removeWisdom(tip.id)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>

                                        <div className="flex items-center gap-2 mb-2">
                                            {tip.severity === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                                            <span className={`text-xs font-bold uppercase ${
                                                tip.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                                            }`}>{tip.title}</span>
                                        </div>
                                        
                                        <p className="text-sm text-slate-300 mb-3 leading-relaxed">{tip.message}</p>
                                        
                                        {tip.standard && (
                                            <div className="text-[10px] text-slate-500 font-mono mb-2">
                                                REF: {tip.standard}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold group-hover:underline cursor-pointer">
                                            <span>Action: {tip.action}</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {wisdomFeed.length === 0 && (
                                <div className="text-center text-slate-600 text-xs py-8 border border-dashed border-slate-800 rounded-xl">
                                    Oracle Silent. System Nominal.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ALIGNMENT WIZARD MODAL */}
            <AnimatePresence>
                {showAlignmentWizard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAlignmentWizard(false)}
                                    className="absolute -top-4 -right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10 border border-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <AlignmentWizard 
                                    sessionId={`SESSION-${Date.now()}`}
                                    onComplete={() => {
                                        setShowAlignmentWizard(false);
                                        addWisdom({
                                            id: `ALIGN-COMPLETE-${Date.now()}`,
                                            title: 'Maintenance Complete',
                                            message: 'Shaft alignment protocol successfully recorded.',
                                            action: 'Archive Report',
                                            severity: 'INFO'
                                        });
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ForensicHub;
