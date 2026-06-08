import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Droplets, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface CavitationParams {
  tailwaterElevation: number; // meters
  atmosphericPressure: number; // meters of water
  draftTubeVaporPressure: number; // meters of water
  operatingHead: number; // meters
}

interface CavitationResults {
  thomaCavitationNumber: number;
  pittingRate: number; // mm/year
  cavitationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export const FrancisCavitationProfilingLab: React.FC = () => {
  const [params, setParams] = useState<CavitationParams>({
    tailwaterElevation: 5,
    atmosphericPressure: 10.3,
    draftTubeVaporPressure: 0.24,
    operatingHead: 100
  });

  const [results, setResults] = useState<CavitationResults | null>(null);

  const calculateCavitation = useMemo(() => {
    // Calculate Thoma cavitation number (σ)
    // σ = (H_atm + H_suction - H_vapor) / H_net
    const suctionHead = params.tailwaterElevation;
    const netHead = params.operatingHead;
    const thomaCavitationNumber = (params.atmosphericPressure + suctionHead - params.draftTubeVaporPressure) / netHead;

    // Predict trailing edge pitting rate
    // Pitting rate increases exponentially as Thoma number decreases below critical value
    const criticalThomaNumber = 0.1; // Typical for Francis turbines
    const cavitationIntensity = Math.max(0, (criticalThomaNumber - thomaCavitationNumber) / criticalThomaNumber);
    const basePittingRate = 0.1; // mm/year for minimal cavitation
    const pittingRate = basePittingRate * Math.pow(10, cavitationIntensity * 2);

    // Cavitation risk assessment
    let cavitationRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (thomaCavitationNumber < 0.08) cavitationRisk = 'HIGH';
    else if (thomaCavitationNumber < 0.12) cavitationRisk = 'MEDIUM';

    const recommendations: string[] = [];
    if (cavitationRisk === 'HIGH') {
      recommendations.push('🚨 Thoma number < 0.08: High cavitation risk - immediate action required');
      recommendations.push('⚠️ High pitting rate predicted - inspect runner trailing edges');
      recommendations.push('💡 Consider reducing operating head or increasing tailwater level');
    } else if (cavitationRisk === 'MEDIUM') {
      recommendations.push('⚠️ Thoma number 0.08-0.12: Moderate cavitation risk - monitor closely');
      recommendations.push('📊 Schedule runner inspection during next maintenance');
    } else {
      recommendations.push('✅ Thoma number > 0.12: Low cavitation risk - normal operation');
    }

    if (pittingRate > 1.0) {
      recommendations.push('⚠️ Pitting rate > 1mm/year: Severe cavitation - consider runner repair or replacement');
    }

    if (params.draftTubeVaporPressure > 0.5) {
      recommendations.push('💧 High vapor pressure: Check water temperature and dissolved gases');
    }

    if (params.tailwaterElevation < 2) {
      recommendations.push('⚠️ Low tailwater: Risk of submergence issues - check draft tube design');
    }

    return {
      thomaCavitationNumber,
      pittingRate,
      cavitationRisk,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateCavitation);
  };

  const handleReset = () => {
    setParams({
      tailwaterElevation: 5,
      atmosphericPressure: 10.3,
      draftTubeVaporPressure: 0.24,
      operatingHead: 100
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Francis <span className="text-cyan-400">Cavitation Profiling</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Thoma cavitation number calculation and pitting rate prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Cavitation Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Tailwater Elevation (m)"
              type="number"
              value={params.tailwaterElevation}
              onChange={(e) => setParams({ ...params, tailwaterElevation: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="0"
              max="20"
              step="0.1"
            />
            <ModernInput
              label="Atmospheric Pressure (m H₂O)"
              type="number"
              value={params.atmosphericPressure}
              onChange={(e) => setParams({ ...params, atmosphericPressure: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="8"
              max="12"
              step="0.1"
            />
            <ModernInput
              label="Draft Tube Vapor Pressure (m H₂O)"
              type="number"
              value={params.draftTubeVaporPressure}
              onChange={(e) => setParams({ ...params, draftTubeVaporPressure: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="0"
              max="1"
              step="0.01"
            />
            <ModernInput
              label="Operating Head (m)"
              type="number"
              value={params.operatingHead}
              onChange={(e) => setParams({ ...params, operatingHead: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10"
              max="500"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Cavitation
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Cavitation Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.cavitationRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.cavitationRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cavitation Risk</p>
                    <p className="text-2xl font-black text-white">{results.cavitationRisk}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.cavitationRisk === 'HIGH' ? 'text-red-400' : results.cavitationRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thoma Cavitation Number (σ)</p>
                <p className="text-3xl font-black text-white">{results.thomaCavitationNumber.toFixed(3)}</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Pitting Rate</p>
                <p className="text-3xl font-black text-white">{results.pittingRate.toFixed(2)} mm/year</p>
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
