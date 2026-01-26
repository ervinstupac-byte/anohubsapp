import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { useAssetContext } from '../../../contexts/AssetContext.tsx';
import idAdapter from '../../../utils/idAdapter';

// Route Mapping Dictionary
const ROUTE_LABELS: Record<string, string> = {
    'francis': 'Francis Turbine Hub',
    'dashboard': 'Executive Dashboard',
    'executive': 'Executive Dashboard',
    'telemetry': 'Telemetry Analytics',
    'diagnostics': 'Diagnostics Suite',
    'forensics': 'Forensic Reports',
    'infrastructure': 'Infrastructure Grid',
    'maintenance': 'Maintenance Log',
    'hub': 'Main Hub',
    'map': 'Global Fleet Map',
    'profile': 'Engineer Profile',
    'risk-assessment': 'Risk Assessment',
    'turbine': 'Turbine Detail',
    'sop-shaft-alignment': 'Shaft Alignment SOP',
    'sop-bearings': 'Bearings SOP',
    'sop-water-hammer': 'Water Hammer Protocol',
    'sop-thrust-balance': 'Thrust Balance',
    'sop-vortex-control': 'Vortex Control',
    'sop-miv-distributor': 'MIV Distributor',
    'sop-regulating-ring': 'Regulating Ring',
    'sop-linkage': 'Linkage System',
    'sop-coupling': 'Coupling',
    'sop-braking-system': 'Braking System',
    'sop-recovery': 'Seal Recovery',
    'sop-oil-health': 'Oil Health',
    'sop-cooling-water': 'Cooling Water',
    'sop-drainage-pumps': 'Drainage Pumps',
    'sop-lubrication': 'Lubrication System',
    'sop-hpu': 'HPU System',
    'sop-generator-integrity': 'Generator Integrity',
    'sop-electrical-health': 'Electrical Health',
    'sop-governor-pid': 'Governor PID',
    'sop-grid-sync': 'Grid Synchronization',
    'sop-distributor-sync': 'Distributor Sync',
    'sop-dc-systems': 'DC Systems',
    'sop-excitation': 'Excitation System',
    'sop-transformer': 'Transformer',
    'sop-penstock': 'Penstock',
    'sop-intake': 'Intake Structure',
    'sop-cathodic': 'Cathodic Protection',
    'sop-auxiliary': 'Auxiliary Systems',
    'plant-master': 'Plant Master',
    'bid-evaluator': 'Bid Evaluator',
    'hydrology-lab': 'Hydrology Lab',
    'mission-control': 'Mission Control',
    'manifesto': 'Engineering Manifesto',
    'emergency-protocols': 'Emergency Protocols',
    'logic-load-rejection': 'Load Rejection Logic',
    'flowchart-startup': 'Startup Sequence',
    'command-center': 'Command Center',
    'main': 'Main Diagnostics',
    'heatmap': 'Thermal Heatmap',
};

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { assets } = useAssetContext();

    // Parse path segments
    const pathnames = useMemo(() => {
        return location.pathname.split('/').filter((x) => x);
    }, [location.pathname]);

    // Resolver helper
    const resolveLabel = (segment: string) => {
        // 1. Check Dictionary
        if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];

        // 2. Check Asset ID Lookup
        const assetMatch = assets.find(a => idAdapter.toStorage(a.id) === segment);
        if (assetMatch) return `Asset: ${assetMatch.name}`;

        // 3. Fallback: Formatted Text
        return segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (pathnames.length === 0) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.nav
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/5 bg-slate-900/30 backdrop-blur-md w-fit"
            >
                <Link
                    to="/"
                    className="flex items-center justify-center p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <Home className="w-3.5 h-3.5" />
                </Link>

                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = resolveLabel(value);

                    return (
                        <React.Fragment key={to}>
                            <ChevronRight className="w-3 h-3 text-slate-700" />

                            {last ? (
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    to={to}
                                    className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                                >
                                    {label}
                                </Link>
                            )}
                        </React.Fragment>
                    );
                })}
            </motion.nav>
        </AnimatePresence>
    );
};
