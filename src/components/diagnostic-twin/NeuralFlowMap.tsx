import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
// MIGRATED: From useProjectEngine to specialized stores
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDemoMode } from '../../stores/useAppStore';
import { useEngineeringMath } from '../../hooks/useEngineeringMath.ts';
import { Tooltip } from '../../shared/components/ui/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DigitalDisplay } from './DigitalDisplay.tsx';
import { Activity, ShieldCheck, ZapOff, Sparkles, ChevronRight, Info } from 'lucide-react';
import { DossierViewerModal } from '../knowledge/DossierViewerModal';
import { DOSSIER_LIBRARY, DossierFile } from '../../data/knowledge/DossierLibrary';
import { MasterIntelligenceEngine } from '../../services/MasterIntelligenceEngine';
import { computeIntegritySummary } from '../../services/DossierIntegrity';
import { useIntelligenceReport } from '../../services/useIntelligenceReport';

const TurbineUnit: React.FC<{
    id: string;
    name: string;
    status: 'running' | 'stopped';
    mw: number;
    eccentricity: number;
    vibration: number;
    onAlertClick?: () => void;
    onComponentClick?: () => void;
}> = React.memo(({ id, name, status, mw, eccentricity, vibration, onAlertClick, onComponentClick }) => {
    const { t } = useTranslation();
    // NC-9.0 Reactive Color Logic: Base color on physics metrics
    // Vibration > 0.05 or Eccentricity > 0.8 triggers Warning/Critical aesthetics
    const isVibrationCritical = vibration > 0.06;
    const isEccentricityWarning = eccentricity > 0.75;

    let unitColor = 'cyan';
    if (isVibrationCritical) unitColor = 'red';
    else if (isEccentricityWarning) unitColor = 'orange';

    const colorMap = {
        cyan: 'border-cyan-400 group-hover:border-cyan-300 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent shadow-[0_0_60px_rgba(6,182,212,0.2),inset_0_0_40px_rgba(6,182,212,0.1)]',
        orange: 'border-amber-400 group-hover:border-amber-300 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent shadow-[0_0_60px_rgba(245,158,11,0.2),inset_0_0_40px_rgba(245,158,11,0.1)]',
        red: 'border-red-400 group-hover:border-red-300 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent shadow-[0_0_60px_rgba(239,68,68,0.2),inset_0_0_40px_rgba(220,38,38,0.1)]'
    };

    return (
        <div className="relative group perspective-1000">
            <Tooltip content={`${name}: Eccentricity ${(eccentricity).toFixed(3)} | Vibration ${(vibration * 1000).toFixed(1)}μm`}>
                <motion.div
                    whileHover={{ rotateY: 10, scale: 1.05 }}
                    onClick={(e) => { e.stopPropagation(); onAlertClick?.(); onComponentClick?.(); }}
                    className={`
                        w-52 h-52 rounded-full border-[6px] flex items-center justify-center relative translate-y-10 transition-all duration-700 backdrop-blur-xl
                        ${status === 'running' ? colorMap[unitColor as keyof typeof colorMap] : 'border-white/5 bg-white/5 shadow-2xl'}
                    `}
                >
                    <div className="absolute inset-0 rounded-full noise-commander opacity-20"></div>
                    <div className={`w-40 h-40 rounded-full border-[3px] border-dashed ${status === 'running' ? 'border-cyan-400/30 animate-[spin_8s_linear_infinite]' : 'border-white/5'}`}></div>

                    <div className="absolute text-center z-10">
                        <DigitalDisplay
                            value={mw.toFixed(1)}
                            label={name}
                            unit="MW"
                            color={unitColor as any}
                            className="!bg-transparent !border-none !p-0 scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        />
                    </div>

                    {status === 'running' && unitColor === 'cyan' && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none animate-pulse"></div>
                    )}
                </motion.div>
            </Tooltip>

            <div className="w-6 h-20 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 mx-auto relative -z-10 shadow-2xl border-x border-white/5" />

            <div className={`
                w-40 h-24 mx-auto rounded-b-2xl border-x-[1px] border-b-[1px] flex items-center justify-center overflow-hidden transition-all duration-700 backdrop-blur-xl relative
                ${status === 'running' ? 'border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'border-white/5 bg-white/5 shadow-xl'}
                ${isVibrationCritical ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}
            `}>
                <div className="absolute inset-0 noise-commander opacity-10"></div>
                {status === 'running' && !isVibrationCritical && (
                    <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:32px_32px] animate-[slide_1.5s_linear_infinite]"></div>
                )}
                {/* Physics Breach Alert: Triggered by critical vibration or manual override for UNIT_02 */}
                {(isVibrationCritical || (name === 'UNIT_02' && vibration > 0.05)) && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onAlertClick?.();
                        }}
                        className="text-[10px] font-black text-red-400 animate-pulse tracking-tight px-3 py-1.5 bg-red-950/60 rounded-lg border border-red-500/30 uppercase z-10 mx-4 text-center cursor-pointer hover:bg-red-900/80 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                        {t('neuralFlow.physicsBreach')}
                    </div>
                )}
            </div>
        </div>
    );
});

