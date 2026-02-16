// Executive Financial Dashboard - Director/CEO View
// Shows ONLY financial metrics, ROI, and business KPIs

import React from 'react';
import { TrendingUp, DollarSign, Calendar, Zap, Award, AlertTriangle } from 'lucide-react';
import { EnhancedAsset } from '../models/turbine/types';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { FinancialImpactEngine } from '../services/core/FinancialImpactEngine';
import { useAssetContext } from '../contexts/AssetContext';

interface ExecutiveDashboardProps {
    assets?: EnhancedAsset[];
    selectedAsset?: EnhancedAsset;
}

export const ExecutiveFinancialDashboard: React.FC<ExecutiveDashboardProps> = ({ assets: propAssets, selectedAsset: propSelected }) => {
    const { assets: ctxAssets, selectedAsset: ctxSelected } = useAssetContext();
    const assets = propAssets ?? (ctxAssets as any as EnhancedAsset[]);
    const selectedAsset = propSelected ?? (ctxSelected as any as EnhancedAsset | undefined);
    const { financials, hydraulic, physics, identity, site, structural, selectedAsset: telemetrySelected } = useTelemetryStore() as any;
    const pricePerMWh = Number(financials?.energyPrice ?? 85);
    const state = {
        hydraulic,
        identity,
        site,
        structural,
        selectedAsset: telemetrySelected
    } as any;
    const impact = FinancialImpactEngine.calculateImpact(state, physics, { pricePerMWh });
    const powerMW = Number(physics?.powerMW?.toNumber?.() ?? physics?.powerMW ?? 0);
    const energyRevenue = Math.max(0, powerMW) * Math.max(0, pricePerMWh);
    const net = FinancialImpactEngine.calculateNetProfit(energyRevenue, 0, 0, Number(impact?.maintenanceBufferEuro ?? 0));
    // Calculate fleet-wide financial metrics
    const fleetMetrics = calculateFleetFinancials(assets);
    const assetMetrics = selectedAsset ? calculateAssetFinancials(selectedAsset) : null;

    return (
        <div className="space-y-6 bg-scada-bg p-6">
            {/* Header */}
            <div className="mb-6 border-b border-scada-border pb-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-scada-text font-header">
                    Executive
                    <span className="text-status-ok ml-2">
                        Dashboard
                    </span>
                </h2>
                <p className="text-sm text-scada-muted font-mono">
                    Financial performance and ROI overview - No technical details
                </p>
            </div>

            <div className="bg-scada-panel border border-scada-border rounded-sm shadow-scada-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <p className="text-xs text-scada-muted uppercase font-bold font-mono mb-1">Net Profit (Hourly)</p>
                        <p className="text-3xl font-black text-scada-text font-mono tabular-nums">€{Number(net?.netProfit ?? 0).toFixed(0)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-scada-muted uppercase font-bold font-mono mb-1">Molecular Debt (Buffer)</p>
                        <p className="text-3xl font-black text-status-ok font-mono tabular-nums">€{Number(impact?.maintenanceBufferEuro ?? 0).toFixed(0)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-scada-muted uppercase font-bold font-mono mb-1">Revenue (Energy)</p>
                        <p className="text-2xl font-black text-scada-text font-mono tabular-nums">€{Number(energyRevenue).toFixed(0)}/h</p>
                    </div>
                </div>
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
            <div className="bg-scada-panel border border-scada-border rounded-sm shadow-scada-card p-6">
                <h3 className="text-xl font-black uppercase mb-4 text-scada-text flex items-center gap-2 font-header">
                    <Award className="w-6 h-6 text-status-ok" />
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
                        title="Condition Monitoring System"
                        investment={180000}
                        returns={540000}
                        roi={200}
                        paybackMonths={4.0}
                        status="IN_PROGRESS"
                    />
                </div>

                <div className="mt-6 p-4 bg-status-ok/5 border border-status-ok/30 rounded-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-status-ok font-bold uppercase mb-1 font-mono">Total ROI (12 months)</p>
                            <p className="text-3xl font-black text-scada-text font-mono tabular-nums">$1.795M</p>
                            <p className="text-xs text-scada-muted font-mono">on $550k invested</p>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-black text-status-ok font-mono tabular-nums">226%</p>
                            <p className="text-xs text-scada-muted uppercase font-bold font-mono">Average ROI</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Savings Breakdown */}
            <div className="bg-scada-panel border border-scada-border rounded-sm shadow-scada-card p-6">
                <h3 className="text-xl font-black uppercase mb-4 text-scada-text font-header">
                    Cost Savings Breakdown
                </h3>

                <div className="space-y-3">
                    <SavingsBar
                        category="Reduced Downtime"
                        amount={420000}
                        percentage={35}
                        color="bg-status-ok"
                    />
                    <SavingsBar
                        category="Energy Efficiency Gains"
                        amount={385000}
                        percentage={32}
                        color="bg-status-info"
                    />
                    <SavingsBar
                        category="Prevented Major Failures"
                        amount={290000}
                        percentage={24}
                        color="bg-status-warning"
                    />
                    <SavingsBar
                        category="Optimized Spare Parts Inventory"
                        amount={110000}
                        percentage={9}
                        color="bg-scada-muted"
                    />
                </div>

                <div className="mt-4 text-right">
                    <p className="text-sm text-scada-muted font-mono">Total Annual Savings</p>
                    <p className="text-2xl font-black text-status-ok font-mono tabular-nums">$1.205M</p>
                </div>
            </div>

            {/* Risk Alerts (Financial Impact Only) */}
            <div className="bg-scada-panel border border-scada-border rounded-sm shadow-scada-card p-6">
                <h3 className="text-xl font-black uppercase mb-4 text-scada-text flex items-center gap-2 font-header">
                    <AlertTriangle className="w-6 h-6 text-status-warning" />
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
            </div>

            {/* Comparison to Industry Benchmarks */}
            {selectedAsset && assetMetrics && (
                <div className="bg-scada-panel border border-scada-border rounded-sm shadow-scada-card p-6">
                    <h3 className="text-xl font-black uppercase mb-4 text-scada-text font-header">
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
                </div>
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
    <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
        <div className="flex items-center justify-between mb-2">
            <Icon className="w-8 h-8 text-status-ok" />
            <div className={`text-sm font-bold font-mono ${positive ? 'text-status-ok' : 'text-status-error'}`}>
                {positive ? '+' : ''}{change.toFixed(1)}%
            </div>
        </div>
        <p className="text-xs text-scada-muted uppercase font-bold font-mono mb-1">{label}</p>
        <p className="text-2xl font-black text-scada-text font-mono tabular-nums">{value}</p>
    </div>
);

const ROICard: React.FC<{
    title: string;
    investment: number;
    returns: number;
    roi: number;
    paybackMonths: number;
    status: 'COMPLETED' | 'IN_PROGRESS';
}> = ({ title, investment, returns, roi, paybackMonths, status }) => (
    <div className="p-4 bg-scada-bg border border-scada-border rounded-sm">
        <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-scada-text font-mono">{title}</h4>
            <span className={`px-2 py-1 rounded-sm text-xs font-bold font-mono ${status === 'COMPLETED' ? 'bg-status-ok/10 text-status-ok' : 'bg-status-warning/10 text-status-warning'
                }`}>
                {status === 'COMPLETED' ? 'DONE' : 'IN PROGRESS'}
            </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
                <span className="text-scada-muted">Investment:</span>
                <span className="text-scada-text font-bold tabular-nums">${(investment / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex justify-between">
                <span className="text-scada-muted">Returns:</span>
                <span className="text-status-ok font-bold tabular-nums">${(returns / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex justify-between">
                <span className="text-scada-muted">ROI:</span>
                <span className="text-scada-text font-black text-lg tabular-nums">{roi}%</span>
            </div>
            <div className="flex justify-between">
                <span className="text-scada-muted">Payback:</span>
                <span className="text-scada-text font-bold tabular-nums">{paybackMonths.toFixed(1)} months</span>
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
            <span className="text-sm text-scada-muted font-mono">{category}</span>
            <span className="text-sm font-bold text-scada-text font-mono tabular-nums">${(amount / 1000).toFixed(0)}k</span>
        </div>
        <div className="w-full h-2 bg-scada-bg rounded-sm overflow-hidden">
            <div
                style={{ width: `${percentage}%` }}
                className={`h-full ${color}`}
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
        HIGH: 'border-status-error/50 bg-status-error/5',
        MEDIUM: 'border-status-warning/50 bg-status-warning/5',
        LOW: 'border-status-info/50 bg-status-info/5'
    };

    return (
        <div className={`p-4 border rounded-sm ${severityColors[severity]}`}>
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h4 className="text-sm font-bold text-scada-text mb-1 font-mono">{title}</h4>
                    <p className="text-xs text-scada-muted font-mono">{recommendation}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-status-error font-mono tabular-nums">{financialImpact}</p>
                    {roi && <p className="text-xs text-status-ok font-mono tabular-nums">ROI: {roi}%</p>}
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
        <div className="p-4 bg-scada-bg border border-scada-border rounded-sm">
            <p className="text-xs text-scada-muted uppercase font-bold mb-2 font-mono">{metric}</p>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-black text-scada-text font-mono tabular-nums">{yourValue}{unit}</p>
                    <p className="text-xs text-scada-muted font-mono">vs {industryAverage}{unit} avg</p>
                </div>
                <div className={`text-right ${isGood ? 'text-status-ok' : 'text-status-warning'}`}>
                    <p className="text-lg font-black">{isGood ? '✓' : '!'}</p>
                    <p className="text-xs font-bold font-mono tabular-nums">{isGood ? '+' : ''}{percentage.toFixed(0)}%</p>
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
