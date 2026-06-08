import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface RoughZoneParams {
  guideVaneOpening: number; // %
  wicketGatePosition: number; // %
  draftTubePulsationAmplitude: number; // kPa
}

interface RoughZoneResults {
  roughZoneBoundary: number; // % of rated flow
  efficiencyDegradation: number; // %
  roughZoneStatus: 'SAFE' | 'ROUGH' | 'SEVERE';
  recommendations: string[];
}

export const RoughZoneOperationLab: React.FC = () => {
  const [params, setParams] = useState<RoughZoneParams>({
    guideVaneOpening: 50,
    wicketGatePosition: 50,
    draftTubePulsationAmplitude: 5
  });

  const [results, setResults] = useState<RoughZoneResults | null>(null);

  const calculateRoughZone = useMemo(() => {
    // Calculate rough zone boundary
    // Rough zone typically occurs at 40-70% of rated flow for Francis turbines
    const ratedFlow = 100; // %
    const currentFlow = params.guideVaneOpening;
    
    // Rough zone boundary calculation based on pulsation amplitude
    const pulsationFactor = params.draftTubePulsationAmplitude / 15; // Normalized against 15 kPa
    const roughZoneBoundary = 40 + (pulsationFactor * 30); // 40-70% range

    // Calculate efficiency degradation
    // Efficiency drops significantly in rough zone
    const isRoughZone = currentFlow > 40 && currentFlow < 70;
    const baseEfficiency = 92; // %
    let efficiencyDegradation = 0;
    
    if (isRoughZone) {
      const zoneCenter = 55; // Center of rough zone
      const distanceFromCenter = Math.abs(currentFlow - zoneCenter);
      const degradationFactor = 1 - (distanceFromCenter / 15); // Maximum at center
      efficiencyDegradation = degradationFactor * 8; // Up to 8% degradation
    }

    // Rough zone status assessment
    let roughZoneStatus: 'SAFE' | 'ROUGH' | 'SEVERE' = 'SAFE';
    if (isRoughZone && efficiencyDegradation > 5) roughZoneStatus = 'SEVERE';
    else if (isRoughZone) roughZoneStatus = 'ROUGH';

    const recommendations: string[] = [];
    if (roughZoneStatus === 'SEVERE') {
      recommendations.push('🚨 Severe rough zone operation: Efficiency degradation > 5%');
      recommendations.push('⚠️ High pulsation amplitude - avoid extended operation in this range');
      recommendations.push('💡 Consider air admission or load redistribution');
    } else if (roughZoneStatus === 'ROUGH') {
      recommendations.push('⚠️ Rough zone operation: Efficiency degradation 2-5%');
      recommendations.push('📊 Monitor vibration and pressure pulsations');
      recommendations.push('💡 Minimize operation time in this zone if possible');
    } else {
      recommendations.push('✅ Safe operation: Outside rough zone - normal efficiency');
    }

    if (params.draftTubePulsationAmplitude > 10) {
      recommendations.push('🌊 High pulsation amplitude > 10 kPa: Risk of structural fatigue');
    }

    if (params.guideVaneOpening < 30) {
      recommendations.push('⚠️ Low load operation: Check for cavitation risk');
    }

    if (params.guideVaneOpening > 80) {
      recommendations.push('⚠️ High load operation: Monitor for efficiency drop');
    }

    if (Math.abs(params.guideVaneOpening - params.wicketGatePosition) > 10) {
      recommendations.push('⚠️ Guide vane/wicket gate mismatch: Check governor linkage');
    }

    return {
      roughZoneBoundary,
      efficiencyDegradation,
      roughZoneStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateRoughZone);
  };

  const handleReset = () => {
    setParams({
      guideVaneOpening: 50,
      wicketGatePosition: 50,
      draftTubePulsationAmplitude: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Rough Zone <span className="text-cyan-400">Operation Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Rough zone boundary mapping and efficiency degradation prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Operation Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Guide Vane Opening (%)"
              type="number"
              value={params.guideVaneOpening}
              onChange={(e) => setParams({ ...params, guideVaneOpening: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10"
              max="100"
            />
            <ModernInput
              label="Wicket Gate Position (%)"
              type="number"
              value={params.wicketGatePosition}
              onChange={(e) => setParams({ ...params, wicketGatePosition: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10"
              max="100"
            />
            <ModernInput
              label="Draft Tube Pulsation Amplitude (kPa)"
              type="number"
              value={params.draftTubePulsationAmplitude}
              onChange={(e) => setParams({ ...params, draftTubePulsationAmplitude: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="0"
              max="30"
              step="0.5"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Rough Zone
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Rough Zone Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.roughZoneStatus === 'SEVERE' ? 'bg-red-950/20 border-red-500' : results.roughZoneStatus === 'ROUGH' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rough Zone Status</p>
                    <p className="text-2xl font-black text-white">{results.roughZoneStatus}</p>
                  </div>
                  <Waves className={`w-12 h-12 ${results.roughZoneStatus === 'SEVERE' ? 'text-red-400' : results.roughZoneStatus === 'ROUGH' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rough Zone Boundary</p>
                <p className="text-3xl font-black text-white">{results.roughZoneBoundary.toFixed(1)}% of rated flow</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Efficiency Degradation</p>
                <p className="text-3xl font-black text-white">{results.efficiencyDegradation.toFixed(2)}%</p>
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
