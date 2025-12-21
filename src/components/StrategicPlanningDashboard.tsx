// Strategic Planning Dashboard (CEREBRO EDITION)
// Integrated Project Environment with Contextual Advisory & Granular Control

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Truck, FileCheck, AlertTriangle, TrendingUp, DollarSign, Activity, Anchor, Zap, Shield, Settings, Info } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { StrategicPlanningService, SiteParameters, Bid, ImpactAnalysis } from '../services/StrategicPlanningService';
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
import { HydraulicsPanel } from './cerebro/panels/HydraulicsPanel'; // Assuming this exists or using placeholder


export const StrategicPlanningDashboard: React.FC = () => {
    // TABS: Deep Granularity
    const [activeTab, setActiveTab] = useState<'LOCATION' | 'HYDRAULICS' | 'TURBINE' | 'ELECTRO' | 'ECONOMY'>('HYDRAULICS');
    const [isCalibrating, setIsCalibrating] = useState(false);

    // Initial Load
    const [siteParams, setSiteParams] = useState<SiteParameters>(() => {
        const stored = LifecycleManager.getActiveProject()?.genesis?.siteParams;
        const defaults: SiteParameters = {
            grossHead: 45, pipeLength: 1200, pipeDiameter: 1600, pipeMaterial: 'GRP',
            wallThickness: 12, boltClass: '8.8', corrosionProtection: 'PAINT',
            waterQuality: 'CLEAN', ecologicalFlow: 0.5, flowDurationCurve: []
        };
        return stored ? { ...defaults, ...stored } : defaults;
        // Merge defaults to ensure new fields (wallThickness etc) exist if loading old DNA.
    });

    // Math & Impact State
    const [feasibility, setFeasibility] = useState(StrategicPlanningService.calculateFeasibility(siteParams));
    const [impact, setImpact] = useState<ImpactAnalysis>(StrategicPlanningService.validateImpact(siteParams));

    // --- CEREBRO LOGIC LOOP ---
    useEffect(() => {
        const timer = setTimeout(() => {
            const featResults = StrategicPlanningService.calculateFeasibility(siteParams);
            const impactResults = StrategicPlanningService.validateImpact(siteParams);

            setFeasibility(featResults);
            setImpact(impactResults);

            // Persist to DNA (Memory Loop)
            const proj = LifecycleManager.getActiveProject();
            if (proj) {
                proj.genesis.siteParams = siteParams;
                proj.genesis.feasibility = featResults;
            }
            setIsCalibrating(false);
        }, 300);

        setIsCalibrating(true);
        return () => clearTimeout(timer);
    }, [
        siteParams.grossHead, siteParams.pipeDiameter, siteParams.pipeLength, siteParams.wallThickness,
        siteParams.boltClass, siteParams.corrosionProtection, siteParams.pipeMaterial
    ]);

    // Handlers
    const handleParamChange = (name: keyof SiteParameters, value: any) => {
        setSiteParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleParamChange(e.target.name as any, parseFloat(e.target.value));
    };

    return (
        <div className={`min-h-screen grid grid-cols-12 gap-0 ${THEME.bg} text-slate-200 font-sans overflow-hidden`}>

            {/* LEFT: MAIN WORKSPACE (Cols 1-9) */}
            <div className={`col-span-9 p-8 flex flex-col h-screen overflow-y-auto ${THEME.bg}`}>

                {/* HEADER (Keep KPIs) */}
                <header className="mb-6 flex justify-between items-end border-b border-white/5 pb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">
                            Project <span className={THEME.accent}>Cerebro</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase flex items-center gap-2">
                            <span className={isCalibrating ? "text-amber-500 animate-pulse" : "text-emerald-500"}>
                                {isCalibrating ? "PHYSICS ENGINE RECALCULATING..." : "SYSTEM READY"}
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
                                            <SliderGroup label="Gross Head (m)" name="grossHead" value={siteParams.grossHead} min={1} max={500} onChange={handleSlider} />
                                            <SliderGroup label="Diameter (mm)" name="pipeDiameter" value={siteParams.pipeDiameter} min={200} max={2500} step={50} onChange={handleSlider} />
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
                                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                    <Settings className="w-12 h-12 mb-4 opacity-20" />
                                    <h3 className="text-lg font-bold uppercase tracking-widest">Select Component</h3>
                                    <p className="text-xs">Choose a node from the system tree to inspect.</p>
                                </div>
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

                    {/* AI Recommendation */}
                    <div className="p-4 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Aggregates</div>
                        <div className="text-xl font-black text-white">{feasibility.recommendedAggregates.count}x {feasibility.recommendedAggregates.type}</div>
                        <div className="text-xs text-slate-400 mt-2 leading-relaxed opacity-80">{feasibility.recommendedAggregates.reasoning}</div>
                    </div>

                    {/* Impact Warnings */}
                    {impact.warnings.map((warn, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded bg-red-950/10 border border-red-500/30 flex gap-3 items-start"
                        >
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-200 leading-relaxed font-medium">{warn}</p>
                        </motion.div>
                    ))}

                    {/* Pro Tips (Contextual) */}
                    {siteParams.pipeMaterial === 'STEEL' && siteParams.corrosionProtection === 'NONE' && (
                        <div className="p-4 rounded bg-blue-950/10 border border-blue-500/30 flex gap-3 items-start">
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-200 leading-relaxed">
                                <b>Engineer's Note:</b> Bare steel is rarely used in Balkans due to moderate acidity in mountain streams. Highly recommend at least Epoxy Paint.
                            </p>
                        </div>
                    )}

                    {siteParams.boltClass === '4.6' && (
                        <div className="p-4 rounded bg-amber-950/10 border border-amber-500/30 flex gap-3 items-start">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-200 leading-relaxed">
                                <b>Legacy Case #22:</b> Class 4.6 bolts sheared during testing at 'Mala Rijeka'. Ensure strict torque control if budget prevents upgrade to 8.8.
                            </p>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-white/5 bg-[#121212] text-center">
                    <p className="text-[10px] text-slate-600 font-mono">ANOHUB CEREBRO V2.4 Connected</p>
                </div>
            </div>

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
