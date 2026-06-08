import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Wrench, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface BoltTensionParams {
  boltDiameter: number; // mm
  materialYieldStrength: number; // MPa
  hydraulicTensionerPressure: number; // bar
  elongationDialReading: number; // mm
}

interface BoltTensionResults {
  residualClampingForce: number; // kN
  shearStressUnderRejection: number; // MPa
  tensionStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL';
  recommendations: string[];
}

export const CouplingBoltTensioningLab: React.FC = () => {
  const [params, setParams] = useState<BoltTensionParams>({
    boltDiameter: 30,
    materialYieldStrength: 640,
    hydraulicTensionerPressure: 1000,
    elongationDialReading: 0.5
  });

  const [results, setResults] = useState<BoltTensionResults | null>(null);

  const calculateBoltTension = useMemo(() => {
    // Calculate bolt area
    const boltArea = Math.PI * Math.pow(params.boltDiameter / 2, 2); // mm²

    // Calculate applied force from hydraulic tensioner
    // Force = Pressure × Area (assuming tensioner piston area = bolt area for simplicity)
    const appliedForce = (params.hydraulicTensionerPressure * 100000) * (boltArea / 1000000); // Convert bar to Pa, mm² to m², result in N
    const appliedForceKN = appliedForce / 1000; // kN

    // Calculate residual clamping force after relaxation
    // Typical relaxation is 10-15% of applied force
    const relaxationFactor = 0.85;
    const residualClampingForce = appliedForceKN * relaxationFactor;

    // Calculate shear stress under load rejection
    // Shear stress = Force / Area
    // Load rejection can cause transient forces 2-3x normal
    const loadRejectionFactor = 2.5;
    const transientForce = appliedForceKN * loadRejectionFactor;
    const shearStress = (transientForce * 1000) / boltArea; // MPa

    // Tension status assessment
    // Acceptable: < 70% of yield, Monitor: 70-85%, Critical: > 85%
    const yieldUtilization = (shearStress / params.materialYieldStrength) * 100;
    let tensionStatus: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL' = 'ACCEPTABLE';
    if (yieldUtilization > 85) tensionStatus = 'CRITICAL';
    else if (yieldUtilization > 70) tensionStatus = 'MONITOR';

    const recommendations: string[] = [];
    if (tensionStatus === 'CRITICAL') {
      recommendations.push('🚨 Shear stress > 85% of yield: Critical - risk of bolt failure under load rejection');
      recommendations.push('⚠️ Reduce tensioner pressure or use higher grade bolts');
    } else if (tensionStatus === 'MONITOR') {
      recommendations.push('⚠️ Shear stress 70-85% of yield: Monitor - check bolt condition regularly');
      recommendations.push('📊 Consider periodic retorquing during maintenance');
    } else {
      recommendations.push('✅ Shear stress < 70% of yield: Within acceptable safety margin');
    }

    if (params.elongationDialReading < 0.2) {
      recommendations.push('⚠️ Elongation < 0.2mm: Possible insufficient preload - verify tension');
    }

    if (params.elongationDialReading > 1.0) {
      recommendations.push('⚠️ Elongation > 1.0mm: Excessive elongation - check for yielding');
    }

    return {
      residualClampingForce,
      shearStressUnderRejection: shearStress,
      tensionStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateBoltTension);
  };

  const handleReset = () => {
    setParams({
      boltDiameter: 30,
      materialYieldStrength: 640,
      hydraulicTensionerPressure: 1000,
      elongationDialReading: 0.5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Coupling Bolt <span className="text-cyan-400">Tensioning Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Bolt tension verification and shear stress prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Bolt Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Bolt Diameter (mm)"
              type="number"
              value={params.boltDiameter}
              onChange={(e) => setParams({ ...params, boltDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Wrench className="w-4 h-4" />}
              min="10"
              max="100"
            />
            <ModernInput
              label="Material Yield Strength (MPa)"
              type="number"
              value={params.materialYieldStrength}
              onChange={(e) => setParams({ ...params, materialYieldStrength: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="200"
              max="1200"
            />
            <ModernInput
              label="Hydraulic Tensioner Pressure (bar)"
              type="number"
              value={params.hydraulicTensionerPressure}
              onChange={(e) => setParams({ ...params, hydraulicTensionerPressure: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="100"
              max="2000"
            />
            <ModernInput
              label="Elongation Dial Reading (mm)"
              type="number"
              value={params.elongationDialReading}
              onChange={(e) => setParams({ ...params, elongationDialReading: parseFloat(e.target.value) || 0 })}
              icon={<Wrench className="w-4 h-4" />}
              min="0"
              max="5"
              step="0.01"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Tension
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Tension Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.tensionStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.tensionStatus === 'MONITOR' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tension Status</p>
                    <p className="text-2xl font-black text-white">{results.tensionStatus}</p>
                  </div>
                  <Wrench className={`w-12 h-12 ${results.tensionStatus === 'CRITICAL' ? 'text-red-400' : results.tensionStatus === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Residual Clamping Force</p>
                <p className="text-3xl font-black text-white">{results.residualClampingForce.toFixed(1)} kN</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Shear Stress Under Load Rejection</p>
                <p className="text-3xl font-black text-white">{results.shearStressUnderRejection.toFixed(1)} MPa</p>
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
