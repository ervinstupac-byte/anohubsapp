import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Settings,
    ShieldCheck,
    Zap,
    Droplets,
    Compass,
    ExternalLink,
    ChevronRight,
    Info,
    History,
    Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Minimize2, Maximize2, Home } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

import GeneratorDetailView from './visual/GeneratorDetailView';
import RunnerDetailView from './visual/RunnerDetailView';

/**
 * NC-4.2 COMPLIANT VISUAL NAVIGATOR
 * Interactive Blueprint with Signposts & Drill-Down
 */

interface ComponentDetail {
    id: string;
    name: string;
    func: string;
    precision: string;
    heritage: string;
    path: string;
    icon: any;
    // Spatial anchor for leader line (SVG coordinates)
    anchor: { x: number, y: number };
    // Visual position for label (Percentage)
    labelPos: { top: string, left: string };
}

const COMPONENTS: ComponentDetail[] = [
    {
        id: 'temp-generator',
        name: 'GENERATOR UNIT',
        func: 'Converts mechanical rotational energy into electrical power via electromagnetic induction.',
        precision: '0.05 mm/m alignment factor',
        heritage: 'Modern excitation systems allow for +/- 2% voltage stability during transient grid fluctuations.',
        path: '/electrical/generator-integrity',
        icon: Zap,
        anchor: { x: 800, y: 150 },
        labelPos: { top: '10%', left: '80%' }
    },
    {
        id: 'temp-spiral-case',
        name: 'SPIRAL CASE',
        func: 'Stationary spiral housing ("snail shell") that distributes high-pressure water uniformly around the turbine runner circumference.',
        precision: '0.1 mm surface smoothness',
        heritage: 'The spiral geometry is optimized to maintain constant velocity, reducing cavitation risk.',
        path: '/francis/modules/spiral-case',
        icon: Droplets,
        anchor: { x: 700, y: 500 },
        labelPos: { top: '58%', left: '70%' }
    },
    {
        id: 'temp-runner',
        name: 'FRANCIS RUNNER',
        func: 'Central rotating element that converts hydraulic energy into mechanical torque through precisely profiled blade channels.',
        precision: 'Wearing ring gap: 0.3-0.5 mm',
        heritage: 'The runner is the heart of the turbine. A 1mm increase in wearing ring gap can drop power by >3%.',
        path: '/francis/modules/runner',
        icon: Target,
        anchor: { x: 600, y: 450 },
        labelPos: { top: '50%', left: '55%' }
    },
    {
        id: 'temp-miv',
        name: 'MAIN INLET VALVE (MIV)',
        func: 'Provides emergency isolation and primary control of water entry to the turbine.',
        precision: 'Zero-leakage seat tolerance',
        heritage: 'Spherical MIVs provide the lowest head loss when fully open, maximizing efficiency.',
        path: '/francis/modules/miv',
        icon: Settings,
        anchor: { x: 500, y: 400 },
        labelPos: { top: '35%', left: '45%' }
    },
    {
        id: 'temp-penstock',
        name: 'PENSTOCK CONNECTION',
        func: 'High-pressure conduit delivering water from the reservoir to the valve assembly.',
        precision: '0.02 mm weld integrity check',
        heritage: 'Acoustic monitoring of penstocks can detect micro-cracks before they reach critical failure.',
        path: '/maintenance/bolt-torque',
        icon: ShieldCheck,
        anchor: { x: 250, y: 400 },
        labelPos: { top: '45%', left: '15%' }
    },
    {
        id: 'temp-lubrication',
        name: 'LUBRICATION SYSTEM',
        func: 'Manages heat and friction for the main turbine bearings and guide vanes.',
        precision: '5 micron filtration target',
        heritage: 'Clean oil is the lifeblood of a turbine; 80% of bearing failures are due to particle contamination.',
        path: '/francis/modules/lubrication',
        icon: ShieldCheck,
        anchor: { x: 750, y: 270 },
        labelPos: { top: '25%', left: '60%' }
    },
    {
        id: 'temp-cabinet',
        name: 'CONTROL CABINET',
        func: 'Central processor for gubernor logic and safety monitoring systems.',
        precision: '1ms response time',
        heritage: 'Modern PLC logic handles over 200 field sensors in real-time for millisecond trip response.',
        path: '/operations/control-center',
        icon: Compass,
        anchor: { x: 150, y: 350 },
        labelPos: { top: '30%', left: '5%' }
    }
];

