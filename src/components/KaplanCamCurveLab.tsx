import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';

interface CamCurveParams {
  grossHead: number; // meters
  guideVaneAngle1: number; // degrees
  bladeAngle1: number; // degrees
  guideVaneAngle2: number; // degrees
  bladeAngle2: number; // degrees
  guideVaneAngle3: number; // degrees
  bladeAngle3: number; // degrees
}

interface CamCurveResults {
  offCamEfficiencyPenalty: number; // %
  cavitationInceptionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  camCurveStatus: 'OPTIMAL' | 'DEVIATED' | 'MISMATCHED';
  recommendations: string[];
}

export const KaplanCamCurveLab: React.FC = () => {
  const [params, setParams] = useState<CamCurveParams>({
    grossHead: 20,
    guideVaneAngle1: 30,
    bladeAngle1: 15,
    guideVaneAngle2: 45,
    bladeAngle2: 25,
    guideVaneAngle3: 60,
    bladeAngle3: 35
  });

  const [results, setResults] = useState<CamCurveResults | null>(null);

  const calculateCamCurve = useMemo(() => {
    // Calculate off-cam efficiency penalty
    // Ideal cam curve: blade angle should be proportional to guide vane angle
    // Typical relationship: blade angle ≈ 0.5 × guide vane angle
    const dataPoints = [
      { guide: params.guideVaneAngle1, blade: params.bladeAngle1 },
      { guide: params.guideVaneAngle2, blade: params.bladeAngle2 },
      { guide: params.guideVaneAngle3, blade: params.bladeAngle3 }
    ];

    let totalDeviation = 0;
    dataPoints.forEach(point => {
      const idealBladeAngle = point.guide * 0.5;
      const deviation = Math.abs(point.blade - idealBladeAngle);
      totalDeviation += deviation;
    });

    const avgDeviation = totalDeviation / dataPoints.length;
    const offCamEfficiencyPenalty = avgDeviation * 0.2; // 0.2% efficiency loss per degree deviation

    // Cavitation inception risk assessment
    // Risk increases with profile mismatch and low head
    const headFactor = params.grossHead / 30; // Normalized against 30m head
    const mismatchFactor = avgDeviation / 10; // Normalized against 10° deviation
    const cavitationRiskScore = (1 - headFactor) * 0.6 + mismatchFactor * 0.4;

    let cavitationInceptionRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (cavitationRiskScore > 0.6) cavitationInceptionRisk = 'HIGH';
    else if (cavitationRiskScore > 0.3) cavitationInceptionRisk = 'MEDIUM';

    // Cam curve status assessment
    let camCurveStatus: 'OPTIMAL' | 'DEVIATED' | 'MISMATCHED' = 'OPTIMAL';
    if (avgDeviation > 10) camCurveStatus = 'MISMATCHED';
    else if (avgDeviation > 5) camCurveStatus = 'DEVIATED';

    const recommendations: string[] = [];
    if (camCurveStatus === 'MISMATCHED') {
      recommendations.push('🚨 Cam curve mismatched: Deviation > 10° - cam adjustment required');
      recommendations.push('⚠️ High efficiency penalty - recalibrate cam mechanism');
    } else if (camCurveStatus === 'DEVIATED') {
      recommendations.push('⚠️ Cam curve deviated: Deviation 5-10° - schedule cam adjustment');
      recommendations.push('📊 Monitor efficiency at different operating points');
    } else {
      recommendations.push('✅ Cam curve optimal: Deviation < 5° - normal operation');
    }

    if (cavitationInceptionRisk === 'HIGH') {
      recommendations.push('⚠️ High cavitation inception risk: Check blade profile and operating head');
    }

    if (params.grossHead < 15) {
      recommendations.push('💧 Low head operation: Increased cavitation risk at partial load');
    }

    if (offCamEfficiencyPenalty > 2) {
      recommendations.push('📉 Efficiency penalty > 2%: Significant economic impact - prioritize cam adjustment');
    }

    return {
      offCamEfficiencyPenalty,
      cavitationInceptionRisk,
      camCurveStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateCamCurve);
  };

  const handleReset = () => {
    setParams({
      grossHead: 20,
      guideVaneAngle1: 30,
      bladeAngle1: 15,
      guideVaneAngle2: 45,
      bladeAngle2: 25,
      guideVaneAngle3: 60,
      bladeAngle3: 35
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Kaplan <span className="text-cyan-400">Cam Curve Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Cam curve optimization and cavitation risk assessment
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Cam Curve Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Gross Head (m)"
              type="number"
              value={params.grossHead}
              onChange={(e) => setParams({ ...params, grossHead: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="5"
              max="50"
            />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Operating Points (Guide Vane / Blade Angle)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <ModernInput
                    label="Guide Vane 1 (°)"
                    type="number"
                    value={params.guideVaneAngle1}
                    onChange={(e) => setParams({ ...params, guideVaneAngle1: parseFloat(e.target.value) || 0 })}
                    min="10"
                    max="80"
                  />
                  <ModernInput
                    label="Blade Angle 1 (°)"
                    type="number"
                    value={params.bladeAngle1}
                    onChange={(e) => setParams({ ...params, bladeAngle1: parseFloat(e.target.value) || 0 })}
                    min="5"
                    max="45"
                  />
                </div>
                <div className="space-y-3">
                  <ModernInput
                    label="Guide Vane 2 (°)"
                    type="number"
                    value={params.guideVaneAngle2}
                    onChange={(e) => setParams({ ...params, guideVaneAngle2: parseFloat(e.target.value) || 0 })}
                    min="10"
                    max="80"
                  />
                  <ModernInput
                    label="Blade Angle 2 (°)"
                    type="number"
                    value={params.bladeAngle2}
                    onChange={(e) => setParams({ ...params, bladeAngle2: parseFloat(e.target.value) || 0 })}
                    min="5"
                    max="45"
                  />
                </div>
                <div className="space-y-3">
                  <ModernInput
                    label="Guide Vane 3 (°)"
                    type="number"
                    value={params.guideVaneAngle3}
                    onChange={(e) => setParams({ ...params, guideVaneAngle3: parseFloat(e.target.value) || 0 })}
                    min="10"
                    max="80"
                  />
                  <ModernInput
                    label="Blade Angle 3 (°)"
                    type="number"
                    value={params.bladeAngle3}
                    onChange={(e) => setParams({ ...params, bladeAngle3: parseFloat(e.target.value) || 0 })}
                    min="5"
                    max="45"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Cam Curve
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Cam Curve Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.camCurveStatus === 'OPTIMAL' ? 'bg-emerald-950/20 border-emerald-500' : results.camCurveStatus === 'DEVIATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-red-950/20 border-red-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cam Curve Status</p>
                    <p className="text-2xl font-black text-white">{results.camCurveStatus}</p>
                  </div>
                  <Gauge className={`w-12 h-12 ${results.camCurveStatus === 'OPTIMAL' ? 'text-emerald-400' : results.camCurveStatus === 'DEVIATED' ? 'text-amber-400' : 'text-red-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Off-Cam Efficiency Penalty</p>
                <p className="text-3xl font-black text-white">{results.offCamEfficiencyPenalty.toFixed(2)}%</p>
              </div>

              <div className={`p-4 rounded-xl border ${results.cavitationInceptionRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.cavitationInceptionRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cavitation Inception Risk</p>
                    <p className="text-2xl font-black text-white">{results.cavitationInceptionRisk}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.cavitationInceptionRisk === 'HIGH' ? 'text-red-400' : results.cavitationInceptionRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
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
