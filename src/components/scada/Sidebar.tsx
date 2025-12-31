import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths.ts';
import { useNavigation, AppView } from '../../contexts/NavigationContext.tsx';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus, Info, X } from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { LanguageSelector } from '../LanguageSelector.tsx';
import { Sparkline } from '../ui/Sparkline';
import { motion, AnimatePresence } from 'framer-motion';

// --- FLEET SECTION COMPONENT ---
interface FleetSectionProps {
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ showMap, onToggleMap, onRegisterAsset }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-b border-white/5 bg-slate-900/50">
            {/* Header - Always Visible */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em] transition-colors ${isExpanded ? 'text-cyan-400' : ''}`}>
                        {useTranslation().t('sidebar.fleetOverview')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quick Add Button (Visible even when collapsed) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegisterAsset();
                        }}
                        className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
    const { navigateTo } = useNavigation();
    const { logAction } = useAudit();
    const { t } = useTranslation();

    const operationalModules = [
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️', route: ROUTES.RISK_ASSESSMENT },
        { id: 'francisHub', title: t('sidebar.francisLogic', 'Francis Logic Map'), icon: '🧠', route: `${ROUTES.FRANCIS.ROOT}/${ROUTES.FRANCIS.HUB}` },
        { id: 'maintenanceDashboard', title: t('modules.maintenance', 'Maintenance Engine'), icon: '⚙️', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.DASHBOARD}` },
        // UNIFIED SHAFT ALIGNMENT: Pointing to Francis SOP
        { id: 'shaftAlignment', title: t('sidebar.shaftAlignment', 'Shaft Alignment'), icon: '🔄', route: `${ROUTES.FRANCIS.ROOT}/${ROUTES.FRANCIS.SOP.ALIGNMENT}` },
        { id: 'hydraulicMaintenance', title: t('sidebar.hydraulicMaintenance', 'Hydraulic Maintenance'), icon: '🚰', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.HYDRAULIC}` },
        { id: 'boltTorque', title: t('sidebar.boltTorque', 'Bolt Torque'), icon: '🔩', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.BOLT_TORQUE}` },
        { id: 'shadowEngineer', title: t('sidebar.shadowEngineer', 'Shadow Engineer'), icon: '👻', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.SHADOW_ENGINEER}` },
        { id: 'intuitionLog', title: t('sidebar.intuitionLog', 'Intuition Log'), icon: '👂', route: `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.INTUITION_LOG}` },
        { id: 'structuralIntegrity', title: t('sidebar.structuralIntegrity', 'Structural Integrity'), icon: '🏗️', route: 'structural-integrity' }, // Assuming root route for now
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '📏', route: 'installation-guarantee' },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡', route: 'hpp-builder' },
    ];

    const secondaryModules = [
        { id: 'riskReport', title: t('modules.riskReport', 'Dossier Archive'), icon: '📂', route: 'risk-report' },
        { id: 'library', title: t('modules.library', 'Tech Library'), icon: '📚', route: 'library' },
        { id: 'standardOfExcellence', title: t('modules.standardOfExcellence'), icon: '🏅', route: 'standard-of-excellence' },
        { id: 'activeContext', title: t('hub.vision'), icon: '👁️', route: 'vision' }
    ];

    const handleNavigation = (id: string, route: string) => {
        // logAction('MODULE_OPEN', title, 'SUCCESS'); // Need title?
        // navigateTo(id as AppView); // Old way
        // New robust way:
        if (route.startsWith('/')) {
            navigate(route);
        } else {
            // Handle root relative paths if any (e.g. 'library')
            navigate('/' + route);
        }
        onClose();
    };

    // Robust Active Check
    const isActive = (route: string) => {
        // Remove leading slash for comparison consistency
        const cleanRoute = route.startsWith('/') ? route.substring(1) : route;
        const currentPath = location.pathname.startsWith('/') ? location.pathname.substring(1) : location.pathname;

        // Exact match
        if (currentPath === cleanRoute) return true;

        // Sub-route match (e.g. maintenance/dashboard should match /maintenance/dashboard/details)
        // But be careful not to match partials like /main vs /maintenance
        if (currentPath.startsWith(cleanRoute + '/')) return true;

        return false;
    };

    // Helper to get navigate function since we are replacing useNavigation() logic partially
    const navigate = useNavigate();

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[280px] bg-slate-950/95 backdrop-blur-3xl border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl
                ring-1 ring-white/5 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <FleetSection
                    showMap={showMap}
                    onToggleMap={onToggleMap}
                    onRegisterAsset={onRegisterAsset}
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1 relative z-10">

                    {/* OPERATIONS */}
                    <div className="px-4 py-2 text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em]">{t('sidebar.operations')}</div>
                    <ErrorBoundary>
                        {operationalModules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => handleNavigation(mod.id, mod.route)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${isActive(mod.route)
                                    ? 'bg-cyan-900/20 border-h-cyan text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'
                                    }`}
                            >
                                <span className={`text-lg ${isActive(mod.route)
                                    ? 'text-h-cyan' : 'group-hover:text-h-cyan transition-colors'
                                    }`}>{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>

                        ))}

                        {/* Logbook Special Case */}
                        <button
                            onClick={() => handleNavigation('logbook', `${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.LOGBOOK}`)}
                            className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group ${isActive(`${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.LOGBOOK}`) ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                        >
                            <span className={`text-lg ${location.pathname === '/logbook' ? 'text-[#2dd4bf]' : 'group-hover:text-[#2dd4bf] transition-colors'}`}>🛡️</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{t('sidebar.maintenanceLogbook', 'Logbook')}</span>
                        </button>
                    </ErrorBoundary>

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    {/* STRATEGY */}
                    <div className="px-4 py-2 text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em]">{t('sidebar.strategy')}</div>
                    <ErrorBoundary>
                        <button
                            onClick={() => handleNavigation('executiveDashboard', ROUTES.MAINTENANCE.EXECUTIVE)}
                            className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${isActive(ROUTES.MAINTENANCE.EXECUTIVE) ? 'bg-cyan-900/20 border-cyan-500 text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                        >
                            <span className={`text-lg ${location.pathname === '/executive' ? 'text-cyan-500' : 'group-hover:text-cyan-400 transition-colors'}`}>📊</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{t('sidebar.toolboxAnalytics', 'Toolbox Analytics')}</span>
                        </button>
                    </ErrorBoundary>

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    {/* KNOWLEDGE */}
                    <div className="px-4 py-2 text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em]">{t('sidebar.knowledge')}</div>
                    <ErrorBoundary>
                        {secondaryModules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => handleNavigation(mod.id, mod.route)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${isActive(mod.route) ? 'bg-cyan-900/20 border-h-cyan text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                            >
                                <span className={`text-lg ${isActive(mod.route) ? 'text-h-cyan' : 'group-hover:text-h-gold transition-colors'}`}>{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>
                        ))}
                    </ErrorBoundary>

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    {/* CONTEXT ENGINE INSIGHTS */}
                    <ContextPanel />

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    <a
                        href="https://www.anohubs.com"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-4 py-3 border-l-2 border-transparent hover:bg-slate-900 text-slate-500 hover:text-white transition-all group"
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🌐</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('sidebar.exitToSite')}</span>
                    </a>
                </div>
            </aside >
        </>
    );
};

