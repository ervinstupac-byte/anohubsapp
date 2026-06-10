import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, Waves, Settings } from 'lucide-react';
import { optimizeNozzles, PeltonInput } from '../services/PeltonPhysicsOptimizer';

interface NeedleValveParams {
  needleOpeningPosition: number; // %
  servoPressure: number; // bar
  flowRateOpening: number; // m³/s
  flowRateClosing: number; // m³/s
  jetPressureBar: number; // bar
  activeNozzles: number;
  shellVibrationMm?: number;
  bucketHours?: number;
}

interface NeedleValveResults {
  hysteresisLoopArea: number; // %
  jetStabilityDegradation: number; // %
  hysteresisStatus: 'NORMAL' | 'MODERATE' | 'HIGH';
  recommendations: string[];
}

export const PeltonNeedleValveLab: React.FC = () => {
  const [params, setParams] = useState<NeedleValveParams>({
    needleOpeningPosition: 50,
    servoPressure: 100,
    flowRateOpening: 25,
    flowRateClosing: 23,
    jetPressureBar: 40,
    activeNozzles: 4,
    shellVibrationMm: 2.5,
    bucketHours: 5000
  });

  const [results, setResults] = useState<NeedleValveResults | null>(null);
  const [nozzleResults, setNozzleResults] = useState<ReturnType<typeof optimizeNozzles> | null>(null);

  const calculateNeedleValve = useMemo(() => {
    // Calculate hysteresis loop area
    // Hysteresis is the difference between opening and closing flow rates
    const flowDifference = params.flowRateOpening - params.flowRateClosing;
    const avgFlowRate = (params.flowRateOpening + params.flowRateClosing) / 2;
    const hysteresisLoopArea = (flowDifference / avgFlowRate) * 100;

    // Calculate jet stability degradation
    // Degradation depends on hysteresis and needle position
    const positionFactor = params.needleOpeningPosition / 100;
    const hysteresisFactor = hysteresisLoopArea / 10; // Normalized against 10%
    const jetStabilityDegradation = (hysteresisFactor * 0.7 + positionFactor * 0.3) * 100;

    // Hysteresis status assessment
    // Normal: < 3%, Moderate: 3-8%, High: > 8%
    let hysteresisStatus: 'NORMAL' | 'MODERATE' | 'HIGH' = 'NORMAL';
    if (hysteresisLoopArea > 8) hysteresisStatus = 'HIGH';
    else if (hysteresisLoopArea > 3) hysteresisStatus = 'MODERATE';

    const recommendations: string[] = [];
    if (hysteresisStatus === 'HIGH') {
      recommendations.push('High hysteresis: Loop area > 8% - immediate valve inspection required');
      recommendations.push('High jet stability degradation - check servo and linkage');
    } else if (hysteresisStatus === 'MODERATE') {
      recommendations.push('Moderate hysteresis: Loop area 3-8% - monitor valve performance');
      recommendations.push('Check for wear in servo mechanism or needle guide');
    } else {
      recommendations.push('Normal hysteresis: Loop area < 3% - normal operation');
    }

    if (jetStabilityDegradation > 20) {
      recommendations.push('High jet stability degradation > 20%: Risk of efficiency loss');
    }

    if (params.servoPressure < 50) {
      recommendations.push('Low servo pressure: May cause insufficient needle movement force');
    }

    if (flowDifference > 5) {
      recommendations.push('Large flow difference > 5 m³/s: Check for mechanical binding');
    }

    if (params.needleOpeningPosition > 80 || params.needleOpeningPosition < 20) {
      recommendations.push('Extreme needle position: Hysteresis may be higher at extremes');
    }

    return {
      hysteresisLoopArea,
      jetStabilityDegradation,
      hysteresisStatus,
      recommendations
    };
  }, [params]);

  const calculateNozzleOptimization = useMemo(() => {
    const input: PeltonInput = {
      jetPressureBar: params.jetPressureBar,
      needlePositionPct: params.needleOpeningPosition,
      activeNozzles: params.activeNozzles,
      shellVibrationMm: params.shellVibrationMm,
      bucketHours: params.bucketHours
    };
    return optimizeNozzles(input, { maxNozzles: 6, minNozzles: 1 });
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateNeedleValve);
    setNozzleResults(calculateNozzleOptimization);
  };

  const handleReset = () => {
    setParams({
      needleOpeningPosition: 50,
      servoPressure: 100,
      flowRateOpening: 25,
      flowRateClosing: 23,
      jetPressureBar: 40,
      activeNozzles: 4,
      shellVibrationMm: 2.5,
      bucketHours: 5000
    });
    setResults(null);
    setNozzleResults(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'HIGH' || status === 'CRITICAL') return 'bg-red-950/20 border-red-500';
    if (status === 'MODERATE' || status === 'WARNING') return 'bg-amber-950/20 border-amber-500';
    return 'bg-emerald-950/20 border-emerald-500';
  };

  const getStatusIconColor = (status: string) => {
    if (status === 'HIGH' || status === 'CRITICAL') return 'text-red-400';
    if (status === 'MODERATE' || status === 'WARNING') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight uppercase">
            Pelton Needle Valve Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Hysteresis loop calculation and nozzle optimization
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard title="Parameters" className="border-t-4 border-t-slate-500">
          <div className="space-y-6">
            <ModernInput
              label="Needle Opening Position (%)"
              type="number"
              value={params.needleOpeningPosition}
              onChange={(e) => setParams({ ...params, needleOpeningPosition: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="100"
            />
            <ModernInput
              label="Servo Pressure (bar)"
              type="number"
              value={params.servoPressure}
              onChange={(e) => setParams({ ...params, servoPressure: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="20"
              max="200"
            />
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Flow Rate Opening (m³/s)"
                type="number"
                value={params.flowRateOpening}
                onChange={(e) => setParams({ ...params, flowRateOpening: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="0"
                max="100"
              />
              <ModernInput
                label="Flow Rate Closing (m³/s)"
                type="number"
                value={params.flowRateClosing}
                onChange={(e) => setParams({ ...params, flowRateClosing: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="0"
                max="100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Jet Pressure (bar)"
                type="number"
                value={params.jetPressureBar}
                onChange={(e) => setParams({ ...params, jetPressureBar: parseFloat(e.target.value) || 0 })}
                icon={<Waves className="w-4 h-4" />}
                min="0"
                max="100"
              />
              <ModernInput
                label="Active Nozzles"
                type="number"
                value={params.activeNozzles}
                onChange={(e) => setParams({ ...params, activeNozzles: Math.max(1, parseFloat(e.target.value) || 0) })}
                icon={<Settings className="w-4 h-4" />}
                min="1"
                max="6"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Shell Vibration (mm)"
                type="number"
                value={params.shellVibrationMm}
                onChange={(e) => setParams({ ...params, shellVibrationMm: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="10"
                step="0.1"
              />
              <ModernInput
                label="Bucket Hours"
                type="number"
                value={params.bucketHours}
                onChange={(e) => setParams({ ...params, bucketHours: parseFloat(e.target.value) || 0 })}
                icon={<Activity className="w-4 h-4" />}
                min="0"
                max="20000"
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
          <GlassCard title="Hysteresis Analysis" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${getStatusColor(results.hysteresisStatus)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hysteresis Status</p>
                    <p className="text-xl font-semibold text-slate-100">{results.hysteresisStatus}</p>
                  </div>
                  <Activity className={`w-10 h-10 ${getStatusIconColor(results.hysteresisStatus)}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hysteresis Loop Area</p>
                <p className="text-2xl font-semibold text-slate-100">{results.hysteresisLoopArea.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Jet Stability Degradation</p>
                <p className="text-2xl font-semibold text-slate-100">{results.jetStabilityDegradation.toFixed(1)}%</p>
              </div>

              {results.recommendations.length > 0 && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Recommendations</p>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-slate-400">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {nozzleResults && (
          <GlassCard title="Nozzle Optimization" className="border-t-4 border-t-slate-600">
            <div className="space-y-6">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Optimal Nozzles</p>
                <p className="text-2xl font-semibold text-slate-100">{nozzleResults.activeNozzles}</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Expected Efficiency</p>
                <p className="text-2xl font-semibold text-slate-100">{nozzleResults.expectedEfficiencyPct.toFixed(1)}%</p>
              </div>

              {nozzleResults.sequenceOrder && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Activation Order</p>
                  <div className="text-sm text-slate-300">
                    {nozzleResults.sequenceOrder.join(' → ')}
                  </div>
                </div>
              )}

              {nozzleResults.notes && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Details</p>
                  <p className="text-sm text-slate-300">{nozzleResults.notes}</p>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
