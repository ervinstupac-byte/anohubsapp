import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Zap, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface BlackStartParams {
  dcBatteryVoltage: number; // V
  auxiliaryPowerCapacity: number; // kW
  requiredStartingEnergy: number; // kWh
}

interface BlackStartResults {
  blackStartMargin: number; // %
  successfulStartProbability: number; // %
  blackStartStatus: 'CAPABLE' | 'MARGINAL' | 'INCAPABLE';
  recommendations: string[];
}

export const BlackStartCapabilityLab: React.FC = () => {
  const [params, setParams] = useState<BlackStartParams>({
    dcBatteryVoltage: 110,
    auxiliaryPowerCapacity: 500,
    requiredStartingEnergy: 300
  });

  const [results, setResults] = useState<BlackStartResults | null>(null);

  const calculateBlackStart = useMemo(() => {
    // Calculate black start margin
    // Margin depends on battery voltage and auxiliary power capacity
    const nominalVoltage = 125; // V (nominal DC voltage)
    const voltageMargin = (params.dcBatteryVoltage / nominalVoltage) * 100;
    const powerMargin = (params.auxiliaryPowerCapacity / params.requiredStartingEnergy) * 100;
    const blackStartMargin = (voltageMargin + powerMargin) / 2;

    // Calculate successful start probability
    // Probability depends on margin and system readiness
    const marginFactor = blackStartMargin / 100;
    const baseProbability = 0.8; // 80% base probability
    const successfulStartProbability = baseProbability + (marginFactor * 0.2);

    // Black start status assessment
    // Capable: > 80%, Marginal: 50-80%, Incapable: < 50%
    let blackStartStatus: 'CAPABLE' | 'MARGINAL' | 'INCAPABLE' = 'CAPABLE';
    if (blackStartMargin < 50) blackStartStatus = 'INCAPABLE';
    else if (blackStartMargin < 80) blackStartStatus = 'MARGINAL';

    const recommendations: string[] = [];
    if (blackStartStatus === 'INCAPABLE') {
      recommendations.push('🚨 Incapable of black start: Margin < 50% - system cannot start without grid');
      recommendations.push('⚠️ Upgrade auxiliary power or battery system');
    } else if (blackStartStatus === 'MARGINAL') {
      recommendations.push('⚠️ Marginal black start: Margin 50-80% - may fail under adverse conditions');
      recommendations.push('📊 Consider increasing auxiliary power capacity');
    } else {
      recommendations.push('✅ Capable of black start: Margin > 80% - reliable black start capability');
    }

    if (params.dcBatteryVoltage < 100) {
      recommendations.push('⚠️ Low battery voltage: May not provide sufficient starting power');
    }

    if (successfulStartProbability < 0.7) {
      recommendations.push('⚠️ Low start probability < 70%: Risk of black start failure');
    }

    if (params.auxiliaryPowerCapacity < params.requiredStartingEnergy) {
      recommendations.push('⚠️ Insufficient auxiliary power: Capacity below required energy');
    }

    if (blackStartMargin > 120) {
      recommendations.push('✅ Excellent margin: System has significant black start reserve');
    }

    return {
      blackStartMargin,
      successfulStartProbability,
      blackStartStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateBlackStart);
  };

  const handleReset = () => {
    setParams({
      dcBatteryVoltage: 110,
      auxiliaryPowerCapacity: 500,
      requiredStartingEnergy: 300
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Black Start <span className="text-cyan-400">Capability Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Black start margin calculation and start probability prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Black Start Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="DC Battery Voltage (V)"
              type="number"
              value={params.dcBatteryVoltage}
              onChange={(e) => setParams({ ...params, dcBatteryVoltage: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="50"
              max="250"
            />
            <ModernInput
              label="Auxiliary Power Capacity (kW)"
              type="number"
              value={params.auxiliaryPowerCapacity}
              onChange={(e) => setParams({ ...params, auxiliaryPowerCapacity: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="100"
              max="2000"
            />
            <ModernInput
              label="Required Starting Energy (kWh)"
              type="number"
              value={params.requiredStartingEnergy}
              onChange={(e) => setParams({ ...params, requiredStartingEnergy: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="50"
              max="1000"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Black Start
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Black Start Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.blackStartStatus === 'INCAPABLE' ? 'bg-red-950/20 border-red-500' : results.blackStartStatus === 'MARGINAL' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Black Start Status</p>
                    <p className="text-2xl font-black text-white">{results.blackStartStatus}</p>
                  </div>
                  <Zap className={`w-12 h-12 ${results.blackStartStatus === 'INCAPABLE' ? 'text-red-400' : results.blackStartStatus === 'MARGINAL' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Black Start Margin</p>
                <p className="text-3xl font-black text-white">{results.blackStartMargin.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Successful Start Probability</p>
                <p className="text-3xl font-black text-white">{results.successfulStartProbability.toFixed(1)}%</p>
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
