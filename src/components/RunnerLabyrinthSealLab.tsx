import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';

interface LabyrinthSealParams {
  sealClearance: number; // mm
  operatingHours: number; // hours
  waterHardness: number; // ppm CaCO3
}

interface LabyrinthSealResults {
  sealWearRate: number; // mm/1000h
  leakageFlowIncrease: number; // %
  sealStatus: 'GOOD' | 'WORN' | 'CRITICAL';
  recommendations: string[];
}

export const RunnerLabyrinthSealLab: React.FC = () => {
  const [params, setParams] = useState<LabyrinthSealParams>({
    sealClearance: 2,
    operatingHours: 10000,
    waterHardness: 150
  });

  const [results, setResults] = useState<LabyrinthSealResults | null>(null);

  const calculateLabyrinthSeal = useMemo(() => {
    // Calculate seal wear rate
    // Wear depends on water hardness, operating hours, and initial clearance
    const hardnessFactor = params.waterHardness / 300; // Normalized against 300 ppm
    const hoursFactor = params.operatingHours / 10000; // Normalized against 10000 hours
    const baseWearRate = 0.1; // mm/1000h base rate
    const sealWearRate = baseWearRate * (1 + hardnessFactor) * (1 + hoursFactor * 0.5);

    // Calculate leakage flow increase
    // Leakage is proportional to clearance cubed (orifice equation)
    const initialClearance = 1.5; // mm (assumed new seal clearance)
    const currentClearance = params.sealClearance;
    const leakageRatio = Math.pow(currentClearance / initialClearance, 3);
    const leakageFlowIncrease = (leakageRatio - 1) * 100;

    // Seal status assessment
    // Good: < 3mm, Worn: 3-5mm, Critical: > 5mm
    let sealStatus: 'GOOD' | 'WORN' | 'CRITICAL' = 'GOOD';
    if (params.sealClearance > 5) sealStatus = 'CRITICAL';
    else if (params.sealClearance > 3) sealStatus = 'WORN';

    const recommendations: string[] = [];
    if (sealStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical seal wear: Clearance > 5mm - immediate seal replacement required');
      recommendations.push('⚠️ High leakage flow - efficiency loss and potential damage');
    } else if (sealStatus === 'WORN') {
      recommendations.push('⚠️ Worn seal: Clearance 3-5mm - plan seal replacement at next maintenance');
      recommendations.push('📊 Monitor leakage flow and efficiency impact');
    } else {
      recommendations.push('✅ Good seal: Clearance < 3mm - normal operation');
    }

    if (sealWearRate > 0.3) {
      recommendations.push('⚠️ High wear rate > 0.3mm/1000h: Check water quality and seal material');
    }

    if (leakageFlowIncrease > 200) {
      recommendations.push('⚠️ High leakage increase > 200%: Significant efficiency loss');
    }

    if (params.waterHardness > 250) {
      recommendations.push('💧 High water hardness: Consider water treatment to reduce wear');
    }

    if (params.operatingHours > 20000) {
      recommendations.push('⚠️ High operating hours: Seal may be approaching end of life');
    }

    return {
      sealWearRate,
      leakageFlowIncrease,
      sealStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateLabyrinthSeal);
  };

  const handleReset = () => {
    setParams({
      sealClearance: 2,
      operatingHours: 10000,
      waterHardness: 150
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Runner Labyrinth <span className="text-cyan-400">Seal Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Seal wear calculation and leakage flow prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Seal Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Seal Clearance (mm)"
              type="number"
              value={params.sealClearance}
              onChange={(e) => setParams({ ...params, sealClearance: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0.5"
              max="10"
              step="0.1"
            />
            <ModernInput
              label="Operating Hours (h)"
              type="number"
              value={params.operatingHours}
              onChange={(e) => setParams({ ...params, operatingHours: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="50000"
            />
            <ModernInput
              label="Water Hardness (ppm CaCO3)"
              type="number"
              value={params.waterHardness}
              onChange={(e) => setParams({ ...params, waterHardness: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="0"
              max="500"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Seal
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Seal Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.sealStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.sealStatus === 'WORN' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Seal Status</p>
                    <p className="text-2xl font-black text-white">{results.sealStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.sealStatus === 'CRITICAL' ? 'text-red-400' : results.sealStatus === 'WORN' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Seal Wear Rate</p>
                <p className="text-3xl font-black text-white">{results.sealWearRate.toFixed(3)} mm/1000h</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Leakage Flow Increase</p>
                <p className="text-3xl font-black text-white">{results.leakageFlowIncrease.toFixed(1)}%</p>
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
