import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Eye, EyeOff, Home, ChevronRight } from 'lucide-react';
// import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useFrancisStore, FrancisComponentId } from '../../features/francis/store/useFrancisStore';

type SchematicView = 'main-hall' | 'generator-detail';

const SCHEMATIC_PATHS: Record<SchematicView, string> = {
    'main-hall': '/assets/schematics/francis-h5/Francis_manje_5.svg',
    'generator-detail': '/assets/schematics/francis-h5/geno_fr_h_manje_od_5.svg'
};

export const FrancisDigitalTwin: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    // const { mechanical } = useTelemetryStore();
    const { activeAssetId, setActiveAsset, isFullView, toggleFullView, xRayActive, toggleXRay, setFullView } = useFrancisStore();

    const [currentView, setCurrentView] = useState<SchematicView>(activeAssetId === 'generator' ? 'generator-detail' : 'main-hall');
    const [isLoading, setIsLoading] = useState(true);
    const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

    // Sync view with activeAssetId
    useEffect(() => {
        if (activeAssetId === 'generator' && currentView !== 'generator-detail') {
            setCurrentView('generator-detail');
        } else if (!activeAssetId && currentView !== 'main-hall') {
            // Optional: navigate back if deselected, but usually we stay
        }
    }, [activeAssetId, currentView]);

    // Load SVG Content
    useEffect(() => {
        const loadSVG = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(SCHEMATIC_PATHS[currentView]);
                if (!response.ok) throw new Error("Failed to fetch SVG");

                const text = await response.text();

                if (containerRef.current) {
                    containerRef.current.innerHTML = text;
                    const svg = containerRef.current.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('width', '100%');
                        svg.setAttribute('height', '100%');
                        svg.style.transition = 'all 0.5s ease';
                        setSvgElement(svg);
                    }
                }
            } catch (e) {
                console.error("Failed to load schematic", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadSVG();
    }, [currentView]);

    // Interaction Setup (Re-run when SVG or Dependencies change)
    useEffect(() => {
        if (!svgElement) return;

        // Helper to handle clicks
        const handleComponentClick = (id: string, e: Event) => {
            e.stopPropagation();
            console.log(`Active ID: ${id}`);

            // Map Surgical IDs (group-*) to Store IDs
            const mapping: Record<string, FrancisComponentId> = {
                'group-generator': 'generator',
                'group-miv': 'miv',
                'group-spiral-case': 'spiral_case',
                'group-runner': 'runner',
                'group-hpu': 'hpu',
                // Inspection Points mapping (direct usage of ID as key)
                'insp-de-bearing': 'insp-de-bearing' as any,
                'insp-nde-bearing': 'insp-nde-bearing' as any,
                'insp-stator': 'insp-stator' as any,
                'insp-rotor': 'insp-rotor' as any,
                'insp-lube-oil': 'insp-lube-oil' as any
            };

            const storeId = mapping[id];
            if (storeId) {
                setActiveAsset(storeId);
                // Portal Logic: Clicking Generator => Detail View
                if (storeId === 'generator') {
                    setCurrentView('generator-detail');
                }
            }
        };

        // 1. Target Markers (group-*)
        const markers = svgElement.querySelectorAll<SVGGElement>('g[id^="group-"]');
        markers.forEach(group => {
            const id = group.id;

            // Visuals
            group.style.cursor = 'pointer';
            group.style.transition = 'all 0.3s ease';

            // Hover (JS fallback if CSS fails)
            group.onmouseenter = () => {
                if (!xRayActive) group.style.filter = 'drop-shadow(0 0 8px #22d3ee)';
            };
            group.onmouseleave = () => {
                if (!xRayActive) group.style.filter = 'none';
            };

            // Click
            group.onclick = (e) => handleComponentClick(id, e);
        });

        // 2. Target Inspection Markers (insp-*)
        const inspectionMarkers = svgElement.querySelectorAll<SVGGElement>('g[id^="insp-"]');
        inspectionMarkers.forEach(group => {
            const id = group.id;
            group.style.cursor = 'help'; // Different cursor for inspection
            group.onclick = (e) => handleComponentClick(id, e);
        });

    }, [svgElement, xRayActive, setActiveAsset, setCurrentView]);


    // Surgical X-Ray Logic
    useEffect(() => {
        if (!svgElement) return;

        // Use the FR-* IDs effectively for X-Ray too if needed, 
        // but typically X-Ray targets specific paths.
        // For now, assuming standard opacity logic on the groups if they contain the paths.
        const spiralCase = svgElement.querySelector<SVGGElement>('#FR-SPIRAL-01');
        const runner = svgElement.querySelector<SVGGElement>('#FR-RUNNER-01');

        if (xRayActive) {
            if (spiralCase) {
                spiralCase.style.opacity = '0.2'; // Transparent housing
            }
            if (runner) {
                runner.style.opacity = '1';
                runner.style.filter = 'drop-shadow(0 0 15px #06b6d4)'; // Glow
            }
        } else {
            if (spiralCase) {
                spiralCase.style.opacity = '1';
            }
            if (runner) {
                runner.style.filter = 'none';
            }
        }
    }, [xRayActive, svgElement]);


    // Cyber-Blue Filter & View Styling
    const containerStyle = {
        filter: currentView === 'main-hall'
            ? 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2)'
            : 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)'
    };

    const handleBack = () => {
        setCurrentView('main-hall');
        setActiveAsset(null);
    };

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden">
            {/* BREADCRUMBS */}
            {!isFullView && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 text-sm font-mono">
                    <button
                        onClick={handleBack}
                        className={`px-3 py-1 rounded transition-colors flex items-center gap-2 ${currentView === 'main-hall'
                            ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400'
                            }`}
                    >
                        <Home className="w-3 h-3" />
                        Main Hall
                    </button>
                    {currentView === 'generator-detail' && (
                        <>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <div className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-400">
                                Generator
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* CONTROLS */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
                <button
                    onClick={toggleXRay}
                    className={`p-2 rounded-lg transition-all ${xRayActive
                        ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                        }`}
                    title="X-Ray Mode"
                >
                    {xRayActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button
                    onClick={toggleFullView}
                    className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:bg-slate-700 transition-all"
                    title="Full View"
                >
                    {isFullView ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
            </div>

            {/* SVG CONTAINER */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                    ref={containerRef}
                    style={{
                        ...containerStyle,
                        transform: 'scale(1.1)', // Large but safe
                        filter: `${containerStyle.filter} drop-shadow(0 0 15px rgba(6,182,212,0.15))` // Ambient Cyber-Glow
                    }}
                >
                    {/* SVG Injected Here */}
                </motion.div>
            </AnimatePresence>

            {/* LOADING */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-40">
                    <p className="text-cyan-400 font-mono animate-pulse">Initializing {currentView}...</p>
                </div>
            )}

            {/* LIVE DATA HUD */}
            <div className="absolute bottom-4 left-4 z-30 bg-slate-900/80 border border-slate-700/50 rounded px-4 py-2 text-xs font-mono text-slate-400 flex gap-4">
                <span>STATUS: {activeAssetId ? <span className="text-cyan-400">LINKED</span> : <span className="text-slate-600">IDLE</span>}</span>
                {activeAssetId === 'generator' && (
                    <>
                        <span>RPM: <span className="text-cyan-400">500</span></span>
                        <span>TEMP: <span className="text-cyan-400">45°C</span></span>
                    </>
                )}
            </div>
        </div>
    );
};
