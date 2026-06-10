import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Droplets, AlertTriangle } from 'lucide-react';
import { OilHealthMonitor, OilHealthStatus } from '../services/OilHealthMonitor';

interface OilDegradationParams {
  acidNumber: number; // tan
  oxidationLevel: number;
  waterPPM: number;
}

export const LubricatingOilDegradationLab: React.FC = () => {
  const [params, setParams] = useState<OilDegradationParams>({
    acidNumber: 0.1,
    oxidationLevel: 50,
    waterPPM: 100
  });

  const [results, setResults] = useState<OilHealthStatus | null>(null);
  const monitor = new OilHealthMonitor();

  const calculateOilDegradation = useMemo(() => {
    return monitor.checkOilHealth(
      params.acidNumber,
      params.oxidationLevel,
      params.waterPPM
    );
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateOilDegradation);
  };

  const handleReset = () => {
    setParams({
      acidNumber: 0.1,
      oxidationLevel: 50,
      waterPPM: 100
    });
    setResults(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'CRITICAL') return 'bg-red-950/20 border-red-500';
    if (status === 'WARNING') return 'bg-amber-950/20 border-amber-500';
    return 'bg-emerald-950/20 border-emerald-500';
  };

  const getStatusIconColor = (status: string) => {
    if (status === 'CRITICAL') return 'text-red-400';
    if (status === 'WARNING') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
            Oil Degradation Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Lubricating oil health monitoring and remaining life assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Oil Analysis Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Acid Number (mg KOH/g)"
                type="number"
                value={params.acidNumber}
                onChange={(e) => setParams({ ...params, acidNumber: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="1"
                step="0.01"
              />
              <ModernInput
                label="Oxidation Level (%)"
                type="number"
                value={params.oxidationLevel}
                onChange={(e) => setParams({ ...params, oxidationLevel: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Water Content (ppm)"
                type="number"
                value={params.waterPPM}
                onChange={(e) => setParams({ ...params, waterPPM: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="1000"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Health
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Oil Degradation Analysis" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${getStatusColor(results.tanStatus)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Oil Health Status</p>
                    <p className="text-xl font-bold text-slate-100">{results.tanStatus}</p>
                  </div>
                  <Droplets className={`w-10 h-10 ${getStatusIconColor(results.tanStatus)}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Health Score</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.score.toFixed(0)}/100</p>
                </div>
              </div>

              {results.degradationReason && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Reason</p>
                  <p className="text-sm text-slate-300">{results.degradationReason}</p>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
