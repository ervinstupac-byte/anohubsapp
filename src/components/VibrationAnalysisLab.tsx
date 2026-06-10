// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle } from 'lucide-react';
import { VibrationBaseline } from '../services/VibrationBaseline';

interface VibrationParams {
  currentVibration: number; // mm/s
  bearingTemp: number; // °C
  hoursSinceService: number;
  loadPercent: number;
}

export const VibrationAnalysisLab: React.FC = () => {
  const [params, setParams] = useState<VibrationParams>({
    currentVibration: 2.5,
    bearingTemp: 65,
    hoursSinceService: 1200,
    loadPercent: 80
  });

  const [analysis, setAnalysis] = useState<ReturnType<typeof VibrationBaseline.checkDeviation> | null>(null);

  const calculateVibrationAnalysis = useMemo(() => {
    return VibrationBaseline.checkDeviation(
      params.currentVibration,
      params.bearingTemp,
      params.hoursSinceService,
      params.loadPercent
    );
  }, [params]);

  const handleAnalyze = () => {
    setAnalysis(calculateVibrationAnalysis);
  };

  const handleReset = () => {
    setParams({
      currentVibration: 2.5,
      bearingTemp: 65,
      hoursSinceService: 1200,
      loadPercent: 80
    });
    setAnalysis(null);
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
            Vibration Analysis Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Baseline-based vibration monitoring and deviation detection
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <GlassCard title="Input Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Vibration (mm/s)"
                type="number"
                value={params.currentVibration}
                onChange={(e) => setParams({ ...params, currentVibration: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="15"
                step="0.1"
              />
              <ModernInput
                label="Bearing Temp (°C)"
                type="number"
                value={params.bearingTemp}
                onChange={(e) => setParams({ ...params, bearingTemp: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="20"
                max="120"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Hours Since Service"
                type="number"
                value={params.hoursSinceService}
                onChange={(e) => setParams({ ...params, hoursSinceService: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="8000"
              />
              <ModernInput
                label="Load (%)"
                type="number"
                value={params.loadPercent}
                onChange={(e) => setParams({ ...params, loadPercent: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="100"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleAnalyze} variant="primary" className="flex-1">
                Analyze Vibration
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset Parameters
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {/* Analysis Results */}
        {analysis && (
          <GlassCard title="Analysis Results" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              {/* Overall Level */}
              <div className={`p-4 rounded-xl border ${getStatusColor(analysis.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vibration Status</p>
                    <p className="text-xl font-bold text-slate-100">{analysis.status}</p>
                  </div>
                  <Activity className={`w-10 h-10 ${getStatusIconColor(analysis.status)}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Deviation</p>
                  <p className="text-2xl font-semibold text-slate-100">{analysis.deviationPercent.toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Baseline</p>
                  <p className="text-2xl font-semibold text-slate-100">{analysis.baselineValue.toFixed(2)} mm/s</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Action</p>
                <div className="space-y-2 text-sm text-slate-300">
                  {analysis.action.split('.').filter(Boolean).map((sentence, idx) => (
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
