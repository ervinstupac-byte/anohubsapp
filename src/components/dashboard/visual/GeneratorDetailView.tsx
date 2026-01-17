import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import {
    ArrowLeft,
    Settings,
    Zap,
    Activity,
    Cpu,
    Info,
    ChevronRight,
    Droplets,
    Shield,
    Maximize2,
    Minimize2,
    Anchor,
    Move,
    Layers,
    Gauge
} from 'lucide-react';

interface GeneratorDetailProps {
    onBack: () => void;
}

// NC-5.7 Compliant Hotspot Definitions with Ground-Truth Engineering Data
// 8 Total Hotspots: 5 Core Components + 3 Foundation Alignment Trio
const SUB_COMPONENTS = [
    // === CORE GENERATOR COMPONENTS (Original 5) ===
    {
        id: 'gen-front-bearing',
        i18nKey: 'frontBearing',
        name: 'Front Bearing (DE)',
        param: 'Alignment Precision',
        heritage: 'The 0.05 mm/m specification originates from legacy Swiss turbine manufacturers — a gold standard that prevents uneven air-gap distribution.',
        icon: Activity,
        pos: { x: 15, y: 48 },
        func: 'Primary radial support for the generator rotor shaft. Critical for maintaining concentricity with stator air gap.',
        precision: '$0.05\\text{ mm/m}$ Heritage Standard',
        category: 'core'
    },
    {
        id: 'gen-rear-bearing',
        i18nKey: 'rearBearing',
        name: 'Rear Bearing (NDE)',
        param: 'Electrical Isolation',
        heritage: 'Electrical insulation on the NDE bearing breaks the shaft current loop, protecting both bearings from electrical discharge machining (EDM).',
        icon: Shield,
        pos: { x: 72, y: 48 },
        func: 'Secondary radial support, electrically insulated to prevent shaft current circulation through the bearing oil film.',
        precision: 'Insulation Resistance > 1 MΩ',
        category: 'core'
    },
    {
        id: 'gen-grounding-brush',
        i18nKey: 'groundingBrush',
        name: 'Shaft Grounding Brush',
        param: 'Shaft Current Control',
        heritage: 'A worn brush leads to micro-pitting in the bearings, significantly reducing asset life. Check brush wear every 2000 hours.',
        icon: Zap,
        pos: { x: 82, y: 35 },
        func: 'Provides a low-impedance path for shaft currents induced by electromagnetic asymmetries in the generator.',
        precision: 'Brush Contact Resistance < 10 mΩ',
        category: 'core'
    },
    {
        id: 'gen-lubrication',
        i18nKey: 'lubrication',
        name: 'Lubrication Hub',
        param: 'Oil Film Integrity',
        heritage: 'A clean oil film is critical for the longevity of sliding bearings under high pressure. Always verify ISO cleanliness code 16/14/11.',
        icon: Droplets,
        pos: { x: 78, y: 62 },
        func: 'Circulates pressurized oil to cool and lubricate main turbine-generator shaft bearings.',
        precision: '5 micron filtration standard',
        category: 'core'
    },
    {
        id: 'gen-stator',
        i18nKey: 'stator',
        name: 'Stator Core & Air Gap',
        param: 'Magnetic Center',
        heritage: 'The Magnetic Center is the axial position where electromagnetic forces are balanced. Operating off-center creates thrust on the turbine runner.',
        icon: Cpu,
        pos: { x: 45, y: 45 },
        func: 'Houses the core and windings, providing structural support and defining the electromagnetic center of the machine.',
        precision: 'Axial play < 0.5 mm at Magnetic Center',
        category: 'core'
    },
    // === FOUNDATION ALIGNMENT TRIO (New 3) ===
    {
        id: 'gen-anchor-bolts',
        i18nKey: 'anchorBolts',
        name: 'Foundation Anchor Bolts',
        param: 'Design Torque',
        heritage: 'Tighten in a star pattern to prevent frame distortion. Never tighten sequentially around the perimeter.',
        icon: Anchor,
        pos: { x: 25, y: 75 },
        func: 'Secures the generator frame to the concrete foundation, transmitting all dynamic loads to the civil structure.',
        precision: 'Torque per M36 Class 8.8: 1850 Nm',
        category: 'foundation'
    },
    {
        id: 'gen-jacking-bolts',
        i18nKey: 'jackingBolts',
        name: 'Adjustment (Jacking) Bolts',
        param: 'MUST BE LOOSE',
        heritage: 'These are for positioning only. Leaving them tight creates parasitic stress that mimics misalignment vibration signatures.',
        icon: Move,
        pos: { x: 55, y: 78 },
        func: 'Used during alignment to fine-tune generator position. Must be backed off after anchor bolts are torqued.',
        precision: 'Final State: Finger-loose + 1/4 turn back',
        category: 'foundation'
    },
    {
        id: 'gen-shims',
        i18nKey: 'shims',
        name: 'Precision Nivelation Shims',
        param: 'Gold Standard',
        heritage: 'Use a maximum of 3-4 shims per foot. Stacked shims act like a spring, compromising stability under dynamic loads.',
        icon: Layers,
        pos: { x: 40, y: 72 },
        func: 'Stainless steel shims that establish the vertical alignment datum. Total thickness determines final elevation.',
        precision: '$0.01\\text{ mm/m}$ Gold Standard',
        category: 'foundation'
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

const GeneratorDetailView: React.FC<GeneratorDetailProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { mechanical } = useTelemetryStore(); // Live Data Injection
    const [activeSub, setActiveSub] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeData = SUB_COMPONENTS.find(c => c.id === activeSub);
    const liveRpm = mechanical?.rpm || 0;
    const liveVibration = mechanical?.vibration || 0;

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
    const getComponentData = (comp: typeof SUB_COMPONENTS[0]) => ({
        name: t(`generator.detail.${comp.i18nKey}.name`, comp.name),
        param: t(`generator.detail.${comp.i18nKey}.param`, comp.param),
        func: t(`generator.detail.${comp.i18nKey}.func`, comp.func),
        precision: t(`generator.detail.${comp.i18nKey}.precision`, comp.precision),
        heritage: t(`generator.detail.${comp.i18nKey}.heritage`, comp.heritage)
    });

    // Get category color for hotspot
    const getCategoryColor = (category: string) => {
        return category === 'foundation' ? '#F59E0B' : '#22D3EE'; // Amber for foundation, Cyan for core
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
                            {t('generator.detail.title', 'Generator Unit')} <span className="text-cyan-500">{t('generator.detail.drillDown', 'Drill-Down')}</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter opacity-70">
                                NC-5.7 {t('common.technicalAnalysis', 'Technical Analysis')} // 8 PRECISION HOTSPOTS
                            </p>
                            {/* Live RPM Indicator */}
                            {liveRpm > 0 && (
                                <div className="flex items-center gap-1 bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30">
                                    <Gauge className="w-3 h-3 text-cyan-300" />
                                    <span className="text-[10px] font-mono font-black text-white">{liveRpm.toFixed(0)} RPM</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Hotspot Category Legend */}
                    <div className="hidden md:flex items-center gap-4 mr-4 text-[9px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-cyan-400">Core</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-amber-400">Foundation</span>
                        </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">{t('common.assetSyncActive', 'Asset Sync Active')}</span>
                    </div>

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
                {/* Visual Area with Local Asset Background - Blueprint Filter Applied */}
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
                            src="/geno_fr_h_manje_od_5.svg"
                            alt="Generator Blueprint"
                            className="w-full h-full object-contain"
                            style={{
                                filter: 'sepia(1) hue-rotate(160deg) brightness(0.8) contrast(1.5)'
                            }}
                        />
                    </div>

                    {/* Interactive Hotspot Overlay - 8 Total Points */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
                        <defs>
                            <filter id="hotspot-glow-gen">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="hotspot-glow-foundation">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {SUB_COMPONENTS.map((comp) => {
                            const isActive = activeSub === comp.id;
                            const labelOffset = comp.pos.x > 50 ? -15 : 15;
                            const color = getCategoryColor(comp.category);
                            const filterId = comp.category === 'foundation' ? 'hotspot-glow-foundation' : 'hotspot-glow-gen';

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
                            <div className="w-2 h-0.5 bg-cyan-500" /> SOURCE: geno_fr_h_manje_od_5.svg
                        </div>
                        <div className="text-[10px] text-cyan-500/40 font-bold uppercase tracking-tighter">
                            NC-5.7 COMPLIANT // 8 HOTSPOTS: 5 CORE + 3 FOUNDATION
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
                            const isFoundation = activeData.category === 'foundation';
                            const accentColor = isFoundation ? 'amber' : 'cyan';
                            const isBearing = activeData.id.includes('bearing');

                            return (
                                <motion.div
                                    key={activeData.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`flex-1 bg-${accentColor}-500/5 border border-${accentColor}-500/20 rounded-2xl p-6 backdrop-blur-xl flex flex-col`}
                                    style={{
                                        backgroundColor: isFoundation ? 'rgba(245, 158, 11, 0.05)' : 'rgba(34, 211, 238, 0.05)',
                                        borderColor: isFoundation ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 211, 238, 0.2)'
                                    }}
                                >
                                    {/* Category Badge */}
                                    <div className="mb-4">
                                        <span
                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
                                            style={{
                                                backgroundColor: isFoundation ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 211, 238, 0.2)',
                                                color: isFoundation ? '#F59E0B' : '#22D3EE'
                                            }}
                                        >
                                            {isFoundation ? '🔧 Foundation Alignment' : '⚡ Core Component'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className="p-3 rounded-xl border"
                                            style={{
                                                backgroundColor: isFoundation ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 211, 238, 0.2)',
                                                borderColor: isFoundation ? 'rgba(245, 158, 11, 0.4)' : 'rgba(34, 211, 238, 0.4)',
                                                color: isFoundation ? '#F59E0B' : '#22D3EE'
                                            }}
                                        >
                                            <activeData.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-wider leading-tight">{translatedData.name}</h3>
                                            <p
                                                className="text-xs font-bold uppercase tracking-tighter"
                                                style={{ color: isFoundation ? '#F59E0B' : '#22D3EE' }}
                                            >
                                                {translatedData.param}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* OPTIONAL LIVE TELEMETRY BRIDGE */}
                                        {isBearing && liveVibration > 0 && (
                                            <div className="p-4 bg-cyan-950/40 border-l-2 border-cyan-400 rounded-r-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <Activity className="w-3 h-3" /> Live Sensor
                                                    </span>
                                                    <span className={`text-sm font-mono font-black ${liveVibration > 3 ? 'text-amber-400' : 'text-white'}`}>
                                                        {liveVibration.toFixed(2)} mm/s
                                                    </span>
                                                </div>
                                                <div className="w-full h-1 bg-cyan-900/50 mt-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-400" style={{ width: `${(liveVibration / 5) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <div
                                                className="flex items-center gap-2 mb-2 font-black text-[10px] uppercase tracking-widest"
                                                style={{ color: isFoundation ? '#F59E0B' : '#22D3EE' }}
                                            >
                                                <Settings className="w-3 h-3" />
                                                {t('generator.detail.functionalTarget', 'Functional Target')}
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                                {translatedData.func}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                                                <Activity className="w-3 h-3" />
                                                {t('generator.detail.precisionRequirement', 'Precision Requirement')}
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
                                                {t('generator.detail.heritageTip', 'Field Engineer Instruction')}
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
                                                backgroundColor: isFoundation ? '#F59E0B' : '#22D3EE',
                                                color: '#000'
                                            }}
                                        >
                                            <span>{t('generator.detail.initiateScan', 'Initiate Diagnostic Scan')}</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })() : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cyan-500/5 border border-dashed border-cyan-500/20 rounded-2xl text-center">
                                <Activity className="w-12 h-12 text-cyan-500/20 mb-4" />
                                <h3 className="text-cyan-500/60 font-black text-sm uppercase tracking-widest">
                                    {t('generator.detail.selectHotspot', 'Select Hotspot')}
                                </h3>
                                <p className="text-[10px] text-cyan-500/40 font-bold mt-2 uppercase">
                                    {t('generator.detail.identifyComponent', 'Identify component on official blueprint')}
                                </p>
                                <div className="mt-6 text-[9px] text-slate-500 font-mono">
                                    8 Hotspots Available: 5 Core + 3 Foundation
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
                            ASSET: GENO_FR_H_MANJE_OD_5 // NC-5.7 COMPLIANT // 8 HOTSPOTS: DE BEARING | NDE BEARING | GROUNDING BRUSH | LUBRICATION | STATOR | ANCHOR BOLTS | JACKING BOLTS | SHIMS // ALIGNMENT TRIO ACTIVE
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default GeneratorDetailView;
