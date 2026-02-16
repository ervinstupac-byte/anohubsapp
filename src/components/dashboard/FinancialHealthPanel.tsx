import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
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
        <div className="p-6 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card relative overflow-hidden group">
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-bold text-scada-text flex items-center gap-2 uppercase tracking-tight font-header">
                    <Euro className="w-5 h-5 text-status-ok" />
                    Financial Health
                </h3>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => window.open('#/detach/financial', '_blank', 'width=1000,height=800,menubar=no,status=no')}
                        className="text-scada-muted hover:text-status-ok transition-colors"
                        title="Detach Module"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1 bg-status-ok/20 border border-status-ok/30 rounded-sm">
                        <span className="text-xs text-status-ok font-black uppercase tracking-widest">LIVE</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {/* Hourly Loss */}
                <div className="bg-scada-bg border border-status-error/30 rounded-sm p-4 hover:bg-status-error/5 transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-status-error" />
                        <span className="text-sm text-status-error font-bold uppercase tracking-wider">Hourly Loss</span>
                    </div>
                    <div className="text-2xl font-black text-status-error tracking-tight font-mono tabular-nums">
                        €{hourlyLossEuro.toFixed(2)}
                    </div>
                    <div className="text-xs text-scada-muted mt-1 font-mono uppercase tracking-widest">per hour impact</div>
                </div>

                {/* 30-Day Projection */}
                <div className="bg-scada-bg border border-status-warning/30 rounded-sm p-4 hover:bg-status-warning/5 transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-status-warning" />
                        <span className="text-sm text-status-warning font-bold uppercase tracking-wider">30-Day Projection</span>
                    </div>
                    <div className="text-2xl font-black text-status-warning tracking-tight font-mono tabular-nums">
                        €{projection30DayEuro.toFixed(0)}
                    </div>
                    <div className="text-xs text-scada-muted mt-1 font-mono uppercase tracking-widest">projected loss</div>
                </div>

                {/* Expected Maintenance */}
                <div className="bg-scada-bg border border-status-info/30 rounded-sm p-4 hover:bg-status-info/5 transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-status-info" />
                        <span className="text-sm text-status-info font-bold uppercase tracking-wider">Maintenance Cost</span>
                    </div>
                    <div className="text-2xl font-black text-status-info tracking-tight font-mono tabular-nums">
                        €{expectedMaintenanceCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-scada-muted mt-1 font-mono uppercase tracking-widest">annual expected</div>
                </div>
            </div>

            {/* Footer with timestamp */}
            <div className="mt-6 pt-4 border-t border-scada-border relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-scada-muted font-mono">
                        Asset: <span className="text-scada-text font-bold">{identity?.assetName || 'Unknown'}</span>
                    </span>
                    <span className="text-xs text-scada-muted font-mono">
                        Updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
