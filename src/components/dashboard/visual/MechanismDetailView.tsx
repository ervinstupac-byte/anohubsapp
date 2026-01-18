import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Settings,
    ShieldCheck,
    Zap,
    Droplets,
    Activity,
    ChevronLeft,
    ZoomIn,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

/**
 * NC-9.0 MECHANISM DETAIL VIEW
 * Focus: Labyrinth Seals, Distributor Linkage, Shaft Sealing
 */

interface MechanismPoint {
    id: string;
    label: string;
    data: string;
    note: string;
    x: number;
    y: number;
}

const MECHANISM_POINTS: MechanismPoint[] = [
    {
        id: 'mech-sealing',
        label: 'Shaft Sealing',
        data: 'Leakage: 3.2 L/min',
        note: 'Carbon rings showing normal wear patterns.',
        x: 400,
        y: 350
    },
    {
        id: 'mech-labyrinth',
        label: 'Labyrinth Seals',
        data: 'Clearance: 0.35 mm',
        note: 'Gap within tolerance (0.2 - 0.4 mm).',
        x: 600,
        y: 450
    },
    {
        id: 'mech-linkage',
        label: 'Distributor Linkage',
        data: 'Servo Hysteresis: 0.05%',
        note: 'Bushings greased 24h ago.',
        x: 500,
        y: 600
    }
];

const MechanismDetailView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [svgContent, setSvgContent] = useState<string>('');
    const [hoveredPoint, setHoveredPoint] = useState<MechanismPoint | null>(null);

    useEffect(() => {
        fetch('/mechanism-intermediate.svg')
            .then(res => res.text())
            .then(data => {
                // Determine if we need to clean up IDs or just inject
                // For now, raw injection is fine, but we'll add click handlers dynamically
                setSvgContent(data);
            })
            .catch(err => console.error("Failed to load mechanism SVG", err));
    }, []);

    return (
        <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed inset-0 z-50 bg-[#020617] flex"
        >
            {/* Sidebar / HUD */}
            <div className="w-1/3 h-full border-r border-cyan-900/30 p-8 flex flex-col justify-between bg-gradient-to-r from-[#020617] to-cyan-950/20 backdrop-blur-xl">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-12 group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                        <span className="font-bold uppercase tracking-widest text-sm">Return to Topology</span>
                    </button>

                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        Mechanism <span className="text-cyan-500">Detail</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-mono mb-8">
                        INTERMEDIATE SHAFT & DISTRIBUTOR ASSEMBLY
                    </p>

                    <GlassCard className="border-cyan-500/30">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <ShieldCheck className="w-6 h-6 text-cyan-400 mt-1" />
                                <div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">{t('francis.mechanism.shaftSealing', 'Shaft Sealing')}</h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {t('francis.mechanism.shaftSealingDesc', 'Active sealing prevents water ingress into the bearing housing. Currently operating at optimal pressure.')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Settings className="w-6 h-6 text-amber-400 mt-1" />
                                <div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">{t('francis.mechanism.linkage', 'Distributor Linkage')}</h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {t('francis.mechanism.linkageDesc', 'Mechanical linkage converting servo linear motion to guide vane rotation.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Live Data Panel */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Live Diagnostics
                    </h3>
                    {MECHANISM_POINTS.map((point) => (
                        <div
                            key={point.id}
                            className={`p-4 rounded border transition-all duration-300 ${hoveredPoint?.id === point.id
                                ? 'bg-cyan-900/40 border-cyan-500/50 scale-105'
                                : 'bg-slate-900/40 border-slate-800'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-cyan-400 font-bold uppercase text-xs">{point.label}</span>
                                <span className="text-slate-500 text-[10px] font-mono">{point.id}</span>
                            </div>
                            <div className="text-white font-mono text-sm">{point.data}</div>
                            <div className="text-slate-400 text-[10px] italic mt-1">"{point.note}"</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SVG Interactive Area */}
            <div className="flex-1 relative bg-[url('/grid.svg')] bg-repeat opacity-90 overflow-hidden cursor-crosshair">
                <div
                    className="w-full h-full flex items-center justify-center p-12"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />

                {/* Overlay Hotspots (Mapped relative to container for now, or use SVG coods if we parse) */}
                {/* For this MVP, we will try to rely on SVG internal IDs if they exist, OR overlay absolute divs if we know ratios. 
                    Given the request, we'll assume the SVG renders fully. We can add overlay dots. */}

                {MECHANISM_POINTS.map((point) => (
                    <motion.div
                        key={point.id}
                        className="absolute w-6 h-6 rounded-full border-2 border-cyan-500 bg-cyan-900/50 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20 flex items-center justify-center"
                        style={{ left: point.x, top: point.y }} // Simple absolute positioning for now - user might need to calibrate
                        whileHover={{ scale: 1.5, backgroundColor: 'rgba(34,211,238,0.2)' }}
                        onHoverStart={() => setHoveredPoint(point)}
                        onHoverEnd={() => setHoveredPoint(null)}
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default MechanismDetailView;
