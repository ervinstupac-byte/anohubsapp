/**
 * StrategicConsultantView.tsx
 * 
 * NC-1000: Commander Protocol Strategic Planning Interface
 * Provides Bid Evaluation and Hydraulic Feasibility Analysis
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  Shield,
  ScanLine,
  AlertOctagon
} from 'lucide-react';
import { SovereignViewShell } from './SovereignViewShell';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { StrategicPlanningService, Bid, SiteParameters, BidEvaluation, FeasibilityResult } from '../../services/StrategicPlanningService';
import { TurbineType } from '../../models/turbine/TurbineFactory';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import { generateArchitectReport, ArchitectReport } from '../../services/SovereignArchitectReflector';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { SovereignGlobalState } from '../../services/SovereignGlobalState';

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
  // NC-1700: Live telemetry from store
  const { mechanical, hydraulic } = useTelemetryStore();

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

  // NC-1700: Design vs Reality Check with LIVE telemetry
  const [designCheck, setDesignCheck] = useState<{
    designBEP_RPM: number;
    currentRPM: number;
    deviation: number;
    alert: 'NONE' | 'WARNING' | 'CRITICAL';
    message: string;
    efficiencyAlert: boolean;
  }>({
    designBEP_RPM: 600, // Design Best Efficiency Point
    currentRPM: mechanical?.rpm || 600, // LIVE from telemetry
    deviation: 0,
    alert: 'NONE',
    message: '',
    efficiencyAlert: false
  });

  // NC-1700: Perform design check with live telemetry
  const performDesignCheck = useCallback(() => {
    const liveRPM = mechanical?.rpm || 600;
    const deviation = Math.abs((liveRPM - designCheck.designBEP_RPM) / designCheck.designBEP_RPM) * 100;
    
    let alert: 'NONE' | 'WARNING' | 'CRITICAL' = 'NONE';
    let message = 'Operating at design specifications';
    let efficiencyAlert = false;

    if (deviation > 15) {
      alert = 'CRITICAL';
      message = `DESIGN_MISMATCH: Operating ${deviation.toFixed(1)}% from BEP. Severe efficiency loss expected.`;
      efficiencyAlert = true;
      // NC-1700: Trigger system-wide EFFICIENCY_ALERT
      console.error('🔴 EFFICIENCY_ALERT: RPM deviation >15% from BEP!');
    } else if (deviation > 10) {
      alert = 'WARNING';
      message = `DESIGN_MISMATCH: Operating ${deviation.toFixed(1)}% from BEP. Efficiency degradation likely.`;
      efficiencyAlert = true;
      // NC-1700: Trigger system-wide EFFICIENCY_ALERT
      console.warn('🟡 EFFICIENCY_ALERT: RPM deviation >10% from BEP!');
    }

    setDesignCheck(prev => ({
      ...prev,
      currentRPM: liveRPM,
      deviation,
      alert,
      message,
      efficiencyAlert
    }));

    // NC-1700: Broadcast to SovereignGlobalState for system-wide alert
    if (efficiencyAlert) {
      SovereignGlobalState.updateState({
        physics: {
          ...SovereignGlobalState.getState().physics,
          efficiency: 100 - (deviation * 0.5), // Estimate efficiency loss
          cavitation: deviation // Store deviation in cavitation field for alerting
        }
      });
    }
  }, [mechanical?.rpm, designCheck.designBEP_RPM]);

  // Run design check when live RPM changes
  useEffect(() => {
    performDesignCheck();
  }, [performDesignCheck]);

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
          },
          {
            key: 'design-reality',
            title: 'Design vs Reality',
            icon: ScanLine,
            content: (
              <div className="space-y-6">
                <GlassCard className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-amber-400" />
                    Architect's Design Intent Check
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Design BEP (RPM)</label>
                      <input
                        type="number"
                        value={designCheck.designBEP_RPM}
                        onChange={(e) => setDesignCheck({ ...designCheck, designBEP_RPM: parseInt(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                      <div className="text-xs text-slate-500 mt-1">Best Efficiency Point from design specs</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Current Operating RPM</label>
                      <input
                        type="number"
                        value={designCheck.currentRPM}
                        onChange={(e) => setDesignCheck({ ...designCheck, currentRPM: parseInt(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                      <div className="text-xs text-slate-500 mt-1">Actual turbine speed</div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    designCheck.alert === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' :
                    designCheck.alert === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {designCheck.alert === 'CRITICAL' ? <AlertOctagon className="w-5 h-5 text-red-400" /> :
                       designCheck.alert === 'WARNING' ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                       <CheckCircle className="w-5 h-5 text-green-400" />}
                      <span className={`font-semibold ${
                        designCheck.alert === 'CRITICAL' ? 'text-red-400' :
                        designCheck.alert === 'WARNING' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {designCheck.alert === 'NONE' ? 'DESIGN COMPLIANT' : designCheck.alert}
                      </span>
                    </div>
                    <div className="text-sm text-white mb-2">
                      Deviation: {designCheck.deviation.toFixed(1)}% from BEP
                    </div>
                    <div className="text-xs text-slate-300">
                      {designCheck.message}
                    </div>
                  </div>

                  {designCheck.alert !== 'NONE' && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded">
                      <div className="text-xs text-slate-400 mb-2">Architect Analysis</div>
                      <div className="text-sm text-slate-300">
                        The machine is operating outside the Architect's intended design envelope.
                        Efficiency losses: ~{(designCheck.deviation * 0.5).toFixed(0)}% per 10% deviation from BEP.
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            )
          }
        ]
      }}
    />
  );
};

export default StrategicConsultantView;
