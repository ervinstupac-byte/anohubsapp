import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface VibrationParams {
  overallAmplitude: number; // mm/s
  oneXAmplitude: number; // mm/s
  twoXAmplitude: number; // mm/s
  temperature: number; // Celsius
}

interface VibrationAnalysis {
  overallLevel: number; // mm/s
  isoZone: string; // ISO 10816-1 Zone
  dominantFault: string | null;
  bearingCondition: 'HEALTHY' | 'DEGRADING' | 'CRITICAL';
  recommendations: string[];
}

export const VibrationAnalysisLab: React.FC = () => {
  const [params, setParams] = useState<VibrationParams>({
    overallAmplitude: 2.5,
    oneXAmplitude: 2.0,
    twoXAmplitude: 0.5,
    temperature: 65
  });

  const [analysis, setAnalysis] = useState<VibrationAnalysis | null>(null);

  const calculateVibrationAnalysis = useMemo(() => {
    const overallLevel = params.overallAmplitude;

    // ISO 10816-1 Class IV Severity Zones
    let isoZone: string;
    if (overallLevel < 2.8) {
      isoZone = 'Zone A: Newly Commissioned (Healthy)';
    } else if (overallLevel < 4.5) {
      isoZone = 'Zone B: Unrestricted Long-Term Operation';
    } else if (overallLevel < 7.1) {
      isoZone = 'Zone C: Restricted Operation (Remedial Action Required)';
    } else {
      isoZone = 'Zone D: Danger (Trip/Damage Risk)';
    }

    // Dominant Fault Detection
    let dominantFault: string | null = null;
    if (params.oneXAmplitude > 0.8 * overallLevel) {
      dominantFault = 'Dominant Fault: Mass Imbalance';
    }
    if (params.twoXAmplitude > 0.5 * params.oneXAmplitude) {
      dominantFault = 'Dominant Fault: Angular/Parallel Misalignment';
    }

    // Bearing Condition
    const bearingCondition: 'HEALTHY' | 'DEGRADING' | 'CRITICAL' = 
      overallLevel > 4.5 || params.temperature > 85 ? 'CRITICAL' :
      overallLevel > 2.8 || params.temperature > 75 ? 'DEGRADING' : 'HEALTHY';

    // Recommendations
    const recommendations: string[] = [];
    
    if (isoZone.includes('Zone D')) recommendations.push('🚨 Zone D: ISO 10816-1 Danger - Immediate shutdown required');
    if (isoZone.includes('Zone C')) recommendations.push('⚠️ Zone C: ISO 10816-1 Restricted Operation - Plan remedial action');
    if (dominantFault?.includes('Imbalance')) recommendations.push('⚖️ Mass imbalance detected: Perform precision balancing');
    if (dominantFault?.includes('Misalignment')) recommendations.push('📐 Misalignment detected: Check and realign shaft coupling');
    if (bearingCondition === 'CRITICAL') recommendations.push('🔧 Bearing critical: Vibration > 4.5 mm/s or temp > 85°C - Schedule replacement');
    if (bearingCondition === 'DEGRADING') recommendations.push('📉 Bearing degrading: Vibration > 2.8 mm/s or temp > 75°C - Monitor closely');
    if (params.temperature > 75) recommendations.push('🌡️ Temperature > 75°C: Check lubrication and cooling system');

    return {
      overallLevel,
      isoZone,
      dominantFault,
      bearingCondition,
      recommendations
    };
  }, [params]);

  const handleAnalyze = () => {
    setAnalysis(calculateVibrationAnalysis);
  };

  const handleReset = () => {
    setParams({
      overallAmplitude: 2.5,
      oneXAmplitude: 2.0,
      twoXAmplitude: 0.5,
      temperature: 65
    });
    setAnalysis(null);
  };

  const getZoneColor = (isoZone: string) => {
    if (isoZone.includes('Zone A')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (isoZone.includes('Zone B')) return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
    if (isoZone.includes('Zone C')) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-red-400 border-red-500/30 bg-red-950/20';
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Vibration <span className="text-purple-400">Analysis Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            ISO 10816-1 Compliant Vibration Analysis
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <GlassCard title="Input Parameters" className="border-t-4 border-t-purple-500">
          <div className="space-y-6">
            <ModernInput
              label="Overall Vibration Amplitude (mm/s)"
              type="number"
              value={params.overallAmplitude}
              onChange={(e) => setParams({ ...params, overallAmplitude: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="15"
              step="0.1"
            />
            <ModernInput
              label="1x RPM Amplitude (mm/s)"
              type="number"
              value={params.oneXAmplitude}
              onChange={(e) => setParams({ ...params, oneXAmplitude: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="15"
              step="0.1"
            />
            <ModernInput
              label="2x RPM Amplitude (mm/s)"
              type="number"
              value={params.twoXAmplitude}
              onChange={(e) => setParams({ ...params, twoXAmplitude: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="15"
              step="0.1"
            />
            <ModernInput
              label="Bearing Temperature (°C)"
              type="number"
              value={params.temperature}
              onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="20"
              max="120"
            />

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
          <GlassCard title="Analysis Results" className="border-t-4 border-t-cyan-500">
            <div className="space-y-6">
              {/* Overall Level */}
              <div className={`p-4 rounded-xl border ${getZoneColor(analysis.isoZone)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Overall Vibration Level</p>
                    <p className="text-4xl font-black text-white">{analysis.overallLevel.toFixed(2)} mm/s</p>
                  </div>
                  <Activity className="w-12 h-12" />
                </div>
                <p className="text-sm font-bold mt-2 uppercase tracking-wider">
                  {analysis.isoZone}
                </p>
              </div>

              {/* Dominant Fault */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Dominant Fault</p>
                {analysis.dominantFault ? (
                  <p className="text-lg font-black text-yellow-400">{analysis.dominantFault}</p>
                ) : (
                  <p className="text-lg font-black text-emerald-400">No Dominant Fault Detected</p>
                )}
              </div>

              {/* Bearing Condition */}
              <div className={`p-4 rounded-xl border ${analysis.bearingCondition === 'HEALTHY' ? 'bg-emerald-950/20 border-emerald-500' : analysis.bearingCondition === 'DEGRADING' ? 'bg-amber-950/20 border-amber-500' : 'bg-red-950/20 border-red-500'}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bearing Condition</p>
                <p className={`text-lg font-black ${analysis.bearingCondition === 'HEALTHY' ? 'text-emerald-400' : analysis.bearingCondition === 'DEGRADING' ? 'text-amber-400' : 'text-red-400'}`}>
                  {analysis.bearingCondition}
                </p>
              </div>

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">AI Recommendations</p>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-purple-400">•</span>
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
