import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';

interface DeflectionParams {
  innerCircleReading1: number; // mm
  innerCircleReading2: number; // mm
  innerCircleReading3: number; // mm
  innerCircleReading4: number; // mm
  outerCircleReading1: number; // mm
  outerCircleReading2: number; // mm
  outerCircleReading3: number; // mm
  outerCircleReading4: number; // mm
}

interface DeflectionResults {
  flangeAngularDistortion: number; // degrees
  oRingExtrusionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  maxDeflection: number; // mm
  recommendations: string[];
}

export const HeadCoverDeflectionLab: React.FC = () => {
  const [params, setParams] = useState<DeflectionParams>({
    innerCircleReading1: 0, innerCircleReading2: 0, innerCircleReading3: 0, innerCircleReading4: 0,
    outerCircleReading1: 0, outerCircleReading2: 0, outerCircleReading3: 0, outerCircleReading4: 0
  });

  const [results, setResults] = useState<DeflectionResults | null>(null);

  const calculateDeflection = useMemo(() => {
    const innerReadings = [params.innerCircleReading1, params.innerCircleReading2, params.innerCircleReading3, params.innerCircleReading4];
    const outerReadings = [params.outerCircleReading1, params.outerCircleReading2, params.outerCircleReading3, params.outerCircleReading4];

    const avgInnerDeflection = innerReadings.reduce((a, b) => a + b, 0) / innerReadings.length;
    const avgOuterDeflection = outerReadings.reduce((a, b) => a + b, 0) / outerReadings.length;
    const maxDeflection = Math.max(...innerReadings, ...outerReadings);

    // Calculate flange angular distortion
    // Angular distortion = (outer deflection - inner deflection) / radius difference
    // Assuming inner radius = 500mm, outer radius = 1000mm (typical head cover dimensions)
    const innerRadius = 500; // mm
    const outerRadius = 1000; // mm
    const radiusDifference = outerRadius - innerRadius;
    const deflectionDifference = avgOuterDeflection - avgInnerDeflection;
    const flangeAngularDistortion = Math.atan(deflectionDifference / radiusDifference) * (180 / Math.PI);

    // O-ring extrusion risk assessment
    // Risk increases with angular distortion and maximum deflection
    const distortionScore = Math.abs(flangeAngularDistortion) / 0.5; // Normalized against 0.5° threshold
    const deflectionScore = maxDeflection / 2; // Normalized against 2mm threshold
    const totalRiskScore = (distortionScore + deflectionScore) / 2;

    let oRingExtrusionRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (totalRiskScore > 1.0) oRingExtrusionRisk = 'HIGH';
    else if (totalRiskScore > 0.5) oRingExtrusionRisk = 'MEDIUM';

    const recommendations: string[] = [];
    if (oRingExtrusionRisk === 'HIGH') {
      recommendations.push('🚨 High O-ring extrusion risk: Critical - inspect flange flatness and bolt torque');
      recommendations.push('⚠️ Consider flange resurfacing or O-ring groove modification');
    } else if (oRingExtrusionRisk === 'MEDIUM') {
      recommendations.push('⚠️ Moderate O-ring extrusion risk: Monitor - check for leaks during pressure test');
      recommendations.push('📊 Trend deflection measurements over time');
    } else {
      recommendations.push('✅ Low O-ring extrusion risk: Within acceptable tolerance');
    }

    if (Math.abs(flangeAngularDistortion) > 0.3) {
      recommendations.push('⚠️ Angular distortion > 0.3°: Check bolt circle torque sequence');
    }

    if (maxDeflection > 1.5) {
      recommendations.push('⚠️ Max deflection > 1.5mm: Verify flange stiffness and support');
    }

    return {
      flangeAngularDistortion,
      oRingExtrusionRisk,
      maxDeflection,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateDeflection);
  };

  const handleReset = () => {
    setParams({
      innerCircleReading1: 0, innerCircleReading2: 0, innerCircleReading3: 0, innerCircleReading4: 0,
      outerCircleReading1: 0, outerCircleReading2: 0, outerCircleReading3: 0, outerCircleReading4: 0
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Head Cover <span className="text-cyan-400">Deflection Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Flange deflection mapping and O-ring extrusion risk assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Dial Indicator Readings (mm)" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Inner Bolt Circle</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((pos) => (
                  <ModernInput
                    key={`inner-${pos}`}
                    label={`Position ${pos}`}
                    type="number"
                    value={params[`innerCircleReading${pos}` as keyof DeflectionParams] as number}
                    onChange={(e) => setParams({ ...params, [`innerCircleReading${pos}` as keyof DeflectionParams]: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Outer Bolt Circle</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((pos) => (
                  <ModernInput
                    key={`outer-${pos}`}
                    label={`Position ${pos}`}
                    type="number"
                    value={params[`outerCircleReading${pos}` as keyof DeflectionParams] as number}
                    onChange={(e) => setParams({ ...params, [`outerCircleReading${pos}` as keyof DeflectionParams]: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Deflection
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Deflection Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.oRingExtrusionRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.oRingExtrusionRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">O-ring Extrusion Risk</p>
                    <p className="text-2xl font-black text-white">{results.oRingExtrusionRisk}</p>
                  </div>
                  <Gauge className={`w-12 h-12 ${results.oRingExtrusionRisk === 'HIGH' ? 'text-red-400' : results.oRingExtrusionRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Flange Angular Distortion</p>
                <p className="text-3xl font-black text-white">{Math.abs(results.flangeAngularDistortion).toFixed(3)}°</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Maximum Deflection</p>
                <p className="text-3xl font-black text-white">{results.maxDeflection.toFixed(2)} mm</p>
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
