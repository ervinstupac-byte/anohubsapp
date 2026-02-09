import React, { useMemo } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import { Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface SovereignPulseGaugeProps {
  className?: string;
}

export const SovereignPulseGauge: React.FC<SovereignPulseGaugeProps> = ({ className = '' }) => {
  const store = useTelemetryStore();
  
  // Calculate sovereign pulse index
  const sovereignPulse = useMemo(() => {
    const pulseEngine = new ThePulseEngine();
    return pulseEngine.aggregateHealth({
      physical: {
        vibration: store.mechanical.vibrationX || 0,
        temperature: store.mechanical.bearingTemp || 0,
        efficiency: store.hydraulic.efficiency || 0
      },
      financial: {
        revenue: store.financials?.currentRevenueEURh || 0,
        costs: store.financials?.operationalCostsEURh || 0,
        efficiency: store.hydraulic.efficiency || 0
      },
      environmental: {
        waterQuality: store.site.waterQuality || 'Unknown',
        temperature: store.site.temperature || 20,
        flow: store.hydraulic.flow || 0
      },
      cyber: {
        connectionStatus: (store.connectionStatus as any) || 'UNKNOWN',
        lastUpdate: store.lastUpdate,
        alarmsActive: store.activeAlarms.length
      }
    });
  }, [store]);

  // Determine status and color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPTIMAL': return 'text-emerald-400';
      case 'STRESSED': return 'text-amber-400';
      case 'CRITICAL': return 'text-red-400';
      case 'DORMANT': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPTIMAL': return <TrendingUp className="w-4 h-4" />;
      case 'STRESSED': return <AlertTriangle className="w-4 h-4" />;
      case 'CRITICAL': return <TrendingDown className="w-4 h-4" />;
      case 'DORMANT': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <>
    <div className={`p-6 border border-white/10 rounded-xl bg-slate-900/40 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3 h-3" />
          SOVEREIGN PULSE INDEX
        </h3>
        <div className="flex items-center gap-2">
          {getStatusIcon(sovereignPulse.globalStatus)}
          <span className={`text-[8px] font-mono font-bold ${getStatusColor(sovereignPulse.globalStatus)}`}>
            {sovereignPulse.globalStatus}
          </span>
        </div>
      </div>
      
      <div className="relative mb-6">
        <div className="text-[clamp(32px,4vh,48px)] font-black text-white tabular-nums">
          {sovereignPulse.index.toFixed(1)}
        </div>
        <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
          System Health Score
        </div>
        
        {/* Pulsating ring animation */}
        <div 
          className={`absolute inset-0 rounded-full border-2 ${
            sovereignPulse.globalStatus === 'OPTIMAL' ? 'border-emerald-400' :
            sovereignPulse.globalStatus === 'STRESSED' ? 'border-amber-400' :
            sovereignPulse.globalStatus === 'CRITICAL' ? 'border-red-400' :
            'border-slate-400'
          }`}
          style={{
            animation: `pulse ${Math.max(1, 5 - sovereignPulse.index / 20)}s ease-in-out infinite`
          }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Physical</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white">{sovereignPulse.subIndices.physical.toFixed(0)}</span>
            <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300`}
                style={{ width: `${(sovereignPulse.subIndices.physical / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Financial</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white">{sovereignPulse.subIndices.financial.toFixed(0)}</span>
            <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r from-emerald-400 to-green-400 transition-all duration-300`}
                style={{ width: `${(sovereignPulse.subIndices.financial / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Environmental</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white">{sovereignPulse.subIndices.environmental.toFixed(0)}</span>
            <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300`}
                style={{ width: `${(sovereignPulse.subIndices.environmental / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Cyber</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white">{sovereignPulse.subIndices.cyber.toFixed(0)}</span>
            <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300`}
                style={{ width: `${(sovereignPulse.subIndices.cyber / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {sovereignPulse.systemicRisks.length > 0 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-[8px] font-mono text-red-400 uppercase tracking-widest mb-2">Systemic Risks</div>
          <div className="space-y-1">
            {sovereignPulse.systemicRisks.map((risk, index) => (
              <div key={index} className="text-[8px] font-mono text-red-300">
                • {risk}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    <style>{`
      @keyframes pulse {
        0% {
          opacity: 0.3;
          transform: scale(0.95);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
        100% {
          opacity: 0.3;
          transform: scale(0.95);
        }
      }
    `}</style>
    </>
  );
};
