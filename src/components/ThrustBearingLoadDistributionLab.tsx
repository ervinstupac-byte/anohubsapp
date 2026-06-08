import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';

interface ThrustBearingParams {
  pad1Reading: number; // mm or kN
  pad2Reading: number; // mm or kN
  pad3Reading: number; // mm or kN
  pad4Reading: number; // mm or kN
  pad5Reading: number; // mm or kN
  pad6Reading: number; // mm or kN
  pad7Reading: number; // mm or kN
  pad8Reading: number; // mm or kN
}

interface ThrustBearingResults {
  loadAsymmetry: number; // %
  padWipingRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  maxLoadVariation: number; // %
  recommendations: string[];
}

export const ThrustBearingLoadDistributionLab: React.FC = () => {
  const [params, setParams] = useState<ThrustBearingParams>({
    pad1Reading: 10, pad2Reading: 10, pad3Reading: 10, pad4Reading: 10,
    pad5Reading: 10, pad6Reading: 10, pad7Reading: 10, pad8Reading: 10
  });

  const [results, setResults] = useState<ThrustBearingResults | null>(null);

  const calculateLoadDistribution = useMemo(() => {
    const padReadings = [
      params.pad1Reading, params.pad2Reading, params.pad3Reading, params.pad4Reading,
      params.pad5Reading, params.pad6Reading, params.pad7Reading, params.pad8Reading
    ];

    const avgLoad = padReadings.reduce((a, b) => a + b, 0) / padReadings.length;
    const maxLoad = Math.max(...padReadings);
    const minLoad = Math.min(...padReadings);

    // Calculate load asymmetry
    // Asymmetry = (max - min) / average
    const loadAsymmetry = ((maxLoad - minLoad) / avgLoad) * 100;

    // Calculate maximum load variation
    const maxLoadVariation = ((maxLoad - avgLoad) / avgLoad) * 100;

    // Pad wiping risk assessment
    // Risk increases with load asymmetry and max load variation
    const asymmetryScore = loadAsymmetry / 20; // Normalized against 20% threshold
    const variationScore = maxLoadVariation / 15; // Normalized against 15% threshold
    const totalRiskScore = (asymmetryScore + variationScore) / 2;

    let padWipingRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (totalRiskScore > 1.0) padWipingRisk = 'HIGH';
    else if (totalRiskScore > 0.5) padWipingRisk = 'MEDIUM';

    const recommendations: string[] = [];
    if (padWipingRisk === 'HIGH') {
      recommendations.push('🚨 High pad wiping risk: Critical - inspect pad surfaces and leveling');
      recommendations.push('⚠️ Check spring calibration or load cell accuracy');
    } else if (padWipingRisk === 'MEDIUM') {
      recommendations.push('⚠️ Moderate pad wiping risk: Monitor - trend load distribution');
      recommendations.push('📊 Check for shaft misalignment or thrust collar runout');
    } else {
      recommendations.push('✅ Low pad wiping risk: Load distribution within acceptable tolerance');
    }

    if (loadAsymmetry > 15) {
      recommendations.push('⚠️ Load asymmetry > 15%: Check bearing support structure');
    }

    if (maxLoadVariation > 10) {
      recommendations.push('⚠️ Max load variation > 10%: Verify pad leveling');
    }

    if (minLoad < avgLoad * 0.7) {
      recommendations.push('⚠️ Minimum load < 70% of average: Risk of pad lift-off');
    }

    return {
      loadAsymmetry,
      padWipingRisk,
      maxLoadVariation,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateLoadDistribution);
  };

  const handleReset = () => {
    setParams({
      pad1Reading: 10, pad2Reading: 10, pad3Reading: 10, pad4Reading: 10,
      pad5Reading: 10, pad6Reading: 10, pad7Reading: 10, pad8Reading: 10
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Thrust Bearing <span className="text-cyan-400">Load Distribution Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Load distribution analysis and pad wiping risk assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Pad Readings (mm or kN)" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((pad) => (
                <ModernInput
                  key={`pad-${pad}`}
                  label={`Pad ${pad}`}
                  type="number"
                  value={params[`pad${pad}Reading` as keyof ThrustBearingParams] as number}
                  onChange={(e) => setParams({ ...params, [`pad${pad}Reading` as keyof ThrustBearingParams]: parseFloat(e.target.value) || 0 })}
                  step="0.1"
                />
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Distribution
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Load Distribution Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.padWipingRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.padWipingRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pad Wiping Risk</p>
                    <p className="text-2xl font-black text-white">{results.padWipingRisk}</p>
                  </div>
                  <Gauge className={`w-12 h-12 ${results.padWipingRisk === 'HIGH' ? 'text-red-400' : results.padWipingRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Load Asymmetry</p>
                <p className="text-3xl font-black text-white">{results.loadAsymmetry.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Load Variation</p>
                <p className="text-3xl font-black text-white">{results.maxLoadVariation.toFixed(1)}%</p>
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
