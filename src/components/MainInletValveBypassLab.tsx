import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface MainInletValveBypassParams {
  upstreamPressure: number; // bar
  downstreamPressure: number; // bar
  bypassValveOpening: number; // %
}

interface MainInletValveBypassResults {
  pressureEqualizationRate: number; // bar/s
  valveStress: number; // MPa
  equalizationStatus: 'OPTIMAL' | 'SLOW' | 'FAST';
  recommendations: string[];
}

export const MainInletValveBypassLab: React.FC = () => {
  const [params, setParams] = useState<MainInletValveBypassParams>({
    upstreamPressure: 50,
    downstreamPressure: 10,
    bypassValveOpening: 30
  });

  const [results, setResults] = useState<MainInletValveBypassResults | null>(null);

  const calculateValveBypass = useMemo(() => {
    // Calculate pressure equalization rate
    // Rate depends on pressure difference and valve opening
    const pressureDifference = params.upstreamPressure - params.downstreamPressure;
    const openingFactor = params.bypassValveOpening / 100;
    const pressureEqualizationRate = pressureDifference * openingFactor * 0.1; // bar/s

    // Calculate valve stress
    // Stress depends on pressure difference and valve condition
    const valveArea = 0.5; // m² (assumed valve area)
    const force = pressureDifference * 100000 * valveArea; // N
    const valveStress = force / valveArea / 1000000; // MPa

    // Equalization status assessment
    // Optimal: 2-5 bar/s, Slow: < 2 bar/s, Fast: > 5 bar/s
    let equalizationStatus: 'OPTIMAL' | 'SLOW' | 'FAST' = 'OPTIMAL';
    if (pressureEqualizationRate > 5) equalizationStatus = 'FAST';
    else if (pressureEqualizationRate < 2) equalizationStatus = 'SLOW';

    const recommendations: string[] = [];
    if (equalizationStatus === 'FAST') {
      recommendations.push('⚠️ Fast equalization: Rate > 5 bar/s - risk of water hammer');
      recommendations.push('📊 Consider slower bypass valve operation');
    } else if (equalizationStatus === 'SLOW') {
      recommendations.push('⚠️ Slow equalization: Rate < 2 bar/s - extended equalization time');
      recommendations.push('📊 Check bypass valve for blockage or restriction');
    } else {
      recommendations.push('✅ Optimal equalization: Rate 2-5 bar/s - normal operation');
    }

    if (valveStress > 10) {
      recommendations.push('⚠️ High valve stress > 10 MPa: Risk of valve deformation');
    }

    if (pressureDifference > 60) {
      recommendations.push('⚠️ High pressure difference > 60 bar: Check for system issues');
    }

    if (params.bypassValveOpening > 80) {
      recommendations.push('⚠️ High bypass opening: May cause excessive flow');
    }

    if (valveStress > 15) {
      recommendations.push('🚨 Critical valve stress: Immediate inspection required');
    }

    return {
      pressureEqualizationRate,
      valveStress,
      equalizationStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateValveBypass);
  };

  const handleReset = () => {
    setParams({
      upstreamPressure: 50,
      downstreamPressure: 10,
      bypassValveOpening: 30
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Main Inlet Valve <span className="text-cyan-400">Bypass Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Pressure equalization calculation and valve stress prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Bypass Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Upstream Pressure (bar)"
                type="number"
                value={params.upstreamPressure}
                onChange={(e) => setParams({ ...params, upstreamPressure: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="5"
                max="100"
              />
              <ModernInput
                label="Downstream Pressure (bar)"
                type="number"
                value={params.downstreamPressure}
                onChange={(e) => setParams({ ...params, downstreamPressure: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="50"
              />
            </div>
            <ModernInput
              label="Bypass Valve Opening (%)"
              type="number"
              value={params.bypassValveOpening}
              onChange={(e) => setParams({ ...params, bypassValveOpening: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="0"
              max="100"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Equalization
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Equalization Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.equalizationStatus === 'FAST' ? 'bg-amber-950/20 border-amber-500' : results.equalizationStatus === 'SLOW' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Equalization Status</p>
                    <p className="text-2xl font-black text-white">{results.equalizationStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.equalizationStatus === 'FAST' ? 'text-amber-400' : results.equalizationStatus === 'SLOW' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pressure Equalization Rate</p>
                <p className="text-3xl font-black text-white">{results.pressureEqualizationRate.toFixed(2)} bar/s</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Valve Stress</p>
                <p className="text-3xl font-black text-white">{results.valveStress.toFixed(2)} MPa</p>
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
