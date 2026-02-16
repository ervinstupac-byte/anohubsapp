/**
 * ExecutiveWarRoom.tsx - NC-1800: The Sovereign Command Center
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Activity, AlertTriangle, FileDown, Target, Euro, BookOpen, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { SovereignViewShell } from './SovereignViewShell';
import { calculateRevenueLoss } from '../../features/business/logic/FinancialCalculator';
import { PDFRenderer, PAGE_CONFIG, COLORS } from '../../features/reporting/utils/PDFRenderer';
import jsPDF from 'jspdf';
import { SovereignVerdict, UrgencyLevel, SovereignMemory, TelemetryData } from '../../types/sovereign-core';

// Simulated SovereignMemory for historical data
const simulatedSovereignMemory: SovereignMemory = {
  drawing42: "Drawing 42: Initial water hammer analysis revealed critical surge pressure patterns",
  fieldNote: "Field Note: Cavitation detected at 75% load - immediate inspection required",
  wisdom: "Ancestral Wisdom: Governor response time within acceptable limits for 100% load rejection"
};

export const ExecutiveWarRoom: React.FC = () => {
  const { physics, hydraulic, mechanical, identity, updateTelemetry, executiveResult } = useTelemetryStore() as any;
  const [sovereignPulse, setSovereignPulse] = useState(85); // Simulated current pulse
  const [relevantWisdom, setRelevantWisdom] = useState<string | null>(null);

  // Simulator state variables
  const [rpm, setRpm] = useState(600);
  const [flowM3s, setFlowM3s] = useState(30);
  const [headM, setHeadM] = useState(150);

  const verdict = useMemo<SovereignVerdict>(() => {
    if (!executiveResult) {
        // Fallback to legacy logic if engine not ready
        const reasoning: string[] = [];
        let urgency: UrgencyLevel = 'LOW';
        let recommendation = 'Continue nominal operation';
        let action = 'MONITOR';
    
        const powerMW = physics?.powerMW ? Number(physics.powerMW) : 0;
        const baselineMW = hydraulic?.baselineOutputMW ? Number(hydraulic.baselineOutputMW) : 100;
        const rpm = mechanical?.rpm || 600;
        const rpmDeviation = Math.abs((rpm - 600) / 600) * 100;
    
        if (rpmDeviation > 10) {
          reasoning.push(`RPM deviation: ${rpmDeviation.toFixed(1)}% from BEP`);
          urgency = 'MEDIUM';
          recommendation = `Throttle to 600 RPM`;
          action = 'THROTTLE';
        }
    
        const eff = typeof hydraulic?.efficiency === 'number' ? hydraulic.efficiency : 90;
        const efficiencyPercent = eff <= 1 ? eff * 100 : eff;
    
        const finResult = calculateRevenueLoss({
          market: { energyPricePerMWh: 85, currency: 'EUR' },
          technical: { 
            currentActivePowerMW: powerMW,
            designRatedPowerMW: baselineMW,
            isTurbineRunning: powerMW > 0,
            currentEfficiencyPercent: efficiencyPercent
          }
        });
    
        return {
          recommendation,
          action,
          financialImpact: `€${finResult.revenueLossPerHour.toFixed(2)}/hr loss`,
          confidence: 85,
          urgency,
          reasoning
        };
    }

    // NC-10051: Real Sovereign Engine Output
    const isProtectionActive = executiveResult.activeProtections.length > 0;
    const isShutdown = executiveResult.activeProtections.some((p: string) => p.includes('SHUTDOWN'));
    const isThrottled = executiveResult.activeProtections.some((p: string) => p.includes('THROTTLED'));

    return {
        recommendation: executiveResult.operatorMessage,
        action: executiveResult.fleetAction || (isShutdown ? 'SHUTDOWN' : (isThrottled ? 'THROTTLE' : 'OPTIMIZE')),
        financialImpact: `Net Profit: €${executiveResult.financials.netSovereignProfitEur.toFixed(2)}/hr`,
        confidence: Math.round(executiveResult.masterHealthScore),
        urgency: isShutdown ? 'CRITICAL' : (isThrottled ? 'HIGH' : (isProtectionActive ? 'MEDIUM' : 'LOW')),
        reasoning: executiveResult.activeProtections.length > 0 ? executiveResult.activeProtections : ['System Nominal']
    };
  }, [physics, hydraulic, mechanical, executiveResult]);

  // Update relevant wisdom based on current pulse
  useEffect(() => {
    if (sovereignPulse < 70) {
      setRelevantWisdom(simulatedSovereignMemory.fieldNote);
    } else if (sovereignPulse < 50) {
      setRelevantWisdom(simulatedSovereignMemory.drawing42);
    } else {
      setRelevantWisdom(simulatedSovereignMemory.wisdom);
    }
  }, [sovereignPulse]);

  const downloadReport = () => {
    const doc = new jsPDF();
    const pid = (identity as any)?.projectId || 'SOVEREIGN-001';
    PDFRenderer.drawHeader(doc, pid);
    doc.setFontSize(20);
    doc.text("SOVEREIGN REPORT", PAGE_CONFIG.MARGIN, 45);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, PAGE_CONFIG.MARGIN, 55);
    PDFRenderer.drawFooter(doc, 1);
    PDFRenderer.drawDigitalSeal(doc);
    doc.save('sovereign-report.pdf');
  };

  const fin = () => {
    const p = physics?.powerMW ? Number(physics.powerMW) : 0;
    const b = hydraulic?.baselineOutputMW ? Number(hydraulic.baselineOutputMW) : 100;
    const r = calculateRevenueLoss({
      market: { energyPricePerMWh: 85, currency: 'EUR' },
      technical: { 
        currentActivePowerMW: p, 
        designRatedPowerMW: b, 
        isTurbineRunning: p > 0, 
        currentEfficiencyPercent: hydraulic?.efficiency || 90 
      }
    });
    return { h: r.revenueLossPerHour.toFixed(0), m: (r.revenueLossPerHour * 24 * 30).toFixed(0) };
  };

  const f = fin();

  return (
    <SovereignViewShell config={{
      sector: "Executive",
      subtitle: "Sovereign Command Center",
      unitId: "NC-1800",
      icon: Crown,
      iconWrapClassName: "bg-yellow-500/20",
      iconClassName: "text-yellow-400",
      panels: []
    }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Verdict Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Crown className="w-8 h-8 mr-3 text-yellow-400" />
                Sovereign Verdict
              </h2>
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => window.open('#/detach/war-room', '_blank', 'width=1000,height=800,menubar=no,status=no')}
                    className="text-slate-500 hover:text-yellow-400 transition-colors"
                    title="Detach Module"
                >
                    <ExternalLink className="w-5 h-5" />
                </button>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    verdict.urgency === 'CRITICAL' ? 'bg-red-500 text-white' :
                    verdict.urgency === 'HIGH' ? 'bg-orange-500 text-white' :
                    verdict.urgency === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                    'bg-green-500 text-white'
                }`}>
                    {verdict.urgency}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Recommendation</h3>
                <p className="text-white text-lg">{verdict.recommendation}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">Action</h3>
                <p className="text-white text-lg">{verdict.action}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Financial Impact</h3>
                <p className="text-white text-2xl font-bold">{verdict.financialImpact}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">Confidence</h3>
                <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${verdict.confidence}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                  />
                </div>
                <div className="text-center mt-2 text-purple-300 text-sm">{verdict.confidence}%</div>
              </div>

              {verdict.reasoning.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-300 mb-2">Reasoning</h3>
                  <ul className="space-y-1">
                    {verdict.reasoning.map((reason, index) => (
                      <li key={index} className="text-red-200 text-sm flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-red-400 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Ancestral Wisdom Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <GlassCard className="p-6">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 mr-2 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Ancestral Wisdom</h3>
            </div>

            <div className="space-y-4">
              {/* Simulator Control Panel - Guest Mode */}
              <div className="bg-slate-800/95 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="text-[10px] text-slate-300 uppercase font-mono tracking-widest mb-2">Simulator Control Panel</div>
                <div>
                  <div className="text-[10px] text-slate-300 mb-2">RPM</div>
                  <input
                    type="range"
                    min="0"
                    max="900"
                    step="10"
                    value={rpm}
                    onChange={(e) => {
                      const newRpm = Number(e.target.value);
                      setRpm(newRpm);
                      updateTelemetry({ mechanical: { rpm: newRpm } });
                    }}
                    className="w-full"
                  />
                  <div className="text-sm text-slate-400">{rpm} RPM</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-gray-300 font-semibold mb-3">Historical Context</h4>
                <div className="space-y-3">
                  <div className="text-gray-400 text-sm">
                    <div className="font-medium text-gray-300">Drawing 42:</div>
                    <div className="text-xs mt-1">{simulatedSovereignMemory.drawing42}</div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <div className="font-medium text-gray-300">Field Note:</div>
                    <div className="text-xs mt-1">{simulatedSovereignMemory.fieldNote}</div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <div className="font-medium text-gray-300">Ancestral Wisdom:</div>
                    <div className="text-xs mt-1">{simulatedSovereignMemory.wisdom}</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Commander Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-3 lg:col-start-3"
        >
          <GlassCard className="p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 mr-2 text-green-400" />
              <h3 className="text-xl font-bold text-white">Commander Mode</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Apply Setpoints
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Commit to History
                </button>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-green-300 font-semibold mb-2">Experience Ledger</h4>
                <p className="text-gray-400 text-sm">
                  Last setpoint change: 2 hours ago<br />
                  Operator: System Administrator<br />
                  Signature: Pending
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button 
                  onClick={downloadReport}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  <FileDown className="w-5 h-5 mr-2 inline" />
                  Download Experience Report
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </SovereignViewShell>
  );
};

export default ExecutiveWarRoom;
