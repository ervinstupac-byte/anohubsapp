import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Zap, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface RotorPoleImpedanceParams {
  poleResistance: number; // mΩ
  numberOfPoles: number;
  operatingCurrent: number; // A
}

interface RotorPoleImpedanceResults {
  impedanceImbalance: number; // %
  poleHeating: number; // °C
  impedanceStatus: 'BALANCED' | 'IMBALANCED' | 'CRITICAL';
  recommendations: string[];
}

export const RotorPoleImpedanceLab: React.FC = () => {
  const [params, setParams] = useState<RotorPoleImpedanceParams>({
    poleResistance: 50,
    numberOfPoles: 12,
    operatingCurrent: 500
  });

  const [results, setResults] = useState<RotorPoleImpedanceResults | null>(null);

  const calculateRotorPoleImpedance = useMemo(() => {
    // Calculate impedance imbalance
    // Assume a 5% variation between poles for calculation
    const resistanceVariation = 0.05; // 5% variation
    const maxResistance = params.poleResistance * (1 + resistanceVariation);
    const minResistance = params.poleResistance * (1 - resistanceVariation);
    const impedanceImbalance = ((maxResistance - minResistance) / params.poleResistance) * 100;

    // Calculate pole heating
    // Heating depends on resistance and current (I²R)
    const polePower = Math.pow(params.operatingCurrent, 2) * (params.poleResistance / 1000); // kW
    const thermalResistance = 2; // °C/kW
    const poleHeating = polePower * thermalResistance;

    // Impedance status assessment
    // Balanced: < 5%, Imbalanced: 5-10%, Critical: > 10%
    let impedanceStatus: 'BALANCED' | 'IMBALANCED' | 'CRITICAL' = 'BALANCED';
    if (impedanceImbalance > 10) impedanceStatus = 'CRITICAL';
    else if (impedanceImbalance > 5) impedanceStatus = 'IMBALANCED';

    const recommendations: string[] = [];
    if (impedanceStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical impedance imbalance: > 10% - immediate pole inspection required');
      recommendations.push('⚠️ High pole heating - risk of insulation damage');
    } else if (impedanceStatus === 'IMBALANCED') {
      recommendations.push('⚠️ Impedance imbalance: 5-10% - monitor pole resistance');
      recommendations.push('📊 Check for loose connections or damaged windings');
    } else {
      recommendations.push('✅ Balanced impedance: < 5% - normal operation');
    }

    if (poleHeating > 50) {
      recommendations.push('⚠️ High pole heating > 50°C: Risk of thermal damage');
    }

    if (params.operatingCurrent > 1000) {
      recommendations.push('⚠️ High operating current: Increased heating and stress');
    }

    if (impedanceImbalance > 15) {
      recommendations.push('🚨 Very high imbalance: Risk of rotor vibration and bearing damage');
    }

    return {
      impedanceImbalance,
      poleHeating,
      impedanceStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateRotorPoleImpedance);
  };

  const handleReset = () => {
    setParams({
      poleResistance: 50,
      numberOfPoles: 12,
      operatingCurrent: 500
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Rotor Pole <span className="text-cyan-400">Impedance Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Impedance imbalance calculation and pole heating prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Pole Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Pole Resistance (mΩ)"
              type="number"
              value={params.poleResistance}
              onChange={(e) => setParams({ ...params, poleResistance: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="10"
              max="200"
            />
            <ModernInput
              label="Number of Poles"
              type="number"
              value={params.numberOfPoles}
              onChange={(e) => setParams({ ...params, numberOfPoles: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="4"
              max="48"
            />
            <ModernInput
              label="Operating Current (A)"
              type="number"
              value={params.operatingCurrent}
              onChange={(e) => setParams({ ...params, operatingCurrent: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="100"
              max="5000"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Impedance
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Impedance Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.impedanceStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.impedanceStatus === 'IMBALANCED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Impedance Status</p>
                    <p className="text-2xl font-black text-white">{results.impedanceStatus}</p>
                  </div>
                  <Zap className={`w-12 h-12 ${results.impedanceStatus === 'CRITICAL' ? 'text-red-400' : results.impedanceStatus === 'IMBALANCED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Impedance Imbalance</p>
                <p className="text-3xl font-black text-white">{results.impedanceImbalance.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pole Heating</p>
                <p className="text-3xl font-black text-white">{results.poleHeating.toFixed(1)} °C</p>
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
