import React from 'react';
import { Shield, Lock, Archive } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';

export const UniversalTurbineDashboard: React.FC = () => {
  return (
    <div className="min-h-[420px] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-2xl p-8 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-300" />
            </div>
          </div>

          <div className="flex-1">
            <div className="text-[11px] tracking-[0.22em] uppercase text-slate-400 font-mono">
              Secured Module
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Universal Turbine Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Engineering logic secured in Discovery Vault. Awaiting integration.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Lock className="w-4 h-4 text-emerald-300" />
                  Integrity Locked
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-mono">
                  vault/dashboard-experiments
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Archive className="w-4 h-4 text-amber-300" />
                  Archived Asset
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-mono">
                  discovery-vault
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-slate-300">
                  Status
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-mono">
                  Awaiting integration
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
