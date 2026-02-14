import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Search, ChevronDown, ChevronRight,
    Activity, Shield, FileText, Zap,
    Cpu, Microscope, Settings,
    LayoutDashboard, AlertTriangle, Lock,
    Gauge, Target, BookOpen, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { ROUTES } from '../../routes/paths';
import { KnowledgeBaseService } from '../../services/KnowledgeBaseService';

// --- TYPES ---
interface SidebarModule {
    id: string;
    title: string;
    path: string;
    icon: React.ReactNode;
}

interface SidebarSection {
    id: 'operations' | 'forensics' | 'governance';
    title: string;
    icon: React.ReactNode;
    modules: SidebarModule[];
}

// --- CONFIGURATION ---
const SECTIONS: SidebarSection[] = [
    {
        id: 'operations',
        title: 'OPERATIONS',
        icon: <Zap className="w-4 h-4" />,
        modules: [
            { id: 'scada', title: 'SCADA Core', path: '/scada/core', icon: <Activity className="w-3 h-3" /> },
            { id: 'master', title: 'Master Dashboard', path: '/master', icon: <LayoutDashboard className="w-3 h-3" /> },
            { id: 'francisHub', title: 'Francis Turbine Hub', path: '/francis/hub', icon: <Zap className="w-3 h-3" /> }, // NC-20701
            { id: 'fleet', title: 'Fleet Overview', path: '/fleet', icon: <Map className="w-3 h-3" /> },
            { id: 'alerts', title: 'Active Alarms', path: '/alerts', icon: <AlertTriangle className="w-3 h-3" /> },
            { id: 'mounterCard', title: 'Mounter Quick Card', path: `/maintenance/${ROUTES.MAINTENANCE.MOUNTER_CARD}`, icon: <Gauge className="w-3 h-3" /> },
            { id: 'damageCard', title: 'Damage Diagnosis', path: `/maintenance/${ROUTES.MAINTENANCE.DAMAGE_CARD}`, icon: <AlertTriangle className="w-3 h-3" /> },
            { id: 'assetPassportCard', title: 'Asset Passport', path: `/maintenance/${ROUTES.MAINTENANCE.ASSET_PASSPORT_CARD}`, icon: <FileText className="w-3 h-3" /> },
            { id: 'onboarding', title: 'Asset Onboarding', path: '/asset-onboarding', icon: <Cpu className="w-3 h-3" /> }, // NC-21000
            { id: 'alignmentWizard', title: 'Alignment Wizard', path: '/francis/sop-shaft-alignment', icon: <Activity className="w-3 h-3" /> } // NC-20900
        ]
    },
    {
        id: 'forensics',
        title: 'FORENSICS',
        icon: <Microscope className="w-4 h-4" />,
        modules: [
            { id: 'riskReport', title: 'Full Risk Dossier', path: '/risk-report', icon: <FileText className="w-3 h-3" /> }, // NC-20701
            { id: 'lab', title: 'Forensic Lab', path: '/forensics', icon: <Microscope className="w-3 h-3" /> },
            { id: 'audio', title: 'Audio Spectrum', path: '/forensics/audio', icon: <Activity className="w-3 h-3" /> },
            { id: 'vision', title: 'Vision Analyzer', path: '/forensics/vision', icon: <Target className="w-3 h-3" /> },
            { id: 'logs', title: 'Event Logs', path: '/logs', icon: <FileText className="w-3 h-3" /> }
        ]
    },
    {
        id: 'governance',
        title: 'GOVERNANCE',
        icon: <Shield className="w-4 h-4" />,
        modules: [
            { id: 'audit', title: 'Audit Trail', path: '/audit', icon: <FileText className="w-3 h-3" /> },
            { id: 'knowledge', title: 'Knowledge Bank', path: '/knowledge/capture', icon: <BookOpen className="w-3 h-3" /> }, // NC-20701
            { id: 'constitution', title: 'AI Constitution', path: '/docs/constitution', icon: <BookOpen className="w-3 h-3" /> },
            { id: 'admin', title: 'Admin Health', path: '/admin/health', icon: <Lock className="w-3 h-3" /> },
            { id: 'settings', title: 'System Settings', path: '/settings', icon: <Settings className="w-3 h-3" /> }
        ]
    }
];

