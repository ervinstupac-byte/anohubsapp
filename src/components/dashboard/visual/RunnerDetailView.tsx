import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Settings,
    Activity,
    CircleDot,
    Info,
    ChevronRight,
    Droplets,
    Shield,
    Maximize2,
    Minimize2,
    Waves,
    Target,
    Circle,
    Home
} from 'lucide-react';

interface RunnerDetailProps {
    onBack: () => void;
    onHome?: () => void;
}

// NC-4.2 Compliant Hotspot Definitions with Ground-Truth Hydraulic Data
// 5 Critical Hydraulic Points for Francis Runner
const RUNNER_COMPONENTS = [
    {
        id: 'run-runner-blades',
        i18nKey: 'runnerBlades',
        name: 'Francis Runner (Rotor)',
        param: 'Cavitation Resistance',
        heritage: 'Leading-edge erosion is the first indicator of off-design operation. Inspect blades every 5000 hours for pitting patterns.',
        icon: Waves,
        pos: { x: 50, y: 50 },
        func: 'Converts hydraulic energy into mechanical torque through precisely profiled blade channels.',
        precision: 'Blade profile tolerance: ±0.5 mm',
        category: 'rotor'
    },
    {
        id: 'run-spiral-case',
        i18nKey: 'spiralCase',
        name: 'Spiral Case Section',
        param: 'Structural Pressure',
        heritage: 'The spiral geometry maintains constant velocity to prevent uneven loading on runner blades, reducing fatigue stress.',
        icon: Circle,
        pos: { x: 20, y: 50 },
        func: 'Distributes high-pressure water uniformly around the turbine runner circumference with optimized velocity profile.',
        precision: 'Surface smoothness: Ra < 6.3 μm',
        category: 'hydraulic'
    },
    {
        id: 'run-wearing-gap',
        i18nKey: 'wearingGap',
        name: 'Wearing Ring Gap',
        param: 'Efficiency Critical',
        heritage: 'A 1mm increase in gap can drop turbine power by >3%. Measure gap at 4 cardinal points during every major overhaul.',
        icon: Target,
        pos: { x: 50, y: 35 },
        func: 'Sealing interface between rotating runner and stationary components, preventing high-pressure water bypass.',
        precision: '$0.3 - 0.5\\text{ mm}$ Gold Standard',
        category: 'sealing'
    },
    {
        id: 'run-axial-pos',
        i18nKey: 'axialPosition',
        name: 'Axial Alignment Position',
        param: 'Hydraulic Centerline',
        heritage: 'Incorrect axial position creates parasitic thrust on the generator bearings, accelerating wear and reducing efficiency.',
        icon: CircleDot,
        pos: { x: 65, y: 50 },
        func: 'Defines the precise vertical depth of the rotor relative to the hydraulic centerline of the turbine.',
        precision: 'Axial play tolerance: ±0.2 mm',
        category: 'alignment'
    },
    {
        id: 'run-head-cover',
        i18nKey: 'headCover',
        name: 'Front Head Cover & Seal',
        param: 'Zero-Leakage Target',
        heritage: 'The bolted front assembly must maintain absolute sealing integrity. Bolt sequence follows star pattern for even pressure distribution.',
        icon: Shield,
        pos: { x: 80, y: 45 },
        func: 'Provides structural closure and sealing for the upper turbine chamber, containing high-pressure water.',
        precision: 'Bolt torque: M24 Class 8.8 = 980 Nm',
        category: 'sealing'
    }
];

// Container animation for deep-dive zoom effect
const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.3 }
    }
};

const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

