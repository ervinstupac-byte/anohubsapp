import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface SurgeParams {
  runnerDischargeDiameter: number; // meters
  partLoadFlowRate: number; // m³/s
  vortexRopeSwirlSpeed: number; // m/s
}

interface SurgeResults {
  rheingansFrequency: number; // Hz
  penstockResonanceOverlap: 'LOW' | 'MEDIUM' | 'HIGH';
  surgeAmplitude: number; // %
  recommendations: string[];
}

export const DraftTubeSurgeLab: React.FC = () => {
  const [params, setParams] = useState<SurgeParams>({
    runnerDischargeDiameter: 2.5,
    partLoadFlowRate: 25,
    vortexRopeSwirlSpeed: 5
  });

  const [results, setResults] = useState<SurgeResults | null>(null);

  const calculateSurge = useMemo(() => {
    // Calculate Rheingans frequency
    // f_R = (g / H)^(1/2) / (2π) × (A_t / A_d)^(1/2)
    // Simplified: f_R ≈ 0.3 × (Q / D²) × (1 / √H)
    const g = 9.81; // m/s²
    const assumedHead = 100; // meters (typical operating head)
    const dischargeArea = Math.PI * Math.pow(params.runnerDischargeDiameter / 2, 2);
    const rheingansFrequency = 0.3 * (params.partLoadFlowRate / dischargeArea) * (1 / Math.sqrt(assumedHead));

    // Calculate penstock resonance overlap risk
    // Penstock natural frequency typically 0.2-0.5 Hz for large systems
    const penstockNaturalFreq = 0.35; // Hz (typical)
    const frequencyRatio = rheingansFrequency / penstockNaturalFreq;
    
    // Surge amplitude estimation based on flow conditions
    const flowFactor = params.partLoadFlowRate / 50; // Normalized against 50 m³/s
    const swirlFactor = params.vortexRopeSwirlSpeed / 10; // Normalized against 10 m/s
    const surgeAmplitude = (flowFactor * swirlFactor) * 100;

    // Resonance overlap assessment
    let penstockResonanceOverlap: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (frequencyRatio > 0.9 || frequencyRatio < 0.1) penstockResonanceOverlap = 'HIGH';
    else if (frequencyRatio > 0.7 || frequencyRatio < 0.3) penstockResonanceOverlap = 'MEDIUM';

    const recommendations: string[] = [];
    if (penstockResonanceOverlap === 'HIGH') {
      recommendations.push('🚨 High resonance overlap risk: Rheingans frequency near penstock natural frequency');
      recommendations.push('⚠️ Risk of severe pressure pulsations - modify operating conditions');
    } else if (penstockResonanceOverlap === 'MEDIUM') {
      recommendations.push('⚠️ Moderate resonance overlap: Monitor pressure pulsations during operation');
      recommendations.push('📊 Consider air admission or runner modification');
    } else {
      recommendations.push('✅ Low resonance overlap: Normal operation - continue monitoring');
    }

    if (surgeAmplitude > 30) {
      recommendations.push('📊 Surge amplitude > 30%: High pressure pulsations - investigate vortex rope control');
    }

    if (params.vortexRopeSwirlSpeed > 8) {
      recommendations.push('🌀 High swirl speed: Consider draft tube fins or air admission');
    }

    if (params.partLoadFlowRate < 20 || params.partLoadFlowRate > 40) {
      recommendations.push('⚠️ Part-load operation: Avoid extended operation at these flow rates');
    }

    return {
      rheingansFrequency,
      penstockResonanceOverlap,
      surgeAmplitude,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateSurge);
  };

  const handleReset = () => {
    setParams({
      runnerDischargeDiameter: 2.5,
      partLoadFlowRate: 25,
      vortexRopeSwirlSpeed: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Draft Tube <span className="text-cyan-400">Surge Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Rheingans frequency calculation and penstock resonance analysis
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Surge Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Runner Discharge Diameter (m)"
              type="number"
              value={params.runnerDischargeDiameter}
              onChange={(e) => setParams({ ...params, runnerDischargeDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="5"
              step="0.1"
            />
            <ModernInput
              label="Part-Load Flow Rate (m³/s)"
              type="number"
              value={params.partLoadFlowRate}
              onChange={(e) => setParams({ ...params, partLoadFlowRate: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="5"
              max="100"
            />
            <ModernInput
              label="Vortex Rope Swirl Speed (m/s)"
              type="number"
              value={params.vortexRopeSwirlSpeed}
              onChange={(e) => setParams({ ...params, vortexRopeSwirlSpeed: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="20"
              step="0.1"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Surge
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Surge Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.penstockResonanceOverlap === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.penstockResonanceOverlap === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Resonance Overlap</p>
                    <p className="text-2xl font-black text-white">{results.penstockResonanceOverlap}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.penstockResonanceOverlap === 'HIGH' ? 'text-red-400' : results.penstockResonanceOverlap === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rheingans Frequency</p>
                <p className="text-3xl font-black text-white">{results.rheingansFrequency.toFixed(2)} Hz</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Surge Amplitude</p>
                <p className="text-3xl font-black text-white">{results.surgeAmplitude.toFixed(1)}%</p>
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
