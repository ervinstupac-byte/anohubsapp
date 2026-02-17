import React from 'react';
import { Wrench as Tool, TrendingDown, AlertCircle } from 'lucide-react';

interface AssetHealth {
    assetId: string;
    name: string;
    operationalHours: number;
    remainingUsefulLife: number; // hours
    rulPercentage: number; // 0-100%
    healthScore: number; // 0-100%
    criticalComponents: {
        name: string;
        condition: 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
        nextMaintenance: number; // timestamp
        oilHealth?: number; // 0-100%
    }[];
}

interface CBMDashboardProps {
    assets: AssetHealth[];
}

export const CBMDashboard: React.FC<CBMDashboardProps> = ({ assets }) => {
    const criticalAssets = assets.filter(a => a.rulPercentage < 30);
    const avgHealthScore = assets.reduce((sum, a) => sum + a.healthScore, 0) / assets.length;

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Tool className="w-6 h-6 text-amber-400" />
                Condition-Based Maintenance (CBM)
            </div>

            {/* Fleet Health Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-emerald-500 rounded-lg p-4">
                    <div className="text-xs text-emerald-400 mb-1">Fleet Health</div>
                    <div className="text-3xl font-bold text-emerald-300 font-mono">
                        {avgHealthScore.toFixed(0)}%
                    </div>
                </div>

                <div className="bg-slate-900 border border-amber-500 rounded-lg p-4">
                    <div className="text-xs text-amber-400 mb-1">Critical Assets</div>
                    <div className="text-3xl font-bold text-amber-300 font-mono">
                        {criticalAssets.length}
                    </div>
                </div>

                <div className="bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="text-xs text-blue-400 mb-1">Avg RUL</div>
                    <div className="text-3xl font-bold text-blue-300 font-mono">
                        {Math.round(assets.reduce((sum, a) => sum + a.remainingUsefulLife, 0) / assets.length / 8760)}y
                    </div>
                </div>

                <div className="bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="text-xs text-purple-400 mb-1">Total Op Hours</div>
                    <div className="text-3xl font-bold text-purple-300 font-mono">
                        {Math.round(assets.reduce((sum, a) => sum + a.operationalHours, 0) / 1000)}k
                    </div>
                </div>
            </div>

            {/* Individual Asset Health */}
            <div className="grid grid-cols-2 gap-4">
                {assets.map((asset) => (
                    <AssetHealthCard key={asset.assetId} asset={asset} />
                ))}
            </div>
        </div>
    );
};

const AssetHealthCard: React.FC<{ asset: AssetHealth }> = ({ asset }) => {
    const statusColor =
        asset.healthScore > 80 ? 'emerald' :
            asset.healthScore > 60 ? 'blue' :
                asset.healthScore > 40 ? 'amber' : 'red';

    const rulYears = Math.round(asset.remainingUsefulLife / 8760);

    return (
        <div className={`bg-slate-900 border border-${statusColor}-500/30 rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-sm font-bold text-white">{asset.assetId}</div>
                    <div className="text-xs text-slate-400">{asset.name}</div>
                </div>
                <div className={`w-12 h-12 rounded-full border-4 border-${statusColor}-500 flex items-center justify-center`}>
                    <div className={`text-lg font-bold text-${statusColor}-300`}>
                        {asset.healthScore.toFixed(0)}
                    </div>
                </div>
            </div>

            {/* RUL Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Remaining Useful Life</span>
                    <span className={`text-${statusColor}-400 font-mono`}>{rulYears} years</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 bg-${statusColor}-500 transition-all`}
                        style={{ width: `${asset.rulPercentage}%` }}
                    />
                </div>
            </div>

            {/* Critical Components */}
            <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold">Critical Components</div>
                {asset.criticalComponents.map((component, i) => (
                    <ComponentStatus key={i} component={component} />
                ))}
            </div>
        </div>
    );
};

const ComponentStatus: React.FC<{ component: any }> = ({ component }) => {
    const conditionColors: Record<string, string> = {
        GOOD: 'emerald',
        FAIR: 'blue',
        POOR: 'amber',
        CRITICAL: 'red'
    };
    const color = conditionColors[component.condition as keyof typeof conditionColors] || 'slate';
    const daysUntilMaintenance = Math.round((component.nextMaintenance - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-slate-800 rounded-none p-2">
            <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-slate-300">{component.name}</div>
                <div className={`text-[10px] px-2 py-0.5 rounded-none bg-${color}-950 text-${color}-300 border border-${color}-500/30`}>
                    {component.condition}
                </div>
            </div>

            {component.oilHealth !== undefined && (
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Oil Health</span>
                    <span className={`font-mono ${component.oilHealth > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {component.oilHealth}%
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Next Maintenance</span>
                <span className={`font-mono ${daysUntilMaintenance < 30 ? 'text-amber-400' : 'text-blue-400'}`}>
                    {daysUntilMaintenance}d
                </span>
            </div>
        </div>
    );
};
