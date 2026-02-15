// Strategic Planning Dashboard (CEREBRO EDITION)
// Integrated Project Environment with Contextual Advisory & Granular Control

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // i18n
import { formatNumber } from '../utils/i18nUtils'; // Data Localization
import { ProfessionalReportEngine } from '../features/reporting/ProfessionalReportEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Truck, FileCheck, AlertTriangle, TrendingUp, DollarSign, Activity, Anchor, Zap, Shield, Settings, Info, FileText } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { StrategicPlanningService, SiteParameters, Bid, ImpactAnalysis, FeasibilityResult } from '../services/StrategicPlanningService';
import { LifecycleManager } from '../services/LifecycleManager';

const THEME = {
    bg: 'bg-[#121212]',
    accent: 'text-[#2dd4bf]',
    border: 'border-white/10',
    glass: 'backdrop-blur-md bg-white/5 border-white/10',
    highlight: 'bg-[#2dd4bf]/10 border-[#2dd4bf]/50'
};

import { ComponentTree } from './cerebro/ComponentTree';
import { MechanicalPanel } from './cerebro/panels/MechanicalPanel';
import { HydraulicsPanel } from './cerebro/panels/HydraulicsPanel';
import { LiveMathSync, SystemHealth } from '../services/LiveMathSync'; // Engine
import { LiveHUD } from './cerebro/LiveHUD'; // HUD
import { ToastSystem } from '../shared/components/ui/ToastSystem'; // Legacy Guard
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { DEFAULT_TECHNICAL_STATE } from '../core/TechnicalSchema';

