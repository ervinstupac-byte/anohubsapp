/**
 * GreenHydrogenPanel.tsx
 * 
 * NC-1400: H2 Hub Integration
 * Real-time monitoring of electrolysis, storage, and robotic refueling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Droplets, 
  Gauge, 
  Battery,
  Activity,
  AlertTriangle,
  CheckCircle,
  Power,
  RefreshCw,
  Truck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { H2Synthesizer, H2Storage, FuelCellStatus, ElectrolysisSession } from '../../services/H2Synthesizer';
import { SovereignGlobalState } from '../../services/SovereignGlobalState';

interface H2PanelState {
  storage: H2Storage;
  isRunning: boolean;
  isIslandMode: boolean;
  marketDemand: number; // MW
  excessPower: number; // MW
  fuelCellReadiness: {
    totalUnits: number;
    ready: number;
    lowFuel: number;
    empty: number;
  };
  currentSession: ElectrolysisSession | null;
}

export const GreenHydrogenPanel: React.FC = () => {
  const [state, setState] = useState<H2PanelState>({
    storage: H2Synthesizer['storage'],
    isRunning: false,
    isIslandMode: false,
    marketDemand: 45, // Simulated
    excessPower: 0,
    fuelCellReadiness: H2Synthesizer.getFuelCellReadiness(),
    currentSession: null
  });

  const [selectedUnit, setSelectedUnit] = useState<string>('ROV-001');

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        storage: H2Synthesizer['storage'],
        fuelCellReadiness: H2Synthesizer.getFuelCellReadiness(),
        currentSession: H2Synthesizer['currentSession']
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for Island Mode trigger
  useEffect(() => {
    if (state.isIslandMode) {
      const trigger = H2Synthesizer.checkElectrolysisTrigger({
        islandMode: true,
        marketDemand: 0,
        excessPower: 10
      });

      if (trigger.shouldRun && !state.isRunning) {
        startElectrolysis();
      }
    }
  }, [state.isIslandMode]);

  const startElectrolysis = useCallback(() => {
    const trigger = H2Synthesizer.checkElectrolysisTrigger({
      islandMode: state.isIslandMode,
      marketDemand: state.marketDemand,
      excessPower: state.excessPower
    });

    if (trigger.shouldRun) {
      const session = H2Synthesizer.startElectrolysis(
        100, // 100 kW
        state.isIslandMode ? 'ISLAND_MODE' : 'MANUAL'
      );
      
      setState(prev => ({ ...prev, isRunning: true, currentSession: session }));

      // Record in SovereignGlobalState
      SovereignGlobalState.updateState({
        physics: {
          ...SovereignGlobalState.getState().physics,
          efficiency: 65 // Electrolyzer efficiency
        }
      });
    }
  }, [state.isIslandMode, state.marketDemand, state.excessPower]);

  const stopElectrolysis = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false, currentSession: null }));
    // In real implementation, this would call H2Synthesizer.stopCurrentSession()
  }, []);

  const toggleIslandMode = useCallback(() => {
    setState(prev => ({ ...prev, isIslandMode: !prev.isIslandMode }));
  }, []);

  const refuelUnit = useCallback((unitId: string) => {
    const result = H2Synthesizer.refuelUnit(unitId);
    if (result.success) {
      // Record in global state
      SovereignGlobalState.updateState({
        finance: {
          ...SovereignGlobalState.getState().finance,
          molecularDebtRate: -0.1 // H2 refuel cost
        }
      });
    }
    return result;
  }, []);

  const getStatusColor = (fillLevel: number) => {
    if (fillLevel < 20) return 'text-red-400';
    if (fillLevel < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'READY': return 'text-green-400';
      case 'LOW_FUEL': return 'text-yellow-400';
      case 'EMPTY': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-scada-panel border border-scada-border rounded-none shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-scada-muted uppercase font-mono">Storage Level</span>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${getStatusColor(state.storage.fillLevel)}`}>
            {state.storage.fillLevel.toFixed(1)}%
          </div>
          <div className="text-xs text-scada-muted font-mono">{state.storage.volume.toFixed(0)} / {state.storage.capacity} Nm³</div>
        </div>

        <div className="p-4 bg-scada-panel border border-scada-border rounded-none shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-scada-muted uppercase font-mono">Pressure</span>
          </div>
          <div className="text-2xl font-bold text-scada-text font-mono tabular-nums">
            {state.storage.pressure} <span className="text-sm">bar</span>
          </div>
          <div className="text-xs text-scada-muted font-mono">99.999% purity</div>
        </div>

        <div className="p-4 bg-scada-panel border border-scada-border rounded-none shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-scada-muted uppercase font-mono">Electrolyzer</span>
          </div>
          <div className="text-2xl font-bold text-scada-text font-mono tabular-nums">
            65 <span className="text-sm">%</span>
          </div>
          <div className="text-xs text-scada-muted font-mono">100 kW capacity</div>
        </div>

        <div className="p-4 bg-scada-panel border border-scada-border rounded-none shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-4 h-4 text-green-400" />
            <span className="text-xs text-scada-muted uppercase font-mono">Fuel Cells</span>
          </div>
          <div className="text-2xl font-bold text-scada-text font-mono tabular-nums">
            {state.fuelCellReadiness.ready}/{state.fuelCellReadiness.totalUnits}
          </div>
          <div className="text-xs text-scada-muted font-mono">units ready</div>
        </div>
      </div>

      {/* Island Mode Toggle */}
      <div className="p-4 bg-scada-panel border border-scada-border rounded-none shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${state.isIslandMode ? 'bg-cyan-500/20' : 'bg-scada-bg'}`}>
              <Power className={`w-5 h-5 ${state.isIslandMode ? 'text-cyan-400' : 'text-scada-muted'}`} />
            </div>
            <div>
              <div className="font-bold text-scada-text uppercase font-mono">Island Mode</div>
              <div className="text-xs text-scada-muted font-mono">
                {state.isIslandMode 
                  ? 'Auto-produce H2 when grid demand is zero' 
                  : 'Manual control only'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleIslandMode}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              state.isIslandMode ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <motion.div
              animate={{ x: state.isIslandMode ? 24 : 4 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* Electrolysis Control */}
      <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-scada-text uppercase font-mono">Electrolysis Control</span>
          </div>
          <div className={`px-3 py-1 rounded-sm text-xs font-bold font-mono ${
            state.isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-scada-bg text-scada-muted border border-scada-border'
          }`}>
            {state.isRunning ? 'RUNNING' : 'IDLE'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-scada-bg border border-scada-border p-3 rounded-sm">
            <div className="text-xs text-scada-muted uppercase font-mono">Power Input</div>
            <div className="text-xl font-bold text-scada-text font-mono tabular-nums">{state.isRunning ? '100' : '0'} kW</div>
          </div>
          <div className="bg-scada-bg border border-scada-border p-3 rounded-sm">
            <div className="text-xs text-scada-muted uppercase font-mono">H2 Production</div>
            <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
              {state.isRunning ? '21.7' : '0'} Nm³/h
            </div>
          </div>
          <div className="bg-scada-bg border border-scada-border p-3 rounded-sm">
            <div className="text-xs text-scada-muted uppercase font-mono">Session Status</div>
            <div className="text-xl font-bold text-scada-text font-mono tabular-nums">
              {state.currentSession?.status || 'STANDBY'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startElectrolysis}
            disabled={state.isRunning || state.storage.fillLevel >= 95}
            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/50 rounded-sm text-green-400 font-bold uppercase font-mono flex items-center justify-center gap-2"
          >
            <Power className="w-4 h-4" />
            Start Electrolysis
          </button>
          <button
            onClick={stopElectrolysis}
            disabled={!state.isRunning}
            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/50 rounded-sm text-red-400 font-bold uppercase font-mono flex items-center justify-center gap-2"
          >
            <Power className="w-4 h-4" />
            Stop Electrolysis
          </button>
        </div>
      </div>

      {/* Robotic Refueling */}
      <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-scada-text uppercase font-mono">Robotic Refueling</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setSelectedUnit('ROV-001')}
            className={`p-3 rounded-sm border text-left transition-colors ${
              selectedUnit === 'ROV-001' 
                ? 'border-amber-500/50 bg-amber-500/10' 
                : 'border-scada-border bg-scada-bg hover:bg-scada-panel'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-scada-text font-bold font-mono">ROV-001</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xs text-scada-muted font-mono">PEM Fuel Cell • 8h runtime</div>
          </button>

          <button
            onClick={() => setSelectedUnit('UAV-THERMAL-01')}
            className={`p-3 rounded-sm border text-left transition-colors ${
              selectedUnit === 'UAV-THERMAL-01' 
                ? 'border-amber-500/50 bg-amber-500/10' 
                : 'border-scada-border bg-scada-bg hover:bg-scada-panel'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-scada-text font-bold font-mono">UAV-THERMAL-01</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xs text-scada-muted font-mono">PEM Fuel Cell • 6h runtime</div>
          </button>
        </div>

        <button
          onClick={() => refuelUnit(selectedUnit)}
          disabled={state.storage.volume < 4}
          className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/50 rounded-sm text-amber-400 font-bold uppercase font-mono flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refuel {selectedUnit} ({selectedUnit === 'ROV-001' ? '4' : '1.8'} Nm³)
        </button>

        {state.storage.volume < 4 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-400 font-mono">
            <AlertTriangle className="w-4 h-4" />
            Insufficient H2 storage for refueling
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenHydrogenPanel;
