import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ExternalLink,
    Database,
    Cpu,
    Settings,
    Activity,
    Zap,
    Info
} from 'lucide-react';

interface Hotspot {
    id: string;
    labelKey: string;
    path: string;
    top: string;
    left: string;
    width: string;
    height: string;
    detail: {
        funcKey: string;
        precKey: string;
        heritKey: string;
        image?: string;
    };
}

const HOTSPOTS: Hotspot[] = [
    {
        id: 'gen',
        labelKey: 'generator',
        path: '/electrical/generator-integrity',
        top: '15%',
        left: '35%',
        width: '30%',
        height: '25%',
        detail: {
            funcKey: 'drillDown.gen.func',
            precKey: 'drillDown.gen.prec',
            heritKey: 'drillDown.gen.herit'
        }
    },
    {
        id: 'miv',
        labelKey: 'miv',
        path: '/mechanical/hydraulic-maint',
        top: '45%',
        left: '10%',
        width: '15%',
        height: '20%',
        detail: {
            funcKey: 'drillDown.miv.func',
            precKey: 'drillDown.miv.prec',
            heritKey: 'drillDown.miv.herit'
        }
    },
    {
        id: 'runner',
        labelKey: 'turbine',
        path: '/mechanical/labyrinth-health',
        top: '55%',
        left: '35%',
        width: '30%',
        height: '25%',
        detail: {
            funcKey: 'drillDown.runner.func',
            precKey: 'drillDown.runner.prec',
            heritKey: 'drillDown.runner.herit'
        }
    },
    {
        id: 'lube',
        labelKey: 'lubrication',
        path: '/maintenance/shaft-alignment',
        top: '40%',
        left: '42%',
        width: '16%',
        height: '10%',
        detail: {
            funcKey: 'drillDown.lube.func',
            precKey: 'drillDown.lube.prec',
            heritKey: 'drillDown.lube.herit'
        }
    },
    {
        id: 'bypass',
        labelKey: 'bypass',
        path: '/mechanical/hydraulic-maint',
        top: '65%',
        left: '15%',
        width: '15%',
        height: '15%',
        detail: {
            funcKey: 'drillDown.bypass.func',
            precKey: 'drillDown.bypass.prec',
            heritKey: 'drillDown.bypass.herit'
        }
    }
];