const TurbineVisualNavigator: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'overview' | 'generator-detail' | 'runner-detail'>('overview');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fullscreen Toggle Handler
    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    // Listen to fullscreen changes
    useEffect(() => {
        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, []);

    // Load and Patch the SVG
    useEffect(() => {
        fetch('/Turbine_Grouped.svg')
            .then(res => res.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'image/svg+xml');
                const svgElement = doc.querySelector('svg');
                if (svgElement) {
                    // NC-4.2 TOPOLOGY REPAIR: Inject Runner Hitbox
                    // Create a transparent interaction zone in the center
                    const runnerGroup = doc.createElementNS("http://www.w3.org/2000/svg", "g");
                    runnerGroup.id = "temp-runner";
                    runnerGroup.style.cursor = "pointer";

                    const circle = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", "600"); // Calculated Center of viewBox 0 0 1184 864
                    circle.setAttribute("cy", "432");
                    circle.setAttribute("r", "90");   // Optimal hit-area radius
                    circle.setAttribute("fill", "transparent");
                    // Ensure it has a title for checking
                    const title = doc.createElementNS("http://www.w3.org/2000/svg", "title");
                    title.textContent = "Francis Runner";
                    runnerGroup.appendChild(title);
                    runnerGroup.appendChild(circle);

                    // Append as last child to ensure z-index priority over spiral case
                    svgElement.appendChild(runnerGroup);

                    setSvgContent(svgElement.innerHTML);
                }
            });
    }, []);

    const focusedComp = COMPONENTS.find(c => c.id === focusedId);

    return (
        <div ref={containerRef} className={`relative w-full ${isFullscreen ? 'h-screen rounded-none' : 'aspect-[1184/864] rounded-xl'} bg-[#0A0F14] overflow-hidden border border-cyan-500/20 shadow-2xl transition-all duration-700`}>
            <AnimatePresence mode="wait">
                {viewMode === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0"
                    >
                        {/* SVG Container */}
                        <div className="absolute inset-0 z-0">
                            <svg
                                ref={svgRef}
                                viewBox="0 0 1184 864"
                                className="w-full h-full"
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <defs>
                                    <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feFlood floodColor="#22D3EE" floodOpacity="0.8" result="color" />
                                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                                        <feMerge>
                                            <feMergeNode in="glow" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <g
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    onClick={(e) => {
                                        const target = e.target as SVGElement;
                                        const group = target.closest('g');
                                        if (group && group.id && group.id.startsWith('temp-')) {
                                            if (group.id === 'temp-generator') {
                                                setViewMode('generator-detail');
                                            } else if (group.id === 'temp-runner') {
                                                setViewMode('runner-detail');
                                            } else {
                                                setFocusedId(group.id);
                                            }
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        const target = e.target as SVGElement;
                                        const group = target.closest('g');
                                        if (group && group.id && group.id.startsWith('temp-')) {
                                            setHoveredId(group.id);
                                        } else {
                                            setHoveredId(null);
                                        }
                                    }}
                                />

                                {hoveredId && (
                                    <use
                                        href={`#${hoveredId}`}
                                        filter="url(#cyanGlow)"
                                        style={{ pointerEvents: 'none', transition: 'all 0.3s' }}
                                    />
                                )}

                                <g className="pointer-events-none">
                                    {COMPONENTS.map(comp => {
                                        const labelX = (parseFloat(comp.labelPos.left) / 100) * 1184;
                                        const labelY = (parseFloat(comp.labelPos.top) / 100) * 864;
                                        const isHovered = hoveredId === comp.id;

                                        return (
                                            <motion.line
                                                key={`line-${comp.id}`}
                                                x1={labelX}
                                                y1={labelY}
                                                x2={comp.anchor.x}
                                                y2={comp.anchor.y}
                                                stroke={isHovered ? "#22D3EE" : "rgba(34, 211, 238, 0.2)"}
                                                strokeWidth={isHovered ? 2 : 1}
                                                strokeDasharray={isHovered ? "none" : "4 2"}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        );
                                    })}
                                </g>
                            </svg>
                        </div>

                        {/* Signpost Labels */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {COMPONENTS.map(comp => {
                                const isHovered = hoveredId === comp.id;
                                return (
                                    <motion.div
                                        key={`label-${comp.id}`}
                                        style={{
                                            position: 'absolute',
                                            top: comp.labelPos.top,
                                            left: comp.labelPos.left,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                        className="pointer-events-auto cursor-pointer"
                                        onMouseEnter={() => setHoveredId(comp.id)}
                                        onClick={() => {
                                            if (comp.id === 'temp-generator') {
                                                setViewMode('generator-detail');
                                            } else if (comp.id === 'temp-runner') {
                                                setViewMode('runner-detail');
                                            } else {
                                                setFocusedId(comp.id);
                                            }
                                        }}
                                    >
                                        <div className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300
                    ${isHovered
                                                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110'
                                                : 'bg-black/40 border-cyan-500/20 shadow-lg scale-100'
                                            }
                  `}>
                                            <comp.icon className={`w-3.5 h-3.5 ${isHovered ? 'text-cyan-400' : 'text-slate-400'}`} />
                                            <span className={`text-[10px] font-black tracking-widest uppercase ${isHovered ? 'text-white' : 'text-slate-300'}`}>
                                                {comp.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Detail Card Overlay (Drill-Down) */}
                        <AnimatePresence>
                            {focusedId && focusedComp && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl"
                                    onClick={() => setFocusedId(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="w-full max-w-2xl bg-[#0F171E] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-3xl text-left"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Header */}
                                        <div className="p-6 border-b border-cyan-500/10 bg-gradient-to-r from-cyan-900/20 to-transparent flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                                                    <focusedComp.icon className="w-6 h-6 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{focusedComp.name}</h2>
                                                    <p className="text-xs text-cyan-400 font-mono tracking-widest">NC-4.2 COMPONENT ANALYSIS</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFocusedId(null)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            >
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Content Grid */}
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Info className="w-4 h-4 text-cyan-500" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FUNCTIONAL DESCRIPTION</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                        {focusedComp.func}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRECISION REQUIREMENT</span>
                                                    </div>
                                                    <div className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                                        <p className="text-lg font-mono font-bold text-emerald-400">
                                                            {focusedComp.precision}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <History className="w-4 h-4 text-amber-500" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HERITAGE INSIGHT</span>
                                                    </div>
                                                    <p className="text-xs text-amber-200/80 leading-relaxed italic">
                                                        "{focusedComp.heritage}"
                                                    </p>
                                                </div>

                                                <div className="pt-4 space-y-3">
                                                    <button
                                                        onClick={() => navigate(focusedComp.path)}
                                                        className="w-full flex items-center justify-between p-4 bg-cyan-500 text-white rounded-xl font-black text-sm uppercase tracking-tighter hover:bg-cyan-400 transition-all group"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <ExternalLink className="w-4 h-4" />
                                                            Deep Diagnostics
                                                        </span>
                                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </button>

                                                    <button
                                                        onClick={() => setFocusedId(null)}
                                                        className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
                                                    >
                                                        Return to Plant Map
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-8 py-3 bg-black/40 border-t border-cyan-500/10 flex justify-between items-center text-[9px] font-mono text-slate-500">
                                            <span>COMPONENT ID: {focusedComp.id}</span>
                                            <span className="animate-pulse">SYSTEM SECURED - STANDING BY</span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Top Banner & Controls */}
                        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-md backdrop-blur-md">
                                    <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-tighter">NC-4.2 COMPLIANT TOPOLOGY</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-white/5 rounded-md backdrop-blur-sm">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LIVE INTERFACE</span>
                                </div>
                            </div>

                            {/* Global Full Screen Toggle */}
                            <div className="pointer-events-auto flex items-center gap-2">
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-lg backdrop-blur-md text-slate-400 hover:text-cyan-400 transition-all group"
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : viewMode === 'generator-detail' ? (
                    <motion.div
                        key="generator-detail"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 z-30"
                    >
                        <GeneratorDetailView
                            onBack={() => setViewMode('overview')}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="runner-detail"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 z-30"
                    >
                        <RunnerDetailView
                            onBack={() => setViewMode('overview')}
                            onHome={() => navigate(FRANCIS_PATHS.HUB)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TurbineVisualNavigator;
