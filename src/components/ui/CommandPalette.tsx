import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Smartphone, Box, Zap, FileText, Settings, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../../contexts/AssetContext';
import { useDensity } from '../../contexts/DensityContext';
import { useDrillDown } from '../../contexts/DrillDownContext';
import { GLASS, RADIUS, TYPOGRAPHY_COMPACT, TYPOGRAPHY, SPACING, SPACING_COMPACT, STATUS_COLORS } from '../../shared/design-tokens';
import { StatusIndicator } from '../../shared/components/ui/StatusIndicator';

interface CommandResult {
    id: string;
    label: string;
    type: 'asset' | 'module' | 'action';
    icon: React.ReactNode;
    action: () => void;
    status?: string;
    subtitle?: string;
}

export const CommandPalette = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { assets, selectAsset } = useAssetContext();
    const { mode } = useDensity();
    const { drillDown } = useDrillDown();
    const { t } = useTranslation();

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
        window.addEventListener('openCommandPalette', handleOpenEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('openCommandPalette', handleOpenEvent);
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

    // Safe assets access
    const safeAssets = Array.isArray(assets) ? assets : [];

    // Search Logic
    const results = useMemo(() => {
        if (!query) return modules; // Show limited recent/modules by default

        const lowerQuery = query.toLowerCase();

        // Filter Assets
        const assetResults: CommandResult[] = safeAssets
            .filter(a => (a?.name || '').toLowerCase().includes(lowerQuery) || (a?.type || '').toLowerCase().includes(lowerQuery))
            .map(a => ({
                id: a.id,
                label: a.name,
                type: 'asset',
                icon: <Box className="text-cyan-400" />,
                subtitle: `${(a.type || '—').toUpperCase()} • ${a.capacity || '-'} MW`,
                status: 'nominal', // In real app, derived from telemetry
                action: () => {
                    if (selectAsset) selectAsset(a.id);
                    navigate('/'); // Go to toolbox with asset selected
                }
            }));

        // Filter Modules
        const moduleResults = modules.filter(m =>
            m.label.toLowerCase().includes(lowerQuery) || (m.subtitle || '').toLowerCase().includes(lowerQuery)
        );

        return [...assetResults, ...moduleResults].slice(0, 8);
    }, [query, safeAssets, modules, navigate, selectAsset]);

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
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, results, selectedIndex]);

    // Reset selection when results change
    useEffect(() => setSelectedIndex(0), [results]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`w-full max-w-xl ${GLASS.commander} ${RADIUS.cardLg} overflow-hidden shadow-2xl flex flex-col relative z-[101]`}
            >
                <div className="flex items-center px-4 py-4 border-b border-white/5 gap-3">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type a command or search assets..."
                        className="flex-grow bg-transparent border-none outline-none text-white placeholder-slate-500 font-mono text-sm h-6"
                    />
                    <div className="flex gap-2">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                            ESC
                        </kbd>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {results.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 font-mono text-sm">
                            No results found.
                        </div>
                    ) : (
                        results.map((result, index) => (
                            <div
                                key={result.id}
                                onClick={() => {
                                    result.action();
                                    setIsOpen(false);
                                }}
                                className={`
                                    px-4 py-3 mx-2 rounded-lg flex items-center justify-between cursor-pointer group transition-colors
                                    ${index === selectedIndex ? 'bg-cyan-500/10' : 'hover:bg-white/5'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded ${index === selectedIndex ? 'text-cyan-400' : 'text-slate-400'}`}>
                                        {result.icon}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${index === selectedIndex ? 'text-white' : 'text-slate-200'}`}>
                                            {result.label}
                                        </div>
                                        {result.subtitle && (
                                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">
                                                {result.subtitle}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {result.type === 'asset' && (
                                        <StatusIndicator status="nominal" size="xs" />
                                    )}
                                    {index === selectedIndex && (
                                        <ChevronRight className="w-4 h-4 text-cyan-500" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-slate-950/50 p-2 border-t border-white/5 flex justify-between px-4">
                    <div className="text-[10px] text-slate-600 font-mono">
                        <span className="text-cyan-500/50">ANOHUB</span> INTELLIGENCE
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono flex gap-3">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

// Error Boundary Wrapper for CommandPalette
class CommandPaletteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("CommandPalette crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return null; // Fail silently
        }

        return this.props.children;
    }
}

const SafeCommandPalette = () => (
    <CommandPaletteErrorBoundary>
        <CommandPalette />
    </CommandPaletteErrorBoundary>
);

export default SafeCommandPalette;
