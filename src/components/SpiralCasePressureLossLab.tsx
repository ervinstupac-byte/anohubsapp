import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';

interface PressureLossParams {
  inletPressure: number; // bar
  midSectionPressure: number; // bar
  stayVaneRingPressure: number; // bar
}

interface PressureLossResults {
  hydraulicFrictionLoss: number; // %
  efficiencyDrop: number; // %
  lossStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL';
  recommendations: string[];
}

export const SpiralCasePressureLossLab: React.FC = () => {
  const [params, setParams] = useState<PressureLossParams>({
    inletPressure: 10,
    midSectionPressure: 9.5,
    stayVaneRingPressure: 9.2
  });

  const [results, setResults] = useState<PressureLossResults | null>(null);

  const calculatePressureLoss = useMemo(() => {
    // Calculate hydraulic friction losses
    // Loss = (P_inlet - P_outlet) / P_inlet
    const totalPressureDrop = params.inletPressure - params.stayVaneRingPressure;
    const hydraulicFrictionLoss = (totalPressureDrop / params.inletPressure) * 100;

    // Calculate efficiency drop
    // Efficiency drop is proportional to pressure loss
    // Typical spiral case loss is 0.5-1.5% of head
    const baseEfficiency = 92; // %
    const efficiencyDrop = hydraulicFrictionLoss * 0.5; // Simplified relationship

    // Loss status assessment
    // Acceptable: < 2%, Monitor: 2-4%, Critical: > 4%
    let lossStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL' = 'ACCEPTABLE';
    if (hydraulicFrictionLoss > 4) lossStatus = 'CRITICAL';
    else if (hydraulicFrictionLoss > 2) lossStatus = 'MONITOR';

    const recommendations: string[] = [];
    if (lossStatus === 'CRITICAL') {
      recommendations.push('🚨 Friction loss > 4%: Critical - inspect spiral case for blockage or roughness');
      recommendations.push('⚠️ High efficiency drop - check for debris or sediment buildup');
    } else if (lossStatus === 'MONITOR') {
      recommendations.push('⚠️ Friction loss 2-4%: Monitor - trend pressure readings over time');
      recommendations.push('📊 Check for gradual increase indicating fouling');
    } else {
      recommendations.push('✅ Friction loss < 2%: Within acceptable tolerance');
    }

    const inletToMidLoss = params.inletPressure - params.midSectionPressure;
    const midToStayLoss = params.midSectionPressure - params.stayVaneRingPressure;
    
    if (inletToMidLoss > midToStayLoss * 2) {
      recommendations.push('⚠️ Inlet section loss high: Check for inlet blockage or flow disturbance');
    }

    if (midToStayLoss > inletToMidLoss * 2) {
      recommendations.push('⚠️ Stay vane section loss high: Check vane alignment or fouling');
    }

    if (efficiencyDrop > 2) {
      recommendations.push('📉 Efficiency drop > 2%: Consider spiral case cleaning or inspection');
    }

    return {
      hydraulicFrictionLoss,
      efficiencyDrop,
      lossStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculatePressureLoss);
  };

  const handleReset = () => {
    setParams({
      inletPressure: 10,
      midSectionPressure: 9.5,
      stayVaneRingPressure: 9.2
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Spiral Case <span className="text-cyan-400">Pressure Loss Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Hydraulic friction loss calculation and efficiency prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Piezometer Readings (bar)" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Inlet Pressure"
              type="number"
              value={params.inletPressure}
              onChange={(e) => setParams({ ...params, inletPressure: parseFloat(e.target.value) || 0 })}
              icon={<Gauge className="w-4 h-4" />}
              min="1"
              max="20"
              step="0.1"
            />
            <ModernInput
              label="Mid-Section Pressure"
              type="number"
              value={params.midSectionPressure}
              onChange={(e) => setParams({ ...params, midSectionPressure: parseFloat(e.target.value) || 0 })}
              icon={<Gauge className="w-4 h-4" />}
              min="1"
              max="20"
              step="0.1"
            />
            <ModernInput
              label="Stay Vane Ring Pressure"
              type="number"
              value={params.stayVaneRingPressure}
              onChange={(e) => setParams({ ...params, stayVaneRingPressure: parseFloat(e.target.value) || 0 })}
              icon={<Gauge className="w-4 h-4" />}
              min="1"
              max="20"
              step="0.1"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Loss
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Pressure Loss Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.lossStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.lossStatus === 'MONITOR' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Loss Status</p>
                    <p className="text-2xl font-black text-white">{results.lossStatus}</p>
                  </div>
                  <Gauge className={`w-12 h-12 ${results.lossStatus === 'CRITICAL' ? 'text-red-400' : results.lossStatus === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hydraulic Friction Loss</p>
                <p className="text-3xl font-black text-white">{results.hydraulicFrictionLoss.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Efficiency Drop</p>
                <p className="text-3xl font-black text-white">{results.efficiencyDrop.toFixed(2)}%</p>
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
