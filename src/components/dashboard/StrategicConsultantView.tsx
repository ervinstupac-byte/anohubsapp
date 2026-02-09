/**
 * StrategicConsultantView.tsx
 * 
 * NC-1000: Commander Protocol Strategic Planning Interface
 * Provides Bid Evaluation and Hydraulic Feasibility Analysis
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Droplets,
  Gauge,
  DollarSign,
  Zap,
  Factory,
  Truck,
  Shield
} from 'lucide-react';
import { SovereignViewShell } from './SovereignViewShell';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { StrategicPlanningService, Bid, SiteParameters, BidEvaluation, FeasibilityResult } from '../../services/StrategicPlanningService';
import { TurbineType } from '../../models/turbine/TurbineFactory';
import { ThePulseEngine } from '../../services/ThePulseEngine';

interface BidInput {
  manufacturer: string;
  turbineType: TurbineType;
  ratedPowerMW: number;
  efficiencyAtBestPoint: number;
  runnerDiameter: number;
  price: number;
  guaranteedIncluded: boolean;
}

interface SiteInput {
  grossHead: number;
  pipeLength: number;
  pipeDiameter: number;
  pipeMaterial: 'GRP' | 'STEEL' | 'CONCRETE' | 'PEHD';
  wallThickness: number;
  boltClass: '4.6' | '5.6' | '8.8' | '10.9';
  corrosionProtection: 'NONE' | 'PAINT' | 'GALVANIZED';
  waterQuality: 'CLEAN' | 'SILT' | 'SAND' | 'GLACIAL';
  ecologicalFlow: number;
}

export const StrategicConsultantView: React.FC = () => {
  // Bid Evaluation State
  const [bidInput, setBidInput] = useState<BidInput>({
    manufacturer: '',
    turbineType: 'FRANCIS',
    ratedPowerMW: 5,
    efficiencyAtBestPoint: 94,
    runnerDiameter: 1200,
    price: 5000000,
    guaranteedIncluded: true
  });

  const [siteInput, setSiteInput] = useState<SiteInput>({
    grossHead: 150,
    pipeLength: 500,
    pipeDiameter: 2000,
    pipeMaterial: 'STEEL',
    wallThickness: 10,
    boltClass: '8.8',
    corrosionProtection: 'PAINT',
    waterQuality: 'CLEAN',
    ecologicalFlow: 2
  });

  const [bidResult, setBidResult] = useState<BidEvaluation | null>(null);
  const [feasibilityResult, setFeasibilityResult] = useState<FeasibilityResult | null>(null);
  const [pulseImpact, setPulseImpact] = useState<{ index: number; status: string } | null>(null);

  const evaluateBid = useCallback(() => {
    const bid: Bid = {
      ...bidInput,
      turbineType: bidInput.turbineType as TurbineType
    };

    const site: SiteParameters = {
      ...siteInput,
      flowDurationCurve: [
        { flow: 20, probability: 10 },
        { flow: 15, probability: 30 },
        { flow: 10, probability: 50 },
        { flow: 5, probability: 90 }
      ]
    };

    // Evaluate bid using StrategicPlanningService
    const evaluation = StrategicPlanningService.evaluateBid(bid, site);
    setBidResult(evaluation);

    // Calculate feasibility
    const feasibility = StrategicPlanningService.calculateFeasibility(site);
    setFeasibilityResult(feasibility);

    // Calculate Pulse Impact
    const pulse = ThePulseEngine.calculatePulse(
      [evaluation.score],
      feasibility.annualProductionMWh * 50, // Approximate revenue
      50,
      evaluation.risks.length,
      0,
      0
    );
    setPulseImpact({ index: pulse.index, status: pulse.globalStatus });
  }, [bidInput, siteInput]);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'SHORTLIST': return 'text-green-400';
      case 'NEGOTIATE': return 'text-yellow-400';
      case 'REJECT': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'SHORTLIST': return CheckCircle;
      case 'NEGOTIATE': return AlertTriangle;
      case 'REJECT': return XCircle;
      default: return Scale;
    }
  };

  return (
    <SovereignViewShell
      config={{
        sector: 'Strategic Consultant',
        subtitle: 'Bid Evaluation & Feasibility Analysis',
        icon: Calculator,
        iconWrapClassName: 'bg-blue-500/20 border-blue-500/30',
        iconClassName: 'text-blue-400',
        panels: [
          {
            key: 'bid-evaluator',
            title: 'Bid Evaluator',
            icon: Scale,
            content: (
              <div className="space-y-6">
                {/* Bid Input Section */}
                <GlassCard className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Factory className="w-5 h-5 text-blue-400" />
                    Manufacturer Claims
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={bidInput.manufacturer}
                        onChange={(e) => setBidInput({ ...bidInput, manufacturer: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                        placeholder="e.g., Voith"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Turbine Type</label>
                      <select
                        value={bidInput.turbineType}
                        onChange={(e) => setBidInput({ ...bidInput, turbineType: e.target.value as TurbineType })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      >
                        <option value="FRANCIS">Francis</option>
                        <option value="KAPLAN">Kaplan</option>
                        <option value="PELTON">Pelton</option>
                        <option value="CROSSFLOW">Crossflow</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Rated Power (MW)</label>
                      <input
                        type="number"
                        value={bidInput.ratedPowerMW}
                        onChange={(e) => setBidInput({ ...bidInput, ratedPowerMW: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Efficiency at BEP (%)</label>
                      <input
                        type="number"
                        value={bidInput.efficiencyAtBestPoint}
                        onChange={(e) => setBidInput({ ...bidInput, efficiencyAtBestPoint: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Runner Diameter (mm)</label>
                      <input
                        type="number"
                        value={bidInput.runnerDiameter}
                        onChange={(e) => setBidInput({ ...bidInput, runnerDiameter: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Price (EUR)</label>
                      <input
                        type="number"
                        value={bidInput.price}
                        onChange={(e) => setBidInput({ ...bidInput, price: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="guaranteed"
                      checked={bidInput.guaranteedIncluded}
                      onChange={(e) => setBidInput({ ...bidInput, guaranteedIncluded: e.target.checked })}
                      className="rounded border-slate-700"
                    />
                    <label htmlFor="guaranteed" className="text-sm text-slate-400">
                      Performance Guarantee Included
                    </label>
                  </div>
                </GlassCard>

                {/* Site Parameters */}
                <GlassCard className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    Site Parameters
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Gross Head (m)</label>
                      <input
                        type="number"
                        value={siteInput.grossHead}
                        onChange={(e) => setSiteInput({ ...siteInput, grossHead: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Pipe Length (m)</label>
                      <input
                        type="number"
                        value={siteInput.pipeLength}
                        onChange={(e) => setSiteInput({ ...siteInput, pipeLength: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Pipe Diameter (mm)</label>
                      <input
                        type="number"
                        value={siteInput.pipeDiameter}
                        onChange={(e) => setSiteInput({ ...siteInput, pipeDiameter: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Ecological Flow (m³/s)</label>
                      <input
                        type="number"
                        value={siteInput.ecologicalFlow}
                        onChange={(e) => setSiteInput({ ...siteInput, ecologicalFlow: parseFloat(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </GlassCard>

                {/* Evaluate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={evaluateBid}
                  className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 font-semibold flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Evaluate Bid Against Physics
                </motion.button>

                {/* Results */}
                {bidResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Evaluation Results</h3>
                        <div className={`flex items-center gap-2 ${getRecommendationColor(bidResult.recommendation)}`}>
                          {React.createElement(getRecommendationIcon(bidResult.recommendation), { className: 'w-5 h-5' })}
                          <span className="font-bold">{bidResult.recommendation}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-2xl font-bold text-white">{bidResult.score}/100</div>
                          <div className="text-xs text-slate-400">Overall Score</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-2xl font-bold text-white">{bidResult.efficiencyGap.toFixed(1)}%</div>
                          <div className="text-xs text-slate-400">Efficiency Gap</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className={`text-2xl font-bold ${bidResult.isRealistic ? 'text-green-400' : 'text-red-400'}`}>
                            {bidResult.isRealistic ? 'YES' : 'NO'}
                          </div>
                          <div className="text-xs text-slate-400">Realistic</div>
                        </div>
                      </div>

                      {bidResult.risks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-300">Identified Risks:</h4>
                          {bidResult.risks.map((risk, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-yellow-400">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                )}

                {/* Feasibility Results */}
                {feasibilityResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Feasibility Analysis
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-xl font-bold text-white">{feasibilityResult.netHead.toFixed(1)}m</div>
                          <div className="text-xs text-slate-400">Net Head</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-xl font-bold text-white">{feasibilityResult.frictionLoss.toFixed(2)}m</div>
                          <div className="text-xs text-slate-400">Friction Loss</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-xl font-bold text-white">{feasibilityResult.optimalFlow.toFixed(1)}m³/s</div>
                          <div className="text-xs text-slate-400">Optimal Flow</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <div className="text-xl font-bold text-green-400">{feasibilityResult.annualProductionMWh.toFixed(0)}MWh</div>
                          <div className="text-xs text-slate-400">Annual Production</div>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
                        <div className="text-sm text-slate-400 mb-1">Recommended Configuration</div>
                        <div className="text-lg font-semibold text-blue-400">
                          {feasibilityResult.recommendedAggregates.count}x {feasibilityResult.recommendedAggregates.type}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {feasibilityResult.recommendedAggregates.reasoning}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* Pulse Impact */}
                {pulseImpact && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-purple-400" />
                        Sovereign Pulse Impact
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold text-purple-400">{pulseImpact.index.toFixed(1)}%</div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pulseImpact.status === 'OPTIMAL' ? 'bg-green-500/20 text-green-400' :
                          pulseImpact.status === 'STRESSED' ? 'bg-yellow-500/20 text-yellow-400' :
                          pulseImpact.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {pulseImpact.status}
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        Based on evaluation score, feasibility, and financial projections
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </div>
            )
          }
        ]
      }}
    />
  );
};

export default StrategicConsultantView;
