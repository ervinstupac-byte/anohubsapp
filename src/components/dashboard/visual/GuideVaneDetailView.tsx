import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';

import {
    ArrowLeft,
    Settings,
    Activity,
    Info,
    ChevronRight,
    Maximize2,
    Minimize2,
    Home,
    Aperture,
    ShieldAlert,
    Gauge,
    Link
} from 'lucide-react';

interface GuideVaneDetailProps {
    onBack: () => void;
    onHome?: () => void;
}

// NC-9.0 Guide Vane Hotspots
const GV_COMPONENTS = [
    {
        id: 'gv-vanes',
        i18nKey: 'wicketGates',
        name: 'Wicket Gates (Lopatice)',
        param: 'Flow Synchronization',
        heritage: 'Precise angular synchronization determines the purity of flow entry. Any deviation > 0.1° creates turbulence that hammers the runner blades.',
        icon: Aperture,
        pos: { x: 50, y: 50 }, // Central Focus
        func: 'Regulates water flow into the runner, controlling turbine output and maintaining hydraulic stability.',
        precision: 'Angular Deviation < 0.1°',
        category: 'hydraulic'
    },
    {
        id: 'gv-shear-pins',
        i18nKey: 'shearPins',
        name: 'Safety Shear Pins',
        param: 'Mechanical Fuse',
        heritage: 'Never replace with standard bolts. Use only calibrated shear pins to protect the gate linkage in case of foreign object jam.',
        icon: ShieldAlert,
        pos: { x: 75, y: 35 },
        func: 'Protect the regulation mechanism by breaking under excessive load (e.g., debris jam), decoupling the specific gate.',
        precision: 'Calibrated Breaking Point',
        category: 'safety'
    },
    {
        id: 'gv-clearance',
        i18nKey: 'vaneClearance',
        name: 'Vane End Clearance',
        param: 'Efficiency Loss',
        heritage: 'Excessive top/bottom clearance acts as a high-velocity bypass leak, eroding surfaces and reducing efficiency measurable by 0.5-1%.',
        icon: Gauge,
        pos: { x: 25, y: 65 },
        func: 'The gap between vane ends and the head cover/bottom ring. Must be minimal to prevent leakage but sufficient for operation.',
        precision: 'Clearance < 0.2 mm',
        category: 'hydraulic'
    },
    {
        id: 'gv-operating-ring',
        i18nKey: 'operatingRing',
        name: 'Regulation Ring & Linkage',
        param: 'Linkage Kinematics',
        heritage: 'Smooth operation relies on regular greasing of the linkage bushings. A sticky linkage causes governor hunting and power fluctuations.',
        icon: Link,
        pos: { x: 60, y: 80 },
        func: 'Transmits servomotor force to all wicket gates simultaneously ensuring synchronized opening/closing.',
        precision: 'Zero Backlash Target',
        category: 'mechanical'
    }
];

const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
};

const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

