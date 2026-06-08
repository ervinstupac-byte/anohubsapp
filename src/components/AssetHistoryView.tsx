import React, { useEffect, useState } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { AlertTriangle, Check, Calendar, Clock, Zap, Activity, TrendingUp, X } from 'lucide-react';
import { getAssetHistory, DiagnosticSnapshot, DiagnosticLabType } from '../services/DiagnosticHistoryService';

interface AssetHistoryViewProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

interface HistoryRowData {
  snapshot: DiagnosticSnapshot;
  hasCriticalFault: boolean;
  hasCausalChain: boolean;
  date: Date;
}

const getLabTypeDisplay = (type: DiagnosticLabType) => {
  switch (type) {
    case 'SYSTEM_PREDICTION': return 'System Prediction';
    case 'VIBRATION_ANALYSIS': return 'Vibration Analysis';
    case 'GOVERNOR_DEADBAND': return 'Governor Deadband';
    case 'GENERATOR_AIR_GAP': return 'Generator Air Gap';
    default: return type;
  }
};

const getLabTypeIcon = (type: DiagnosticLabType) => {
  switch (type) {
    case 'SYSTEM_PREDICTION': return <TrendingUp className="w-4 h-4" />;
    case 'VIBRATION_ANALYSIS': return <Activity className="w-4 h-4" />;
    case 'GOVERNOR_DEADBAND': return <Zap className="w-4 h-4" />;
    case 'GENERATOR_AIR_GAP': return <Activity className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

export const AssetHistoryView: React.FC<AssetHistoryViewProps> = ({ assetId, assetName, onClose }) => {
  const [history, setHistory] = useState<HistoryRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const { success, data, error: errMsg } = await getAssetHistory(assetId);
        if (success) {
          const rows: HistoryRowData[] = data.map(snapshot => {
            let hasCritical = false;
            if (snapshot.lab_type === 'SYSTEM_PREDICTION') {
              hasCritical = snapshot.diagnostic_results.cavitationRisk === 'HIGH'
                || snapshot.diagnostic_results.thermalStress === 'CRITICAL'
                || snapshot.diagnostic_results.vibrationSeverityZone?.includes('Zone D')
                || snapshot.diagnostic_results.vibrationSeverityZone?.includes('Zone C');
            }
            return {
              snapshot,
              hasCriticalFault: hasCritical,
              hasCausalChain: !!snapshot.diagnostic_results.causalChain,
              date: new Date(snapshot.created_at)
            };
          }).sort((a, b) => b.date.getTime() - a.date.getTime());
          setHistory(rows);
        } else {
          setError(errMsg || 'Failed to load history');
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [assetId]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <GlassCard title={`Diagnostic History: ${assetName}`} className="w-full max-w-4xl border-t-4 border-t-cyan-500 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-400">View historical diagnostic snapshots</p>
          <ModernButton onClick={onClose} variant="secondary" className="flex items-center gap-2">
            <X className="w-4 h-4" /> Close
          </ModernButton>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Loading history...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-lg">No diagnostic snapshots yet</p>
              <p className="text-sm">Run some diagnostics to see history here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((row, idx) => (
                <div
                  key={row.snapshot.id}
                  className={`p-4 rounded-xl border ${
                    row.hasCriticalFault
                      ? 'bg-red-900/20 border-red-500/30'
                      : row.hasCausalChain
                      ? 'bg-amber-900/10 border-amber-500/20'
                      : 'bg-slate-900/50 border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        row.hasCriticalFault
                          ? 'bg-red-900/40 text-red-300'
                          : row.hasCausalChain
                          ? 'bg-amber-900/30 text-amber-300'
                          : 'bg-cyan-900/30 text-cyan-300'
                      }`}>
                        {getLabTypeIcon(row.snapshot.lab_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white">{getLabTypeDisplay(row.snapshot.lab_type)}</p>
                          {row.hasCriticalFault && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Critical
                            </span>
                          )}
                          {row.hasCausalChain && !row.hasCriticalFault && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300 flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Causal Chain
                            </span>
                          )}
                          {!row.hasCriticalFault && !row.hasCausalChain && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Healthy
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(row.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {row.date.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {row.snapshot.diagnostic_results.powerOutput && (
                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {row.snapshot.diagnostic_results.powerOutput && (
                        <div>
                          <p className="text-xs text-slate-500">Power</p>
                          <p className="text-sm font-semibold text-cyan-400">{row.snapshot.diagnostic_results.powerOutput.toFixed(2)} MW</p>
                        </div>
                      )}
                      {row.snapshot.diagnostic_results.specificSpeed && (
                        <div>
                          <p className="text-xs text-slate-500">Specific Speed</p>
                          <p className="text-sm font-semibold text-white">{row.snapshot.diagnostic_results.specificSpeed.toFixed(0)}</p>
                        </div>
                      )}
                      {row.snapshot.diagnostic_results.annualEnergyGWh && (
                        <div>
                          <p className="text-xs text-slate-500">Annual Energy</p>
                          <p className="text-sm font-semibold text-emerald-400">{row.snapshot.diagnostic_results.annualEnergyGWh.toFixed(2)} GWh</p>
                        </div>
                      )}
                      {row.snapshot.diagnostic_results.cavitationRisk && (
                        <div>
                          <p className="text-xs text-slate-500">Cavitation Risk</p>
                          <p className={`text-sm font-semibold ${
                            row.snapshot.diagnostic_results.cavitationRisk === 'HIGH' ? 'text-red-400' :
                            row.snapshot.diagnostic_results.cavitationRisk === 'MEDIUM' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {row.snapshot.diagnostic_results.cavitationRisk}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