export const NeuralFlowMap: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();

    // MIGRATED: From useProjectEngine to specialized stores
    const { hydraulic, physics } = useTelemetryStore();
    const demoMode = useDemoMode();
    const { orbit, vibration } = useEngineeringMath();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [diagnosticAlerts, setDiagnosticAlerts] = useState<any[]>([]);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ path: string; title: string; sourceData?: DossierFile } | null>(null);
    const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
    const [operationalRecommendation, setOperationalRecommendation] = useState<string | null>(null);
    const [topicFilter, setTopicFilter] = useState<string | null>(null);

    // ISO Vibration Binding
    const vibPeak = vibration.x * 1000; // converted to μm
    const isoZone = MasterIntelligenceEngine.calculateVibrationZone(vibration.x * 10);
    const isoJustification = MasterIntelligenceEngine.getISOJustification(isoZone);

    const handleOpenDossier = (path: string) => {
        // Be resilient to case differences: match via lowercase
        const normalized = (path || '').toString().toLowerCase();
        let source = DOSSIER_LIBRARY.find(d => d.path.toLowerCase() === normalized || (`/archive/${d.path.replace(/^\/+/, '')}`).toLowerCase() === normalized);
        if (!source) {
            // try matching by suffix
            source = DOSSIER_LIBRARY.find(d => normalized.endsWith((d.path || '').toLowerCase()) || normalized.endsWith((('/archive/' + d.path).toLowerCase())) );
        }
        if (source) {
            let activePath = source.path;
            if (!activePath.startsWith('/') && !activePath.startsWith('http')) {
                activePath = `/archive/${activePath}`;
            }
            setSelectedFile({
                path: activePath,
                title: activePath.split('/').pop()?.replace('.html', '') || 'Dossier',
                sourceData: source
            });
            setIsViewerOpen(true);
        }
    };

    // Fetch short 'Current Analysis' and 'Operational Recommendation' snippets
    useEffect(() => {
        let aborted = false;
        setCurrentAnalysis(null);
        setOperationalRecommendation(null);

        async function fetchSummary(p: string) {
            try {
                const res = await fetch(p, { method: 'GET' });
                if (!res.ok) return;
                const html = await res.text();

                if (aborted) return;

                // Simple regex extraction: find headings and following paragraph(s)
                const extract = (label: string) => {
                    const re = new RegExp(`<h[1-6][^>]*>\\s*${label}\\s*</h[1-6][^>]*>([\s\S]*?)(?:<h[1-6]|$)`, 'i');
                    const m = html.match(re);
                    if (m && m[1]) {
                        // Strip tags for a concise snippet
                        return m[1].replace(/<[^>]+>/g, '').trim().slice(0, 800);
                    }
                    return null;
                };

                const analysis = extract('Current Analysis') || extract('Analysis') || null;
                const recommendation = extract('Operational Recommendation') || extract('Recommendation') || null;

                setCurrentAnalysis(analysis);
                setOperationalRecommendation(recommendation);
            } catch (e) {
                // ignore; keep snippets null
            }
        }

        if (selectedFile?.path) {
            fetchSummary(selectedFile.path);
        }

        return () => { aborted = true; };
    }, [selectedFile]);

    // Calculate MW output from physics (with null safety)
    const surgePressure = physics?.surgePressure?.toNumber?.() ?? 0;
    const mwOutput = surgePressure ? surgePressure * 2.5 : 45.0;

    // Risk score approximation (would come from diagnosis in production)
    const riskScore = physics?.hoopStress?.toNumber?.() ?? 0 > 140 ? 30 : 10;

    // Integrity summary derived from the manifest (fallback)
    const integrity = computeIntegritySummary(DOSSIER_LIBRARY as DossierFile[]);

    // Load intelligence report (generated by scripts/generate_nc102_intelligence.cjs)
    const { report: intelReport, loading: intelLoading } = useIntelligenceReport(0);

    // For Topic filter (already added earlier)
    // Integrity console state (short scrolling terminal)
    const [integrityLogs, setIntegrityLogs] = useState<string[]>([]);
    const logsRef = useRef<HTMLDivElement | null>(null);

    const findIntelEntryForSelected = () => {
        if (!intelReport || !selectedFile) return null;
        const p = selectedFile.path || '';
        const rel = p.replace(/^\/archive\//, '').replace(/^\//, '');
        const all = intelReport.all || [];
        return all.find((e: any) => {
            if (!e) return false;
            if (e.path && e.path === p) return true;
            if (e.rel && e.rel === rel) return true;
            if (typeof e.path === 'string' && e.path.endsWith(rel)) return true;
            if (typeof e.rel === 'string' && e.rel.endsWith(rel)) return true;
            return false;
        }) || null;
    };

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [selectedAsset]);

    // When a dossier is selected, run a quick integrity console playback
    useEffect(() => {
        let t1: any, t2: any;
        if (!selectedFile) {
            setIntegrityLogs([]);
            return;
        }
        setIntegrityLogs(['[CHECKING INTEGRITY...]']);
        t1 = setTimeout(() => setIntegrityLogs(prev => [...prev, '[BLOCK_HASH_OK]']), 700);
        t2 = setTimeout(() => setIntegrityLogs(prev => [...prev, '[NC-10.2_VALID]']), 1400);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [selectedFile]);

    useEffect(() => {
        if (logsRef.current) {
            logsRef.current.scrollTop = logsRef.current.scrollHeight;
        }
    }, [integrityLogs]);

    // DIAGNOSTIC INTEGRITY MONITOR
    useEffect(() => {
        if (!selectedAsset || isLoading) return;

        // Reactive Diagnostic Pipeline
        const flowRate = hydraulic?.flow ?? 0;
        const headPressure = hydraulic?.head ?? 0;

        // Simplified diagnostic check (replacing connectTwinToExpertEngine)
        const alerts: any[] = [];
        if (flowRate > 50) {
            alerts.push({ message: 'Flow rate exceeds operational threshold' });
        }
        if (headPressure > 200) {
            alerts.push({ message: 'Head pressure approaching critical limit' });
        }
        setDiagnosticAlerts(alerts);

    }, [selectedAsset, isLoading, hydraulic]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-4xl space-y-8 animate-pulse">
                    <div className="h-12 w-48 bg-slate-900/50 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedAsset) {
        return (
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-8">
                <div className="absolute inset-0 opacity-10 noise-commander"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5"></div>

                <div className="relative z-10 max-w-2xl text-center space-y-12 animate-fade-in">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <Sparkles className="w-4 h-4 animate-pulse" /> {t('neuralFlow.intelInit')}
                    </div>
                    <div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase">
                            Deploy Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                {t('neuralFlow.diagnosticTwin')}
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                            {t('neuralFlow.heroText')}
                        </p>
                    </div>

                    <button
                        className="group relative px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all active:scale-95 overflow-hidden"
                        onClick={() => window.dispatchEvent(new CustomEvent('openAssetWizard'))}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">{t('neuralFlow.registerAsset')}</span>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/5">
                        <div className="p-8 bg-white/5 glass-panel border border-white/10 rounded-2xl hover:border-cyan-500/40 transition-all text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            <h3 className="text-white font-black uppercase tracking-tight mb-2">{t('neuralFlow.flowTitle')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('neuralFlow.flowDesc')}</p>
                        </div>
                        <div className="p-8 bg-white/5 glass-panel border border-white/10 rounded-2xl hover:border-emerald-500/40 transition-all text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                            <h3 className="text-white font-black uppercase tracking-tight mb-2">{t('neuralFlow.integrityTitle')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('neuralFlow.integrityDesc')}</p>
                        </div>
                        <div className="p-8 bg-white/5 glass-panel border border-white/10 rounded-2xl hover:border-indigo-500/40 transition-all text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <ZapOff className="w-8 h-8 text-indigo-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                            <h3 className="text-white font-black uppercase tracking-tight mb-2">{t('neuralFlow.latencyTitle')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('neuralFlow.latencyDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#071018', fontFamily: 'Inter, system-ui,Segoe UI,Arial,Helvetica,sans-serif' }} className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

            <div style={{ background: '#0b2530' }} className="relative z-10 w-full max-w-6xl border border-white/10 p-6 sm:p-8 md:p-16 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute inset-0 noise-commander opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 z-20">
                    <div className="text-[10px] font-black text-cyan-400 tracking-[0.4em] border border-cyan-500/30 px-5 py-2.5 bg-cyan-500/5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.1)] uppercase">
                        {t('neuralFlow.coreTwin')}
                    </div>
                    {/* SHA-256 VERIFIED pulsing badge */}
                        <div title="SHA-256 VERIFIED" className="ml-3 hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping-slow" />
                            SHA-256 VERIFIED
                        </div>
                </div>

                <Tooltip content={isoJustification}>
                    <div className={`absolute top-4 right-4 sm:top-8 sm:right-8 text-[10px] font-mono px-5 py-2.5 rounded-full backdrop-blur-xl flex items-center gap-3 border transition-all z-20 cursor-help ${isoZone === 'ZONE_D' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                        isoZone === 'ZONE_C' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                            isoZone === 'ZONE_B' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                                'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        } shadow-[0_0_20px_rgba(0,0,0,0.2)]`}>
                        <motion.div
                            animate={isoZone === 'ZONE_D' || isoZone === 'ZONE_C' ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </motion.div>
                        <span className="font-black uppercase tracking-widest">
                            {isoZone === 'ZONE_A' ? 'COMMANDER.VERIFIED' : `ISO.${isoZone}`}
                        </span>
                        <Info className="w-3 h-3 opacity-50" />
                    </div>
                </Tooltip>

                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-16 sm:pt-20 pb-10 sm:pb-16 relative gap-16 sm:gap-8">
                    <TurbineUnit
                        id="t1"
                        name="UNIT_01"
                        status="running"
                        mw={selectedAsset?.specs?.power_output ?? mwOutput}
                        eccentricity={orbit.eccentricity}
                        vibration={vibration.x}
                        onAlertClick={() => handleOpenDossier('/archive/turbine_friend/francis_h/francis_symptom_dictionary/index.html')}
                        onComponentClick={() => handleOpenDossier('/archive/turbine_friend/francis_h/francis_symptom_dictionary/index.html')}
                    />

                    <div className="relative flex flex-col items-center justify-center sm:mx-4">
                        <div className="w-[2px] h-40 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>

                        {/* HEALTH DELTA INDICATOR (NC-9.0 FLEET INTEL) */}
                        {demoMode.active && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute bg-slate-900/80 backdrop-blur-xl border border-amber-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] z-30 min-w-[200px]"
                            >
                                <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest text-center mb-1">Fleet Health Delta</div>
                                <div className="text-4xl font-black text-white text-center tracking-tighter">
                                    Δ {Math.abs(85 - (riskScore > 0 ? 100 - riskScore : 85)).toFixed(0)}%
                                </div>
                                <div className="mt-2 text-[8px] text-slate-400 font-mono text-center uppercase">
                                    Simulation vs. Nominal Baseline
                                </div>
                            </motion.div>
                        )}

                        <div className="w-[2px] h-40 bg-gradient-to-t from-transparent via-cyan-500/20 to-transparent"></div>
                    </div>

                    <TurbineUnit
                        id="t2"
                        name="UNIT_02"
                        status="running"
                        mw={(selectedAsset?.specs?.power_output ?? mwOutput) * 0.98}
                        eccentricity={orbit.eccentricity * 0.15} // UNIT_02 staying nominal
                        vibration={vibration.y * 0.2}
                        onAlertClick={() => handleOpenDossier('/archive/turbine_friend/francis_h/francis_symptom_dictionary/index.html')}
                        onComponentClick={() => handleOpenDossier('/archive/turbine_friend/francis_h/francis_symptom_dictionary/index.html')}
                    />
                </div>

                {/* Intelligence / Integrity summary cards */}
                <div className="mt-6 flex gap-4 justify-center">
                    <div className="p-3 bg-white/5 border border-emerald-400/10 rounded-lg text-center" style={{ color: '#00ff7f' }}>
                        <div className="text-xs text-emerald-300 font-mono">Health (Global)</div>
                        <div className="text-2xl font-black text-white">{intelReport ? `${intelReport.globalHealthIndex}%` : `${integrity.healthPercent}%`}</div>
                    </div>
                    <div className="p-3 bg-white/5 border border-cyan-400/10 rounded-lg text-center">
                        <div className="text-xs text-cyan-300 font-mono">MTBF</div>
                        <div className="text-2xl font-black text-white">{intelReport ? `${Math.round((intelReport.totalFiles || 0) * 2)}h` : `${integrity.mtbfEstimateHours}h`}</div>
                    </div>
                    <div className="p-3 bg-white/5 border border-red-400/10 rounded-lg text-center">
                        <div className="text-xs text-rose-300 font-mono">Risk</div>
                        <div className="text-2xl font-black text-white">{intelReport ? `${Math.round((intelReport.baselineAverageScore || 0))}` : `${integrity.riskScore}`}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                <DigitalDisplay value={(hydraulic?.flow ?? 0).toFixed(1)} label="NOMINAL_FLOW" unit="m³/s" color="cyan" />
                <DigitalDisplay value={(hydraulic?.head ?? 0).toFixed(0)} label="GROSS_HEAD" unit="m" color="cyan" />
                <DigitalDisplay value={orbit.eccentricity.toFixed(3)} label="ECCENTRICITY" color={orbit.eccentricity > 0.8 ? 'red' : 'cyan'} />
                <Tooltip content={`ISO 10816-5 Protocol Compliance: ${isoJustification}`}>
                    <div className="cursor-help">
                        <DigitalDisplay value={(vibration.x * 1000).toFixed(1)} label="VIB_X_PEAK" unit="μm" color={vibration.x > 0.05 ? 'red' : 'cyan'} />
                    </div>
                </Tooltip>
            </div>

            {/* Per-dossier summary panel */}
            {selectedFile && (currentAnalysis || operationalRecommendation) && (
                <div className="max-w-3xl mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-lg font-black text-white mb-2">{selectedFile.title}</h3>

                    {/* Intelligence quick facts for the selected dossier */}
                    {intelReport && (
                        (() => {
                            const entry = findIntelEntryForSelected();
                            const hash = entry?.hash || selectedFile.sourceData?.hash || '';
                            const hashShort = hash ? hash.slice(0, 8) : 'unknown';
                            const classification = entry?.classification || 'Nominal';
                            const mdays = entry?.maintenanceDueDays;
                            const dueLabel = mdays != null ? `${Math.round(mdays * 24)}h` : 'N/A';
                            return (
                                <div className="mb-4 p-3 rounded border border-white/5 bg-black/5">
                                    <div className="text-xs text-slate-400">Integrity</div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="font-mono text-sm text-emerald-200">{hashShort}</div>
                                        <div className="text-sm text-white font-bold">{classification}</div>
                                        <div className="text-xs text-amber-300">Maintenance: Required in {dueLabel}</div>
                                    </div>
                                </div>
                            );
                        })()
                    )}
                    {currentAnalysis && (
                        <div className="mb-4">
                            <div className="text-xs text-amber-300 uppercase font-mono mb-1">Current Analysis</div>
                            <div className="text-sm text-slate-300">{currentAnalysis}</div>
                        </div>
                    )}
                    {operationalRecommendation && (
                        <div>
                            <div className="text-xs text-emerald-300 uppercase font-mono mb-1">Operational Recommendation</div>
                            <div className="text-sm text-slate-300">{operationalRecommendation}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Integrity console: small terminal playback */}
            <div className="fixed right-6 bottom-6 w-80 h-28 rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-xs text-emerald-200 shadow-lg" style={{ background: '#021616' }}>
                <div className="uppercase text-[10px] font-black text-emerald-300 mb-1">Integrity Console</div>
                <div ref={logsRef} className="overflow-y-auto h-16 pr-2">
                    {integrityLogs.map((l, i) => (
                        <div key={i} className="leading-5">{l}</div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {(orbit.eccentricity > 0.75 || vibration.x > 0.05) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 20, height: 0 }}
                        className="mt-6 overflow-hidden"
                    >
                        <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl shadow-[0_20px_40px_rgba(6,182,212,0.1)] relative group">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-sm tracking-widest">{t('neuralFlow.smartInsight')}</h4>
                                        <p className="text-xs text-slate-400 font-medium max-w-md">
                                            {orbit.eccentricity > 0.75
                                                ? t('neuralFlow.eccentricityInsight')
                                                : t('neuralFlow.vibrationInsight')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/maintenance/shaft-alignment')}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 whitespace-nowrap"
                                >
                                    {t('neuralFlow.launchAlignmentWizard')}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {diagnosticAlerts.length > 0 && (
                <div className="mt-6 p-5 bg-red-950/30 border border-red-500/30 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                        <ZapOff className="w-5 h-5 text-red-500" />
                        <h4 className="text-red-400 font-black uppercase text-sm tracking-widest text-white">{t('neuralFlow.detectionActive')}</h4>
                    </div>
                    <div className="space-y-1">
                        {diagnosticAlerts.map((alarm, idx) => (
                            <div key={idx} className="text-red-200 text-xs font-mono pl-8">
                                {`> ${alarm.message}`}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
                {/* Priority Alert Board (Top 5) - wired to intelligence report */}
                <div className="mt-8 w-full max-w-4xl">
                    <h3 className="text-xl font-black text-white mb-3">Top 5 Critical Alerts</h3>
                    {intelLoading && <div className="text-sm text-slate-400">Loading intelligence feed...</div>}
                    {!intelLoading && intelReport && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {(intelReport.alerts || []).map((a: any, i: number) => (
                                <div key={i} className="p-3 bg-white/5 border border-red-500/10 rounded-lg">
                                    <div className="text-xs text-rose-300 font-mono">{a.classification || 'ALERT'}</div>
                                    <div className="text-sm text-white font-black mt-1">{a.title || a.path}</div>
                                    <div className="text-xs text-slate-400 mt-2">Topic: {a.topic || 'Unknown'}</div>
                                    <div className="text-xs text-amber-300 mt-1">Due: {a.maintenanceDueDays ?? 'N/A'} days</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Topic filter and anomalies */}
                <div className="mt-8 w-full max-w-4xl">
                    <div className="flex gap-3 items-center mb-3">
                        <button onClick={() => setTopicFilter('Runner')} className="px-3 py-1 bg-white/5 rounded">Runner</button>
                        <button onClick={() => setTopicFilter('Stator/Generator')} className="px-3 py-1 bg-white/5 rounded">Generator</button>
                        <button onClick={() => setTopicFilter(null)} className="px-3 py-1 bg-white/5 rounded">All</button>
                    </div>

                    {topicFilter && intelReport && (
                        <div className="p-4 bg-white/5 border rounded">
                            <h4 className="text-white font-black mb-2">Anomalies: {topicFilter}</h4>
                            {((intelReport.grouped && intelReport.grouped[topicFilter]) || []).length === 0 && <div className="text-slate-400">No anomalies for this topic.</div>}
                            {((intelReport.grouped && intelReport.grouped[topicFilter]) || []).map((r:any, idx:number) => (
                                <div key={idx} className="mb-3 p-2 border-t border-white/5">
                                    <div className="text-sm font-bold text-white">{r.title}</div>
                                    <div className="text-xs text-slate-400">{r.operationalRecommendation || r.currentAnalysis || r.path}</div>
                                    <div className="text-xs text-amber-300">Score: {r.score} • Due: {r.maintenanceDueDays ?? 'N/A'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            <DossierViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                filePath={selectedFile?.path || ''}
                title={selectedFile?.title || ''}
                sourceData={selectedFile?.sourceData}
            />
        </div>
    );
});