export const StrategicPlanningDashboard: React.FC = () => {
    // Telemetry Store (Replaces Context)
    const { 
        site, 
        penstock, 
        mechanical, 
        hydraulic, 
        physics, 
        identity,
        setConfig 
    } = useTelemetryStore();
    const { t, i18n: { language } } = useTranslation();

    // Construct TechnicalProjectState for compatibility
    const technicalState = React.useMemo(() => ({
        ...DEFAULT_TECHNICAL_STATE,
        site,
        penstock,
        mechanical,
        hydraulic,
        physics: {
            ...DEFAULT_TECHNICAL_STATE.physics,
            boltSafetyFactor: physics?.boltSafetyFactor ?? DEFAULT_TECHNICAL_STATE.physics.boltSafetyFactor,
            boltLoadKN: physics?.boltLoadKN ?? DEFAULT_TECHNICAL_STATE.physics.boltLoadKN,
            boltCapacityKN: physics?.boltCapacityKN ?? DEFAULT_TECHNICAL_STATE.physics.boltCapacityKN,
            hoopStressMPa: physics?.hoopStressMPa ?? DEFAULT_TECHNICAL_STATE.physics.hoopStressMPa,
            staticPressureBar: physics?.staticPressureBar ?? DEFAULT_TECHNICAL_STATE.physics.staticPressureBar,
            surgePressureBar: physics?.surgePressureBar ?? DEFAULT_TECHNICAL_STATE.physics.surgePressureBar,
            waterHammerPressureBar: physics?.waterHammerPressureBar ?? DEFAULT_TECHNICAL_STATE.physics.waterHammerPressureBar,
            eccentricity: physics?.eccentricity ?? DEFAULT_TECHNICAL_STATE.physics.eccentricity,
        },
        identity
    }), [site, penstock, mechanical, hydraulic, physics, identity]);

    const updateSiteConditions = (updates: any) => {
        // Map updates to site config
        setConfig({ site: { ...site, ...updates } });
    };

    const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);

    // TABS: Deep Granularity
    const [activeTab, setActiveTab] = useState<string>('HYDRAULICS');
    const [isCalibrating, setIsCalibrating] = useState(false);

    // LiveMathSync Hook (Reactive Physics)
    const systemHealth = React.useMemo(() => {
        setIsCalibrating(true);
        // Use a timeout to simulate calculation "effort" if needed.
        const health = LiveMathSync.calculateSystemHealth(
            {
                grossHead: technicalState.site.grossHead,
                pipeLength: technicalState.penstock.length,
                pipeDiameter: technicalState.penstock.diameter,
                pipeMaterial: technicalState.penstock.material as any,
                wallThickness: technicalState.penstock.wallThickness,
                boltClass: technicalState.mechanical.boltSpecs.grade as any,
                corrosionProtection: 'PAINT',
                waterQuality: technicalState.site.waterQuality as any,
                ecologicalFlow: 0.5,
                flowDurationCurve: []
            },
            technicalState as any // Cast for now until Schema is fully synced
        );
        setTimeout(() => setIsCalibrating(false), 300); // Visual debounce
        return health;
    }, [technicalState]);

    // Toast Alerts (Legacy Guard)
    const activeAlerts = React.useMemo(() => {
        const alerts = [];
        if (systemHealth.analysis.cavitationRisk) alerts.push("Potential Cavitation detected! High velocity at low head.");
        if (technicalState.physics.boltSafetyFactor < 1.5) alerts.push("Bolt Safety Factor Critical (<1.5). Increase Grade or Torque.");
        return alerts;
    }, [systemHealth, technicalState.physics.boltSafetyFactor]);


    // Initial Load - Managed by Context now, but keeping local feasibility sync for legacy parts
    useEffect(() => {
        // Create temporary siteParams from technicalState to feed legacy service
        const tempParams: SiteParameters = {
            grossHead: technicalState.site.grossHead,
            pipeLength: technicalState.penstock.length,
            pipeDiameter: technicalState.penstock.diameter,
            pipeMaterial: technicalState.penstock.material as any,
            wallThickness: technicalState.penstock.wallThickness,
            boltClass: technicalState.mechanical.boltSpecs.grade as any,
            corrosionProtection: 'PAINT', // Default
            waterQuality: technicalState.site.waterQuality as any,
            ecologicalFlow: 0.5,
            flowDurationCurve: []
        };

        setFeasibility(StrategicPlanningService.calculateFeasibility(tempParams));
        setImpact(StrategicPlanningService.validateImpact(tempParams));

    }, [technicalState]);

    const [impact, setImpact] = useState<ImpactAnalysis & { recommendations?: any[] }>({ warnings: [], recommendations: [], safetyFactor: 0, hoopStressMPa: 0, boltStressStatus: 'OK', corrosionRisk: 'LOW', lifespanEstimateyears: 50 });

    // Handlers
    const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Map slider changes to context updates
        const name = e.target.name;
        const val = parseFloat(e.target.value);
        if (name === 'grossHead') updateSiteConditions({ grossHead: val });
        // Add other mappings as needed
    };

    return (
        <div className={`min-h-screen grid grid-cols-12 gap-0 ${THEME.bg} text-slate-200 font-sans overflow-hidden`}>

            {/* LEFT: MAIN WORKSPACE (Cols 1-9) */}
            <div className={`col-span-9 p-8 flex flex-col h-screen overflow-y-auto ${THEME.bg}`}>

                {/* HEADER (Keep KPIs) */}
                <header className="mb-6 flex justify-between items-end border-b border-white/5 pb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">
                            {t('hpp.title', 'Project Cerebro')} <span className={THEME.accent}>V2.5</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase flex items-center gap-2">
                            <span className={isCalibrating ? "text-amber-500 animate-pulse" : "text-emerald-500"}>
                                {isCalibrating ? t('hpp.recalculating', 'PHYSICS ENGINE RECALCULATING...') : t('hpp.physics_ready', 'SYSTEM READY')}
                            </span>
                        </p>
                    </div>
                </header>

                {/* NEW SPLIT LAYOUT: TREE + WORKBENCH */}
                <div className="flex h-[calc(100vh-160px)] border border-white/5 rounded-lg overflow-hidden">

                    {/* LEFT: COMPONENT TREE */}
                    <ComponentTree
                        selectedId={activeTab}
                        onSelect={(id: any) => setActiveTab(id)}
                    />

                    {/* CENTER: WORKBENCH PANEL */}
                    <div className="flex-1 bg-black/20 p-8 overflow-y-auto relative">
                        <AnimatePresence mode="wait">

                            {/* HYDRAULICS / PENSTOCK */}
                            {(activeTab === 'HYDRAULICS' || activeTab === 'PENSTOCK') && (
                                <motion.div
                                    key="HYDRAULICS"
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                    className="h-full"
                                >
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Hydraulic Geometry</h2>
                                        <p className="text-sm text-slate-400">Define head, flow, and material physics.</p>
                                    </div>
                                    <HydraulicsPanel />

                                    {/* Keep the Slider Group as 'Quick Adjust' below the panel if needed, or integrate into Panel */}
                                    <div className="mt-8 pt-8 border-t border-white/10">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Quick Adjust</h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            <SliderGroup label="Gross Head (m)" name="grossHead" value={technicalState.site.grossHead} min={1} max={500} onChange={handleSlider} />
                                            {/* Diameter is now in Penstock panel mostly, but keeping for quick access if needed */}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* MECHANICAL / BOLTS  */}
                            {(activeTab === 'MECHANICAL' || activeTab === 'BOLTS') && (
                                <motion.div
                                    key="MECHANICAL"
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Mechanical Integrity</h2>
                                        <p className="text-sm text-slate-400">Manage connections, bolts, and alignment tolerances.</p>
                                    </div>
                                    <MechanicalPanel />
                                </motion.div>
                            )}

                            {/* DEFAULT EMPTY STATE */}
                            {!['HYDRAULICS', 'PENSTOCK', 'MECHANICAL', 'BOLTS'].includes(activeTab) && (
                                <motion.div
                                    key="EMPTY_STATE"
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-slate-600"
                                >
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                        <span className="text-2xl font-black text-white font-mono">
                                            {formatNumber(feasibility?.annualProductionMWh || 0, language, 1)} <span className="text-sm text-slate-500">GWh</span>
                                        </span>
                                        <div className="text-[10px] text-slate-500 uppercase mt-1">{t('physics.annualProd', 'Annual Production')}</div>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 rounded border border-white/5 mt-4">
                                        <span className="text-2xl font-black text-white font-mono">
                                            {formatNumber(impact?.safetyFactor || 0, language, 2)}x
                                        </span>
                                        <div className="text-[10px] text-slate-500 uppercase mt-1">Global Safety Factor</div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                </div>

                {/* DYNAMIC WORKSPACE CONTENT */}
                {/* Replaced by Split Layout above */}
            </div>

            {/* RIGHT: CONTEXTUAL ADVISORY (Side-Brain) (Cols 10-12) */}
            <div className="col-span-3 border-l border-white/10 bg-[#0a0a0a] p-0 flex flex-col h-screen">
                <div className="p-6 border-b border-white/5 bg-[#121212]">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Live Advisory
                    </h2>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">

                    <div className="md:col-span-1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => ProfessionalReportEngine.generateTechnicalAudit(technicalState)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl border border-slate-700 flex flex-col items-center gap-2 group"
                        >
                            <FileText className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                            <span className="text-xs uppercase tracking-widest">{t('common.generatePDF', 'PDF Generieren')}</span>
                        </motion.button>

                        <div className="mt-4 bg-slate-900 p-4 rounded-xl border border-white/5 space-y-3">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Head Analysis</h3>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Gross Head (Hg)</span>
                                <span className="text-white font-mono">{formatNumber(technicalState.site.grossHead, language, 1)} m</span>
                            </div>

                            <div className="flex justify-between items-center text-xs text-amber-500">
                                <span className="font-bold">Total Loss (hf)</span>
                                <span className="font-mono">-{formatNumber(feasibility?.frictionLoss || 0, language, 2)} m</span>
                            </div>

                            <div className="h-px bg-white/5 my-1" />

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Net Head (Hn)</span>
                                <span className="text-white font-black font-mono">{formatNumber(feasibility?.netHead || 0, language, 2)} m</span>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-1">
                                    <span>Relative Efficiency</span>
                                    <span>{((feasibility?.netHead || 1) / (technicalState.site.grossHead || 1) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500"
                                        style={{ width: `${(feasibility?.netHead || 0) / (technicalState.site.grossHead || 1) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation & Alerts */}
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-lg">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">{t('common.advice', 'Actionable Advice')}</h3>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-emerald-500/10 rounded-full">
                                <Truck className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-emerald-400 mb-1">
                                    {feasibility?.recommendedAggregates.count}x {feasibility?.recommendedAggregates.type}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {t(feasibility?.recommendedAggregates.reasoning || '')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {impact?.warnings.map((w, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-300 font-mono">
                                        {typeof w === 'string' ? w : String(t(w.key, w.params))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tips (Contextual) - Accessing deep state */}
                    {technicalState.penstock.material === 'STEEL' && technicalState.site.waterQuality !== 'CLEAN' && (
                        <div className="p-4 rounded bg-blue-950/10 border border-blue-500/30 flex gap-3 items-start">
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-200 leading-relaxed">
                                <b>Engineer's Note:</b> Bare steel is rarely used in Balkans due to moderate acidity in mountain streams. Highly recommend at least Epoxy Paint.
                            </p>
                        </div>
                    )}

                    {technicalState.mechanical.boltSpecs.grade === '4.6' && (
                        <div className="p-4 rounded bg-amber-950/10 border border-amber-500/30 flex gap-3 items-start">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-200 leading-relaxed">
                                <b>Legacy Case #22:</b> Class 4.6 bolts sheared during testing at 'Mala Rijeka'. Ensure strict torque control if budget prevents upgrade to 8.8.
                            </p>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-white/5 bg-[#121212] text-center">
                    <p className="text-[10px] text-slate-600 font-mono">ANOHUB CEREBRO V2.5 LiveMath</p>
                </div>
            </div>

            {/* LIVE HUD OVERLAY */}
            <LiveHUD health={systemHealth} />

            {/* LEGACY GUARD TOASTS */}
            <ToastSystem alerts={activeAlerts} />

        </div>
    );
};

// --- COMPONENTS ---

const KPIMini = ({ label, value, unit, color = "text-white" }: any) => (
    <div className="flex flex-col">
        <span className="text-[10px] uppercase text-slate-500 font-bold">{label}</span>
        <span className={`text-lg font-black font-mono ${color}`}>{value} <span className="text-xs text-slate-600">{unit}</span></span>
    </div>
);

const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-4">
        <Icon className="w-4 h-4 text-[#2dd4bf]" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
);

const SliderGroup = ({ label, value, min, max, step = 1, onChange, name }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase">{label}</span>
            <span className="text-[#2dd4bf] font-mono">{value}</span>
        </div>
        <input
            type="range" name={name} min={min} max={max} step={step} value={value} onChange={onChange}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2dd4bf] hover:accent-emerald-400 transition-colors"
        />
    </div>
);

const Selector = ({ label, value, options, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((opt: string) => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`px-3 py-2 rounded text-[10px] font-bold uppercase transition-all border ${value === opt
                        ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-[#2dd4bf]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);
