import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface UnitStartupSequenceParams {
  gateOpeningTime: number; // seconds
  excitationBuildUpTime: number; // seconds
  synchronizationTime: number; // seconds
}

interface UnitStartupSequenceResults {
  totalStartupTime: number; // seconds
  synchronizationSuccess: number; // %
  startupStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'SLOW';
  recommendations: string[];
}

export const UnitStartupSequenceLab: React.FC = () => {
  const [params, setParams] = useState<UnitStartupSequenceParams>({
    gateOpeningTime: 60,
    excitationBuildUpTime: 30,
    synchronizationTime: 45
  });

  const [results, setResults] = useState<UnitStartupSequenceResults | null>(null);

  const calculateUnitStartup = useMemo(() => {
    // Calculate total start-up time
    const totalStartupTime = params.gateOpeningTime + params.excitationBuildUpTime + params.synchronizationTime;

    // Calculate synchronization success
    // Success depends on timing accuracy and sequence coordination
    const optimalGateTime = 50; // seconds
    const optimalExcitationTime = 25; // seconds
    const optimalSyncTime = 40; // seconds

    const gateDeviation = Math.abs(params.gateOpeningTime - optimalGateTime) / optimalGateTime;
    const excitationDeviation = Math.abs(params.excitationBuildUpTime - optimalExcitationTime) / optimalExcitationTime;
    const syncDeviation = Math.abs(params.synchronizationTime - optimalSyncTime) / optimalSyncTime;

    const totalDeviation = (gateDeviation + excitationDeviation + syncDeviation) / 3;
    const synchronizationSuccess = Math.max(0, 100 - (totalDeviation * 100));

    // Start-up status assessment
    // Optimal: < 120s, Acceptable: 120-180s, Slow: > 180s
    let startupStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'SLOW' = 'OPTIMAL';
    if (totalStartupTime > 180) startupStatus = 'SLOW';
    else if (totalStartupTime > 120) startupStatus = 'ACCEPTABLE';

    const recommendations: string[] = [];
    if (startupStatus === 'SLOW') {
      recommendations.push('⚠️ Slow start-up: Time > 180s - optimize sequence for faster response');
      recommendations.push('📊 Consider parallel operations where possible');
    } else if (startupStatus === 'ACCEPTABLE') {
      recommendations.push('✅ Acceptable start-up: Time 120-180s - normal operation');
      recommendations.push('📊 Monitor timing for potential optimization');
    } else {
      recommendations.push('✅ Optimal start-up: Time < 120s - excellent performance');
    }

    if (synchronizationSuccess < 80) {
      recommendations.push('⚠️ Low sync success < 80%: Risk of synchronization failure');
    }

    if (params.gateOpeningTime > 90) {
      recommendations.push('⚠️ Slow gate opening: Check hydraulic system and servomotor');
    }

    if (params.excitationBuildUpTime > 45) {
      recommendations.push('⚠️ Slow excitation build-up: Check excitation system');
    }

    if (params.synchronizationTime > 60) {
      recommendations.push('⚠️ Slow synchronization: Check governor and AVR response');
    }

    return {
      totalStartupTime,
      synchronizationSuccess,
      startupStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateUnitStartup);
  };

  const handleReset = () => {
    setParams({
      gateOpeningTime: 60,
      excitationBuildUpTime: 30,
      synchronizationTime: 45
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Unit Start-Up <span className="text-cyan-400">Sequence Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Start-up timing calculation and synchronization success prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Start-Up Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Gate Opening Time (s)"
              type="number"
              value={params.gateOpeningTime}
              onChange={(e) => setParams({ ...params, gateOpeningTime: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10"
              max="180"
            />
            <ModernInput
              label="Excitation Build-Up Time (s)"
              type="number"
              value={params.excitationBuildUpTime}
              onChange={(e) => setParams({ ...params, excitationBuildUpTime: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="5"
              max="90"
            />
            <ModernInput
              label="Synchronization Time (s)"
              type="number"
              value={params.synchronizationTime}
              onChange={(e) => setParams({ ...params, synchronizationTime: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="10"
              max="120"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Sequence
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Sequence Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.startupStatus === 'SLOW' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Start-Up Status</p>
                    <p className="text-2xl font-black text-white">{results.startupStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.startupStatus === 'SLOW' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Start-Up Time</p>
                <p className="text-3xl font-black text-white">{results.totalStartupTime.toFixed(0)} s</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Synchronization Success</p>
                <p className="text-3xl font-black text-white">{results.synchronizationSuccess.toFixed(1)}%</p>
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
