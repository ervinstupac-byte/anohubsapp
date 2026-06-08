import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface StayVaneCrackParams {
  crackLength: number; // mm
  stressIntensityFactor: number; // MPa√m
  materialFractureToughness: number; // MPa√m
}

interface StayVaneCrackResults {
  crackGrowthRate: number; // mm/cycle
  remainingFatigueLife: number; // cycles
  crackStatus: 'STABLE' | 'CRITICAL' | 'FAILURE';
  recommendations: string[];
}

export const StayVaneCrackLab: React.FC = () => {
  const [params, setParams] = useState<StayVaneCrackParams>({
    crackLength: 10,
    stressIntensityFactor: 30,
    materialFractureToughness: 50
  });

  const [results, setResults] = useState<StayVaneCrackResults | null>(null);

  const calculateStayVaneCrack = useMemo(() => {
    // Calculate crack growth rate using Paris' Law
    // da/dN = C × (ΔK)^m
    // Simplified: growth rate proportional to stress intensity factor
    const parisConstantC = 1e-10; // Material constant
    const parisExponentM = 3; // Material exponent
    const crackGrowthRate = parisConstantC * Math.pow(params.stressIntensityFactor, parisExponentM) * 1000; // mm/cycle

    // Calculate remaining fatigue life
    // Life = (a_critical - a_current) / (da/dN)
    const criticalCrackLength = (params.materialFractureToughness / params.stressIntensityFactor) * 20; // Simplified
    const crackLengthMm = params.crackLength;
    const remainingCrackGrowth = Math.max(0, criticalCrackLength - crackLengthMm);
    const remainingFatigueLife = remainingCrackGrowth / crackGrowthRate;

    // Crack status assessment
    // Stable: K < 0.7 K_IC, Critical: 0.7 K_IC < K < K_IC, Failure: K >= K_IC
    const stressRatio = params.stressIntensityFactor / params.materialFractureToughness;
    let crackStatus: 'STABLE' | 'CRITICAL' | 'FAILURE' = 'STABLE';
    if (stressRatio >= 1) crackStatus = 'FAILURE';
    else if (stressRatio > 0.7) crackStatus = 'CRITICAL';

    const recommendations: string[] = [];
    if (crackStatus === 'FAILURE') {
      recommendations.push('🚨 Failure imminent: Stress intensity >= fracture toughness - immediate shutdown');
      recommendations.push('⚠️ Crack will propagate catastrophically - do not operate');
    } else if (crackStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical crack: Stress intensity > 70% of toughness - immediate repair required');
      recommendations.push('⚠️ High crack growth rate - schedule repair as soon as possible');
    } else {
      recommendations.push('✅ Stable crack: Stress intensity < 70% of toughness - monitor regularly');
    }

    if (crackGrowthRate > 0.01) {
      recommendations.push('⚠️ High crack growth rate > 0.01 mm/cycle - accelerated crack propagation');
    }

    if (remainingFatigueLife < 10000) {
      recommendations.push('🔧 Low remaining life < 10,000 cycles - plan for repair or replacement');
    }

    if (params.crackLength > 50) {
      recommendations.push('⚠️ Large crack length > 50mm - significant structural compromise');
    }

    return {
      crackGrowthRate,
      remainingFatigueLife,
      crackStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateStayVaneCrack);
  };

  const handleReset = () => {
    setParams({
      crackLength: 10,
      stressIntensityFactor: 30,
      materialFractureToughness: 50
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Stay Vane <span className="text-cyan-400">Crack Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Crack propagation calculation and fatigue life prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Crack Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Crack Length (mm)"
              type="number"
              value={params.crackLength}
              onChange={(e) => setParams({ ...params, crackLength: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="200"
            />
            <ModernInput
              label="Stress Intensity Factor (MPa√m)"
              type="number"
              value={params.stressIntensityFactor}
              onChange={(e) => setParams({ ...params, stressIntensityFactor: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="5"
              max="100"
              step="0.1"
            />
            <ModernInput
              label="Material Fracture Toughness (MPa√m)"
              type="number"
              value={params.materialFractureToughness}
              onChange={(e) => setParams({ ...params, materialFractureToughness: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="20"
              max="150"
              step="1"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Crack
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Crack Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.crackStatus === 'FAILURE' ? 'bg-red-950/20 border-red-500' : results.crackStatus === 'CRITICAL' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Crack Status</p>
                    <p className="text-2xl font-black text-white">{results.crackStatus}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.crackStatus === 'FAILURE' ? 'text-red-400' : results.crackStatus === 'CRITICAL' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Crack Growth Rate</p>
                <p className="text-3xl font-black text-white">{results.crackGrowthRate.toFixed(6)} mm/cycle</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Remaining Fatigue Life</p>
                <p className="text-3xl font-black text-white">{results.remainingFatigueLife.toFixed(0)} cycles</p>
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
