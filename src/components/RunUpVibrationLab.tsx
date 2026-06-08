import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface RunUpVibrationParams {
  criticalSpeed: number; // RPM
  runUpAccelerationRate: number; // RPM/s
  measuredVibrationAmplitude: number; // mm/s
}

interface RunUpVibrationResults {
  transientVibrationPeak: number; // mm/s
  bearingDamageRisk: number; // %
  vibrationStatus: 'ACCEPTABLE' | 'ELEVATED' | 'CRITICAL';
  recommendations: string[];
}

export const RunUpVibrationLab: React.FC = () => {
  const [params, setParams] = useState<RunUpVibrationParams>({
    criticalSpeed: 150,
    runUpAccelerationRate: 10,
    measuredVibrationAmplitude: 5
  });

  const [results, setResults] = useState<RunUpVibrationResults | null>(null);

  const calculateRunUpVibration = useMemo(() => {
    // Calculate transient vibration peak
    // Peak depends on acceleration rate and measured amplitude
    const accelerationFactor = 10 / params.runUpAccelerationRate; // Normalized against 10 RPM/s
    const transientVibrationPeak = params.measuredVibrationAmplitude * (1 + accelerationFactor * 0.5);

    // Calculate bearing damage risk
    // Risk depends on vibration peak and time spent near critical speed
    const dwellTime = 60 / params.runUpAccelerationRate; // seconds near critical speed
    const vibrationFactor = transientVibrationPeak / 10; // Normalized against 10 mm/s
    const bearingDamageRisk = (vibrationFactor * 0.7 + (dwellTime / 10) * 0.3) * 100;

    // Vibration status assessment
    // Acceptable: < 7 mm/s, Elevated: 7-12 mm/s, Critical: > 12 mm/s
    let vibrationStatus: 'ACCEPTABLE' | 'ELEVATED' | 'CRITICAL' = 'ACCEPTABLE';
    if (transientVibrationPeak > 12) vibrationStatus = 'CRITICAL';
    else if (transientVibrationPeak > 7) vibrationStatus = 'ELEVATED';

    const recommendations: string[] = [];
    if (vibrationStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical vibration: Peak > 12 mm/s - immediate investigation required');
      recommendations.push('⚠️ High bearing damage risk - check balance and alignment');
    } else if (vibrationStatus === 'ELEVATED') {
      recommendations.push('⚠️ Elevated vibration: Peak 7-12 mm/s - monitor during run-up');
      recommendations.push('📊 Consider faster acceleration to reduce dwell time');
    } else {
      recommendations.push('✅ Acceptable vibration: Peak < 7 mm/s - normal run-up');
    }

    if (bearingDamageRisk > 50) {
      recommendations.push('⚠️ High bearing damage risk > 50%: Accelerated wear possible');
    }

    if (params.runUpAccelerationRate < 5) {
      recommendations.push('⚠️ Slow acceleration: Extended dwell time near critical speed');
    }

    if (params.measuredVibrationAmplitude > 8) {
      recommendations.push('⚠️ High measured amplitude: Check for unbalance or misalignment');
    }

    if (transientVibrationPeak > params.measuredVibrationAmplitude * 1.5) {
      recommendations.push('⚠️ Significant transient amplification: Consider faster run-up');
    }

    return {
      transientVibrationPeak,
      bearingDamageRisk,
      vibrationStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateRunUpVibration);
  };

  const handleReset = () => {
    setParams({
      criticalSpeed: 150,
      runUpAccelerationRate: 10,
      measuredVibrationAmplitude: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Run-Up Vibration <span className="text-cyan-400">Transient Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Transient vibration peak calculation and bearing damage risk prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Run-Up Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Critical Speed (RPM)"
              type="number"
              value={params.criticalSpeed}
              onChange={(e) => setParams({ ...params, criticalSpeed: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="50"
              max="500"
            />
            <ModernInput
              label="Run-Up Acceleration Rate (RPM/s)"
              type="number"
              value={params.runUpAccelerationRate}
              onChange={(e) => setParams({ ...params, runUpAccelerationRate: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="50"
              step="0.5"
            />
            <ModernInput
              label="Measured Vibration Amplitude (mm/s)"
              type="number"
              value={params.measuredVibrationAmplitude}
              onChange={(e) => setParams({ ...params, measuredVibrationAmplitude: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="0"
              max="20"
              step="0.5"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Vibration
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Vibration Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.vibrationStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.vibrationStatus === 'ELEVATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vibration Status</p>
                    <p className="text-2xl font-black text-white">{results.vibrationStatus}</p>
                  </div>
                  <Waves className={`w-12 h-12 ${results.vibrationStatus === 'CRITICAL' ? 'text-red-400' : results.vibrationStatus === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transient Vibration Peak</p>
                <p className="text-3xl font-black text-white">{results.transientVibrationPeak.toFixed(2)} mm/s</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bearing Damage Risk</p>
                <p className="text-3xl font-black text-white">{results.bearingDamageRisk.toFixed(1)}%</p>
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
