import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface TrunnionFrictionParams {
  bladeServoPressure: number; // bar
  trunnionBearingDiameter: number; // mm
  measuredBladeTorque: number; // Nm
}

interface TrunnionFrictionResults {
  frictionCoefficient: number;
  bladeResponseLag: number; // seconds
  frictionStatus: 'NORMAL' | 'ELEVATED' | 'HIGH';
  recommendations: string[];
}

export const KaplanBladeTrunnionLab: React.FC = () => {
  const [params, setParams] = useState<TrunnionFrictionParams>({
    bladeServoPressure: 100,
    trunnionBearingDiameter: 150,
    measuredBladeTorque: 500
  });

  const [results, setResults] = useState<TrunnionFrictionResults | null>(null);

  const calculateTrunnionFriction = useMemo(() => {
    // Calculate friction coefficient
    // μ = T / (P × r)
    const servoPressurePa = params.bladeServoPressure * 100000; // Pa
    const bearingRadius = params.trunnionBearingDiameter / 2000; // meters
    const normalForce = servoPressurePa * Math.PI * Math.pow(bearingRadius, 2); // N
    const frictionCoefficient = params.measuredBladeTorque / (normalForce * bearingRadius);

    // Calculate blade response lag
    // Lag depends on friction and servo system dynamics
    const baseLag = 0.5; // seconds
    const frictionFactor = frictionCoefficient / 0.1; // Normalized against 0.1
    const bladeResponseLag = baseLag * (1 + frictionFactor);

    // Friction status assessment
    // Normal: < 0.05, Elevated: 0.05-0.1, High: > 0.1
    let frictionStatus: 'NORMAL' | 'ELEVATED' | 'HIGH' = 'NORMAL';
    if (frictionCoefficient > 0.1) frictionStatus = 'HIGH';
    else if (frictionCoefficient > 0.05) frictionStatus = 'ELEVATED';

    const recommendations: string[] = [];
    if (frictionStatus === 'HIGH') {
      recommendations.push('🚨 High friction: Coefficient > 0.1 - immediate bearing inspection required');
      recommendations.push('⚠️ High blade response lag - may affect cam curve performance');
    } else if (frictionStatus === 'ELEVATED') {
      recommendations.push('⚠️ Elevated friction: Coefficient 0.05-0.1 - monitor bearing condition');
      recommendations.push('📊 Check lubrication and bearing wear');
    } else {
      recommendations.push('✅ Normal friction: Coefficient < 0.05 - normal operation');
    }

    if (bladeResponseLag > 1.0) {
      recommendations.push('⚠️ High response lag > 1s: May cause cam curve deviation');
    }

    if (params.bladeServoPressure < 50) {
      recommendations.push('⚠️ Low servo pressure: May cause insufficient blade movement force');
    }

    if (frictionCoefficient > 0.15) {
      recommendations.push('🔧 Very high friction: Bearing may be seized or severely worn');
    }

    return {
      frictionCoefficient,
      bladeResponseLag,
      frictionStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateTrunnionFriction);
  };

  const handleReset = () => {
    setParams({
      bladeServoPressure: 100,
      trunnionBearingDiameter: 150,
      measuredBladeTorque: 500
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Kaplan Blade <span className="text-cyan-400">Trunnion Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Trunnion friction calculation and blade response lag prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Trunnion Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Blade Servo Pressure (bar)"
              type="number"
              value={params.bladeServoPressure}
              onChange={(e) => setParams({ ...params, bladeServoPressure: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="20"
              max="200"
            />
            <ModernInput
              label="Trunnion Bearing Diameter (mm)"
              type="number"
              value={params.trunnionBearingDiameter}
              onChange={(e) => setParams({ ...params, trunnionBearingDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="50"
              max="300"
            />
            <ModernInput
              label="Measured Blade Torque (Nm)"
              type="number"
              value={params.measuredBladeTorque}
              onChange={(e) => setParams({ ...params, measuredBladeTorque: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="100"
              max="5000"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Friction
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Friction Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.frictionStatus === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.frictionStatus === 'ELEVATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Friction Status</p>
                    <p className="text-2xl font-black text-white">{results.frictionStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.frictionStatus === 'HIGH' ? 'text-red-400' : results.frictionStatus === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Friction Coefficient</p>
                <p className="text-3xl font-black text-white">{results.frictionCoefficient.toFixed(4)}</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Blade Response Lag</p>
                <p className="text-3xl font-black text-white">{results.bladeResponseLag.toFixed(2)} s</p>
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
