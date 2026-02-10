import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetContext } from '../contexts/AssetContext';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { MetricCard } from './dashboard/anohub/MetricCard';
import { SystemHealthCard, RiskStatusCard } from './dashboard/anohub/StatusCards';
import { ThermalCard, ShaftLiftCard, LabyrinthCard } from './dashboard/anohub/VisualCards';
import { ActionCard, LiveAnalytics, SystemAlerts } from './dashboard/anohub/AnalyticsPanel';
import { Clock, TrendingUp, TrendingDown, Zap, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { EngineeringDossierCard } from './EngineeringDossierCard';
import { computeEfficiencyFromHillChart } from '../features/physics-core/UnifiedPhysicsCore';
import { EfficiencyOptimizer } from '../services/EfficiencyOptimizer';
import { VortexDiagnostic } from '../services/VortexDiagnostic';
import { FinancialImpactEngine } from '../services/core/FinancialImpactEngine';
import { PhysicsMathService } from '../services/core/PhysicsMathService';

/**
 * STRATEGIC COMMAND CENTER - High-Fidelity Industrial Dashboard
 * 
 * Primary KPIs: Total Efficiency (η_total) and Loss Tracer (€/h)
 * Real-time monitoring across all 14 turbine variants
 */
export const ToolboxLaunchpad: React.FC = () => {
    const navigate = useNavigate();
    const { selectedAsset } = useAssetContext();
    const store = useTelemetryStore() as any;
    
    // Real-time telemetry data
    const hydraulic = useMemo(() => store?.hydraulic ?? {}, [store?.hydraulic]);
    const mechanical = useMemo(() => store?.mechanical ?? {}, [store?.mechanical]);
    const physics = useMemo(() => store?.physics ?? {}, [store?.physics]);
    const specializedState = useMemo(() => store?.specializedState ?? {}, [store?.specializedState]);
    
    // Calculate primary KPIs
    const headM = useMemo(() => Number(hydraulic?.head ?? physics?.netHead ?? 0), [hydraulic, physics]);
    const flowM3s = useMemo(() => Number(hydraulic?.flow ?? 0), [hydraulic]);
    const rpm = useMemo(() => Number(mechanical?.rpm ?? 0), [mechanical]);
    
    // Total Unit Efficiency Calculation (η_total)
    const totalUnitEfficiency = useMemo(() => {
        const etaTurbineRaw = Number(hydraulic?.efficiency ?? 0);
        
        // Use Centralized Physics Service (NC-8001)
        const etaTotal = PhysicsMathService.calculateTotalEfficiency(
            etaTurbineRaw,
            store.electrical.generatorEfficiency / 100,
            store.electrical.transformerEfficiency / 100,
            store.electrical.transmissionEfficiency / 100,
            !store.isCommanderMode
        );

        // Legacy local vars for individual display
        const etaTurbine = etaTurbineRaw > 1 ? etaTurbineRaw / 100 : etaTurbineRaw;
        const etaGenerator = store.electrical.generatorEfficiency / 100;
        const etaTransformer = store.electrical.transformerEfficiency / 100;
        const etaTransmission = store.electrical.transmissionEfficiency / 100;
        
        return {
            current: etaTotal * 100, // Convert back to percentage
            optimal: 100, // Theoretical maximum
            turbine: etaTurbine * 100,
            generator: etaGenerator * 100,
            transformer: etaTransformer * 100,
            transmission: etaTransmission * 100,
            percentage: (etaTotal * 100).toFixed(2)
        };
    }, [hydraulic?.efficiency, store.electrical, store.isCommanderMode]);
    
    // Loss Tracer Calculation (€/h) with Vortex Tax Integration
    const lossTracer = useMemo(() => {
        const observedEffRaw = Number(hydraulic?.efficiency ?? physics?.efficiency ?? (totalUnitEfficiency.current * 100));
        const observedEffPct = observedEffRaw <= 1 ? observedEffRaw * 100 : observedEffRaw;
        const { etaMax } = EfficiencyOptimizer.compute(headM || 0, flowM3s || 0, isNaN(observedEffPct) ? 0 : observedEffPct);
        const pricePerMWh = Number(store?.financials?.energyPrice ?? 85);
        const powerMW = Number(physics?.powerMW?.toNumber?.() ?? physics?.powerMW ?? 0);
        const deltaEffFrac = Math.max(0, ((etaMax ?? 0) - (isNaN(observedEffPct) ? 0 : observedEffPct)) / 100);
        const baseLossEuroPerHour = Math.max(0, deltaEffFrac * Math.max(0, powerMW) * Math.max(0, pricePerMWh));
        const ratedMW = Number(store?.identity?.machineConfig?.ratedPowerMW ?? powerMW ?? 0);
        const isPartLoad = ratedMW > 0 ? powerMW < ratedMW * 0.6 : false;
        
        // Vortex Detection and Tax Calculation
        const rope = isPartLoad ? VortexDiagnostic.analyze([Number(mechanical?.vibrationX ?? 0)], 20) : { isRopeActive: false } as any;
        const taxThreshold = 0.88;
        const effDelta = Math.max(0, taxThreshold - (Number(hydraulic?.efficiency ?? observedEffPct / 100)));
        const flow = Number((hydraulic as any)?.flow ?? (hydraulic as any)?.flowRate ?? 0);
        const head = Number((hydraulic as any)?.head ?? (hydraulic as any)?.netHead ?? headM ?? 0);
        const ineffTaxHourly = Math.max(0, flow * head * effDelta * (Math.max(0, pricePerMWh) / 1000));
        
        // Total Loss = Base Loss + Vortex Tax (if active)
        const totalLoss = baseLossEuroPerHour + (rope?.isRopeActive ? ineffTaxHourly : 0);
        
        return {
            value: totalLoss,
            isRope: !!rope?.isRopeActive,
            vortexTax: rope?.isRopeActive ? ineffTaxHourly : 0,
            status: totalLoss > 1000 ? 'critical' : totalLoss > 500 ? 'warning' : 'normal'
        };
    }, [hydraulic, physics, totalUnitEfficiency.current, mechanical, store]);
    
    // System status
    const systemStatus = useMemo(() => {
        const vibrationTotal = Math.sqrt(
            Math.pow(Number(mechanical?.vibrationX ?? 0), 2) + 
            Math.pow(Number(mechanical?.vibrationY ?? 0), 2)
        );
        return {
            operational: rpm > 0 && flowM3s > 0 && headM > 0,
            vibrationLevel: vibrationTotal,
            temperature: Number(mechanical?.bearingTemp ?? 45),
            powerOutput: Number(physics?.powerMW?.toNumber?.() ?? physics?.powerMW ?? 0)
        };
    }, [rpm, flowM3s, headM, mechanical, physics]);

    return (
        <div className="h-full w-full flex flex-col p-4 lg:p-6 overflow-hidden bg-slate-950/20 font-sans text-slate-300 relative">

            {/* CYBERPUNK BACKGROUND LAYERS */}
            <div className="absolute inset-0 pointer-events-none z-[-1]">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] mix-blend-overlay" />
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
            </div>

            {/* STRATEGIC COMMAND HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 shrink-0 mb-4 lg:mb-6">
                
                {/* TOTAL UNIT EFFICIENCY KPI - PRIMARY DISPLAY */}
                <div className="md:col-span-4 h-32 lg:h-36 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10" onClick={() => navigate('/executive')}>
                    <div className={`h-full border border-white/5 rounded-xl p-4 bevel-industrial relative overflow-hidden ${
                        lossTracer.status === 'critical' ? 'bg-red-950/20 border-red-500/30' : 
                        lossTracer.status === 'warning' ? 'bg-amber-950/20 border-amber-500/30' : 
                        'bg-slate-900/40'
                    }`}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_70%)]" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[clamp(7px,0.8vh,9px)] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">TOTAL UNIT EFFICIENCY</div>
                                    <div className="text-[clamp(24px,3vh,36px)] font-black text-white tabular-nums">
                                        η<sub>total</sub> = {totalUnitEfficiency.percentage}%
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    totalUnitEfficiency.current >= 0.9 ? 'bg-emerald-500/20 border-emerald-500/30' :
                                    totalUnitEfficiency.current >= 0.8 ? 'bg-amber-500/20 border-amber-500/30' :
                                    'bg-red-500/20 border-red-500/30'
                                }`}>
                                    {totalUnitEfficiency.current >= 0.9 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
                                     totalUnitEfficiency.current >= 0.8 ? <Activity className="w-4 h-4 text-amber-400" /> :
                                     <TrendingDown className="w-4 h-4 text-red-400" />}
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    η<sub>turbine</sub>: {Math.max(0, Math.min(100, totalUnitEfficiency.turbine)).toFixed(1)}%
                                </div>
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    η<sub>generator</sub>: {(totalUnitEfficiency.generator * 100).toFixed(1)}%
                                </div>
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    η<sub>transformer</sub>: {(totalUnitEfficiency.transformer * 100).toFixed(1)}%
                                </div>
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    η<sub>transmission</sub>: {(totalUnitEfficiency.transmission * 100).toFixed(1)}%
                                </div>
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    η<sub>total</sub>: {totalUnitEfficiency.percentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOSS TRACER KPI - PRIMARY DISPLAY */}
                <div className="md:col-span-4 h-32 lg:h-36 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10" onClick={() => navigate('/executive/finance')}>
                    <div className={`h-full border border-white/5 rounded-xl p-4 bevel-industrial relative overflow-hidden ${
                        lossTracer.status === 'critical' ? 'bg-red-950/20 border-red-500/30' : 
                        lossTracer.status === 'warning' ? 'bg-amber-950/20 border-amber-500/30' : 
                        'bg-slate-900/40'
                    }`}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_70%)]" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[clamp(7px,0.8vh,9px)] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">LOSS TRACER</div>
                                    <div className="text-[clamp(24px,3vh,36px)] font-black text-white tabular-nums flex items-baseline">
                                        €{Number(lossTracer.value || 0).toFixed(0)}
                                        <span className="text-[clamp(10px,1.2vh,14px)] font-mono text-slate-400 ml-1">/h</span>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    lossTracer.status === 'critical' ? 'bg-red-500/20 border border-red-500/30 animate-pulse' :
                                    lossTracer.status === 'warning' ? 'bg-amber-500/20 border border-amber-500/30' :
                                    'bg-emerald-500/20 border border-emerald-500/30'
                                }`}>
                                    {lossTracer.status === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                                     lossTracer.status === 'warning' ? <Zap className="w-4 h-4 text-amber-400" /> :
                                     <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    {lossTracer.isRope ? `Vortex Active (+€${lossTracer.vortexTax.toFixed(0)}/h)` : 'Normal Operation'}
                                </div>
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    Real-time Monitoring
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SYSTEM STATUS */}
                <div className="md:col-span-4 h-32 lg:h-36 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10" onClick={() => navigate('/scada/core')}>
                    <div className={`h-full border border-white/5 rounded-xl p-4 bevel-industrial relative overflow-hidden ${
                        systemStatus.operational ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900/40'
                    }`}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
                        <div className="h-full w-full flex items-center justify-center p-2">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-[0.3em]">STRATEGIC COMMAND</div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${systemStatus.operational ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                    <span className="text-[clamp(10px,1.2vh,14px)] font-mono text-white">
                                        {systemStatus.operational ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>
                                <div className="text-[clamp(6px,0.7vh,8px)] font-mono text-slate-400">
                                    {rpm.toFixed(0)} RPM • {systemStatus.powerOutput.toFixed(1)} MW
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SOVEREIGN PULSE GAUGE */}
                <div className="md:col-span-4 h-32 lg:h-36 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10" onClick={() => navigate('/executive')}>
                    <div className={`h-full border border-white/5 rounded-xl p-4 bevel-industrial relative overflow-hidden ${
                        store.sovereignPulse.globalStatus === 'OPTIMAL' ? 'bg-emerald-950/20 border-emerald-500/30' : 
                        store.sovereignPulse.globalStatus === 'STRESSED' ? 'bg-amber-950/20 border-amber-500/30' : 
                        store.sovereignPulse.globalStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500/30' : 
                        'bg-slate-900/40'
                    }`}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_70%)]" />
                        <div className="relative z-10 h-full flex flex-col justify-center p-2">
                            <div className="text-[clamp(32px,4vh,48px)] font-black text-white tabular-nums">
                                {store.sovereignPulse.index.toFixed(1)}
                            </div>
                            <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                                System Health Score
                            </div>
                            
                            {/* Pulsating ring animation */}
                            <div 
                                className={`absolute inset-0 rounded-full border-2 ${
                                    store.sovereignPulse.globalStatus === 'OPTIMAL' ? 'border-emerald-400' :
                                    store.sovereignPulse.globalStatus === 'STRESSED' ? 'border-amber-400' :
                                    store.sovereignPulse.globalStatus === 'CRITICAL' ? 'border-red-400' :
                                    'border-slate-400'
                                }`}
                                style={{
                                    animation: `pulse ${Math.max(1, 5 - store.sovereignPulse.index / 20)}s ease-in-out infinite`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA - ENHANCED MONITORING */}
            <div className="flex-1 min-h-0 grid grid-rows-2 gap-4 lg:gap-6">

                {/* ROW 1: SYSTEM METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 min-h-0">
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0" onClick={() => navigate('/executive')}>
                        <MetricCard
                            title="Operating Hours"
                            value="12,500"
                            unit="hrs"
                            subtitle="Total System Runtime"
                            chart={
                                <div className="w-full flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                        <Clock className="w-4 h-4 text-cyan-400 animate-gear" />
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="h-1.5 w-full flex gap-[1px]">
                                            {[...Array(20)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scaleY: 0 }}
                                                    animate={{ opacity: 1, scaleY: 1 }}
                                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                                    className={`h-full flex-1 ${i < 15 ? 'bg-cyan-500' : 'bg-slate-800'} ${i < 15 ? 'bloom-glow-cyan' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0 overflow-hidden" onClick={() => navigate('/maintenance/hydraulic')}>
                        <LabyrinthCard />
                    </div>
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0 overflow-hidden" onClick={() => navigate('/maintenance/dashboard')}>
                        <ThermalCard />
                    </div>
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0 overflow-hidden" onClick={() => navigate('/francis/sop-shaft-alignment')}>
                        <ShaftLiftCard />
                    </div>
                </div>

                {/* ROW 2: ADVANCED ANALYTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 overflow-hidden">
                    <div className="lg:col-span-3 h-full cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10 min-h-0" onClick={() => navigate('/precision-audit')}>
                        <ActionCard />
                    </div>
                    <div className="lg:col-span-6 h-full cursor-pointer hover:scale-[1.01] transition-all duration-200 active:scale-95 z-10 min-h-0 overflow-hidden" onClick={() => navigate('/executive')}>
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 h-full flex flex-col bevel-industrial overflow-hidden">
                            <h3 className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center font-mono shrink-0">
                                <span>Live Analytics</span>
                                <span className="text-emerald-500 animate-pulse">● LIVE_FEED</span>
                            </h3>
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <LiveAnalytics />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 h-full cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10 min-h-0 overflow-hidden" onClick={() => navigate('/forensics')}>
                        <SystemAlerts />
                    </div>
                </div>
            </div>

            {/* FOOTER ROW - ENHANCED STATUS */}
            <div className="shrink-0 pt-4 lg:pt-6 flex flex-col gap-4">
                <EngineeringDossierCard />
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-xl flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] metallic-border w-full"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                lossTracer.status === 'critical' ? 'bg-red-500 animate-pulse' :
                                lossTracer.status === 'warning' ? 'bg-amber-500 animate-pulse' :
                                'bg-emerald-500 animate-pulse'
                            } bloom-glow-emerald shrink-0`} />
                            <span className="text-[clamp(7px,0.9vh,9px)] font-mono font-black text-slate-400 uppercase tracking-wider">
                                TELEMETRY_LINK: ESTABLISHED
                            </span>
                        </div>
                        <div className="w-px h-4 bg-white/10 shrink-0" />
                        <div className="text-[clamp(7px,0.9vh,9px)] font-mono font-bold text-h-gold tracking-wider uppercase">
                            SECURE_SYNC: NC-9.0 CRYPTO
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[clamp(7px,0.8vh,8px)] font-mono text-slate-600 font-black tracking-[0.2em] uppercase truncate">
                            HPP_NODE_BIH_44.92N_15.87E
                        </div>
                        <div className="w-px h-4 bg-white/10 shrink-0" />
                        <div className={`text-[clamp(7px,0.8vh,8px)] font-mono font-black ${
                            lossTracer.status === 'critical' ? 'text-red-400' :
                            lossTracer.status === 'warning' ? 'text-amber-400' :
                            'text-emerald-400'
                        } uppercase`}>
                            LOSS: €{Number(lossTracer.value || 0).toFixed(0)}/h
                            {lossTracer.isRope && lossTracer.vortexTax > 0 ? ` (+€${lossTracer.vortexTax.toFixed(0)}/h Vortex Tax)` : ''}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
