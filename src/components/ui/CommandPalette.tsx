import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Smartphone, Box, Zap, FileText, Settings, X, ChevronRight, RefreshCw, ShieldAlert, CheckCircle, ShieldCheck, Activity, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../../contexts/AssetContext';
import idAdapter from '../../utils/idAdapter';
import { useDensity } from '../../stores/useAppStore';
import { useDrillDown } from '../../contexts/DrillDownContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useValidation } from '../../contexts/ValidationContext';
import { GLASS, RADIUS, TYPOGRAPHY_COMPACT, TYPOGRAPHY, SPACING, SPACING_COMPACT, STATUS_COLORS } from '../../shared/design-tokens';
import { useSmartSuggestions, SmartCommand } from '../../hooks/useSmartSuggestions';
import { StatusIndicator } from '../../shared/components/ui/StatusIndicator';
import { dispatch, EVENTS } from '../../lib/events';
import { useToast } from '../../stores/useAppStore';
import { SystemOverviewModal } from '../modals/SystemOverviewModal';
import { PrintPreviewModal } from '../modals/PrintPreviewModal';
import { AssetPassportModal } from '../dashboard/AssetPassportModal';

interface CommandResult {
    id: string;
    label: string;
    type: 'asset' | 'module' | 'action' | 'suggestion';
    icon: React.ReactNode;
    action: () => void;
    status?: string;
    subtitle?: string;
    isSuggestion?: boolean;
    variant?: 'danger' | 'warning' | 'default';
}