const GuideVaneDetailView: React.FC<GuideVaneDetailProps> = ({ onBack, onHome }) => {
    const { t } = useTranslation();
    const { mechanical, specializedState } = useTelemetryStore(); // Live Telemetry + Specialized Mock
    const [activeSub, setActiveSub] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeData = GV_COMPONENTS.find(c => c.id === activeSub);
    const rpm = mechanical?.rpm || 0;
    // New Data Bridge (Telemetry Store)
    const guideVaneOpening = specializedState?.sensors?.guide_vane_opening || 0;

    // Initial check for fullscreen state to handle SSR safely
    useEffect(() => {
        setIsFullscreen(!!document.fullscreenElement);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    }, []);

    const getComponentData = (comp: typeof GV_COMPONENTS[0]) => ({
        name: t(`guidevane.detail.${comp.i18nKey}.name`, comp.name),
        param: t(`guidevane.detail.${comp.i18nKey}.param`, comp.param),
        func: t(`guidevane.detail.${comp.i18nKey}.func`, comp.func),
        precision: t(`guidevane.detail.${comp.i18nKey}.precision`, comp.precision),
        heritage: t(`guidevane.detail.${comp.i18nKey}.heritage`, comp.heritage)
    });

    const getCategoryColor = (category: string) => {
        if (category === 'safety') return '#EF4444'; // Red for safety
        if (category === 'mechanical') return '#8B5CF6'; // Purple for mech
        return '#22D3EE'; // Cyan for hydraulic
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
            {/* Header */}
            <motion.div
                variants={childVariants}
                className="flex items-center justify-between p-6 bg-gradient-to-b from-cyan-950/20 to-transparent border-b border-cyan-500/10"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                        title="Back to Runner"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">
                            {t('guidevane.detail.title', 'Guide Vane System')} <span className="text-cyan-500">{t('common.drillDown', 'Drill-Down')}</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter opacity-70">
                                NC-9.0 {t('common.technicalAnalysis', 'Technical Analysis')} // 4 REGULATION POINTS
                            </p>
                            {/* LIVE OPENING INDICATOR */}
                            <div className="flex items-center gap-1 bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30">
                                <Aperture className="w-3 h-3 text-cyan-300" />
                                <span className="text-[10px] font-mono font-black text-white">{guideVaneOpening.toFixed(1)}% OPEN</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-4 mr-4 text-[9px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-cyan-400">Hydraulic</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-red-400">Safety</span>
                        </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">{t('common.assetSyncActive', 'Asset Sync Active')}</span>
                    </div>

                    {onHome && (
                        <button onClick={onHome} className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group">
                            <Home className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </motion.div>

            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                {/* Visual Area */}
                <motion.div variants={childVariants} className="flex-[2] relative bg-black/40 rounded-2xl border border-cyan-500/10 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img
                            src="/guide-vanes.svg"
                            alt="Guide Vane Blueprint"
                            className="w-full h-full object-contain"
                            style={{ filter: 'sepia(1) hue-rotate(160deg) brightness(0.8) contrast(1.5)' }}
                        />
                    </div>

                    {/* Interactive Overlay */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
                        <defs>
                            <filter id="glow-gv">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {GV_COMPONENTS.map(comp => {
                            const isActive = activeSub === comp.id;
                            const color = getCategoryColor(comp.category);
                            return (
                                <g key={comp.id} onClick={() => setActiveSub(comp.id)} className="cursor-pointer">
                                    <circle cx={comp.pos.x} cy={comp.pos.y} r="6" fill="transparent" />
                                    <motion.circle
                                        cx={comp.pos.x}
                                        cy={comp.pos.y}
                                        r={isActive ? 4 : 2.5}
                                        fill="transparent"
                                        stroke={color}
                                        strokeWidth="0.2"
                                        animate={{ r: isActive ? [4, 6, 4] : [2.5, 4, 2.5], opacity: [0.8, 0.2, 0.8] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <circle cx={comp.pos.x} cy={comp.pos.y} r={isActive ? 2 : 1} fill={color} filter="url(#glow-gv)" />

                                    {/* Minimal Label if active */}
                                    {isActive && (
                                        <text x={comp.pos.x} y={comp.pos.y - 8} textAnchor="middle" fill={color} fontSize="2.5" fontWeight="bold">
                                            {comp.name.split(' ')[0].toUpperCase()}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Fullscreen indicator */}
                    {isFullscreen && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                            Full-Screen Mode • Press ESC to Exit
                        </div>
                    )}
                </motion.div>

                {/* Data Card */}
                <motion.div variants={childVariants} className="flex-1 min-w-[320px]">
                    <AnimatePresence mode="wait">
                        {activeData ? (
                            <motion.div
                                key={activeData.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                                        <activeData.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase">{getComponentData(activeData).name}</h3>
                                        <p className="text-xs font-bold text-cyan-400">{getComponentData(activeData).param}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {/* LIVE OPENING CARD */}
                                    {activeData.id === 'gv-vanes' && (
                                        <div className="p-4 bg-cyan-950/30 border-l-2 border-cyan-400 rounded-r-lg">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Live Opening</span>
                                                <span className="text-sm font-mono font-black text-white">{guideVaneOpening.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${guideVaneOpening}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Functional Target</span>
                                        <p className="text-sm text-slate-300">{getComponentData(activeData).func}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">Precision Requirement</span>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-emerald-300 font-mono text-xs">
                                            {getComponentData(activeData).precision}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10"><Info className="text-amber-500 w-8 h-8" /></div>
                                        <span className="text-[9px] font-black uppercase text-amber-500 block mb-1">Field Engineer Instruction</span>
                                        <p className="text-xs text-amber-200 italic">"{getComponentData(activeData).heritage}"</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 bg-cyan-500/5 border border-dashed border-cyan-500/20 rounded-2xl text-center">
                                <Aperture className="w-12 h-12 text-cyan-500/20 mb-4" />
                                <h3 className="text-cyan-500/60 font-black text-sm uppercase">Select Regulation Point</h3>
                                <p className="text-[10px] text-cyan-500/40 font-bold mt-2">Explore Wicket Gates & Linkage</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default GuideVaneDetailView;
