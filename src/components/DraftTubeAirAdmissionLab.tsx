import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface AirAdmissionParams {
  vacuumBreakerOpeningPressure: number; // kPa
  airflowRate: number; // m³/s
  draftTubePulsationAmplitude: number; // kPa
}

interface AirAdmissionResults {
  optimalAirInjectionRatio: number; // %
  vibrationReduction: number; // %
  airAdmissionStatus: 'OPTIMAL' | 'INSUFFICIENT' | 'EXCESSIVE';
  recommendations: string[];
}

export const DraftTubeAirAdmissionLab: React.FC = () => {
  const [params, setParams] = useState<AirAdmissionParams>({
    vacuumBreakerOpeningPressure: 5,
    airflowRate: 2,
    draftTubePulsationAmplitude: 10
  });

  const [results, setResults] = useState<AirAdmissionResults | null>(null);

  const calculateAirAdmission = useMemo(() => {
    // Calculate optimal air injection ratio
    // Optimal ratio typically 0.5-1.5% of water flow rate
    // Assuming water flow rate of 50 m³/s for calculation
    const waterFlowRate = 50; // m³/s (assumed)
    const currentAirRatio = (params.airflowRate / waterFlowRate) * 100;
    const optimalAirRatio = 1.0; // % (typical optimal value)
    
    // Calculate vibration reduction
    // Vibration reduction depends on air ratio and pulsation amplitude
    const ratioEffectiveness = 1 - Math.abs(currentAirRatio - optimalAirRatio) / optimalAirRatio;
    const pulsationFactor = params.draftTubePulsationAmplitude / 20; // Normalized against 20 kPa
    const vibrationReduction = ratioEffectiveness * pulsationFactor * 80; // Max 80% reduction

    // Air admission status assessment
    let airAdmissionStatus: 'OPTIMAL' | 'INSUFFICIENT' | 'EXCESSIVE' = 'OPTIMAL';
    if (currentAirRatio < 0.5) airAdmissionStatus = 'INSUFFICIENT';
    else if (currentAirRatio > 2.0) airAdmissionStatus = 'EXCESSIVE';

    const recommendations: string[] = [];
    if (airAdmissionStatus === 'OPTIMAL') {
      recommendations.push('✅ Air admission optimal: Ratio within 0.5-2.0% range');
      recommendations.push('📊 Continue monitoring vibration levels');
    } else if (airAdmissionStatus === 'INSUFFICIENT') {
      recommendations.push('⚠️ Air admission insufficient: Ratio < 0.5% - increase airflow');
      recommendations.push('📊 Check vacuum breaker operation and valve settings');
    } else {
      recommendations.push('⚠️ Air admission excessive: Ratio > 2.0% - reduce airflow');
      recommendations.push('⚠️ Excessive air can reduce turbine efficiency');
    }

    if (vibrationReduction < 30) {
      recommendations.push('📊 Low vibration reduction: Check air injection location and distribution');
    }

    if (params.draftTubePulsationAmplitude > 15) {
      recommendations.push('🌊 High pulsation amplitude: Consider increasing air admission');
    }

    if (params.vacuumBreakerOpeningPressure > 8) {
      recommendations.push('⚠️ High opening pressure: Vacuum breaker may not open when needed');
    }

    if (params.vacuumBreakerOpeningPressure < 2) {
      recommendations.push('⚠️ Low opening pressure: Risk of premature air admission');
    }

    return {
      optimalAirInjectionRatio: optimalAirRatio,
      vibrationReduction,
      airAdmissionStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateAirAdmission);
  };

  const handleReset = () => {
    setParams({
      vacuumBreakerOpeningPressure: 5,
      airflowRate: 2,
      draftTubePulsationAmplitude: 10
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Draft Tube <span className="text-cyan-400">Air Admission Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Air injection ratio optimization and vibration reduction prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Air Admission Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Vacuum Breaker Opening Pressure (kPa)"
              type="number"
              value={params.vacuumBreakerOpeningPressure}
              onChange={(e) => setParams({ ...params, vacuumBreakerOpeningPressure: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="15"
              step="0.1"
            />
            <ModernInput
              label="Airflow Rate (m³/s)"
              type="number"
              value={params.airflowRate}
              onChange={(e) => setParams({ ...params, airflowRate: parseFloat(e.target.value) || 0 })}
              icon={<Waves className="w-4 h-4" />}
              min="0.1"
              max="10"
              step="0.1"
            />
            <ModernInput
              label="Draft Tube Pulsation Amplitude (kPa)"
              type="number"
              value={params.draftTubePulsationAmplitude}
              onChange={(e) => setParams({ ...params, draftTubePulsationAmplitude: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="30"
              step="0.5"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Air Admission
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Air Admission Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.airAdmissionStatus === 'OPTIMAL' ? 'bg-emerald-950/20 border-emerald-500' : 'bg-amber-950/20 border-amber-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Air Admission Status</p>
                    <p className="text-2xl font-black text-white">{results.airAdmissionStatus}</p>
                  </div>
                  <Waves className={`w-12 h-12 ${results.airAdmissionStatus === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Optimal Air Injection Ratio</p>
                <p className="text-3xl font-black text-white">{results.optimalAirInjectionRatio.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Vibration Reduction</p>
                <p className="text-3xl font-black text-white">{results.vibrationReduction.toFixed(1)}%</p>
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
