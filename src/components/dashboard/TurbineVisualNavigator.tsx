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
    Target,
    Activity
} from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { Minimize2, Maximize2, Home } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { TURBINE_COMPONENTS as COMPONENTS } from './data/visual-map';

import GeneratorDetailView from './visual/GeneratorDetailView';
import RunnerDetailView from './visual/RunnerDetailView';
import GuideVaneDetailView from './visual/GuideVaneDetailView';
import FlywheelDetailView from './visual/FlywheelDetailView';

/**
 * NC-4.2 COMPLIANT VISUAL NAVIGATOR
 * Interactive Blueprint with Signposts & Drill-Down
 */



const TurbineVisualNavigator: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'overview' | 'generator-detail' | 'runner-detail' | 'guide-vane-detail' | 'flywheel-detail'>('overview');
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
    // NC-4.2 PRECISION TOPOLOGY - DEBUG MODE ENABLED
    useEffect(() => {
        fetch('/Turbine_Grouped.svg')
            .then(res => res.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'image/svg+xml');
                const svgElement = doc.querySelector('svg');
                if (svgElement) {
                    // Remove any clip-path or mask that could cause "black hole" effect
                    svgElement.removeAttribute('clip-path');
                    svgElement.removeAttribute('mask');
                    svgElement.style.overflow = 'visible';

                    // Cleanup existing injections
                    const idsToRemove = [
                        'temp-generator', 'temp-shaft-coupling', 'temp-spiral-case', 'temp-runner',
                        'temp-lubrication', 'temp-control', 'temp-miv', 'temp-penstock',
                        'temp-hpu', 'temp-gen-cooling', 'temp-pressure-eq', 'nav-zone-left', 'nav-chevron'
                    ];
                    idsToRemove.forEach(id => {
                        const existing = doc.getElementById(id);
                        if (existing) existing.remove();
                    });

                    // DEBUG MODE FLAG - Set to false for production
                    const DEBUG_MODE = false;

                    // Utility: Create Hitbox with NC-4.2 Precision Coordinates
                    const createHitbox = (id: string, type: 'rect' | 'circle', coords: any, titleText: string) => {
                        const group = doc.createElementNS("http://www.w3.org/2000/svg", "g");
                        group.id = id;
                        group.setAttribute("class", "interactive-zone");
                        group.style.cursor = "pointer";

                        const shape = doc.createElementNS("http://www.w3.org/2000/svg", type);
                        if (type === 'circle') {
                            shape.setAttribute("cx", coords.cx);
                            shape.setAttribute("cy", coords.cy);
                            shape.setAttribute("r", coords.r);
                        } else {
                            shape.setAttribute("x", coords.x);
                            shape.setAttribute("y", coords.y);
                            shape.setAttribute("width", coords.w);
                            shape.setAttribute("height", coords.h);
                        }

                        // DEBUG MODE: Red stroke for visual verification
                        if (DEBUG_MODE) {
                            shape.setAttribute("stroke", "red");
                            shape.setAttribute("stroke-width", "2");
                            shape.setAttribute("fill", "#22D3EE");
                            shape.setAttribute("fill-opacity", "0.2");
                        }

                        const title = doc.createElementNS("http://www.w3.org/2000/svg", "title");
                        title.textContent = titleText;
                        group.appendChild(title);
                        group.appendChild(shape);
                        return group;
                    };

                    // Inject Electric Cyan (#22D3EE) CSS with semi-transparent black label backgrounds
                    const style = doc.createElementNS("http://www.w3.org/2000/svg", "style");
                    style.textContent = `
                        .interactive-zone rect, .interactive-zone circle {
                            fill: #22D3EE;
                            fill-opacity: ${DEBUG_MODE ? '0.2' : '0'};
                            stroke: ${DEBUG_MODE ? 'red' : 'none'};
                            stroke-width: ${DEBUG_MODE ? '2px' : '0'};
                            transition: all 0.3s ease;
                        }
                        .interactive-zone:hover rect, .interactive-zone:hover circle {
                            fill-opacity: 0.25;
                            stroke: #22D3EE;
                            stroke-width: 3px;
                            filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.6));
                        }
                        #nav-zone-left rect {
                            transition: all 0.3s ease;
                        }
                        #nav-zone-left:hover rect {
                            fill-opacity: 0.3 !important;
                            stroke: #22D3EE !important;
                        }
                        #nav-zone-left:hover #nav-chevron {
                            stroke: #ffffff;
                            filter: drop-shadow(0 0 8px #22D3EE);
                        }
                    `;
                    svgElement.insertBefore(style, svgElement.firstChild);

                    // =====================================================
                    // NC-4.2 PRECISION TOPOLOGY CALIBRATION
                    // Coordinates are EXACT PIXELS for 1184x864 canvas
                    // =====================================================

                    // 1. Generator Unit - Anchor: (220, 350)
                    svgElement.appendChild(createHitbox("temp-generator", "rect", { x: "100", y: "200", w: "240", h: "360" }, "Generator Unit"));

                    // 2. Shaft & Flywheel - Anchor: (480, 420)
                    svgElement.appendChild(createHitbox("temp-shaft-coupling", "rect", { x: "420", y: "380", w: "150", h: "100" }, "Shaft & Flywheel"));

                    // 3. Spiral Case (The Shell) - Anchor: (720, 460), MUST be BEFORE Runner for z-order
                    svgElement.appendChild(createHitbox("temp-spiral-case", "circle", { cx: "720", cy: "460", r: "200" }, "Spiral Case"));

                    // 5. Main Inlet Valve (MIV) - Anchor: (960, 400)
                    svgElement.appendChild(createHitbox("temp-miv", "rect", { x: "900", y: "320", w: "140", h: "220" }, "Main Inlet Valve"));

                    // 6. Penstock Connection - Anchor: (1120, 430)
                    svgElement.appendChild(createHitbox("temp-penstock", "rect", { x: "1050", y: "380", w: "134", h: "150" }, "Penstock"));

                    // 4. Francis Runner (The Heart) - Anchor: (720, 460), LAST in DOM for z-order (clickable on top)
                    svgElement.appendChild(createHitbox("temp-runner", "circle", { cx: "720", cy: "460", r: "80" }, "Francis Runner"));

                    // --- LEFT NAVIGATION ZONE (Mechanism Detail) ---
                    // Width extended to 180px as per spec
                    const navGroup = doc.createElementNS("http://www.w3.org/2000/svg", "g");
                    navGroup.id = "nav-zone-left";
                    navGroup.style.cursor = "w-resize";

                    const navRect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
                    navRect.setAttribute("x", "0");
                    navRect.setAttribute("y", "0");
                    navRect.setAttribute("width", "180");
                    navRect.setAttribute("height", "864");
                    navRect.setAttribute("fill", "#22D3EE");
                    navRect.setAttribute("fill-opacity", DEBUG_MODE ? "0.15" : "0.05");
                    navRect.setAttribute("stroke", DEBUG_MODE ? "red" : "#22D3EE");
                    navRect.setAttribute("stroke-width", DEBUG_MODE ? "3" : "2");

                    // Visual Cue: Chevron pointing left (Mechanism Detail)
                    const chevron = doc.createElementNS("http://www.w3.org/2000/svg", "path");
                    chevron.setAttribute("d", "M 70 380 L 40 432 L 70 484");
                    chevron.setAttribute("stroke", "#22D3EE");
                    chevron.setAttribute("stroke-width", "4");
                    chevron.setAttribute("fill", "none");
                    chevron.setAttribute("opacity", "0.9");
                    chevron.setAttribute("id", "nav-chevron");

                    navGroup.appendChild(navRect);
                    navGroup.appendChild(chevron);
                    svgElement.appendChild(navGroup);

                    setSvgContent(svgElement.innerHTML);
                }

            });
    }, []);

    const focusedComp = COMPONENTS.find(c => c.id === focusedId);

    return (
        <div ref={containerRef} className={`relative w-full ${isFullscreen ? 'h-screen rounded-none' : 'aspect-[1184/864] rounded-xl'} bg-[#0A0F14] border border-cyan-500/20 shadow-2xl transition-all duration-700`}>
            <AnimatePresence mode="wait">
                {viewMode === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ overflow: 'visible' }}
                    >
                        {/* NC-4.2 ZERO-DRIFT CONTAINER: Fixed 1184x864 for 1:1 pixel parity */}
                        <div
                            className="relative"
                            style={{
                                width: '1184px',
                                height: '864px',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        >
                            {/* SVG Container - NC-4.2 ABSOLUTE PIXEL GRID */}
                            <div className="absolute inset-0 z-0" style={{ overflow: 'visible' }}>
                                <svg
                                    ref={svgRef}
                                    viewBox="0 0 1184 864"
                                    preserveAspectRatio="xMidYMid meet"
                                    className="w-full h-full"
                                    style={{ overflow: 'visible' }}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <g
                                        dangerouslySetInnerHTML={{ __html: svgContent }}
                                        onClick={(e) => {
                                            const target = e.target as SVGElement;
                                            const group = target.closest('g');
                                            const clickedId = group?.id || target.id;

                                            // NC-4.2 PRODUCTION: Clean click handler


                                            if (clickedId === 'nav-zone-left' || clickedId === 'nav-chevron') {
                                                navigate('/francis/mechanism-detail');
                                                return;
                                            }

                                            if (group && group.id && (group.id.startsWith('temp-') || group.id.startsWith('nav-'))) {
                                                if (group.id === 'temp-generator') {
                                                    setViewMode('generator-detail');
                                                } else if (group.id === 'temp-runner') {
                                                    setViewMode('runner-detail');
                                                } else if (group.id === 'temp-shaft-coupling') {
                                                    setViewMode('flywheel-detail');
                                                } else if (group.id === 'nav-seal' || group.id === 'nav-distributor') {
                                                    navigate('/francis/mechanism-detail');
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

                                    {/* Leader Lines - Using ABSOLUTE PIXEL coordinates */}
                                    <g className="pointer-events-none">
                                        {COMPONENTS.map(comp => {
                                            // NC-4.2: Direct pixel values, no percentage conversion
                                            const labelX = comp.labelPos.x;
                                            const labelY = comp.labelPos.y;
                                            const isHovered = hoveredId === comp.id;

                                            return (
                                                <motion.line
                                                    key={`line-${comp.id}`}
                                                    x1={labelX}
                                                    y1={labelY}
                                                    x2={comp.anchor.x}
                                                    y2={comp.anchor.y}
                                                    stroke={isHovered ? "#22D3EE" : "rgba(34, 211, 238, 0.3)"}
                                                    strokeWidth={isHovered ? 2.5 : 1.5}
                                                    strokeDasharray={isHovered ? "none" : "6 3"}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            );
                                        })}
                                    </g>
                                </svg>
                            </div>

                            {/* Label Layer - ABSOLUTE PIXEL positioning (NO percentages) */}
                            <div
                                className="absolute top-0 left-0 pointer-events-none z-10"
                                style={{ width: '1184px', height: '864px' }}
                            >
                                {COMPONENTS.map(comp => {
                                    const isHovered = hoveredId === comp.id;

                                    return (
                                        <motion.div
                                            key={`label-${comp.id}`}
                                            style={{
                                                position: 'absolute',
                                                left: `${comp.labelPos.x}px`,
                                                top: `${comp.labelPos.y}px`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                            className="pointer-events-auto cursor-pointer"
                                            onMouseEnter={() => setHoveredId(comp.id)}
                                            onClick={() => {
                                                if (comp.id === 'temp-generator') {
                                                    setViewMode('generator-detail');
                                                } else if (comp.id === 'temp-runner') {
                                                    setViewMode('runner-detail');
                                                } else if (comp.id === 'temp-shaft-coupling') {
                                                    setViewMode('flywheel-detail');
                                                } else if (comp.id.startsWith('nav-')) {
                                                    navigate('/francis/mechanism-detail');
                                                } else {
                                                    setFocusedId(comp.id);
                                                }
                                            }}
                                        >
                                            <div className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300
                    ${isHovered
                                                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110'
                                                    : 'bg-black/70 border-cyan-500/30 shadow-lg scale-100'
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
                ) : viewMode === 'runner-detail' ? (
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
                            onGuideVaneDrillDown={() => setViewMode('guide-vane-detail')}
                        />
                    </motion.div>
                ) : viewMode === 'guide-vane-detail' ? (
                    <motion.div
                        key="guide-vane-detail"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 z-30"
                    >
                        <GuideVaneDetailView
                            onBack={() => setViewMode('runner-detail')}
                            onHome={() => navigate(FRANCIS_PATHS.HUB)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="flywheel-detail"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 z-30"
                    >
                        <FlywheelDetailView
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
