import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, Droplets } from 'lucide-react';
import { KaplanHubMonitor } from '../services/KaplanHubMonitor';

interface HubMonitoringParams {
  oilPressureBar: number;
  tailwaterLevelM: number;
  runnerDepthM: number;
}

export const KaplanHubMonitoringLab: React.FC = () => {
  const [params, setParams] = useState<HubMonitoringParams>({
    oilPressureBar: 3,
    tailwaterLevelM: 5,
    runnerDepthM: 3
  });

  const [results, setResults] = useState<ReturnType<typeof KaplanHubMonitor.prototype.checkHubHealth> | null>(null);

  const calculateHubHealth = useMemo(() => {
    const monitor = new KaplanHubMonitor();
    return monitor.checkHubHealth(
      params.oilPressureBar,
      params.tailwaterLevelM,
      params.runnerDepthM
    );
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateHubHealth);
  };

  const handleReset = () => {
    setParams({
      oilPressureBar: 3,
      tailwaterLevelM: 5,
      runnerDepthM: 3
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
            Kaplan Hub Monitoring Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Hub oil pressure monitoring and water ingress risk assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Hub Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <ModernInput
              label="Oil Pressure (bar)"
              type="number"
              value={params.oilPressureBar}
              onChange={(e) => setParams({ ...params, oilPressureBar: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="0"
              max="10"
              step="0.1"
            />
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Tailwater Level (m)"
                type="number"
                value={params.tailwaterLevelM}
                onChange={(e) => setParams({ ...params, tailwaterLevelM: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="20"
                step="0.1"
              />
              <ModernInput
                label="Runner Depth (m)"
                type="number"
                value={params.runnerDepthM}
                onChange={(e) => setParams({ ...params, runnerDepthM: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="10"
                step="0.1"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Check Hub Health
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Hub Health Analysis" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${getStatusColor(results.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hub Status</p>
                    <p className="text-xl font-bold text-slate-100">{results.status}</p>
                  </div>
                  <Droplets className={`w-10 h-10 ${getStatusIconColor(results.status)}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Oil Pressure</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.oilPressureBar.toFixed(1)} bar</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Water Pressure</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.waterPressureBar.toFixed(2)} bar</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Differential</p>
                <p className="text-2xl font-semibold text-slate-100">{results.differential.toFixed(2)} bar</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Message</p>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>{results.message}</span>
                  </div>
                  {results.waterIngressRisk && (
                    <div className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span className="text-red-300">Water ingress risk detected</span>
                    </div>
                  )}
                  {results.leakRisk && (
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span className="text-amber-300">Oil leak risk detected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};