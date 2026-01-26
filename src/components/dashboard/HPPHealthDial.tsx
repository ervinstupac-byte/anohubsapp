/**
 * HPPHealthDial Component
 * Animated circular gauge with dynamic color-coded health scoring
 */

import React from 'react';
import { motion } from 'framer-motion';

interface HPPHealthDialProps {
    healthScore: number;  // 0-100
    breakdown: {
        thermal: number;
        mechanical: number;
        hydraulic: number;
        sensory: number;
    };
}

export const HPPHealthDial: React.FC<HPPHealthDialProps> = ({ healthScore, breakdown }) => {
    // Color mapping: 90-100% Emerald, 70-89% Gold, <70% Red
    const getColor = (score: number): string => {
        if (score >= 90) return '#10b981';  // Emerald green
        if (score >= 70) return '#f59e0b';  // Gold yellow
        return '#ef4444';  // Alarm red
    };

    // Circle stroke animation
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    const mainColor = getColor(healthScore);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-6">Asset Health</h3>

            <div className="relative w-80 h-80 mx-auto">
                <svg viewBox="0 0 300 300" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="30"
                    />

                    {/* Animated health circle */}
                    <motion.circle
                        cx="150"
                        cy="150"
                        r={radius}
                        fill="none"
                        stroke={mainColor}
                        strokeWidth="30"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        className="text-7xl font-bold"
                        style={{ color: mainColor }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                    >
                        {healthScore}
                    </motion.div>
                    <div className="text-2xl text-slate-400 mt-2">Health Score</div>
                    <div className="text-sm text-slate-500 mt-1">
                        {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Critical'}
                    </div>
                </div>
            </div>

            {/* Breakdown bars */}
            <div className="mt-6 space-y-3">
                {Object.entries(breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                        <span className="w-24 text-sm capitalize text-slate-400">{key}</span>
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: getColor(value) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />
                        </div>
                        <span className="w-12 text-sm text-right text-white font-mono">{value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
