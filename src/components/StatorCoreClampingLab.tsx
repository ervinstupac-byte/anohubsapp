import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface StatorCoreClampingParams {
  coreBoltTorque: number; // Nm
  coreLength: number; // meters
  numberOfClampingBolts: number;
}

interface StatorCoreClampingResults {
  clampingPressure: number; // MPa
  coreLaminationVibration: number; // mm/s
  clampingStatus: 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
  recommendations: string[];
}

export const StatorCoreClampingLab: React.FC = () => {
  const [params, setParams] = useState<StatorCoreClampingParams>({
    coreBoltTorque: 500,
    coreLength: 2,
    numberOfClampingBolts: 24
  });

  const [results, setResults] = useState<StatorCoreClampingResults | null>(null);

  const calculateStatorCoreClamping = useMemo(() => {
    // Calculate clamping pressure
    // P = (T × n) / (A × d)
    // Simplified: clamping pressure based on bolt torque and core area
    const boltDiameter = 0.03; // meters (assumed 30mm bolt)
    const boltArea = Math.PI * Math.pow(boltDiameter / 2, 2); // m²
    const totalClampingForce = (params.coreBoltTorque * params.numberOfClampingBolts) / boltDiameter; // N
    const coreArea = Math.PI * Math.pow(1.5, 2); // m² (assumed 3m diameter core)
    const clampingPressure = totalClampingForce / coreArea / 1000000; // MPa

    // Calculate core lamination vibration
    // Vibration depends on clamping pressure and core length
    const pressureFactor = clampingPressure / 1.5; // Normalized against 1.5 MPa
    const lengthFactor = params.coreLength / 2; // Normalized against 2m
    const baseVibration = 2; // mm/s base
    const coreLaminationVibration = baseVibration * (1 - pressureFactor) * (1 + lengthFactor * 0.5);

    // Clamping status assessment
    // Adequate: > 1.0 MPa, Insufficient: 0.5-1.0 MPa, Critical: < 0.5 MPa
    let clampingStatus: 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL' = 'ADEQUATE';
    if (clampingPressure < 0.5) clampingStatus = 'CRITICAL';
    else if (clampingPressure < 1.0) clampingStatus = 'INSUFFICIENT';

    const recommendations: string[] = [];
    if (clampingStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical clamping: Pressure < 0.5 MPa - immediate retorquing required');
      recommendations.push('⚠️ High core lamination vibration - risk of core damage');
    } else if (clampingStatus === 'INSUFFICIENT') {
      recommendations.push('⚠️ Insufficient clamping: Pressure 0.5-1.0 MPa - schedule retorquing');
      recommendations.push('📊 Monitor core vibration and check bolt tension');
    } else {
      recommendations.push('✅ Adequate clamping: Pressure > 1.0 MPa - normal operation');
    }

    if (coreLaminationVibration > 3) {
      recommendations.push('⚠️ High lamination vibration > 3 mm/s: Risk of interlamination insulation damage');
    }

    if (params.coreBoltTorque < 300) {
      recommendations.push('⚠️ Low bolt torque: May cause insufficient clamping pressure');
    }

    if (params.coreLength > 3) {
      recommendations.push('⚠️ Long core length: May require additional clamping points');
    }

    if (clampingPressure > 2.5) {
      recommendations.push('⚠️ Very high clamping pressure: Risk of core compression damage');
    }

    return {
      clampingPressure,
      coreLaminationVibration,
      clampingStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateStatorCoreClamping);
  };

  const handleReset = () => {
    setParams({
      coreBoltTorque: 500,
      coreLength: 2,
      numberOfClampingBolts: 24
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Stator Core <span className="text-cyan-400">Clamping Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Clamping pressure calculation and lamination vibration prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Clamping Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Core Bolt Torque (Nm)"
              type="number"
              value={params.coreBoltTorque}
              onChange={(e) => setParams({ ...params, coreBoltTorque: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="100"
              max="1000"
            />
            <ModernInput
              label="Core Length (m)"
              type="number"
              value={params.coreLength}
              onChange={(e) => setParams({ ...params, coreLength: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0.5"
              max="5"
              step="0.1"
            />
            <ModernInput
              label="Number of Clamping Bolts"
              type="number"
              value={params.numberOfClampingBolts}
              onChange={(e) => setParams({ ...params, numberOfClampingBolts: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="8"
              max="48"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Clamping
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Clamping Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.clampingStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.clampingStatus === 'INSUFFICIENT' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Clamping Status</p>
                    <p className="text-2xl font-black text-white">{results.clampingStatus}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.clampingStatus === 'CRITICAL' ? 'text-red-400' : results.clampingStatus === 'INSUFFICIENT' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Clamping Pressure</p>
                <p className="text-3xl font-black text-white">{results.clampingPressure.toFixed(2)} MPa</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Core Lamination Vibration</p>
                <p className="text-3xl font-black text-white">{results.coreLaminationVibration.toFixed(2)} mm/s</p>
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
