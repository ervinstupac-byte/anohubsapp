
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Activity, Users, ShieldAlert, BarChart2 } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore'; // Store with Fleet State
import { FleetOptimizer, FleetAsset } from '../../services/FleetOptimizer';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';

/**
 * Animated Odometer component for MW counter.
 * Smoothly interpolates between values over 0.5s.
 */
const OdometerValue: React.FC<{ value: number }> = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const startValueRef = useRef<number>(value);

    useEffect(() => {
        const duration = 500; // 0.5s animation
        startTimeRef.current = performance.now();
        startValueRef.current = displayValue;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const interpolated = startValueRef.current + (value - startValueRef.current) * easeOut;
            setDisplayValue(interpolated);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [value]);

    return (
        <span className="text-2xl font-black font-mono text-white tabular-nums">
            {displayValue.toFixed(1)}
        </span>
    );
};

/**
 * Task 2: Fleet Command Center (UI)
 * Visualizes total fleet power and optimal efficiency distribution.
 */
export const FleetCommandView: React.FC = () => {
    const { t } = useTranslation();

    // Access Fleet State (NC-23 integration)
    const { fleet, updateFleetMetrics, triggerFleetAlert, identity, hydraulic, mechanical } = useTelemetryStore();

    // Mock other assets to form a "Swarm" for demonstration
    // In a real scenario, this would come from a FleetContext or aggregated API
    const fleetAssets = useMemo<FleetAsset[]>(() => [
        // The current unit (local)
        {
            id: String(identity.assetId || 'LOCAL'),
            efficiency: hydraulic.efficiency || 92,
            currentPowerMW: (identity.machineConfig.ratedPowerMW || 4.2), // Simplify: assuming running at rated or calc from flow
            maxCapacityMW: identity.machineConfig.ratedPowerMW || 15
        },
        // Simulated Peers
        { id: 'HPP-102', efficiency: 94.5, currentPowerMW: 12.1, maxCapacityMW: 15 },
        { id: 'HPP-103', efficiency: 89.2, currentPowerMW: 8.5, maxCapacityMW: 12 },
        { id: 'HPP-104', efficiency: 91.0, currentPowerMW: 10.0, maxCapacityMW: 10 }
    ], [identity, hydraulic]);

    // Calculate Real-time Aggregates if not provided by backend
    // Logic: In a real app, 'fleet' state is updated by a polling service. 
    // Here we self-update for the demo to ensure the UI looks alive.
    React.useEffect(() => {
        const totalMW = fleetAssets.reduce((sum, a) => sum + a.currentPowerMW, 0);
        const effAvg = FleetOptimizer.calculateFleetEfficiency(fleetAssets);

        updateFleetMetrics({
            totalMW,
            efficiencyAvg: effAvg * 100, // Convert to %
            activeAssets: fleetAssets.length,
            status: totalMW > 40 ? 'CRITICAL' : 'NOMINAL' // Demo threshold
        });
    }, [fleetAssets, updateFleetMetrics]);

    const handleSyncLoadShedding = () => {
        // Trigger Fleet Optimizer logic
        const currentTotal = fleet.totalMW;
        const target = currentTotal * 0.90; // Shed 10%

        const optimization = FleetOptimizer.calculateOptimalDistribution(target, fleetAssets);

        triggerFleetAlert(`FLEET OPTIMIZATION EXECUTED. Target Reduced to ${target.toFixed(1)} MW. Distribution: ${JSON.stringify(optimization.distribution)}`, 'WARNING');

        // In a real app, this would dispatch commands to other units via MQTT
        // For now, we simulate success
    };

    return (
        <GlassCard className="p-0 overflow-hidden border-blue-500/30">
            <div className="bg-slate-900/50 p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest">Fleet Command</h3>
                        <div className="text-[10px] text-blue-400 font-mono">Swarm Intelligence Active</div>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold font-mono ${fleet.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {fleet.status}
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Aggregated Power Bar with Odometer Animation */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-slate-400 uppercase font-mono font-bold">Total Fleet Output</span>
                        <div className="text-right">
                            <OdometerValue value={fleet.totalMW} />
                            <span className="text-xs text-slate-500 ml-1">MW</span>
                        </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                        {/* Capacity Markers */}
                        <div className="absolute top-0 bottom-0 left-[25%] border-r border-white/10" />
                        <div className="absolute top-0 bottom-0 left-[50%] border-r border-white/10" />
                        <div className="absolute top-0 bottom-0 left-[75%] border-r border-white/10" />

                        <div
                            className={`h-full transition-all duration-700 ${fleet.status === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((fleet.totalMW / 52) * 100, 100)}%` }} // Assuming 52MW total cap
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-slate-500 font-mono">
                        <span>0 MW</span>
                        <span>52 MW (Max)</span>
                    </div>
                </div>

                {/* 2. Efficiency Scatter (Simplified as List for MVP/Text) & Control */}
                <div className="flex flex-col justify-between">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400 uppercase font-mono font-bold">Avg Efficiency</span>
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-h-cyan" />
                                <span className="text-lg font-bold text-h-cyan font-mono">{fleet.efficiencyAvg.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {fleetAssets.map(asset => (
                                <div key={asset.id} className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1 last:border-0">
                                    <span className={asset.id === identity.assetId ? 'text-white font-bold' : 'text-slate-400'}>{asset.id}</span>
                                    <span className="text-slate-300">{asset.currentPowerMW.toFixed(1)} MW</span>
                                    <span className={`${asset.efficiency > 92 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {asset.efficiency.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ModernButton
                        onClick={handleSyncLoadShedding}
                        variant="primary"
                        className="w-full justify-center bg-amber-600 hover:bg-amber-500 border-amber-400/30 text-[11px]"
                    >
                        <ShieldAlert className="w-3 h-3 mr-2" />
                        SYNC LOAD SHEDDING (-10%)
                    </ModernButton>
                </div>
            </div>
        </GlassCard>
    );
};
