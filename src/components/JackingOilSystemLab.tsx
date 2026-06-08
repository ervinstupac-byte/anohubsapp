import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';

interface JOSParams {
  pumpDischargePressure: number; // bar
  pad1Lift: number; // mm
  pad2Lift: number; // mm
  pad3Lift: number; // mm
  pad4Lift: number; // mm
  pad5Lift: number; // mm
  pad6Lift: number; // mm
  pad7Lift: number; // mm
  pad8Lift: number; // mm
  oilViscosity: number; // cSt
}

interface JOSResults {
  fluidFrictionCoefficient: number;
  startupWipingRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  avgLift: number; // mm
  recommendations: string[];
}

export const JackingOilSystemLab: React.FC = () => {
  const [params, setParams] = useState<JOSParams>({
    pumpDischargePressure: 150,
    pad1Lift: 0.15, pad2Lift: 0.15, pad3Lift: 0.15, pad4Lift: 0.15,
    pad5Lift: 0.15, pad6Lift: 0.15, pad7Lift: 0.15, pad8Lift: 0.15,
    oilViscosity: 46
  });

  const [results, setResults] = useState<JOSResults | null>(null);

  const calculateJOS = useMemo(() => {
    const padLifts = [
      params.pad1Lift, params.pad2Lift, params.pad3Lift, params.pad4Lift,
      params.pad5Lift, params.pad6Lift, params.pad7Lift, params.pad8Lift
    ];

    const avgLift = padLifts.reduce((a, b) => a + b, 0) / padLifts.length;
    const minLift = Math.min(...padLifts);
    const maxLift = Math.max(...padLifts);
    const liftVariation = maxLift - minLift;

    // Calculate fluid friction coefficient
    // μ = (P × A) / (N × v)
    // Simplified: based on pressure, viscosity, and lift uniformity
    const viscosityFactor = params.oilViscosity / 46; // Normalized against ISO VG46
    const pressureFactor = params.pumpDischargePressure / 150; // Normalized against 150 bar
    const uniformityFactor = 1 - (liftVariation / avgLift); // Higher uniformity = lower friction
    const fluidFrictionCoefficient = viscosityFactor * pressureFactor * uniformityFactor * 0.1;

    // Start-up wiping risk assessment
    // Risk increases with low lift, high lift variation, and low viscosity
    const liftScore = minLift / 0.1; // Normalized against 0.1mm minimum
    const variationScore = 1 - (liftVariation / 0.1); // Higher variation = higher risk
    const viscosityScore = viscosityFactor; // Lower viscosity = higher risk
    const totalRiskScore = (liftScore + variationScore + viscosityScore) / 3;

    let startupWipingRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (totalRiskScore < 0.5) startupWipingRisk = 'HIGH';
    else if (totalRiskScore < 0.7) startupWipingRisk = 'MEDIUM';

    const recommendations: string[] = [];
    if (startupWipingRisk === 'HIGH') {
      recommendations.push('🚨 High start-up wiping risk: Critical - check pump pressure and oil viscosity');
      recommendations.push('⚠️ Inspect pad surfaces for wear before next start-up');
    } else if (startupWipingRisk === 'MEDIUM') {
      recommendations.push('⚠️ Moderate start-up wiping risk: Monitor - verify lift during next start-up');
      recommendations.push('📊 Check pad lift uniformity across all pads');
    } else {
      recommendations.push('✅ Low start-up wiping risk: System operating within parameters');
    }

    if (minLift < 0.1) {
      recommendations.push('⚠️ Minimum lift < 0.1mm: Risk of pad contact - check pump pressure');
    }

    if (liftVariation > 0.05) {
      recommendations.push('⚠️ Lift variation > 0.05mm: Check pad leveling and oil flow distribution');
    }

    if (params.oilViscosity < 32) {
      recommendations.push('💧 Oil viscosity < 32 cSt: Risk of insufficient film thickness - check oil temperature');
    }

    if (params.pumpDischargePressure < 100) {
      recommendations.push('⚠️ Pump pressure < 100 bar: Insufficient for reliable lift - check pump system');
    }

    return {
      fluidFrictionCoefficient,
      startupWipingRisk,
      avgLift,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateJOS);
  };

  const handleReset = () => {
    setParams({
      pumpDischargePressure: 150,
      pad1Lift: 0.15, pad2Lift: 0.15, pad3Lift: 0.15, pad4Lift: 0.15,
      pad5Lift: 0.15, pad6Lift: 0.15, pad7Lift: 0.15, pad8Lift: 0.15,
      oilViscosity: 46
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Jacking Oil <span className="text-cyan-400">System Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Lift verification and start-up wiping risk assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="JOS Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Pump Discharge Pressure (bar)"
              type="number"
              value={params.pumpDischargePressure}
              onChange={(e) => setParams({ ...params, pumpDischargePressure: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="50"
              max="300"
            />
            <ModernInput
              label="Oil Viscosity (cSt)"
              type="number"
              value={params.oilViscosity}
              onChange={(e) => setParams({ ...params, oilViscosity: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="10"
              max="100"
            />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Pad Lift Readings (mm)</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((pad) => (
                  <ModernInput
                    key={`pad-${pad}`}
                    label={`Pad ${pad}`}
                    type="number"
                    value={params[`pad${pad}Lift` as keyof JOSParams] as number}
                    onChange={(e) => setParams({ ...params, [`pad${pad}Lift` as keyof JOSParams]: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate JOS
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="JOS Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.startupWipingRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.startupWipingRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Start-up Wiping Risk</p>
                    <p className="text-2xl font-black text-white">{results.startupWipingRisk}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.startupWipingRisk === 'HIGH' ? 'text-red-400' : results.startupWipingRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fluid Friction Coefficient</p>
                <p className="text-3xl font-black text-white">{results.fluidFrictionCoefficient.toFixed(4)}</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Average Pad Lift</p>
                <p className="text-3xl font-black text-white">{results.avgLift.toFixed(3)} mm</p>
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
