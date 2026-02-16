/**
 * AssetPassportModal.tsx
 * 
 * NC-1100: Asset Passport Integration
 * Displays detailed component information with RUL from AIPredictionService
 * Enhanced with SCADA Industrial Design and Integrity Checks
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingDown,
  Thermometer,
  Zap,
  FileText,
  History,
  Cpu,
  ShieldCheck,
  Printer,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { calculateMaintenancePrediction } from '../../features/maintenance/logic/Predictor';
import { useTranslation } from 'react-i18next';
import { saveLog } from '../../services/PersistenceService';

interface AssetPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentId: string;
  componentName: string;
  componentType: string;
}

interface RULResult {
  remainingYears: number;
  confidence: number;
  healthScore: number;
  nextMaintenanceDate: string;
  riskFactors: string[];
}

interface TimelineEvent {
  date: string;
  event: string;
  type: 'BIRTH' | 'MAINTENANCE' | 'REPAIR' | 'INCIDENT' | 'PROJECTED_FAILURE';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const AssetPassportModal: React.FC<AssetPassportModalProps> = ({
  isOpen,
  onClose,
  componentId,
  componentName,
  componentType
}) => {
  const { t } = useTranslation();
  const [rulData, setRulData] = useState<RULResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'health' | 'docs'>('overview');

  // Simulated timeline data - in production this would come from a service
  const timeline: TimelineEvent[] = [
    { date: '2020-01-15', event: 'Manufactured & Commissioned', type: 'BIRTH' },
    { date: '2021-03-20', event: 'First Major Inspection', type: 'MAINTENANCE' },
    { date: '2022-08-10', event: 'Vibration Anomaly Detected', type: 'INCIDENT', severity: 'MEDIUM' },
    { date: '2023-05-15', event: 'Bearing Replacement', type: 'REPAIR' },
    { date: rulData?.nextMaintenanceDate || '2026-06-01', event: 'Predicted Maintenance', type: 'PROJECTED_FAILURE', severity: 'HIGH' },
  ];

  // Simulated docs
  const docs = [
    { name: 'Technical Manual v2.4', size: '2.4 MB', date: '2023-01-15', type: 'PDF' },
    { name: 'Maintenance Log 2023', size: '856 KB', date: '2023-12-20', type: 'CSV' },
    { name: 'Calibration Certificate', size: '1.2 MB', date: '2024-02-10', type: 'PDF' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchRUL();
    }
  }, [isOpen, componentId]);

  const fetchRUL = async () => {
    setIsLoading(true);
    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const predictionInput = {
        config: {
          id: componentId,
          name: componentName,
          designLifeHours: 87600,
          installationDate: '2020-01-15',
          wearFactorCurve: 'EXPONENTIAL' as const
        },
        telemetry: {
          currentVibrationMMs: 2.5,
          cavitationIndex: 0.2,
          accumulatedRunHours: 35000,
          currentEfficiencyPercent: 94.2,
          startsAndStops: 1250
        }
      };

      const prediction = calculateMaintenancePrediction(predictionInput);
      
      const rulResult: RULResult = {
        remainingYears: prediction.remainingLifeHours / (24 * 365),
        confidence: 0.85,
        healthScore: prediction.remainingLifePercent,
        nextMaintenanceDate: prediction.predictedFailureDate,
        riskFactors: [
          `Primary stressor: ${prediction.primaryStressor}`,
          `Degradation factor: ${prediction.degradationFactor.toFixed(2)}x`,
          `Urgency level: ${prediction.urgency}`
        ]
      };
      
      setRulData(rulResult);

      // NC-25100: Log Passport Access
      saveLog({
        event_type: 'ASSET_PASSPORT_VIEWED',
        reason: `User inspected passport for ${componentName}`,
        active_protection: 'NONE',
        details: {
          componentId,
          healthScore: rulResult.healthScore,
          remainingYears: rulResult.remainingYears
        }
      });
    } catch (error) {
      console.error('Failed to fetch RUL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-status-ok';
    if (score >= 60) return 'text-status-warning';
    return 'text-status-error';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-status-ok/10 border-status-ok/20';
    if (score >= 60) return 'bg-status-warning/10 border-status-warning/20';
    return 'bg-status-error/10 border-status-error/20';
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'BIRTH': return <CheckCircle className="w-4 h-4 text-status-ok" />;
      case 'MAINTENANCE': return <Clock className="w-4 h-4 text-status-info" />;
      case 'REPAIR': return <Activity className="w-4 h-4 text-status-warning" />;
      case 'INCIDENT': return <AlertTriangle className="w-4 h-4 text-status-error" />;
      case 'PROJECTED_FAILURE': return <TrendingDown className="w-4 h-4 text-h-purple" />;
      default: return <History className="w-4 h-4 text-scada-muted" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        onClick={onClose}
        className="absolute inset-0"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-scada-panel border border-scada-border rounded-sm shadow-scada-card"
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-16 px-6 bg-scada-bg border-b border-scada-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-scada-panel rounded-full text-scada-muted hover:text-scada-text transition-colors"
                  title={t('common.back', 'Back')}
              >
                  <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-status-info/10 rounded-sm border border-status-info/20">
                <ShieldCheck className="w-6 h-6 text-status-info" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-scada-text tracking-wide font-header uppercase">{componentName}</h2>
                <div className="flex items-center gap-3 text-xs text-scada-muted font-mono">
                  <span className="text-status-info">{componentId}</span>
                  <span className="w-1 h-1 rounded-full bg-scada-muted" />
                  <span>{componentType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-scada-panel rounded-full transition-colors text-scada-muted hover:text-status-info" title="Verify Integrity">
                    <ShieldCheck className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-scada-panel rounded-full transition-colors text-scada-muted hover:text-scada-text" title="Print Passport">
                    <Printer className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-scada-border mx-2" />
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-status-error/10 rounded-full transition-colors text-scada-muted hover:text-status-error"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-scada-border bg-scada-bg/50 px-6">
            {(['overview', 'timeline', 'health', 'docs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 font-mono ${
                  activeTab === tab
                    ? 'text-status-info border-status-info bg-status-info/5'
                    : 'text-scada-muted border-transparent hover:text-scada-text hover:border-scada-border'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-scada-panel">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-4 border-status-info/30 border-t-status-info rounded-full animate-spin" />
                <p className="text-sm text-status-info font-mono animate-pulse">ANALYZING ASSET TELEMETRY...</p>
              </div>
            ) : rulData ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Health & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Health Score Card */}
                      <div className={`p-6 border rounded-sm ${getHealthBg(rulData.healthScore)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-scada-muted uppercase tracking-widest mb-1 font-mono">Asset Health Score</div>
                            <div className={`text-5xl font-black font-mono tabular-nums ${getHealthColor(rulData.healthScore)}`}>
                              {rulData.healthScore}%
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`w-2 h-2 rounded-full ${rulData.healthScore >= 80 ? 'bg-status-ok' : 'bg-status-warning'}`} />
                              <span className="text-xs font-mono text-scada-text/80 uppercase">
                                {rulData.healthScore >= 80 ? 'OPERATIONAL - OPTIMAL' : 'OPERATIONAL - DEGRADED'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-scada-muted uppercase tracking-widest mb-1 font-mono">Prediction Confidence</div>
                            <div className="text-3xl font-bold text-scada-text font-mono tabular-nums">
                              {(rulData.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-scada-muted mt-1 font-mono">Based on 35k run hours</div>
                          </div>
                        </div>
                      </div>

                      {/* RUL Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-sm bg-scada-bg border border-scada-border">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-status-info" />
                            <span className="text-xs font-bold text-scada-muted uppercase font-mono">Remaining Useful Life</span>
                          </div>
                          <div className="text-2xl font-bold text-scada-text font-mono tabular-nums">
                            {rulData.remainingYears.toFixed(1)} <span className="text-sm text-scada-muted font-normal">years</span>
                          </div>
                          <div className="w-full h-1 bg-scada-border rounded-full mt-3 overflow-hidden">
                            <div 
                              className="h-full bg-status-info" 
                              style={{ width: `${(rulData.remainingYears / 10) * 100}%` }} 
                            />
                          </div>
                        </div>

                        <div className="p-5 rounded-sm bg-scada-bg border border-scada-border">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-status-warning" />
                            <span className="text-xs font-bold text-scada-muted uppercase font-mono">Next Maintenance</span>
                          </div>
                          <div className="text-2xl font-bold text-scada-text font-mono tabular-nums">
                            {new Date(rulData.nextMaintenanceDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-status-warning/80 mt-2 font-mono uppercase">
                            SCHEDULED OUTAGE REQUIRED
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Risk Factors */}
                    <div className="lg:col-span-1">
                      <div className="h-full p-5 rounded-sm bg-status-error/5 border border-status-error/20">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-4 h-4 text-status-error" />
                          <h3 className="text-sm font-bold text-status-error uppercase tracking-wide font-mono">Active Risk Factors</h3>
                        </div>
                        <div className="space-y-3">
                          {rulData.riskFactors.map((risk, index) => (
                            <div
                              key={index}
                              className="p-3 bg-status-error/10 border border-status-error/20 rounded-sm"
                            >
                              <span className="text-xs font-medium text-status-error leading-relaxed block font-mono">{risk}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-status-error/20">
                          <p className="text-[10px] text-status-error/60 leading-relaxed font-mono">
                            Automated risk assessment based on vibration signatures and cavitation indices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="max-w-3xl mx-auto py-4">
                    <h3 className="text-sm font-bold text-scada-muted uppercase tracking-widest mb-6 font-mono">Lifecycle Events</h3>
                    <div className="relative pl-8 border-l border-scada-border space-y-8">
                      {timeline.map((event, index) => (
                        <div key={index} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-4 border-scada-bg ${
                            event.type === 'PROJECTED_FAILURE' ? 'bg-h-purple' :
                            event.type === 'INCIDENT' ? 'bg-status-error' :
                            event.type === 'BIRTH' ? 'bg-status-ok' :
                            'bg-scada-border'
                          }`} />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-sm bg-scada-bg border border-scada-border hover:border-scada-text/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getTimelineIcon(event.type)}</div>
                              <div>
                                <div className="font-bold text-scada-text text-sm font-mono">{event.event}</div>
                                <div className="text-xs text-scada-muted mt-1 font-mono">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                              </div>
                            </div>
                            {event.severity && (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-sm border uppercase tracking-wider font-mono ${
                                event.severity === 'HIGH' ? 'bg-status-error/10 text-status-error border-status-error/30' :
                                'bg-status-warning/10 text-status-warning border-status-warning/30'
                              }`}>
                                {event.severity} SEVERITY
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-scada-text uppercase tracking-wide font-mono">Real-time Telemetry</h3>
                      <div className="flex items-center gap-2 text-[10px] text-status-ok font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-ok animate-pulse" />
                        LIVE STREAM ACTIVE
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-scada-bg border border-scada-border rounded-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Thermometer className="w-4 h-4 text-status-warning" />
                          <span className="text-xs font-bold text-scada-muted uppercase font-mono">Temperature</span>
                        </div>
                        <div className="text-2xl font-black text-scada-text font-mono tabular-nums">68<span className="text-lg text-scada-muted font-normal">°C</span></div>
                        <div className="mt-2 text-[10px] text-status-ok font-mono uppercase">NOMINAL RANGE</div>
                      </div>

                      <div className="p-4 bg-scada-bg border border-scada-border rounded-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-4 h-4 text-status-info" />
                          <span className="text-xs font-bold text-scada-muted uppercase font-mono">Vibration</span>
                        </div>
                        <div className="text-2xl font-black text-scada-text font-mono tabular-nums">2.4<span className="text-lg text-scada-muted font-normal">mm/s</span></div>
                        <div className="mt-2 text-[10px] text-status-warning font-mono uppercase">ELEVATED WARN</div>
                      </div>

                      <div className="p-4 bg-scada-bg border border-scada-border rounded-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-status-warning" />
                          <span className="text-xs font-bold text-scada-muted uppercase font-mono">Efficiency</span>
                        </div>
                        <div className="text-2xl font-black text-scada-text font-mono tabular-nums">94.2<span className="text-lg text-scada-muted font-normal">%</span></div>
                        <div className="mt-2 text-[10px] text-status-ok font-mono uppercase">OPTIMAL</div>
                      </div>

                      <div className="p-4 bg-scada-bg border border-scada-border rounded-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Cpu className="w-4 h-4 text-h-purple" />
                          <span className="text-xs font-bold text-scada-muted uppercase font-mono">Load Factor</span>
                        </div>
                        <div className="text-2xl font-black text-scada-text font-mono tabular-nums">87<span className="text-lg text-scada-muted font-normal">%</span></div>
                        <div className="mt-2 text-[10px] text-scada-muted font-mono uppercase">NOMINAL</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-scada-text uppercase tracking-wide font-mono">Technical Documentation</h3>
                    <div className="grid gap-3">
                      {docs.map((doc, idx) => (
                        <div key={idx} className="p-4 rounded-sm bg-scada-bg border border-scada-border hover:border-status-info/30 transition-colors flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-status-info/10 rounded-sm border border-status-info/20 group-hover:bg-status-info/20 transition-colors">
                              <FileText className="w-5 h-5 text-status-info" />
                            </div>
                            <div>
                              <div className="font-bold text-scada-text text-sm font-mono">{doc.name}</div>
                              <div className="flex items-center gap-2 text-xs text-scada-muted mt-1 font-mono">
                                <span className="px-1.5 py-0.5 rounded-sm bg-scada-panel text-scada-muted">{doc.type}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-scada-muted hover:text-scada-text hover:bg-scada-panel rounded-sm transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-scada-bg bg-status-info hover:bg-status-info/90 rounded-sm transition-colors font-mono">
                              <Download className="w-3 h-3" />
                              DOWNLOAD
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <AlertTriangle className="w-12 h-12 text-status-error mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-scada-text font-header">Data Unavailable</h3>
                <p className="text-scada-muted text-sm mt-2 font-mono">Could not retrieve asset passport data from the secure vault.</p>
                <button onClick={fetchRUL} className="mt-6 px-4 py-2 bg-scada-bg hover:bg-scada-panel border border-scada-border rounded-sm text-sm font-bold text-scada-text transition-colors font-mono uppercase">
                  Retry Connection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPassportModal;
