// Galvanic Corrosion Monitor - Cathodic Protection UI
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, AlertTriangle, TrendingDown } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { GalvanicCorrosionService, CathodicProtectionSystem } from '../services/GalvanicCorrosionService';

export const GalvanicCorrosionMonitor: React.FC = () => {
    const [system] = useState<CathodicProtectionSystem>({
        assetId: 'BULB-001',
        turbineType: 'BULB',
        anodes: [
            {
                anodeId: 'ZN-001',
                location: 'Spiral Case Inlet',
                timestamp: Date.now(),
                mass: 8.5,
                voltage: -850,
                current: 125,
                consumptionRate: 5.8,
                estimatedLifeRemaining: 4.2
            },
            {
                anodeId: 'ZN-002',
                location: 'Draft Tube Exit',
                timestamp: Date.now(),
                mass: 12.3,
                voltage: -820,
                current: 98,
                consumptionRate: 3.2,
                estimatedLifeRemaining: 11.5
            },
            {
                anodeId: 'ZN-003',
                location: 'Runner Hub',
                timestamp: Date.now(),
                mass: 6.1,
                voltage: -780,
                current: 156,
                consumptionRate: 6.5,
                estimatedLifeRemaining: 2.8
            }
        ],
        overallProtection: 'GOOD',
        averageVoltage: -816.7,
        generatorGroundingResistance: 1.8,
        strayCurrentDetected: true
    });

    const alerts = GalvanicCorrosionService.analyzeCathodicProtection(system);
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
    const warningAlerts = alerts.filter(a => a.severity === 'WARNING');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Galvanic Corrosion</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 ml-2">
                        Monitor
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    Cathodic Protection - {system.turbineType} Turbine
                </p>
            </div>

            {/* System Status */}
            <GlassCard className={`p-6 border-2 ${system.overallProtection === 'EXCELLENT' ? 'border-emerald-500 bg-emerald-950/20' :
                system.overallProtection === 'GOOD' ? 'border-green-500 bg-green-950/20' :
                    system.overallProtection === 'MARGINAL' ? 'border-amber-500 bg-amber-950/20' :
                        'border-red-500 bg-red-950/20'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400 uppercase font-bold mb-1">Protection Status</p>
                        <p className="text-4xl font-black text-white">{system.overallProtection}</p>
                    </div>
                    <Shield className={`w-16 h-16 ${system.overallProtection === 'EXCELLENT' || system.overallProtection === 'GOOD'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                        }`} />
                </div>
            </GlassCard>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className={`p-4 ${system.averageVoltage < -800 ? '' : 'border-2 border-amber-500 bg-amber-950/20'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <p className="text-xs text-slate-400 uppercase font-bold">Avg Potential</p>
                    </div>
                    <p className="text-3xl font-black text-white">{system.averageVoltage.toFixed(0)}</p>
                    <p className="text-xs text-slate-500">mV (target: -800 to -1050)</p>
                </GlassCard>
                <GlassCard className={`p-4 ${system.generatorGroundingResistance > 1.0 ? 'border-2 border-red-500 bg-red-950/20' : ''
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-amber-400" />
                        <p className="text-xs text-slate-400 uppercase font-bold">Grounding</p>
                    </div>
                    <p className={`text-3xl font-black ${system.generatorGroundingResistance > 1.0 ? 'text-red-400' : 'text-white'
                        }`}>
                        {system.generatorGroundingResistance.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">Ω (target: &lt;1.0)</p>
                </GlassCard>
                <GlassCard className={`p-4 ${system.strayCurrentDetected ? 'border-2 border-red-500 bg-red-950/20' : ''
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${system.strayCurrentDetected ? 'text-red-400' : 'text-emerald-400'}`} />
                        <p className="text-xs text-slate-400 uppercase font-bold">Stray Current</p>
                    </div>
                    <p className={`text-2xl font-black ${system.strayCurrentDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                        {system.strayCurrentDetected ? 'DETECTED' : 'NONE'}
                    </p>
                    <p className="text-xs text-red-300">{system.strayCurrentDetected ? '⚠️ Critical' : '✓ Good'}</p>
                </GlassCard>
            </div>

            {/* Anode Status */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-black text-white mb-4">Zinc Anode Status ({system.anodes.length} units)</h3>
                <div className="space-y-4">
                    {system.anodes.map(anode => (
                        <AnodeCard key={anode.anodeId} anode={anode} />
                    ))}
                </div>
            </GlassCard>

            {/* Alerts */}
            {alerts.length > 0 && (
                <GlassCard className="p-6">
                    <h3 className="text-lg font-black text-white mb-4">
                        ⚠️ Alerts ({criticalAlerts.length} Critical, {warningAlerts.length} Warning)
                    </h3>
                    <div className="space-y-3">
                        {alerts.map((alert, index) => (
                            <AlertCard key={index} alert={alert} />
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// Helper Components
const AnodeCard: React.FC<{ anode: any }> = ({ anode }) => {
    const isCritical = anode.estimatedLifeRemaining < 3;
    const isWarning = anode.estimatedLifeRemaining < 6;
    const isFastConsuming = anode.consumptionRate > 5;

    return (
        <div className={`p-4 rounded-lg border ${isCritical ? 'border-red-500 bg-red-950/20' :
            isWarning ? 'border-amber-500 bg-amber-950/20' :
                'border-slate-700 bg-slate-800/30'
            }`}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm font-black text-white">{anode.anodeId}</p>
                    <p className="text-xs text-slate-400">{anode.location}</p>
                </div>
                <div className="text-right">
                    <p className={`text-xl font-black ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                        {anode.estimatedLifeRemaining.toFixed(1)} mo
                    </p>
                    <p className="text-xs text-slate-500">remaining</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Mass</p>
                    <p className="text-sm text-white font-bold">{anode.mass.toFixed(1)} kg</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Voltage</p>
                    <p className="text-sm text-white font-bold">{anode.voltage} mV</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Current</p>
                    <p className="text-sm text-white font-bold">{anode.current} mA</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Rate</p>
                    <p className={`text-sm font-bold ${isFastConsuming ? 'text-amber-400' : 'text-white'}`}>
                        {anode.consumptionRate.toFixed(1)} kg/y {isFastConsuming && '⚠️'}
                    </p>
                </div>
            </div>

            {/* Life bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((anode.estimatedLifeRemaining / 12) * 100, 100)}%` }}
                    className={`h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                />
            </div>
        </div>
    );
};

const AlertCard: React.FC<{ alert: any }> = ({ alert }) => {
    const severityColors = {
        CRITICAL: 'border-red-500 bg-red-950/20 text-red-300',
        WARNING: 'border-amber-500 bg-amber-950/20 text-amber-300',
        INFO: 'border-blue-500 bg-blue-950/20 text-blue-300'
    };

    const severityIcons = {
        CRITICAL: '🔴',
        WARNING: '🟡',
        INFO: '🔵'
    };

    return (
        <div className={`p-4 rounded-lg border ${severityColors[alert.severity as keyof typeof severityColors]}`}>
            <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{severityIcons[alert.severity as keyof typeof severityIcons]}</span>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-black/30 uppercase">
                            {alert.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold uppercase">{alert.severity}</span>
                    </div>
                    <p className="text-sm font-bold mb-2">{alert.message}</p>
                    <p className="text-xs opacity-80">💡 {alert.recommendation}</p>
                </div>
            </div>
        </div>
    );
};
