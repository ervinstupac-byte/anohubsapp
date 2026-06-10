import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Thermometer, AlertTriangle, Activity, Settings } from 'lucide-react';
import { computeBearingOilCooling, BearingOilCoolingInput, BearingOilCoolingResult } from '../services/BearingOilCoolingSystem';

interface OilCoolerParams {
  oilInletTemp: number; // °C
  oilOutletTemp: number; // °C
  waterInletTemp: number; // °C
  waterOutletTemp: number; // °C
  oilFlowRate: number; // L/min
  waterFlowRate: number; // L/min
}

interface OilCoolerResults {
  heatTransferCoefficient: number; // W/m²K
  tubeFoulingPercentage: number; // %
  efficiencyStatus: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'DEGRADED';
  recommendations: string[];
}

interface BearingCoolingParams {
  oilInC: number; // °C
  oilOutC: number; // °C
  waterInC: number; // °C
  valvePositionPct: number; // 0-100%
  currentWaterFlow_m3h?: number; // m³/h
}

export const OilCoolerThermalEfficiencyLab: React.FC = () => {
  const [params, setParams] = useState<OilCoolerParams>({
    oilInletTemp: 65,
    oilOutletTemp: 45,
    waterInletTemp: 20,
    waterOutletTemp: 30,
    oilFlowRate: 100,
    waterFlowRate: 200
  });

  const [bearingParams, setBearingParams] = useState<BearingCoolingParams>({
    oilInC: 50,
    oilOutC: 40,
    waterInC: 20,
    valvePositionPct: 50,
    currentWaterFlow_m3h: 3.0
  });

  const [results, setResults] = useState<OilCoolerResults | null>(null);
  const [bearingResults, setBearingResults] = useState<BearingOilCoolingResult | null>(null);

  const calculateThermalEfficiency = useMemo(() => {
    // Calculate heat transfer rate
    // Q = m × c × ΔT
    const oilSpecificHeat = 2.0; // kJ/kg°C (typical for turbine oil)
    const waterSpecificHeat = 4.18; // kJ/kg°C
    const oilDensity = 0.87; // kg/L
    const waterDensity = 1.0; // kg/L

    const oilHeatTransfer = (params.oilFlowRate * oilDensity * oilSpecificHeat * (params.oilInletTemp - params.oilOutletTemp)) / 60; // kW
    const waterHeatTransfer = (params.waterFlowRate * waterDensity * waterSpecificHeat * (params.waterOutletTemp - params.waterInletTemp)) / 60; // kW

    // Average heat transfer rate (should be similar for both sides)
    const avgHeatTransfer = (oilHeatTransfer + waterHeatTransfer) / 2;

    // Calculate log mean temperature difference (LMTD)
    const deltaT1 = params.oilInletTemp - params.waterOutletTemp;
    const deltaT2 = params.oilOutletTemp - params.waterInletTemp;
    const lmtd = (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);

    // Calculate heat transfer coefficient (simplified)
    // U = Q / (A × LMTD)
    // Assuming heat transfer area of 10 m²
    const heatTransferArea = 10; // m²
    const heatTransferCoefficient = (avgHeatTransfer * 1000) / (heatTransferArea * lmtd); // W/m²K

    // Predict tube fouling percentage
    // Fouling reduces heat transfer coefficient
    const nominalCoefficient = 5000; // W/m²K (typical for clean cooler)
    const foulingPercentage = ((nominalCoefficient - heatTransferCoefficient) / nominalCoefficient) * 100;

    // Efficiency status assessment
    let efficiencyStatus: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' = 'EXCELLENT';
    if (foulingPercentage > 30) efficiencyStatus = 'DEGRADED';
    else if (foulingPercentage > 15) efficiencyStatus = 'ACCEPTABLE';
    else if (foulingPercentage > 5) efficiencyStatus = 'GOOD';

    const recommendations: string[] = [];
    if (efficiencyStatus === 'DEGRADED') {
      recommendations.push('Cooler degraded: Fouling > 30% - schedule cleaning immediately');
      recommendations.push('Check for scaling or biofilm buildup');
    } else if (efficiencyStatus === 'ACCEPTABLE') {
      recommendations.push('Cooler acceptable: Fouling 15-30% - plan cleaning at next maintenance');
    } else if (efficiencyStatus === 'GOOD') {
      recommendations.push('Cooler good: Fouling 5-15% - monitor during routine inspection');
    } else {
      recommendations.push('Cooler excellent: Fouling < 5% - continue normal operation');
    }

    if (params.oilOutletTemp > 50) {
      recommendations.push('Oil outlet > 50°C: Check cooling capacity');
    }

    if (Math.abs(oilHeatTransfer - waterHeatTransfer) / avgHeatTransfer > 0.1) {
      recommendations.push('Heat transfer imbalance: Check for leaks or flow measurement errors');
    }

    if (foulingPercentage < 0) {
      recommendations.push('Heat transfer coefficient above nominal: Verify flow rate measurements');
    }

    return {
      heatTransferCoefficient,
      tubeFoulingPercentage: Math.max(0, foulingPercentage),
      efficiencyStatus,
      recommendations
    };
  }, [params]);

  const calculateBearingCooling = useMemo(() => {
    const input: BearingOilCoolingInput = {
      oilInC: bearingParams.oilInC,
      oilOutC: bearingParams.oilOutC,
      waterInC: bearingParams.waterInC,
      valvePositionPct: bearingParams.valvePositionPct,
      currentWaterFlow_m3h: bearingParams.currentWaterFlow_m3h
    };
    return computeBearingOilCooling(input);
  }, [bearingParams]);

  const handleCalculate = () => {
    setResults(calculateThermalEfficiency);
    setBearingResults(calculateBearingCooling);
  };

  const handleReset = () => {
    setParams({
      oilInletTemp: 65,
      oilOutletTemp: 45,
      waterInletTemp: 20,
      waterOutletTemp: 30,
      oilFlowRate: 100,
      waterFlowRate: 200
    });
    setBearingParams({
      oilInC: 50,
      oilOutC: 40,
      waterInC: 20,
      valvePositionPct: 50,
      currentWaterFlow_m3h: 3.0
    });
    setResults(null);
    setBearingResults(null);
  };

  const getStatusColor = (controlAction: string) => {
    if (controlAction === 'increase_flow' || controlAction === 'decrease_flow') return 'bg-amber-950/20 border-amber-500';
    return 'bg-emerald-950/20 border-emerald-500';
  };

  const getStatusIconColor = (controlAction: string) => {
    if (controlAction === 'increase_flow' || controlAction === 'decrease_flow') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
            Oil Cooler Thermal Efficiency Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Heat transfer coefficient, fouling prediction & bearing cooling control
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* First Column: Input Cards */}
        <div className="space-y-8">
          <GlassCard title="Thermal Efficiency Parameters" className="border-t-4 border-t-slate-500">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="Oil Inlet (°C)"
                  type="number"
                  value={params.oilInletTemp}
                  onChange={(e) => setParams({ ...params, oilInletTemp: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="20"
                  max="100"
                />
                <ModernInput
                  label="Oil Outlet (°C)"
                  type="number"
                  value={params.oilOutletTemp}
                  onChange={(e) => setParams({ ...params, oilOutletTemp: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="20"
                  max="100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="Water Inlet (°C)"
                  type="number"
                  value={params.waterInletTemp}
                  onChange={(e) => setParams({ ...params, waterInletTemp: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="5"
                  max="40"
                />
                <ModernInput
                  label="Water Outlet (°C)"
                  type="number"
                  value={params.waterOutletTemp}
                  onChange={(e) => setParams({ ...params, waterOutletTemp: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="5"
                  max="50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="Oil Flow (L/min)"
                  type="number"
                  value={params.oilFlowRate}
                  onChange={(e) => setParams({ ...params, oilFlowRate: parseFloat(e.target.value) || 0 })}
                  icon={<Activity className="w-4 h-4" />}
                  min="10"
                  max="500"
                />
                <ModernInput
                  label="Water Flow (L/min)"
                  type="number"
                  value={params.waterFlowRate}
                  onChange={(e) => setParams({ ...params, waterFlowRate: parseFloat(e.target.value) || 0 })}
                  icon={<Activity className="w-4 h-4" />}
                  min="10"
                  max="1000"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Bearing Cooling Control" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="Oil In (°C)"
                  type="number"
                  value={bearingParams.oilInC}
                  onChange={(e) => setBearingParams({ ...bearingParams, oilInC: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="20"
                  max="80"
                />
                <ModernInput
                  label="Oil Out (°C)"
                  type="number"
                  value={bearingParams.oilOutC}
                  onChange={(e) => setBearingParams({ ...bearingParams, oilOutC: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="20"
                  max="80"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="Water In (°C)"
                  type="number"
                  value={bearingParams.waterInC}
                  onChange={(e) => setBearingParams({ ...bearingParams, waterInC: parseFloat(e.target.value) || 0 })}
                  icon={<Thermometer className="w-4 h-4" />}
                  min="5"
                  max="40"
                />
                <ModernInput
                  label="Water Flow (m³/h)"
                  type="number"
                  value={bearingParams.currentWaterFlow_m3h}
                  onChange={(e) => setBearingParams({ ...bearingParams, currentWaterFlow_m3h: parseFloat(e.target.value) || 0 })}
                  icon={<Activity className="w-4 h-4" />}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <ModernInput
                label="Valve Position (%)"
                type="number"
                value={bearingParams.valvePositionPct}
                onChange={(e) => setBearingParams({ ...bearingParams, valvePositionPct: parseFloat(e.target.value) || 0 })}
                icon={<Settings className="w-4 h-4" />}
                min="0"
                max="100"
              />
              <div className="flex gap-4 pt-2">
                <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                  Calculate
                </ModernButton>
                <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                  Reset
                </ModernButton>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Second Column: Results */}
        <div className="space-y-8">
          {results && (
            <GlassCard title="Thermal Efficiency" className="border-t-4 border-t-slate-600">
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${getStatusColor(results.efficiencyStatus === 'DEGRADED' ? 'increase_flow' : 'hold')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-xl font-bold text-slate-100">{results.efficiencyStatus}</p>
                    </div>
                    <Thermometer className={`w-10 h-10 ${getStatusIconColor(results.efficiencyStatus === 'DEGRADED' ? 'increase_flow' : 'hold')}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Heat Transfer Coeff.</p>
                    <p className="text-2xl font-semibold text-slate-100">{results.heatTransferCoefficient.toFixed(0)} W/m²K</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tube Fouling</p>
                    <p className="text-2xl font-semibold text-slate-100">{results.tubeFoulingPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                {results.recommendations.length > 0 && (
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Recommendations</p>
                    <div className="space-y-2 text-sm text-slate-300">
                      {results.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {bearingResults && (
            <GlassCard title="Bearing Cooling" className="border-t-4 border-t-slate-700">
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${getStatusColor(bearingResults.controlAction)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Control Action</p>
                      <p className="text-xl font-bold text-slate-100">{bearingResults.controlAction}</p>
                    </div>
                    <Settings className={`w-10 h-10 ${getStatusIconColor(bearingResults.controlAction)}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Oil Viscosity</p>
                    <p className="text-2xl font-semibold text-slate-100">{bearingResults.oilViscosity_cP} cP</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Target Viscosity Range</p>
                    <p className="text-lg font-semibold text-slate-100">{bearingResults.targetViscosityRange_cP[0]} - {bearingResults.targetViscosityRange_cP[1]} cP</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Recommended Valve</p>
                    <p className="text-2xl font-semibold text-slate-100">{bearingResults.recommendedValvePositionPct.toFixed(0)}%</p>
                  </div>
                  {bearingResults.recommendedWaterFlow_m3h !== undefined && (
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Recommended Flow</p>
                      <p className="text-2xl font-semibold text-slate-100">{bearingResults.recommendedWaterFlow_m3h.toFixed(1)} m³/h</p>
                    </div>
                  )}
                </div>

                {bearingResults.notes && (
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Notes</p>
                    <p className="text-sm text-slate-300">{bearingResults.notes}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
