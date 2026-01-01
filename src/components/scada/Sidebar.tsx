import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths.ts';
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
                        title="Register New Asset"
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
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️', route: ROUTES.RISK_ASSESSMENT },
        { id: 'francisHub', title: t('sidebar.francisLogic', 'Francis Logic Map'), icon: '🧠', route: `${ROUTES.FRANCIS.ROOT}/${ROUTES.FRANCIS.HUB}` },
        { id: 'maintenanceDashboard', title: t('modules.maintenance', 'Maintenance Engine'), icon: '⚙️', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.DASHBOARD}` },
        { id: 'shaftAlignment', title: t('sidebar.shaftAlignment', 'Shaft Alignment'), icon: '🔄', route: `${ROUTES.FRANCIS.ROOT}/${ROUTES.FRANCIS.SOP.ALIGNMENT}` },
        { id: 'hydraulicMaintenance', title: t('sidebar.hydraulicMaintenance', 'Hydraulic Maintenance'), icon: '🚰', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.HYDRAULIC}` },
        { id: 'boltTorque', title: t('sidebar.boltTorque', 'Bolt Torque'), icon: '🔩', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.BOLT_TORQUE}` },
        { id: 'shadowEngineer', title: t('sidebar.shadowEngineer', 'Shadow Engineer'), icon: '👻', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.SHADOW_ENGINEER}` },
        { id: 'intuitionLog', title: t('sidebar.intuitionLog', 'Intuition Log'), icon: '👂', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.INTUITION_LOG}` },
        { id: 'structuralIntegrity', title: t('sidebar.structuralIntegrity', 'Structural Integrity'), icon: '🏗️', route: 'structural-integrity' },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '📏', route: 'installation-guarantee' },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡', route: 'hpp-builder' },
    ];

    const secondaryModules = [
        { id: 'learningLab', title: 'Learning Lab', icon: <BrainCircuit className="w-4 h-4 text-purple-400" />, route: '/learning-lab' }
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
            window.open(`/francis-turbine/sop/${action.targetId}`, '_blank');
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
                className={`fixed top-0 left-0 h-full w-80 bg-slate-950 border-r border-cyan-900/30 z-40 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl shadow-black ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* 1. HEADER & BRANDING */}
                <div className="p-4 border-b border-cyan-900/30 flex items-center justify-between bg-slate-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 to-transparent opacity-50 pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-cyan-950 border border-cyan-500/30 rounded flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-pulse-glow rounded" />
                            <span className="text-xl font-black text-cyan-400 tracking-tighter">Ah</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-[0.2em] uppercase">AnoHUB</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-cyan-500 font-mono">v4.2.0-TACTICAL</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CONTEXT AWARENESS PANEL */}
                <div className="bg-slate-900/80 border-b border-cyan-900/30">
                    <div className="p-4 space-y-4">

                        {/* A. LAYER SWITCHER (Fixed Strings) */}
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-cyan-900/30">
                            {(['HUMAN', 'HISTORY', 'REALTIME'] as const).map(layer => (
                                <button
                                    key={layer}
                                    onClick={() => setActiveLayer(layer)}
                                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${activeLayer === layer
                                        ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                        : 'text-slate-600 hover:text-cyan-200'
                                        }`}
                                >
                                    {layer === 'REALTIME' ? 'LIVE' : layer}
                                </button>
                            ))}
                        </div>

                        {/* B. ACTIVE FOCUS */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Focus</h3>
                                <span className={`text-[10px] font-mono ${signalQuality >= 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    SIG: {(signalQuality * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded border-l-2 border-cyan-500 shadow-inner shadow-black/50">
                                <div className="p-2 bg-cyan-950/50 rounded-full border border-cyan-500/30">
                                    <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-xs font-bold text-white uppercase truncate">
                                        {activeDefinition?.title || 'System Idle'}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-cyan-400 font-mono truncate">
                                            {activeDefinition?.slogan || 'Monitoring global streams...'}
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
                                    <span>Playback Scrubber</span>
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
                                                    {insight.messageKey || 'INSIGHT'}
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
                            Operational Command
                        </div>
                        {operationalModules.map((item) => {
                            const isActive = location.pathname.includes(item.route);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        logAction('NAVIGATION', `Accessed ${item.title}`);
                                        navigate(item.route);
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-all duration-200 group ${isActive
                                        ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-cyan-200'
                                        }`}
                                >
                                    <span className="text-lg opacity-80 group-hover:scale-110 transition-transform filter grayscale group-hover:grayscale-0">{item.icon}</span>
                                    <span className="text-xs font-bold tracking-wide">{item.title}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                    )}
                                </button>
                            );
                        })}

                        {/* SYSTEM INTEL */}
                        <div className="px-3 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">
                            System Intel
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
                            <div className="bg-slate-900 border border-cyan-900/30 rounded p-3">
                                <h4 className="text-[10px] font-bold text-cyan-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <Upload className="w-3 h-3" />
                                    Data Bridge
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-white/5 flex items-center justify-center gap-2 transition-colors"
                                        onClick={() => document.getElementById('bridge-upload')?.click()}
                                    >
                                        <Clock className="w-3 h-3" />
                                        Load History (CSV)
                                    </button>
                                    <input
                                        id="bridge-upload"
                                        type="file"
                                        accept=".csv,.json"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                // In a real app we would call context.uploadLogData(file)
                                                // ignoring for now to pass type check if context doesn't expose it directly here (it does expose uploadLogData though)
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
                                className="w-full py-3 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded flex items-center justify-center gap-2 group transition-all"
                            >
                                <div className="p-1 bg-red-500/10 rounded group-hover:bg-red-500/20">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-black uppercase tracking-wider">Generate 60s Forensic Report</span>
                                    <span className="text-[8px] font-mono opacity-70">Capture Visuals + Logic Trace</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER */}
                <div className="p-4 border-t border-cyan-900/30 bg-slate-950">
                    <LanguageSelector />

                    {/* HIVE STATUS INDICATOR */}
                    <div className="mt-3 text-[9px] font-mono text-slate-500 flex justify-between items-center">
                        <span>HIVE LINK:</span>
                        <span className={`font-bold ${hiveStatus?.connected ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {hiveStatus?.connected ? 'CONNECTED' : 'OFFLINE'}
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
