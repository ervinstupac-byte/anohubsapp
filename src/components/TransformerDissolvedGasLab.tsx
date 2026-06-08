import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface TransformerDissolvedGasParams {
  hydrogen: number; // ppm
  methane: number; // ppm
  acetylene: number; // ppm
}

interface TransformerDissolvedGasResults {
  gasRatio: number;
  faultType: 'NORMAL' | 'THERMAL' | 'ELECTRICAL' | 'CRITICAL';
  recommendations: string[];
}

export const TransformerDissolvedGasLab: React.FC = () => {
  const [params, setParams] = useState<TransformerDissolvedGasParams>({
    hydrogen: 100,
    methane: 50,
    acetylene: 5
  });

  const [results, setResults] = useState<TransformerDissolvedGasResults | null>(null);

  const calculateTransformerGas = useMemo(() => {
    // Calculate gas ratio (Duval Triangle method simplified)
    // Ratio depends on gas concentrations
    const totalGas = params.hydrogen + params.methane + params.acetylene;
    const gasRatio = totalGas > 0 ? (params.acetylene / totalGas) * 100 : 0;

    // Determine fault type based on gas ratios
    // Normal: Low acetylene, Thermal: High methane, Electrical: High acetylene
    let faultType: 'NORMAL' | 'THERMAL' | 'ELECTRICAL' | 'CRITICAL' = 'NORMAL';
    
    if (params.acetylene > 50) faultType = 'CRITICAL';
    else if (params.acetylene > 20) faultType = 'ELECTRICAL';
    else if (params.methane > 200) faultType = 'THERMAL';

    const recommendations: string[] = [];
    if (faultType === 'CRITICAL') {
      recommendations.push('🚨 Critical fault: High acetylene > 50 ppm - immediate transformer shutdown');
      recommendations.push('⚠️ Risk of catastrophic failure - do not operate');
    } else if (faultType === 'ELECTRICAL') {
      recommendations.push('⚠️ Electrical fault: Acetylene 20-50 ppm - partial discharge or arcing');
      recommendations.push('📊 Schedule electrical testing and inspection');
    } else if (faultType === 'THERMAL') {
      recommendations.push('⚠️ Thermal fault: High methane > 200 ppm - overheating');
      recommendations.push('📊 Check cooling system and load conditions');
    } else {
      recommendations.push('✅ Normal: Low gas levels - normal transformer operation');
    }

    if (params.hydrogen > 500) {
      recommendations.push('⚠️ High hydrogen > 500 ppm: Possible corona discharge');
    }

    if (gasRatio > 10) {
      recommendations.push('⚠️ High gas ratio > 10%: Significant electrical activity');
    }

    if (totalGas > 1000) {
      recommendations.push('⚠️ High total gas > 1000 ppm: Accelerated aging');
    }

    if (params.acetylene > 0 && params.methane === 0) {
      recommendations.push('⚠️ Acetylene without methane: Possible arcing fault');
    }

    return {
      gasRatio,
      faultType,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateTransformerGas);
  };

  const handleReset = () => {
    setParams({
      hydrogen: 100,
      methane: 50,
      acetylene: 5
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Transformer Dissolved <span className="text-cyan-400">Gas Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Gas ratio calculation and fault type prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Gas Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Hydrogen (ppm)"
              type="number"
              value={params.hydrogen}
              onChange={(e) => setParams({ ...params, hydrogen: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="2000"
            />
            <ModernInput
              label="Methane (ppm)"
              type="number"
              value={params.methane}
              onChange={(e) => setParams({ ...params, methane: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="1000"
            />
            <ModernInput
              label="Acetylene (ppm)"
              type="number"
              value={params.acetylene}
              onChange={(e) => setParams({ ...params, acetylene: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="0"
              max="200"
            />

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Gas Analysis
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Gas Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.faultType === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.faultType === 'ELECTRICAL' ? 'bg-amber-950/20 border-amber-500' : results.faultType === 'THERMAL' ? 'bg-orange-950/20 border-orange-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fault Type</p>
                    <p className="text-2xl font-black text-white">{results.faultType}</p>
                  </div>
                  <AlertTriangle className={`w-12 h-12 ${results.faultType === 'CRITICAL' ? 'text-red-400' : results.faultType === 'ELECTRICAL' ? 'text-amber-400' : results.faultType === 'THERMAL' ? 'text-orange-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gas Ratio</p>
                <p className="text-3xl font-black text-white">{results.gasRatio.toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Gas Concentration</p>
                <p className="text-3xl font-black text-white">{(params.hydrogen + params.methane + params.acetylene).toFixed(0)} ppm</p>
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