export const TurbineVisualNavigator: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [focusedComponent, setFocusedComponent] = useState<Hotspot | null>(null);

    const handleHotspotClick = (hotspot: Hotspot) => {
        setFocusedComponent(hotspot);
    };

    const handleReturn = () => {
        setFocusedComponent(null);
    };

    const handleDeepDiagnostics = (path: string) => {
        navigate(path);
    };

    return (
        <div className="relative w-full aspect-[1184/864] bg-[#0A0F14] rounded-xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-900/10 transition-all duration-700">

            {/* Background SVG Grid / Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#22D3EE 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Master SVG Layer */}
            <motion.div
                animate={{
                    scale: focusedComponent ? 0.85 : 1,
                    opacity: focusedComponent ? 0.3 : 1,
                    filter: focusedComponent ? 'blur(4px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center p-4"
            >
                <div className="relative w-full h-full max-w-5xl">
                    <img
                        src="/Gemini_Generated_Image_pk5hl3pk5hl3pk5h (1).svg"
                        alt="Turbine Blueprint"
                        className="w-full h-full object-contain select-none"
                        draggable={false}
                    />

                    {/* Hotspot Overlays */}
                    {HOTSPOTS.map((hotspot) => (
                        <button
                            key={hotspot.id}
                            onClick={() => handleHotspotClick(hotspot)}
                            onMouseEnter={() => setHoveredZone(hotspot.id)}
                            onMouseLeave={() => setHoveredZone(null)}
                            className="absolute group cursor-pointer"
                            style={{
                                top: hotspot.top,
                                left: hotspot.left,
                                width: hotspot.width,
                                height: hotspot.height,
                            }}
                        >
                            {/* Pulsing Border for Interactive Zone */}
                            <div className={`absolute inset-0 border border-cyan-400/0 rounded-lg group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 transition-all duration-300 ${hoveredZone === hotspot.id ? 'border-cyan-400/50 scale-105' : ''}`} />

                            {/* Tooltip */}
                            <AnimatePresence>
                                {hoveredZone === hotspot.id && !focusedComponent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-cyan-500/50 px-3 py-1.5 rounded shadow-xl pointer-events-none z-50 backdrop-blur-sm"
                                    >
                                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-0.5">
                                            [SYSTEM_IDENTIFIED]
                                        </span>
                                        <span className="text-xs font-bold text-white tracking-wider">
                                            {t(`visual_nav.${hotspot.labelKey}`)}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Drill-Down Overlay */}
            <AnimatePresence>
                {focusedComponent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl bg-[#0F171E] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-3xl flex flex-col md:flex-row"
                        >
                            {/* Detail Drawing Area */}
                            <div className="flex-1 bg-[#05080A] relative flex items-center justify-center border-b md:border-b-0 md:border-r border-cyan-500/10 min-h-[300px]">
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20">
                                        <Settings className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                                        <span className="text-[10px] font-mono text-cyan-400 uppercase">Detail_View: {focusedComponent.id}</span>
                                    </div>
                                </div>

                                {/* Mock Drawing Placeholder */}
                                <div className="w-4/5 aspect-square border border-dashed border-cyan-500/20 rounded-full flex items-center justify-center">
                                    <div className="w-1/2 h-1 bg-cyan-400/20 animate-pulse rounded-full rotate-45" />
                                    <div className="w-1/3 aspect-square border border-cyan-400/10 rounded-full animate-ping" />
                                    <Zap className="w-12 h-12 text-cyan-400/30 absolute opacity-50" />
                                    <span className="absolute bottom-10 text-[9px] font-mono text-cyan-500/40 uppercase tracking-[0.2em]">High_Resolution_Blueprint_Required</span>
                                </div>
                            </div>

                            {/* Technical Card Content */}
                            <div className="w-full md:w-[400px] p-8 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                        {t(`visual_nav.${focusedComponent.labelKey}`)}
                                    </h2>
                                    <div className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded border border-cyan-500/20">
                                        S# {focusedComponent.id.toUpperCase()}-X1
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {/* FUNCTION */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                                            <Cpu className="w-3 h-3" /> {t('visual_nav.drillDown.function')}
                                        </label>
                                        <p className="text-sm text-gray-300 leading-relaxed pl-5 border-l border-cyan-500/20">
                                            {t(`visual_nav.${focusedComponent.detail.funcKey}`)}
                                        </p>
                                    </div>

                                    {/* PRECISION_REQUIREMENT */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                                            <Settings className="w-3 h-3" /> {t('visual_nav.drillDown.precision')}
                                        </label>
                                        <p className="text-sm text-gray-300 leading-relaxed pl-5 border-l border-cyan-500/20">
                                            {t(`visual_nav.${focusedComponent.detail.precKey}`)}
                                        </p>
                                    </div>

                                    {/* HERITAGE_NOTE */}
                                    <div className="space-y-2 bg-cyan-500/5 p-4 rounded-lg border border-cyan-500/10">
                                        <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                            <Info className="w-3 h-3" /> {t('visual_nav.drillDown.heritage')}
                                        </label>
                                        <p className="text-xs text-cyan-200/70 italic leading-relaxed">
                                            "{t(`visual_nav.${focusedComponent.detail.heritKey}`)}"
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={() => handleDeepDiagnostics(focusedComponent.path)}
                                        className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-lg font-bold transition-all transform active:scale-95 group shadow-lg shadow-cyan-500/20"
                                    >
                                        <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        {t('visual_nav.drillDown.deepDiagnostics')}
                                    </button>

                                    <button
                                        onClick={handleReturn}
                                        className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white py-3 rounded-lg text-sm transition-all font-medium border border-white/10 hover:border-white/20"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t('visual_nav.drillDown.return')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Info Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none select-none">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#22D3EE]" />
                        {t('dashboard.topology.digital_twin')}
                    </h3>
                    <p className="text-[10px] font-mono text-cyan-500/50 mt-1 uppercase tracking-widest">
                        Module: Francis_L-250 // PRECISION_BLUEPRINT_NC-4.2
                    </p>
                </div>
                <div className="flex gap-4 items-end flex-col">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
                        Active_View: [ORTHO_TOPOLOGY]
                    </div>
                    <div className="flex gap-1.5 opacity-40">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-3 bg-cyan-500/50 rounded-full" />)}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TurbineVisualNavigator;
