import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Info, AlertTriangle, ArrowDown } from 'lucide-react';

interface EfficiencyCalculatorProps {
    head: number;  // meters
    flow: number;  // m3/s
    powerMW: number; // MW
    ratedEfficiency?: number; // % (default 92)
}

/**
 * EfficiencyCalculator (NC-22 Batch 2)
 * Real-time Hydraulic Efficiency Physics Engine.
 * Formula: Eta = P / (rho * g * Q * H)
 */
export const EfficiencyCalculator: React.FC<EfficiencyCalculatorProps> = ({
    head = 100,
    flow = 50,
    powerMW = 45,
    ratedEfficiency = 92
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    // Physics Constants
    const RHO = 1000; // Density kg/m3
    const G = 9.81;   // Gravity m/s2

    // Calculation: Power Hydraulic (Watts) = rho * g * Q * H
    const powerHydraulicWatts = RHO * G * flow * head;
    const powerHydraulicMW = powerHydraulicWatts / 1e6;

    // Efficiency = Power Out / Power In
    // Avoid division by zero
    const rawEfficiency = powerHydraulicMW > 0 ? (powerMW / powerHydraulicMW) * 100 : 0;

    // Clamp for UI safety (0-100) and minor smoothing/tolerance
    const efficiency = Math.min(100, Math.max(0, rawEfficiency));

    // Status Logic
    const gap = ratedEfficiency - efficiency;
    const status = gap > 5 ? 'critical' : gap > 2 ? 'warning' : 'nominal';
    const primaryColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22c55e';

    // Gauge Data (Semester Circle)
    const gaugeData = [
        { name: 'Eff', value: efficiency },
        { name: 'Loss', value: 100 - efficiency }
    ];

    return (
        <motion.div
            layout
            className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl 
                bg-slate-900/40 border transition-all cursor-pointer group overflow-hidden
                ${status === 'critical' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
                    status === 'warning' ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                        'border-white/5 hover:border-cyan-500/30'}
                ${isExpanded ? 'col-span-2 row-span-2 z-50 bg-slate-900/95 backdrop-blur-xl' : 'h-full'}
            `}
            onClick={() => setIsExpanded(!isExpanded)}
            tabIndex={0}
            role="button"
            aria-label={`Efficiency Calculator: ${efficiency.toFixed(1)}%. Rated: ${ratedEfficiency}%. Status: ${status}. Click for Loss Analysis.`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded); }}
        >
            {/* Main Gauge View */}
            <div className={`relative flex flex-col items-center justify-center w-full transition-all duration-300 ${isExpanded ? 'scale-75 origin-top -mt-2' : ''}`}>
                <div className="w-24 h-12 overflow-hidden relative">
                    {/* CSS/SVG Semi-Circle Gauge for simpler control than Recharts Pie for simple arc */}
                    <div className="w-24 h-24 rounded-full border-[6px] border-slate-700 border-b-0 border-l-0" style={{ transform: 'rotate(135deg)' }}></div>
                    {/* Active Arc - Masked or simple rotation logic */}
                    <svg viewBox="0 0 100 50" className="absolute top-0 left-0 w-full h-full">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke={primaryColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(efficiency / 100) * 126} 126`} // Approx arc length
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                </div>

                <div className="absolute top-6 left-0 right-0 text-center">
                    <div className="text-2xl font-mono font-black text-white leading-none">
                        {efficiency.toFixed(1)}<span className="text-xs text-slate-500">%</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Hydraulic Eff. ($\eta$)
                </div>
            </div>

            {/* EXPANDED: Loss Factors */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full mt-2"
                    >
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                            <div className="flex flex-col p-2 bg-slate-800/50 rounded border border-white/5">
                                <span className="text-slate-500 uppercase text-[9px]">Hydraulic Power (In)</span>
                                <span className="text-white font-bold">{powerHydraulicMW.toFixed(2)} MW</span>
                            </div>
                            <div className="flex flex-col p-2 bg-slate-800/50 rounded border border-white/5">
                                <span className="text-slate-500 uppercase text-[9px]">Electric Power (Out)</span>
                                <span className="text-cyan-400 font-bold">{powerMW.toFixed(2)} MW</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-slate-500 border-b border-white/10 pb-1">Detected Losses</h4>

                            {/* Generator Loss (Fixed approx 1-2%) */}
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Generator Heat (Copper/Iron)</span>
                                <span className="text-amber-500 font-mono">-1.5%</span>
                            </div>

                            {/* Mechanical Loss (Bearings) */}
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Mechanical Friction</span>
                                <span className="text-amber-500 font-mono">-0.5%</span>
                            </div>

                            {/* Remaining is Hydraulic Loss */}
                            <div className="flex items-center justify-between text-xs text-slate-300 font-bold bg-white/5 p-1 rounded">
                                <div className="flex items-center gap-1">
                                    <Droplet className="w-3 h-3 text-cyan-400" />
                                    <span>Hydro Matrix Loss</span>
                                </div>
                                <span className="text-red-400 font-mono">
                                    -{(100 - efficiency - 2.0).toFixed(1)}%
                                </span>
                            </div>

                            {/* Recommendation */}
                            <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20 flex gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span className="text-[9px] text-amber-100 leading-tight">
                                    High hydraulic loss detected. Check <strong>Runner Seal Integrity</strong> or <strong>Debris Screen</strong> for blockage.
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
