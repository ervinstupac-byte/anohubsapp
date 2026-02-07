import React, { useMemo } from 'react';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { OptimizationService } from '../../../services/OptimizationService';
import { Activity, Zap, TrendingDown, ShieldCheck, ShieldAlert, BarChart3 } from 'lucide-react';
import { authService } from '../../../services/AuthService';

export const EfficiencyMonitor: React.FC = () => {
    const { units, fleet, distributeFleetLoad } = useTelemetryStore();

    // Calculate Fleet-wide Metrics
    const totalPotentialOutput = useMemo(() => {
        return Object.values(units).reduce((sum, u: any) =>
            (sum as number) + (u.identity.machineConfig?.ratedPowerMW || 100) * 0.945, 0); // 94.5% is etaMax
    }, [units]);

    const actualOutput = fleet.totalMW;
    const fleetAvgEfficiency = fleet.efficiencyAvg;

    // Loss Map Calculation (MW Wasted)
    const totalWastedMW = useMemo(() => {
        let totalWasted = 0;
        Object.values(units).forEach((u: any) => {
            const ratedMW = u.identity.machineConfig?.ratedPowerMW || 100;
            const currentLoadFactor = ((u as any).mechanical?.activePowerMW || 0) / ratedMW;
            const currentEff = OptimizationService.calculatePredictedEfficiency(currentLoadFactor, (u as any).hydraulic?.head || 100);

            // Wasted vs Optimal (90% load = 94.5% eff)
            const optimalEff = 94.5;
            const lossMW = ((u as any).mechanical?.activePowerMW || 0) * (optimalEff - currentEff) / 100;
            if (lossMW > 0) totalWasted += lossMW;
        });
        return totalWasted;
    }, [units]);

    const isOptimizerEnabled = (unitId: string) => {
        const u = units[unitId] as any;
        const hasCriticalAlarm = u.alarms.some((a: any) => a.severity === 'CRITICAL' && a.status !== 'CLEARED');
        return !u.isMaintenanceLocked && !hasCriticalAlarm;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-8 min-w-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 bg-opacity-10 rounded-lg border border-emerald-500 border-opacity-20">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider">Efficiency Optimizer</h2>
                        <p className="text-xs text-slate-400 font-mono tracking-tight">NC-91: PRECISION LOAD BALANCING</p>
                    </div>
                </div>
                <button
                    disabled={!authService.isAuthorized('CHIEF_ENGINEER')}
                    onClick={() => distributeFleetLoad(110)} // Test Scenario A
                    className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${authService.isAuthorized('CHIEF_ENGINEER')
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-slate-800 border border-slate-700 bg-opacity-50 cursor-not-allowed text-slate-500'
                        }`}
                >
                    <Zap className={`w-4 h-4 ${authService.isAuthorized('CHIEF_ENGINEER') ? 'text-white' : 'text-slate-500'}`} />
                    {authService.isAuthorized('CHIEF_ENGINEER') ? 'Auto-Balance (110MW)' : 'OPTIMIZER LOCKED'}
                </button>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase font-semibold">System Efficiency</span>
                    <div className="text-3xl font-bold text-emerald-400 mt-1">
                        {fleetAvgEfficiency.toFixed(2)}<span className="text-lg ml-1 text-slate-500">%</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Loss Map (Wasted)</span>
                    <div className="text-3xl font-bold text-rose-500 mt-1 flex items-baseline gap-2">
                        {totalWastedMW.toFixed(2)}<span className="text-lg text-slate-500 font-normal uppercase">MW</span>
                        <TrendingDown className="w-5 h-5 mb-1" />
                    </div>
                </div>
            </div>

            {/* Unit Distribution Detail */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Load Distribution Details
                </h3>
                <div className="space-y-4">
                    {Object.entries(units).map(([id, unit]: [string, any]) => (
                        <div key={id} className="p-4 bg-slate-800 bg-opacity-20 border border-slate-700 border-opacity-50 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${unit.systemOperationalState === 'STANDBY' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <span className="text-slate-200 font-bold">{unit.identity.assetName}</span>
                                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 font-mono capitalize">{id}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase">Target</div>
                                        <div className="text-sm font-bold text-slate-100">{unit.targetLoadMW.toFixed(1)} MW</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-700" />
                                    {isOptimizerEnabled(id) ? (
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                                    )}
                                </div>
                            </div>

                            {/* Load Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono">
                                    <span>MOL (20%)</span>
                                    <span>Optimal (90%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-700 bg-opacity-50 rounded-full relative overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 bg-opacity-50 transition-all duration-1000"
                                        style={{ width: `${(unit.targetLoadMW / (unit.identity.machineConfig?.ratedPowerMW || 100)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Wear-Leveling: <span className="text-sky-400">{unit.runningHours}h</span></span>
                                <span>Status: <span className={unit.systemOperationalState === 'STANDBY' ? 'text-amber-400' : 'text-emerald-400'}>{unit.systemOperationalState}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
