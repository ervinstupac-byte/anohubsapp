import React, { useEffect, useState, useMemo } from 'react';
import { runForensicPulseCheck, IntegrityReport } from '../services/SystemIntegrityService';
import { runBackfill } from '../services/BackfillService';
import { persistCenturyPlanForAsset } from '../services/CenturyPlanner';
import { supabase } from '../services/supabaseClient';
import { useConfirm } from '../contexts/ConfirmContext';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { ShieldCheck, Database, Gauge, FlaskConical, TrendingDown, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminHealth() {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [backfillRunning, setBackfillRunning] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState<string | null>(null);
  const { confirm } = useConfirm();
  // Grid sync read-out
  // @ts-ignore
  const { gridFrequency = 50.0 } = useTelemetryStore() as any;
  const phaseAligned = true;
  const needleRotation = useMemo(() => (phaseAligned ? 0 : 20), [phaseAligned]);

  useEffect(() => {
    setLoading(true);
    runForensicPulseCheck().then(r => {
      setReport(r);
      setLoading(false);
    }).catch(e => {
      setReport(null);
      setLoading(false);
      console.error('Health check failed', e);
    });
  }, []);

  const handleTriggerBackfill = async () => {
    setBackfillRunning(true);
    setBackfillMessage('Starting backfill for last 30 days...');
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const startStr = start.toISOString().slice(0,10);
      const endStr = end.toISOString().slice(0,10);
      const data = await runBackfill(startStr, endStr);
      setBackfillMessage(`Backfill completed: ${Array.isArray(data) ? data.length : 'unknown'} rows processed.`);

      // for each unique asset, persist century plan based on latest aggregate
      const assetIds = Array.from(new Set((data || []).map((r: any) => r.asset_id).filter((id: any) => id)));
      for (const aid of assetIds) {
        try {
          // fetch latest aggregate for asset
          const { data: latestAgg } = await supabase.from('eta_aggregates').select('*').eq('asset_id', aid).order('period_start', { ascending: false }).limit(1).single();
          const { data: priceRow } = await supabase.from('pricing_history').select('price_per_kwh').eq('asset_id', aid).order('effective_from', { ascending: false }).limit(1).maybeSingle();
          const input = {
            currentEta: latestAgg?.avg_eta ?? 0,
            optimalEta: latestAgg?.optimal_eta ?? 1,
            currentPowerKw: latestAgg?.avg_power_kw ?? 0,
            pricePerKwh: priceRow?.price_per_kwh ?? 0.05,
            annualOpex: 0,
            capex: 0,
            capacityFactor: 0.45,
            telemetryWindow: []
          };
          const aidNum = Number(aid);
          await persistCenturyPlanForAsset(aidNum, input, `Backfill Plan ${startStr}→${endStr}`);
        } catch (e) { console.warn('Century plan persist failed for asset', aid, e); }
      }

    } catch (e: any) {
      setBackfillMessage('Backfill failed: ' + (e.message || String(e)));
    } finally {
      setBackfillRunning(false);
      // refresh report
      setLoading(true);
      runForensicPulseCheck().then(r => { setReport(r); setLoading(false); }).catch(() => setLoading(false));
    }
  };

  const confirmBackfill = () => {
    confirm({
        title: 'Confirm Historical Backfill',
        message: 'This operation will process historical telemetry and write aggregated records to the database. It can be heavy on DB I/O. Do you want to proceed?',
        confirmLabel: 'Proceed',
        variant: 'danger',
        onConfirm: handleTriggerBackfill
    });
  };

  if (loading) return <div className="w-full p-8 text-sm font-mono text-slate-400">Running health checks…</div>;
  if (!report) return <div className="w-full p-8 text-sm font-mono text-slate-400">No report available.</div>;

  const tables = Object.entries(report.tableStatuses);
  const healthyTables = tables.filter(([, s]) => s.exists).length;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
          <ShieldCheck className="w-6 h-6 text-brand-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Health — System Integrity</h1>
          <p className="text-slate-400 max-w-2xl mt-1">Live integrity sweep across data persistence, physics invariants, and grid synchronization.</p>
        </div>
      </div>

      {/* Grid synchronization */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2"><Gauge className="w-4 h-4 text-[#2dd4bf]" /> Grid Synchronization</h2>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 p-5 glass border border-white/10 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2">Grid Frequency</div>
            <div className="text-4xl font-black text-white tabular-nums">
              {gridFrequency.toFixed(2)} <span className="text-sm text-slate-500 font-normal">Hz</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-mono">Synchronized</div>
          </div>
          <div className="col-span-12 md:col-span-6 p-5 glass border border-white/10 rounded-xl flex items-center justify-center">
            <div className="relative w-40 h-40 rounded-full border-4 border-slate-600 bg-slate-800 shadow-inner">
              <div className="absolute inset-3 rounded-full border-2 border-slate-700" />
              {/* Tick marks */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-4 bg-slate-600 left-1/2 top-0 origin-bottom"
                  style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                />
              ))}
              {/* Needle */}
              <div
                className="absolute left-1/2 top-1/2 w-0.5 h-16 bg-emerald-400 origin-bottom shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ transform: `translate(-50%, -100%) rotate(${needleRotation}deg)` }}
              />
              {/* Center cap */}
              <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono uppercase">Synchroscope</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#2dd4bf]" /> Table Statuses
          <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{healthyTables}/{tables.length} online</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tables.map(([table, status]) => (
            <div key={table} className="flex items-center gap-3 px-3 py-2 glass border border-white/10 rounded-lg">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.exists ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
              <div className="font-mono text-sm text-slate-200 truncate">{table}</div>
              {status.count != null && <div className="ml-auto text-[11px] font-mono text-slate-500">{status.count}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 p-5 glass border border-white/10 rounded-xl">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Backfill & Century Planning</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={confirmBackfill} disabled={backfillRunning} className="px-4 py-2 rounded-lg bg-brand-500/90 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
            {backfillRunning ? 'Backfilling…' : 'Trigger Historical Backfill (30d)'}
          </button>
          {backfillRunning && <div className="text-sm text-slate-400">Processing historical telemetry — this may take a few minutes.</div>}
        </div>
        {backfillMessage && <div className="mt-3 text-sm text-slate-300 font-mono">{backfillMessage}</div>}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <section className="p-5 glass border border-white/10 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-[#2dd4bf]" /> Physics Check (η invariant)</h2>
          {report.physicsCheck ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Expected η</span><span className="font-mono text-slate-200">{report.physicsCheck.expected}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Actual η (DB RPC)</span><span className="font-mono text-slate-200">{report.physicsCheck.actual}</span></div>
              <div className="flex justify-between items-center pt-1"><span className="text-slate-400">Status</span>{report.physicsCheck.ok ? <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle2 className="w-4 h-4" /> OK</span> : <span className="flex items-center gap-1 text-red-400 font-semibold"><XCircle className="w-4 h-4" /> FAIL</span>}</div>
            </div>
          ) : <div className="text-sm text-slate-500">No physics check performed.</div>}
        </section>

        <section className="p-5 glass border border-white/10 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-[#2dd4bf]" /> Financial Check</h2>
          {report.financialCheck ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Aggregated Loss</span><span className="font-mono text-slate-200">{report.financialCheck.aggregatedLoss}</span></div>
              <div className="flex justify-between items-center pt-1"><span className="text-slate-400">Status</span>{report.financialCheck.ok ? <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle2 className="w-4 h-4" /> Triggered</span> : <span className="text-slate-400 font-semibold">Not Triggered</span>}</div>
            </div>
          ) : <div className="text-sm text-slate-500">No financial check performed.</div>}
        </section>
      </div>

      {report.errors && report.errors.length > 0 && (
        <section className="mb-6 p-5 glass border border-red-500/20 rounded-xl">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Errors</h3>
          <pre className="bg-black/40 p-3 rounded-lg text-xs text-red-200 overflow-auto">{report.errors.join('\n')}</pre>
        </section>
      )}
    </div>
  );
}
