import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Zap, Thermometer, Activity, Droplets, Save, Check, X, Calendar } from 'lucide-react';
import { calculatePowerMW, calculateAnnualEnergyGWh, calculateSpecificSpeed, classifyTurbineType } from '../utils/CorePhysics';
import { saveDiagnosticSnapshot, getAllAssets, DiagnosticLabType } from '../services/DiagnosticHistoryService';
import { analyzeRootCause, RootCauseAnalysis, FaultSymptoms } from '../utils/RootCauseEngine';
import { AssetHistoryView } from './AssetHistoryView';

interface PredictionParams {
  head: number; // meters
  flow: number; // m³/s
  rpm: number; // revolutions per minute
  temperature: number; // Celsius
  vibration: number; // mm/s
  efficiency: number; // percentage
  powerFactor: number; // 0-1
  runnerDiameter: number; // meters
  suctionHead: number; // meters (negative = submergence)
  capacityFactor: number; // 0-1 for AEP calculation
}

interface PredictionResults {
  powerOutput: number; // MW
  specificSpeed: number;
  turbineType: { type: string; color: string };
  annualEnergyGWh: number;
  cavitationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  vibrationSeverityZone: string; // ISO 10816-1
  thermalStress: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  recommendations: string[];
  causalChain?: RootCauseAnalysis | null;
}

