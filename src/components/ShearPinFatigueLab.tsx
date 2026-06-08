import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface ShearPinParams {
  shearPinDiameter: number; // mm
  materialYieldStrength: number; // MPa
  loadCycleCount: number; // cycles
}

interface ShearPinResults {
  fatigueDamageAccumulation: number; // %
  remainingPinLife: number; // cycles
  pinStatus: 'GOOD' | 'DEGRADED' | 'CRITICAL';
  recommendations: string[];
}

export const ShearPinFatigueLab: React.FC = () => {
  const [params, setParams] = useState<ShearPinParams>({
    shearPinDiameter: 20,
    materialYieldStrength: 400,
    loadCycleCount: 50000
  });

  const [results, setResults] = useState<ShearPinResults | null>(null);

  const calculateShearPin = useMemo(() => {
    // Calculate fatigue damage accumulation using Miner's Rule
    // D = Σ (n/N)
    // Simplified: damage depends on stress ratio and cycle count
    const pinArea = Math.PI * Math.pow(params.shearPinDiameter / 2, 2); // mm²
    const stressPerCycle = 1000 / pinArea; // MPa (assumed 1000N load)
    const stressRatio = stressPerCycle / params.materialYieldStrength;
    
    // S-N curve approximation (Basquin's equation)
    const enduranceLimit = params.materialYieldStrength * 0.5; // MPa
    const fatigueStrength = enduranceLimit * Math.pow(1000, -0.1); // At 1000 cycles
    const cyclesToFailure = Math.pow(params.materialYieldStrength / stressPerCycle, 10) * 1000;
    
    const fatigueDamageAccumulation = (params.loadCycleCount / cyclesToFailure) * 100;
    const remainingPinLife = Math.max(0, cyclesToFailure - params.loadCycleCount);

    // Pin status assessment
    // Good: < 50%, Degraded: 50-90%, Critical: > 90%
    let pinStatus: 'GOOD' | 'DEGRADED' | 'CRITICAL' = 'GOOD';
    if (fatigueDamageAccumulation > 90) pinStatus = 'CRITICAL';
    else if (fatigueDamageAccumulation > 50) pinStatus = 'DEGRADED';

    const recommendations: string[] = [];
    if (pinStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical fatigue: Damage > 90% - immediate pin replacement required');
      recommendations.push('⚠️ High risk of pin failure during load rejection');
    } else if (pinStatus === 'DEGRADED') {
      recommendations.push('⚠️ Degraded pin: Damage 50-90% - plan replacement at next maintenance');
      recommendations.push('📊 Monitor for signs of wear or deformation');
    } else {
      recommendations.push('✅ Good pin: Damage < 50% - normal operation');
    }

    if (stressRatio > 0.8) {
      recommendations.push('⚠️ High stress ratio > 0.8: Pin operating near yield strength');
    }

    if (remainingPinLife < 10000) {
      recommendations.push('🔧 Low remaining life < 10,000 cycles: Schedule replacement soon');
    }

    if (params.shearPinDiameter < 15) {
      recommendations.push('⚠️ Small pin diameter: Consider larger pin for better fatigue life');
    }

    return {
      fatigueDamageAccumulation,
      remainingPinLife,
      pinStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateShearPin);
  };

  const handleReset = () => {
    setParams({
      shearPinDiameter: 20,
      materialYieldStrength: 400,
      loadCycleCount: 50000
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Shear Pin <span className="text-cyan-400">Fatigue Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Fatigue damage calculation and remaining life prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Shear Pin Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Shear Pin Diameter (mm)"
              type="number"
              value={params.shearPinDiameter}
              onChange={(e) => setParams({ ...params, shearPinDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10"
              max="50"
            />
            <ModernInput
              label="Material Yield Strength (MPa)"
              type="number"
              value={params.materialYieldStrength}
              onChange={(e) => setParams({ ...params, materialYieldStrength: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="200"
              max="1000"
            />
            <ModernInput
              label="Load Cycle Count"
              type="number"
              value={params.loadCycleCount}
              onChange={(e) => setParams({ ...params, loadCycleCount: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="1000000"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Fatigue
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Fatigue Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.pinStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.pinStatus === 'DEGRADED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pin Status</p>
                    <p className="text-2xl font-black text-white">{results.pinStatus}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.pinStatus === 'CRITICAL' ? 'text-red-400' : results.pinStatus === 'DEGRADED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fatigue Damage Accumulation</p>
                <p className="text-3xl font-black text-white">{results.fatigueDamageAccumulation.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Remaining Pin Life</p>
                <p className="text-3xl font-black text-white">{results.remainingPinLife.toFixed(0)} cycles</p>
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
