import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface OverspeedParams {
  initialGeneratorLoad: number; // MW
  rotatingMassInertia: number; // kg·m²
  wicketGateClosingTime: number; // seconds
}

interface OverspeedResults {
  maxTransientSpeedRise: number; // %
  waterHammerPressurePeak: number; // bar
  overspeedStatus: 'ACCEPTABLE' | 'MARGINAL' | 'CRITICAL';
  recommendations: string[];
}

export const LoadRejectionOverspeedLab: React.FC = () => {
  const [params, setParams] = useState<OverspeedParams>({
    initialGeneratorLoad: 100,
    rotatingMassInertia: 50000,
    wicketGateClosingTime: 10
  });

  const [results, setResults] = useState<OverspeedResults | null>(null);

  const calculateOverspeed = useMemo(() => {
    // Calculate maximum transient speed rise
    // Speed rise depends on load rejection, inertia, and gate closing time
    // Simplified: Δn/n = (P × t) / (J × ω²)
    const ratedSpeed = 150; // RPM (typical)
    const angularVelocity = (ratedSpeed * 2 * Math.PI) / 60; // rad/s
    const powerKW = params.initialGeneratorLoad * 1000; // kW
    const closingTime = params.wicketGateClosingTime;
    const inertia = params.rotatingMassInertia;

    // Speed rise calculation
    const speedRiseRatio = (powerKW * closingTime) / (inertia * Math.pow(angularVelocity, 2));
    const maxTransientSpeedRise = speedRiseRatio * 100;

    // Calculate water hammer pressure peak
    // Joukowsky equation: ΔP = ρ × c × Δv
    // Simplified based on gate closing time
    const waterDensity = 1000; // kg/m³
    const waveSpeed = 1000; // m/s (typical for penstock)
    const waterVelocity = 5; // m/s (typical)
    const closingFactor = Math.min(1, 5 / closingTime); // Faster closing = higher pressure
    const waterHammerPressurePeak = (waterDensity * waveSpeed * waterVelocity * closingFactor) / 100000; // bar

    // Overspeed status assessment
    // Acceptable: < 40%, Marginal: 40-60%, Critical: > 60%
    let overspeedStatus: 'ACCEPTABLE' | 'MARGINAL' | 'CRITICAL' = 'ACCEPTABLE';
    if (maxTransientSpeedRise > 60) overspeedStatus = 'CRITICAL';
    else if (maxTransientSpeedRise > 40) overspeedStatus = 'MARGINAL';

    const recommendations: string[] = [];
    if (overspeedStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical overspeed: Speed rise > 60% - immediate governor adjustment required');
      recommendations.push('⚠️ High water hammer pressure - check penstock design and surge tank');
    } else if (overspeedStatus === 'MARGINAL') {
      recommendations.push('⚠️ Marginal overspeed: Speed rise 40-60% - monitor governor response');
      recommendations.push('📊 Consider faster gate closing or additional inertia');
    } else {
      recommendations.push('✅ Acceptable overspeed: Speed rise < 40% - normal operation');
    }

    if (waterHammerPressurePeak > 20) {
      recommendations.push('🌊 High water hammer pressure > 20 bar: Risk of penstock damage');
    }

    if (params.wicketGateClosingTime > 15) {
      recommendations.push('⚠️ Slow gate closing: Consider faster closing to reduce speed rise');
    }

    if (params.wicketGateClosingTime < 5) {
      recommendations.push('⚠️ Fast gate closing: May cause excessive water hammer pressure');
    }

    if (params.rotatingMassInertia < 30000) {
      recommendations.push('⚠️ Low inertia: Consider adding flywheel for better speed control');
    }

    return {
      maxTransientSpeedRise,
      waterHammerPressurePeak,
      overspeedStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateOverspeed);
  };

  const handleReset = () => {
    setParams({
      initialGeneratorLoad: 100,
      rotatingMassInertia: 50000,
      wicketGateClosingTime: 10
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Load Rejection <span className="text-cyan-400">Overspeed Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Transient speed rise and water hammer pressure prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Overspeed Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Initial Generator Load (MW)"
              type="number"
              value={params.initialGeneratorLoad}
              onChange={(e) => setParams({ ...params, initialGeneratorLoad: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="10"
              max="500"
            />
            <ModernInput
              label="Rotating Mass Inertia (kg·m²)"
              type="number"
              value={params.rotatingMassInertia}
              onChange={(e) => setParams({ ...params, rotatingMassInertia: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10000"
              max="200000"
            />
            <ModernInput
              label="Wicket Gate Closing Time (s)"
              type="number"
              value={params.wicketGateClosingTime}
              onChange={(e) => setParams({ ...params, wicketGateClosingTime: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="2"
              max="30"
              step="0.5"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Overspeed
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Overspeed Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.overspeedStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.overspeedStatus === 'MARGINAL' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Overspeed Status</p>
                    <p className="text-2xl font-black text-white">{results.overspeedStatus}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.overspeedStatus === 'CRITICAL' ? 'text-red-400' : results.overspeedStatus === 'MARGINAL' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Transient Speed Rise</p>
                <p className="text-3xl font-black text-white">{results.maxTransientSpeedRise.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Water Hammer Pressure Peak</p>
                <p className="text-3xl font-black text-white">{results.waterHammerPressurePeak.toFixed(1)} bar</p>
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
