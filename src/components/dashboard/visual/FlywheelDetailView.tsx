import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Settings,
    Activity,
    Info,
    ChevronRight,
    Maximize2,
    Minimize2,
    Home,
    Disc,
    Link,
    Shield,
    CircleDot,
    LocateFixed
} from 'lucide-react';

interface FlywheelDetailProps {
    onBack: () => void;
    onHome?: () => void;
}

// NC-4.2 Mechanical Backbone Hotspots
const MECH_COMPONENTS = [
    {
        id: 'mech-gen-bearing',
        i18nKey: 'genBearing',
        name: 'Generator Drive-End (DE) Bearing',
        param: 'Load Support',
        heritage: 'Supporting the significant weight overhang of the flywheel. Oil film thickness must be monitored continuously.',
        icon: LocateFixed,
        pos: { x: 50, y: 30 },
        func: 'Supports the radial and axial loads of the generator rotor and flywheel mass.',
        precision: 'Temp < 65°C',
        category: 'support'
    },
    {
        id: 'mech-flywheel',
        i18nKey: 'flywheel',
        name: 'Flywheel (Zamajac)',
        param: 'Rotational Inertia',
        heritage: 'Never operate without the flywheel guard installed. The stored kinetic energy is immense and catastrophic if released.',
        icon: Disc,
        pos: { x: 50, y: 45 },
        func: 'Stores kinetic energy to stabilize turbine speed during load rejections and grid fluctuations.',
        precision: 'Balance G2.5 ISO 1940',
        category: 'inertia'
    },
    {
        id: 'mech-coupling',
        i18nKey: 'coupling',
        name: 'Shaft Coupling Interface (Ø200)',
        param: 'Torque Transmission',
        heritage: 'Shaft run-out at this point should typically be < 0.03 mm TIR (Total Indicator Reading). Loose bolts here inevitably shear.',
        icon: Link,
        pos: { x: 50, y: 60 },
        func: 'Rigidly connects the turbine shaft to the generator shaft, transmitting torque.',
        precision: 'Run-out < 0.03 mm',
        category: 'transmission'
    },
    {
        id: 'mech-turb-bearing',
        i18nKey: 'turbBearing',
        name: 'Turbine Guide Bearing',
        param: 'Hydraulic Stability',
        heritage: 'The bearing closest to the hydraulic chaos. If this bearing vibrates, check the Runner Wearing Rings first.',
        icon: CircleDot,
        pos: { x: 50, y: 75 },
        func: 'Resists radial hydraulic forces acting on the runner, maintaining shaft concentricity.',
        precision: 'Clearance 0.15 - 0.25 mm',
        category: 'support'
    },
    {
        id: 'mech-shaft-seal',
        i18nKey: 'shaftSeal',
        name: 'Turbine Shaft Seal',
        param: 'Water Ingress Prevention',
        heritage: 'Carbon rings must be "run-in" properly. A leaking seal floods the turbine, causing corrosion of the bearing housing.',
        icon: Shield,
        pos: { x: 50, y: 85 },
        func: 'Prevents water from traveling up the shaft from the turbine casing into the bearing assembly.',
        precision: 'Leakage < 5 L/min',
        category: 'sealing'
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

const FlywheelDetailView: React.FC<FlywheelDetailProps> = ({ onBack, onHome }) => {
    const { t } = useTranslation();
    const [activeSub, setActiveSub] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false); // Default false to avoid hydration mismatch
    const containerRef = useRef<HTMLDivElement>(null);

    const activeData = MECH_COMPONENTS.find(c => c.id === activeSub);

    // Initial check for fullscreen state
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

    const getComponentData = (comp: typeof MECH_COMPONENTS[0]) => ({
        name: t(`mechanical.detail.${comp.i18nKey}.name`, comp.name),
        param: t(`mechanical.detail.${comp.i18nKey}.param`, comp.param),
        func: t(`mechanical.detail.${comp.i18nKey}.func`, comp.func),
        precision: t(`mechanical.detail.${comp.i18nKey}.precision`, comp.precision),
        heritage: t(`mechanical.detail.${comp.i18nKey}.heritage`, comp.heritage)
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'support': return '#8B5CF6'; // Purple
            case 'inertia': return '#22D3EE'; // Cyan
            case 'transmission': return '#F59E0B'; // Amber
            case 'sealing': return '#10B981'; // Emerald
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
            {/* Header */}
            <motion.div
                variants={childVariants}
                className="flex items-center justify-between p-6 bg-gradient-to-b from-cyan-950/20 to-transparent border-b border-cyan-500/10"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                        title="Back to System Topology"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">
                            {t('mechanical.detail.title', 'Mechanical Backbone')} <span className="text-cyan-500">{t('common.drillDown', 'Drill-Down')}</span>
                        </h2>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter opacity-70">
                            NC-4.2 {t('common.technicalAnalysis', 'Technical Analysis')} // 5 MECHANICAL NODES
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-4 mr-4 text-[9px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-cyan-400">Inertia</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-amber-400">Transmission</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-purple-400">Support</span>
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
                            src="/flywheel-assembly.svg"
                            alt="Flywheel Assembly Blueprint"
                            className="w-full h-full object-contain"
                            style={{ filter: 'sepia(1) hue-rotate(160deg) brightness(0.8) contrast(1.5)' }}
                        />
                    </div>

                    {/* Interactive Overlay */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
                        <defs>
                            <filter id="glow-mech">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {MECH_COMPONENTS.map(comp => {
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
                                    <circle cx={comp.pos.x} cy={comp.pos.y} r={isActive ? 2 : 1} fill={color} filter="url(#glow-mech)" />

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
                                <Activity className="w-12 h-12 text-cyan-500/20 mb-4" />
                                <h3 className="text-cyan-500/60 font-black text-sm uppercase">Select Mechanics</h3>
                                <p className="text-[10px] text-cyan-500/40 font-bold mt-2">Explore Shaft & Coupling Physics</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default FlywheelDetailView;
