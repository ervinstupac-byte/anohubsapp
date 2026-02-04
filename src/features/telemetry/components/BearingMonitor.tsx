import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Gauge, Maximize2, Minimize2, Thermometer, TrendingUp } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface BearingMonitorProps {
    temperature: number;
    powerMW?: number; // Optional, defaults to 0 if not provided
    maxTemp?: number;
    ambientTemp?: number;
}

/**
 * BearingMonitor (NC-22 Batch 2)
 * Visualizes the thermal relationship between Bearing Temperature and Power Load.
 * Formula: T_rise is proportional to P^2.
 */
export const BearingMonitor: React.FC<BearingMonitorProps> = ({
    temperature,
    powerMW = 0,
    maxTemp = 75,
    ambientTemp = 25
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    // Thermal Model: T = T_ambient + k * P^2
    // Calibration: @ 15MW -> 70C (Delta 45C) => k = 45 / 225 = 0.2
    const modelK = 0.2;
    const expectedTemp = ambientTemp + (modelK * Math.pow(powerMW, 2));
    const deviation = temperature - expectedTemp;

    // Generate Correlation Curve Data
    const curveData = useMemo(() => {
        const data = [];
        for (let p = 0; p <= 16; p += 1) {
            data.push({ x: p, y: ambientTemp + (modelK * Math.pow(p, 2)) });
        }
        return data;
    }, [ambientTemp, modelK]);

    const currentPoint = [{ x: powerMW, y: temperature }];

    // Status Determination
    const status = temperature > maxTemp ? 'critical' : temperature > maxTemp * 0.85 ? 'warning' : 'nominal';
    const statusColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22c55e'; // Red, Amber, Green

    return (
        <motion.div
            layout
            className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl 
                bg-slate-900/40 border transition-colors cursor-pointer group
                ${status === 'critical' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
                    status === 'warning' ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                        'border-white/5 hover:border-cyan-500/30'}
                ${isExpanded ? 'col-span-2 row-span-2 z-50 bg-slate-900/95 backdrop-blur-xl' : 'h-full'}
            `}
            onClick={() => setIsExpanded(!isExpanded)}
            tabIndex={0}
            role="button"
            aria-label={`Bearing Monitor: ${temperature.toFixed(1)}°C. Status: ${status}. Click to ${isExpanded ? 'collapse' : 'expand'} thermal analysis.`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded); }}
        >
            {/* Header / Mini View */}
            <div className="flex flex-col items-center w-full">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isExpanded ? <Minimize2 className="w-4 h-4 text-slate-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
                </div>

                <div className={`transition-all duration-300 ${isExpanded ? 'scale-75 origin-top mb-4' : ''}`}>
                    <Gauge className={`w-8 h-8 mx-auto mb-2 ${status === 'critical' ? 'text-red-500' : status === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <div className="text-3xl font-mono font-black text-white text-center">
                        {temperature.toFixed(1)} <span className="text-sm font-sans font-bold text-slate-500">°C</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-1">
                        Bearing Temp
                    </div>
                </div>
            </div>

            {/* EXPANDED: Correlation View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full mt-4"
                    >
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis
                                        type="number"
                                        dataKey="x"
                                        name="Power"
                                        unit="MW"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        tickLine={false}
                                        domain={[0, 16]}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="y"
                                        name="Temp"
                                        unit="°C"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        tickLine={false}
                                        domain={[20, 100]}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    {/* Theoretical Curve */}
                                    <Scatter name="Model" data={curveData} line={{ stroke: '#06b6d4', strokeWidth: 2 }} shape={() => <></>} legendType="none" />

                                    {/* Current Point */}
                                    <Scatter name="Current" data={currentPoint} fill={statusColor}>
                                        <TrendingUp className="w-4 h-4" />
                                    </Scatter>

                                    <ReferenceLine y={maxTemp} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'TRIP', fill: '#ef4444', fontSize: 10 }} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
                            <div className="p-3 rounded bg-slate-800/50 border border-white/5">
                                <div className="text-slate-500 uppercase">Model Expectation</div>
                                <div className="text-cyan-400 font-bold text-lg">{expectedTemp.toFixed(1)} °C</div>
                            </div>
                            <div className="p-3 rounded bg-slate-800/50 border border-white/5">
                                <div className="text-slate-500 uppercase">Deviation</div>
                                <div className={`${Math.abs(deviation) > 5 ? 'text-amber-400' : 'text-emerald-400'} font-bold text-lg`}>
                                    {deviation > 0 ? '+' : ''}{deviation.toFixed(1)} °C
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/20 flex gap-3 text-left">
                            <Thermometer className="w-5 h-5 text-blue-400 shrink-0" />
                            <div>
                                <h4 className="text-blue-400 font-bold text-xs uppercase mb-1">Thermal Physics Logic</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Temperature rise ($\Delta T$) is proportional to square of Power Load ($P^2$).
                                    Significant positive deviation indicates cooling inefficiency or oil degradation.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
