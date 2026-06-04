import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Activity,
  Shield,
  FileText,
  Zap,
  Cpu,
  Microscope,
  Settings,
  LayoutDashboard,
  AlertTriangle,
  Lock,
  Gauge,
  Target,
  BookOpen,
  Map,
  X,
  Plus,
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
  badge?: string;
  badgeColor?: string;
}

interface SidebarSection {
  id: 'operations' | 'forensics' | 'governance';
  title: string;
  icon: React.ReactNode;
  statusColor: string; // section health indicator
  modules: SidebarModule[];
}

// --- CONFIGURATION ---
const SECTIONS: SidebarSection[] = [
  {
    id: 'operations',
    title: 'OPERATIONS',
    icon: <Zap className="w-3.5 h-3.5" />,
    statusColor: 'bg-emerald-500',
    modules: [
      { id: 'scada', title: 'SCADA Core', path: '/scada/core', icon: <Activity className="w-3 h-3" /> },
      { id: 'master', title: 'Master Dashboard', path: '/master', icon: <LayoutDashboard className="w-3 h-3" /> },
      { id: 'francisHub', title: 'Francis Turbine Hub', path: '/francis/hub', icon: <Zap className="w-3 h-3" /> },
      { id: 'fleet', title: 'Fleet Overview', path: '/fleet', icon: <Map className="w-3 h-3" /> },
      { id: 'alerts', title: 'Active Alarms', path: '/alerts', icon: <AlertTriangle className="w-3 h-3" />, badge: 'LIVE', badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20' },
      { id: 'mounterCard', title: 'Mounter Quick Card', path: `/maintenance/${ROUTES.MAINTENANCE.MOUNTER_CARD}`, icon: <Gauge className="w-3 h-3" /> },
      { id: 'damageCard', title: 'Damage Diagnosis', path: `/maintenance/${ROUTES.MAINTENANCE.DAMAGE_CARD}`, icon: <AlertTriangle className="w-3 h-3" /> },
      { id: 'assetPassportCard', title: 'Asset Passport', path: `/maintenance/${ROUTES.MAINTENANCE.ASSET_PASSPORT_CARD}`, icon: <FileText className="w-3 h-3" /> },
      { id: 'onboarding', title: 'Asset Onboarding', path: '/asset-onboarding', icon: <Cpu className="w-3 h-3" /> },
      { id: 'alignmentWizard', title: 'Alignment Wizard', path: '/francis/sop-shaft-alignment', icon: <Activity className="w-3 h-3" /> },
    ],
  },
  {
    id: 'forensics',
    title: 'FORENSICS',
    icon: <Microscope className="w-3.5 h-3.5" />,
    statusColor: 'bg-amber-500',
    modules: [
      { id: 'riskReport', title: 'Full Risk Dossier', path: '/risk-report', icon: <FileText className="w-3 h-3" /> },
      { id: 'lab', title: 'Forensic Lab', path: '/forensics', icon: <Microscope className="w-3 h-3" /> },
      { id: 'audio', title: 'Audio Spectrum', path: '/forensics/audio', icon: <Activity className="w-3 h-3" /> },
      { id: 'vision', title: 'Vision Analyzer', path: '/forensics/vision', icon: <Target className="w-3 h-3" /> },
      { id: 'logs', title: 'Event Logs', path: '/logs', icon: <FileText className="w-3 h-3" /> },
    ],
  },
  {
    id: 'governance',
    title: 'GOVERNANCE',
    icon: <Shield className="w-3.5 h-3.5" />,
    statusColor: 'bg-blue-500',
    modules: [
      { id: 'audit', title: 'Audit Trail', path: '/audit', icon: <FileText className="w-3 h-3" /> },
      { id: 'knowledge', title: 'Knowledge Bank', path: '/knowledge/capture', icon: <BookOpen className="w-3 h-3" /> },
      { id: 'constitution', title: 'AI Constitution', path: '/docs/constitution', icon: <BookOpen className="w-3 h-3" /> },
      { id: 'admin', title: 'Admin Health', path: '/admin/health', icon: <Lock className="w-3 h-3" /> },
      { id: 'settings', title: 'System Settings', path: '/settings', icon: <Settings className="w-3 h-3" /> },
    ],
  },
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
  const store = useTelemetryStore() as any;
  const healthScore = store.executiveResult?.masterHealthScore ?? 100;
  const rpm = store.mechanical?.rpm ?? 0;
  const power = store.electrical?.activePower ?? 0;
  const efficiency = store.physics?.efficiency ?? 0;

  // Local State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operations: true,
    forensics: false,
    governance: false,
  });

  // Toggle Section
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter Modules
  const filteredSections = useMemo(() => {
    if (!searchQuery) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.map(section => ({
      ...section,
      modules: section.modules.filter(m => m.title.toLowerCase().includes(q)),
    })).filter(section => section.modules.length > 0);
  }, [searchQuery]);

  // Oracle Results (NC-17600)
  const oracleResults = useMemo(() => {
    try {
      if (!searchQuery || searchQuery.length < 2) return [];
      const results = KnowledgeBaseService.search(searchQuery);
      return Array.isArray(results) ? results : [];
    } catch {
      return [];
    }
  }, [searchQuery]);

  const safeOracleResults = Array.isArray(oracleResults) ? oracleResults : [];

  // Health color
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const healthGlow = healthScore >= 90
    ? 'shadow-[0_0_8px_rgba(16,185,129,0.4)]'
    : healthScore >= 70
    ? 'shadow-[0_0_8px_rgba(245,158,11,0.4)]'
    : 'shadow-[0_0_8px_rgba(239,68,68,0.4)]';

  const totalResults = filteredSections.reduce((sum, s) => sum + s.modules.length, 0);

  return (
    <motion.div
      initial={false}
      animate={{ x: isOpen ? 0 : -280 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed inset-y-0 left-0 w-64 flex flex-col z-40 overflow-hidden"
      style={{ background: 'rgba(2, 6, 23, 0.97)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute inset-0 surface-grid opacity-20" />
      </div>

      {/* 1. HEADER */}
      <div className="relative p-4 border-b border-white/5 shrink-0">
        {/* Brand row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 shrink-0">
              <div className="w-6 h-6 rounded-none bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.25em] text-white">SOVEREIGN</div>
              <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">HPP Operating System</div>
            </div>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-600 hover:text-white hover:bg-white/5 rounded transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Health banner */}
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-white/3 rounded-lg border border-white/5">
          <div className={`w-2 h-2 rounded-full shrink-0 ${getHealthColor(healthScore)} ${healthGlow}`} />
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">System Health</div>
            <div className="text-xs font-bold text-white font-mono tabular-nums">{healthScore.toFixed(0)}%</div>
          </div>
          <div className="h-6 w-px bg-white/8" />
          <div className="text-right">
            <div className="text-[9px] font-mono text-slate-500">EFF</div>
            <div className="text-xs font-bold text-cyan-400 font-mono">{efficiency.toFixed(1)}%</div>
          </div>
        </div>

        {/* Omnibar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search modules… (Ctrl+K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/8 rounded-lg pl-8 pr-8 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-900 transition-all font-mono"
          />
          {searchQuery && (
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <span className="text-[9px] text-slate-500 font-mono">{totalResults}</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-600 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Oracle results */}
        <AnimatePresence>
          {safeOracleResults.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 bg-amber-950/30 border border-amber-500/20 rounded-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 flex items-center gap-2 border-b border-amber-500/10">
                <BookOpen className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ancestral Oracle</span>
              </div>
              <div className="p-1 max-h-32 overflow-y-auto">
                {safeOracleResults.map((res: any) => (
                  <div key={res.id} className="p-2 hover:bg-amber-500/10 rounded cursor-pointer transition-colors group">
                    <div className="text-[10px] font-bold text-amber-200 group-hover:text-white">{res.title}</div>
                    <div className="text-[9px] text-amber-500/60 truncate">{res.excerpt}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results state */}
        {searchQuery && totalResults === 0 && safeOracleResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 p-3 bg-slate-900/50 border border-white/5 rounded-lg text-center"
          >
            <div className="text-[10px] text-slate-500 font-mono">No modules match "{searchQuery}"</div>
            <div className="text-[9px] text-slate-600 mt-1">Try: SCADA, Fleet, Forensics…</div>
          </motion.div>
        )}
      </div>

      {/* 2. SCROLLABLE NAV */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar relative">
        {filteredSections.map(section => (
          <div key={section.id} className="mb-1">
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-3 py-2.5 flex items-center justify-between group hover:bg-white/3 transition-colors rounded-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${section.statusColor} opacity-80`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.18em] group-hover:text-slate-300 transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">{section.icon}</span>
                  {section.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono text-slate-700">{section.modules.length}</span>
                {expandedSections[section.id] || searchQuery ? (
                  <ChevronDown className="w-3 h-3 text-slate-600" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {(expandedSections[section.id] || searchQuery) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="py-0.5">
                    {section.modules.map((module, idx) => {
                      const isActive = location.pathname === module.path ||
                        (module.path !== '/' && location.pathname.startsWith(module.path));
                      return (
                        <motion.button
                          key={module.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => navigate(module.path)}
                          className={`
                            w-full text-left px-3 py-2 pl-8 flex items-center gap-2.5 text-[11px] font-mono
                            transition-all duration-150 relative group
                            ${isActive
                              ? 'text-cyan-300 bg-cyan-500/8 border-r-2 border-cyan-400'
                              : 'text-slate-500 hover:text-slate-200 hover:bg-white/4'
                            }
                          `}
                        >
                          {/* Active indicator glow */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                          )}

                          <span className={`shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                            {module.icon}
                          </span>
                          <span className="flex-1 truncate">{module.title}</span>

                          {/* Badge */}
                          {module.badge && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${module.badgeColor}`}>
                              {module.badge}
                            </span>
                          )}

                          {/* Active dot */}
                          {isActive && (
                            <div className="w-1 h-1 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Register Asset CTA */}
        {onRegisterAsset && (
          <div className="px-3 mt-3">
            <button
              onClick={onRegisterAsset}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-cyan-500/6 hover:bg-cyan-500/12 border border-cyan-500/15 hover:border-cyan-500/30 rounded-lg text-[10px] font-mono text-cyan-400/70 hover:text-cyan-400 transition-all group"
            >
              <Plus className="w-3 h-3" />
              <span className="uppercase tracking-wider">Register New Asset</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. PINNED METRICS FOOTER */}
      <div className="p-3 border-t border-white/5 bg-slate-950/80 shrink-0 relative">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">LIVE METRICS</span>
          <Settings className="w-3 h-3 text-slate-700 cursor-pointer hover:text-cyan-400 transition-colors" />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'RPM', value: rpm.toFixed(0), icon: <Gauge className="w-3 h-3 text-cyan-500" />, color: 'text-cyan-300' },
            { label: 'MW', value: power.toFixed(1), icon: <Zap className="w-3 h-3 text-amber-500" />, color: 'text-amber-300' },
            { label: 'EFF', value: `${efficiency.toFixed(1)}%`, icon: <Target className="w-3 h-3 text-emerald-500" />, color: 'text-emerald-300' },
          ].map(metric => (
            <div key={metric.label} className="bg-slate-950 p-2 rounded-lg border border-white/5 flex flex-col items-center gap-1">
              {metric.icon}
              <span className={`text-[11px] font-mono font-bold tabular-nums ${metric.color}`}>{metric.value}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-wider">{metric.label}</span>
            </div>
          ))}
        </div>

        {/* Status row */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">ONLINE</span>
          </div>
          <span className="text-[8px] font-mono text-slate-700">v2.0.0-NC</span>
        </div>
      </div>
    </motion.div>
  );
};