export const CommandPalette = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { assets, selectAsset, selectedAsset } = useAssetContext();
    const { densityMode: mode } = useDensity();
    const { drillDown } = useDrillDown();
    const { confirm } = useConfirm();
    const { validateTask } = useValidation();
    const { t } = useTranslation();
    const smartSuggestions = useSmartSuggestions();
    const { showToast } = useToast();

    // Modal States
    const [showSystemOverview, setShowSystemOverview] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [showPassport, setShowPassport] = useState(false);
    // Placeholder for technical state needed by PrintPreview
    const [technicalState] = useState<any>(null); 

    const isCompact = mode === 'compact';
    const typo = isCompact ? TYPOGRAPHY_COMPACT : TYPOGRAPHY;
    const spacing = isCompact ? SPACING_COMPACT : SPACING;

    // Toggle logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setQuery('');
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleOpenEvent = () => {
            setIsOpen(true);
            setQuery('');
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener(EVENTS.OPEN_COMMAND_PALETTE, handleOpenEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener(EVENTS.OPEN_COMMAND_PALETTE, handleOpenEvent);
        };
    }, []);

    // Static Modules
    const modules: CommandResult[] = [
        { id: 'mod-1', label: 'Executive Dashboard', type: 'module', icon: <Zap />, action: () => navigate('/executive'), subtitle: 'High-level KPI overview' },
        { id: 'mod-2', label: 'HPP Builder', type: 'module', icon: <Box />, action: () => navigate('/hpp-builder'), subtitle: 'Technical configuration' },
        { id: 'mod-3', label: 'Toolbox', type: 'module', icon: <Smartphone />, action: () => navigate('/'), subtitle: 'Field tools' },
        { id: 'mod-4', label: 'Reports', type: 'module', icon: <FileText />, action: () => navigate('/risk-report'), subtitle: 'Generated PDFs' },
        { id: 'mod-5', label: 'Settings', type: 'module', icon: <Settings />, action: () => navigate('/profile'), subtitle: 'User preferences' },
    ];

    // System Actions (Protected)
    const systemActions: CommandResult[] = [
        { 
            id: 'sys-1', 
            label: 'System Reset', 
            type: 'action', 
            icon: <RefreshCw />, 
            subtitle: 'Clear cache and reload',
            variant: 'danger',
            action: () => {
                confirm({
                    title: 'System Reset',
                    message: 'Are you sure you want to clear the local cache and reload the application? Unsaved data may be lost.',
                    variant: 'danger',
                    confirmLabel: 'Reset System',
                    onConfirm: () => {
                        localStorage.clear();
                        window.location.reload();
                    }
                });
                setIsOpen(false);
            }
        },
        { 
            id: 'sys-2', 
            label: 'Maintenance Protocol', 
            type: 'action', 
            icon: <ShieldAlert />, 
            subtitle: 'Initiate standard maintenance workflow',
            variant: 'warning',
            action: () => {
                validateTask({
                    turbineFamily: 'FRANCIS',
                    component: 'WICKET_GATE', // Default for demo
                    taskDescription: 'Routine Inspection & Calibration',
                    onProceed: () => {
                        navigate('/maintenance/dashboard');
                    }
                });
                setIsOpen(false);
            }
        },
        {
            id: 'sys-overview',
            label: 'System Topology',
            type: 'action',
            icon: <Activity className="text-emerald-400" />,
            subtitle: 'View ecosystem map & live telemetry',
            action: () => {
                dispatch.openSystemOverview();
                setIsOpen(false);
            }
        },
        {
            id: 'sys-print',
            label: 'Print Dossier',
            type: 'action',
            icon: <Printer className="text-cyan-400" />,
            subtitle: 'Generate technical report PDF',
            action: () => {
                dispatch.triggerForensicExport();
                setIsOpen(false);
            }
        },
        {
            id: 'sys-passport',
            label: 'View Asset Passport',
            type: 'action',
            icon: <ShieldCheck className="text-amber-400" />,
            subtitle: 'Official component registry & RUL',
            action: () => {
                const target = selectedAsset || (assets && assets.length > 0 ? assets[0] : null);
                
                if (target) {
                    dispatch.openAssetPassport({
                        id: target.id?.toString() || 'unknown',
                        name: target.name || 'Unknown Asset',
                        type: target.type || target.turbine_type || 'GENERIC'
                    });
                    setIsOpen(false);
                } else {
                    showToast('No assets available', 'error');
                }
            }
        }
    ];

    // Safe assets access
    const safeAssets = Array.isArray(assets) ? assets : [];

    // Search Logic
    const results = useMemo(() => {
        if (!query) return [...modules, ...systemActions]; // Show limited recent/modules by default

        const lowerQuery = query.toLowerCase();

        // Filter Assets
        const assetResults: CommandResult[] = safeAssets
            .filter(a => (a?.name || '').toLowerCase().includes(lowerQuery) || (a?.type || '').toLowerCase().includes(lowerQuery))
            .map(a => ({
                id: `asset-${idAdapter.toStorage(a.id)}`,
                label: a.name,
                type: 'asset',
                icon: <Box className="text-cyan-400" />,
                subtitle: `${(a.type || '—').toUpperCase()} • ${a.capacity || '-'} MW`,
                status: 'nominal', // In real app, derived from telemetry
                action: () => {
                    if (selectAsset) selectAsset(Number(a.id));
                    navigate('/'); // Go to toolbox with asset selected
                    setIsOpen(false);
                }
            }));

        // Filter Modules
        const moduleResults = modules.filter(m => 
            m.label.toLowerCase().includes(lowerQuery) || m.subtitle?.toLowerCase().includes(lowerQuery)
        );

        // Filter Actions
        const actionResults = systemActions.filter(a => 
            a.label.toLowerCase().includes(lowerQuery) || a.subtitle?.toLowerCase().includes(lowerQuery)
        );

        return [...assetResults, ...moduleResults, ...actionResults];
    }, [query, assets, modules, systemActions]);

    // Keyboard Navigation
    useEffect(() => {
        const handleNav = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                results[selectedIndex]?.action();
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, results, selectedIndex]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="command-palette-container"
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Palette */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh]"
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700 bg-slate-900/50">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                                    placeholder={t('command.placeholder', 'Type a command or search assets...')}
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg"
                                />
                                <div className="hidden sm:flex items-center gap-1">
                                    <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</span>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="overflow-y-auto custom-scrollbar p-2">
                                {results.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        <Command className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>No results found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {results.map((result, index) => (
                                            <button
                                                key={`${result.id}-${index}`}
                                                onClick={() => { result.action(); }}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors group ${
                                                    index === selectedIndex ? 'bg-cyan-500/10' : 'hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-md ${
                                                    result.variant === 'danger' ? 'bg-red-500/20 text-red-400' :
                                                    result.variant === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                                    index === selectedIndex ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {result.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-medium truncate ${
                                                        result.variant === 'danger' ? 'text-red-400' :
                                                        index === selectedIndex ? 'text-cyan-100' : 'text-slate-200'
                                                    }`}>
                                                        {result.label}
                                                    </div>
                                                    {result.subtitle && (
                                                        <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                                                    )}
                                                </div>
                                                {index === selectedIndex && (
                                                    <ChevronRight className="w-4 h-4 text-cyan-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                                <div className="flex gap-3">
                                    <span><strong className="text-slate-400">↑↓</strong> to navigate</span>
                                    <span><strong className="text-slate-400">↵</strong> to select</span>
                                </div>
                                <div>
                                    Sovereign Command v2.4
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Global Modals Triggered by Command Palette */}
            <SystemOverviewModal 
                isOpen={showSystemOverview} 
                onClose={() => setShowSystemOverview(false)} 
            />
            
            <PrintPreviewModal 
                isOpen={showPrintPreview} 
                onClose={() => setShowPrintPreview(false)} 
                state={technicalState}
            />

            {/* Asset Passport - Uses first asset or selected if available */}
            {assets && assets.length > 0 && (
                <AssetPassportModal
                    isOpen={showPassport}
                    onClose={() => setShowPassport(false)}
                    componentId={assets[0].id?.toString() || 'unknown'}
                    componentName={assets[0].name || 'Unknown Asset'}
                    componentType={assets[0].type || 'GENERIC'}
                />
            )}
        </>
    );
});
