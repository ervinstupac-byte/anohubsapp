import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Droplets, AlertTriangle, Activity, Thermometer } from 'lucide-react';
import { CavitationWatcher } from '../services/CavitationWatcher';

interface CavitationParams {
  tailwaterElevation: number; // meters (masl)
  runnerElevation: number; // meters (masl)
  netHeadM: number; // meters
  waterTempC: number; // °C
  atmosPressureBar: number; // bar
}

export const FrancisCavitationProfilingLab: React.FC = () => {
  const [params, setParams] = useState<CavitationParams>({
    tailwaterElevation: 100,
    runnerElevation: 95,
    netHeadM: 100,
    waterTempC: 20,
    atmosPressureBar: 1.013
  });

  const [results, setResults] = useState<ReturnType<typeof CavitationWatcher.analyze> | null>(null);

  const calculateCavitation = useMemo(() => {
    return CavitationWatcher.analyze(
      params.tailwaterElevation,
      params.runnerElevation,
      params.netHeadM,
      params.waterTempC,
      params.atmosPressureBar
    );
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateCavitation);
  };

  const handleReset = () => {
    setParams({
      tailwaterElevation: 100,
      runnerElevation: 95,
      netHeadM: 100,
      waterTempC: 20,
      atmosPressureBar: 1.013
    });
    setResults(null);
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'FULL_CAVITATION') return 'bg-red-950/20 border-red-500';
    if (risk === 'INCEPTION') return 'bg-amber-950/20 border-amber-500';
    return 'bg-emerald-950/20 border-emerald-500';
  };

  const getRiskIconColor = (risk: string) => {
    if (risk === 'FULL_CAVITATION') return 'text-red-400';
    if (risk === 'INCEPTION') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
            Francis Cavitation Profiling
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            NPSH & Thoma Sigma calculation using temperature-dependent vapor pressure
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Cavitation Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Tailwater Elevation (masl)"
                type="number"
                value={params.tailwaterElevation}
                onChange={(e) => setParams({ ...params, tailwaterElevation: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="300"
                step="0.1"
              />
              <ModernInput
                label="Runner Elevation (masl)"
                type="number"
                value={params.runnerElevation}
                onChange={(e) => setParams({ ...params, runnerElevation: parseFloat(e.target.value) || 0 })}
                icon={<Droplets className="w-4 h-4" />}
                min="0"
                max="300"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Net Head (m)"
                type="number"
                value={params.netHeadM}
                onChange={(e) => setParams({ ...params, netHeadM: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="10"
                max="500"
              />
              <ModernInput
                label="Water Temp (°C)"
                type="number"
                value={params.waterTempC}
                onChange={(e) => setParams({ ...params, waterTempC: parseFloat(e.target.value) || 0 })}
                icon={<Thermometer className="w-4 h-4" />}
                min="0"
                max="40"
                step="0.1"
              />
            </div>

            <ModernInput
              label="Atmospheric Pressure (bar)"
              type="number"
              value={params.atmosPressureBar}
              onChange={(e) => setParams({ ...params, atmosPressureBar: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0.8"
              max="1.1"
              step="0.001"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Cavitation
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Cavitation Analysis" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${getRiskColor(results.riskLevel)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Risk Status</p>
                    <p className="text-xl font-bold text-slate-100">{results.riskLevel}</p>
                  </div>
                  <AlertTriangle className={`w-10 h-10 ${getRiskIconColor(results.riskLevel)}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">NPSH Available (m)</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.npshAvailable.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">NPSH Required (m)</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.npshRequired.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thoma Plant (σ)</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.sigmaPlant.toFixed(3)}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thoma Critical (σ)</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.sigmaCritical.toFixed(3)}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Recommendations</p>
                <div className="space-y-2 text-sm text-slate-300">
                  {results.riskLevel === 'FULL_CAVITATION' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>CRITICAL: NPSH Available &lt; Required - immediate action required</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>Reduce load or increase tailwater level</span>
                      </div>
                    </>
                  )}
                  {results.riskLevel === 'INCEPTION' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>WARNING: Cavitation inception risk - monitor closely</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>Schedule runner inspection during next maintenance</span>
                      </div>
                    </>
                  )}
                  {results.riskLevel === 'SAFE' && (
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>SAFE: Cavitation risk is low - normal operation</span>
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
