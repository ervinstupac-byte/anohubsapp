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
import { ProjectStateManager } from '../../core/ProjectStateManager';
import { useToast } from '../../stores/useAppStore';
import { BootSequence } from '../BootSequence';
import { createFrancisHorizontalAssetTree, AssetNode } from '../../models/AssetHierarchy';
import { dispatch, EVENTS } from '../../lib/events';

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
    console.log('Rendering ExecutiveDashboard');
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
    const safeFinancials = financials ?? {};
    const safeHydraulic = hydraulic ?? {};
    const safePhysics = livePhysics ?? {};
    const safeStructural = structural ?? {};
    const safeMechanical = mechanical ?? {};
    const safeSpecialized = specializedState ?? { sensors: {} as any };
    const safeIdentity = identity ?? {};
    const safeDiagnosis = diagnosis ?? {};
    const safeUnifiedDiagnosis = unifiedDiagnosis ?? {};

    const { selectedAsset } = useAssetContext() || { selectedAsset: null as any };
    const safeSelectedAsset = selectedAsset ?? null;
    const crossActions = useCrossModuleActions(safeSelectedAsset?.id);
    const assetIdentity = safeSelectedAsset?.specs?.machineConfig || safeIdentity?.machineConfig || { ratedPowerMW: 4.2 };

    const scadaFlow = safeSpecialized?.sensors?.flowRate ?? 42.5;
    const scadaHead = (safeSpecialized?.sensors as any)?.net_head ?? safeSpecialized?.sensors?.draft_tube_pressure ?? 152.0;
    const scadaFrequency = safeSpecialized?.sensors?.gridFrequency ?? 50.0;

    // Pelton optimizer preview (Live Efficiency Gain + Market Mode)
    const peltonPreview = React.useMemo(() => {
        try {
            const jetPressureBar = (safeSpecialized?.sensors as any)?.jetPressureBar || scadaHead * 0.0980665; // m -> bar approx
            const needlePct = (safeSpecialized?.sensors as any)?.needlePositionPct || 100;
            const activeNozzles = (safeSpecialized?.sensors as any)?.activeNozzles || 1;
            const shellVibrationMm = (safeSpecialized?.sensors as any)?.shellVibrationMm || (safeMechanical?.vibration || 0);
            const bucketHours = (safeIdentity?.machineConfig as any)?.totalOperatingHours || 0;

            const input = { jetPressureBar, needlePositionPct: needlePct, activeNozzles, shellVibrationMm, bucketHours };
            const seq = PeltonPhysicsOptimizer.optimizeNozzles(input);
            const baseline = PeltonPhysicsOptimizer.optimizeNozzles({ ...input, activeNozzles: activeNozzles }).expectedEfficiencyPct;
            const oracle = { hourlyPricesEurPerMWh: [((safeFinancials as any)?.marketPriceEurPerMWh || ((safeFinancials as any)?.energyPrice) || 50)] };
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

            // NC-20900: Francis Big Brother Engine Activation
            // We instantiate it to ensure the logic path is active and available for forensic audits
            /*
            import('../../lib/engines/FrancisBigBrotherEngine').then(({ FrancisBigBrotherEngine }) => {
                const bigBrother = new FrancisBigBrotherEngine();
                console.log('[ExecutiveDashboard] 👁️ Francis Big Brother Engine ONLINE. Monitoring Auxiliary Systems:', bigBrother.variant);
            });
            */

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
        window.addEventListener(EVENTS.OPEN_DOSSIER, handler as any);
        return () => window.removeEventListener(EVENTS.OPEN_DOSSIER, handler as any);
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
            dispatch.expertFeedbackRecorded({ guardianKey });
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
            <div className="fixed top-4 right-4 bg-black/90 border border-status-ok/50 text-white px-3 py-1 rounded-none text-sm z-50 font-mono">
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

    // Simulated Shadow Data
    const shadowData = useMemo(() => Array.from({ length: 15 }, (_, i) => ({ timestamp: i, deltaP: (Math.random() - 0.4) * 20 })), []);

    // Simulate an AI action triggering every 30s for demo
    React.useEffect(() => {
        const t = setInterval(() => {
            // Only trigger if we are in a mode that supports it (simulated check)
            if (Math.random() > 0.7 && !pendingAction) {
                setPendingAction({ id: `ACT-${Date.now()}`, desc: 'Adjust Nozzle Sequence: 1-3-5 (Efficiency +1.2%)' });
            }
        }, 30000);
        return () => clearInterval(t);
    }, [pendingAction]);

    // ... existing renders ...

    return (
        <div className="relative min-h-screen bg-scada-bg text-scada-text overflow-x-hidden font-sans">
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

            <div className="relative z-10 p-4 md:p-6 pb-32 space-y-4 max-w-[1700px] mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-scada-border pb-4 bg-scada-panel/50 p-4 border-l-4 border-l-status-info">
                        <div className="flex items-start gap-4">
                            <img src="/assets/images/logo.svg" alt="AnoHUB Logo" className="w-10 h-10 mt-1 object-contain grayscale opacity-80" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-status-ok rounded-none" />
                                    <span className="text-[10px] text-status-ok font-mono font-bold uppercase tracking-widest">{t('dashboard.status_active')}</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-scada-text tracking-tight uppercase font-header">{t('dashboard.title')}</h1>
                                <p className="text-xs text-scada-muted font-mono mt-0.5 tracking-wider">{t('dashboard.subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <FieldModeToggle />
                            <ModernButton
                                variant="secondary"
                                onClick={() => navigate('/maintenance/dashboard')}
                                className="text-[10px] py-2 flex items-center gap-2 rounded-none border-scada-border hover:bg-scada-border"
                            >
                                <Wrench className="w-3 h-3" />
                                {t('dashboard.performMaintenance', 'MAINTENANCE')}
                            </ModernButton>
                            <div className="px-3 py-1.5 bg-scada-panel border border-status-ok/30 rounded-none flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-status-ok rounded-none" />
                                <span className="text-[10px] text-status-ok font-mono font-bold uppercase tracking-wider">{t('dashboard.neural_link')}</span>
                            </div>
                            <ModernButton
                                variant="primary"
                                onClick={handleGenerateForensicPDF}
                                id="generate-forensic-pdf-exclusive"
                                className="btn-primary flex items-center gap-2 !px-4 !py-2 rounded-none border border-status-ok bg-status-ok/10 hover:bg-status-ok/20 text-status-ok shadow-none"
                            >
                                <FileText className="w-3 h-3" />
                                {t('dashboard.export_forensic', 'GENERATE FORENSIC PDF')}
                            </ModernButton>
                            <ModernButton
                                variant="ghost"
                                onClick={handleExpertOverride}
                                id="expert-override-king"
                                className="!px-3 !py-2 text-[10px] ml-2 rounded-none border border-scada-border text-scada-muted hover:text-scada-text hover:bg-scada-border"
                            >
                                {t('dashboard.override', 'OVERRIDE')}
                            </ModernButton>
                        </div>
                    </header>

                    {/* Hierarchical Sidebar (War Room navigation) */}
                    <aside className={`fixed left-4 top-28 z-40 w-56 h-[70vh] overflow-auto bg-scada-panel border border-scada-border rounded-none p-3 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-mono font-bold uppercase text-scada-text">Systems</div>
                            <button className="text-xs text-scada-muted hover:text-white uppercase font-mono" onClick={() => setSidebarOpen(s => !s)}>{sidebarOpen ? 'Hide' : 'Show'}</button>
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
                            <div className="px-3 py-2 bg-status-error/10 border border-status-error rounded-none text-status-error text-sm font-mono inline-flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-status-error" />
                                <div>
                                    <div className="text-[10px] uppercase font-bold">Probability of Failure</div>
                                    <div className="font-black text-lg tabular-nums">{pf.toFixed(2)}%</div>
                                </div>
                            </div>
                            {forecast && (forecast.confidence || 0) >= 0.95 && sampleCount && sampleCount >= 720 ? (
                                <div className="px-3 py-2 bg-status-ok/10 border border-status-ok rounded-none text-status-ok text-sm font-mono inline-flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-status-ok" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold">High Confidence</div>
                                        <div className="font-mono tabular-nums">Verified — {sampleCount} hourly samples</div>
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
                            <div className="bg-scada-panel border border-status-warning rounded-none p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-4 h-4 text-status-warning" />
                                    <span className="text-[10px] text-status-warning font-mono font-black uppercase tracking-widest">CROSS-SECTOR DOMINO EFFECT</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {crossSectorEffects.slice(0, 4).map((effect, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-scada-bg rounded-none border border-scada-border">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-none bg-status-warning/10 border border-status-warning/30 flex items-center justify-center">
                                                <Thermometer className="w-4 h-4 text-status-warning" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] text-scada-muted font-mono uppercase tracking-wider">{effect.sourceSector} → {effect.affectedSector}</div>
                                                <p className="text-[11px] text-status-warning font-mono mt-0.5 leading-relaxed">{effect.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                        <div className="lg:col-span-4">
                            <div className="bg-scada-panel border border-scada-border rounded-none overflow-hidden h-full">
                                <div className="px-5 py-4 border-b border-scada-border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[10px] text-scada-muted font-mono font-black uppercase tracking-widest">{t('dashboard.topology.title')}</h3>
                                        <span className="text-xs text-status-info font-mono">{t('dashboard.topology.digital_twin')}</span>
                                    </div>
                                    <button onClick={() => navigate(`/${ROUTES.DIAGNOSTIC_TWIN}`)} className="text-[9px] text-status-info/70 hover:text-status-info font-mono uppercase flex items-center gap-1">
                                        {t('dashboard.topology.full_view')} <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                                <div ref={threeContainerRef} className="relative w-full h-[320px] md:h-[380px]">
                                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-sm text-scada-muted">Loading 3D…</div>}>
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
                                <div className="grid grid-cols-2 border-t border-scada-border">
                                    <div className="p-4 flex flex-col items-center border-r border-scada-border">
                                        <span className="text-[8px] text-scada-muted uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.rated_power')}</span>
                                        <span className="text-xl font-mono text-status-info font-black tabular-nums">{(assetIdentity?.ratedPowerMW ?? 4.2).toFixed(1)}<span className="text-[10px] text-scada-muted ml-1">MW</span></span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center">
                                        <span className="text-[8px] text-scada-muted uppercase font-mono tracking-widest mb-1">{t('dashboard.topology.grid_freq')}</span>
                                        <span className={`text-xl font-mono font-black tabular-nums ${Math.abs(scadaFrequency - 50) > 0.5 ? 'text-status-warning' : 'text-status-ok'}`}>
                                            {scadaFrequency.toFixed(2)}<span className="text-[10px] text-scada-muted ml-1">Hz</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-5">
                            <AIInsightsPanel />
                            <Suspense fallback={<div className="h-48 bg-gray-900/10 rounded-none animate-pulse" />}>
                                <RevenueImpactCard className="rounded-none shadow-none" />
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
                                    icon={<Zap className="w-4 h-4 text-status-info" />}
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
                                    icon={<Activity className={`w-4 h-4 ${(scadaDiagnostics?.healthScore ?? 85) < 50 ? 'text-status-error' : 'text-status-ok'}`} />}
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

                            <div className="bg-scada-panel border border-scada-border rounded-none p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-[9px] text-scada-muted uppercase font-mono font-black tracking-widest mb-1">{t('dashboard.kpi.performance_gap')}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-3xl font-black font-mono tabular-nums ${(livePhysics?.performanceGap ?? 0) > 98 ? 'text-status-ok' : 'text-status-warning'}`}>{(livePhysics?.performanceGap ?? 96.5).toFixed(1)}%</span>
                                            <span className="text-[9px] text-scada-muted font-mono">{t('dashboard.kpi.vs_design')}</span>
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <div className="h-3 bg-scada-bg rounded-none overflow-hidden relative">
                                            <div className="h-full bg-status-ok transition-all duration-500" style={{ width: `${Math.min(100, livePhysics?.performanceGap ?? 96.5)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pelton Live Efficiency Preview */}
                            {peltonPreview ? (
                                <div className="bg-scada-panel border border-scada-border rounded-none p-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div className="text-[9px] text-scada-muted uppercase font-mono font-black tracking-widest">Live Efficiency Gain</div>
                                            <div className="text-2xl font-mono font-black text-status-info tabular-nums">{(peltonPreview.gain || 0).toFixed(2)}% <span className="text-sm text-scada-muted font-normal">vs baseline</span></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-scada-muted uppercase font-mono">Recommended Mode</div>
                                            <div className={`mt-1 px-3 py-1 rounded-none font-mono font-black ${peltonPreview.decision.mode === 'PERFORMANCE' ? 'bg-status-info text-scada-bg' : peltonPreview.decision.mode === 'BALANCE' ? 'bg-status-ok text-scada-bg' : 'bg-status-warning text-scada-bg'}`}>{peltonPreview.decision.mode}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-scada-muted font-mono">Expected net: {(peltonPreview.decision.expectedNetBenefitEurPerHour || 0).toFixed(2)} €/h — sequence: {peltonPreview.seq.activeNozzles} nozzles</div>
                                </div>
                            ) : null}

                            {/* Logistics & Brake Readiness */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-scada-panel border border-scada-border rounded-none p-4">
                                    <div className="text-[9px] text-scada-muted uppercase font-mono font-black tracking-widest mb-2">Logistics Status</div>
                                    {logisticsPreview ? (
                                        <div>
                                            <div className="text-sm text-slate-300">Spares Suggested: {logisticsPreview.spares.length}</div>
                                            <div className="text-xs text-scada-muted">Bundle recommendations: {(logisticsPreview.outage.bundles || []).length}</div>
                                        </div>
                                    ) : <div className="text-sm text-scada-muted">No data</div>}
                                </div>

                                <div className="bg-scada-panel border border-scada-border rounded-none p-4">
                                    <div className="text-[9px] text-scada-muted uppercase font-mono font-black tracking-widest mb-2">Brake System Readiness</div>
                                    {brakePreview ? (
                                        <div>
                                            <div className={`text-lg font-mono font-black ${brakePreview.readiness.ready ? 'text-status-ok' : 'text-status-warning'}`}>{brakePreview.readiness.ready ? 'READY' : 'NOT READY'}</div>
                                            <div className="text-xs text-scada-muted">Pad wear: {brakePreview.padWear}% — Pressure: {brakePreview.pressure} bar</div>
                                        </div>
                                    ) : <div className="text-sm text-scada-muted">No data</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <EngineeringCard
                                    variant="instrument"
                                    title={t('dashboard.kpi.axial_thrust')}
                                    value={(livePhysics?.axialThrustKN ?? 145).toFixed(0)}
                                    unit="kN"
                                    icon={<Gauge className="w-4 h-4 text-h-purple" />}
                                    status={(livePhysics?.axialThrustKN ?? 0) > 200 ? 'critical' : (livePhysics?.axialThrustKN ?? 0) > 180 ? 'warning' : 'nominal'}
                                    trendData={trendData.thrust}
                                    subtitle={t('dashboard.kpi.axial_thrust_sub')}
                                    onClick={() => {
                                        try {
                                            dispatch.openDossier({ keyword: 'penstock' });
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
                                            dispatch.openDossier({ keyword: 'generator' });
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
                                <div className="bg-scada-panel border border-scada-border rounded-none p-4">
                                    <h3 className="text-[9px] text-scada-muted uppercase font-mono font-black tracking-widest mb-3 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-status-info" />
                                        Guardian Confidence Scores
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(unifiedDiagnosis as any).guardianConfidence.shaftSeal !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-scada-bg rounded-none border border-scada-border">
                                                <span className="text-[9px] text-scada-muted font-mono uppercase">Shaft Seal</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.shaftSeal >= 80) ? 'text-status-ok' : ((unifiedDiagnosis as any).guardianConfidence.shaftSeal >= 60) ? 'text-status-warning' : 'text-status-error'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.shaftSeal).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {(unifiedDiagnosis as any).guardianConfidence.governorHPU !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-scada-bg rounded-none border border-scada-border">
                                                <span className="text-[9px] text-scada-muted font-mono uppercase">Governor HPU</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.governorHPU >= 80) ? 'text-status-ok' : ((unifiedDiagnosis as any).guardianConfidence.governorHPU >= 60) ? 'text-status-warning' : 'text-status-error'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.governorHPU).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {(unifiedDiagnosis as any).guardianConfidence.statorInsulation !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-scada-bg rounded-none border border-scada-border">
                                                <span className="text-[9px] text-scada-muted font-mono uppercase">Stator Insulation</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.statorInsulation >= 80) ? 'text-status-ok' : ((unifiedDiagnosis as any).guardianConfidence.statorInsulation >= 60) ? 'text-status-warning' : 'text-status-error'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.statorInsulation).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {(unifiedDiagnosis as any).guardianConfidence.transformerOil !== undefined && (
                                            <div className="flex items-center justify-between p-2 bg-scada-bg rounded-none border border-scada-border">
                                                <span className="text-[9px] text-scada-muted font-mono uppercase">Transformer Oil</span>
                                                <span className={`text-sm font-mono font-black ${((unifiedDiagnosis as any).guardianConfidence.transformerOil >= 80) ? 'text-status-ok' : ((unifiedDiagnosis as any).guardianConfidence.transformerOil >= 60) ? 'text-status-warning' : 'text-status-error'}`}>
                                                    {((unifiedDiagnosis as any).guardianConfidence.transformerOil).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            <Suspense fallback={<div className="text-sm text-scada-muted">Loading vibration analyzer…</div>}>
                                <VibrationAnalyzer />
                            </Suspense>
                        </div>

                        <div className="lg:col-span-3 flex flex-col gap-5">
                            {/* Wisdom Feed */}
                            <div className="bg-scada-panel border border-scada-border rounded-none p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-status-info" />
                                        <div className="text-[10px] text-scada-muted font-mono font-black uppercase">Wisdom Feed</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-[9px] text-slate-500 font-mono">{wisdomReport ? new Date(wisdomReport.generatedAt).toLocaleString() : '—'}</div>
                                        <button
                                            className="text-[10px] px-2 py-1 bg-scada-panel border border-scada-border rounded-none text-scada-muted hover:text-scada-text hover:bg-scada-border"
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
                                            <div key={idx} className={`p-2 rounded-none border ${e.severity === 'CRITICAL' ? 'border-status-error bg-status-error/5' : 'border-status-warning bg-status-warning/5'}`} onMouseEnter={() => setHoveredEntry(idx)} onMouseLeave={() => setHoveredEntry(null)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-mono font-bold">{e.title}</div>
                                                        {e.contextualNote ? <Crown className="w-3 h-3 text-status-warning" /> : null}
                                                    </div>
                                                    <div className="text-xs font-mono text-scada-muted">{e.severity}</div>
                                                </div>
                                                <div className="text-[11px] text-scada-muted mt-1">{e.recommendedAction || e.legacyTip}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-scada-muted">No wisdom to display.</div>
                                    )}
                                </div>
                            </div>

                            {/* Audit History */}
                            <div className="bg-scada-panel border border-scada-border rounded-none p-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-status-info" />
                                        <div className="text-[10px] text-scada-muted font-mono font-black uppercase">Audit History</div>
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
                                                <div ref={idx === 0 ? auditListRef : null} data-entry-id={entry.id} key={entry.id || idx} className={`p-2 rounded-none border ${lowConfidence ? 'border-status-error bg-status-error/5' : 'border-scada-border bg-scada-bg'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm font-mono font-bold">{new Date(entry.timestamp).toLocaleString()}</div>
                                                            <div className="text-xs text-scada-muted font-mono">Mode: <span className="font-bold text-scada-text ml-1">{mode}</span></div>
                                                        </div>
                                                        <div className="text-xs font-mono">
                                                            Confidence: <span className={`font-bold ${lowConfidence ? 'text-status-error' : 'text-status-ok'}`}>{conf !== null && conf !== undefined ? `${conf}%` : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] text-scada-muted mt-1">{summary}</div>
                                                    {lowConfidence ? (
                                                        <div className="mt-2 text-status-error text-[11px] font-mono font-bold">⚠️ Manual Verification Required</div>
                                                    ) : null}
                                                    <div className="mt-2 text-[10px] text-slate-500 font-mono">ID: {entry.id}</div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-scada-muted">No audit history available.</div>
                                    )}
                                </div>
                            </div>

                            <ScenarioController />
                            <div className="bg-scada-panel border border-scada-border rounded-none p-5 shadow-none">
                                <h3 className="text-[10px] text-scada-muted font-mono font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-status-ok" />
                                    {t('dashboard.live_telemetry')}
                                </h3>
                                <div className="space-y-4">
                                    <LiveMetricToken sensorId="PRE-202-B" />
                                    <LiveMetricToken sensorId="PT-101" />
                                    <LiveMetricToken sensorId="TMP-404-X" />
                                </div>
                            </div>
                            <MaintenanceTimeline />
                            <EngineeringWisdomVault />
                            <SmartManual />
                        </div>
                    </div>

                    {/* Emergency Mode Banner */}
                    {highRisk ? (
                        <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
                            <div className="mt-24 bg-status-error/10 border border-status-error rounded-none p-4 text-scada-text max-w-3xl pointer-events-auto shadow-none">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-6 h-6 text-status-error" />
                                    <div>
                                        <h3 className="text-lg font-black text-status-error uppercase tracking-widest">CRITICAL SYSTEM WARNING</h3>
                                        <p className="text-sm font-mono mt-1">
                                            The automated diagnostic engine has detected a high probability of failure ({(unifiedDiagnosis?.p_fail || pf || 0).toFixed(1)}%).
                                            Immediate inspection of the turbine runner and main bearing is recommended.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Acknowledge logic
                                            setPf(null);
                                        }}
                                        className="ml-4 px-4 py-2 bg-status-error text-white font-bold uppercase text-xs rounded-none hover:bg-red-600 transition-colors"
                                    >
                                        ACKNOWLEDGE
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Predictive Maintenance Alert (Forecast) */}
                    {!highRisk && forecast ? (
                        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
                            {forecast.weeksUntil !== null && forecast.weeksUntil < 4 ? (
                                <div className="px-3 py-2 bg-status-warning/10 border border-status-warning/20 rounded-none text-status-warning text-sm font-mono inline-flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-status-warning" />
                                    <div>
                                        <div className="text-[10px] uppercase">Predicted Maintenance Required</div>
                                        <div className="font-bold">{forecast.weeksUntil.toFixed(1)} weeks remaining</div>
                                    </div>
                                </div>
                            ) : forecast.predictedTimestamp ? (
                                <div className="px-3 py-2 bg-status-warning/10 border border-status-warning/20 rounded-none text-status-warning text-sm font-mono inline-flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-status-warning" />
                                    <div>
                                        <div className="text-[10px] uppercase">Predicted Efficiency Breach (90%)</div>
                                        <div className="font-bold">{new Date(forecast.predictedTimestamp).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Dec25 Critical Event Alert */}
                            {dec25Present ? (
                                <div className="px-3 py-2 bg-status-error/10 border border-status-error/20 rounded-none text-status-error text-sm font-mono inline-flex items-center gap-3">
                                    <ShieldAlert className="w-4 h-4 text-status-error" />
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
            <OptimizationHUD variant="overlay" />
        </div>
    );
};
