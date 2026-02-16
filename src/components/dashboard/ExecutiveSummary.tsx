import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, Activity, TrendingUp, ShieldCheck, PieChart, ArrowUpRight } from 'lucide-react';
import { ExecutiveReportService, CEOInsight } from '../../lib/analytics/ExecutiveReportService';

// Simulated Fleet Data (Synced with FleetOverview)
const FLEET_DATA_SIMULATION = [
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
        const score = service.calculateFleetHealth(FLEET_DATA_SIMULATION);
        setHealthScore(score);

        // 2. Simulate Risks & ROI
        // In a real app, we'd pull detection history. Here we simulate typical monthly catch.
        const simulatedDiagnoses = [
            { cause: 'Dynamic Shaft Misalignment', severity: 'WARNING' },
            { cause: 'Hydraulic Cavitation (Gravel Noise)', severity: 'WATCH' }
        ];
        // Combine with Drift Value
        // drift loss (Unit 2) is a NEGATIVE value, so "Avoided Cost" is the value of the REST of the fleet being perfect.
        // Let's frame it as "System Value Delivered" = (Prevented Outages + Efficiency Gains)
        const activeProtections = service.estimateAvoidedCost(simulatedDiagnoses as any);
        setAvoidedCost(activeProtections + 450000); // Adding the Efficiency Gain value

        // 3. Generate Insights
        const generated = service.generateCEOInsights(FLEET_DATA_SIMULATION, simulatedDiagnoses as any);
        setInsights(generated);

    }, [service]);

    return (
        <div className="bg-scada-panel border border-scada-border rounded-sm p-8 shadow-scada-card relative overflow-hidden">

            <div className="flex justify-between items-end mb-12 relative z-10">
                <div>
                    <h2 className="text-3xl font-bold text-scada-text tracking-tight flex items-center gap-3 font-header">
                        <PieChart className="text-status-info" /> Executive Analytics
                    </h2>
                    <p className="text-xs text-scada-muted font-mono mt-2 uppercase tracking-widest pl-1">
                        NC-210 // SOVEREIGN FLEET REPORT
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-mono font-bold text-scada-text tracking-tighter tabular-nums">
                        {healthScore}/100
                    </div>
                    <span className="text-xs font-bold text-status-ok uppercase tracking-widest block mt-1">
                        Fleet Health Score
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

                {/* 1. The ROI Counter */}
                <div className="bg-scada-bg border border-scada-border p-6 rounded-sm flex flex-col justify-between hover:border-status-ok/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-status-ok/10 border border-status-ok/20 rounded-sm">
                            <DollarSign className="w-6 h-6 text-status-ok" />
                        </div>
                        <span className="text-[10px] text-scada-muted font-bold uppercase tracking-widest">Expected Annual Savings</span>
                    </div>
                    <div className="mt-8">
                        <div className="text-3xl font-black text-scada-text flex items-baseline gap-1 font-mono tabular-nums">
                            €{(avoidedCost).toLocaleString()}
                        </div>
                        <p className="text-xs text-status-ok/80 mt-2 font-medium flex items-center gap-1 font-mono">
                            <ArrowUpRight className="w-3 h-3" /> ROI &gt; 850% vs System Cost
                        </p>
                    </div>
                </div>

                {/* 2. Active Protections */}
                <div className="bg-scada-bg border border-scada-border p-6 rounded-sm flex flex-col justify-between hover:border-status-info/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-status-info/10 border border-status-info/20 rounded-sm">
                            <ShieldCheck className="w-6 h-6 text-status-info" />
                        </div>
                        <span className="text-[10px] text-scada-muted font-bold uppercase tracking-widest">Active Guardians</span>
                    </div>
                    <div className="mt-8">
                        <div className="text-3xl font-black text-scada-text font-mono tabular-nums">
                            148 / 148
                        </div>
                        <p className="text-xs text-scada-muted/80 mt-2 font-medium font-mono">
                            Sensors & Logic Nodes Online
                        </p>
                    </div>
                </div>

                {/* 3. CEO Insight Ticker */}
                <div className="bg-scada-bg border border-scada-border p-6 rounded-sm flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-status-warning" />
                        <span className="text-[10px] text-scada-muted font-bold uppercase tracking-widest">Sovereign Insight</span>
                    </div>

                    <div className="flex-1 flex items-center">
                        <div
                            className="text-sm text-scada-text font-medium italic leading-relaxed font-mono"
                        >
                            "{insights[0]?.message || 'Analyzing fleet metrics...'}"
                        </div>
                    </div>

                    {/* Progress Bar for Ticker */}
                    <div className="absolute bottom-0 left-0 h-1 bg-status-warning/20 w-full">
                        <div
                            className="h-full bg-status-warning animate-[pulse_8s_linear_infinite]"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

            </div>

            {/* Bottom Chart Simulatedup */}
            <div className="mt-8 p-6 bg-scada-bg border border-scada-border rounded-sm">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-bold text-scada-muted uppercase tracking-widest">Cumulative Value Delivered (YTD)</h4>
                    <TrendingUp className="w-4 h-4 text-status-ok" />
                </div>

                {/* Simple Bar Visualization */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="w-24 text-scada-muted text-right">System Cost</span>
                        <div className="h-4 bg-scada-panel border border-scada-border rounded-sm w-[15%]" />
                        <span className="text-scada-muted">€54k</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="w-24 text-scada-muted text-right">Value Saved</span>
                        <div className="h-4 bg-status-ok rounded-sm w-[85%]" />
                        <span className="text-status-ok font-bold">€{(avoidedCost).toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
