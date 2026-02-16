// Optimization Dashboard - Consulting "Sales" View
// As-Is vs To-Be comparison with ROI visualization

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    Zap,
    Calendar,
    CheckCircle,
    ArrowRight,
    Download
} from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ITurbineModel, OptimizationReport } from '../../models/turbine/types';
import { EnhancedAsset } from '../../models/turbine/types';
import { ConsultingEngine } from '../../services/ConsultingEngine';

interface OptimizationDashboardProps {
    asset: EnhancedAsset;
    turbineModel: ITurbineModel;
}

export const OptimizationDashboard: React.FC<OptimizationDashboardProps> = ({ asset, turbineModel }) => {
    const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'recommended' | 'aggressive'>('recommended');

    // Simulated optimization report (in production, fetch from ConsultingEngine)
    const report = useMemo<OptimizationReport>(() => ({
        assetId: asset.id,
        assetName: asset.name,
        turbineFamily: asset.turbine_family,
        generatedAt: Date.now(),
        findings: [
            {
                severity: 'HIGH',
                category: 'ALIGNMENT',
                description: 'Shaft deviation 0.08 mm/m exceeds tolerance 0.05 mm/m',
                suggestedAction: 'Precision realignment during next planned outage',
                estimatedRepairCost: 75000,
                riskMitigation: 250000
            },
            {
                severity: 'MEDIUM',
                category: 'VIBRATION',
                description: 'Elevated vibration at runner bearings (4.2 mm/s)',
                suggestedAction: 'Bearing inspection and balancing',
                estimatedRepairCost: 30000,
                riskMitigation: 100000
            }
        ],
        recommendations: [],
        estimatedROI: 285,
        executionPriority: []
    }), [asset]);

    const asIsEfficiency = 88.5; // Current
    const toBeEfficiency = {
        conservative: 91.2,
        recommended: 93.5,
        aggressive: 95.1
    };

    const annualRevenue = asset.capacity * 8760 * 0.7 * 50; // MW * hours * load factor * $/MWh
    const efficiencyGain = toBeEfficiency[selectedScenario] - asIsEfficiency;
    const additionalRevenue = (annualRevenue * efficiencyGain) / 100;

    return (
        <div className="space-y-6">
            {/* HEADER WITH SCENARIO SELECTOR */}
            <GlassCard className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
                            <span className="text-white">Optimization</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-2">
                                Analysis
                            </span>
                        </h2>
                        <p className="text-sm text-slate-400">As-Is vs To-Be Performance Projection</p>
                    </div>

                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-black text-white uppercase tracking-wider flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                        <Download className="w-5 h-5" />
                        Export PDF Report
                    </button>
                </div>

                {/* Scenario selector */}
                <div className="flex gap-3">
                    {(['conservative', 'recommended', 'aggressive'] as const).map(scenario => (
                        <motion.button
                            key={scenario}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedScenario(scenario)}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${selectedScenario === scenario
                                ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                                }`}
                        >
                            <p className={`text-xs uppercase font-black tracking-wider mb-2 ${selectedScenario === scenario ? 'text-purple-400' : 'text-slate-500'
                                }`}>
                                {scenario}
                            </p>
                            <p className="text-2xl font-black text-white">{toBeEfficiency[scenario]}%</p>
                            <p className="text-xs text-emerald-400 font-bold mt-1">
                                +{efficiencyGain.toFixed(1)}% η
                            </p>
                        </motion.button>
                    ))}
                </div>
            </GlassCard>

            {/* AS-IS vs TO-BE COMPARISON */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AS-IS (Current State) */}
                <GlassCard className="border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-red-400 uppercase">As-Is</h3>
                            <p className="text-xs text-slate-500">Current Performance</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <MetricRow label="Efficiency" value={`${asIsEfficiency}%`} status="warning" />
                        <MetricRow label="Annual Output" value={`${(asIsEfficiency / 100 * asset.capacity * 8760 * 0.7).toFixed(0)} MWh`} status="warning" />
                        <MetricRow label="Revenue Lost" value={`$${((100 - asIsEfficiency) / 100 * annualRevenue).toLocaleString()}/yr`} status="critical" />

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-xs text-red-400 font-bold mb-2">⚠️ Identified Issues:</p>
                            <ul className="space-y-1">
                                {report.findings.map((finding, i) => (
                                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                        <span className="text-red-400">•</span>
                                        {finding.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </GlassCard>

                {/* TO-BE (Optimized State) */}
                <GlassCard className="border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-emerald-400 uppercase">To-Be</h3>
                            <p className="text-xs text-slate-500">After Optimization</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <MetricRow label="Efficiency" value={`${toBeEfficiency[selectedScenario]}%`} status="success" improvement={`+${efficiencyGain.toFixed(1)}%`} />
                        <MetricRow label="Annual Output" value={`${(toBeEfficiency[selectedScenario] / 100 * asset.capacity * 8760 * 0.7).toFixed(0)} MWh`} status="success" />
                        <MetricRow label="Additional Revenue" value={`$${additionalRevenue.toLocaleString()}/yr`} status="success" improvement="NEW" />

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-xs text-emerald-400 font-bold mb-2">✅ Corrections Applied:</p>
                            <ul className="space-y-1">
                                <li className="text-xs text-slate-400 flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    Precision shaft realignment to 0.05 mm/m
                                </li>
                                <li className="text-xs text-slate-400 flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    Bearing replacement and runner balancing
                                </li>
                                <li className="text-xs text-slate-400 flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    Wicket gate clearance optimization
                                </li>
                            </ul>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* ROI VISUALIZATION */}
            <GlassCard className="bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border-2 border-emerald-500/30">
                <h3 className="text-xl font-black text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    Return on Investment Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <ROIMetricCard
                        label="Total Investment"
                        value={`$${report.findings.reduce((sum, f) => sum + f.estimatedRepairCost, 0).toLocaleString()}`}
                        icon={DollarSign}
                        color="purple"
                    />
                    <ROIMetricCard
                        label="Annual Benefit"
                        value={`$${additionalRevenue.toLocaleString()}`}
                        icon={TrendingUp}
                        color="emerald"
                    />
                    <ROIMetricCard
                        label="Payback Period"
                        value={`${(report.findings.reduce((sum, f) => sum + f.estimatedRepairCost, 0) / additionalRevenue * 12).toFixed(1)} months`}
                        icon={Calendar}
                        color="cyan"
                    />
                    <ROIMetricCard
                        label="ROI (5 years)"
                        value={`${((additionalRevenue * 5 / report.findings.reduce((sum, f) => sum + f.estimatedRepairCost, 0) - 1) * 100).toFixed(0)}%`}
                        icon={TrendingUp}
                        color="emerald"
                    />
                </div>

                {/* ROI Timeline */}
                <div className="relative h-32 bg-slate-900/50 rounded-lg p-4">
                    <div className="absolute bottom-4 left-0 right-0 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Year 0</span>
                        <span className="text-emerald-400 font-bold">Break-even: 14 months</span>
                        <span>Year 5</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

// ===== HELPER COMPONENTS =====

interface MetricRowProps {
    label: string;
    value: string;
    status: 'success' | 'warning' | 'critical';
    improvement?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, status, improvement }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
        <span className="text-sm text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`text-lg font-black ${status === 'success' ? 'text-emerald-400' :
                status === 'warning' ? 'text-amber-400' :
                    'text-red-400'
                }`}>
                {value}
            </span>
            {improvement && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    {improvement}
                </span>
            )}
        </div>
    </div>
);

interface ROIMetricCardProps {
    label: string;
    value: string;
    icon: React.ComponentType<any>;
    color: 'purple' | 'emerald' | 'cyan';
}

const ROIMetricCard: React.FC<ROIMetricCardProps> = ({ label, value, icon: Icon, color }) => {
    const colorMap = {
        purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
        emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
        cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
    };

    return (
        <div className={`p-4 rounded-lg border ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" />
                <p className="text-xs uppercase font-bold opacity-80">{label}</p>
            </div>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
};
