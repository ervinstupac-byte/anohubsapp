import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { TrendingDown, Euro, AlertTriangle, Wrench } from 'lucide-react';

export const FinancialHealthPanel: React.FC = () => {
    const { hydraulic, physics, identity, site } = useTelemetryStore();

    // Calculate financial impact using current state
    const calculateFinancials = () => {
        const baselinePower = hydraulic?.baselineOutputMW ? Number(hydraulic.baselineOutputMW) : 100;
        const currentPower = physics?.powerMW ? Number(physics.powerMW) : 0;
        const powerLossMW = Math.max(0, baselinePower - currentPower);
        
        const pricePerMWh = 85; // Default EUR per MWh
        const hourlyLossEuro = powerLossMW * pricePerMWh;
        const projection30DayEuro = hourlyLossEuro * 24 * 30;
        
        // Simplified maintenance cost (bearing, seal, runner, governor, generator)
        const components = [
            { baseProb: 0.02, baseCost: 45000 },
            { baseProb: 0.04, baseCost: 8000 },
            { baseProb: 0.005, baseCost: 120000 },
            { baseProb: 0.01, baseCost: 15000 },
            { baseProb: 0.008, baseCost: 60000 }
        ];
        
        const expectedMaintenanceCost = components.reduce((sum, comp) => 
            sum + (comp.baseProb * comp.baseCost), 0
        );

        return {
            hourlyLossEuro,
            projection30DayEuro,
            expectedMaintenanceCost
        };
    };

    const { hourlyLossEuro, projection30DayEuro, expectedMaintenanceCost } = calculateFinancials();

    return (
        <GlassCard className="p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Euro className="w-5 h-5 text-green-400" />
                    Financial Health
                </h3>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hourly Loss */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">Hourly Loss</span>
                    </div>
                    <div className="text-2xl font-bold text-red-300">
                        €{hourlyLossEuro.toFixed(2)}
                    </div>
                    <div className="text-xs text-red-500 mt-1">per hour</div>
                </div>

                {/* 30-Day Projection */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-400 font-medium">30-Day Projection</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-300">
                        €{projection30DayEuro.toFixed(0)}
                    </div>
                    <div className="text-xs text-orange-500 mt-1">projected loss</div>
                </div>

                {/* Expected Maintenance */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">Maintenance Cost</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-300">
                        €{expectedMaintenanceCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">annual expected</div>
                </div>
            </div>

            {/* Footer with timestamp */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        Asset: {identity?.assetName || 'Unknown'}
                    </span>
                    <span className="text-xs text-slate-400">
                        Updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </GlassCard>
    );
};
