import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Zap, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface PartialDischargeParams {
  pdMagnitude: number; // pC
  pdInceptionVoltage: number; // kV
  operatingVoltage: number; // kV
}

interface PartialDischargeResults {
  pdSeverityIndex: number; // %
  insulationRemainingLife: number; // years
  pdStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  recommendations: string[];
}

export const PartialDischargeLab: React.FC = () => {
  const [params, setParams] = useState<PartialDischargeParams>({
    pdMagnitude: 100,
    pdInceptionVoltage: 15,
    operatingVoltage: 13.8
  });

  const [results, setResults] = useState<PartialDischargeResults | null>(null);

  const calculatePartialDischarge = useMemo(() => {
    // Calculate PD severity index
    // Severity depends on PD magnitude and voltage margin
    const voltageMargin = params.pdInceptionVoltage - params.operatingVoltage;
    const voltageMarginRatio = voltageMargin / params.pdInceptionVoltage;
    const pdMagnitudeFactor = params.pdMagnitude / 1000; // Normalized against 1000 pC
    
    // PD severity index (0-100%)
    const pdSeverityIndex = (pdMagnitudeFactor * 70) + ((1 - voltageMarginRatio) * 30);

    // Calculate insulation remaining life
    // Life decreases exponentially with PD severity
    const baseLife = 30; // years
    const severityFactor = pdSeverityIndex / 100;
    const insulationRemainingLife = baseLife * Math.pow(0.9, severityFactor * 10);

    // PD status assessment
    // Normal: < 30%, Elevated: 30-60%, Critical: > 60%
    let pdStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';
    if (pdSeverityIndex > 60) pdStatus = 'CRITICAL';
    else if (pdSeverityIndex > 30) pdStatus = 'ELEVATED';

    const recommendations: string[] = [];
    if (pdStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical PD: Severity > 60% - immediate insulation inspection required');
      recommendations.push('⚠️ High PD magnitude - risk of insulation failure');
    } else if (pdStatus === 'ELEVATED') {
      recommendations.push('⚠️ Elevated PD: Severity 30-60% - monitor PD trends');
      recommendations.push('📊 Schedule insulation testing during next maintenance');
    } else {
      recommendations.push('✅ Normal PD: Severity < 30% - normal operation');
    }

    if (voltageMargin < 2) {
      recommendations.push('⚠️ Low voltage margin < 2 kV: Risk of PD inception during transients');
    }

    if (params.pdMagnitude > 500) {
      recommendations.push('⚠️ High PD magnitude > 500 pC: Significant insulation degradation');
    }

    if (insulationRemainingLife < 10) {
      recommendations.push('🔧 Low remaining life < 10 years: Plan for insulation replacement');
    }

    if (params.operatingVoltage > params.pdInceptionVoltage * 0.9) {
      recommendations.push('⚠️ Operating voltage near inception: Consider voltage reduction');
    }

    return {
      pdSeverityIndex,
      insulationRemainingLife,
      pdStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculatePartialDischarge);
  };

  const handleReset = () => {
    setParams({
      pdMagnitude: 100,
      pdInceptionVoltage: 15,
      operatingVoltage: 13.8
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Partial Discharge <span className="text-cyan-400">Severity Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            PD severity index calculation and insulation life prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="PD Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="PD Magnitude (pC)"
              type="number"
              value={params.pdMagnitude}
              onChange={(e) => setParams({ ...params, pdMagnitude: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="10"
              max="10000"
            />
            <ModernInput
              label="PD Inception Voltage (kV)"
              type="number"
              value={params.pdInceptionVoltage}
              onChange={(e) => setParams({ ...params, pdInceptionVoltage: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="5"
              max="30"
              step="0.1"
            />
            <ModernInput
              label="Operating Voltage (kV)"
              type="number"
              value={params.operatingVoltage}
              onChange={(e) => setParams({ ...params, operatingVoltage: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="5"
              max="30"
              step="0.1"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate PD Severity
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="PD Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.pdStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.pdStatus === 'ELEVATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">PD Status</p>
                    <p className="text-2xl font-black text-white">{results.pdStatus}</p>
                  </div>
                  <Zap className={`w-12 h-12 ${results.pdStatus === 'CRITICAL' ? 'text-red-400' : results.pdStatus === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">PD Severity Index</p>
                <p className="text-3xl font-black text-white">{results.pdSeverityIndex.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Insulation Remaining Life</p>
                <p className="text-3xl font-black text-white">{results.insulationRemainingLife.toFixed(1)} years</p>
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
