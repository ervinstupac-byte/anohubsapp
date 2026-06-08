import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, Zap } from 'lucide-react';

interface GovernorDeadbandParams {
  speedReference: number; // RPM
  measuredSpeed: number; // RPM
  deadbandSetting: number; // %
}

interface GovernorDeadbandResults {
  deadbandPercentage: number; // %
  complianceStatus: 'Pass (IEC Compliant)' | 'Fail (Out of Compliance)';
  recommendations: string[];
}

export const GovernorDeadbandLab: React.FC = () => {
  const [params, setParams] = useState<GovernorDeadbandParams>({
    speedReference: 100,
    measuredSpeed: 100.5,
    deadbandSetting: 0.05
  });

  const [results, setResults] = useState<GovernorDeadbandResults | null>(null);

  const calculateGovernorDeadband = useMemo(() => {
    // IEC 61362 compliant deadband check
    const speedDifference = Math.abs(params.measuredSpeed - params.speedReference);
    const deadbandPercentage = (speedDifference / params.speedReference) * 100;

    let complianceStatus: 'Pass (IEC Compliant)' | 'Fail (Out of Compliance)' = 'Pass (IEC Compliant)';
    if (deadbandPercentage > 0.02) {
      complianceStatus = 'Fail (Out of Compliance)';
    }

    const recommendations: string[] = [];
    if (complianceStatus === 'Fail (Out of Compliance)') {
      recommendations.push('⚠️ Deadband exceeds IEC 61362 limit of 0.02%');
      recommendations.push('📊 Check governor linkage and servo system for wear');
    } else {
      recommendations.push('✅ Deadband is within IEC 61362 compliant range');
    }

    return {
      deadbandPercentage,
      complianceStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateGovernorDeadband);
  };

  const handleReset = () => {
    setParams({
      speedReference: 100,
      measuredSpeed: 100.5,
      deadbandSetting: 0.05
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Governor <span className="text-cyan-400">Deadband Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            IEC 61362 compliant governor deadband verification
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Deadband Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Speed Reference (RPM)"
                type="number"
                value={params.speedReference}
                onChange={(e) => setParams({ ...params, speedReference: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="50"
                max="500"
              />
              <ModernInput
                label="Measured Speed (RPM)"
                type="number"
                value={params.measuredSpeed}
                onChange={(e) => setParams({ ...params, measuredSpeed: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="50"
                max="500"
                step="0.1"
              />
            </div>
            <ModernInput
              label="Deadband Setting (%)"
              type="number"
              value={params.deadbandSetting}
              onChange={(e) => setParams({ ...params, deadbandSetting: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="0.01"
              max="0.2"
              step="0.01"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Deadband
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Deadband Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.complianceStatus === 'Fail (Out of Compliance)' ? 'bg-red-950/20 border-red-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Compliance Status</p>
                    <p className="text-2xl font-black text-white">{results.complianceStatus}</p>
                  </div>
                  <Zap className={`w-12 h-12 ${results.complianceStatus === 'Fail (Out of Compliance)' ? 'text-red-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Measured Deadband</p>
                <p className="text-3xl font-black text-white">{results.deadbandPercentage.toFixed(4)}%</p>
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
