// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, Waves, Settings } from 'lucide-react';
import { WaterHammerMonitor } from '../services/WaterHammerMonitor';

interface WaterHammerParams {
  flowRateM3PerS: number;
  closingTimeS: number;
  pipeLengthM: number;
  pipeDiameterM: number;
}

export const PenstockWaterHammerLab: React.FC = () => {
  const [params, setParams] = useState<WaterHammerParams>({
    flowRateM3PerS: 30,
    closingTimeS: 8,
    pipeLengthM: 500,
    pipeDiameterM: 3
  });

  const [results, setResults] = useState<ReturnType<typeof WaterHammerMonitor.checkHammer> | null>(null);

  const calculateWaterHammer = useMemo(() => {
    return WaterHammerMonitor.checkHammer(
      params.flowRateM3PerS,
      params.closingTimeS,
      params.pipeLengthM,
      params.pipeDiameterM
    );
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateWaterHammer);
  };

  const handleReset = () => {
    setParams({
      flowRateM3PerS: 30,
      closingTimeS: 8,
      pipeLengthM: 500,
      pipeDiameterM: 3
    });
    setResults(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'CRITICAL' || status === 'ALARM') return 'bg-red-950/20 border-red-500';
    if (status === 'WARNING' || status === 'MODERATE') return 'bg-amber-950/20 border-amber-500';
    return 'bg-emerald-950/20 border-emerald-500';
  };

  const getStatusIconColor = (status: string) => {
    if (status === 'CRITICAL' || status === 'ALARM') return 'text-red-400';
    if (status === 'WARNING' || status === 'MODERATE') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
            Penstock Water Hammer Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Water hammer detection, pressure rise calculation & mitigation
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Water Hammer Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Flow Rate (m³/s)"
                type="number"
                value={params.flowRateM3PerS}
                onChange={(e) => setParams({ ...params, flowRateM3PerS: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="100"
                step="0.5"
              />
              <ModernInput
                label="Closing Time (s)"
                type="number"
                value={params.closingTimeS}
                onChange={(e) => setParams({ ...params, closingTimeS: parseFloat(e.target.value) || 0 })}
                icon={<Settings className="w-4 h-4" />}
                min="0.5"
                max="60"
                step="0.1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Pipe Length (m)"
                type="number"
                value={params.pipeLengthM}
                onChange={(e) => setParams({ ...params, pipeLengthM: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="50"
                max="2000"
              />
              <ModernInput
                label="Pipe Diameter (m)"
                type="number"
                value={params.pipeDiameterM}
                onChange={(e) => setParams({ ...params, pipeDiameterM: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="0.5"
                max="10"
                step="0.1"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Water Hammer Analysis" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${getStatusColor(results.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-xl font-bold text-slate-100">{results.status}</p>
                  </div>
                  <Waves className={`w-10 h-10 ${getStatusIconColor(results.status)}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pressure Rise</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.pressureRiseBar.toFixed(1)} bar</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Wave Speed</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.waveSpeedMPS.toFixed(0)} m/s</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Action</p>
                <div className="space-y-2 text-sm text-slate-300">
                  {results.action.split('.').filter(Boolean).map((sentence, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{sentence.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
