import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface IndexTestingParams {
  grossHead: number; // meters
  netHead: number; // meters
  flowRate: number; // m³/s
  generatorOutputPower: number; // MW
}

interface IndexTestingResults {
  thermodynamicEfficiency: number; // %
  cavitationFreeRange: string; // % of rated head
  efficiencyStatus: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  recommendations: string[];
}

export const IndexTestingEfficiencyLab: React.FC = () => {
  const [params, setParams] = useState<IndexTestingParams>({
    grossHead: 100,
    netHead: 95,
    flowRate: 50,
    generatorOutputPower: 40
  });

  const [results, setResults] = useState<IndexTestingResults | null>(null);

  const calculateEfficiency = useMemo(() => {
    // Calculate thermodynamic efficiency
    // η = (P_out) / (ρ × g × Q × H_net)
    const waterDensity = 1000; // kg/m³
    const gravity = 9.81; // m/s²
    const hydraulicPower = (waterDensity * gravity * params.flowRate * params.netHead) / 1000000; // MW
    const generatorEfficiency = 0.97; // Assumed generator efficiency
    const turbinePower = params.generatorOutputPower / generatorEfficiency;
    const thermodynamicEfficiency = (turbinePower / hydraulicPower) * 100;

    // Calculate head loss percentage
    const headLoss = params.grossHead - params.netHead;
    const headLossPercentage = (headLoss / params.grossHead) * 100;

    // Determine cavitation-free operating range
    // Based on Thoma number and head conditions
    const thomaNumber = 0.1; // Typical for Francis turbines
    const cavitationMargin = (params.netHead - params.grossHead * 0.7) / params.grossHead;
    let cavitationFreeRange = '70-100%';
    if (cavitationMargin < 0.1) cavitationFreeRange = '80-100%';
    if (cavitationMargin < 0) cavitationFreeRange = '90-100%';

    // Efficiency status assessment
    // Excellent: > 92%, Good: 88-92%, Acceptable: 82-88%, Poor: < 82%
    let efficiencyStatus: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' = 'EXCELLENT';
    if (thermodynamicEfficiency < 82) efficiencyStatus = 'POOR';
    else if (thermodynamicEfficiency < 88) efficiencyStatus = 'ACCEPTABLE';
    else if (thermodynamicEfficiency < 92) efficiencyStatus = 'GOOD';

    const recommendations: string[] = [];
    if (efficiencyStatus === 'POOR') {
      recommendations.push('🚨 Poor efficiency: < 82% - investigate losses and turbine condition');
      recommendations.push('⚠️ Check for cavitation, wear, or hydraulic losses');
    } else if (efficiencyStatus === 'ACCEPTABLE') {
      recommendations.push('⚠️ Acceptable efficiency: 82-88% - monitor for degradation');
      recommendations.push('📊 Schedule performance testing to track trends');
    } else if (efficiencyStatus === 'GOOD') {
      recommendations.push('✅ Good efficiency: 88-92% - normal operation');
    } else {
      recommendations.push('✅ Excellent efficiency: > 92% - optimal performance');
    }

    if (headLossPercentage > 10) {
      recommendations.push('⚠️ High head loss > 10%: Check penstock and intake losses');
    }

    if (thermodynamicEfficiency > 95) {
      recommendations.push('📊 Efficiency > 95%: Verify measurement accuracy - may be unrealistic');
    }

    if (cavitationFreeRange === '90-100%') {
      recommendations.push('💧 Narrow cavitation-free range: Avoid partial load operation');
    }

    return {
      thermodynamicEfficiency,
      cavitationFreeRange,
      efficiencyStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateEfficiency);
  };

  const handleReset = () => {
    setParams({
      grossHead: 100,
      netHead: 95,
      flowRate: 50,
      generatorOutputPower: 40
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Index Testing <span className="text-cyan-400">Efficiency Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Thermodynamic efficiency calculation and cavitation-free range prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Index Testing Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Gross Head (m)"
                type="number"
                value={params.grossHead}
                onChange={(e) => setParams({ ...params, grossHead: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="10"
                max="500"
              />
              <ModernInput
                label="Net Head (m)"
                type="number"
                value={params.netHead}
                onChange={(e) => setParams({ ...params, netHead: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="10"
                max="500"
              />
            </div>
            <ModernInput
              label="Flow Rate (m³/s)"
              type="number"
              value={params.flowRate}
              onChange={(e) => setParams({ ...params, flowRate: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="5"
              max="500"
            />
            <ModernInput
              label="Generator Output Power (MW)"
              type="number"
              value={params.generatorOutputPower}
              onChange={(e) => setParams({ ...params, generatorOutputPower: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="1"
              max="500"
            />

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
          <GlassCard title="Efficiency Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.efficiencyStatus === 'POOR' ? 'bg-red-950/20 border-red-500' : results.efficiencyStatus === 'ACCEPTABLE' ? 'bg-amber-950/20 border-amber-500' : results.efficiencyStatus === 'GOOD' ? 'bg-blue-950/20 border-blue-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Efficiency Status</p>
                    <p className="text-2xl font-black text-white">{results.efficiencyStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.efficiencyStatus === 'POOR' ? 'text-red-400' : results.efficiencyStatus === 'ACCEPTABLE' ? 'text-amber-400' : results.efficiencyStatus === 'GOOD' ? 'text-blue-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thermodynamic Efficiency</p>
                <p className="text-3xl font-black text-white">{results.thermodynamicEfficiency.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cavitation-Free Range</p>
                <p className="text-3xl font-black text-white">{results.cavitationFreeRange}</p>
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
