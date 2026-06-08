import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface MechanicalBrakeWearParams {
  brakePadThickness: number; // mm
  rotorDiameter: number; // meters
  numberOfBrakingApplications: number;
}

interface MechanicalBrakeWearResults {
  wearRate: number; // mm/1000 applications
  remainingBrakingCapacity: number; // %
  brakeStatus: 'GOOD' | 'WORN' | 'CRITICAL';
  recommendations: string[];
}

export const MechanicalBrakeWearLab: React.FC = () => {
  const [params, setParams] = useState<MechanicalBrakeWearParams>({
    brakePadThickness: 15,
    rotorDiameter: 2,
    numberOfBrakingApplications: 5000
  });

  const [results, setResults] = useState<MechanicalBrakeWearResults | null>(null);

  const calculateMechanicalBrakeWear = useMemo(() => {
    // Calculate wear rate
    // Wear depends on rotor diameter and number of applications
    const initialThickness = 20; // mm (assumed new pad thickness)
    const thicknessLoss = initialThickness - params.brakePadThickness;
    const wearRate = (thicknessLoss / params.numberOfBrakingApplications) * 1000; // mm/1000 applications

    // Calculate remaining braking capacity
    // Capacity proportional to remaining pad thickness
    const remainingThickness = params.brakePadThickness;
    const minimumThickness = 5; // mm (minimum safe thickness)
    const remainingBrakingCapacity = ((remainingThickness - minimumThickness) / (initialThickness - minimumThickness)) * 100;

    // Brake status assessment
    // Good: > 60%, Worn: 30-60%, Critical: < 30%
    let brakeStatus: 'GOOD' | 'WORN' | 'CRITICAL' = 'GOOD';
    if (remainingBrakingCapacity < 30) brakeStatus = 'CRITICAL';
    else if (remainingBrakingCapacity < 60) brakeStatus = 'WORN';

    const recommendations: string[] = [];
    if (brakeStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical brake wear: Capacity < 30% - immediate pad replacement required');
      recommendations.push('⚠️ Risk of brake failure during emergency stop');
    } else if (brakeStatus === 'WORN') {
      recommendations.push('⚠️ Worn brake pads: Capacity 30-60% - schedule replacement at next maintenance');
      recommendations.push('📊 Monitor pad thickness and braking performance');
    } else {
      recommendations.push('✅ Good brake pads: Capacity > 60% - normal operation');
    }

    if (wearRate > 0.5) {
      recommendations.push('⚠️ High wear rate > 0.5mm/1000 applications: Check braking conditions');
    }

    if (params.brakePadThickness < minimumThickness) {
      recommendations.push('🚨 Pad below minimum thickness: Do not operate - replace immediately');
    }

    if (params.rotorDiameter > 3) {
      recommendations.push('⚠️ Large rotor diameter: Higher braking forces - monitor wear closely');
    }

    if (params.numberOfBrakingApplications > 10000) {
      recommendations.push('⚠️ High application count: Pads may be approaching end of life');
    }

    return {
      wearRate,
      remainingBrakingCapacity,
      brakeStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateMechanicalBrakeWear);
  };

  const handleReset = () => {
    setParams({
      brakePadThickness: 15,
      rotorDiameter: 2,
      numberOfBrakingApplications: 5000
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Mechanical Brake <span className="text-cyan-400">Wear Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Wear rate calculation and braking capacity prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Brake Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Brake Pad Thickness (mm)"
              type="number"
              value={params.brakePadThickness}
              onChange={(e) => setParams({ ...params, brakePadThickness: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="30"
              step="0.5"
            />
            <ModernInput
              label="Rotor Diameter (m)"
              type="number"
              value={params.rotorDiameter}
              onChange={(e) => setParams({ ...params, rotorDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0.5"
              max="5"
              step="0.1"
            />
            <ModernInput
              label="Number of Braking Applications"
              type="number"
              value={params.numberOfBrakingApplications}
              onChange={(e) => setParams({ ...params, numberOfBrakingApplications: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="0"
              max="50000"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Wear
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Brake Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.brakeStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.brakeStatus === 'WORN' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Brake Status</p>
                    <p className="text-2xl font-black text-white">{results.brakeStatus}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.brakeStatus === 'CRITICAL' ? 'text-red-400' : results.brakeStatus === 'WORN' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Wear Rate</p>
                <p className="text-3xl font-black text-white">{results.wearRate.toFixed(3)} mm/1000 apps</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Remaining Braking Capacity</p>
                <p className="text-3xl font-black text-white">{results.remainingBrakingCapacity.toFixed(1)}%</p>
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