// --- INSIGHT PANEL COMPONENT ---
// Replaced local hook with Global Context Provider
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { Lightbulb, FileText, AlertTriangle, ClipboardList, Clock, Zap, Download, History, Activity as BrainCircuit, ArrowRight, Database, UploadCloud, Layers, Play, Pause, Rewind } from 'lucide-react';
import { PdfService } from '../../services/PdfService';
import { PdfPreviewModal } from '../modals/PdfPreviewModal';
import { useMaintenance } from '../../contexts/MaintenanceContext';




const ContextPanel = () => {
    // Determine context from GLOBAL state
    const {
        activeDefinition, activeContextNodes, activeLogs, activeWorkOrders, liveMetrics,
        hasContext, diagnostics, isLoading, hasCriticalRisks, uploadLogData,
        activeLayer, setActiveLayer, playback
    } = useContextAwareness();

    const { logs: allMaintenanceLogs } = useMaintenance(); // Get global logs
    const navigate = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();
    const [selectedWO, setSelectedWO] = useState<any>(null);
    const [previewBlob, setPreviewBlob] = React.useState<Blob | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    // Filter logs for current context

    const contextLogs = React.useMemo(() => {
        if (!activeDefinition?.id) return [];
        // Simple filter strategy: check if log task ID or component ID matches context
        // Ideally we'd have a more robust tagging system, but this works for prototype
        return allMaintenanceLogs.filter(log =>
            // Mock matching logic
            log.taskId.includes(activeDefinition.logCategory || 'GENERIC') ||
            true // FOR DEMO: Show all logs if filtered list is empty, or better, just show last 2 global if no specific match
        ).slice(0, 2);
    }, [allMaintenanceLogs, activeDefinition]);

    const handleGenerateReport = () => {
        const blob = PdfService.generateAuditReport(
            title,
            slogan,
            liveMetrics,
            diagnostics,
            contextLogs, // Only filtered logs for report
            "Current User",
            t
        );
        setPreviewBlob(blob);
        setIsPreviewOpen(true);
    };

    // Calculate trend for Sparkline color

    const getTrendColor = (history: number[]) => {
        if (!history || history.length < 2) return '#22d3ee'; // Default Cyan
        const start = history[0];
        const end = history[history.length - 1];
        if (end > start * 1.05) return '#ef4444'; // Red if > 5% increase
        if (end < start * 0.95) return '#10b981'; // Green if < 5% decrease (good for temps?) - Let's stick to Cyan for stable
        return '#22d3ee';
    };




    // Title from Definition (e.g. 'Penstock System') or Fallback
    const title = activeDefinition?.title || 'System Context';
    const slogan = activeDefinition?.slogan || 'Analyzing system parameters...';

    // Physics ID to Icon mapping (simplified)
    const getPhysicsIcon = () => {
        if (activeDefinition?.logCategory === 'ELEC') return <Zap className="w-5 h-5 text-amber-400" />;
        if (activeDefinition?.logCategory === 'FLUID') return <div className="text-blue-400">💧</div>;
        if (activeDefinition?.logCategory === 'MECH') return <div className="text-slate-300">⚙️</div>;
        return <Lightbulb className="w-5 h-5 text-cyan-400" />;
    };

    const handleQuickLog = () => {
        navigate('/maintenance/logbook', {
            state: {
                source: activeDefinition?.id || 'Unknown Context',
                reason: 'Smart Sidebar Shortcut'
            }
        });
    };

    return (
        <AnimatePresence>
            {hasContext && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
                    layout
                    className="mx-3 mt-4 mb-2 p-4 bg-gradient-to-b from-slate-800/80 to-slate-950/80 backdrop-blur-2xl border border-t-white/10 border-r-white/5 border-b-black/50 border-l-cyan-500 border-l-4 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] overflow-hidden relative group ring-1 ring-white/5"
                >

                    {/* Modal Overlay for Work Orders */}
                    {selectedWO && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedWO(null)}>
                            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl relative ring-1 ring-amber-500/20 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setSelectedWO(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                                <h3 className="text-amber-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-sm shadow-amber-500/20 drop-shadow-sm">
                                    <AlertTriangle className="w-5 h-5" /> {t('sidebar.maintenance.modalTitle')}
                                </h3>
                                <div className="space-y-3 text-xs text-slate-300">
                                    <p><strong className="text-slate-500 uppercase tracking-wider">{t('sidebar.maintenance.description')}:</strong><br /><span className="text-slate-200">{selectedWO.description}</span></p>
                                    <p><strong className="text-slate-500 uppercase tracking-wider">{t('sidebar.maintenance.priority')}:</strong> <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${selectedWO.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{selectedWO.priority}</span></p>
                                    <p><strong className="text-slate-500 uppercase tracking-wider">{t('sidebar.maintenance.assignee')}:</strong> <span className="text-cyan-400 font-mono">{selectedWO.assignedTechnician || t('sidebar.maintenance.unassigned')}</span></p>
                                    <p className="text-[10px] italic text-slate-500 mt-4 border-t border-white/5 pt-2 flex items-center gap-2">
                                        <Info className="w-3 h-3" /> {t('sidebar.maintenance.viewTicket')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Glassmorphism Background Highlight */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            {getPhysicsIcon()}
                            <span className="text-xs font-black text-white uppercase tracking-widest shadow-black drop-shadow-md">
                                {title}
                            </span>
                        </div>
                        {/* Live Indicator & Upload */}
                        <div className="flex items-center gap-2">
                            {/* Layer Switcher */}
                            <div className="flex bg-slate-900/80 rounded-lg p-0.5 border border-white/10 mr-2">
                                {(['HUMAN', 'HISTORY', 'REALTIME'] as const).map(layer => (
                                    <button
                                        key={layer}
                                        onClick={() => setActiveLayer(layer)}
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${activeLayer === layer
                                            ? (layer === 'REALTIME' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-white/10 text-white')
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {layer.slice(0, 3)}
                                    </button>
                                ))}
                            </div>

                            {/* Upload Button */}
                            <label className="cursor-pointer group/upload">
                                <input
                                    type="file"
                                    accept=".csv,.json"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            uploadLogData(e.target.files[0]);
                                        }
                                    }}
                                />
                                <UploadCloud className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" />
                            </label>

                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${playback.isPlaying ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${playback.isPlaying ? 'bg-cyan-500' : 'bg-amber-500'}`}></span>
                                </span>
                                <span className={`text-[9px] font-mono font-bold ${playback.isPlaying ? 'text-cyan-400' : 'text-amber-400'}`}>
                                    {playback.isPlaying ? 'LIVE' : 'PAUSED'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 1. LIVE STATUS METRICS (With Sparklines) */}
                    {liveMetrics && liveMetrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {liveMetrics.map((m: any, i: number) => (
                                <div
                                    key={i}
                                    className="bg-black/40 rounded p-2 border border-white/10 shadow-sm flex flex-col items-center backdrop-blur-sm relative group/metric"
                                    title={m.source ? `Source: ${m.source.id} | Calibrated: ${m.source.cal}` : 'Source: Unknown'}
                                >
                                    {m.source && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-600 group-hover/metric:bg-cyan-400 transition-colors"></div>
                                    )}
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
                                    <div className={`text-lg font-mono font-bold ${m.status === 'critical' ? 'text-red-500 animate-pulse' : m.status === 'warning' ? 'text-amber-400' : 'text-white'}`}>
                                        {typeof m.value === 'number' ? m.value.toFixed(1) : m.value} <span className="text-[10px] text-slate-500">{m.unit}</span>
                                    </div>
                                    {/* Sparkline Integration */}
                                    {m.history && (
                                        <Sparkline
                                            data={m.history}
                                            width={80}
                                            height={20}
                                            color={getTrendColor(m.history)}
                                            className="mt-1 opacity-80"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 1.5 DIAGNOSTIC WHISPERER (Engineering Insights) */}
                    {diagnostics && diagnostics.length > 0 && (
                        <div className="mb-4 space-y-2 animate-in slide-in-from-left-4 duration-500">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                                <BrainCircuit className={`w-3 h-3 ${hasCriticalRisks ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
                                Sentinel Insights
                            </div>
                            {diagnostics.map((insight: any) => (
                                <div key={insight.id} className={`p-2 rounded border-l-2 text-[10px] leading-tight transition-all duration-500 hover:bg-slate-800/50 ${insight.type === 'critical' ? 'bg-red-950/30 border-red-500 text-red-200 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-amber-950/20 border-amber-500 text-amber-100'}`}>
                                    <div className="font-bold flex items-center justify-between gap-1.5 mb-1">
                                        <div className="flex items-center gap-2">
                                            {insight.type === 'critical' ? <AlertTriangle className="w-3 h-3 text-red-500" /> : <Info className="w-3 h-3 text-amber-500" />}
                                            <span>{insight.messageKey}</span>
                                        </div>
                                        {insight.value && <span className="font-mono text-[9px] opacity-70 border border-white/20 px-1 rounded">{insight.value}</span>}
                                    </div>

                                    {/* SENTINEL VOICE: Logic Trace */}
                                    {insight.vectors && insight.vectors.length > 0 && (
                                        <div className="mt-2 space-y-1 pl-1 border-l border-white/10">
                                            <div className="text-[9px] font-mono opacity-50 uppercase tracking-wide mb-1">Logic Trace:</div>
                                            {insight.vectors.map((vec: string, vIndex: number) => (
                                                <div key={vIndex} className="flex items-center gap-1 text-[9px] font-mono opacity-80">
                                                    <ArrowRight className="w-2 h-2 opacity-50" />
                                                    {vec}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* THE ARCHIVIST: Historical Precedent */}
                                    {insight.precedent && (
                                        <div className="mt-3 bg-slate-900/40 rounded p-2 border border-blue-500/20">
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                                                <Database className="w-3 h-3" />
                                                Historical Precedent
                                            </div>
                                            <div className="text-[9px] text-slate-300">
                                                Similar pattern detected on <span className="text-white font-mono">{insight.precedent.date}</span> leading to <span className="text-white">{insight.precedent.event}</span>.
                                            </div>
                                            <div className="text-[8px] text-slate-500 mt-1 font-mono">
                                                Confidence: {(insight.precedent.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    )}

                                    {/* HUMAN VERIFICATION (The Check-And-Balance) */}
                                    {insight.verification && (
                                        <div className="mt-2 bg-emerald-950/40 rounded p-2 border border-emerald-500/30 animate-in slide-in-from-left-2 transition-all">
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                                <ClipboardList className="w-3 h-3" />
                                                Human Verification Confirmed
                                            </div>
                                            <div className="text-[9px] text-slate-300 italic mb-1">
                                                "{insight.verification.text}"
                                            </div>
                                            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                                                <span>Tech: {insight.verification.author}</span>
                                                <span>Log #{insight.verification.id}</span>
                                            </div>
                                        </div>
                                    )}

                                    {insight.slogan && (
                                        <div className="mt-2 text-[9px] italic opacity-60 font-serif border-t border-white/10 pt-1">
                                            "{insight.slogan}"
                                        </div>
                                    )}

                                    {/* CONTEXTUAL GRAVITY: Tactical Actions */}
                                    {insight.actions && insight.actions.length > 0 && (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            {insight.actions.map((action: any, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log(`[Contextual Gravity] Executing: ${action.type} -> ${action.targetId}`);
                                                        if (action.type === 'OPEN_SOP') {
                                                            // Navigate to SOP if defined, roughly mapping IDs to routes
                                                            if (action.targetId.includes('Drainage')) navigate('/francis/sop/drainage');
                                                            else if (action.targetId.includes('Cooling')) navigate('/francis/sop/cooling');
                                                            else navigate('/library'); // Fallback
                                                        } else if (action.type === 'FOCUS_3D') {
                                                            // Dispatch Custom Event for 3D Viewer to catch
                                                            window.dispatchEvent(new CustomEvent('FOCUS_MESH', { detail: { meshId: action.targetId } }));
                                                        }
                                                    }}
                                                    className="flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-cyan-900/40 border border-white/10 hover:border-cyan-500/50 rounded text-[9px] font-bold text-slate-300 hover:text-cyan-300 transition-all uppercase tracking-wider shadow-sm"
                                                >
                                                    {action.type === 'FOCUS_3D' ? '📦' : action.type === 'OPEN_SOP' ? '📄' : '⚡'}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Slogan / Physics Theory (Glass Card) -> MOVED TO SENTINEL CARD, kept as System Info fallback */}
                    {!hasCriticalRisks && (
                        <div className="relative p-3 bg-gradient-to-br from-cyan-950/30 to-slate-900/50 rounded-lg border border-cyan-500/20 mb-4 shadow-inner ring-1 ring-cyan-500/10 backdrop-blur-md">
                            <div className="text-[10px] text-cyan-200/80 font-bold mb-1 uppercase text-xs flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                Physics Engine
                            </div>
                            <div className="text-[11px] text-slate-300 leading-relaxed font-light italic">
                                "{slogan}"
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 relative z-10">

                        {/* 2. MAINTENANCE PULSE (Enhanced - Clickable) */}
                        {isLoading ? (
                            <div className="space-y-2 py-2">
                                <div className="h-3 bg-amber-900/20 rounded w-1/3 animate-pulse"></div>
                                <div className="h-10 bg-amber-900/10 rounded w-full border-l-2 border-amber-900/30 animate-pulse"></div>
                                <div className="h-10 bg-amber-900/10 rounded w-full border-l-2 border-amber-900/30 animate-pulse delay-75"></div>
                            </div>
                        ) : activeWorkOrders.length > 0 ? (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-amber-500 uppercase border-b border-amber-500/20 pb-1">
                                    <div className="flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {t('sidebar.maintenance.pulse')}
                                    </div>
                                    <span className="bg-amber-500/20 text-amber-400 px-1.5 rounded text-[9px]">{activeWorkOrders.length} {t('sidebar.maintenance.active')}</span>
                                </div>
                                {activeWorkOrders.slice(0, 3).map((wo: any) => (
                                    <div
                                        key={wo.id}
                                        onClick={() => setSelectedWO(wo)}
                                        className="group/wo p-2 bg-amber-950/20 hover:bg-amber-950/40 border-l-2 border-amber-500/50 hover:border-amber-400 rounded-r transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 group-hover/wo:via-amber-500/10 transition-all duration-500" />
                                        <div className="flex justify-between items-start mb-1 relative z-10">
                                            <span className="text-[9px] font-bold text-amber-200">{wo.id}</span>
                                            <span className={`text-[8px] px-1 rounded ${wo.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>{wo.priority}</span>
                                        </div>
                                        <div className="text-[10px] text-amber-100/90 leading-tight group-hover/wo:text-white transition-colors relative z-10 line-clamp-2">
                                            {wo.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-2 opacity-50">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    {t('sidebar.maintenance.systemNominal')}
                                </span>
                            </div>
                        )}

                        {/* 3. QUICK ACTION */}
                        <button
                            onClick={handleQuickLog}
                            className="w-full mt-2 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 rounded shadow-lg shadow-cyan-900/20 text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] group/btn">
                            <ClipboardList className="w-4 h-4 text-cyan-100 group-hover/btn:rotate-12 transition-transform" />
                            Log Observation
                        </button>

                        {/* 4. HISTORICAL LOG (New) */}
                        {contextLogs.length > 0 && (
                            <div className="bg-slate-900/50 rounded border border-white/5 p-2 space-y-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <History className="w-3 h-3" />
                                    {t('sidebar.analytics.historicalLog', 'Recent Activity')}
                                </div>
                                {contextLogs.map(log => (
                                    <div key={log.id} className="text-[10px] text-slate-400 border-l border-white/10 pl-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">{new Date(log.timestamp).toLocaleDateString()}</span>
                                            <span className="text-cyan-500/70">{log.technician}</span>
                                        </div>
                                        <div className="line-clamp-1 italic">{log.summaryDE || log.commentBS}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 5. AUDIT REPORT BUTTON (New) */}
                        <button
                            onClick={handleGenerateReport}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <Download className="w-3 h-3" />
                            {t('sidebar.analytics.generateAudit', 'Generate Audit PDF')}
                        </button>

                        <PdfPreviewModal
                            isOpen={isPreviewOpen}
                            onClose={() => setIsPreviewOpen(false)}
                            pdfBlob={previewBlob}
                            filename={`Audit_${title.replace(/\s+/g, '_')}.pdf`}
                        />

                    </div>

                    {/* Timeline Slider (Depth of Truth) */}
                    {playback.totalDuration > 0 && (
                        <div className="bg-black/40 border-t border-white/10 p-2 backdrop-blur-md mt-2 rounded">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono text-cyan-400">
                                    {new Date(playback.currentTimestamp).toLocaleTimeString()}
                                </span>
                                <button onClick={playback.togglePlay} className="text-cyan-400 hover:text-white">
                                    {playback.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                </button>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={playback.progress}
                                onChange={(e) => playback.scrubTo(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                    )}
                </motion.div>
            )}

        </AnimatePresence>
    );
};
