import React, { useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Zap, TrendingUp, DollarSign,
    TrendingDown, Hammer, ExternalLink,
    Thermometer, Gauge, Link2, Wrench, FileText, ShieldAlert
} from 'lucide-react';

import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { CrossSectorEngine } from '../../services/EngineeringValidation';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { EngineeringCard } from '../../shared/components/ui/EngineeringCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { OptimizationHUD } from '../../shared/components/hud/OptimizationHUD';
import { HeritagePrecisionBanner } from '../ui/HeritagePrecisionBanner';
import { FieldModeToggle } from '../ui/FieldModeToggle';
import { EngineeringWisdomVault } from './EngineeringWisdomVault';
// heavy telemetry/charting component - lazy loaded
// to keep `feature-dashboard` initial chunk small
// VibrationAnalyzer is relatively heavy (charts + transforms)
const VibrationAnalyzer = React.lazy(() => import('../../features/telemetry/components/VibrationAnalyzer').then(m => ({ default: m.VibrationAnalyzer })));
import { SmartManual } from './SmartManual';
import { ROUTES, getFrancisPath } from '../../routes/paths';
const RevenueImpactCard = React.lazy(() => import('./RevenueImpactCard').then(m => ({ default: m.RevenueImpactCard })));
import { StrategicPrescription } from './StrategicPrescription';
import { MoneySavedTicker } from './MoneySavedTicker';
import { MaintenanceTimeline } from '../maintenance/MaintenanceTimeline';
// lazy-load secondary metrics grid to split feature chunk
const SecondaryMetricsGrid = React.lazy(() => import('./SecondaryMetricsGrid').then(m => ({ default: m.SecondaryMetricsGrid })));
import { useAssetContext } from '../../contexts/AssetContext';
import idAdapter from '../../utils/idAdapter';
import { useCrossModuleActions } from '../../hooks/useCrossModuleActions';
import { AIInsightsPanel } from './AIInsightsPanel';
import { ScenarioController } from './ScenarioController';
import { LiveMetricToken } from '../../features/telemetry/components/LiveMetricToken';
import { VetoControl } from './VetoControl';
import { ShadowRealityChart } from './ShadowRealityChart';
import PeltonPhysicsOptimizer from '../../services/PeltonPhysicsOptimizer';
import MarketDrivenStrategy from '../../services/MarketDrivenStrategy';
import LogisticsSentinel from '../../services/LogisticsSentinel';
import MechanicalBrakeGuardian from '../../services/MechanicalBrakeGuardian';
import ExpertFeedbackLoop from '../../services/ExpertFeedbackLoop';
import SovereignExpertTranslator from '../../services/SovereignExpertTranslator';
import SovereignAuditAdapter from '../../services/SovereignAuditAdapter';
import { Crown, Brain } from 'lucide-react';
import { useProtocolHistoryStore, historyToSparklineMarkers } from '../../stores/ProtocolHistoryStore';
import { aiPredictionService } from '../../services/AIPredictionService';
import { supabase } from '../../services/supabaseClient';
import { fetchForecastForAsset } from '../../services/DashboardDataService';
import { prefetchPredictiveAssets } from '../../services/DashboardDataService';
import ProjectStateManager from '../../contexts/ProjectStateContext';
import { useToast } from '../../contexts/ToastContext';
import { BootSequence } from '../BootSequence';
import { createFrancisHorizontalAssetTree, AssetNode } from '../../models/AssetHierarchy';

// lazy-load heavy UI pieces used in the executive dashboard
const TurbineRunner3D = React.lazy(() => import('../three/TurbineRunner3D').then(m => ({ default: m.TurbineRunner3D })));
const EngineeringDossierCard = React.lazy(() => import('../EngineeringDossierCard').then(m => ({ default: m.EngineeringDossierCard })));

// --- LONGEVITY IMPACT CALCULATOR ---
const calculateLongevityLoss = (alignment: number): { years: number; percentage: number } => {
    const GOLDEN = 0.05; // mm/m
    const DESIGN_LIFE_YEARS = 50;
    if (alignment <= GOLDEN) return { years: 0, percentage: 0 };
    const wearFactor = Math.pow(alignment / GOLDEN, 3);
    const lifetimeFraction = 1 / wearFactor;
    const expectedLife = DESIGN_LIFE_YEARS * lifetimeFraction;
    const yearsLost = DESIGN_LIFE_YEARS - expectedLife;
    const percentageLost = (yearsLost / DESIGN_LIFE_YEARS) * 100;
    return { years: yearsLost, percentage: percentageLost };
};

