import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface TrashRackHeadLossParams {
  trashRackBarSpacing: number; // mm
  debrisAccumulationHeight: number; // mm
  approachVelocity: number; // m/s
}

interface TrashRackHeadLossResults {
  headLoss: number; // meters
  flowReduction: number; // %
  headLossStatus: 'ACCEPTABLE' | 'ELEVATED' | 'CRITICAL';
  recommendations: string[];
}

export const TrashRackHeadLossLab: React.FC = () => {
  const [params, setParams] = useState<TrashRackHeadLossParams>({
    trashRackBarSpacing: 50,
    debrisAccumulationHeight: 100,
    approachVelocity: 2
  });

  const [results, setResults] = useState<TrashRackHeadLossResults | null>(null);

  const calculateTrashRackHeadLoss = useMemo(() => {
    // Calculate head loss using Kirschmer's equation
    // Δh = K × (t/b)^(4/3) × sin(α) × (v²/2g)
    const barThickness = 10; // mm (assumed bar thickness)
    const t_b_ratio = barThickness / params.trashRackBarSpacing;
    const angle = 90; // degrees (trash rack angle)
    const gravity = 9.81; // m/s²
    const K = 2.42; // Kirschmer coefficient for rectangular bars

    const headLoss = K * Math.pow(t_b_ratio, 4/3) * Math.sin(angle * Math.PI / 180) * Math.pow(params.approachVelocity, 2) / (2 * gravity);

    // Apply debris accumulation factor
    const debrisFactor = 1 + (params.debrisAccumulationHeight / 1000); // Normalized
    const totalHeadLoss = headLoss * debrisFactor;

    // Calculate flow reduction
    // Flow reduction depends on head loss and available head
    const availableHead = 50; // meters (assumed)
    const flowReduction = (totalHeadLoss / availableHead) * 100;

    // Head loss status assessment
    // Acceptable: < 0.3m, Elevated: 0.3-0.6m, Critical: > 0.6m
    let headLossStatus: 'ACCEPTABLE' | 'ELEVATED' | 'CRITICAL' = 'ACCEPTABLE';
    if (totalHeadLoss > 0.6) headLossStatus = 'CRITICAL';
    else if (totalHeadLoss > 0.3) headLossStatus = 'ELEVATED';

    const recommendations: string[] = [];
    if (headLossStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical head loss: > 0.6m - immediate trash rack cleaning required');
      recommendations.push('⚠️ High flow reduction - significant power loss');
    } else if (headLossStatus === 'ELEVATED') {
      recommendations.push('⚠️ Elevated head loss: 0.3-0.6m - schedule trash rack cleaning');
      recommendations.push('📊 Monitor debris accumulation regularly');
    } else {
      recommendations.push('✅ Acceptable head loss: < 0.3m - normal operation');
    }

    if (flowReduction > 10) {
      recommendations.push('⚠️ High flow reduction > 10%: Significant efficiency loss');
    }

    if (params.debrisAccumulationHeight > 500) {
      recommendations.push('⚠️ High debris accumulation: Risk of complete blockage');
    }

    if (params.approachVelocity > 3) {
      recommendations.push('⚠️ High approach velocity: May increase head loss');
    }

    if (totalHeadLoss > 1.0) {
      recommendations.push('🚨 Very high head loss: Risk of cavitation and vibration');
    }

    return {
      headLoss: totalHeadLoss,
      flowReduction,
      headLossStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateTrashRackHeadLoss);
  };

  const handleReset = () => {
    setParams({
      trashRackBarSpacing: 50,
      debrisAccumulationHeight: 100,
      approachVelocity: 2
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Trash Rack <span className="text-cyan-400">Head Loss Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Head loss calculation and flow reduction prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Trash Rack Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Trash Rack Bar Spacing (mm)"
              type="number"
              value={params.trashRackBarSpacing}
              onChange={(e) => setParams({ ...params, trashRackBarSpacing: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="20"
              max="150"
            />
            <ModernInput
              label="Debris Accumulation Height (mm)"
              type="number"
              value={params.debrisAccumulationHeight}
              onChange={(e) => setParams({ ...params, debrisAccumulationHeight: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="1000"
            />
            <ModernInput
              label="Approach Velocity (m/s)"
              type="number"
              value={params.approachVelocity}
              onChange={(e) => setParams({ ...params, approachVelocity: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="0.5"
              max="5"
              step="0.1"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Head Loss
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Head Loss Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.headLossStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.headLossStatus === 'ELEVATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Head Loss Status</p>
                    <p className="text-2xl font-black text-white">{results.headLossStatus}</p>
                  </div>
                  <Waves className={`w-12 h-12 ${results.headLossStatus === 'CRITICAL' ? 'text-red-400' : results.headLossStatus === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Head Loss</p>
                <p className="text-3xl font-black text-white">{results.headLoss.toFixed(3)} m</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Flow Reduction</p>
                <p className="text-3xl font-black text-white">{results.flowReduction.toFixed(1)}%</p>
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
