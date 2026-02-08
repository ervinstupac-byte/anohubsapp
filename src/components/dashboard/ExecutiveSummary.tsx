import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Activity, TrendingUp, ShieldCheck, PieChart, ArrowUpRight } from 'lucide-react';
import { ExecutiveReportService, CEOInsight } from '../../lib/analytics/ExecutiveReportService';

// Mock Fleet Data (Synced with FleetOverview)
const FLEET_DATA_MOCK = [
    { id: 'UNIT-01', status: 'OPTIMAL' },
    { id: 'UNIT-02', status: 'DRIFT_WARNING' },
    { id: 'UNIT-03', status: 'OPTIMAL' },
    { id: 'UNIT-04', status: 'OPTIMAL' },
    { id: 'UNIT-05', status: 'ATTENTION' },
    { id: 'UNIT-06', status: 'BORN_PERFECT' },
];

export const ExecutiveSummary: React.FC = () => {
    const service = useMemo(() => new ExecutiveReportService(), []);

    // State
    const [healthScore, setHealthScore] = useState(0);
    const [avoidedCost, setAvoidedCost] = useState(0);
    const [insights, setInsights] = useState<CEOInsight[]>([]);

    useEffect(() => {
        // 1. Calculate Health
        const score = service.calculateFleetHealth(FLEET_DATA_MOCK);
        setHealthScore(score);

        // 2. Simulate Risks & ROI
        // In a real app, we'd pull detection history. Here we simulate typical monthly catch.
        const mockDiagnoses = [
            { cause: 'Dynamic Shaft Misalignment', severity: 'WARNING' },
            { cause: 'Hydraulic Cavitation (Gravel Noise)', severity: 'WATCH' }
        ];
        // Combine with Drift Value
        // drift loss (Unit 2) is a NEGATIVE value, so "Avoided Cost" is the value of the REST of the fleet being perfect.
        // Let's frame it as "System Value Delivered" = (Prevented Outages + Efficiency Gains)
        const activeProtections = service.estimateAvoidedCost(mockDiagnoses as any);
        setAvoidedCost(activeProtections + 450000); // Adding the Efficiency Gain value

        // 3. Generate Insights
        const generated = service.generateCEOInsights(FLEET_DATA_MOCK, mockDiagnoses as any);
        setInsights(generated);

    }, [service]);

    return (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-8 shadow-2xl overflow-hidden relative">

            {/* Background Flair */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-end mb-12 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <PieChart className="text-cyan-500" /> Executive Analytics
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-2 uppercase tracking-widest pl-1">
                        NC-210 // SOVEREIGN FLEET REPORT
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-mono font-bold text-white tracking-tighter">
                        {healthScore}/100
                    </div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mt-1">
                        Fleet Health Score
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

                {/* 1. The ROI Counter */}
                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expected Annual Savings</span>
                    </div>
                    <div className="mt-8">
                        <div className="text-3xl font-black text-white flex items-baseline gap-1">
                            €{(avoidedCost).toLocaleString()}
                        </div>
                        <p className="text-xs text-emerald-500/80 mt-2 font-medium flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> ROI &gt; 850% vs System Cost
                        </p>
                    </div>
                </div>

                {/* 2. Active Protections */}
                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl flex flex-col justify-between group hover:border-cyan-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-cyan-900/20 border border-cyan-500/20 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Guardians</span>
                    </div>
                    <div className="mt-8">
                        <div className="text-3xl font-black text-white">
                            148 / 148
                        </div>
                        <p className="text-xs text-slate-400/80 mt-2 font-medium">
                            Sensors & Logic Nodes Online
                        </p>
                    </div>
                </div>

                {/* 3. CEO Insight Ticker */}
                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sovereign Insight</span>
                    </div>

                    <div className="flex-1 flex items-center">
                        {/* @ts-ignore */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={insights[0]?.id || 'loading'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm text-slate-300 font-medium italic leading-relaxed"
                            >
                                "{insights[0]?.message || 'Analyzing fleet metrics...'}"
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Progress Bar for Ticker */}
                    <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            className="h-full bg-amber-500"
                        />
                    </div>
                </div>

            </div>

            {/* Bottom Chart Mockup */}
            <div className="mt-8 p-6 bg-slate-900/30 border border-slate-800 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cumulative Value Delivered (YTD)</h4>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>

                {/* Simple Bar Visualization */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="w-24 text-slate-500 text-right">System Cost</span>
                        <div className="h-4 bg-slate-700 rounded w-[15%]" />
                        <span className="text-slate-400">€54k</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="w-24 text-slate-500 text-right">Value Saved</span>
                        <div className="h-4 bg-gradient-to-r from-emerald-600 to-cyan-500 rounded w-[85%]" />
                        <span className="text-emerald-400 font-bold">€{(avoidedCost).toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