// === MAIN EXECUTIVE DASHBOARD ===
export const ExecutiveDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const threeContainerRef = useRef<HTMLDivElement>(null);

    const {
        financials,
        hydraulic,
        physics: livePhysics,
        structural,
        mechanical,
        specializedState,
        diagnosis,
        identity,
        unifiedDiagnosis,
        investigatedComponents
    } = useTelemetryStore();

    const { selectedAsset } = useAssetContext();
    const crossActions = useCrossModuleActions(selectedAsset?.id);
    const assetIdentity = selectedAsset?.specs?.machineConfig || identity?.machineConfig || { ratedPowerMW: 4.2 };

    const scadaFlow = specializedState?.sensors?.flowRate ?? 42.5;
    const scadaHead = (specializedState?.sensors as any)?.net_head ?? specializedState?.sensors?.draft_tube_pressure ?? 152.0;
    const scadaFrequency = specializedState?.sensors?.gridFrequency ?? 50.0;

    // Pelton optimizer preview (Live Efficiency Gain + Market Mode)
    const peltonPreview = React.useMemo(() => {
        try {
            const jetPressureBar = (specializedState?.sensors as any)?.jetPressureBar || scadaHead * 0.0980665; // m -> bar approx
            const needlePct = (specializedState?.sensors as any)?.needlePositionPct || 100;
            const activeNozzles = (specializedState?.sensors as any)?.activeNozzles || 1;
            const shellVibrationMm = (specializedState?.sensors as any)?.shellVibrationMm || (mechanical?.vibration || 0);
            const bucketHours = (identity?.machineConfig as any)?.totalOperatingHours || 0;

            const input = { jetPressureBar, needlePositionPct: needlePct, activeNozzles, shellVibrationMm, bucketHours };
            const seq = PeltonPhysicsOptimizer.optimizeNozzles(input);
            const baseline = PeltonPhysicsOptimizer.optimizeNozzles({ ...input, activeNozzles: activeNozzles }).expectedEfficiencyPct;
            const oracle = { hourlyPricesEurPerMWh: [((financials as any)?.marketPriceEurPerMWh || ((financials as any)?.energyPrice) || 50)] };
            const decision = MarketDrivenStrategy.decideMode(oracle, input, baseline, (assetIdentity?.ratedPowerMW || 10), 200);
            const gain = +(seq.expectedEfficiencyPct - baseline);
            return { seq, baseline, decision, gain };
        } catch (e) {
            return null;
        }
    }, [specializedState, scadaHead, mechanical, identity, financials, assetIdentity]);

    const logisticsPreview = React.useMemo(() => {
        try {
            const wear = (specializedState?.sensors as any)?.wearMetrics || { 'thrust-bearing': 45, 'nozzle-needle': 20 };
            const sentinel = new LogisticsSentinel();
            const spares = sentinel.mapWearToSpares(wear);
            const outage = sentinel.recommendOutageBundle(wear, []);
            return { spares, outage };
        } catch (e) { return null; }
    }, [specializedState]);

    const brakePreview = React.useMemo(() => {
        try {
            const padWear = (specializedState?.sensors as any)?.brakePadWearPct || 35;
            const pressure = (specializedState?.sensors as any)?.brakeHydraulicBar || 45;
            const guard = new MechanicalBrakeGuardian();
            const readiness = guard.evaluateReadiness(padWear, pressure);
            return { readiness, padWear, pressure };
        } catch (e) { return null; }
    }, [specializedState]);

    const [trendData] = useState(() => ({
        power: Array.from({ length: 24 }, () => 3.8 + Math.random() * 0.8),
        health: Array.from({ length: 24 }, () => 82 + Math.random() * 10),
        head: Array.from({ length: 24 }, () => 148 + Math.random() * 8),
        thrust: Array.from({ length: 24 }, () => 140 + Math.random() * 30)
    }));

    const [isBooting, setIsBooting] = useState(true);
    const { getEntriesForAsset } = useProtocolHistoryStore();
    const [forecast, setForecast] = useState<{ weeksUntil: number | null; predictedTimestamp: number | null; confidence: number } | null>(null);
    const [sampleCount, setSampleCount] = useState<number | null>(null);
    const [dec25Present, setDec25Present] = useState(false);
    const [residualStd, setResidualStd] = useState<number | null>(null);
    const [pf, setPf] = useState<number | null>(null);
    const [wisdomReport, setWisdomReport] = useState<any | null>(null);
    const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const auditListRef = useRef<HTMLDivElement | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dossierOpen, setDossierOpen] = useState(false);
    const [dossierKeyword, setDossierKeyword] = useState<string | null>(null);
    const [pdfProgress, setPdfProgress] = useState<number | null>(null);
    const [pdfError, setPdfError] = useState<Error | null>(null);
    const [assetTree] = useState<AssetNode>(() => createFrancisHorizontalAssetTree());
    const { showToast } = useToast();

    // Quick canonical mapping check: read canonical state from ProjectStateManager and log to audit
    React.useEffect(() => {
        try {
            const ps = ProjectStateManager.getState();
            const canonicalEfficiencyPct = ps?.hydraulic?.efficiency ? Math.round((ps.hydraulic as any).efficiency * 100) : null;
            const canonicalNetHead = (ps?.physics && (ps as any).physics.netHead) || (ps?.hydraulic && (ps as any).hydraulic.head) || null;
            const canonicalAssetName = ps?.identity?.assetName || null;
            setAuditLog(prev => [{ timestamp: Date.now(), source: 'ProjectState', asset: canonicalAssetName, canonicalEfficiencyPct, canonicalNetHead }, ...prev].slice(0, 40));
            // also expose to console for quick verification
            // eslint-disable-next-line no-console
            console.info('[ExecutiveDashboard] ProjectState canonical snapshot', { canonicalEfficiencyPct, canonicalNetHead, canonicalAssetName });
        } catch (e) {
            // ignore if manager unavailable
        }
    }, []);

    const scrollToAuditEntry = useCallback((persistedId?: string) => {
        if (!persistedId) return;
        // find element by data-entry-id
        const el = document.querySelector(`[data-entry-id="${persistedId}"]`) as HTMLElement | null;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // flash background
            el.classList.add('ring-2', 'ring-amber-500');
            setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 3000);
        }
    }, []);

    // Fetch forecast for selected asset (delegated to DashboardDataService)
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            if (!selectedAsset) { setForecast(null); setResidualStd(null); setSampleCount(null); setDec25Present(false); setPf(null); return; }
            try {
                const res = await fetchForecastForAsset(selectedAsset);
                if (!mounted) return;
                setForecast(res?.forecast ?? null);
                setResidualStd(res?.residualStd ?? null);
                setSampleCount(res?.sampleCount ?? null);
                setDec25Present(!!res?.dec25Present);
                setPf(res?.pf ?? null);
            } catch (e) {
                console.warn('Failed to fetch forecast', e);
                if (mounted) setForecast(null);
            }
        })();
        return () => { mounted = false; };
    }, [selectedAsset]);

    // Predictive prefetch: warm up forensic and century ROI assets during idle
    React.useEffect(() => {
        try {
            if (!selectedAsset) return;
            prefetchPredictiveAssets(selectedAsset);
        } catch (e) { /* noop */ }
    }, [selectedAsset]);

    // Run SovereignExpertTranslator when unifiedDiagnosis changes
    React.useEffect(() => {
        try {
            const translator = new SovereignExpertTranslator();
            if (unifiedDiagnosis) {
                const findings: any[] = [];
                (unifiedDiagnosis.automatedActions || []).forEach((a: any) => {
                    findings.push({ source: a.action || 'Master', action: a.action || 'AUTOMATED', details: a.details || a.message || '', metrics: {} });
                });
                (unifiedDiagnosis.serviceNotes || []).forEach((s: any) => {
                    findings.push({ source: s.service || 'ServiceNote', action: s.severity || 'NOTE', details: s.message || '', metrics: {} });
                });
                const report = translator.generateWisdomReport(selectedAsset?.id || undefined, findings, undefined);
                setWisdomReport(report);
            } else {
                const sample = translator.sampleBearingCoolingReport();
                setWisdomReport(sample);
            }
        } catch (e) {
            // ignore translator errors
        }
    }, [unifiedDiagnosis, selectedAsset]);

    // Load Audit History for selected asset
    React.useEffect(() => {
        let mounted = true;
        try {
            const adapter = new SovereignAuditAdapter();
            const all = adapter.getAuditLog() || [];
            const filtered = selectedAsset ? all.filter(a => (a.assetId || a.report?.assetId) == selectedAsset.id) : all;
            if (mounted) setAuditLog(filtered.reverse());
        } catch (e) {
            console.warn('Failed to load audit log', e);
        }
        return () => { mounted = false; };
    }, [selectedAsset]);

    // handle openDossier custom events triggered by cards
    React.useEffect(() => {
        const handler = (e: any) => {
            try {
                const k = e?.detail?.keyword || e?.detail?.id || null;
                if (k) {
                    setDossierKeyword(k);
                    setDossierOpen(true);
                }
            } catch (err) { /* ignore */ }
        };
        window.addEventListener('openDossier', handler as any);
        return () => window.removeEventListener('openDossier', handler as any);
    }, []);

    const eventMarkers = useMemo(() => {
        const numeric = selectedAsset ? idAdapter.toNumber(selectedAsset.id) : null;
        if (numeric === null) return [];
        const entries = getEntriesForAsset(numeric, 24);
        return historyToSparklineMarkers(entries, 24);
    }, [selectedAsset?.id, getEntriesForAsset]);

    const scadaDiagnostics = diagnosis ? { healthScore: diagnosis.metrics?.healthScore ?? 85 } : { healthScore: 85 };
    const currentAlignment = mechanical?.alignment ?? 0.02;

    const handleGenerateForensicPDF = useCallback(async () => {
        if (!unifiedDiagnosis || !selectedAsset || !livePhysics) {
            console.warn('[ExecutiveDashboard] Cannot generate Forensic PDF: missing required data');
            return;
        }
        setPdfError(null);
        try {
            // capture 3D snapshot in UI thread (worker cannot access DOM)
            let imgData: string | undefined = undefined;
            if (threeContainerRef.current) {
                try {
                    const { default: html2canvas } = await import('html2canvas');
                    const canvas = await html2canvas(threeContainerRef.current, { backgroundColor: null, logging: false, useCORS: true });
                    imgData = canvas.toDataURL('image/png');
                } catch (e) {
                    console.warn('[ExecutiveDashboard] Snapshot capture failed', e);
                }
            }

            setPdfProgress(1);
            const { ForensicReportService } = await import('../../services/ForensicReportService');
            const blob = await ForensicReportService.generateForensicDossier({
                asset: selectedAsset,
                diagnosis: unifiedDiagnosis,
                    projectState: {
                    identity: identity ?? undefined,
                        hydraulic: hydraulic ?? undefined,
                    mechanical: mechanical ?? undefined,
                    structural: structural ?? undefined,
                    market: financials ?? undefined,
                    investigatedComponents: investigatedComponents ?? []
                } as any,
                threeRef: imgData,
                t,
                onProgress: (pct: number) => setPdfProgress(pct)
            });

            setPdfProgress(90);
            ForensicReportService.openAndDownloadBlob(blob, `Forensic_Dossier_${selectedAsset.name}_${Date.now()}.pdf`, true, {
                assetId: idAdapter.toDb(selectedAsset.id),
                projectState: {
                    identity: identity ?? undefined,
                    hydraulic: hydraulic ?? undefined,
                    mechanical: mechanical ?? undefined,
                    structural: structural ?? undefined,
                    market: financials ?? undefined,
                    investigatedComponents: investigatedComponents ?? []
                },
                reportType: 'FORENSIC_DOSSIER'
            });
        } catch (error: any) {
            console.error("Forensic PDF Generation failed:", error);
            setPdfError(error instanceof Error ? error : new Error(String(error)));
            try { showToast(t('forensics.toasts.pdfError', 'Forensic PDF generation failed. Tap retry.'), 'error'); } catch (e) { }
        } finally {
            setPdfProgress(null);
        }
    }, [unifiedDiagnosis, selectedAsset, livePhysics, identity, mechanical, structural, financials, t, investigatedComponents]);

    const handleExpertOverride = useCallback(() => {
        try {
            const loop = new ExpertFeedbackLoop();
            const topNote = unifiedDiagnosis?.serviceNotes?.[0]?.service || 'GENERAL';
            const guardianKey = topNote.replace(/\s+/g, '_').toLowerCase();
            // Record override by the King
            loop.recordOverride({ timestamp: Date.now(), actor: 'King', action: 'USER_OVERRIDE', context: { note: topNote, diagnosis: unifiedDiagnosis } });
            // Immediately adjust priors minimally (1 true positive of 1 sample) to close the expert loop
            loop.adjustPriors(guardianKey, 1, 1);
            // quick feedback to user
            window.dispatchEvent(new CustomEvent('expertFeedbackRecorded', { detail: { guardianKey } }));
        } catch (e) {
            console.warn('Expert override failed', e);
        }
    }, [unifiedDiagnosis]);

    // Emergency/high-risk mode when Pfail > 0.8
    const highRisk = (pf !== null && pf > 80) || ((unifiedDiagnosis && typeof (unifiedDiagnosis.p_fail) === 'number') && unifiedDiagnosis.p_fail > 0.8);

    const renderTreeNode = (node: AssetNode) => {
        return (
            <li key={node.id} className="text-xs font-mono text-slate-300">
                <button onClick={() => { setDossierKeyword(node.path); setDossierOpen(true); }} className="text-left w-full hover:text-h-cyan">{node.name}</button>
                {node.children && node.children.length ? (
                    <ul className="pl-3 mt-1">
                        {node.children.map(child => renderTreeNode(child))}
                    </ul>
                ) : null}
            </li>
        );
    };

    // small pdf progress badge
    const PdfProgressBadge: React.FC = () => {
        if (pdfProgress === null) return null;
        return (
            <div className="fixed top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm z-50">
                Generating forensic PDF — {Math.round(pdfProgress)}%
                {pdfError ? (
                    <button onClick={() => { setPdfError(null); handleGenerateForensicPDF(); }} className="ml-3 underline text-amber-300 text-xs">Retry</button>
                ) : null}
            </div>
        );
    };

    const renderSparkline = (series: any = [], color = '#60a5fa', lookbackMillis = 10 * 60 * 1000) => {
        const w = 120, h = 32, pad = 2;
        if (!series) return null;
        // normalize series to numeric array
        let data: number[] = [];
        try {
            if (Array.isArray(series) && series.length && typeof series[0] === 'number') {
                // plain numeric array -> use last up to 60 samples (approx 10-minute window for many feeds)
                data = series.slice(-60);
            } else if (Array.isArray(series) && series.length && typeof series[0] === 'object') {
                // try to interpret as [{t:ts,y:val}] or {t,y}
                const now = Date.now();
                const cutoff = now - lookbackMillis;
                const mapped = series.map((p: any) => {
                    if (p == null) return null;
                    if (typeof p.y === 'number' && (typeof p.t === 'number' || typeof p.t === 'string')) return { t: Number(p.t), y: p.y };
                    if (typeof p.value === 'number' && (p.ts !== undefined)) return { t: Number(p.ts), y: p.value };
                    // fallback: object with numeric properties
                    const keys = Object.keys(p);
                    for (const k of keys) {
                        const v = (p as any)[k];
                        if (typeof v === 'number') return { t: now, y: v };
                    }
                    return null;
                }).filter(Boolean) as { t: number, y: number }[];
                const windowed = mapped.filter(p => p.t >= cutoff);
                const chosen = windowed.length ? windowed : mapped.slice(-60);
                data = chosen.map(p => p.y);
            } else {
                // fallback: attempt to coerce to numbers
                data = Array.from(series || []).map((x: any) => Number(x)).filter(n => !Number.isNaN(n)).slice(-60);
            }
        } catch (e) { data = []; }

        if (!data || data.length === 0) return null;
        const n = data.length;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = (max - min) || 1;
        const points = data.map((v, i) => {
            const x = pad + (i / Math.max(1, n - 1)) * (w - pad * 2);
            const y = pad + (1 - (v - min) / range) * (h - pad * 2);
            return `${x},${y}`;
        }).join(' ');
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    const [pendingAction, setPendingAction] = useState<{ id: string, desc: string } | null>(null);

    // Mock Shadow Data
    const shadowData = useMemo(() => Array.from({ length: 15 }, (_, i) => ({ timestamp: i, deltaP: (Math.random() - 0.4) * 20 })), []);

    // Simulate an AI action triggering every 30s for demo
    React.useEffect(() => {
        const t = setInterval(() => {
            // Only trigger if we are in a mode that supports it (mock check)
            if (Math.random() > 0.7 && !pendingAction) {
                setPendingAction({ id: `ACT-${Date.now()}`, desc: 'Adjust Nozzle Sequence: 1-3-5 (Efficiency +1.2%)' });
            }
        }, 30000);
        return () => clearInterval(t);
    }, [pendingAction]);

    // ... existing renders ...

    return (
        <div className="relative min-h-screen bg-hydro-charcoal text-slate-200 overflow-x-hidden">
            <VetoControl
                actionPending={!!pendingAction}
                actionDescription={pendingAction?.desc || ''}
                onVeto={(reason) => {
                    console.log('Action Vetoed:', reason);
                    setPendingAction(null);
                    try { showToast('AI Action Vetoed. Learning recorded.', 'warning'); } catch (e) { }
                }}
                onApprove={() => {
                    console.log('Action Approved (Auto-execution)');
                    setPendingAction(null);
                    try { showToast('AI Action Executed.', 'success'); } catch (e) { }
                }}
            />
            {/* ... rest of JSX ... */}

            {/* Inside the dashboard grid, near Ticker */}
            {/* ... */}

            <AnimatePresence>
                {isBooting && <BootSequence onComplete={() => setIsBooting(false)} speed={100} />}
            </AnimatePresence>

            <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-10" />

            <main className={`relative transition-all duration-1000 ${isBooting ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
                <div className="relative z-10 p-5 md:p-8 pb-32 space-y-6 max-w-[1700px] mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-h-border pb-5">
                        <div className="flex items-start gap-4">
                            <img src="/assets/images/logo.svg" alt="AnoHUB Logo" className="w-12 h-12 mt-1 object-contain" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-h-cyan rounded-full" />
                                    <span className="text-[9px] text-h-cyan font-mono font-bold uppercase tracking-[0.2em]">{t('dashboard.status_active')}</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase font-mono">{t('dashboard.title')}</h1>
                                <p className="text-[11px] text-slate-500 font-mono mt-1 tracking-wider">{t('dashboard.subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <FieldModeToggle />
                            <ModernButton
                                variant="secondary"
                                onClick={() => navigate('/maintenance/dashboard')}
                                className="text-[10px] py-2 flex items-center gap-2"
                            >
                                <Wrench className="w-3 h-3" />
                                {t('dashboard.performMaintenance', 'Perform Maintenance')}
                            </ModernButton>
                            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-wider">{t('dashboard.neural_link')}</span>
                            </div>
                            <ModernButton
                                variant="primary"
                                onClick={handleGenerateForensicPDF}
                                id="generate-forensic-pdf-exclusive"
                                className="btn-primary flex items-center gap-2 !px-4 !py-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                            >
                                <FileText className="w-3 h-3" />
                                {t('dashboard.export_forensic', 'Generate Forensic PDF')}
                            </ModernButton>
                            <ModernButton
                                variant="ghost"
                                onClick={handleExpertOverride}
                                id="expert-override-king"
                                className="!px-3 !py-2 text-[10px] ml-2"
                            >
                                {t('dashboard.override', 'Override')}
                            </ModernButton>
                        </div>
                    </header>

                    {/* Hierarchical Sidebar (War Room navigation) */}
                    <aside className={`fixed left-4 top-28 z-40 w-56 h-[70vh] overflow-auto bg-h-panel border border-h-border rounded-lg p-3 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-mono font-bold">Systems</div>
                            <button className="text-xs text-slate-400" onClick={() => setSidebarOpen(s => !s)}>{sidebarOpen ? 'Hide' : 'Show'}</button>
                        </div>
                        <nav>
                            <ul className="space-y-1">
                                {renderTreeNode(assetTree)}
                            </ul>
                        </nav>
                    </aside>

                    <HeritagePrecisionBanner currentAlignment={currentAlignment} onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT))} />
                    {/* Truth Badge: show Probability of Failure and confidence when high */}
                    {pf !== null ? (
                        <div className="mt-3 flex items-center gap-3">
                            <div className="px-3 py-2 bg-red-900/10 border border-red-600/20 rounded text-red-300 text-sm font-mono inline-flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-400" />
                                <div>
                                    <div className="text-[10px] uppercase font-bold">Probability of Failure</div>
                                    <div className="font-black text-lg">{pf.toFixed(2)}%</div>
                                </div>
                            </div>
                            {forecast && (forecast.confidence || 0) >= 0.95 && sampleCount && sampleCount >= 720 ? (
                                <div className="px-3 py-2 bg-emerald-900/10 border border-emerald-500/20 rounded text-emerald-300 text-sm font-mono inline-flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold">High Confidence</div>
                                        <div className="font-mono">Verified — {sampleCount} hourly samples</div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {(() => {
                        const crossSectorEffects = CrossSectorEngine.analyzeCrossSectorEffects({
                            alignment: currentAlignment,
                            vibration: mechanical?.vibration ?? undefined,
                            bearingTemp: mechanical?.bearingTemp ?? undefined,
                            gridFrequency: scadaFrequency
                        });
                        if (crossSectorEffects.length === 0) return null;
                        return (
                            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-widest">CROSS-SECTOR DOMINO EFFECT</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {crossSectorEffects.slice(0, 4).map((effect, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-white/5">
                                            <div className="flex-shrink-0 w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                                <Thermometer className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{effect.sourceSector} → {effect.affectedSector}</div>
                                                <p className="text-[11px] text-amber-300 font-mono mt-0.5 leading-relaxed">{effect.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                        <div className="lg:col-span-4">
                            <div className="bg-h-panel border border-h-border rounded-xl overflow-hidden h-full">
                                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">{t('dashboard.topology.title')}</h3>
                                        <span className="text-xs text-h-cyan font-mono">{t('dashboard.topology.digital_twin')}</span>
                                    </div>
                                    <button onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)} className="text-[9px] text-h-cyan/70 hover:text-h-cyan font-mono uppercase flex items-center gap-1">
                                        {t('dashboard.topology.full_view')} <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                                <div ref={threeContainerRef} className="relative w-full h-[320px] md:h-[380px]">
                                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Loading 3D…</div>}>
                                        <TurbineRunner3D
                                            {...{
                                                rpm: mechanical?.rpm ?? 500,
                                                diagnosticHighlights: {
                                                    oil: unifiedDiagnosis?.expertInsights?.oilHealth ?? undefined,
                                                    cavitation: unifiedDiagnosis?.expertInsights?.cavitationSeverity === 'CRITICAL' ? 20 : (unifiedDiagnosis?.expertInsights?.cavitationSeverity === 'WARNING' ? 50 : 100),
                                                    structural: unifiedDiagnosis?.expertInsights?.structuralSafetyFactor ?? undefined
                                                },
                                                investigatedComponents: investigatedComponents ?? []
                                            } as any}
                                        />
                                    </Suspense>
                                </div>
                                <div className="grid grid-cols-2 border-t border-white/5">
                                    <div className="p-4 flex flex-col items-center border-r border-white/5">
                                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.rated_power')}</span>
                                        <span className="text-xl font-mono text-h-cyan font-black">{(assetIdentity?.ratedPowerMW ?? 4.2).toFixed(1)}<span className="text-[10px] text-slate-500 ml-1">MW</span></span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center">
                                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.grid_freq')}</span>
                                        <span className={`text-xl font-mono font-black ${Math.abs(scadaFrequency - 50) > 0.5 ? 'text-h-yellow' : 'text-h-green'}`}>
                                            {scadaFrequency.toFixed(2)}<span className="text-[10px] text-slate-500 ml-1">Hz</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-5">
                            <AIInsightsPanel />
                            <Suspense fallback={<div className="h-48 bg-gray-900/10 rounded animate-pulse" />}>
                                <RevenueImpactCard className="rounded-xl shadow-2xl" />
                            </Suspense>

                            {/* NC-11.0 Strategic Bridge */}
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <StrategicPrescription
                                            netProfitRate={1250.50}
                                            profitHealthRatio={1.8}
                                            molecularDebtRate={45.20}
                                            recommendations={[
                                                { action: 'Increase Load +2%', impact: 'Market Spike Capture', expectedSavings: 340, confidence: 0.92 }
                                            ]}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <MoneySavedTicker molecularDebtRateEur={45.20} baselineWearRateEur={60} />
                                    </div>
                                </div>
                                <ShadowRealityChart data={shadowData} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.active_power')}
                                    value={(assetIdentity?.ratedPowerMW ?? 4.2).toFixed(1)}
                                    unit="MW"
                                    icon={<Zap className="w-4 h-4 text-h-cyan" />}
                                    status="nominal"
                                    trendData={trendData.power}
                                    subtitle={`IEC 60041 • ${t('dashboard.kpi.active_power_sub')}`}
                                    onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                                    actionMenu={crossActions}
                                />
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.system_health')}
                                    value={scadaDiagnostics?.healthScore ?? 85}
                                    unit="%"
                                    icon={<Activity className={`w-4 h-4 ${(scadaDiagnostics?.healthScore ?? 85) < 50 ? 'text-h-red' : 'text-h-green'}`} />}
                                    status={(scadaDiagnostics?.healthScore ?? 85) < 50 ? 'critical' : (scadaDiagnostics?.healthScore ?? 85) < 80 ? 'warning' : 'nominal'}
                                    trendData={trendData.health}
                                    subtitle="ISO 10816-3"
                                    onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)}
                                    actionMenu={crossActions}
                                    eventMarkers={eventMarkers}
                                />
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.net_head')}
                                    value={scadaHead.toFixed(1)}
                                    unit="m"
                                    icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                                    status="nominal"
                                    trendData={trendData.head}
                                    subtitle={`Q: ${scadaFlow.toFixed(1)} m³/s`}
                                    onClick={() => navigate(getFrancisPath(ROUTES.FRANCIS.HUB))}
                                    actionMenu={crossActions}
                                />
                            </div>

                            <div className="bg-h-panel border border-h-border rounded-lg p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-1">{t('dashboard.kpi.performance_gap')}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-3xl font-black font-mono ${(livePhysics?.performanceGap?.toNumber() ?? 0) > 98 ? 'text-h-green' : 'text-h-yellow'}`}>{(livePhysics?.performanceGap?.toNumber() ?? 96.5).toFixed(1)}%</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{t('dashboard.kpi.vs_design')}</span>
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <div className="h-3 bg-h-dark rounded overflow-hidden relative">
                                            <motion.div className="h-full bg-gradient-to-r from-h-green to-h-cyan" initial={{ width: 0 }} animate={{ width: `${Math.min(100, livePhysics?.performanceGap?.toNumber() ?? 96.5)}%` }} transition={{ duration: 0.5 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pelton Live Efficiency Preview */}
                            {peltonPreview ? (
                                <div className="bg-h-panel border border-h-border rounded-lg p-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest">Live Efficiency Gain</div>
                                            <div className="text-2xl font-mono font-black text-h-cyan">{(peltonPreview.gain || 0).toFixed(2)}% <span className="text-sm text-slate-400 font-normal">vs baseline</span></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-slate-500 uppercase font-mono">Recommended Mode</div>
                                            <div className={`mt-1 px-3 py-1 rounded font-mono font-black ${peltonPreview.decision.mode === 'PERFORMANCE' ? 'bg-h-cyan text-slate-900' : peltonPreview.decision.mode === 'BALANCE' ? 'bg-h-green text-slate-900' : 'bg-h-yellow text-slate-900'}`}>{peltonPreview.decision.mode}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-400 font-mono">Expected net: {(peltonPreview.decision.expectedNetBenefitEurPerHour || 0).toFixed(2)} €/h — sequence: {peltonPreview.seq.activeNozzles} nozzles</div>
                                </div>
                            ) : null}

                            {/* Logistics & Brake Readiness */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-h-panel border border-h-border rounded-lg p-4">
                                    <div className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-2">Logistics Status</div>
                                    {logisticsPreview ? (
                                        <div>
                                            <div className="text-sm text-slate-300">Spares Suggested: {logisticsPreview.spares.length}</div>
                                            <div className="text-xs text-slate-400">Bundle recommendations: {(logisticsPreview.outage.bundles || []).length}</div>
                                        </div>
                                    ) : <div className="text-sm text-slate-500">No data</div>}
                                </div>

                                <div className="bg-h-panel border border-h-border rounded-lg p-4">
                                    <div className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-2">Brake System Readiness</div>
                                    {brakePreview ? (
                                        <div>
                                            <div className={`text-lg font-mono font-black ${brakePreview.readiness.ready ? 'text-h-green' : 'text-h-yellow'}`}>{brakePreview.readiness.ready ? 'READY' : 'NOT READY'}</div>
                                            <div className="text-xs text-slate-400">Pad wear: {brakePreview.padWear}% — Pressure: {brakePreview.pressure} bar</div>
                                        </div>
                                    ) : <div className="text-sm text-slate-500">No data</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.axial_thrust')}
                                    value={(livePhysics?.axialThrustKN?.toNumber() ?? 145).toFixed(0)}
                                    unit="kN"
                                    icon={<Gauge className="w-4 h-4 text-h-purple" />}
                                    status={(livePhysics?.axialThrustKN?.toNumber() ?? 0) > 200 ? 'critical' : (livePhysics?.axialThrustKN?.toNumber() ?? 0) > 180 ? 'warning' : 'nominal'}
                                    trendData={trendData.thrust}
                                    subtitle={t('dashboard.kpi.axial_thrust_sub')}
                                    onClick={() => {
                                        try {
                                            window.dispatchEvent(new CustomEvent('openDossier', { detail: { keyword: 'penstock' } }));
                                        } catch (err) {
                                            console.error('[ExecutiveDashboard] Failed to dispatch openDossier event:', err);
                                        }
                                    }}
                                />
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.structural_life')}
                                    value={(structural?.remainingLife ?? 87.5).toFixed(1)}
                                    unit="%"
                                    icon={<Hammer className="w-4 h-4 text-h-gold" />}
                                    status={(structural?.remainingLife ?? 0) < 50 ? 'critical' : (structural?.remainingLife ?? 0) < 75 ? 'warning' : 'nominal'}
                                    subtitle={t('dashboard.kpi.structural_life_sub')}
                                    onClick={() => {
                                        try {
                                            window.dispatchEvent(new CustomEvent('openDossier', { detail: { keyword: 'generator' } }));
                                        } catch (err) {
                                            console.error('[ExecutiveDashboard] Failed to dispatch openDossier event:', err);
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3 text-h-red" />
                                    Forensic Engineering Metrics
                                </h3>
                                <Suspense fallback={<div className="text-sm text-slate-400">Loading metrics…</div>}>
                                    <SecondaryMetricsGrid />
                                </Suspense>
                            </div>

                            {/* Guardian Confidence Scores */}
                            {(unifiedDiagnosis as any)?.guardianConfidence ? (
                                <div className="bg-h-panel border border-h-border rounded-lg p-4">
                                    <h3 className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest mb-3 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-h-cyan" />
                                        Guardian Confidence Scores
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(unifiedDiagnosis as any).guardianConfidence.shaftSeal !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5">
                                                <span className="text-[9px] text-slate-400 font-mono uppercase">Shaft Seal</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.shaftSeal >= 80) ? 'text-h-green' : ((unifiedDiagnosis as any).guardianConfidence.shaftSeal >= 60) ? 'text-h-yellow' : 'text-h-red'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.shaftSeal).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {(unifiedDiagnosis as any).guardianConfidence.governorHPU !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5">
                                                <span className="text-[9px] text-slate-400 font-mono uppercase">Governor HPU</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.governorHPU >= 80) ? 'text-h-green' : ((unifiedDiagnosis as any).guardianConfidence.governorHPU >= 60) ? 'text-h-yellow' : 'text-h-red'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.governorHPU).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {(unifiedDiagnosis as any).guardianConfidence.statorInsulation !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5">
                                                <span className="text-[9px] text-slate-400 font-mono uppercase">Stator Insulation</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.statorInsulation >= 80) ? 'text-h-green' : ((unifiedDiagnosis as any).guardianConfidence.statorInsulation >= 60) ? 'text-h-yellow' : 'text-h-red'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.statorInsulation).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {(unifiedDiagnosis as any).guardianConfidence.transformerOil !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5">
                                                <span className="text-[9px] text-slate-400 font-mono uppercase">Transformer Oil</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.transformerOil >= 80) ? 'text-h-green' : ((unifiedDiagnosis as any).guardianConfidence.transformerOil >= 60) ? 'text-h-yellow' : 'text-h-red'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.transformerOil).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            <Suspense fallback={<div className="text-sm text-slate-400">Loading vibration analyzer…</div>}>
                                <VibrationAnalyzer />
                            </Suspense>
                        </div>

                        <div className="lg:col-span-3 flex flex-col gap-5">
                            {/* Wisdom Feed */}
                            <div className="bg-h-panel border border-h-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-h-cyan" />
                                        <div className="text-[10px] text-slate-400 font-mono font-black uppercase">Wisdom Feed</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-[9px] text-slate-500 font-mono">{wisdomReport ? new Date(wisdomReport.generatedAt).toLocaleString() : '—'}</div>
                                        <button
                                            className="text-[10px] px-2 py-1 bg-h-panel/40 border border-h-border rounded text-slate-300"
                                            onClick={async () => {
                                                try {
                                                    const adapter = new SovereignAuditAdapter();
                                                    const id = (unifiedDiagnosis as any)?.persistedWisdomId || wisdomReport?.id;
                                                    if (id) {
                                                        const entry = adapter.getById(id);
                                                        if (entry) {
                                                            setWisdomReport(entry.report);
                                                            setDossierKeyword(entry.id);
                                                            setDossierOpen(true);
                                                            // Ensure canonical internal link (non-destructive attempt)
                                                            try {
                                                                const canonical = 'https://app.anohubs.com' + window.location.pathname + window.location.search + `#dossier=${entry.id}`;
                                                                // Try to normalise history URL to canonical (may throw if cross-origin replace not allowed)
                                                                try { window.history.replaceState({}, '', canonical); } catch (_) { /* ignore */ }
                                                            } catch (_) { /* ignore */ }
                                                            setTimeout(() => scrollToAuditEntry(entry.id), 250);
                                                            return;
                                                        }
                                                    }
                                                    setDossierOpen(true);
                                                    const all = adapter.getAuditLog();
                                                    const assetFiltered = selectedAsset ? all.filter(a => (a.assetId || a.report?.assetId) == selectedAsset.id) : all;
                                                    if (assetFiltered.length) {
                                                        const latest = assetFiltered[assetFiltered.length - 1];
                                                        setWisdomReport(latest.report);
                                                        setDossierKeyword(latest.id);
                                                        setTimeout(() => scrollToAuditEntry(latest.id), 250);
                                                    }
                                                } catch (err) { console.warn('Forensic fetch failed', err); setDossierOpen(true); }
                                            }}
                                        >
                                            View Forensic Dossier
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {wisdomReport && wisdomReport.entries && wisdomReport.entries.length ? (
                                        wisdomReport.entries.slice(0, 6).map((e: any, idx: number) => (
                                            <div key={idx} className={`p-2 rounded border ${e.severity === 'CRITICAL' ? 'border-rose-600 bg-rose-900/5' : 'border-amber-600 bg-amber-900/5'}`} onMouseEnter={() => setHoveredEntry(idx)} onMouseLeave={() => setHoveredEntry(null)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-mono font-bold">{e.title}</div>
                                                        {e.contextualNote ? <Crown className="w-3 h-3 text-yellow-400" /> : null}
                                                    </div>
                                                    <div className="text-xs font-mono text-slate-400">{e.severity}</div>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-1">{e.recommendedAction || e.legacyTip}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-slate-500">No wisdom to display.</div>
                                    )}
                                </div>
                            </div>

                            {/* Audit History */}
                            <div className="bg-h-panel border border-h-border rounded-xl p-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-h-cyan" />
                                        <div className="text-[10px] text-slate-400 font-mono font-black uppercase">Audit History</div>
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-mono">{auditLog && auditLog.length ? `${auditLog.length} entries` : '—'}</div>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {auditLog && auditLog.length ? (
                                        auditLog.slice(0, 12).map((entry: any, idx: number) => {
                                            const report = entry.report || {};
                                            const conf = report.systemConfidence && typeof report.systemConfidence.score === 'number' ? report.systemConfidence.score : (report.systemConfidence?.score || null);
                                            // heuristically detect sovereign mode
                                            const text = JSON.stringify(report).toLowerCase();
                                            const mode = /eco|economy|efficiency/.test(text) ? 'Eco' : (/performance|turbo|max/.test(text) ? 'Performance' : 'Unknown');
                                            const summary = report.executiveSummary || (report.entries && report.entries[0] && `${report.entries[0].title} — ${report.entries[0].legacyTip}`) || 'No summary';
                                            const lowConfidence = typeof conf === 'number' && conf < 70;
                                            return (
                                                <div ref={idx === 0 ? auditListRef : null} data-entry-id={entry.id} key={entry.id || idx} className={`p-2 rounded border ${lowConfidence ? 'border-rose-600 bg-rose-900/5' : 'border-slate-700 bg-slate-900/5'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm font-mono font-bold">{new Date(entry.timestamp).toLocaleString()}</div>
                                                            <div className="text-xs text-slate-400 font-mono">Mode: <span className="font-bold text-slate-200 ml-1">{mode}</span></div>
                                                        </div>
                                                        <div className="text-xs font-mono">
                                                            Confidence: <span className={`font-bold ${lowConfidence ? 'text-rose-400' : 'text-emerald-300'}`}>{conf !== null && conf !== undefined ? `${conf}%` : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-1">{summary}</div>
                                                    {lowConfidence ? (
                                                        <div className="mt-2 text-rose-300 text-[11px] font-mono font-bold">⚠️ Manual Verification Required</div>
                                                    ) : null}
                                                    <div className="mt-2 text-[10px] text-slate-500 font-mono">ID: {entry.id}</div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-slate-500">No audit history available.</div>
                                    )}
                                </div>
                            </div>

                            <ScenarioController />
                            <div className="bg-h-panel border border-h-border rounded-xl p-5 shadow-inner">
                                <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-h-green" />
                                    {t('dashboard.live_telemetry')}
                                </h3>
                                <div className="space-y-4">
                                    <LiveMetricToken sensorId="PRE-202-B" />
                                    <LiveMetricToken sensorId="PT-101" />
                                    <LiveMetricToken sensorId="TMP-404-X" />
                                </div>
                            </div>
                            <GlassCard title={t('dashboard.finance.title')} icon={<DollarSign className="w-4 h-4 text-h-gold" />} className="border-h-gold/20 bg-h-gold/5">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">{t('dashboard.finance.maint_buffer')}</div>
                                        <div className="text-lg font-mono text-h-gold font-bold">{(financials?.maintenanceBufferEuro ?? 45000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <div>
                                        {/* Engineering Notebook Overlay (hover) */}
                                        {wisdomReport && typeof hoveredEntry === 'number' && wisdomReport.entries && wisdomReport.entries[hoveredEntry] ? (
                                            <div className="fixed right-6 bottom-6 w-96 bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/6 rounded-lg p-4 shadow-2xl z-50">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-[11px] font-mono text-slate-300 font-bold">{wisdomReport.entries[hoveredEntry].title}</div>
                                                        <div className="text-xs text-slate-400 mt-1">{wisdomReport.entries[hoveredEntry].severity} — {wisdomReport.entries[hoveredEntry].contextualNote || ''}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Crown className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-sm text-slate-200">
                                                    <div className="font-mono font-semibold mb-1">Mechanical Explanation</div>
                                                    <div className="text-slate-300 text-sm leading-snug">{wisdomReport.entries[hoveredEntry].mechanicalExplanation}</div>
                                                    <div className="font-mono font-semibold mt-3 mb-1">Legacy Tip</div>
                                                    <div className="text-slate-300 text-sm leading-snug">{wisdomReport.entries[hoveredEntry].legacyTip}</div>
                                                </div>
                                            </div>
                                        ) : null}
                                        <div className="text-[9px] text-slate-500 uppercase font-mono font-black mb-1">{t('dashboard.finance.annual_loss')}</div>
                                        <div className="text-base font-mono text-white font-bold">{(financials?.lostRevenueEuro ?? 12500).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <div className="pt-3 border-t border-h-gold/20">
                                        <div className="text-[9px] text-h-green uppercase font-mono font-black mb-1 flex items-center justify-between">
                                            {t('dashboard.finance.predictive_savings')}<TrendingDown className="w-3 h-3" />
                                        </div>
                                        <div className="text-lg font-mono text-h-green font-bold">{(financials?.maintenanceSavingsEuro ?? 28000).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                </div>
                            </GlassCard>
                            <MaintenanceTimeline />
                            <EngineeringWisdomVault />
                            <SmartManual />
                        </div>
                    </div>

                    {/* Emergency Mode Banner */}
                    {highRisk ? (
                        <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
                            <div className="mt-24 bg-rose-900/90 border border-rose-700 rounded-lg p-4 text-white max-w-3xl pointer-events-auto shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                    <div>
                                        <div className="font-black text-lg">HIGH-RISK EMERGENCY MODE</div>
                                        <div className="text-sm opacity-90">Probability of failure exceeded threshold — prioritize emergency actions and SOPs.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Dossier Drawer (right) */}
                    <div className={`fixed top-20 right-4 z-50 w-[520px] h-[80vh] bg-h-panel border border-h-border rounded-lg shadow-2xl p-4 transition-transform ${dossierOpen ? 'translate-x-0' : 'translate-x-96'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-mono font-bold">Engineering Dossier</div>
                            <div className="flex items-center gap-2">
                                <button className="text-xs text-slate-400" onClick={() => setDossierOpen(false)}>Close</button>
                            </div>
                        </div>
                        <div className="overflow-auto h-[calc(100%-48px)]">
                            <div className="text-[11px] text-slate-300 font-mono mb-2">Keyword: <span className="font-bold">{dossierKeyword || '—'}</span></div>
                            <div className="mb-3">
                                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Latest Telemetry</div>
                                <div className="text-sm text-slate-300">Alignment: {(mechanical?.alignment || 0).toFixed(3)} mm/m — Thrust: {(livePhysics?.axialThrustKN?.toNumber() || 0).toFixed(0)} kN</div>
                            </div>
                            <div className="mb-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Wisdom Report</div>
                                    <div>
                                        <button className="text-xs px-2 py-1 bg-h-panel/40 border border-h-border rounded text-slate-300" onClick={async () => {
                                            try {
                                                const adapter = new SovereignAuditAdapter();
                                                // if dossierKeyword looks like a persisted id, fetch directly
                                                let entry = null;
                                                if (dossierKeyword && dossierKeyword.startsWith('wisdom_')) entry = adapter.getById(dossierKeyword);
                                                // otherwise, if unifiedDiagnosis has a persisted id, use that
                                                if (!entry && (unifiedDiagnosis as any)?.persistedWisdomId) entry = adapter.getById((unifiedDiagnosis as any).persistedWisdomId);
                                                if (entry) {
                                                    // show entry.report in drawer
                                                    setWisdomReport(entry.report);
                                                    setDossierKeyword(entry.id);
                                                } else {
                                                    // fallback: show latest audit for selected asset
                                                    const all = adapter.getAuditLog();
                                                    const assetFiltered = selectedAsset ? all.filter(a => (a.assetId || a.report?.assetId) == selectedAsset.id) : all;
                                                    if (assetFiltered.length) {
                                                        setWisdomReport(assetFiltered[assetFiltered.length - 1].report);
                                                        setDossierKeyword(assetFiltered[assetFiltered.length - 1].id);
                                                    }
                                                }
                                            } catch (err) { console.warn('Forensic fetch failed', err); }
                                        }}>Forensic Audit</button>
                                    </div>
                                </div>
                                {wisdomReport ? (
                                    <div className="text-sm text-slate-300">
                                        <div className="font-bold mb-1">{wisdomReport.executiveSummary || 'Executive summary'}</div>
                                        <div className="text-xs text-slate-400 mb-2">Generated: {wisdomReport.generatedAt ? new Date(wisdomReport.generatedAt).toLocaleString() : '—'}</div>
                                        <div className="text-sm leading-snug">{wisdomReport.architectSummary || (wisdomReport.entries && wisdomReport.entries[0] && wisdomReport.entries[0].mechanicalExplanation) || 'No dossier content available.'}</div>
                                    </div>
                                ) : <div className="text-sm text-slate-500">No wisdom available.</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Confidence</div>
                                    <div className="text-sm text-slate-300">System Confidence: {(wisdomReport && wisdomReport.systemConfidence && typeof wisdomReport.systemConfidence.score === 'number') ? `${wisdomReport.systemConfidence.score}%` : 'N/A'}</div>
                                    <div className="text-xs text-slate-400 mt-2">Confidence Reason</div>
                                    <div className="text-sm text-slate-300 mt-1">{wisdomReport && wisdomReport.systemConfidence && Array.isArray(wisdomReport.systemConfidence.reasons) && wisdomReport.systemConfidence.reasons.length ? wisdomReport.systemConfidence.reasons.join('; ') : (wisdomReport && wisdomReport.systemConfidence && wisdomReport.systemConfidence.warning) || 'No specific reason available.'}</div>
                                    <div className="text-xs text-slate-400 mt-3">Legacy Tips</div>
                                    <div className="text-sm text-slate-300 mt-1">{wisdomReport && wisdomReport.entries && wisdomReport.entries[0] ? wisdomReport.entries[0].legacyTip : 'No legacy tips available.'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Mini Telemetry</div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-slate-400">Alignment</div>
                                        <div className="h-8 w-full bg-slate-900/20 rounded overflow-hidden">{renderSparkline((mechanical && (mechanical as any).alignmentSeries) || trendData.power)}</div>
                                        <div className="text-xs text-slate-400">Vibration</div>
                                        <div className="h-8 w-full bg-slate-900/20 rounded overflow-hidden">{renderSparkline((mechanical && (mechanical as any).vibrationSeries) || trendData.thrust, '#f97316')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Small Forecast Badge */}
                    {selectedAsset && forecast ? (
                        <div className="mt-3 space-y-2">
                            {/* Confidence Warning when insufficient samples or low confidence */}
                            {(forecast.confidence < 0.5 || (sampleCount !== null && sampleCount < 720)) ? (
                                <div className="px-3 py-2 bg-rose-900/10 border border-rose-600/20 rounded text-rose-300 text-sm font-mono inline-flex items-center gap-3">
                                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold">Confidence Warning</div>
                                        <div className="font-mono">Low Confidence ({(forecast.confidence || 0).toFixed(3)}) - Required 720 samples, found {sampleCount ?? 'N/A'}</div>
                                    </div>
                                </div>
                            ) : forecast.predictedTimestamp ? (
                                <div className="px-3 py-2 bg-amber-900/10 border border-amber-500/20 rounded text-amber-300 text-sm font-mono inline-flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                                    <div>
                                        <div className="text-[10px] uppercase">Predicted Efficiency Breach (90%)</div>
                                        <div className="font-bold">{new Date(forecast.predictedTimestamp).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Dec25 Critical Event Alert */}
                            {dec25Present ? (
                                <div className="px-3 py-2 bg-red-900/10 border border-red-600/20 rounded text-red-300 text-sm font-mono inline-flex items-center gap-3">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold">Model-Distorting Anomaly</div>
                                        <div className="font-mono">Dec 25 hourly spike detected — Investigate Flow Surge Impact</div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {/* NC-9.0: Trust & Authority Footer */}
                    <div className="pt-10">
                        <Suspense fallback={<div className="text-sm text-slate-400">Loading dossier…</div>}>
                            <EngineeringDossierCard />
                        </Suspense>
                    </div>
                </div>
            </main>
            <OptimizationHUD variant="overlay" />
        </div>
    );
};