export const SystemPredictionLab: React.FC = () => {
  const [params, setParams] = useState<PredictionParams>({
    head: 100,
    flow: 50,
    rpm: 150,
    temperature: 65,
    vibration: 2.5,
    efficiency: 92,
    powerFactor: 0.85,
    runnerDiameter: 2.5,
    suctionHead: -2.0,
    capacityFactor: 0.85
  });

  const [results, setResults] = useState<PredictionResults | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      const { data, success } = await getAllAssets();
      if (success && data.length > 0) {
        setAssets(data);
        setSelectedAssetId(data[0].id);
      }
    };

    loadAssets();
  }, []);

  const handleSaveSnapshot = async () => {
    if (!selectedAssetId || !results) return;

    setSaveStatus('saving');
    setSaveErrorMessage('');

    const labType: DiagnosticLabType = 'SYSTEM_PREDICTION';
    const { success, error } = await saveDiagnosticSnapshot(selectedAssetId, labType, params, results);

    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setSaveErrorMessage(error || 'Unknown error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const calculatePredictions = useMemo(() => {
    // --- CORE PHYSICS CALCULATIONS (from CorePhysics.ts) ---
    const powerMW = calculatePowerMW(params.head, params.flow, params.efficiency) * params.powerFactor;
    const specificSpeed = calculateSpecificSpeed(params.head, params.flow, params.rpm);
    const turbineType = classifyTurbineType(specificSpeed);
    const annualEnergyGWh = calculateAnnualEnergyGWh(powerMW, params.capacityFactor);

    // --- EXISTING CAVITATION, VIBRATION, THERMAL CALCULATIONS ---
    const g = 9.81;
    const atmosphericPressure = 10.3; // meters of water column at sea level
    const vaporPressure = 0.24; // meters of water at 20°C (simplified)
    const netHead = params.head;
    const crossSectionalArea = Math.PI * Math.pow(params.runnerDiameter / 2, 2);
    const velocity = params.flow / crossSectionalArea;
    const velocityHead = Math.pow(velocity, 2) / (2 * g);
    const thomaNumber = (atmosphericPressure - vaporPressure - params.suctionHead) / netHead + (velocityHead / netHead);

    let cavitationRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (thomaNumber < 0.08) cavitationRisk = 'HIGH';
    else if (thomaNumber < 0.12) cavitationRisk = 'MEDIUM';

    let vibrationSeverityZone: string;
    if (params.vibration < 2.8) {
      vibrationSeverityZone = 'Zone A/B (Healthy)';
    } else if (params.vibration < 4.5) {
      vibrationSeverityZone = 'Zone C (Restricted Operation)';
    } else {
      vibrationSeverityZone = 'Zone D (Critical/Trip)';
    }

    let thermalStress: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';
    if (params.temperature > 90) thermalStress = 'CRITICAL';
    else if (params.temperature > 75) thermalStress = 'ELEVATED';


    // Generate Recommendations
    const recommendations: string[] = [];
    if (cavitationRisk === 'HIGH') recommendations.push('⚠️ Thoma number < 0.08: High cavitation risk. Consider reducing flow, increasing draft tube submergence, or runner modification.');
    if (cavitationRisk === 'MEDIUM') recommendations.push('⚠️ Thoma number < 0.12: Moderate cavitation risk. Monitor for noise and pitting.');
    if (thermalStress === 'CRITICAL') recommendations.push('🔥 Temperature > 90°C: Critical - oil degradation imminent. Check cooling system immediately.');
    if (thermalStress === 'ELEVATED') recommendations.push('🌡️ Temperature > 75°C: Elevated - oil viscosity reduced. Monitor cooling performance.');
    if (params.vibration > 4.5) recommendations.push('📊 Vibration > 4.5 mm/s: Exceeds ISO 10816-1 alert level. Immediate inspection required.');
    if (params.vibration > 2.8) recommendations.push('📊 Vibration > 2.8 mm/s: Above ISO 10816-1 acceptable range. Investigate imbalance/misalignment.');
    if (vibrationSeverityZone === 'Zone D (Critical/Trip)') recommendations.push('📊 Vibration in Zone D: Critical - immediate shutdown required per ISO 10816-1.');
    if (vibrationSeverityZone === 'Zone C (Restricted Operation)') recommendations.push('⚠️ Vibration in Zone C: Restricted operation - investigate imbalance/misalignment within 24 hours.');

    // --- ROOT CAUSE ANALYSIS ---
    const hasCriticalFault = cavitationRisk === 'HIGH' || thermalStress === 'CRITICAL' || vibrationSeverityZone.includes('Zone D') || vibrationSeverityZone.includes('Zone C');
    let causalChain: RootCauseAnalysis | null = null;
    if (hasCriticalFault) {
      const symptoms: FaultSymptoms = { cavitationRisk, thermalStress, vibrationSeverityZone };
      const engineParams = {
        head: params.head,
        flow: params.flow,
        rpm: params.rpm,
        temperature: params.temperature,
        vibration: params.vibration,
        efficiency: params.efficiency,
        suctionHead: params.suctionHead
      };
      causalChain = analyzeRootCause(symptoms, engineParams);
    }

    return {
      powerOutput: powerMW,
      specificSpeed,
      turbineType,
      annualEnergyGWh,
      cavitationRisk,
      vibrationSeverityZone,
      thermalStress,
      recommendations,
      causalChain
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculatePredictions);
  };

  const handleReset = () => {
    setParams({
      head: 100,
      flow: 50,
      rpm: 150,
      temperature: 65,
      vibration: 2.5,
      efficiency: 92,
      powerFactor: 0.85,
      runnerDiameter: 2.5,
      suctionHead: -2.0,
      capacityFactor: 0.85
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            System <span className="text-cyan-400">Prediction Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Test theoretical scenarios and predict system behavior
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <GlassCard title="Input Parameters" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <ModernInput
              label="Gross Head (m)"
              type="number"
              value={params.head}
              onChange={(e) => setParams({ ...params, head: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="2"
              max="1000"
            />
            <ModernInput
              label="Flow Rate (m³/s)"
              type="number"
              value={params.flow}
              onChange={(e) => setParams({ ...params, flow: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0.1"
              max="200"
            />
            <ModernInput
              label="Rotational Speed (RPM)"
              type="number"
              value={params.rpm}
              onChange={(e) => setParams({ ...params, rpm: parseFloat(e.target.value) || 0 })}
              icon={<Calculator className="w-4 h-4" />}
              min="50"
              max="1000"
            />
            <ModernInput
              label="Operating Temperature (°C)"
              type="number"
              value={params.temperature}
              onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) || 0 })}
              icon={<Thermometer className="w-4 h-4" />}
              min="20"
              max="120"
            />
            <ModernInput
              label="Vibration Level (mm/s)"
              type="number"
              value={params.vibration}
              onChange={(e) => setParams({ ...params, vibration: parseFloat(e.target.value) || 0 })}
              icon={<Activity className="w-4 h-4" />}
              min="0"
              max="10"
              step="0.1"
            />
            <ModernInput
              label="System Efficiency (%)"
              type="number"
              value={params.efficiency}
              onChange={(e) => setParams({ ...params, efficiency: parseFloat(e.target.value) || 0 })}
              icon={<TrendingUp className="w-4 h-4" />}
              min="50"
              max="98"
            />
            <ModernInput
              label="Power Factor"
              type="number"
              value={params.powerFactor}
              onChange={(e) => setParams({ ...params, powerFactor: parseFloat(e.target.value) || 0 })}
              icon={<Zap className="w-4 h-4" />}
              min="0.7"
              max="1.0"
              step="0.01"
            />
            <ModernInput
              label="Runner Diameter (m)"
              type="number"
              value={params.runnerDiameter}
              onChange={(e) => setParams({ ...params, runnerDiameter: parseFloat(e.target.value) || 0 })}
              icon={<Calculator className="w-4 h-4" />}
              min="0.5"
              max="10.0"
              step="0.1"
            />
            <ModernInput
              label="Suction Head (m)"
              type="number"
              value={params.suctionHead}
              onChange={(e) => setParams({ ...params, suctionHead: parseFloat(e.target.value) || 0 })}
              icon={<Droplets className="w-4 h-4" />}
              min="-10"
              max="10"
              step="0.1"
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Asset Selection</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {assets.length === 0 && <option value="">Loading assets...</option>}
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.turbine_family ? asset.turbine_family.toUpperCase() : 'Turbine'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Capacity Factor</label>
              <select
                value={params.capacityFactor}
                onChange={(e) => setParams({ ...params, capacityFactor: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value={0.85}>Stable Flow (0.85)</option>
                <option value={0.60}>Seasonal Flow (0.60)</option>
                <option value={0.45}>Peaking Operation (0.45)</option>
              </select>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <div className="flex gap-4">
                <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                  Calculate Predictions
                </ModernButton>
                <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                  Reset Parameters
                </ModernButton>
              </div>

              {results && (
                <>
                  <div className="flex gap-3 w-full">
                    <ModernButton
                      onClick={handleSaveSnapshot}
                      variant="primary"
                      disabled={saveStatus === 'saving' || !selectedAssetId}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                    >
                      {saveStatus === 'saving' ? (
                        <span className="flex items-center justify-center gap-2">
                          <Activity className="w-4 h-4 animate-spin" /> Saving Snapshot...
                        </span>
                      ) : saveStatus === 'success' ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Snapshot Saved!
                        </span>
                      ) : saveStatus === 'error' ? (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-4 h-4" /> Save Failed
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Save className="w-4 h-4" /> Save Snapshot to History
                        </span>
                      )}
                    </ModernButton>
                    <ModernButton
                      onClick={() => setShowHistory(true)}
                      variant="secondary"
                      className="flex items-center gap-2"
                      disabled={!selectedAssetId}
                    >
                      <Calendar className="w-4 h-4" /> View Asset History
                    </ModernButton>
                  </div>
                  
                  {saveStatus === 'error' && (
                    <p className="text-red-400 text-sm text-center">{saveErrorMessage}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Prediction Results */}
        {results && (
          <GlassCard title="Prediction Results" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              {/* Power Output */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Power Output</p>
                    <p className="text-4xl font-black text-white">{results.powerOutput.toFixed(2)} MW</p>
                  </div>
                  <Zap className="w-12 h-12 text-cyan-400" />
                </div>
              </div>

              {/* Annual Energy Production */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Annual Energy Production (AEP)</p>
                    <p className="text-3xl font-black text-emerald-400">{results.annualEnergyGWh.toFixed(2)} GWh/year</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              {/* Specific Speed & Turbine Type */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Specific Speed (N<sub>sq</sub>)</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-black text-white">{results.specificSpeed.toFixed(0)}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${results.turbineType.color}`}>
                        {results.turbineType.type}
                      </span>
                    </div>
                  </div>
                  <Calculator className="w-10 h-10 text-purple-400" />
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${results.cavitationRisk === 'HIGH' ? 'bg-red-950/20 border-red-500' : results.cavitationRisk === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cavitation Risk</p>
                  <p className={`text-lg font-black ${results.cavitationRisk === 'HIGH' ? 'text-red-400' : results.cavitationRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {results.cavitationRisk}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${results.thermalStress === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.thermalStress === 'ELEVATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thermal Stress</p>
                  <p className={`text-lg font-black ${results.thermalStress === 'CRITICAL' ? 'text-red-400' : results.thermalStress === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {results.thermalStress}
                  </p>
                </div>
              </div>

              {/* Vibration Severity Zone */}
              <div className={`p-4 bg-slate-900/50 rounded-xl border border-white/5 ${
                results.vibrationSeverityZone === 'Zone D (Critical/Trip)' ? 'border-red-500/30' :
                results.vibrationSeverityZone === 'Zone C (Restricted Operation)' ? 'border-amber-500/30' :
                'border-emerald-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vibration Severity Zone</p>
                    <p className={`text-2xl font-black ${
                      results.vibrationSeverityZone === 'Zone D (Critical/Trip)' ? 'text-red-400' :
                      results.vibrationSeverityZone === 'Zone C (Restricted Operation)' ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      {results.vibrationSeverityZone}
                    </p>
                  </div>
                  <Activity className={`w-8 h-8 ${
                    results.vibrationSeverityZone === 'Zone D (Critical/Trip)' ? 'text-red-400' :
                    results.vibrationSeverityZone === 'Zone C (Restricted Operation)' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`} />
                </div>
              </div>

              {/* Recommendations */}
              {results.recommendations.length > 0 && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">AI Recommendations</p>
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

              {/* Root Cause Forensics */}
              {results.causalChain && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Root Cause Forensics</h3>
                  
                  {/* Summary */}
                  <div className="mb-4 p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                    <p className="text-sm text-slate-300 mb-2"><span className="font-semibold text-purple-300">Overall Confidence:</span> {results.causalChain.confidence}%</p>
                    <p className="text-sm text-slate-300">{results.causalChain.summary}</p>
                  </div>

                  {/* Causal Chain */}
                  <div className="space-y-4">
                    {results.causalChain.causalChain.map((event, idx) => {
                      let eventStyles: React.CSSProperties | undefined;
                      let icon: React.ReactNode;
                      switch (event.eventType) {
                        case 'symptom':
                          eventStyles = {
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            borderColor: 'rgba(239, 68, 68, 0.4)'
                          };
                          icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
                          break;
                        case 'primary_suspect':
                          eventStyles = {
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            borderColor: 'rgba(245, 158, 11, 0.4)'
                          };
                          icon = <Activity className="w-5 h-5 text-amber-400" />;
                          break;
                        case 'secondary_suspect':
                          eventStyles = {
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderColor: 'rgba(245, 158, 11, 0.3)'
                          };
                          icon = <Activity className="w-5 h-5 text-amber-300" />;
                          break;
                        case 'consequence':
                          eventStyles = {
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            borderColor: 'rgba(220, 38, 38, 0.3)'
                          };
                          icon = <Zap className="w-5 h-5 text-red-500" />;
                          break;
                      }
                      return (
                        <div
                          key={event.id}
                          style={eventStyles}
                          className="p-4 rounded-xl border"
                        >
                          <div className="flex items-start gap-3">
                            {icon}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-white">
                                  {event.eventType === 'symptom' ? 'Symptom' :
                                   event.eventType === 'primary_suspect' ? 'Primary Suspect' :
                                   event.eventType === 'secondary_suspect' ? 'Secondary Suspect' : 'Potential Consequence'}
                                </p>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                  {event.confidence}% Confidence
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mb-1">{event.description}</p>
                              <p className="text-xs text-slate-400 italic">Evidence: {event.evidence}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {showHistory && selectedAssetId && (
          <AssetHistoryView
            assetId={selectedAssetId}
            assetName={assets.find(a => a.id === selectedAssetId)?.name || 'Selected Asset'}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  );
};
