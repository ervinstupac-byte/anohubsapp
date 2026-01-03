import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { useAudit } from '../../contexts/AuditContext';
import { useDocumentViewer } from '../../contexts/DocumentContext';
import { generateDiagnosticDossier } from '../../utils/pdfGenerator';
import { ShaftOrbitPlot, ShaftOrbitPlotHandle } from '../ui/ShaftOrbitPlot';
import { useCerebro } from '../../contexts/ProjectContext';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';
import { Activity, Zap, Sun, Footprints, AlertTriangle, CheckCircle, Database, FileSearch, Ruler, ArrowLeft, RotateCw, Info, ShieldCheck, Microscope } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const ShaftAlignment: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logAction } = useAudit();
    const { viewDocument } = useDocumentViewer();
    const { state, dispatch } = useCerebro();
    const { orbit: orbitAnalysis, vibration } = useEngineeringMath();
    const [confirmedSteps, setConfirmedSteps] = useState<string[]>([]);
    const orbitRef = useRef<ShaftOrbitPlotHandle>(null);

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
                {
                    stepId,
                    context: 'SOP-MECH-005',
                    timestamp: new Date().toISOString(),
                    orbitData: { ...orbitAnalysis }
                }
            );
            setConfirmedSteps(prev => [...prev, stepId]);
        } catch (error) {
            console.error("Failed to log to Digital Ledger:", error);
        }
    };

    const handleGenerateReport = () => {
        const snapshot = orbitRef.current?.getSnapshot();
        const caseId = 'SOP-' + Math.floor(Math.random() * 10000);
        const centerMigration = new Decimal(orbitAnalysis.centerMigration);
        const isCenterMigrating = centerMigration.gt(0.1);
        const eccentricity = new Decimal(orbitAnalysis.eccentricity);

        let narrative = orbitAnalysis.isElliptical
            ? `Dynamic Eccentricity detected (e=${eccentricity.toFixed(2)}). High elliptical path indicates potential mechanical looseness.`
            : 'Orbital path indicates stable geometric center.';

        if (isCenterMigrating) {
            narrative += ` [CRITICAL] Center Migration detected: ${centerMigration.toFixed(2)}mm towards ${new Decimal(orbitAnalysis.migrationAngle).toFixed(0)}°. Indicates severe Load-Induced Misalignment.`;
        }

        const insight = {
            name: 'Shaft Stability Audit',
            severity: (orbitAnalysis.isElliptical || isCenterMigrating) ? 'CRITICAL' : 'LOW',
            probability: 0.98,
            physicsNarrative: narrative,
            vectors: ['X/Y Displacement Sensors', 'Baseline Shadowing', 'Center Migration Analysis'],
            baselineImage: baselineSnapshot,
            micronMetrics: {
                baselineX: new Decimal(orbitAnalysis.baselineCenter?.x || 0).mul(1000).toNumber(),
                baselineY: new Decimal(orbitAnalysis.baselineCenter?.y || 0).mul(1000).toNumber(),
                activeX: new Decimal(orbitAnalysis.currentCenter?.x || 0).mul(1000).toNumber(),
                activeY: new Decimal(orbitAnalysis.currentCenter?.y || 0).mul(1000).toNumber(),
                drift: centerMigration.mul(1000).toNumber()
            }
        };

        const blob = generateDiagnosticDossier(caseId, insight, 'Senior Engineer', snapshot, true);
        if (blob instanceof Blob) {
            viewDocument(blob, `Dossier: ${caseId}`, `Stability_Dossier_${caseId}.pdf`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-stone-800 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-amber-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <Ruler className="text-white w-8 h-8 relative z-10 group-hover:rotate-45 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-black border border-amber-900/50 uppercase tracking-widest">SOP-MECH-005</span>
                                <NeuralPulse color="amber" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.shaftAlignment.title')}
                            </h1>
                            <p className="text-[10px] text-amber-400/70 font-black uppercase tracking-[0.2em] italic mt-1">
                                Precision Geometrical Validation Matrix
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 hover:bg-emerald-600 hover:text-white transition group uppercase tracking-widest"
                        >
                            <FileSearch className="w-3 h-3" />
                            <span>Dossier</span>
                        </button>
                        <button
                            onClick={() => navigate(`/${ROUTES.FRANCIS.HUB}`)}
                            className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition" />
                            <span>{t('francis.shaftAlignment.return')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* ORBIT ANALYSIS CORE */}
                    <div className="lg:col-span-2">
                        <GlassCard title="Shaft Orbit Dynamic Stability (NC-4.2)" icon={<Microscope className="text-cyan-400" />}>
                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="p-6 bg-black/40 rounded-[3rem] border border-white/5 flex-shrink-0 shadow-2xl">
                                    <ShaftOrbitPlot
                                        ref={orbitRef}
                                        vibrationX={vibration.x}
                                        vibrationY={vibration.y}
                                        baselinePoints={state.mechanical.vibrationHistory || []}
                                        centerPath={[]} // Logic for centerPath tracking can be added
                                        onAnalysis={(analysis) => {
                                            dispatch({ type: 'UPDATE_CENTER_PATH', payload: analysis.currentCenter });
                                        }}
                                    />
                                </div>
                                <div className="flex-1 space-y-8">
                                    {/* Micron Metrics Grid */}
                                    <div className="p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 shadow-inner">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-emerald-500" /> Micron Stability Matrix
                                            </span>
                                            <div className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-500/30 uppercase tracking-widest italic">Live Feed Activated</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 mb-8">
                                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 group/metric">
                                                <div className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest italic group-hover/metric:text-cyan-400 transition-colors">Eccentricity Factor (e)</div>
                                                <div className={`text-3xl font-black font-mono italic tracking-tighter ${orbitAnalysis.isElliptical ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                                                    {new Decimal(orbitAnalysis.eccentricity).toFixed(3)}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 group/metric">
                                                <div className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest italic group-hover/metric:text-amber-400 transition-colors">Vector Drift ($\Delta C$)</div>
                                                <div className={`text-3xl font-black font-mono italic tracking-tighter ${new Decimal(orbitAnalysis.centerMigration).mul(1000).gt(50) ? 'text-amber-500 animate-pulse' : 'text-emerald-400'}`}>
                                                    {new Decimal(orbitAnalysis.centerMigration).mul(1000).toFixed(1)} <span className="text-xs lowercase opacity-40">&mu;m</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-6 rounded-2xl border transition-all ${new Decimal(orbitAnalysis.centerMigration).gt(0.05) ? 'bg-amber-950/20 border-amber-500/30' : 'bg-black/60 border-white/5'}`}>
                                            <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest text-slate-400 flex items-center gap-2 italic">
                                                <Info className="w-4 h-4" /> Stability Conclusion
                                            </h4>
                                            <p className="text-xs text-slate-300 font-bold italic leading-relaxed uppercase tracking-tight">
                                                {new Decimal(orbitAnalysis.centerMigration).gt(0.05)
                                                    ? `CRITICAL THERMAL DRIFT: Center Migration detected at ${new Decimal(orbitAnalysis.centerMigration).mul(1000).toFixed(1)}&mu;m. Potential alignment breach.`
                                                    : orbitAnalysis.isElliptical
                                                        ? "ECCENTRICITY WARNING: Elliptical path indicates potential mechanical looseness in Bearing Hub."
                                                        : "SYSTEM OPTIMAL: Shaft trajectory remains within absolute circular tolerance."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={handlePinBaseline} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 italic">Pin Baseline (0MW)</button>
                                        <button onClick={handleResetBaseline} className="px-8 py-4 bg-red-950/20 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all italic">Reset</button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* DISPLACEMENT FEED TILE */}
                    <div className="lg:col-span-1">
                        <section className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 h-full flex flex-col justify-between group overflow-hidden relative shadow-2xl backdrop-blur-md">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="w-32 h-32 text-cyan-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-12 flex items-center gap-3 italic">
                                    <Activity className="w-5 h-5 text-cyan-400 animate-pulse" /> {t('francis.shaftAlignment.feedTitle')}
                                </h3>
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('francis.shaftAlignment.radialX')}</span>
                                            <span className="text-2xl font-black text-white font-mono tabular-nums italic tracking-tighter">{vibration.x.toFixed(3)} <span className="text-xs opacity-40 lowercase italic font-bold">mm</span></span>
                                        </div>
                                        <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                            <div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" style={{ width: `${Math.min(Math.abs(vibration.x) * 200, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('francis.shaftAlignment.radialY')}</span>
                                            <span className="text-2xl font-black text-white font-mono tabular-nums italic tracking-tighter">{vibration.y.toFixed(3)} <span className="text-xs opacity-40 lowercase italic font-bold">mm</span></span>
                                        </div>
                                        <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                            <div className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" style={{ width: `${Math.min(Math.abs(vibration.y) * 200, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="mt-12 w-full py-4 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors italic relative z-10 uppercase">
                                {t('francis.shaftAlignment.zeroCal')}
                            </button>
                        </section>
                    </div>
                </div>

                {/* PROCEDURAL VALIDATION HUB */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Run Out Table */}
                    <section className="bg-amber-950/20 border-l-[16px] border-amber-600 p-12 rounded-r-[4rem] border border-amber-900/20 relative group overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 italic">{t('francis.shaftAlignment.runOut.title')}</h2>
                                <div className="px-3 py-1 bg-amber-600/20 text-amber-500 text-[9px] font-black rounded-lg border border-amber-900/50 uppercase tracking-widest inline-block italic">ISO 10816 Compliance Check</div>
                            </div>
                            <button
                                onClick={() => confirmStep('run_out', 'Run Out Limits Verified')}
                                className={`flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic ${confirmedSteps.includes('run_out') ? 'bg-emerald-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-900/30 font-black'}`}
                            >
                                {confirmedSteps.includes('run_out') ? <ShieldCheck className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                                {confirmedSteps.includes('run_out') ? 'Sealed' : 'Commit Audit'}
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 relative z-10 mb-8 font-black uppercase italic text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-amber-900/40 text-amber-500 tracking-widest text-[10px]">
                                    <tr>
                                        <th className="p-6">{t('francis.shaftAlignment.runOut.thLoc')}</th>
                                        <th className="p-6">{t('francis.shaftAlignment.runOut.thLim')}</th>
                                        <th className="p-6">{t('francis.shaftAlignment.runOut.thStat')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {[1, 2, 3].map((row) => (
                                        <tr key={row} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-6 font-bold">{t(`francis.shaftAlignment.runOut.loc${row}`)}</td>
                                            <td className="p-6 font-mono font-black">{row === 1 ? '0.05' : row === 2 ? '0.03' : '0.05'}</td>
                                            <td className={`p-6 ${row === 3 ? 'text-amber-500 animate-pulse font-black' : 'text-emerald-500'}`}>
                                                {row === 3 ? t('francis.shaftAlignment.runOut.stat3_warn') : t(`francis.shaftAlignment.runOut.stat${row}`)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] text-slate-500 italic uppercase tracking-tighter flex items-center gap-2 relative z-10 font-bold">
                            <Info className="w-3 h-3" /> {t('francis.shaftAlignment.runOut.method')}
                        </p>
                    </section>

                    {/* Laser Alignment Detail */}
                    <div className="space-y-12">
                        <div className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 relative group overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{t('francis.shaftAlignment.laser.title')}</h3>
                                <div className="flex gap-4">
                                    <div className="px-3 py-1 bg-cyan-900/40 text-cyan-500 text-[9px] font-black rounded-lg border border-cyan-800 italic uppercase tracking-widest">{t('francis.shaftAlignment.laser.interval')}</div>
                                    <button
                                        onClick={() => confirmStep('laser_alignment', 'Laser Alignment Completed')}
                                        className={`flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic ${confirmedSteps.includes('laser_alignment') ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/30'}`}
                                    >
                                        {confirmedSteps.includes('laser_alignment') ? <ShieldCheck className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                                        {confirmedSteps.includes('laser_alignment') ? 'Validated' : 'Finalize'}
                                    </button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div className="p-8 bg-black/60 rounded-[2.5rem] border border-white/5 group/off">
                                    <h4 className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest italic">{t('francis.shaftAlignment.laser.vOffset')}</h4>
                                    <div className="text-2xl font-black text-white font-mono italic">+0.12 <span className="text-xs opacity-40 lowercase italic">mm</span></div>
                                </div>
                                <div className="p-8 bg-black/60 rounded-[2.5rem] border border-white/5 group/off">
                                    <h4 className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest italic">{t('francis.shaftAlignment.laser.hOffset')}</h4>
                                    <div className="text-2xl font-black text-white font-mono italic">-0.05 <span className="text-xs opacity-40 lowercase italic">mm</span></div>
                                </div>
                            </div>
                            <div className="p-8 bg-amber-950/10 border-2 border-amber-500/20 rounded-[2.5rem] flex items-center gap-8 group/thermal relative overflow-hidden">
                                <Sun className="w-16 h-16 text-amber-500/20 group-hover/thermal:scale-110 group-hover/thermal:rotate-45 transition-transform duration-1000" />
                                <div>
                                    <h4 className="text-amber-500 text-[10px] font-black uppercase mb-2 tracking-widest italic">{t('francis.shaftAlignment.laser.thermalTitle')}</h4>
                                    <p className="text-xs text-slate-300 font-bold italic leading-relaxed uppercase tracking-tight">{t('francis.shaftAlignment.laser.thermalDesc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Soft Foot Audit */}
                        <div className="bg-red-950/5 border-l-[16px] border-slate-700 p-12 rounded-r-[4rem] border border-white/5 relative group overflow-hidden shadow-2xl">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 italic flex items-center gap-4">
                                <Footprints className="text-slate-500" /> {t('francis.shaftAlignment.softFoot.title')}
                            </h3>
                            <p className="text-sm text-slate-500 font-black italic uppercase tracking-tighter mb-10 border-l-2 border-slate-800 pl-6">{t('francis.shaftAlignment.softFoot.desc')}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                {['c1', 'c2', 'c3', 'c4'].map((id, i) => {
                                    const vals = ['0.02mm', '0.01mm', '0.02mm', '0.08mm'];
                                    const isCritical = i === 3;
                                    return (
                                        <div key={id} className={`p-6 rounded-[2rem] border transition-all text-center group/foot ${isCritical ? 'bg-red-950/20 border-red-500 shadow-xl shadow-red-900/20' : 'bg-black/60 border-white/5'}`}>
                                            <span className={`text-[9px] font-black uppercase block mb-2 tracking-widest italic ${isCritical ? 'text-red-500' : 'text-slate-500'}`}>{t(`francis.shaftAlignment.softFoot.${id}`)}</span>
                                            <div className={`text-sm font-black italic font-mono ${isCritical ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>{vals[i]}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-end p-6 bg-red-600/10 rounded-3xl border border-red-500/20">
                                <div className="flex items-center gap-4 group/alert cursor-help">
                                    <AlertTriangle className="text-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-200 uppercase tracking-widest italic">{t('francis.shaftAlignment.softFoot.action')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
