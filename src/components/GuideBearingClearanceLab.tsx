import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Thermometer } from 'lucide-react';

interface BearingClearanceParams {
  journalDiameter: number; // mm
  bearingPadChordLength: number; // mm
  clearancePoint1: number; // mm
  clearancePoint2: number; // mm
  clearancePoint3: number; // mm
  clearancePoint4: number; // mm
}

interface BearingClearanceResults {
  oilWedgeThickness: number; // mm
  maxBearingTemp: number; // °C
  clearanceStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL';
  recommendations: string[];
}

export const GuideBearingClearanceLab: React.FC = () => {
  const [params, setParams] = useState<BearingClearanceParams>({
    journalDiameter: 500,
    bearingPadChordLength: 100,
    clearancePoint1: 0.5,
    clearancePoint2: 0.5,
    clearancePoint3: 0.5,
    clearancePoint4: 0.5
  });

  const [results, setResults] = useState<BearingClearanceResults | null>(null);

  const calculateBearingClearance = useMemo(() => {
    const clearances = [params.clearancePoint1, params.clearancePoint2, params.clearancePoint3, params.clearancePoint4];
    const avgClearance = clearances.reduce((a, b) => a + b, 0) / clearances.length;
    const maxClearance = Math.max(...clearances);
    const minClearance = Math.min(...clearances);
    const clearanceVariation = maxClearance - minClearance;

    // Calculate oil wedge thickness
    // Oil wedge forms in converging clearance, thickness proportional to clearance and pad geometry
    const aspectRatio = params.bearingPadChordLength / params.journalDiameter;
    const oilWedgeThickness = avgClearance * (1 - aspectRatio * 0.3);

    // Predict maximum bearing operating temperature
    // Temperature increases with reduced clearance and higher clearance variation
    const baseTemp = 65; // °C (typical operating temperature)
    const clearanceFactor = (1.0 - avgClearance) * 20; // Reduced clearance increases temp
    const variationFactor = clearanceVariation * 15; // Variation increases temp
    const maxBearingTemp = baseTemp + clearanceFactor + variationFactor;

    // Clearance status assessment
    // Acceptable: variation < 0.2mm, Monitor: 0.2-0.4mm, Critical: > 0.4mm
    let clearanceStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL' = 'ACCEPTABLE';
    if (clearanceVariation > 0.4) clearanceStatus = 'CRITICAL';
    else if (clearanceVariation > 0.2) clearanceStatus = 'MONITOR';

    const recommendations: string[] = [];
    if (clearanceStatus === 'CRITICAL') {
      recommendations.push('🚨 Clearance variation > 0.4mm: Critical - inspect bearing pads and journal surface');
      recommendations.push('⚠️ High temperature risk - check lubrication flow');
    } else if (clearanceStatus === 'MONITOR') {
      recommendations.push('⚠️ Clearance variation 0.2-0.4mm: Monitor - trend temperature readings');
      recommendations.push('📊 Check pad wear patterns during next inspection');
    } else {
      recommendations.push('✅ Clearance variation < 0.2mm: Within acceptable tolerance');
    }

    if (oilWedgeThickness < 0.3) {
      recommendations.push('⚠️ Oil wedge thickness < 0.3mm: Risk of metal-to-metal contact');
    }

    if (maxBearingTemp > 85) {
      recommendations.push('🔥 Predicted temperature > 85°C: Critical - check cooling system');
    } else if (maxBearingTemp > 75) {
      recommendations.push('🌡️ Predicted temperature > 75°C: Monitor cooling performance');
    }

    if (minClearance < 0.2) {
      recommendations.push('⚠️ Minimum clearance < 0.2mm: Risk of bearing wipe');
    }

    return {
      oilWedgeThickness,
      maxBearingTemp,
      clearanceStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateBearingClearance);
  };

  const handleReset = () => {
    setParams({
      journalDiameter: 500,
      bearingPadChordLength: 100,
      clearancePoint1: 0.5,
      clearancePoint2: 0.5,
      clearancePoint3: 0.5,
      clearancePoint4: 0.5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Guide Bearing <span className="text-cyan-400">Clearance Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Bearing clearance analysis and oil wedge thickness calculation
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Bearing Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Journal Diameter (mm)"
              type="number"
              value={params.journalDiameter}
              onChange={(e) => setParams({ ...params, journalDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="100"
              max="2000"
            />
            <ModernInput
              label="Bearing Pad Chord Length (mm)"
              type="number"
              value={params.bearingPadChordLength}
              onChange={(e) => setParams({ ...params, bearingPadChordLength: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="50"
              max="500"
            />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Clearance Measurements (mm)</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((point) => (
                  <ModernInput
                    key={`clearance-${point}`}
                    label={`Point ${point}`}
                    type="number"
                    value={params[`clearancePoint${point}` as keyof BearingClearanceParams] as number}
                    onChange={(e) => setParams({ ...params, [`clearancePoint${point}` as keyof BearingClearanceParams]: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Clearance
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Clearance Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.clearanceStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.clearanceStatus === 'MONITOR' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Clearance Status</p>
                    <p className="text-2xl font-black text-white">{results.clearanceStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.clearanceStatus === 'CRITICAL' ? 'text-red-400' : results.clearanceStatus === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Oil Wedge Thickness</p>
                <p className="text-3xl font-black text-white">{results.oilWedgeThickness.toFixed(3)} mm</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Max Temperature</p>
                <p className="text-3xl font-black text-white">{results.maxBearingTemp.toFixed(1)} °C</p>
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
