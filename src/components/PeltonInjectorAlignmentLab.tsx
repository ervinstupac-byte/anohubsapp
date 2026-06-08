import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Target, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface InjectorParams {
  nozzleOffset: number; // mm
  needleStrokePosition: number; // mm
  jetDeflectorClearance: number; // mm
}

interface InjectorResults {
  jetDeviationAngle: number; // degrees
  erosionRate: number; // mm/year
  alignmentStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL';
  recommendations: string[];
}

export const PeltonInjectorAlignmentLab: React.FC = () => {
  const [params, setParams] = useState<InjectorParams>({
    nozzleOffset: 0,
    needleStrokePosition: 50,
    jetDeflectorClearance: 5
  });

  const [results, setResults] = useState<InjectorResults | null>(null);

  const calculateAlignment = useMemo(() => {
    // Calculate jet deviation angle based on nozzle offset
    // tan(θ) = offset / distance (assuming standard jet distance of 500mm)
    const jetDistance = 500; // mm (typical nozzle-to-bucket distance)
    const jetDeviationAngle = Math.atan(params.nozzleOffset / jetDistance) * (180 / Math.PI);
    
    // Predict runner bucket erosion rate based on misalignment
    // Erosion rate increases exponentially with deviation angle
    const baseErosionRate = 0.5; // mm/year for perfect alignment
    const erosionFactor = Math.pow(1 + (Math.abs(jetDeviationAngle) / 5), 2);
    const erosionRate = baseErosionRate * erosionFactor;
    
    // Alignment status assessment
    // Acceptable: <0.5°, Monitor: 0.5-1.0°, Critical: >1.0°
    let alignmentStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL' = 'ACCEPTABLE';
    if (Math.abs(jetDeviationAngle) > 1.0) alignmentStatus = 'CRITICAL';
    else if (Math.abs(jetDeviationAngle) > 0.5) alignmentStatus = 'MONITOR';
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (alignmentStatus === 'CRITICAL') {
      recommendations.push('🚨 Jet deviation > 1.0°: Critical - realign nozzle immediately');
      recommendations.push('⚠️ High erosion rate predicted - inspect bucket wear');
    } else if (alignmentStatus === 'MONITOR') {
      recommendations.push('⚠️ Jet deviation 0.5-1.0°: Monitor - schedule alignment check');
      recommendations.push('📊 Track erosion rate during next maintenance cycle');
    } else {
      recommendations.push('✅ Jet deviation < 0.5°: Within acceptable tolerance');
    }
    
    if (params.jetDeflectorClearance < 3) {
      recommendations.push('⚠️ Deflector clearance < 3mm: Risk of mechanical interference');
    }
    
    if (params.needleStrokePosition < 10 || params.needleStrokePosition > 90) {
      recommendations.push('⚠️ Needle stroke outside optimal range: Check servo calibration');
    }
    
    return {
      jetDeviationAngle,
      erosionRate,
      alignmentStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateAlignment);
  };

  const handleReset = () => {
    setParams({
      nozzleOffset: 0,
      needleStrokePosition: 50,
      jetDeflectorClearance: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Pelton <span className="text-cyan-400">Injector Alignment</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Injector alignment verification and erosion prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Injector Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Nozzle Offset (mm)"
              type="number"
              value={params.nozzleOffset}
              onChange={(e) => setParams({ ...params, nozzleOffset: parseFloat(e.target.value) || 0 })}
              icon={<Target className="w-4 h-4" />}
              step="0.1"
              min="-10"
              max="10"
            />
            <ModernInput
              label="Needle Stroke Position (mm)"
              type="number"
              value={params.needleStrokePosition}
              onChange={(e) => setParams({ ...params, needleStrokePosition: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="100"
            />
            <ModernInput
              label="Jet Deflector Clearance (mm)"
              type="number"
              value={params.jetDeflectorClearance}
              onChange={(e) => setParams({ ...params, jetDeflectorClearance: parseFloat(e.target.value) || 0 })}
              icon={<Target className="w-4 h-4" />}
              min="1"
              max="20"
              step="0.5"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Alignment
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Alignment Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.alignmentStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.alignmentStatus === 'MONITOR' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Jet Deviation Angle</p>
                    <p className="text-4xl font-black text-white">{Math.abs(results.jetDeviationAngle).toFixed(2)}°</p>
                  </div>
                  <Target className={`w-12 h-12 ${results.alignmentStatus === 'CRITICAL' ? 'text-red-400' : results.alignmentStatus === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
                <p className={`text-sm font-bold mt-2 uppercase tracking-wider ${results.alignmentStatus === 'CRITICAL' ? 'text-red-400' : results.alignmentStatus === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {results.alignmentStatus}
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Erosion Rate</p>
                <p className="text-3xl font-black text-white">{results.erosionRate.toFixed(2)} mm/year</p>
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
