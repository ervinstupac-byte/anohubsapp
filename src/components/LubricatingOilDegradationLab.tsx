import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Droplets, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface OilDegradationParams {
  particulateCount: number; // ISO 4406 code (e.g., 18/16/13)
  waterContent: number; // ppm
  totalAcidNumber: number; // mg KOH/g
}

interface OilDegradationResults {
  remainingOilLife: number; // %
  babbittCorrosionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  oilCondition: 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'CRITICAL';
  recommendations: string[];
}

export const LubricatingOilDegradationLab: React.FC = () => {
  const [params, setParams] = useState<OilDegradationParams>({
    particulateCount: 18,
    waterContent: 100,
    totalAcidNumber: 0.1
  });

  const [results, setResults] = useState<OilDegradationResults | null>(null);

  const calculateOilDegradation = useMemo(() => {
    // Calculate remaining oil life based on degradation factors
    // Particulate count: ISO 4406 code, higher = more degraded
    const particulateScore = Math.min(params.particulateCount / 24, 1.0); // Normalized against ISO 24/22/19
    const waterScore = Math.min(params.waterContent / 500, 1.0); // Normalized against 500ppm
    const tanScore = Math.min(params.totalAcidNumber / 0.5, 1.0); // Normalized against 0.5 mg KOH/g

    // Remaining life calculation (weighted average of factors)
    const remainingOilLife = 100 - ((particulateScore * 0.4 + waterScore * 0.3 + tanScore * 0.3) * 100);

    // Babbitt corrosion risk assessment
    // Risk increases with water content and TAN
    const corrosionScore = (waterScore * 0.6 + tanScore * 0.4);
    let babbittCorrosionRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (corrosionScore > 0.7) babbittCorrosionRisk = 'HIGH';
    else if (corrosionScore > 0.4) babbittCorrosionRisk = 'MEDIUM';

    // Oil condition assessment
    let oilCondition: 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'CRITICAL' = 'GOOD';
    if (remainingOilLife < 20) oilCondition = 'CRITICAL';
    else if (remainingOilLife < 40) oilCondition = 'DEGRADED';
    else if (remainingOilLife < 60) oilCondition = 'ACCEPTABLE';

    const recommendations: string[] = [];
    if (oilCondition === 'CRITICAL') {
      recommendations.push('🚨 Oil condition critical: Immediate oil change required');
      recommendations.push('⚠️ High Babbitt corrosion risk - inspect bearing surfaces');
    } else if (oilCondition === 'DEGRADED') {
      recommendations.push('⚠️ Oil degraded: Schedule oil change within 30 days');
      recommendations.push('📊 Monitor oil condition weekly');
    } else if (oilCondition === 'ACCEPTABLE') {
      recommendations.push('⚠️ Oil acceptable: Plan oil change at next maintenance interval');
    } else {
      recommendations.push('✅ Oil condition good: Continue normal monitoring');
    }

    if (babbittCorrosionRisk === 'HIGH') {
      recommendations.push('⚠️ High corrosion risk: Check for water ingress and acid sources');
    }

    if (params.waterContent > 200) {
      recommendations.push('💧 Water content > 200ppm: Check seals and breathers');
    }

    if (params.totalAcidNumber > 0.3) {
      recommendations.push('🧪 TAN > 0.3 mg KOH/g: Acid number elevated - investigate oxidation');
    }

    if (params.particulateCount > 20) {
      recommendations.push('🔬 Particulate count > ISO 20: Check filtration system');
    }

    return {
      remainingOilLife,
      babbittCorrosionRisk,
      oilCondition,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateOilDegradation);
  };

  const handleReset = () => {
    setParams({
      particulateCount: 18,
      waterContent: 100,
      totalAcidNumber: 0.1
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Oil <span className="text-cyan-400">Degradation Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Lubricating oil forensics and Babbitt corrosion risk assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Oil Analysis Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Particulate Count (ISO 4406)"
              type="number"
              value={params.particulateCount}
              onChange={(e) => setParams({ ...params, particulateCount: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="12"
              max="24"
            />
            <ModernInput
              label="Water Content (ppm)"
              type="number"
              value={params.waterContent}
              onChange={(e) => setParams({ ...params, waterContent: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="0"
              max="1000"
            />
            <ModernInput
              label="Total Acid Number (mg KOH/g)"
              type="number"
              value={params.totalAcidNumber}
              onChange={(e) => setParams({ ...params, totalAcidNumber: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="1"
              step="0.01"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Degradation
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Oil Degradation Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.oilCondition === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.oilCondition === 'DEGRADED' ? 'bg-amber-950/20 border-amber-500' : results.oilCondition === 'ACCEPTABLE' ? 'bg-blue-950/20 border-blue-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Oil Condition</p>
                    <p className="text-2xl font-black text-white">{results.oilCondition}</p>
                  </div>
                  <Droplets className={`w-12 h-12 ${results.oilCondition === 'CRITICAL' ? 'text-red-400' : results.oilCondition === 'DEGRADED' ? 'text-amber-400' : results.oilCondition === 'ACCEPTABLE' ? 'text-blue-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Remaining Oil Life</p>
                <p className="text-3xl font-black text-white">{results.remainingOilLife.toFixed(1)}%</p>
              </div>

              <div className={`p-4 rounded-xl border ${results.babbittCorrosionRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.babbittCorrosionRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Babbitt Corrosion Risk</p>
                    <p className="text-2xl font-black text-white">{results.babbittCorrosionRisk}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.babbittCorrosionRisk === 'HIGH' ? 'text-red-400' : results.babbittCorrosionRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
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
