import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Thermometer, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

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

export const OilCoolerThermalEfficiencyLab: React.FC = () => {
  const [params, setParams] = useState<OilCoolerParams>({
    oilInletTemp: 65,
    oilOutletTemp: 45,
    waterInletTemp: 20,
    waterOutletTemp: 30,
    oilFlowRate: 100,
    waterFlowRate: 200
  });

  const [results, setResults] = useState<OilCoolerResults | null>(null);

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
      recommendations.push('🚨 Cooler degraded: Fouling > 30% - schedule cleaning immediately');
      recommendations.push('⚠️ Check for scaling or biofilm buildup');
    } else if (efficiencyStatus === 'ACCEPTABLE') {
      recommendations.push('⚠️ Cooler acceptable: Fouling 15-30% - plan cleaning at next maintenance');
    } else if (efficiencyStatus === 'GOOD') {
      recommendations.push('✅ Cooler good: Fouling 5-15% - monitor during routine inspection');
    } else {
      recommendations.push('✅ Cooler excellent: Fouling < 5% - continue normal operation');
    }

    if (params.oilOutletTemp > 50) {
      recommendations.push('🌡️ Oil outlet > 50°C: Check cooling capacity');
    }

    if (Math.abs(oilHeatTransfer - waterHeatTransfer) / avgHeatTransfer > 0.1) {
      recommendations.push('⚠️ Heat transfer imbalance: Check for leaks or flow measurement errors');
    }

    if (foulingPercentage < 0) {
      recommendations.push('📊 Heat transfer coefficient above nominal: Verify flow rate measurements');
    }

    return {
      heatTransferCoefficient,
      tubeFoulingPercentage: Math.max(0, foulingPercentage),
      efficiencyStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateThermalEfficiency);
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
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Oil Cooler <span className="text-cyan-400">Thermal Efficiency Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Heat transfer coefficient calculation and fouling prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Temperature & Flow Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Oil Inlet Temp (°C)"
                type="number"
                value={params.oilInletTemp}
                onChange={(e) => setParams({ ...params, oilInletTemp: parseFloat(e.target.value) || 0 })}
                icon={<Thermometer className="w-4 h-4" />}
                min="20"
                max="100"
              />
              <ModernInput
                label="Oil Outlet Temp (°C)"
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
                label="Water Inlet Temp (°C)"
                type="number"
                value={params.waterInletTemp}
                onChange={(e) => setParams({ ...params, waterInletTemp: parseFloat(e.target.value) || 0 })}
                icon={<Thermometer className="w-4 h-4" />}
                min="5"
                max="40"
              />
              <ModernInput
                label="Water Outlet Temp (°C)"
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
                label="Oil Flow Rate (L/min)"
                type="number"
                value={params.oilFlowRate}
                onChange={(e) => setParams({ ...params, oilFlowRate: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="10"
                max="500"
              />
              <ModernInput
                label="Water Flow Rate (L/min)"
                type="number"
                value={params.waterFlowRate}
                onChange={(e) => setParams({ ...params, waterFlowRate: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="10"
                max="1000"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Efficiency
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Thermal Efficiency Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.efficiencyStatus === 'DEGRADED' ? 'bg-red-950/20 border-red-500' : results.efficiencyStatus === 'ACCEPTABLE' ? 'bg-amber-950/20 border-amber-500' : results.efficiencyStatus === 'GOOD' ? 'bg-blue-950/20 border-blue-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Efficiency Status</p>
                    <p className="text-2xl font-black text-white">{results.efficiencyStatus}</p>
                  </div>
                  <Thermometer className={`w-12 h-12 ${results.efficiencyStatus === 'DEGRADED' ? 'text-red-400' : results.efficiencyStatus === 'ACCEPTABLE' ? 'text-amber-400' : results.efficiencyStatus === 'GOOD' ? 'text-blue-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Heat Transfer Coefficient</p>
                <p className="text-3xl font-black text-white">{results.heatTransferCoefficient.toFixed(0)} W/m²K</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tube Fouling Percentage</p>
                <p className="text-3xl font-black text-white">{results.tubeFoulingPercentage.toFixed(1)}%</p>
              </div>

              {results.recommendations.length > 0 && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Recommendations</p>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-cyan-400">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