const RunnerDetailView: React.FC<RunnerDetailProps> = ({ onBack, onHome }) => {
    const { t } = useTranslation();
    const [activeSub, setActiveSub] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeData = RUNNER_COMPONENTS.find(c => c.id === activeSub);

    // Initial check for fullscreen state to handle SSR safely
    useEffect(() => {
        setIsFullscreen(!!document.fullscreenElement);
    }, []);

    // Fullscreen API handlers
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error(`Fullscreen error: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    }, []);

    // Listen for fullscreen changes (e.g., user pressing Escape)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Get translated content with fallback to hardcoded values
    const getComponentData = (comp: typeof RUNNER_COMPONENTS[0]) => ({
        name: t(`runner.detail.${comp.i18nKey}.name`, comp.name),
        param: t(`runner.detail.${comp.i18nKey}.param`, comp.param),
        func: t(`runner.detail.${comp.i18nKey}.func`, comp.func),
        precision: t(`runner.detail.${comp.i18nKey}.precision`, comp.precision),
        heritage: t(`runner.detail.${comp.i18nKey}.heritage`, comp.heritage)
    });

    // Get category color for hotspot
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'sealing': return '#F59E0B'; // Amber for sealing
            case 'alignment': return '#8B5CF6'; // Purple for alignment
            case 'rotor': return '#22D3EE'; // Cyan for rotor
            case 'hydraulic': return '#10B981'; // Emerald for hydraulic
            default: return '#22D3EE';
        }
    };

    return (
        <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full h-full bg-[#030708] rounded-3xl border border-cyan-500/20 overflow-hidden flex flex-col ${isFullscreen ? 'rounded-none' : ''}`}
        >
            {/* HUD Header */}
            <motion.div
                variants={childVariants}
                className="flex items-center justify-between p-6 bg-gradient-to-b from-cyan-950/20 to-transparent border-b border-cyan-500/10"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">
                            {t('runner.detail.title', 'Francis Runner')} <span className="text-cyan-500">{t('runner.detail.drillDown', 'Hydraulic Analysis')}</span>
                        </h2>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter opacity-70">
                            NC-4.2 {t('common.technicalAnalysis', 'Technical Analysis')} // 5 HYDRAULIC HOTSPOTS
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Hotspot Category Legend */}
                    <div className="hidden md:flex items-center gap-4 mr-4 text-[9px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-cyan-400">Rotor</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-emerald-400">Hydraulic</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-amber-400">Sealing</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-purple-400">Alignment</span>
                        </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">{t('common.assetSyncActive', 'Asset Sync Active')}</span>
                    </div>

                    {/* Section Home Button */}
                    {onHome && (
                        <button
                            onClick={onHome}
                            className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                            title="Back to Francis Hub"
                        >
                            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Full-Screen Toggle Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                        title={isFullscreen ? 'Exit Full-Screen' : 'Enter Full-Screen'}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-5 h-5 group-hover:scale-90 transition-transform" />
                        ) : (
                            <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </motion.div>

            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                {/* Visual Area with Francis Runner Asset - Blueprint Filter Applied */}
                <motion.div
                    variants={childVariants}
                    className="flex-[2] relative bg-black/40 rounded-2xl border border-cyan-500/10 overflow-hidden"
                >
                    {/* Official Asset Background with Blueprint Filter */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <motion.img
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.85 }}
                            transition={{ duration: 0.8 }}
                            src="/francis_runner_info.svg"
                            alt="Francis Runner Blueprint"
                            className="w-full h-full object-contain"
                            style={{
                                filter: 'sepia(1) hue-rotate(160deg) brightness(0.8) contrast(1.5)'
                            }}
                        />
                    </div>

                    {/* Interactive Hotspot Overlay - 5 Hydraulic Points */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
                        <defs>
                            <filter id="hotspot-glow-rotor">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="hotspot-glow-hydraulic">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="hotspot-glow-sealing">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="hotspot-glow-alignment">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {RUNNER_COMPONENTS.map((comp) => {
                            const isActive = activeSub === comp.id;
                            const labelOffset = comp.pos.x > 50 ? -15 : 15;
                            const color = getCategoryColor(comp.category);
                            const filterId = `hotspot-glow-${comp.category}`;

                            return (
                                <g
                                    key={comp.id}
                                    className="cursor-pointer group"
                                    onMouseEnter={() => setActiveSub(comp.id)}
                                    onClick={() => setActiveSub(comp.id)}
                                >
                                    {/* Transparent Trigger Zone */}
                                    <circle
                                        cx={comp.pos.x}
                                        cy={comp.pos.y}
                                        r="5"
                                        fill="transparent"
                                    />

                                    {/* Outer Pulsing Ring */}
                                    <motion.circle
                                        cx={comp.pos.x}
                                        cy={comp.pos.y}
                                        r={isActive ? 4 : 2.5}
                                        fill="transparent"
                                        stroke={color}
                                        strokeWidth="0.15"
                                        animate={{
                                            r: isActive ? [4, 6, 4] : [2.5, 4, 2.5],
                                            opacity: [0.8, 0.2, 0.8]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />

                                    {/* Visible Target Marker */}
                                    <motion.circle
                                        cx={comp.pos.x}
                                        cy={comp.pos.y}
                                        animate={{
                                            r: isActive ? 2 : 1,
                                            fillOpacity: isActive ? 1 : 0.6
                                        }}
                                        fill={color}
                                        stroke={color}
                                        strokeWidth="0.3"
                                        filter={`url(#${filterId})`}
                                    />

                                    {/* Dynamic Leader Line with Pulsing Animation */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.g
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <motion.path
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1, strokeOpacity: [0.3, 1, 0.3] }}
                                                    exit={{ pathLength: 0 }}
                                                    transition={{ duration: 0.3, strokeOpacity: { duration: 2, repeat: Infinity } }}
                                                    d={`M ${comp.pos.x} ${comp.pos.y} L ${comp.pos.x + labelOffset} ${comp.pos.y - 12}`}
                                                    stroke={color}
                                                    strokeWidth="0.25"
                                                    fill="none"
                                                    strokeDasharray="0.5 0.3"
                                                />
                                                {/* Label Background */}
                                                <rect
                                                    x={comp.pos.x + labelOffset - (comp.pos.x > 50 ? 18 : 0)}
                                                    y={comp.pos.y - 16}
                                                    width="18"
                                                    height="4"
                                                    fill="#030708"
                                                    fillOpacity="0.9"
                                                    rx="0.5"
                                                    stroke={color}
                                                    strokeWidth="0.1"
                                                />
                                                {/* Label Text */}
                                                <text
                                                    x={comp.pos.x + labelOffset + (comp.pos.x > 50 ? -9 : 9)}
                                                    y={comp.pos.y - 13}
                                                    textAnchor="middle"
                                                    fill={color}
                                                    fontSize="2"
                                                    fontWeight="bold"
                                                    fontFamily="monospace"
                                                >
                                                    {comp.name.split(' ')[0].toUpperCase()}
                                                </text>
                                            </motion.g>
                                        )}
                                    </AnimatePresence>
                                </g>
                            );
                        })}
                    </svg>

                    {/* HUD Label Overlay */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                        <div className="text-[10px] text-cyan-500/60 font-black tracking-widest uppercase flex items-center gap-2">
                            <div className="w-2 h-0.5 bg-cyan-500" /> SOURCE: francis_runner_info.svg
                        </div>
                        <div className="text-[10px] text-cyan-500/40 font-bold uppercase tracking-tighter">
                            NC-4.2 COMPLIANT // 5 HYDRAULIC HOTSPOTS
                        </div>
                    </div>

                    {/* Fullscreen indicator */}
                    {isFullscreen && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                            Full-Screen Mode • Press ESC to Exit
                        </div>
                    )}
                </motion.div>

                {/* Data Card Column */}
                <motion.div variants={childVariants} className="flex-1 flex flex-col gap-4 min-w-[320px]">
                    <AnimatePresence mode="wait">
                        {activeData ? (() => {
                            const translatedData = getComponentData(activeData);
                            const color = getCategoryColor(activeData.category);
                            const categoryLabel = activeData.category.charAt(0).toUpperCase() + activeData.category.slice(1);

                            return (
                                <motion.div
                                    key={activeData.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex-1 rounded-2xl p-6 backdrop-blur-xl flex flex-col"
                                    style={{
                                        backgroundColor: `${color}0D`, // 5% opacity
                                        borderColor: `${color}33`, // 20% opacity
                                        borderWidth: '1px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    {/* Category Badge */}
                                    <div className="mb-4">
                                        <span
                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
                                            style={{
                                                backgroundColor: `${color}33`,
                                                color: color
                                            }}
                                        >
                                            🌊 {categoryLabel} Component
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className="p-3 rounded-xl border"
                                            style={{
                                                backgroundColor: `${color}33`,
                                                borderColor: `${color}66`,
                                                color: color
                                            }}
                                        >
                                            <activeData.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-wider leading-tight">{translatedData.name}</h3>
                                            <p
                                                className="text-xs font-bold uppercase tracking-tighter"
                                                style={{ color: color }}
                                            >
                                                {translatedData.param}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div
                                                className="flex items-center gap-2 mb-2 font-black text-[10px] uppercase tracking-widest"
                                                style={{ color: color }}
                                            >
                                                <Settings className="w-3 h-3" />
                                                {t('runner.detail.functionalTarget', 'Functional Target')}
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                                {translatedData.func}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                                                <Activity className="w-3 h-3" />
                                                {t('runner.detail.precisionRequirement', 'Precision Requirement')}
                                            </div>
                                            <div className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                                <p className="text-sm font-mono font-bold text-emerald-400">
                                                    {translatedData.precision}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Heritage Tip with Amber Accent */}
                                        <div className="p-4 bg-amber-500/10 border border-amber-400/20 rounded-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-2 opacity-20">
                                                <Info className="w-8 h-8 text-amber-500" />
                                            </div>
                                            <div className="flex items-center gap-2 mb-2 text-amber-400 font-black text-[10px] uppercase tracking-widest">
                                                {t('runner.detail.heritageTip', 'Field Engineer Instruction')}
                                            </div>
                                            <p className="text-xs text-amber-100 italic relative z-10 leading-relaxed">
                                                "{translatedData.heritage}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-700/30">
                                        <button
                                            className="w-full flex items-center justify-between p-3 font-black text-[10px] uppercase tracking-tighter rounded-lg transition-all group shadow-lg"
                                            style={{
                                                backgroundColor: color,
                                                color: '#000'
                                            }}
                                        >
                                            <span>{t('runner.detail.initiateScan', 'Initiate Hydraulic Scan')}</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })() : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cyan-500/5 border border-dashed border-cyan-500/20 rounded-2xl text-center">
                                <Droplets className="w-12 h-12 text-cyan-500/20 mb-4" />
                                <h3 className="text-cyan-500/60 font-black text-sm uppercase tracking-widest">
                                    {t('runner.detail.selectHotspot', 'Select Hotspot')}
                                </h3>
                                <p className="text-[10px] text-cyan-500/40 font-bold mt-2 uppercase">
                                    {t('runner.detail.identifyComponent', 'Identify component on hydraulic blueprint')}
                                </p>
                                <div className="mt-6 text-[9px] text-slate-500 font-mono">
                                    5 Hydraulic Hotspots Available
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="h-10 bg-black/60 border-t border-cyan-500/10 flex items-center px-6 overflow-hidden">
                <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                    {[1, 2, 3].map(i => (
                        <span key={i} className="text-[8px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">
                            ASSET: FRANCIS_RUNNER_INFO // NC-4.2 COMPLIANT // 5 HOTSPOTS: RUNNER BLADES | SPIRAL CASE | WEARING GAP | AXIAL POSITION | HEAD COVER // HYDRAULIC INTEGRITY ACTIVE
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default RunnerDetailView;
