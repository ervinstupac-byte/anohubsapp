import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Thermometer, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';

interface BearingCoolingWaterFlowParams {
  coolingWaterInletTemp: number; // °C
  bearingOilTemp: number; // °C
  waterFlowRate: number; // L/min
}

interface BearingCoolingWaterFlowResults {
  heatRemovalRate: number; // kW
  bearingTempRise: number; // °C
  coolingStatus: 'ADEQUATE' | 'MARGINAL' | 'INSUFFICIENT';
  recommendations: string[];
}

export const BearingCoolingWaterFlowLab: React.FC = () => {
  const [params, setParams] = useState<BearingCoolingWaterFlowParams>({
    coolingWaterInletTemp: 25,
    bearingOilTemp: 65,
    waterFlowRate: 100
  });

  const [results, setResults] = useState<BearingCoolingWaterFlowResults | null>(null);

  const calculateBearingCooling = useMemo(() => {
    // Calculate heat removal rate
    // Q = m × c × ΔT
    const waterSpecificHeat = 4.18; // kJ/kg·°C
    const waterDensity = 1; // kg/L
    const massFlowRate = (params.waterFlowRate / 60) * waterDensity; // kg/s
    const tempDifference = params.bearingOilTemp - params.coolingWaterInletTemp;
    const heatRemovalRate = massFlowRate * waterSpecificHeat * tempDifference; // kW

    // Calculate bearing temperature rise
    // Rise depends on heat generation vs removal
    const heatGeneration = 50; // kW (assumed bearing heat generation)
    const netHeat = heatGeneration - heatRemovalRate;
    const bearingTempRise = netHeat / massFlowRate / waterSpecificHeat; // °C

    // Cooling status assessment
    // Adequate: Heat removal > 45 kW, Marginal: 35-45 kW, Insufficient: < 35 kW
    let coolingStatus: 'ADEQUATE' | 'MARGINAL' | 'INSUFFICIENT' = 'ADEQUATE';
    if (heatRemovalRate < 35) coolingStatus = 'INSUFFICIENT';
    else if (heatRemovalRate < 45) coolingStatus = 'MARGINAL';

    const recommendations: string[] = [];
    if (coolingStatus === 'INSUFFICIENT') {
      recommendations.push('🚨 Insufficient cooling: Heat removal < 35 kW - increase water flow rate');
      recommendations.push('⚠️ High bearing temperature rise - risk of bearing damage');
    } else if (coolingStatus === 'MARGINAL') {
      recommendations.push('⚠️ Marginal cooling: Heat removal 35-45 kW - monitor bearing temperature');
      recommendations.push('📊 Consider increasing flow rate or improving heat exchange');
    } else {
      recommendations.push('✅ Adequate cooling: Heat removal > 45 kW - normal operation');
    }

    if (bearingTempRise > 10) {
      recommendations.push('⚠️ High temperature rise > 10°C: Risk of overheating');
    }

    if (params.waterFlowRate < 50) {
      recommendations.push('⚠️ Low water flow rate: May not provide sufficient cooling');
    }

    if (params.coolingWaterInletTemp > 35) {
      recommendations.push('⚠️ High inlet temperature: Reduced cooling efficiency');
    }

    if (params.bearingOilTemp > 80) {
      recommendations.push('⚠️ High bearing oil temperature: Check cooling system immediately');
    }

    return {
      heatRemovalRate,
      bearingTempRise,
      coolingStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateBearingCooling);
  };

  const handleReset = () => {
    setParams({
      coolingWaterInletTemp: 25,
      bearingOilTemp: 65,
      waterFlowRate: 100
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Bearing Cooling <span className="text-cyan-400">Water Flow Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Heat removal calculation and bearing temperature prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Cooling Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Cooling Water Inlet Temp (°C)"
              type="number"
              value={params.coolingWaterInletTemp}
              onChange={(e) => setParams({ ...params, coolingWaterInletTemp: parseFloat(e.target.value) || 0 })}
              icon={<Thermometer className="w-4 h-4" />}
              min="10"
              max="50"
            />
            <ModernInput
              label="Bearing Oil Temp (°C)"
              type="number"
              value={params.bearingOilTemp}
              onChange={(e) => setParams({ ...params, bearingOilTemp: parseFloat(e.target.value) || 0 })}
              icon={<Thermometer className="w-4 h-4" />}
              min="30"
              max="100"
            />
            <ModernInput
              label="Water Flow Rate (L/min)"
              type="number"
              value={params.waterFlowRate}
              onChange={(e) => setParams({ ...params, waterFlowRate: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="10"
              max="500"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Cooling
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Cooling Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.coolingStatus === 'INSUFFICIENT' ? 'bg-red-950/20 border-red-500' : results.coolingStatus === 'MARGINAL' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cooling Status</p>
                    <p className="text-2xl font-black text-white">{results.coolingStatus}</p>
                  </div>
                  <Droplets className={`w-12 h-12 ${results.coolingStatus === 'INSUFFICIENT' ? 'text-red-400' : results.coolingStatus === 'MARGINAL' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Heat Removal Rate</p>
                <p className="text-3xl font-black text-white">{results.heatRemovalRate.toFixed(1)} kW</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bearing Temp Rise</p>
                <p className="text-3xl font-black text-white">{results.bearingTempRise.toFixed(2)} °C</p>
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
