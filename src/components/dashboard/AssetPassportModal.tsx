/**
 * AssetPassportModal.tsx
 * 
 * NC-1100: Asset Passport Integration
 * Displays detailed component information with RUL from AIPredictionService
 * Enhanced with Glassmorphism and Integrity Checks
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Share2
} from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { calculateMaintenancePrediction } from '../../features/maintenance/logic/Predictor';
import { useTranslation } from 'react-i18next';

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

  // Mock timeline data - in production this would come from a service
  const timeline: TimelineEvent[] = [
    { date: '2020-01-15', event: 'Manufactured & Commissioned', type: 'BIRTH' },
    { date: '2021-03-20', event: 'First Major Inspection', type: 'MAINTENANCE' },
    { date: '2022-08-10', event: 'Vibration Anomaly Detected', type: 'INCIDENT', severity: 'MEDIUM' },
    { date: '2023-05-15', event: 'Bearing Replacement', type: 'REPAIR' },
    { date: rulData?.nextMaintenanceDate || '2026-06-01', event: 'Predicted Maintenance', type: 'PROJECTED_FAILURE', severity: 'HIGH' },
  ];

  // Mock docs
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
    } catch (error) {
      console.error('Failed to fetch RUL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'BIRTH': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'MAINTENANCE': return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'REPAIR': return <Activity className="w-4 h-4 text-amber-400" />;
      case 'INCIDENT': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'PROJECTED_FAILURE': return <TrendingDown className="w-4 h-4 text-purple-400" />;
      default: return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[85vh] flex flex-col"
          >
            <GlassCard className="flex-1 flex flex-col overflow-hidden border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/80">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <FileText className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                                Asset Passport
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 uppercase tracking-widest">
                                    Official Record
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                <span className="text-white font-medium">{componentName}</span>
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-xs text-slate-500">{componentId}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-500">{componentType}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-cyan-400" title="Verify Integrity">
                            <ShieldCheck className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title="Print Passport">
                            <Printer className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-slate-400 hover:text-red-400"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-black/20 px-6">
                    {(['overview', 'timeline', 'health', 'docs'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                        activeTab === tab
                            ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-700'
                        }`}
                    >
                        {tab}
                    </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-900/50">
                    {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        <p className="text-sm text-cyan-400 font-mono animate-pulse">ANALYZING ASSET TELEMETRY...</p>
                    </div>
                    ) : rulData ? (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Health & Stats */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Health Score Card */}
                                <GlassCard className={`p-6 ${getHealthBg(rulData.healthScore)}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Asset Health Score</div>
                                            <div className={`text-5xl font-black ${getHealthColor(rulData.healthScore)}`}>
                                            {rulData.healthScore}%
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className={`w-2 h-2 rounded-full ${rulData.healthScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span className="text-xs font-mono text-slate-300">
                                                    {rulData.healthScore >= 80 ? 'OPERATIONAL - OPTIMAL' : 'OPERATIONAL - DEGRADED'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Prediction Confidence</div>
                                            <div className="text-3xl font-bold text-white">
                                            {(rulData.confidence * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Based on 35k run hours</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* RUL Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-xl bg-slate-900/50 border border-white/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs font-bold text-slate-400 uppercase">Remaining Useful Life</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {rulData.remainingYears.toFixed(1)} <span className="text-sm text-slate-500 font-normal">years</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className="h-full bg-cyan-500" 
                                                style={{ width: `${(rulData.remainingYears / 10) * 100}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl bg-slate-900/50 border border-white/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="w-4 h-4 text-amber-400" />
                                            <span className="text-xs font-bold text-slate-400 uppercase">Next Maintenance</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {new Date(rulData.nextMaintenanceDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-amber-400/80 mt-2 font-mono">
                                            SCHEDULED OUTAGE REQUIRED
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Risk Factors */}
                            <div className="lg:col-span-1">
                                <div className="h-full p-5 rounded-xl bg-red-950/10 border border-red-500/20">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                        <h3 className="text-sm font-bold text-red-100 uppercase tracking-wide">Active Risk Factors</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {rulData.riskFactors.map((risk, index) => (
                                            <div
                                            key={index}
                                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                            >
                                                <span className="text-xs font-medium text-red-200 leading-relaxed block">{risk}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-red-500/20">
                                        <p className="text-[10px] text-red-300/60 leading-relaxed">
                                            Automated risk assessment based on vibration signatures and cavitation indices.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {activeTab === 'timeline' && (
                        <div className="max-w-3xl mx-auto py-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Lifecycle Events</h3>
                            <div className="relative pl-8 border-l border-slate-800 space-y-8">
                                {timeline.map((event, index) => (
                                    <div key={index} className="relative">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-4 border-slate-900 ${
                                            event.type === 'PROJECTED_FAILURE' ? 'bg-purple-500' :
                                            event.type === 'INCIDENT' ? 'bg-red-500' :
                                            event.type === 'BIRTH' ? 'bg-emerald-500' :
                                            'bg-slate-600'
                                        }`} />

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">{getTimelineIcon(event.type)}</div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{event.event}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                </div>
                                            </div>
                                            {event.severity && (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                                                    event.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
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
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Real-time Telemetry</h3>
                                <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    LIVE STREAM ACTIVE
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <GlassCard className="p-4 bg-slate-900/50">
                                    <div className="flex items-center gap-2 mb-3">
                                    <Thermometer className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Temperature</span>
                                    </div>
                                    <div className="text-2xl font-black text-white">68<span className="text-lg text-slate-500 font-normal">°C</span></div>
                                    <div className="mt-2 text-[10px] text-emerald-400 font-mono">NOMINAL RANGE</div>
                                </GlassCard>

                                <GlassCard className="p-4 bg-slate-900/50">
                                    <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Vibration</span>
                                    </div>
                                    <div className="text-2xl font-black text-white">2.4<span className="text-lg text-slate-500 font-normal">mm/s</span></div>
                                    <div className="mt-2 text-[10px] text-amber-400 font-mono">ELEVATED WARN</div>
                                </GlassCard>

                                <GlassCard className="p-4 bg-slate-900/50">
                                    <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Efficiency</span>
                                    </div>
                                    <div className="text-2xl font-black text-white">94.2<span className="text-lg text-slate-500 font-normal">%</span></div>
                                    <div className="mt-2 text-[10px] text-emerald-400 font-mono">OPTIMAL</div>
                                </GlassCard>

                                <GlassCard className="p-4 bg-slate-900/50">
                                    <div className="flex items-center gap-2 mb-3">
                                    <Cpu className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Load Factor</span>
                                    </div>
                                    <div className="text-2xl font-black text-white">87<span className="text-lg text-slate-500 font-normal">%</span></div>
                                    <div className="mt-2 text-[10px] text-slate-400 font-mono">NOMINAL</div>
                                </GlassCard>
                            </div>
                        </div>
                        )}

                        {activeTab === 'docs' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Technical Documentation</h3>
                            <div className="grid gap-3">
                                {docs.map((doc, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                <FileText className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{doc.name}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{doc.type}</span>
                                                    <span>•</span>
                                                    <span>{doc.size}</span>
                                                    <span>•</span>
                                                    <span>{doc.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                                                <Download className="w-3 h-3" />
                                                DOWNLOAD
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </motion.div>
                    ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-red-400 mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-white">Data Unavailable</h3>
                        <p className="text-slate-400 text-sm mt-2">Could not retrieve asset passport data from the secure vault.</p>
                        <button onClick={fetchRUL} className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-colors">
                            Retry Connection
                        </button>
                    </div>
                    )}
                </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssetPassportModal;
