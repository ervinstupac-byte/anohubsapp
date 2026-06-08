import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Thermometer, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface ExcitationHeatDissipationParams {
  exciterCurrent: number; // A
  exciterVoltage: number; // V
  coolingAirTemp: number; // °C
}

interface ExcitationHeatDissipationResults {
  heatDissipation: number; // kW
  rectifierTemp: number; // °C
  dissipationStatus: 'ADEQUATE' | 'MARGINAL' | 'INSUFFICIENT';
  recommendations: string[];
}

export const ExcitationHeatDissipationLab: React.FC = () => {
  const [params, setParams] = useState<ExcitationHeatDissipationParams>({
    exciterCurrent: 500,
    exciterVoltage: 200,
    coolingAirTemp: 35
  });

  const [results, setResults] = useState<ExcitationHeatDissipationResults | null>(null);

  const calculateExcitationHeat = useMemo(() => {
    // Calculate heat dissipation
    // P = V × I
    const electricalPower = (params.exciterVoltage * params.exciterCurrent) / 1000; // kW
    const efficiency = 0.95; // 95% efficiency
    const heatDissipation = electricalPower * (1 - efficiency); // kW

    // Calculate rectifier temperature
    // Temperature depends on heat generation and cooling
    const thermalResistance = 0.5; // °C/kW (thermal resistance to ambient)
    const rectifierTemp = params.coolingAirTemp + (heatDissipation * thermalResistance);

    // Dissipation status assessment
    // Adequate: Rectifier temp < 80°C, Marginal: 80-100°C, Insufficient: > 100°C
    let dissipationStatus: 'ADEQUATE' | 'MARGINAL' | 'INSUFFICIENT' = 'ADEQUATE';
    if (rectifierTemp > 100) dissipationStatus = 'INSUFFICIENT';
    else if (rectifierTemp > 80) dissipationStatus = 'MARGINAL';

    const recommendations: string[] = [];
    if (dissipationStatus === 'INSUFFICIENT') {
      recommendations.push('🚨 Insufficient dissipation: Rectifier temp > 100°C - improve cooling immediately');
      recommendations.push('⚠️ High rectifier temperature - risk of component failure');
    } else if (dissipationStatus === 'MARGINAL') {
      recommendations.push('⚠️ Marginal dissipation: Rectifier temp 80-100°C - monitor closely');
      recommendations.push('📊 Check cooling fans and air flow');
    } else {
      recommendations.push('✅ Adequate dissipation: Rectifier temp < 80°C - normal operation');
    }

    if (heatDissipation > 10) {
      recommendations.push('⚠️ High heat dissipation > 10kW: Ensure adequate cooling capacity');
    }

    if (params.coolingAirTemp > 45) {
      recommendations.push('⚠️ High cooling air temperature: Reduced heat dissipation efficiency');
    }

    if (rectifierTemp > 110) {
      recommendations.push('🚨 Critical temperature: Immediate shutdown required to prevent damage');
    }

    return {
      heatDissipation,
      rectifierTemp,
      dissipationStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateExcitationHeat);
  };

  const handleReset = () => {
    setParams({
      exciterCurrent: 500,
      exciterVoltage: 200,
      coolingAirTemp: 35
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Excitation System <span className="text-cyan-400">Heat Dissipation Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Heat dissipation calculation and rectifier temperature prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Excitation Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Exciter Current (A)"
              type="number"
              value={params.exciterCurrent}
              onChange={(e) => setParams({ ...params, exciterCurrent: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="100"
              max="2000"
            />
            <ModernInput
              label="Exciter Voltage (V)"
              type="number"
              value={params.exciterVoltage}
              onChange={(e) => setParams({ ...params, exciterVoltage: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="50"
              max="500"
            />
            <ModernInput
              label="Cooling Air Temp (°C)"
              type="number"
              value={params.coolingAirTemp}
              onChange={(e) => setParams({ ...params, coolingAirTemp: parseFloat(e.target.value) || 0 })}
              icon={<Thermometer className="w-4 h-4" />}
              min="15"
              max="60"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Dissipation
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Dissipation Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.dissipationStatus === 'INSUFFICIENT' ? 'bg-red-950/20 border-red-500' : results.dissipationStatus === 'MARGINAL' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Dissipation Status</p>
                    <p className="text-2xl font-black text-white">{results.dissipationStatus}</p>
                  </div>
                  <Thermometer className={`w-12 h-12 ${results.dissipationStatus === 'INSUFFICIENT' ? 'text-red-400' : results.dissipationStatus === 'MARGINAL' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Heat Dissipation</p>
                <p className="text-3xl font-black text-white">{results.heatDissipation.toFixed(2)} kW</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rectifier Temperature</p>
                <p className="text-3xl font-black text-white">{results.rectifierTemp.toFixed(1)} °C</p>
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
