import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Zap, Activity } from 'lucide-react';

interface AirGapParams {
  topPole1: number; // mm
  topPole2: number; // mm
  topPole3: number; // mm
  topPole4: number; // mm
  topPole5: number; // mm
  topPole6: number; // mm
  topPole7: number; // mm
  topPole8: number; // mm
  bottomPole1: number; // mm
  bottomPole2: number; // mm
  bottomPole3: number; // mm
  bottomPole4: number; // mm
  bottomPole5: number; // mm
  bottomPole6: number; // mm
  bottomPole7: number; // mm
  bottomPole8: number; // mm
}

interface AirGapResults {
  eccentricity: number; // %
  eccentricityStatus: 'Healthy' | 'Warning: High Eccentricity';
  maxGapVariation: number; // mm
  avgGap: number; // mm
  recommendations: string[];
}

export const GeneratorAirGapLab: React.FC = () => {
  const [params, setParams] = useState<AirGapParams>({
    topPole1: 20, topPole2: 20, topPole3: 20, topPole4: 20,
    topPole5: 20, topPole6: 20, topPole7: 20, topPole8: 20,
    bottomPole1: 20, bottomPole2: 20, bottomPole3: 20, bottomPole4: 20,
    bottomPole5: 20, bottomPole6: 20, bottomPole7: 20, bottomPole8: 20
  });

  const [results, setResults] = useState<AirGapResults | null>(null);

  const calculateAirGap = useMemo(() => {
    const topGaps = [
      params.topPole1, params.topPole2, params.topPole3, params.topPole4,
      params.topPole5, params.topPole6, params.topPole7, params.topPole8
    ];
    const bottomGaps = [
      params.bottomPole1, params.bottomPole2, params.bottomPole3, params.bottomPole4,
      params.bottomPole5, params.bottomPole6, params.bottomPole7, params.bottomPole8
    ];

    const allGaps = [...topGaps, ...bottomGaps];
    const avgGap = allGaps.reduce((a, b) => a + b, 0) / allGaps.length;
    const maxGap = Math.max(...allGaps);
    const minGap = Math.min(...allGaps);
    const maxGapVariation = maxGap - minGap;

    // Eccentricity calculation per standard formula
    const eccentricity = (maxGapVariation / avgGap) * 100;

    let eccentricityStatus: 'Healthy' | 'Warning: High Eccentricity' = 'Healthy';
    if (eccentricity > 10) {
      eccentricityStatus = 'Warning: High Eccentricity';
    }

    const recommendations: string[] = [];
    if (eccentricityStatus === 'Warning: High Eccentricity') {
      recommendations.push('⚠️ Eccentricity >10%: High - schedule stator-rotor alignment check');
      recommendations.push('📊 Track vibration levels during operation');
    } else {
      recommendations.push('✅ Eccentricity within acceptable limits');
    }

    if (minGap < 15) {
      recommendations.push('⚠️ Minimum gap <15mm: Risk of rotor-stator contact');
    }

    return {
      eccentricity,
      eccentricityStatus,
      maxGapVariation,
      avgGap,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateAirGap);
  };

  const handleReset = () => {
    setParams({
      topPole1: 20, topPole2: 20, topPole3: 20, topPole4: 20,
      topPole5: 20, topPole6: 20, topPole7: 20, topPole8: 20,
      bottomPole1: 20, bottomPole2: 20, bottomPole3: 20, bottomPole4: 20,
      bottomPole5: 20, bottomPole6: 20, bottomPole7: 20, bottomPole8: 20
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Generator <span className="text-cyan-400">Air Gap Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Stator-rotor eccentricity and air gap measurement analysis
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Air Gap Measurements (mm)" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Top Elevation</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((pole) => (
                  <ModernInput
                    key={`top-${pole}`}
                    label={`Pole ${pole}`}
                    type="number"
                    value={params[`topPole${pole}` as keyof AirGapParams] as number}
                    onChange={(e) => setParams({ ...params, [`topPole${pole}` as keyof AirGapParams]: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Bottom Elevation</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((pole) => (
                  <ModernInput
                    key={`bottom-${pole}`}
                    label={`Pole ${pole}`}
                    type="number"
                    value={params[`bottomPole${pole}` as keyof AirGapParams] as number}
                    onChange={(e) => setParams({ ...params, [`bottomPole${pole}` as keyof AirGapParams]: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Analysis
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Air Gap Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.eccentricityStatus === 'Warning: High Eccentricity' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Eccentricity Status</p>
                    <p className="text-2xl font-black text-white">{results.eccentricityStatus}</p>
                  </div>
                  <Zap className={`w-12 h-12 ${results.eccentricityStatus === 'Warning: High Eccentricity' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Eccentricity</p>
                <p className="text-3xl font-black text-white">{results.eccentricity.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Average Gap</p>
                <p className="text-3xl font-black text-white">{results.avgGap.toFixed(2)} mm</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Gap Variation</p>
                <p className="text-3xl font-black text-white">{results.maxGapVariation.toFixed(2)} mm</p>
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
