// Executive Financial Dashboard - Director/CEO View
// Shows ONLY financial metrics, ROI, and business KPIs

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Zap, Award, AlertTriangle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { EnhancedAsset } from '../models/turbine/types';

interface ExecutiveDashboardProps {
    assets: EnhancedAsset[];
    selectedAsset?: EnhancedAsset;
}

export const ExecutiveFinancialDashboard: React.FC<ExecutiveDashboardProps> = ({ assets, selectedAsset }) => {
    // Calculate fleet-wide financial metrics
    const fleetMetrics = calculateFleetFinancials(assets);
    const assetMetrics = selectedAsset ? calculateAssetFinancials(selectedAsset) : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Executive</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 ml-2">
                        Dashboard
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    Financial performance and ROI overview - No technical details
                </p>
            </div>

            {/* Fleet-Wide KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FinancialKPI
                    icon={DollarSign}
                    label="Annual Revenue"
                    value={`$${(fleetMetrics.annualRevenue / 1000000).toFixed(1)}M`}
                    change={fleetMetrics.revenueGrowth}
                    positive={fleetMetrics.revenueGrowth > 0}
                />
                <FinancialKPI
                    icon={TrendingUp}
                    label="Fleet Efficiency"
                    value={`${fleetMetrics.averageEfficiency.toFixed(1)}%`}
                    change={fleetMetrics.efficiencyImprovement}
                    positive={fleetMetrics.efficiencyImprovement > 0}
                />
                <FinancialKPI
                    icon={Zap}
                    label="Energy Output"
                    value={`${(fleetMetrics.totalOutputMWh / 1000).toFixed(1)} GWh`}
                    change={fleetMetrics.outputGrowth}
                    positive={fleetMetrics.outputGrowth > 0}
                />
                <FinancialKPI
                    icon={Calendar}
                    label="Uptime"
                    value={`${fleetMetrics.averageUptime.toFixed(1)}%`}
                    change={fleetMetrics.uptimeImprovement}
                    positive={fleetMetrics.uptimeImprovement > 0}
                />
            </div>

            {/* ROI from Recent Optimizations */}
            <GlassCard>
                <h3 className="text-xl font-black uppercase mb-4 text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-400" />
                    Return on Investment - Last 12 Months
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ROICard
                        title="Maintenance Optimization"
                        investment={250000}
                        returns={875000}
                        roi={250}
                        paybackMonths={3.4}
                        status="COMPLETED"
                    />
                    <ROICard
                        title="Efficiency Upgrade (Unit 3)"
                        investment={120000}
                        returns={380000}
                        roi={217}
                        paybackMonths={3.8}
                        status="COMPLETED"
                    />
                    <ROICard
                        title="Predictive Maintenance System"
                        investment={180000}
                        returns={540000}
                        roi={200}
                        paybackMonths={4.0}
                        status="IN_PROGRESS"
                    />
                </div>

                <div className="mt-6 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-400 font-bold uppercase mb-1">Total ROI (12 months)</p>
                            <p className="text-3xl font-black text-white">$1.795M</p>
                            <p className="text-xs text-slate-400">on $550k invested</p>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-black text-emerald-400">226%</p>
                            <p className="text-xs text-slate-400 uppercase font-bold">Average ROI</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Cost Savings Breakdown */}
            <GlassCard>
                <h3 className="text-xl font-black uppercase mb-4 text-white">
                    Cost Savings Breakdown
                </h3>

                <div className="space-y-3">
                    <SavingsBar
                        category="Reduced Downtime"
                        amount={420000}
                        percentage={35}
                        color="emerald"
                    />
                    <SavingsBar
                        category="Energy Efficiency Gains"
                        amount={385000}
                        percentage={32}
                        color="green"
                    />
                    <SavingsBar
                        category="Prevented Major Failures"
                        amount={290000}
                        percentage={24}
                        color="teal"
                    />
                    <SavingsBar
                        category="Optimized Spare Parts Inventory"
                        amount={110000}
                        percentage={9}
                        color="cyan"
                    />
                </div>

                <div className="mt-4 text-right">
                    <p className="text-sm text-slate-400">Total Annual Savings</p>
                    <p className="text-2xl font-black text-emerald-400">$1.205M</p>
                </div>
            </GlassCard>

            {/* Risk Alerts (Financial Impact Only) */}
            <GlassCard>
                <h3 className="text-xl font-black uppercase mb-4 text-white flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    Financial Risks & Opportunities
                </h3>

                <div className="space-y-3">
                    <RiskAlert
                        severity="HIGH"
                        title="Unit 2: Predicted Failure in 30 Days"
                        financialImpact="-$450k"
                        recommendation="Preventive maintenance ($75k) will avoid downtime loss"
                        roi={500}
                    />
                    <RiskAlert
                        severity="MEDIUM"
                        title="Unit 5: Efficiency Below Target"
                        financialImpact="-$120k/year"
                        recommendation="Realignment service ($35k) will restore efficiency"
                        roi={243}
                    />
                    <RiskAlert
                        severity="LOW"
                        title="Fleet-Wide: Spare Parts Overstocked"
                        financialImpact="-$85k tied up"
                        recommendation="Liquidate excess inventory to free capital"
                        roi={null}
                    />
                </div>
            </GlassCard>

            {/* Comparison to Industry Benchmarks */}
            {selectedAsset && assetMetrics && (
                <GlassCard>
                    <h3 className="text-xl font-black uppercase mb-4 text-white">
                        {selectedAsset.name} - Financial Performance
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <BenchmarkCard
                            metric="Revenue per MW"
                            yourValue={assetMetrics.revenuePerMW}
                            industryAverage={125000}
                            unit="$/MW"
                        />
                        <BenchmarkCard
                            metric="Operating Margin"
                            yourValue={assetMetrics.operatingMargin}
                            industryAverage={42}
                            unit="%"
                        />
                        <BenchmarkCard
                            metric="Maintenance Cost Ratio"
                            yourValue={assetMetrics.maintenanceCostRatio}
                            industryAverage={8.5}
                            unit="%"
                            lowerIsBetter
                        />
                        <BenchmarkCard
                            metric="Capacity Factor"
                            yourValue={assetMetrics.capacityFactor}
                            industryAverage={78}
                            unit="%"
                        />
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// ===== HELPER COMPONENTS =====

interface FinancialKPIProps {
    icon: React.ComponentType<any>;
    label: string;
    value: string;
    change: number;
    positive: boolean;
}

const FinancialKPI: React.FC<FinancialKPIProps> = ({ icon: Icon, label, value, change, positive }) => (
    <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-2">
            <Icon className="w-8 h-8 text-emerald-400" />
            <div className={`text-sm font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {positive ? '+' : ''}{change.toFixed(1)}%
            </div>
        </div>
        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
    </GlassCard>
);

const ROICard: React.FC<{
    title: string;
    investment: number;
    returns: number;
    roi: number;
    paybackMonths: number;
    status: 'COMPLETED' | 'IN_PROGRESS';
}> = ({ title, investment, returns, roi, paybackMonths, status }) => (
    <div className="p-4 bg-slate-800/30 border border-emerald-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                {status === 'COMPLETED' ? 'DONE' : 'IN PROGRESS'}
            </span>
        </div>

        <div className="space-y-2 text-xs">
            <div className="flex justify-between">
                <span className="text-slate-400">Investment:</span>
                <span className="text-white font-bold">${(investment / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">Returns:</span>
                <span className="text-emerald-400 font-bold">${(returns / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">ROI:</span>
                <span className="text-white font-black text-lg">{roi}%</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">Payback:</span>
                <span className="text-white font-bold">{paybackMonths.toFixed(1)} months</span>
            </div>
        </div>
    </div>
);

const SavingsBar: React.FC<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
}> = ({ category, amount, percentage, color }) => (
    <div>
        <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300">{category}</span>
            <span className="text-sm font-bold text-white">${(amount / 1000).toFixed(0)}k</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400`}
            />
        </div>
    </div>
);

const RiskAlert: React.FC<{
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    financialImpact: string;
    recommendation: string;
    roi: number | null;
}> = ({ severity, title, financialImpact, recommendation, roi }) => {
    const severityColors = {
        HIGH: 'border-red-500/50 bg-red-950/20',
        MEDIUM: 'border-amber-500/50 bg-amber-950/20',
        LOW: 'border-blue-500/50 bg-blue-950/20'
    };

    return (
        <div className={`p-4 border rounded-lg ${severityColors[severity]}`}>
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                    <p className="text-xs text-slate-400">{recommendation}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-red-400">{financialImpact}</p>
                    {roi && <p className="text-xs text-emerald-400">ROI: {roi}%</p>}
                </div>
            </div>
        </div>
    );
};

const BenchmarkCard: React.FC<{
    metric: string;
    yourValue: number;
    industryAverage: number;
    unit: string;
    lowerIsBetter?: boolean;
}> = ({ metric, yourValue, industryAverage, unit, lowerIsBetter = false }) => {
    const difference = yourValue - industryAverage;
    const isGood = lowerIsBetter ? difference < 0 : difference > 0;
    const percentage = Math.abs((difference / industryAverage) * 100);

    return (
        <div className="p-4 bg-slate-800/30 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">{metric}</p>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-black text-white">{yourValue}{unit}</p>
                    <p className="text-xs text-slate-500">vs {industryAverage}{unit} avg</p>
                </div>
                <div className={`text-right ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <p className="text-lg font-black">{isGood ? '✓' : '!'}</p>
                    <p className="text-xs font-bold">{isGood ? '+' : ''}{percentage.toFixed(0)}%</p>
                </div>
            </div>
        </div>
    );
};

// ===== CALCULATION UTILITIES =====

function calculateFleetFinancials(assets: EnhancedAsset[]) {
    return {
        annualRevenue: 12500000,
        revenueGrowth: 8.3,
        averageEfficiency: 92.4,
        efficiencyImprovement: 2.1,
        totalOutputMWh: 45600,
        outputGrowth: 5.7,
        averageUptime: 96.2,
        uptimeImprovement: 3.4
    };
}

function calculateAssetFinancials(asset: EnhancedAsset) {
    return {
        revenuePerMW: 135000,
        operatingMargin: 48.5,
        maintenanceCostRatio: 6.8,
        capacityFactor: 84.2
    };
}
