import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Waves } from 'lucide-react';

interface NeedleValveParams {
  needleOpeningPosition: number; // %
  servoPressure: number; // bar
  flowRateOpening: number; // m³/s
  flowRateClosing: number; // m³/s
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
    flowRateClosing: 23
  });

  const [results, setResults] = useState<NeedleValveResults | null>(null);

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
      recommendations.push('🚨 High hysteresis: Loop area > 8% - immediate valve inspection required');
      recommendations.push('⚠️ High jet stability degradation - check servo and linkage');
    } else if (hysteresisStatus === 'MODERATE') {
      recommendations.push('⚠️ Moderate hysteresis: Loop area 3-8% - monitor valve performance');
      recommendations.push('📊 Check for wear in servo mechanism or needle guide');
    } else {
      recommendations.push('✅ Normal hysteresis: Loop area < 3% - normal operation');
    }

    if (jetStabilityDegradation > 20) {
      recommendations.push('⚠️ High jet stability degradation > 20%: Risk of efficiency loss');
    }

    if (params.servoPressure < 50) {
      recommendations.push('⚠️ Low servo pressure: May cause insufficient needle movement force');
    }

    if (flowDifference > 5) {
      recommendations.push('⚠️ Large flow difference > 5 m³/s: Check for mechanical binding');
    }

    if (params.needleOpeningPosition > 80 || params.needleOpeningPosition < 20) {
      recommendations.push('⚠️ Extreme needle position: Hysteresis may be higher at extremes');
    }

    return {
      hysteresisLoopArea,
      jetStabilityDegradation,
      hysteresisStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateNeedleValve);
  };

  const handleReset = () => {
    setParams({
      needleOpeningPosition: 50,
      servoPressure: 100,
      flowRateOpening: 25,
      flowRateClosing: 23
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Pelton Needle <span className="text-cyan-400">Valve Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Hysteresis loop calculation and jet stability prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Needle Valve Parameters" className="border-t-4 border-t-cyan-500">
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

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Hysteresis
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Hysteresis Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.hysteresisStatus === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.hysteresisStatus === 'MODERATE' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hysteresis Status</p>
                    <p className="text-2xl font-black text-white">{results.hysteresisStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.hysteresisStatus === 'HIGH' ? 'text-red-400' : results.hysteresisStatus === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hysteresis Loop Area</p>
                <p className="text-3xl font-black text-white">{results.hysteresisLoopArea.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Jet Stability Degradation</p>
                <p className="text-3xl font-black text-white">{results.jetStabilityDegradation.toFixed(1)}%</p>
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
