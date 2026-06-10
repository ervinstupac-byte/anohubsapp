// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, Waves, Settings } from 'lucide-react';
import { FrancisZoneManager } from '../services/FrancisZoneManager';

interface RoughZoneParams {
  currentLoadMW: number; // MW
  currentHeadM: number; // m
  guideVaneOpening: number; // %
  pulsationAmplitudeKPa: number; // kPa
}

export const RoughZoneOperationLab: React.FC = () => {
  const [params, setParams] = useState<RoughZoneParams>({
    currentLoadMW: 70,
    currentHeadM: 95,
    guideVaneOpening: 60,
    pulsationAmplitudeKPa: 8
  });

  const [results, setResults] = useState<ReturnType<typeof FrancisZoneManager.checkRoughZone> | null>(null);

  const calculateRoughZone = useMemo(() => {
    return FrancisZoneManager.checkRoughZone(
      params.currentLoadMW,
      params.currentHeadM,
      params.guideVaneOpening,
      params.pulsationAmplitudeKPa
    );
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateRoughZone);
  };

  const handleReset = () => {
    setParams({
      currentLoadMW: 70,
      currentHeadM: 95,
      guideVaneOpening: 60,
      pulsationAmplitudeKPa: 8
    });
    setResults(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'SEVERE' || status === 'CRITICAL') return 'bg-red-950/20 border-red-500';
    if (status === 'ROUGH' || status === 'WARNING') return 'bg-amber-950/20 border-amber-500';
    return 'bg-emerald-950/20 border-emerald-500';
  };

  const getStatusIconColor = (status: string) => {
    if (status === 'SEVERE' || status === 'CRITICAL') return 'text-red-400';
    if (status === 'ROUGH' || status === 'WARNING') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
            Rough Zone Operation Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Rough zone mapping, efficiency loss & safe load recommendations
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Operation Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Load (MW)"
                type="number"
                value={params.currentLoadMW}
                onChange={(e) => setParams({ ...params, currentLoadMW: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="150"
              />
              <ModernInput
                label="Head (m)"
                type="number"
                value={params.currentHeadM}
                onChange={(e) => setParams({ ...params, currentHeadM: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="50"
                max="150"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Guide Vane Opening (%)"
                type="number"
                value={params.guideVaneOpening}
                onChange={(e) => setParams({ ...params, guideVaneOpening: parseFloat(e.target.value) || 0 })}
                icon={<Settings className="w-4 h-4" />}
                min="0"
                max="100"
              />
              <ModernInput
                label="Pulsation Amplitude (kPa)"
                type="number"
                value={params.pulsationAmplitudeKPa}
                onChange={(e) => setParams({ ...params, pulsationAmplitudeKPa: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="0"
                max="30"
                step="0.5"
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
          <GlassCard title="Rough Zone Analysis" className="border-t-4 border-t-slate-600">
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
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Efficiency Loss</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.efficiencyLoss.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Recommended Load</p>
                  <p className="text-2xl font-semibold text-slate-100">{results.recommendedLoadMW.toFixed(0)} MW</p>
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