// --- COMPONENT ---
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    showMap?: boolean;
    onToggleMap?: () => void;
    onRegisterAsset?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, showMap, onToggleMap, onRegisterAsset }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Telemetry Hooks
    const store = useTelemetryStore() as any; // Type assertion for flexibility
    const healthScore = store.executiveResult?.masterHealthScore ?? 100;
    const rpm = store.mechanical?.rpm ?? 0;
    const power = store.electrical?.activePower ?? 0;
    const efficiency = store.physics?.efficiency ?? 0;

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        operations: true,
        forensics: true,
        governance: true
    });

    // Toggle Section
    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter Modules
    const filteredSections = useMemo(() => {
        if (!searchQuery) return SECTIONS;

        return SECTIONS.map(section => ({
            ...section,
            modules: section.modules.filter(m =>
                m.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(section => section.modules.length > 0);
    }, [searchQuery]);

    // NC-17600: Oracle Logic Integration (with failsafe)
    const oracleResults = useMemo(() => {
        try {
            if (!searchQuery || searchQuery.length < 2) return [];
            const results = KnowledgeBaseService.search(searchQuery);
            return Array.isArray(results) ? results : [];
        } catch (e) {
            console.error("Oracle Failure:", e);
            return [];
        }
    }, [searchQuery]);

    // Health Color Logic
    const getHealthColor = (score: number) => {
        if (score >= 90) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
        if (score >= 70) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
    };

    // EMERGENCY HARD FALLBACK (NC-19600): Ensure oracleResults is ALWAYS an array
    const safeOracleResults = Array.isArray(oracleResults) ? oracleResults : [];

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: isOpen ? 0 : -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-40 shadow-2xl"
        >
            {/* 1. HEADER & OMNIBAR */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-black tracking-[0.2em] text-slate-100">
                        SOVEREIGN
                    </span>
                </div>

                <div className="relative group">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                {/* ORACLE RESULTS (NC-12500) */}
                <AnimatePresence>
                    {safeOracleResults && safeOracleResults.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 bg-amber-900/20 border border-amber-500/30 rounded overflow-hidden"
                        >
                            <div className="px-3 py-1.5 bg-amber-500/10 text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen className="w-3 h-3" /> Ancestral Oracle
                            </div>
                            <div className="p-1">
                                {safeOracleResults.map(res => (
                                    <div key={res.id} className="p-2 hover:bg-amber-500/10 rounded cursor-pointer transition-colors group">
                                        <div className="text-[10px] font-bold text-amber-200 group-hover:text-white">{res.title}</div>
                                        <div className="text-[9px] text-amber-500/70">{res.excerpt}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. SCROLLABLE NAVIGATION */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {filteredSections.map(section => (
                    <div key={section.id} className="mb-2">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-4 py-2 flex items-center justify-between group hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {/* Status Pulse */}
                                <div className={`w-1.5 h-1.5 rounded-full ${getHealthColor(healthScore)}`} />

                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">
                                    {section.title}
                                </span>
                            </div>
                            {expandedSections[section.id] || searchQuery ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                            )}
                        </button>

                        <AnimatePresence>
                            {(expandedSections[section.id] || searchQuery) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="py-1">
                                        {section.modules.map(module => {
                                            const isActive = location.pathname === module.path;
                                            return (
                                                <button
                                                    key={module.id}
                                                    onClick={() => navigate(module.path)}
                                                    className={`w-full text-left px-4 py-2 pl-10 flex items-center gap-3 text-[11px] font-mono transition-all
                                                        ${isActive
                                                            ? 'text-emerald-400 bg-emerald-500/10 border-r-2 border-emerald-500'
                                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span className={isActive ? 'opacity-100' : 'opacity-50'}>
                                                        {module.icon}
                                                    </span>
                                                    {module.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* 3. QUICK PINS & FOOTER */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        PINNED METRICS
                    </span>
                    <Settings className="w-3 h-3 text-slate-600 cursor-pointer hover:text-emerald-400" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center">
                        <Gauge className="w-3 h-3 text-cyan-500 mb-1" />
                        <span className="text-[10px] font-mono text-slate-300">{rpm.toFixed(0)}</span>
                        <span className="text-[8px] text-slate-600">RPM</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center">
                        <Zap className="w-3 h-3 text-amber-500 mb-1" />
                        <span className="text-[10px] font-mono text-slate-300">{power.toFixed(1)}</span>
                        <span className="text-[8px] text-slate-600">MW</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center">
                        <Target className="w-3 h-3 text-emerald-500 mb-1" />
                        <span className="text-[10px] font-mono text-slate-300">{efficiency.toFixed(1)}%</span>
                        <span className="text-[8px] text-slate-600">EFF</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-slate-500">SYSTEM ONLINE</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600">v1.0.0</span>
                </div>
            </div>
        </motion.div>
    );
};
