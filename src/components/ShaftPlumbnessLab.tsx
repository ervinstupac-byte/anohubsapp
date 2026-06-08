import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Ruler, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface PlumbnessParams {
  quadrant1: number; // mm
  quadrant2: number; // mm
  quadrant3: number; // mm
  quadrant4: number; // mm
  wireWeight: number; // kg
  elevationDistance: number; // meters
}

interface PlumbnessResults {
  shaftTilt: number; // mm/m
  tiltDirection: string;
  dogLegSeverity: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL';
  maxOffset: number; // mm
  recommendations: string[];
}

export const ShaftPlumbnessLab: React.FC = () => {
  const [params, setParams] = useState<PlumbnessParams>({
    quadrant1: 0,
    quadrant2: 0,
    quadrant3: 0,
    quadrant4: 0,
    wireWeight: 10,
    elevationDistance: 5
  });

  const [results, setResults] = useState<PlumbnessResults | null>(null);

  const calculatePlumbness = useMemo(() => {
    // Calculate shaft offset from wire center
    // Average of opposite quadrants gives center position
    const offsetX = (params.quadrant1 - params.quadrant3) / 2;
    const offsetY = (params.quadrant2 - params.quadrant4) / 2;
    
    // Total offset magnitude
    const maxOffset = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    
    // Shaft tilt calculation (mm per meter of elevation)
    const shaftTilt = (maxOffset / params.elevationDistance) * 1000;
    
    // Determine tilt direction
    let tiltDirection = '';
    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      tiltDirection = offsetX > 0 ? 'East' : 'West';
    } else {
      tiltDirection = offsetY > 0 ? 'North' : 'South';
    }
    
    // Dog-leg severity assessment based on industry standards
    // Acceptable: <0.05 mm/m, Monitor: 0.05-0.1 mm/m, Critical: >0.1 mm/m
    let dogLegSeverity: 'ACCEPTABLE' | 'MONITOR' | 'CRITICAL' = 'ACCEPTABLE';
    if (shaftTilt > 0.1) dogLegSeverity = 'CRITICAL';
    else if (shaftTilt > 0.05) dogLegSeverity = 'MONITOR';
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (dogLegSeverity === 'CRITICAL') {
      recommendations.push('🚨 Shaft tilt > 0.1 mm/m: Critical - immediate realignment required');
      recommendations.push('⚠️ Check guide bearing clearances and wear patterns');
    } else if (dogLegSeverity === 'MONITOR') {
      recommendations.push('⚠️ Shaft tilt 0.05-0.1 mm/m: Monitor - schedule alignment check');
      recommendations.push('📊 Trend plumbness measurements over next 30 days');
    } else {
      recommendations.push('✅ Shaft tilt < 0.05 mm/m: Within acceptable tolerance');
    }
    
    if (maxOffset > 2) {
      recommendations.push('📏 Max offset > 2mm: Verify wire tension and sag correction');
    }
    
    return {
      shaftTilt,
      tiltDirection,
      dogLegSeverity,
      maxOffset,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculatePlumbness);
  };

  const handleReset = () => {
    setParams({
      quadrant1: 0,
      quadrant2: 0,
      quadrant3: 0,
      quadrant4: 0,
      wireWeight: 10,
      elevationDistance: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Shaft <span className="text-cyan-400">Plumbness Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Vertical shaft plumbness verification using wire micrometer method
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <GlassCard title="Wire Micrometer Readings" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Quadrant 1 (mm)"
                type="number"
                value={params.quadrant1}
                onChange={(e) => setParams({ ...params, quadrant1: parseFloat(e.target.value) || 0 })}
                icon={<Ruler className="w-4 h-4" />}
                step="0.01"
              />
              <ModernInput
                label="Quadrant 3 (mm)"
                type="number"
                value={params.quadrant3}
                onChange={(e) => setParams({ ...params, quadrant3: parseFloat(e.target.value) || 0 })}
                icon={<Ruler className="w-4 h-4" />}
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Quadrant 2 (mm)"
                type="number"
                value={params.quadrant2}
                onChange={(e) => setParams({ ...params, quadrant2: parseFloat(e.target.value) || 0 })}
                icon={<Ruler className="w-4 h-4" />}
                step="0.01"
              />
              <ModernInput
                label="Quadrant 4 (mm)"
                type="number"
                value={params.quadrant4}
                onChange={(e) => setParams({ ...params, quadrant4: parseFloat(e.target.value) || 0 })}
                icon={<Ruler className="w-4 h-4" />}
                step="0.01"
              />
            </div>
            <ModernInput
              label="Wire Weight (kg)"
              type="number"
              value={params.wireWeight}
              onChange={(e) => setParams({ ...params, wireWeight: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="1"
              max="50"
            />
            <ModernInput
              label="Elevation Distance (m)"
              type="number"
              value={params.elevationDistance}
              onChange={(e) => setParams({ ...params, elevationDistance: parseFloat(e.target.value) || 0 })}
              icon={<Ruler className="w-4 h-4" />}
              min="1"
              max="50"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Plumbness
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {/* Results */}
        {results && (
          <GlassCard title="Plumbness Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.dogLegSeverity === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.dogLegSeverity === 'MONITOR' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Shaft Tilt</p>
                    <p className="text-4xl font-black text-white">{results.shaftTilt.toFixed(3)} mm/m</p>
                    <p className="text-sm text-slate-300 mt-1">Direction: {results.tiltDirection}</p>
                  </div>
                  <Activity className={`w-12 h-12 ${results.dogLegSeverity === 'CRITICAL' ? 'text-red-400' : results.dogLegSeverity === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
                <p className={`text-sm font-bold mt-2 uppercase tracking-wider ${results.dogLegSeverity === 'CRITICAL' ? 'text-red-400' : results.dogLegSeverity === 'MONITOR' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {results.dogLegSeverity}
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Maximum Offset</p>
                <p className="text-3xl font-black text-white">{results.maxOffset.toFixed(2)} mm</p>
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
