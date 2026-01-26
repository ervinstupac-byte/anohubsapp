import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, ChevronRight, Home, Wrench, BarChart3, Settings, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDensity } from '../../contexts/DensityContext';
import { useWorkflow, ModuleType } from '../../contexts/WorkflowContext';
import { SystemOverviewModal } from '../modals/SystemOverviewModal'; // NEW
import { Map, ZapOff } from 'lucide-react'; // NEW Icons

interface WorkflowHeaderProps {
    className?: string;
}

// Module display configuration
const MODULE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    '/': { label: 'Toolbox', icon: <Wrench className="w-3 h-3" />, color: 'text-cyan-400' },
    '/hpp-builder': { label: 'Design Studio', icon: <Settings className="w-3 h-3" />, color: 'text-purple-400' },
    '/executive': { label: 'Executive', icon: <BarChart3 className="w-3 h-3" />, color: 'text-amber-400' },
    '/diagnostic-twin': { label: 'Digital Twin', icon: <Monitor className="w-3 h-3" />, color: 'text-emerald-400' },
    '/maintenance': { label: 'Maintenance', icon: <Wrench className="w-3 h-3" />, color: 'text-blue-400' }
};

/**
 * WorkflowHeader - Global machine health status bar
 * 
 * Displays:
 * - Current machine health indicator
 * - Active asset name with quick-switch
 * - Breadcrumb path back to Dashboard
 * - Respects density mode (compact/relaxed)
 */
export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedAsset, assets, selectAsset } = useAssetContext();
    const { diagnosis, mechanical } = useTelemetryStore();
    const { mode } = useDensity();
    const { logNavigation } = useWorkflow();
    const [showMap, setShowMap] = React.useState(false); // NEW
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine); // NEW

    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const isCompact = mode === 'compact';

    // Compute health score and status
    const healthData = useMemo(() => {
        const score = diagnosis?.metrics?.healthScore || 85;
        const vibration = mechanical?.vibration || 0.02;
        const temp = mechanical?.bearingTemp || 45;

        let status: 'nominal' | 'warning' | 'critical' = 'nominal';
        if (score < 50 || temp > 75) status = 'critical';
        else if (score < 80 || temp > 60 || vibration > 0.05) status = 'warning';

        return { score, status, vibration, temp };
    }, [diagnosis, mechanical]);

    // Determine current module from path
    const currentModule = useMemo(() => {
        const path = location.pathname;
        // Match longest prefix first
        const matchedKey = Object.keys(MODULE_CONFIG)
            .filter(key => path === key || (key !== '/' && path.startsWith(key)))
            .sort((a, b) => b.length - a.length)[0] || '/';
        return MODULE_CONFIG[matchedKey] || MODULE_CONFIG['/'];
    }, [location.pathname]);

    const statusColors = {
        nominal: 'bg-emerald-500',
        warning: 'bg-amber-500',
        critical: 'bg-red-500'
    };

    const handleHomeClick = () => {
        logNavigation({ module: 'toolbox' });
        navigate('/');
    };

    // Don't show on login page
    if (location.pathname === '/login') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                flex items-center justify-between
                ${isCompact ? 'px-3 py-1.5 gap-3' : 'px-4 py-2 gap-4'}
                bg-slate-900/80 backdrop-blur-xl border-b border-white/5
                ${className}
            `}
        >
            {/* LEFT: Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs font-mono">
                <button
                    onClick={handleHomeClick}
                    className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                    <Home className="w-3 h-3" />
                    {!isCompact && <span>Dashboard</span>}
                </button>

                {location.pathname !== '/' && (
                    <>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span className={`flex items-center gap-1 ${currentModule.color}`}>
                            {currentModule.icon}
                            <span className="font-bold">{currentModule.label}</span>
                        </span>
                    </>
                )}
            </div>

            {/* CENTER: Health Indicator (Hidden when compact) */}
            {!isCompact && selectedAsset && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`
                            w-2 h-2 rounded-full animate-pulse
                            ${statusColors[healthData.status]}
                        `} />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {t('dashboard.workflowHeader.health', 'Health')}
                        </span>
                        <span className={`
                            text-sm font-mono font-bold
                            ${healthData.status === 'critical' ? 'text-red-400' :
                                healthData.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}
                        `}>
                            {healthData.score}%
                        </span>
                    </div>

                    {/* Vibration indicator */}
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-1">
                        <Activity className={`w-3 h-3 ${healthData.vibration > 0.05 ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-mono text-slate-500">
                            {healthData.vibration.toFixed(3)} mm/s
                        </span>
                    </div>
                </div>
            )}

            {/* RIGHT: Asset Selector & System Tools */}
            <div className="flex items-center gap-6">
                {/* NEW: Local Mode Indicator */}
                {isOffline && (
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <ZapOff className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Local Mode</span>
                    </div>
                )}

                {/* NEW: System Overview Trigger */}
                <button
                    onClick={() => setShowMap(true)}
                    className={`
                        p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-400
                        transition-colors border border-transparent hover:border-white/5
                        ${isCompact ? 'scale-90' : ''}
                    `}
                    title="System Topology Map"
                >
                    <Map className="w-4 h-4" />
                </button>

                {/* EXTREME DEFENSE: Guard against null/undefined selectedAsset or missing properties */}
                {selectedAsset && selectedAsset?.id ? (
                    <>
                        <div className="h-4 w-px bg-white/10" />

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-600 uppercase hidden sm:inline">
                                {t('dashboard.workflowHeader.title', 'Active')}:
                            </span>
                                <select
                                value={selectedAsset.id || ''} // Fallback for safety
                                onChange={(e) => selectAsset(Number(e.target.value))}
                                className={`
                                    bg-slate-800/50 border border-white/10 rounded
                                    ${isCompact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}
                                    font-mono font-bold text-cyan-400
                                    focus:outline-none focus:border-cyan-500/50
                                    cursor-pointer
                                `}
                            >
                                {(assets || []).map(asset => (
                                    <option key={asset?.id || 'unknown'} value={asset?.id}>
                                        {asset?.name || '—'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                ) : (
                    // Fallback if no asset selected yet (e.g. initial load)
                    <div className="h-4 w-px bg-white/10" />
                )}
            </div>

            {/* NEW: Map Modal */}
            <SystemOverviewModal isOpen={showMap} onClose={() => setShowMap(false)} />
        </motion.div>
    );
};

export default WorkflowHeader;
