
import React, { useMemo, useRef } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PumpController, FilterMonitor, HeatExchangerMonitor, ExtendedAuxiliaryTelemetry } from '../../services/IntelligentLubricationController';
import { Droplets, Activity, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';

export const LubeStatus: React.FC = () => {
    const { fluidIntelligence } = useTelemetryStore();
    
    // Persistent Controllers
    const pumpController = useRef(new PumpController()).current;
    const filterMonitor = useRef(new FilterMonitor()).current;
    const heatExchangerMonitor = useRef(new HeatExchangerMonitor()).current;

    const telemetry = useMemo((): ExtendedAuxiliaryTelemetry | null => {
        if (!fluidIntelligence) return null;
        
        const { oilSystem, filterSystem, coolingSystem } = fluidIntelligence;
        
        return {
            // Oil System
            oilPressure: oilSystem.oilPressureBar || 0,
            oilTemperature: oilSystem.oilTemperatureC || 0,
            oilFlowRate: 0, // Simulated or derived
            oilTankLevel: oilSystem.oilLevelPercent || 0,
            mainPumpRunning: true, // Assumption for now
            standbyPumpRunning: false, // Managed by controller state internally if we synced it back, but here we just read inputs
            
            // Filter System
            filterInletPressure: filterSystem.inletPressureBar || 0,
            filterOutletPressure: filterSystem.outletPressureBar || 0,
            
            // Cooling System
            oilInletTemp: coolingSystem?.oilInletTempC || 0,
            oilOutletTemp: coolingSystem?.oilOutletTempC || 0,
            coolingWaterInletTemp: coolingSystem?.coolingWaterInletTempC || 0,
            coolingWaterOutletTemp: coolingSystem?.coolingWaterOutletTempC || 0,
            coolingWaterFlow: coolingSystem?.coolingWaterFlowLmin || 0
        };
    }, [fluidIntelligence]);

    const status = useMemo(() => {
        if (!telemetry) return null;

        const pumpCheck = pumpController.checkAndSwitchPumps(telemetry);
        const filterCheck = filterMonitor.checkFilterCondition(telemetry);
        const coolingCheck = heatExchangerMonitor.checkCoolingEffectiveness(telemetry);

        return {
            pump: pumpCheck,
            filter: filterCheck,
            cooling: coolingCheck
        };
    }, [telemetry, pumpController, filterMonitor, heatExchangerMonitor]);

    if (!status || !telemetry) return null;

    return (
        <div className="grid grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            {/* Pump Status */}
            <div className={`p-3 rounded-lg border ${status.pump.action === 'EMERGENCY_SHUTDOWN' ? 'bg-red-950/30 border-red-900' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Activity className={`w-4 h-4 ${status.pump.action === 'NONE' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Pump Health</span>
                </div>
                <div className="text-xl font-mono text-white mb-1">
                    {telemetry.oilPressure.toFixed(2)} <span className="text-xs text-slate-500">bar</span>
                </div>
                <div className="text-[10px] text-slate-400">{status.pump.message}</div>
                {status.pump.standbyPumpShouldRun && (
                    <div className="mt-2 text-[10px] text-amber-400 font-bold animate-pulse">STANDBY ACTIVE</div>
                )}
            </div>

            {/* Filter Status */}
            <div className={`p-3 rounded-lg border ${status.filter.status === 'CRITICAL' ? 'bg-red-950/30 border-red-900' : status.filter.status === 'CLOGGED' ? 'bg-amber-950/30 border-amber-900' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Droplets className={`w-4 h-4 ${status.filter.status === 'CLEAN' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Filter (Δp)</span>
                </div>
                <div className="text-xl font-mono text-white mb-1">
                    {status.filter.deltaP.toFixed(2)} <span className="text-xs text-slate-500">bar</span>
                </div>
                <div className="text-[10px] text-slate-400">{status.filter.status}</div>
            </div>

            {/* Cooling Status */}
            <div className={`p-3 rounded-lg border ${status.cooling.status === 'FAILED' ? 'bg-red-950/30 border-red-900' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Thermometer className={`w-4 h-4 ${status.cooling.status === 'EXCELLENT' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Cooling Eff.</span>
                </div>
                <div className="text-xl font-mono text-white mb-1">
                    {status.cooling.effectiveness.toFixed(0)}<span className="text-xs text-slate-500">%</span>
                </div>
                <div className="text-[10px] text-slate-400">Drop: {status.cooling.oilTempDrop.toFixed(1)}°C</div>
            </div>
        </div>
    );
};
