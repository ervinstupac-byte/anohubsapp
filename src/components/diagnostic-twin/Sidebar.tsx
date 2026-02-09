import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, getFrancisPath, getMaintenancePath } from '../../routes/paths.ts';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import {
    ChevronDown, ChevronRight, Plus, Search, X,
    FileText, Shield, Settings, Zap, BookOpen, Target,
    AlertTriangle, Cpu, Gauge, Map, ChevronLeft
} from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { useAssetContext } from '../../contexts/AssetContext';
import { QrCode } from '../ui/QrCode';

// GLOBAL EVENT FOR REMOTE TRIGGER
export const TRIGGER_FORENSIC_EXPORT = 'ANOHUB_TRIGGER_FORENSIC_EXPORT';

// --- MISSION SECTOR DEFINITIONS ---
interface SectorModule {
    id: string;
    title: string;
    icon: string;
    route: string;
    isoRef?: string;
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
    const [isExpanded, setIsExpanded] = useState(false);
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
}

const SectorAccordion: React.FC<SectorAccordionProps> = ({
    sector, isExpanded, onToggle, currentPath, onNavigate, searchQuery
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

    return (
        <div className="mb-1 transition-all">
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
                                        onClick={() => onNavigate(module.route, module.title)}
                                        className={`w-full text-left px-11 py-2 text-[10px] font-mono flex items-center justify-between transition-all group/item ${isActive ? 'text-black font-black bg-white/40 shadow-sm' : 'text-slate-600 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-60 grayscale group-hover/item:grayscale-0 transition-all">{module.icon}</span>
                                            <span>{module.title}</span>
                                            {module.isoRef && (
                                                <span className="text-[7px] bg-black/10 px-1 rounded opacity-50">{module.isoRef}</span>
                                            )}
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.5)]" />}
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

    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>(() => ({ criticalOps: true }));

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
                    { id: 'assetPassport', title: 'Asset Passport', icon: '📄', route: getMaintenancePath(ROUTES.MAINTENANCE.ASSET_PASSPORT), isoRef: 'ISO 9001' },
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
                    { id: 'gridSync', title: t('sidebar.modules.grid_sync'), icon: '📡', route: '/scada/core', isoRef: 'IEC 61850' },
                    { id: 'generatorIntegrity', title: t('sidebar.modules.generator_integrity'), icon: '⚡', route: `/${ROUTES.INFRASTRUCTURE.ROOT}`, isoRef: 'IEEE C50' },
                    { id: 'executive', title: t('sidebar.modules.executive'), icon: '📊', route: '/executive' },
                    { id: 'operationalScada', title: 'OPERATIONAL SCADA', icon: '🚨', route: '/scada/core', isoRef: 'IEC 61850' },
                    { id: 'electricalProtection', title: 'ELECTRICAL PROTECTION', icon: '🛡️', route: '/executive/finance', isoRef: 'IEEE C37' },
                    { id: 'scadaControl', title: 'SCADA CONTROL SYSTEM', icon: '🎛️', route: '/scada/core', isoRef: 'ISA 101' },
                    { id: 'powerQuality', title: 'POWER QUALITY', icon: '📈', route: '/executive', isoRef: 'IEC 61000' }
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
                    { id: 'healthMonitor', title: 'System Health', icon: '🩺', route: '/knowledge/health-monitor', isoRef: 'SOURCES: 202' },
                    { id: 'sopManager', title: t('sidebar.modules.sop_manager'), icon: '👻', route: getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER) },
                    { id: 'learningLab', title: t('sidebar.modules.learning_lab'), icon: '🎓', route: `/${ROUTES.LEARNING_LAB}` },
                            { id: 'hppBuilder', title: t('sidebar.modules.hpp_studio'), icon: '⚡', route: getFrancisPath(ROUTES.FRANCIS.DESIGNER) },
                            { id: 'engineerPortal', title: t('sidebar.modules.engineer_portal', 'Engineer Console'), icon: '🛠️', route: '/engineer' },
                            { id: 'ownerPortal', title: t('sidebar.modules.owner_portal', 'Owner Portal'), icon: '🏛️', route: '/owner' },
                            { id: 'hydroschool', title: t('sidebar.modules.hydroschool', 'Hydroschool — Pro‑Bono'), icon: '🎓', route: '/hydroschool' },
                ]
            }
        ];

        return allSectors; // Force show all sectors for all personas (NC-9.0 Requirement)
    }, [t, activePersona]);

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

    const modernGlassTheme = "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-[4px_0_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]";

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

                    {/* MAIN SIDEBAR */}
                    <motion.div
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed lg:relative left-0 top-0 bottom-0 h-full w-[280px] ${modernGlassTheme} z-[100] flex flex-col overflow-hidden transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        {/* BRUSHED METAL TEXTURE */}
                        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] pointer-events-none mix-blend-overlay" />

                        {/* EDGE ACCENTS */}
                        <div className="absolute inset-y-0 left-0 w-[2px] bg-white/40 pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-[1px] bg-black/20 pointer-events-none" />

                        {/* HEADER */}
                        <div className="p-6 border-b border-slate-700/50 relative z-10 bg-slate-900/50 backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">MISSION SECTORS</h2>
                                    <div className="text-sm font-black text-white tracking-tighter flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
                                        CRITICAL OPS
                                    </div>
                                </div>
                                <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {/* SEARCH */}
                            <div className="relative flex items-center bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-600/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] px-3 py-2 transition-all focus-within:border-cyan-500/50">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SCANNING..."
                                    className="bg-transparent border-none outline-none ml-2 text-[10px] font-mono text-slate-200 placeholder:text-slate-500 w-full"
                                />
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 overflow-hidden relative z-10">
                            <FleetSection
                                showMap={showMap}
                                onToggleMap={onToggleMap}
                                onRegisterAsset={onRegisterAsset}
                            />

                            <div className="p-2 space-y-1">
                                {missionSectors.map((sector) => (
                                    <SectorAccordion
                                        key={sector.id}
                                        sector={sector}
                                        isExpanded={expandedSectors[sector.id] || false}
                                        onToggle={() => toggleSector(sector.id)}
                                        currentPath={location.pathname}
                                        onNavigate={handleNavigate}
                                        searchQuery={searchQuery}
                                    />
                                ))}

                                {/* ACTION BUTTON */}
                                <div className="pt-4 px-2 pb-6">
                                    <button
                                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded border-b-4 border-slate-950 active:translate-y-0.5 active:border-b-1 transition-all flex items-center justify-center gap-2 group shadow-lg"
                                        onClick={() => window.dispatchEvent(new CustomEvent(TRIGGER_FORENSIC_EXPORT))}
                                    >
                                        <FileText className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">GENERATE_FORENSIC</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-black/10 relative z-10 bg-black/5 flex flex-col items-center">
                            <div className="w-full flex justify-between items-center text-[7px] font-mono text-slate-500 mb-2 uppercase tracking-tighter">
                                <div className="flex items-center gap-1">
                                    <Cpu className="w-3 h-3" />
                                    <span>LINK_{hiveStatus?.connected ? 'ESTABLISHED' : 'STANDBY'} // NC-9.0</span>
                                </div>
                                <span className={hiveStatus?.connected ? 'text-emerald-600 font-black' : 'text-slate-500'}>
                                    {hiveStatus?.connected ? 'ENCRYPTED' : 'OFFLINE'}
                                </span>
                            </div>
                            <div className="opacity-40 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                <QrCode size={40} value={`anohub-nc42:${activeDefinition?.id || 'null'}`} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
