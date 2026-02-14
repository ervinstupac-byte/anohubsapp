import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { TrendingDown, Euro, AlertTriangle, Wrench, ExternalLink } from 'lucide-react';
import { FinancialImpactEngine } from '../../services/core/FinancialImpactEngine';
import { calculateRevenueLoss } from '../../features/business/logic/FinancialCalculator';

export const FinancialHealthPanel: React.FC = () => {
    const { hydraulic, physics, identity, site, mechanical } = useTelemetryStore();

    // NC-1700: Advanced financial impact using FinancialImpactEngine
    const calculateAdvancedFinancials = () => {
        // Build state object for FinancialImpactEngine
        const impactState = {
            hydraulic: {
                baselineOutputMW: hydraulic?.baselineOutputMW || 100,
                efficiency: hydraulic?.efficiency || 90
            },
            site: {
                designFlow: site?.designFlow || 3.0,
                designPerformanceMW: site?.designPerformanceMW || 5.0
            },
            physics: {
                powerMW: physics?.powerMW || 0,
                specificWaterConsumption: (physics as any)?.specificWaterConsumption || 0
            },
            mechanical: {
                bearingTemp: mechanical?.bearingTemp || 55,
                vibrationX: mechanical?.vibrationX || 2.5
            },
            riskScore: 0,
            demoMode: { active: false },
            structural: {
                extendedLifeYears: 0
            },
            identity: {
                turbineType: identity?.turbineType || 'FRANCIS'
            }
        };

        const physicsData = {
            powerMW: impactState.physics.powerMW
        };

        // Use FinancialImpactEngine for comprehensive calculation
        const impact = FinancialImpactEngine.calculateImpact(impactState as any, physicsData as any, {
            pricePerMWh: 85,
            inventoryValue: 50000
        });

        return impact;
    };

    const financials = calculateAdvancedFinancials();

    // Extract values with fallbacks
    const hourlyLossEuro = (financials as any)?.hourlyLossEuro || 0;
    const projection30DayEuro = (financials as any)?.projection30DayEuro || 0;
    const expectedMaintenanceCost = (financials as any)?.expectedMaintenanceCost || 0;

    return (
        <GlassCard className="p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-green-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Euro className="w-5 h-5 text-green-400" />
                    Financial Health
                </h3>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => window.open('#/detach/financial', '_blank', 'width=1000,height=800,menubar=no,status=no')}
                        className="text-slate-500 hover:text-green-400 transition-colors"
                        title="Detach Module"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <span className="text-xs text-green-400 font-medium animate-pulse">LIVE</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {/* Hourly Loss */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-300 group/card">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400 group-hover/card:rotate-[-15deg] transition-transform" />
                        <span className="text-sm text-red-400 font-medium">Hourly Loss</span>
                    </div>
                    <div className="text-2xl font-bold text-red-300 tracking-tight">
                        €{hourlyLossEuro.toFixed(2)}
                    </div>
                    <div className="text-xs text-red-500/80 mt-1 font-mono">per hour impact</div>
                </div>

                {/* 30-Day Projection */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 backdrop-blur-sm hover:bg-orange-500/20 transition-all duration-300 group/card">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400 group-hover/card:scale-110 transition-transform" />
                        <span className="text-sm text-orange-400 font-medium">30-Day Projection</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-300 tracking-tight">
                        €{projection30DayEuro.toFixed(0)}
                    </div>
                    <div className="text-xs text-orange-500/80 mt-1 font-mono">projected loss</div>
                </div>

                {/* Expected Maintenance */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-300 group/card">
                    <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-blue-400 group-hover/card:rotate-45 transition-transform" />
                        <span className="text-sm text-blue-400 font-medium">Maintenance Cost</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-300 tracking-tight">
                        €{expectedMaintenanceCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-blue-500/80 mt-1 font-mono">annual expected</div>
                </div>
            </div>

            {/* Footer with timestamp */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                        Asset: <span className="text-slate-300">{identity?.assetName || 'Unknown'}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                        Updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </GlassCard>
    );
};
