import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, getFrancisPath, getMaintenancePath } from '../../routes/paths.ts';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import {
    ChevronDown, ChevronRight, Plus, Search, X,
    FileText, Shield, Settings, Zap, BookOpen, Target,
    AlertTriangle, Cpu, Gauge, Map, ChevronLeft, LayoutDashboard, Cog
} from 'lucide-react';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { useAssetContext } from '../../contexts/AssetContext';
import { QrCode } from '../ui/QrCode';
import { ArchiveScanner } from '../../services/ArchiveScanner';
import { MqttBridge, MqttStatus } from '../../services/MqttBridge';
import { ForensicReportService } from '../../services/ForensicReportService';
import guardedAction from '../../utils/guardedAction';

// GLOBAL EVENT FOR REMOTE TRIGGER
export const TRIGGER_FORENSIC_EXPORT = 'ANOHUB_TRIGGER_FORENSIC_EXPORT';


// --- MISSION SECTOR DEFINITIONS ---
interface SectorModule {
    id: string;
    title: string;
    icon: string;
    route: string;
    isoRef?: string;
    onClick?: () => void;
}

interface MissionSector {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    glowColor: string;
    modules: SectorModule[];
}

// --- FLEET SECTION COMPONENT ---
interface FleetSectionProps {
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ showMap, onToggleMap, onRegisterAsset }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { t } = useTranslation();

    return (
        <div className="border-b border-black/5 bg-black/5">
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Map className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest transition-colors ${isExpanded ? 'text-cyan-600' : ''}`}>
                        {t('sidebar.fleet_overview')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegisterAsset();
                        }}
                        className="p-1 rounded bg-black/10 text-slate-600 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-black/5"
                        title="Register New Asset"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4">
                            <ErrorBoundary fallback={<div className="p-4 text-xs text-red-500 font-mono">FLEET UNAVAILABLE</div>}>
                                <FleetOverview
                                    onToggleMap={onToggleMap}
                                    showMap={showMap}
                                    onRegisterAsset={onRegisterAsset}
                                />
                            </ErrorBoundary>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MISSION SECTOR ACCORDION ---
interface SectorAccordionProps {
    sector: MissionSector;
    isExpanded: boolean;
    onToggle: () => void;
    currentPath: string;
    onNavigate: (route: string, title: string) => void;
    searchQuery: string;
    anyExpanded: boolean; // NC-11: New prop for Focus Mode
}

const SectorAccordion: React.FC<SectorAccordionProps> = ({
    sector, isExpanded, onToggle, currentPath, onNavigate, searchQuery, anyExpanded
}) => {
    const filteredModules = useMemo(() => {
        if (!searchQuery) return sector.modules;
        const query = searchQuery.toLowerCase();
        return sector.modules.filter(m =>
            m.title.toLowerCase().includes(query) ||
            m.isoRef?.toLowerCase().includes(query)
        );
    }, [sector.modules, searchQuery]);

    if (searchQuery && filteredModules.length === 0) return null;

    const hasActiveModule = filteredModules.some(m => currentPath === m.route);

    // NC-11: Smart Focus Mode - Dim if another sector is the primary focus (expanded) but this one isn't
    const isDimmed = anyExpanded && !isExpanded;

    return (
        <div className={`mb-1 transition-all duration-500 ${isDimmed ? 'opacity-30 hover:opacity-100 grayscale' : 'opacity-100'}`}>
            <button
                onClick={onToggle}
                className={`w-full px-4 py-2.5 flex items-center justify-between transition-all relative overflow-hidden group/accordion ${hasActiveModule ? 'bg-black/5' : 'hover:bg-white/5'}`}
            >
                <div className={`absolute inset-0 border-b border-black/5 ${isExpanded ? 'bg-black/5' : ''}`} />

                <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-1.5 rounded bg-black/10 shadow-[inner_0_1px_2px_rgba(0,0,0,0.2)] ${sector.color}`}>
                        {sector.icon}
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2f3542]">
                            {sector.title}
                        </span>
                        {hasActiveModule && (
                            <div className="text-[8px] font-mono text-cyan-600 font-black animate-pulse">SYSTEM_ACTIVE</div>
                        )}
                    </div>
                </div>

                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/5"
                    >
                        <div className="p-1 space-y-0.5">
                            {filteredModules.map((module) => {
                                const isActive = currentPath === module.route;
                                return (

                                    <button
                                        key={module.id}
                                        onClick={() => {
                                            if ((module as any).onClick) (module as any).onClick();
                                            else onNavigate(module.route, module.title);
                                        }}
                                        className={`w-full text-left px-11 py-2 text-[10px] font-mono flex items-center justify-between transition-all group/item relative overflow-hidden ${isActive
                                            ? 'text-cyan-100 font-bold bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                            : 'text-slate-400 hover:text-cyan-200 hover:bg-white/5'}`}
                                    >
                                        {isActive && <div className="absolute inset-0 bg-cyan-400/5 blur-md" />}
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className={`transition-all duration-300 ${isActive ? 'opacity-100 text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'opacity-50 grayscale group-hover/item:grayscale-0 group-hover/item:text-cyan-400'}`}>{module.icon}</span>
                                            <span>{module.title}</span>
                                            {module.isoRef && (
                                                <span className={`text-[7px] px-1 rounded opacity-50 ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/5'}`}>{module.isoRef}</span>
                                            )}
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { useToast } from '../../contexts/ToastContext.tsx';

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
    const navigate = useNavigate();
    const { logAction } = useAudit();
    const { t } = useTranslation();
    const { activeDefinition, hiveStatus, activePersona } = useContextAwareness();

    const { activeModal, setActiveModal, toggleWidget } = useDiagnostic();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>(() => ({ criticalOps: true }));

    // NC-12: Knowledge Base State
    const [knowledgeCount, setKnowledgeCount] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const [isSimulating, setIsSimulating] = useState(false);
    const [pulseIntensity, setPulseIntensity] = useState(1);

    // NC-12: Scan for real knowledge base size
    useEffect(() => {
        const syncKnowledge = async () => {
            setIsSyncing(true);
            const result = await ArchiveScanner.scanDocs();
            setKnowledgeCount(result.verifiedFiles);
            setIsSyncing(false);
        };
        syncKnowledge();
    }, []);

    // NC-13: Neural Pulse Reaction
    useEffect(() => {
        const handleTick = (e: CustomEvent) => {
            setIsSimulating(true);
            // Map vibration (2.4 -> 7.1) to intensity (1 -> 0.1s duration or similar logic)
            // Just toggling a simpler state for css animation speed class also works
            setPulseIntensity(e.detail.vibration);
        };
        const handleEnd = () => setIsSimulating(false);

        // NC-14: Incident Memory
        const handleIncident = (e: CustomEvent) => {
            const title = e.detail?.title || "Unknown Incident";
            setRecentIncidents(prev => [{
                id: Date.now().toString(),
                title,
                timestamp: new Date().toLocaleTimeString()
            }, ...prev]);
        };

        window.addEventListener('SIMULATION_TICK', handleTick as EventListener);
        window.addEventListener('SIMULATION_ENDED', handleEnd);
        window.addEventListener(TRIGGER_FORENSIC_EXPORT, handleIncident as EventListener);
        return () => {
            window.removeEventListener('SIMULATION_TICK', handleTick as EventListener);
            window.removeEventListener('SIMULATION_ENDED', handleEnd);
            window.removeEventListener(TRIGGER_FORENSIC_EXPORT, handleIncident as EventListener);
        };
    }, []);

    const [recentIncidents, setRecentIncidents] = useState<Array<{ id: string; title: string; timestamp: string }>>([]);


    // NC-18: MQTT Status Subscription
    const [mqttStatus, setMqttStatus] = useState<MqttStatus>(MqttBridge.status);
    const [isGenerating, setIsGenerating] = useState(false);

    // NC-20: Forensic Generation Handler
    const handleGenerateForensic = async () => {
        const ok = guardedAction('Generate Forensic Dossier', async () => {
            if (isGenerating) return;
            setIsGenerating(true);
            try {
                // Mock telemetry fetch since Sidebar doesn't have direct store access yet
                // In a real scenario, we'd pull from useTelemetryStore.getState()
                const mockTelemetry = { power: 12.5, flow: 85, vibration: 4.8 };
                await ForensicReportService.generateDossier('UNIT-01 (Generic)', mockTelemetry);
            } catch (e) {
                console.error("Forensic Generation Failed", e);
            } finally {
                setIsGenerating(false);
            }
        });
        if (!ok) { try { showToast('Forensic generation blocked: LOTO active', 'warning'); } catch (e) {} }
    };

    useEffect(() => {
        const unsubscribe = MqttBridge.subscribeStatus((status) => {
            setMqttStatus(status);
        });

        // Register global event listener for remote triggers (e.g. keyboard shortcuts)
        // Prevent remote/automatic forensic exports: remote triggers will only show a warning.
        const triggerHandler = () => {
            try { showToast('Remote forensic trigger ignored: use Forensic Modal Export button', 'warning'); } catch (e) {}
        };
        window.addEventListener(TRIGGER_FORENSIC_EXPORT, triggerHandler);

        return () => {
            unsubscribe();
            window.removeEventListener(TRIGGER_FORENSIC_EXPORT, triggerHandler);
        };
    }, []);

    const missionSectors: MissionSector[] = useMemo(() => {
        const allSectors: MissionSector[] = [
            {
                id: 'criticalOps',
                title: t('sidebar.sectors.critical_ops'),
                icon: <Target className="w-3.5 h-3.5" />,
                color: 'text-red-500',
                borderColor: 'border-red-500/20',
                glowColor: '#ef4444',
                modules: [
                    { id: 'missionControl', title: t('sidebar.modules.mission_control'), icon: '🎯', route: ROUTES.HOME },
                    { id: 'francisHub', title: t('sidebar.modules.francis_hub'), icon: '🧠', route: getFrancisPath(ROUTES.FRANCIS.HUB) },
                    { id: 'diagnosticTwin', title: t('sidebar.modules.diagnostic_twin'), icon: '♊', route: `/${ROUTES.DIAGNOSTIC_TWIN}` },
                ]
            },
            {
                id: 'mechanical',
                title: t('sidebar.sectors.mechanical'),
                icon: <Settings className="w-3.5 h-3.5" />,
                color: 'text-amber-500',
                borderColor: 'border-amber-500/20',
                glowColor: '#06b6d4',
                modules: [
                    { id: 'shaftAlignment', title: t('sidebar.modules.shaft_alignment'), icon: '🔄', route: getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT), isoRef: 'ISO 13705' },
                    { id: 'boltTorque', title: t('sidebar.modules.bolt_torque'), icon: '🔩', route: getMaintenancePath(ROUTES.MAINTENANCE.BOLT_TORQUE), isoRef: 'EN 1591-1' },
                    { id: 'labyrinthHealth', title: t('sidebar.modules.labyrinth_health'), icon: '🌀', route: getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC), isoRef: 'API 610' },
                    { id: 'maintenanceEngine', title: t('sidebar.modules.maintenance_engine'), icon: '⚙️', route: getMaintenancePath(ROUTES.MAINTENANCE.DASHBOARD) },
                ]
            },
            {
                id: 'electrical',
                title: t('sidebar.sectors.electrical'),
                icon: <Zap className="w-3.5 h-3.5" />,
                color: 'text-yellow-500',
                borderColor: 'border-yellow-500/20',
                glowColor: '#eab308',
                modules: [
                    { id: 'gridSync', title: t('sidebar.modules.grid_sync'), icon: '📡', route: '/executive', isoRef: 'IEC 61850' },
                    { id: 'generatorIntegrity', title: t('sidebar.modules.generator_integrity'), icon: '⚡', route: `/${ROUTES.INFRASTRUCTURE.ROOT}`, isoRef: 'IEEE C50' },
                    { id: 'executive', title: t('sidebar.modules.executive'), icon: '📊', route: '/executive' },
                ]
            },
            {
                id: 'risk',
                title: t('sidebar.sectors.risk'),
                icon: <Shield className="w-3.5 h-3.5" />,
                color: 'text-purple-500',
                borderColor: 'border-purple-500/20',
                glowColor: '#a855f7',
                modules: [
                    { id: 'barlowAudit', title: t('sidebar.modules.barlow_audit'), icon: '🔬', route: `/${ROUTES.STRUCTURAL_INTEGRITY}`, isoRef: 'ASME B31.1' },
                    { id: 'longevityRoadmap', title: t('sidebar.modules.longevity_roadmap'), icon: '🗺️', route: `/${ROUTES.RISK_ASSESSMENT}` },
                    { id: 'forensicAnalysis', title: t('sidebar.modules.forensic_analysis'), icon: '🔍', route: '/forensics' },
                ]
            },
            {
                id: 'knowledge',
                title: t('sidebar.sectors.knowledge'),
                icon: <BookOpen className="w-3.5 h-3.5" />,
                color: 'text-cyan-500',
                borderColor: 'border-cyan-500/20',
                glowColor: '#3b82f6',
                modules: [
                    {
                        id: 'healthMonitor',
                        // NC-12: Dynamic Source Count
                        title: isSyncing ? 'SYNCING...' : `SOURCES: ${knowledgeCount ?? '---'}`,
                        icon: '🩺',
                        route: '/knowledge/health-monitor',
                        isoRef: 'LIVE_INDEX'
                    },
                    { id: 'sopManager', title: t('sidebar.modules.sop_manager'), icon: '👻', route: getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER) },
                    { id: 'learningLab', title: t('sidebar.modules.learning_lab'), icon: '🎓', route: `/${ROUTES.LEARNING_LAB}` },
                    { id: 'hppBuilder', title: t('sidebar.modules.hpp_studio'), icon: '⚡', route: getFrancisPath(ROUTES.FRANCIS.DESIGNER) },
                    { id: 'engineerPortal', title: t('sidebar.modules.engineer_portal', 'Engineer Console'), icon: '🛠️', route: '#', onClick: () => toggleWidget('engineer-portal') },
                    { id: 'ownerPortal', title: t('sidebar.modules.owner_portal', 'Owner Portal'), icon: '🏛️', route: '/owner' },
                    { id: 'hydroschool', title: t('sidebar.modules.hydroschool', 'Hydroschool — Pro‑Bono'), icon: '🎓', route: '#', onClick: () => toggleWidget('hydroschool-portal') },
                ]
            }
        ];

        return allSectors; // Force show all sectors for all personas (NC-9.0 Requirement)
    }, [t, activePersona, knowledgeCount, isSyncing]);

    const toggleSector = (id: string) => {
        setExpandedSectors(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleNavigate = (route: string, title: string) => {
        logAction('NAVIGATION', `Accessed ${title}`);
        navigate(route);
        if (window.innerWidth < 1024) onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchingSectors: Record<string, boolean> = {};
            missionSectors.forEach(sector => {
                const hasMatch = sector.modules.some(m =>
                    m.title.toLowerCase().includes(query) ||
                    m.isoRef?.toLowerCase().includes(query)
                );
                matchingSectors[sector.id] = hasMatch;
            });
            setExpandedSectors(prev => ({ ...prev, ...matchingSectors }));
        }
    }, [searchQuery, missionSectors]);

    const [activeWorkspace, setActiveWorkspace] = useState<'OPS' | 'FOR' | 'EXE'>('OPS');

    // NC-11: Workspace Mode Switcher Logic
    const handleWorkspaceSwitch = (mode: 'OPS' | 'FOR' | 'EXE') => {
        setActiveWorkspace(mode);
        // Trigger global event for Dashboard to catch
        window.dispatchEvent(new CustomEvent('ANOHUB_WORKSPACE_CHANGE', { detail: { mode } }));
        if (mode === 'OPS') handleNavigate(ROUTES.HOME, 'Operational View');
        if (mode === 'FOR') handleNavigate('/forensics', 'Forensic Lab');
        if (mode === 'EXE') handleNavigate('/executive', 'Executive Briefing');
    };

    const industrialGradient = "bg-gradient-to-br from-[#f1f2f6] via-[#ced6e0] to-[#747d8c]";

    // Status Logic
    const getStatusColor = () => {
        switch (mqttStatus) {
            case 'CONNECTED': return 'text-emerald-500 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            case 'CONNECTING': return 'text-amber-500 animate-pulse';
            case 'ERROR': return 'text-red-500 font-bold animate-pulse';
            case 'IDLE':
            default: return 'text-blue-400';
        }
    };

    const getStatusText = () => {
        switch (mqttStatus) {
            case 'CONNECTED': return 'UPLINK_ACTIVE';
            case 'CONNECTING': return 'SEARCHING...';
            case 'ERROR': return 'LINK_LOST';
            case 'IDLE': return 'SIMULATION_CORE';
            default: return 'OFFLINE';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* MOBILE OVERLAY */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
                    />

                    {/* MAIN SIDEBAR RAIL */}
                    <motion.div
                        initial={{ x: -64, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -64, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed lg:static left-0 top-0 bottom-0 h-full w-16 bg-[#020617] border-r border-white/5 z-[100] flex flex-col items-center py-4 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-hidden`}
                        id="sidebar-rail"
                        data-testid="sidebar-rail"
                    >
                        {/* SYSTEM LOGO / TOP BUTTON */}
                        <div className="mb-8 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]" onClick={() => navigate('/')}>
                                <Cpu className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            </div>
                        </div>

                        {/* NAV ICONS */}
                        <div className="flex-1 flex flex-col items-center gap-6 w-full">
                            {[
                                { id: 'ops', icon: <LayoutDashboard className="w-5 h-5" />, route: ROUTES.HOME, label: 'Dashboard' },
                                { id: 'mechanical', icon: <Cog className="w-5 h-5" />, label: 'Mechanical' },
                                { id: 'electrical', icon: <Zap className="w-5 h-5" />, label: 'Electrical' },
                                { id: 'forensics', icon: <Search className="w-5 h-5" />, label: 'Forensics' },
                                { id: 'risk', icon: <Shield className="w-5 h-5" />, route: `/${ROUTES.RISK_ASSESSMENT}`, label: 'Risk' },
                                { id: 'docs', icon: <BookOpen className="w-5 h-5" />, route: '/knowledge/health-monitor', label: 'Docs' },
                            ].map((item) => {
                                const isActive = item.route ? location.pathname === item.route : activeModal === item.id.toUpperCase();

                                const handleRailClick = () => {
                                    // Primary nav icons must only toggle modular widgets or navigate.
                                    if (item.id === 'mechanical') {
                                        // Toggle the mechanical systems widget only
                                        toggleWidget('mechanical-systems');
                                    }
                                    else if (item.id === 'electrical') {
                                        // Toggle the electrical grid widget only
                                        toggleWidget('electrical-grid');
                                    }
                                    else if (item.id === 'forensics') {
                                        // Map Search -> Heritage search widget to avoid accidental forensic exports
                                        toggleWidget('heritage-search');
                                    }
                                    else if (item.id === 'docs') {
                                        toggleWidget('engineer-portal');
                                        try { showToast("ENGINEER_CONSOLE: Active", "info"); } catch (e) {}
                                    }
                                    else if (item.route) handleNavigate(item.route, item.label);
                                };

                                return (
                                    <button
                                        key={item.id}
                                        id={`nav-${item.id}`}
                                        data-testid={`nav-${item.id}`}
                                        onClick={handleRailClick}
                                        className={`p-3 rounded-lg transition-all duration-300 relative group ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        title={item.label}
                                    >
                                        <div className="group-hover:scale-110 transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                                            {item.icon}
                                        </div>
                                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 rounded-r shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}

                                        {/* HOVER LABEL TOOLTIP */}
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[var(--z-banner)] font-mono tracking-widest uppercase">
                                            {item.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* BOTTOM ACTIONS */}
                        <div className="mt-auto flex flex-col items-center gap-6 pb-4">
                            <button
                                onClick={onToggleMap}
                                className={`p-3 rounded-lg transition-all group ${showMap ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-white'}`}
                                title="Fleet Map"
                            >
                                <Map className="w-5 h-5" />
                            </button>
                            <div className="w-8 h-px bg-white/5" />
                            <div className={`w-2 h-2 rounded-full ${hiveStatus?.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} title="System Status" />
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};
