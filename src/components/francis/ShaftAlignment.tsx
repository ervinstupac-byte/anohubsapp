import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { useAudit } from '../../contexts/AuditContext';
import { useDocumentViewer } from '../../contexts/DocumentContext';
import { ForensicReportService } from '../../services/ForensicReportService';
import { ShaftOrbitPlot, ShaftOrbitPlotHandle } from '../../features/telemetry/components/ShaftOrbitPlot';
import { useCerebro } from '../../contexts/ProjectContext';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';
import { Activity, Zap, Sun, Footprints, AlertTriangle, CheckCircle, Database, FileSearch, Ruler, ArrowLeft, RotateCw, Info, ShieldCheck, Microscope, Target, Calculator, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';
import { AlignmentVisualizer } from '../ui/AlignmentVisualizer';
import { InfoTooltip } from '../ui/InfoTooltip'; // NEW
import { useDensity } from '../../stores/useAppStore'; // NEW
import { SPACING, SPACING_COMPACT } from '../../shared/design-tokens';

// --- API 686 / ISO 10816 CONSTANTS ---
const RPM_TIERS = [
    { max: 1000, offset: 3.0, angShort: 1.0, angSpacer: 0.5 }, // Offset in mils, Ang in mils/in
    { max: 1800, offset: 2.0, angShort: 0.5, angSpacer: 0.4 },
    { max: 3600, offset: 1.0, angShort: 0.3, angSpacer: 0.3 },
    { max: 99999, offset: 0.5, angShort: 0.2, angSpacer: 0.2 },
];

export const ShaftAlignment: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logAction } = useAudit();
    const { viewDocument } = useDocumentViewer();
    const { state, dispatch } = useCerebro();
    const { orbit: orbitAnalysis, vibration } = useEngineeringMath();
    const { densityMode } = useDensity(); // NEW
    const spacing = densityMode === 'compact' ? SPACING_COMPACT : SPACING;
    const [confirmedSteps, setConfirmedSteps] = useState<string[]>([]);
    const orbitRef = useRef<ShaftOrbitPlotHandle>(null);

    // --- CALCULATOR STATE ---
    const [rpm, setRpm] = useState<number>(1500);
    const [couplingType, setCouplingType] = useState<'short' | 'spacer'>('short');
    const [spacerLength, setSpacerLength] = useState<number>(10); // inches
    const [measurements, setMeasurements] = useState({
        vOffset: 0.12, // mm
        hOffset: -0.05, // mm
        gapDiff: 0.04, // mm per 100mm dia (angularity proxy)
    });

    // --- TOLERANCE ENGINE ---
    const tolerances = useMemo(() => {
        const tier = RPM_TIERS.find(t => rpm <= t.max) || RPM_TIERS[RPM_TIERS.length - 1];

        // Convert API 686 (mils) to SI (microns/mm) for internal logic
        // 1 mil = 25.4 microns
        const maxOffsetMicrons = tier.offset * 25.4;
        const maxOffsetMm = maxOffsetMicrons / 1000;

        let maxAngularityMmPerM = 0; // mm/m (equivalent to mils/in)
        if (couplingType === 'short') {
            maxAngularityMmPerM = tier.angShort; // mils/inch is roughly mm/m scalar-wise?
            // Wait, 1 mil/inch = 0.001 in / 1 in = 0.001 rad.
            // 0.001 rad * 1000 mm = 1 mm/m. So numerical value is identical.
            maxAngularityMmPerM = tier.angShort;
        } else {
            // Spacer: often defined as offset per length. 
            // API 686 says "Spacers > 18 inch may use 0.3 mils/inch".
            maxAngularityMmPerM = tier.angSpacer;
        }

        return { maxOffsetMm, maxAngularityMmPerM, maxOffsetMicrons, tier };
    }, [rpm, couplingType]);

    // Calculate Status
    const totalOffset = Math.sqrt(Math.pow(measurements.vOffset, 2) + Math.pow(measurements.hOffset, 2));
    const offsetStatus = totalOffset <= tolerances.maxOffsetMm ? 'pass' : 'fail';
    const angularStatus = measurements.gapDiff <= tolerances.maxAngularityMmPerM ? 'pass' : 'fail'; // Simplified angular check

    const baselineSnapshot = localStorage.getItem('nc4.2_baseline_snapshot');

    const handlePinBaseline = () => {
        const points = orbitRef.current?.getCurrentPoints();
        const snapshot = orbitRef.current?.getSnapshot();
        if (points) {
            dispatch({
                type: 'UPDATE_MECHANICAL',
                payload: {
                    baselineOrbitCenter: orbitAnalysis.currentCenter
                }
            });
            if (snapshot) localStorage.setItem('nc4.2_baseline_snapshot', snapshot);
            logAction('PIN_BASELINE', 'Baseline orbit reference captured and persisted to Neural Core.', 'SUCCESS');
        }
    };

    const handleResetBaseline = () => {
        dispatch({
            type: 'UPDATE_MECHANICAL',
            payload: {
                baselineOrbitCenter: { x: 0, y: 0 }
            }
        });
        localStorage.removeItem('nc4.2_baseline_snapshot');
        logAction('RESET_BASELINE', 'Baseline reference cleared from Neural Core.', 'SUCCESS');
    };

    // Jitter Effect for Demo
    useEffect(() => {
        const interval = setInterval(() => {
            const time = Date.now() * 0.002;
            const base = confirmedSteps.includes('laser_alignment') ? 0.05 : 0.15;
            const trend = confirmedSteps.includes('laser_alignment') ? 1.1 : 2.5;

            dispatch({
                type: 'UPDATE_VIBRATION_HISTORY',
                payload: {
                    x: Math.cos(time) * base + (Math.random() - 0.5) * 0.01,
                    y: Math.sin(time) * base * trend + (Math.random() - 0.5) * 0.01
                }
            });
        }, 100);
        return () => clearInterval(interval);
    }, [confirmedSteps, dispatch]);

    const confirmStep = async (stepId: string, description: string) => {
        if (confirmedSteps.includes(stepId)) return;

        try {
            await logAction(
                `VERIFY_${stepId.toUpperCase()}`,
                `Shaft Alignment: ${description}`,
                'SUCCESS',
                { stepId, context: 'SOP-MECH-005', timestamp: new Date().toISOString() }
            );
            setConfirmedSteps(prev => [...prev, stepId]);
        } catch (error) {
            console.error("Failed to log to Digital Ledger:", error);
        }
    };

    const handleGenerateReport = () => {
        // ... (Report Generation Logic preserved but omitted for brevity if unchanged, but I must provide valid react code. I'll include it.)
        const snapshot = orbitRef.current?.getSnapshot();
        const caseId = 'SOP-' + Math.floor(Math.random() * 10000);
        const centerMigration = new Decimal(orbitAnalysis.centerMigration);
        const insight = {
            name: 'Shaft Stability Audit',
            severity: (offsetStatus === 'fail' || angularStatus === 'fail') ? 'CRITICAL' : 'LOW', // Updated to use Calculator Status
            probability: 0.98,
            physicsNarrative: `API 686 Validation: Offset ${offsetStatus.toUpperCase()}, Angularity ${angularStatus.toUpperCase()}. RPM Tier: <${tolerances.tier.max}.`,
            vectors: ['API 686 Calculator', 'Shaft Orbit'],
            baselineImage: baselineSnapshot,
            micronMetrics: {
                baselineX: new Decimal(orbitAnalysis.baselineCenter?.x || 0).mul(1000).toNumber(),
                baselineY: new Decimal(orbitAnalysis.baselineCenter?.y || 0).mul(1000).toNumber(),
                activeX: new Decimal(orbitAnalysis.currentCenter?.x || 0).mul(1000).toNumber(),
                activeY: new Decimal(orbitAnalysis.currentCenter?.y || 0).mul(1000).toNumber(),
                drift: centerMigration.mul(1000).toNumber()
            }
        };

        const blob = ForensicReportService.generateDiagnosticDossier({
            caseId,
            insight,
            engineerName: 'Senior Engineer',
            snapshotImage: snapshot,
            t
        });
        if (blob instanceof Blob) {
            viewDocument(blob, `Dossier: ${caseId}`, `Stability_Dossier_${caseId}.pdf`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-stone-800 py-6 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-600 rounded-2xl shadow-lg border border-white/10">
                            <Ruler className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-black border border-amber-900/50 uppercase tracking-widest">SOP-MECH-005</span>
                                <NeuralPulse color="amber" />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">{t('francis.shaftAlignment.title')}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleGenerateReport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 hover:bg-emerald-600 hover:text-white transition uppercase tracking-widest">
                            <FileSearch className="w-3 h-3" /> Dossier
                        </button>
                        <button onClick={() => navigate(`/${ROUTES.FRANCIS.HUB}`)} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition">
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </header>

            <main className={`max-w-6xl mx-auto px-4 md:px-8 ${densityMode === 'compact' ? 'space-y-6' : 'space-y-12'}`}>

                {/* 1. API 686 CALCULATOR MODULE (DEEP DIVE) */}
                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-1 overflow-hidden backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-cyan-500 to-amber-500 opacity-30" />

                    <div className={`grid grid-cols-1 lg:grid-cols-12 ${spacing.sectionGap}`}>
                        {/* Inputs */}
                        <div className={`col-span-12 lg:col-span-4 bg-black/20 ${spacing.cardPadding} rounded-[2.5rem]`}>
                            <div className="flex items-center gap-3 mb-6">
                                <Calculator className="w-5 h-5 text-amber-500" />
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">API 686 Calculator</h3>
                                <InfoTooltip docKey="alignment" />
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rotational Speed (RPM)</label>
                                    <input
                                        type="number"
                                        value={rpm}
                                        onChange={(e) => setRpm(Number(e.target.value))}
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-cyan-400 font-mono font-bold focus:border-cyan-500 focus:outline-none transition-colors"
                                    />
                                    <div className="text-[9px] text-slate-600 font-mono">Tier: {tolerances.tier.max === 99999 ? '>3600' : `<${tolerances.tier.max}`} RPM</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coupling Type</label>
                                        <InfoTooltip docKey="spacer_coupling" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCouplingType('short')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${couplingType === 'short' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                                        >
                                            Short
                                        </button>
                                        <button
                                            onClick={() => setCouplingType('spacer')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${couplingType === 'spacer' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                                        >
                                            Spacer
                                        </button>
                                    </div>
                                </div>

                                {couplingType === 'spacer' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spacer Length (in)</label>
                                        <input
                                            type="number"
                                            value={spacerLength}
                                            onChange={(e) => setSpacerLength(Number(e.target.value))}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                                        />
                                    </motion.div>
                                )}

                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest">Max Offset</span>
                                        <span className="text-xs font-mono font-black text-white">{tolerances.maxOffsetMm.toFixed(3)} mm</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest">Max Angularity</span>
                                        <span className="text-xs font-mono font-black text-white">{tolerances.maxAngularityMmPerM.toFixed(3)} mm/m</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visualizer Target */}
                        <div data-hotspot-id="shaft" className="col-span-12 lg:col-span-5 flex flex-col items-center justify-center p-6 relative">
                            <h3 className="absolute top-4 left-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex gap-2 items-center">
                                <Target className="w-3 h-3" /> Live Metrology
                            </h3>
                            <AlignmentVisualizer
                                alignment={totalOffset}
                                angle={Math.atan2(measurements.vOffset, measurements.hOffset) * (180 / Math.PI)}
                                size={densityMode === 'compact' ? 240 : 280}
                            />
                            <div className="mt-6 flex gap-4 text-center">
                                <div>
                                    <div className="text-[9px] text-slate-500 font-black uppercase">Offset Status</div>
                                    <div className={`text-sm font-black uppercase ${offsetStatus === 'pass' ? 'text-emerald-400' : 'text-red-500'}`}>{offsetStatus}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-500 font-black uppercase">Angular Status</div>
                                    <div className={`text-sm font-black uppercase ${angularStatus === 'pass' ? 'text-emerald-400' : 'text-red-500'}`}>{angularStatus}</div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Manual Entry */}
                        <div className="col-span-12 lg:col-span-3 bg-slate-950/50 p-6 rounded-[2.5rem] border-l border-white/5">
                            <h4 className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Field Values
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] text-slate-400 uppercase block mb-1">V. Offset (mm)</label>
                                    <input
                                        type="number" step="0.01"
                                        value={measurements.vOffset}
                                        onChange={(e) => setMeasurements({ ...measurements, vOffset: Number(e.target.value) })}
                                        className={`w-full bg-black/40 border rounded px-3 py-1.5 font-mono text-sm font-bold ${Math.abs(measurements.vOffset) > tolerances.maxOffsetMm ? 'border-red-500 text-red-500' : 'border-white/10 text-emerald-400'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-slate-400 uppercase block mb-1">H. Offset (mm)</label>
                                    <input
                                        type="number" step="0.01"
                                        value={measurements.hOffset}
                                        onChange={(e) => setMeasurements({ ...measurements, hOffset: Number(e.target.value) })}
                                        className={`w-full bg-black/40 border rounded px-3 py-1.5 font-mono text-sm font-bold ${Math.abs(measurements.hOffset) > tolerances.maxOffsetMm ? 'border-red-500 text-red-500' : 'border-white/10 text-emerald-400'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-slate-400 uppercase block mb-1">Gap Diff / 100mm</label>
                                    <input
                                        type="number" step="0.01"
                                        value={measurements.gapDiff}
                                        onChange={(e) => setMeasurements({ ...measurements, gapDiff: Number(e.target.value) })}
                                        className={`w-full bg-black/40 border rounded px-3 py-1.5 font-mono text-sm font-bold ${measurements.gapDiff > tolerances.maxAngularityMmPerM ? 'border-amber-500 text-amber-500' : 'border-white/10 text-emerald-400'}`}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => confirmStep('manual_entry', `Manual Alignment Input: ${totalOffset.toFixed(3)}mm`)}
                                className="w-full mt-6 py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                Log To Ledger
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. ORBIT ANALYSIS (NC-9.0) - Preserved but styled to fit density */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 ${spacing.sectionGap}`}>
                    <div className="lg:col-span-2">
                        <GlassCard title="Shaft Orbit Dynamic Stability" icon={<Microscope className="text-cyan-400" />}>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="p-4 bg-black/40 rounded-[2rem] border border-white/5 shadow-2xl">
                                    <ShaftOrbitPlot
                                        ref={orbitRef}
                                        vibrationX={vibration.x}
                                        vibrationY={vibration.y}
                                        baselinePoints={state.mechanical.vibrationHistory || []}
                                        centerPath={[]}
                                        onAnalysis={(analysis) => {
                                            dispatch({ type: 'UPDATE_CENTER_PATH', payload: analysis.currentCenter });
                                        }}
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    {/* Metric Cards */}
                                    <div className={`grid grid-cols-2 ${spacing.sectionGap}`}>
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Eccentricity</div>
                                            <div className="text-xl font-black font-mono text-cyan-400">{new Decimal(orbitAnalysis.eccentricity).toFixed(3)}</div>
                                        </div>
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Drift (&mu;m)</div>
                                            <div className="text-xl font-black font-mono text-amber-400">{new Decimal(orbitAnalysis.centerMigration).mul(1000).toFixed(1)}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-slate-300 font-medium italic leading-relaxed">
                                            {orbitAnalysis.isElliptical
                                                ? "WARNING: Elliptical path detected. Inspect bearing fluid film."
                                                : "Orbit stable. Centering within operational tolerance."}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={handlePinBaseline} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg">Pin Baseline</button>
                                        <button onClick={handleResetBaseline} className="px-4 py-2 bg-red-950/20 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-500/20">Reset</button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* 3. SOFT FOOT AUDIT - COMPACT */}
                    <div className="lg:col-span-1">
                        <div className="bg-red-950/10 border-l-[4px] border-red-500 p-6 rounded-r-[2rem] border-y border-r border-red-500/10 h-full flex flex-col">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Footprints className="w-4 h-4 text-red-500" /> Soft Foot
                                <InfoTooltip docKey="soft_foot" />
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {['c1', 'c2', 'c3', 'c4'].map((id, i) => (
                                    <div key={id} className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                        <span className="text-[8px] text-slate-500 font-black uppercase block mb-1">Foot {i + 1}</span>
                                        <span className={`text-xs font-mono font-bold ${i === 3 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>{i === 3 ? '0.08' : '0.02'}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                                <div className="text-[9px] text-red-300 font-bold uppercase tracking-tight">Shim Correction Required on Foot 4</div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

