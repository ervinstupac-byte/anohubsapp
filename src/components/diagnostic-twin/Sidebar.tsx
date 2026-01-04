import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, getFrancisPath, getMaintenancePath } from '../../routes/paths.ts';
import { useNavigation, AppView } from '../../contexts/NavigationContext.tsx';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus, Info, X, Globe, Activity as BrainCircuit, Upload, Play, Clock, Rewind, FastForward, CheckCircle, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { LanguageSelector } from '../LanguageSelector.tsx';
import { Sparkline } from '../ui/Sparkline';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { IndustrialDataBridge } from '../../services/IndustrialDataBridge';
import { QrCode } from '../ui/QrCode';
import { useDocumentViewer } from '../../contexts/DocumentContext';

// GLOBAL EVENT FOR REMOTE TRIGGER
export const TRIGGER_FORENSIC_EXPORT = 'ANOHUB_TRIGGER_FORENSIC_EXPORT';

// --- FLEET SECTION COMPONENT ---
interface FleetSectionProps {
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ showMap, onToggleMap, onRegisterAsset }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="border-b border-cyan-900/30 bg-slate-950">
            {/* Header - Always Visible */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cyan-900/10 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em] transition-colors ${isExpanded ? 'text-cyan-400' : ''}`}>
                        {t('sidebar.fleetOverview')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quick Add Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegisterAsset();
                        }}
                        className="p-1 rounded bg-emerald-900/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-emerald-900/30"
                        title={t('neuralFlow.registerAsset')}
                    >
                        <Plus className="w-3 h-3" />
                    </button>

                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
            </div>

            {/* Content - Collapsible */}
            {isExpanded && (
                <div className="pb-4 animate-in slide-in-from-top-2 duration-200">
                    <ErrorBoundary fallback={<div className="p-4 text-xs text-red-500 bg-red-950/30 border border-red-500/30 rounded">Fleet Overview Unavailable</div>}>
                        <FleetOverview
                            onToggleMap={onToggleMap}
                            showMap={showMap}
                            onRegisterAsset={onRegisterAsset}
                        />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    );
};

// --- SIDEBAR COMPONENT ---
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, showMap, onToggleMap, onRegisterAsset }) => {
    const location = useLocation();
    const navigate = useNavigate(); // Use React Router directly
    const { logAction } = useAudit();
    // const { navigateTo } = useNavigation(); // Not used for path routing
    const { t } = useTranslation();
    const { viewDocument } = useDocumentViewer();

    // TACTICAL STATE (Aligned with ContextAwarenessState)
    const {
        activeDefinition, // Was currentFocus
        liveMetrics,      // Was metricHistory (but struct is array)
        activeLayer,
        setActiveLayer,
        playback,
        hiveStatus,
        diagnostics       // Was insights
    } = useContextAwareness();

    // Calculate signalQuality proxy
    const signalQuality = liveMetrics.length > 0 ? 0.98 : 0.0;

    const operationalModules = [
        { id: 'toolbox', title: t('sidebar.toolbox', 'Toolbox Launchpad'), icon: '🧰', route: ROUTES.HOME },
        { id: 'diagnosticTwin', title: t('sidebar.diagnosticTwin', 'Diagnostic Twin'), icon: '♊', route: `/${ROUTES.DIAGNOSTIC_TWIN}` },
        { id: 'francisHub', title: t('sidebar.francisLogic', 'Francis Logic Map'), icon: '🧠', route: getFrancisPath(ROUTES.FRANCIS.HUB) },
        { id: 'maintenanceDashboard', title: t('modules.maintenance', 'Maintenance Engine'), icon: '⚙️', route: getMaintenancePath(ROUTES.MAINTENANCE.DASHBOARD) },
        { id: 'maintenanceLogbook', title: t('sidebar.logbook', 'Maintenance Logbook'), icon: '📓', route: getMaintenancePath(ROUTES.MAINTENANCE.LOGBOOK) },
        { id: 'shaftAlignment', title: t('sidebar.shaftAlignment', 'Shaft Alignment'), icon: '🔄', route: getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT) },
        { id: 'hydraulicMaintenance', title: t('sidebar.hydraulicMaintenance', 'Hydraulic Maintenance'), icon: '🚰', route: getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC) },
        { id: 'boltTorque', title: t('sidebar.boltTorque', 'Bolt Torque'), icon: '🔩', route: getMaintenancePath(ROUTES.MAINTENANCE.BOLT_TORQUE) },
        { id: 'shadowEngineer', title: t('sidebar.shadowEngineer', 'Shadow Engineer'), icon: '👻', route: getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER) },
        { id: 'intuitionLog', title: t('sidebar.intuitionLog', 'Intuition Log'), icon: '👂', route: getMaintenancePath(ROUTES.MAINTENANCE.INTUITION_LOG) },
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️', route: `/${ROUTES.RISK_ASSESSMENT}` },
        { id: 'structuralIntegrity', title: t('sidebar.structuralIntegrity', 'Structural Integrity'), icon: '🏗️', route: `/${ROUTES.STRUCTURAL_INTEGRITY}` },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '📏', route: `/${ROUTES.INSTALLATION_GUARANTEE}` },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡', route: `/${ROUTES.HPP_BUILDER}` },
        { id: 'forensics', title: t('sidebar.forensics', 'Forensic Analysis'), icon: '🔍', route: '/forensics' },
        { id: 'executive', title: t('sidebar.executive', 'Executive Dashboard'), icon: '📊', route: '/executive' },
    ];

    const secondaryModules = [
        { id: 'learningLab', title: t('sidebar.learningLab'), icon: <BrainCircuit className="w-4 h-4 text-purple-400" />, route: `/${ROUTES.LEARNING_LAB}` }
    ];

    const formatValue = (val: number | string | undefined) => {
        if (val === undefined || val === null) return '--';
        if (typeof val === 'number') {
            return val.toFixed(2);
        }
        return val;
    };

    // TACTICAL ACTIONS UI
    const handleAction = (action: any) => {
        if (!action) return;
        if (action.type === 'FOCUS_3D') {
            console.log(`[TACTICAL] Focusing 3D Mesh: ${action.targetId}`);
        } else if (action.type === 'OPEN_SOP') {
            console.log(`[TACTICAL] Opening SOP: ${action.targetId}`);
            navigate(`/${ROUTES.FRANCIS.ROOT}/sop-${action.targetId}`);
        }
    };

    return (
        <>
            {/* OVERLAY for Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR CONTAINER */}
            <motion.div
                className={`fixed top-0 left-0 h-full w-80 bg-slate-950/40 glass-panel-deep !rounded-none z-40 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="absolute inset-0 noise-commander opacity-20 pointer-events-none"></div>
                {/* 1. HEADER & BRANDING */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                    <div
                        className="flex items-center gap-4 relative z-10 cursor-pointer group/logo transition-all hover:scale-[1.02]"
                        onClick={() => navigate(ROUTES.HOME)}
                    >
                        <div className="w-12 h-12 bg-black/40 border border-cyan-500/30 rounded-xl flex items-center justify-center relative group-hover/logo:border-cyan-400 transition-colors overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse-glow group-hover/logo:bg-cyan-500/40" />
                            <span className="text-2xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] group-hover/logo:text-white group-hover/logo:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all">Ah</span>
                        </div>
                        <div>
                            <h1 className="text-base font-black text-white tracking-[0.2em] uppercase drop-shadow-sm group-hover/logo:text-cyan-400 transition-colors">AnoHUB</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-cyan-500/80 font-mono font-bold tracking-widest">{t('sidebar.version')}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CONTEXT AWARENESS PANEL */}
                <div className="bg-black/20 border-b border-white/5 noise-commander">
                    <div className="p-6 space-y-6">

                        {/* A. LAYER SWITCHER */}
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
                            {(['HUMAN', 'HISTORY', 'REALTIME'] as const).map(layer => (
                                <button
                                    key={layer}
                                    onClick={() => setActiveLayer(layer)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${activeLayer === layer
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {layer === 'REALTIME' ? t('sidebar.connected') : layer}
                                </button>
                            ))}
                        </div>

                        {/* B. ACTIVE FOCUS */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('sidebar.operationalFocus')}</h3>
                                <span className={`text-[9px] font-mono font-bold ${signalQuality >= 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    SIG_QUAL: {(signalQuality * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner hover:border-cyan-500/30 transition-colors group">
                                <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                                    <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-cyan-400 transition-colors">
                                        {activeDefinition?.title || t('sidebar.systemIdle')}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-slate-500 font-mono truncate">
                                            {activeDefinition?.slogan || t('sidebar.monitoring')}
                                        </p>
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* C. TIMELINE SCRUBBER (Archive Mode) - Fixed Properties */}
                        {activeLayer === 'HISTORY' && (
                            <div className="space-y-2 pt-2 border-t border-white/5 animate-in slide-in-from-top-2">
                                <div className="flex justify-between text-[10px] font-mono text-cyan-300">
                                    <span>{t('sidebar.playbackScrubber')}</span>
                                    <span>{new Date(playback.currentTimestamp).toLocaleTimeString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={playback.progress}
                                    onChange={(e) => playback.scrubTo(Number(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="flex justify-center gap-4">
                                    <button onClick={playback.togglePlay} className={`p-1 transition-colors ${playback.isPlaying ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        {playback.isPlaying ? <Clock className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* D. LIVE METRICS STREAM (with Sparklines) - Fixed Data Source */}
                        {liveMetrics && liveMetrics.length > 0 && (
                            <div className="space-y-1 mt-2">
                                {liveMetrics.slice(0, 3).map((metric: any, i: number) => (
                                    <div key={i} className="group relative">
                                        <div className="flex justify-between items-end text-[10px] font-mono mb-0.5">
                                            <span className="text-slate-400 uppercase">{metric.label}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-cyan-300 font-bold relative overflow-hidden">
                                                    {formatValue(metric.value)}
                                                    {/* LIVENESS SHIMMER OVERLAY */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                                            {metric.history && <Sparkline data={metric.history} width={280} height={20} color="#06b6d4" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* E. SENTINEL VOICE (The Insight) - Aligned to Diagnostics */}
                        {diagnostics && diagnostics.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-cyan-900/30 space-y-3">
                                {diagnostics.slice(0, 2).map((insight: any) => (
                                    <div key={insight.id || Math.random()} className={`p-3 rounded border-l-2 ${insight.type === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : 'bg-amber-950/20 border-amber-500'} animate-in slide-in-from-right-4`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <BrainCircuit className={`w-3 h-3 ${insight.type === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`} />
                                                <span className={`text-[10px] font-bold uppercase ${insight.type === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                                                    {insight.messageKey || t('sidebar.insight')}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-mono opacity-70">
                                                {insight.probability ? (insight.probability * 100).toFixed(0) + '%' : ''}
                                            </span>
                                        </div>

                                        <p className="text-[10px] text-slate-300 leading-snug mb-2">
                                            {insight.slogan}
                                        </p>

                                        {/* TACTICAL ACTIONS */}
                                        {insight.actions && (
                                            <div className="flex gap-2 mt-2">
                                                {insight.actions.map((action: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAction(action)}
                                                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded text-[9px] text-cyan-400 font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                                                    >
                                                        {action.type === 'FOCUS_3D' ? <ArrowRight className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. SCROLLABLE NAVIGATION AREA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
                    <FleetSection
                        showMap={showMap}
                        onToggleMap={onToggleMap}
                        onRegisterAsset={onRegisterAsset}
                    />

                    <div className="p-2 space-y-0.5">
                        {/* OPERATIONAL COMMAND */}
                        <div className="px-3 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">
                            {t('sidebar.operationalCommand')}
                        </div>
                        {operationalModules.map((item) => {
                            const isActive = location.pathname === item.route;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        logAction('NAVIGATION', `Accessed ${item.title}`);
                                        navigate(item.route);
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-300 group relative overflow-hidden ${isActive
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] shimmer-overlay'
                                        : 'text-slate-500 hover:bg-white/5 hover:text-cyan-200 border border-transparent'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-wider group-hover:tracking-[0.1em] transition-all">
                                        {item.title}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                                    )}
                                </button>
                            );
                        })}

                        {/* SYSTEM INTEL */}
                        <div className="px-3 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">
                            {t('sidebar.systemIntel')}
                        </div>
                        {secondaryModules.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    navigate(item.route);
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-all duration-200 group ${location.pathname.includes(item.route)
                                    ? 'bg-purple-950/30 text-purple-300 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-purple-200'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-xs font-bold tracking-wide">{item.title}</span>
                            </button>
                        ))}

                        <div className="px-3 pt-6 pb-2">
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 noise-commander">
                                <h4 className="text-[10px] font-black text-cyan-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Upload className="w-3 h-3" />
                                    {t('sidebar.neuralBridge')}
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-[10px] text-slate-400 hover:text-white rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-all font-black uppercase tracking-widest"
                                        onClick={() => document.getElementById('bridge-upload')?.click()}
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        {t('sidebar.syncHistory')}
                                    </button>
                                    <input
                                        id="bridge-upload"
                                        type="file"
                                        accept=".csv,.json"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QUICK ACTION: FORENSIC REPORT */}
                        <div className="px-3 pt-2 pb-6">
                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent(TRIGGER_FORENSIC_EXPORT));
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center gap-3 group transition-all shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                            >
                                <div className="p-2 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start translate-y-[1px]">
                                    <span className="text-[11px] font-black uppercase tracking-widest">{t('sidebar.generateForensic')}</span>
                                    <span className="text-[8px] font-mono opacity-60 uppercase font-black">{t('sidebar.secureTrace')}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER */}
                <div className="p-6 border-t border-white/5 bg-white/5 noise-commander">
                    <LanguageSelector />

                    {/* HIVE STATUS INDICATOR */}
                    <div className="mt-3 text-[9px] font-mono text-slate-500 flex justify-between items-center">
                        <span>{t('sidebar.hiveLink')}</span>
                        <span className={`font-bold ${hiveStatus?.connected ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {hiveStatus?.connected ? t('sidebar.connected') : t('sidebar.offline')}
                        </span>
                    </div>

                    {/* QR CODE GENERATOR */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                        <QrCode value={`anohub-event:${Date.now()}:${activeDefinition?.id}`} size={80} />
                    </div>
                </div>
            </motion.div>
        </>
    );
};
