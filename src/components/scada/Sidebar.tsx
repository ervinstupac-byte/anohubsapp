import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths.ts';
import { useNavigation, AppView } from '../../contexts/NavigationContext.tsx';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { LanguageSelector } from '../LanguageSelector.tsx';

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
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️' },
        { id: 'francisHub', title: t('sidebar.francisLogic', 'Francis Logic Map'), icon: '🧠' },
        { id: 'maintenanceDashboard', title: t('modules.maintenance', 'Maintenance Engine'), icon: '⚙️' },
        { id: 'shaftAlignment', title: t('sidebar.shaftAlignment', 'Shaft Alignment'), icon: '🔄' },
        { id: 'hydraulicMaintenance', title: t('sidebar.hydraulicMaintenance', 'Hydraulic Maintenance'), icon: '🚰' },
        { id: 'boltTorque', title: t('sidebar.boltTorque', 'Bolt Torque'), icon: '🔩' },
        { id: 'shadowEngineer', title: t('sidebar.shadowEngineer', 'Shadow Engineer'), icon: '👻' },
        { id: 'intuitionLog', title: t('sidebar.intuitionLog', 'Intuition Log'), icon: '👂' },
        { id: 'structuralIntegrity', title: t('sidebar.structuralIntegrity', 'Structural Integrity'), icon: '🏗️' },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '📏' },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡' },
    ];

    const secondaryModules = [
        { id: 'riskReport', title: t('modules.riskReport', 'Dossier Archive'), icon: '📂' },
        { id: 'library', title: t('modules.library', 'Tech Library'), icon: '📚' },
        { id: 'standardOfExcellence', title: t('modules.standardOfExcellence'), icon: '🏅' },
        { id: 'activeContext', title: t('hub.vision'), icon: '👁️' }
    ];

    const handleNavigation = (id: string, title: string) => {
        logAction('MODULE_OPEN', title, 'SUCCESS');
        navigateTo(id as AppView);
        onClose();
    };

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
                                onClick={() => handleNavigation(mod.id, mod.title)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${(mod.id === 'maintenanceDashboard' && location.pathname.includes(ROUTES.MAINTENANCE.DASHBOARD)) ||
                                    (mod.id === 'hydraulicMaintenance' && location.pathname.includes(ROUTES.MAINTENANCE.HYDRAULIC)) ||
                                    (mod.id === 'boltTorque' && location.pathname.includes(ROUTES.MAINTENANCE.BOLT_TORQUE)) ||
                                    (mod.id === 'shadowEngineer' && location.pathname.includes(ROUTES.MAINTENANCE.SHADOW_ENGINEER)) ||
                                    (mod.id === 'intuitionLog' && location.pathname.includes(ROUTES.MAINTENANCE.INTUITION_LOG)) ||
                                    (mod.id === 'ar-guide' && location.pathname.includes(ROUTES.MAINTENANCE.AR_GUIDE)) ||
                                    // Fallback for others
                                    (!['maintenanceDashboard', 'hydraulicMaintenance', 'boltTorque', 'shadowEngineer', 'intuitionLog', 'ar-guide'].includes(mod.id) && location.pathname.includes(mod.id.replace('Dashboard', '')))
                                    ? 'bg-cyan-900/20 border-h-cyan text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'
                                    }`}
                            >
                                <span className={`text-lg ${(mod.id === 'maintenanceDashboard' && location.pathname.includes(ROUTES.MAINTENANCE.DASHBOARD)) ||
                                    (mod.id === 'hydraulicMaintenance' && location.pathname.includes(ROUTES.MAINTENANCE.HYDRAULIC)) ||
                                    (mod.id === 'boltTorque' && location.pathname.includes(ROUTES.MAINTENANCE.BOLT_TORQUE)) ||
                                    (!['maintenanceDashboard', 'hydraulicMaintenance', 'boltTorque'].includes(mod.id) && location.pathname.includes(mod.id.replace('Dashboard', '')))
                                    ? 'text-h-cyan' : 'group-hover:text-h-cyan transition-colors'
                                    }`}>{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>
                        ))}

                        {/* Logbook Special Case */}
                        <button
                            onClick={() => handleNavigation('logbook', t('sidebar.maintenanceLogbook', 'Logbook'))}
                            className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group ${location.pathname === '/logbook' ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
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
                            onClick={() => handleNavigation('executiveDashboard', t('sidebar.toolboxAnalytics', 'Toolbox Analytics'))}
                            className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${location.pathname === '/executive' ? 'bg-cyan-900/20 border-cyan-500 text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
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
                                onClick={() => handleNavigation(mod.id, mod.title)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${location.pathname.includes(mod.id) ? 'bg-cyan-900/20 border-h-cyan text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                            >
                                <span className={`text-lg ${location.pathname.includes(mod.id) ? 'text-h-cyan' : 'group-hover:text-h-gold transition-colors'}`}>{mod.icon}</span>
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
            </aside>
        </>
    );
};

// --- INSIGHT PANEL COMPONENT ---
// Replaced local hook with Global Context Provider
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { Lightbulb, FileText, AlertTriangle, ClipboardList, Clock, Zap } from 'lucide-react';


const ContextPanel = () => {
    // Determine context from GLOBAL state
    const { activeDefinition, activeContextNodes, activeLogs, activeWorkOrders, liveMetrics, hasContext } = useContextAwareness();
    const navigate = useNavigate();
    const location = useLocation();

    if (!hasContext) return null;

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
        // Navigate to Logbook with State for pre-filling
        // We look up the raw path from constants or hardcode since we have the ContextDefinition
        navigate('/maintenance/logbook', {
            state: {
                source: activeDefinition?.id || 'Unknown Context',
                reason: 'Smart Sidebar Shortcut'
            }
        });
    };

    return (
        <div className="mx-3 mt-4 mb-2 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl animate-fade-in border-l-4 border-l-cyan-500 overflow-hidden relative group">

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
                {/* Live Indicator */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">LIVE</span>
                </div>
            </div>

            {/* 1. LIVE STATUS METRICS */}
            {liveMetrics && liveMetrics.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {liveMetrics.map((m: any, i: number) => (
                        <div key={i} className="bg-black/20 rounded p-2 border border-white/5 flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
                            <div className={`text-lg font-mono font-bold ${m.status === 'critical' ? 'text-red-500 animate-pulse' : m.status === 'warning' ? 'text-amber-400' : 'text-white'}`}>
                                {m.value} <span className="text-[10px] text-slate-500">{m.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slogan / Physics Theory (Glass Card) */}
            <div className="relative p-3 bg-gradient-to-br from-white/5 to-white/0 rounded-lg border border-white/10 mb-4 shadow-inner">
                <div className="text-[10px] text-cyan-200/80 font-bold mb-1 uppercase text-xs flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Physics Engine
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed font-light italic">
                    "{slogan}"
                </div>
            </div>

            <div className="space-y-4 relative z-10">

                {/* 2. MAINTENANCE PULSE (Enhanced) */}
                {activeWorkOrders.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-500 uppercase border-b border-amber-500/20 pb-1">
                            <div className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Maintenance Pulse
                            </div>
                            <span className="bg-amber-500/20 text-amber-400 px-1.5 rounded text-[9px]">{activeWorkOrders.length} Active</span>
                        </div>
                        {activeWorkOrders.slice(0, 3).map((wo: any) => (
                            <div key={wo.id} className="group/wo p-2 bg-amber-950/20 hover:bg-amber-950/40 border-l-2 border-amber-500/50 hover:border-amber-400 rounded-r transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-bold text-amber-200">{wo.id}</span>
                                    <span className={`text-[8px] px-1 rounded ${wo.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>{wo.priority}</span>
                                </div>
                                <div className="text-[10px] text-amber-100/90 leading-tight group-hover/wo:text-white transition-colors">
                                    {wo.description}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-2 opacity-50">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            System Nominal
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

            </div>
        </div>
    );
};
