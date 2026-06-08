import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface WaterHammerParams {
  penstockLength: number; // meters
  waveSpeed: number; // m/s
  valveClosingTime: number; // seconds
  initialFlowVelocity: number; // m/s
}

interface WaterHammerResults {
  joukowskyPressureRise: number; // bar
  pipeStress: number; // MPa
  waterHammerStatus: 'SAFE' | 'MODERATE' | 'CRITICAL';
  recommendations: string[];
}

export const PenstockWaterHammerLab: React.FC = () => {
  const [params, setParams] = useState<WaterHammerParams>({
    penstockLength: 500,
    waveSpeed: 1000,
    valveClosingTime: 10,
    initialFlowVelocity: 5
  });

  const [results, setResults] = useState<WaterHammerResults | null>(null);

  const calculateWaterHammer = useMemo(() => {
    // Calculate Joukowsky pressure rise
    // ΔP = ρ × c × Δv
    const waterDensity = 1000; // kg/m³
    const waveSpeed = params.waveSpeed; // m/s
    const velocityChange = params.initialFlowVelocity; // m/s (assuming complete stop)
    const joukowskyPressureRise = (waterDensity * waveSpeed * velocityChange) / 100000; // bar

    // Calculate pipe stress during transient
    // Hoop stress = (P × D) / (2 × t)
    // Assuming penstock diameter of 3m and wall thickness of 30mm
    const penstockDiameter = 3; // meters
    const wallThickness = 0.03; // meters
    const pressurePa = joukowskyPressureRise * 100000; // Pa
    const pipeStress = (pressurePa * penstockDiameter) / (2 * wallThickness) / 1000000; // MPa

    // Water hammer status assessment
    // Safe: < 10 bar, Moderate: 10-20 bar, Critical: > 20 bar
    let waterHammerStatus: 'SAFE' | 'MODERATE' | 'CRITICAL' = 'SAFE';
    if (joukowskyPressureRise > 20) waterHammerStatus = 'CRITICAL';
    else if (joukowskyPressureRise > 10) waterHammerStatus = 'MODERATE';

    const recommendations: string[] = [];
    if (waterHammerStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical water hammer: Pressure rise > 20 bar - immediate mitigation required');
      recommendations.push('⚠️ High pipe stress - check penstock design and surge tank capacity');
    } else if (waterHammerStatus === 'MODERATE') {
      recommendations.push('⚠️ Moderate water hammer: Pressure rise 10-20 bar - monitor during operation');
      recommendations.push('📊 Consider surge tank or pressure relief valve installation');
    } else {
      recommendations.push('✅ Safe water hammer: Pressure rise < 10 bar - normal operation');
    }

    // Calculate pipe period
    const pipePeriod = (2 * params.penstockLength) / params.waveSpeed;
    const isRapidClosure = params.valveClosingTime < pipePeriod;

    if (isRapidClosure) {
      recommendations.push('⚠️ Rapid closure: Valve closing time < pipe period - full Joukowsky pressure');
    } else {
      recommendations.push('✅ Gradual closure: Valve closing time > pipe period - reduced pressure');
    }

    if (pipeStress > 100) {
      recommendations.push('🔧 High pipe stress > 100 MPa: Risk of pipe deformation or failure');
    }

    if (params.valveClosingTime < 5) {
      recommendations.push('⚠️ Very fast closure: Consider slower closing or surge protection');
    }

    if (params.waveSpeed > 1200) {
      recommendations.push('⚠️ High wave speed: Check penstock material and support conditions');
    }

    return {
      joukowskyPressureRise,
      pipeStress,
      waterHammerStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateWaterHammer);
  };

  const handleReset = () => {
    setParams({
      penstockLength: 500,
      waveSpeed: 1000,
      valveClosingTime: 10,
      initialFlowVelocity: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Penstock <span className="text-cyan-400">Water Hammer Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Joukowsky pressure rise calculation and pipe stress prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Water Hammer Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Penstock Length (m)"
              type="number"
              value={params.penstockLength}
              onChange={(e) => setParams({ ...params, penstockLength: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="100"
              max="2000"
            />
            <ModernInput
              label="Wave Speed (m/s)"
              type="number"
              value={params.waveSpeed}
              onChange={(e) => setParams({ ...params, waveSpeed: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="500"
              max="1500"
            />
            <ModernInput
              label="Valve Closing Time (s)"
              type="number"
              value={params.valveClosingTime}
              onChange={(e) => setParams({ ...params, valveClosingTime: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="60"
              step="0.5"
            />
            <ModernInput
              label="Initial Flow Velocity (m/s)"
              type="number"
              value={params.initialFlowVelocity}
              onChange={(e) => setParams({ ...params, initialFlowVelocity: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="1"
              max="15"
              step="0.5"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Water Hammer
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Water Hammer Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.waterHammerStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.waterHammerStatus === 'MODERATE' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Water Hammer Status</p>
                    <p className="text-2xl font-black text-white">{results.waterHammerStatus}</p>
                  </div>
                  <Waves className={`w-12 h-12 ${results.waterHammerStatus === 'CRITICAL' ? 'text-red-400' : results.waterHammerStatus === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Joukowsky Pressure Rise</p>
                <p className="text-3xl font-black text-white">{results.joukowskyPressureRise.toFixed(1)} bar</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pipe Stress During Transient</p>
                <p className="text-3xl font-black text-white">{results.pipeStress.toFixed(1)} MPa</p>
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
